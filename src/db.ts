/**
 * SQLite database access layer for the Konkurransetilsynet (Norwegian Competition) MCP server.
 *
 * Schema:
 *   - decisions    — Konkurransetilsynet enforcement decisions (abuse of dominance, cartels, sector inquiries)
 *   - mergers      — Merger control decisions (foretakssammenslutninger)
 *   - guidelines   — Published guidelines and market studies
 *   - sectors      — Sectors with enforcement activity
 *
 * FTS5 virtual tables back full-text search on decisions, mergers, and guidelines.
 */

import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const DB_PATH = process.env["NO_COMP_DB_PATH"] ?? "data/no-comp.db";

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS decisions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  case_number  TEXT    NOT NULL UNIQUE,
  title        TEXT    NOT NULL,
  date         TEXT,
  type         TEXT,
  sector       TEXT,
  parties      TEXT,
  summary      TEXT,
  full_text    TEXT    NOT NULL,
  outcome      TEXT,
  fine_amount  REAL,
  legal_basis  TEXT,
  status       TEXT    DEFAULT 'final'
);

CREATE INDEX IF NOT EXISTS idx_decisions_date        ON decisions(date);
CREATE INDEX IF NOT EXISTS idx_decisions_type        ON decisions(type);
CREATE INDEX IF NOT EXISTS idx_decisions_sector      ON decisions(sector);
CREATE INDEX IF NOT EXISTS idx_decisions_outcome     ON decisions(outcome);
CREATE INDEX IF NOT EXISTS idx_decisions_status      ON decisions(status);

CREATE VIRTUAL TABLE IF NOT EXISTS decisions_fts USING fts5(
  case_number, title, summary, full_text,
  content='decisions',
  content_rowid='id'
);

CREATE TRIGGER IF NOT EXISTS decisions_ai AFTER INSERT ON decisions BEGIN
  INSERT INTO decisions_fts(rowid, case_number, title, summary, full_text)
  VALUES (new.id, new.case_number, new.title, COALESCE(new.summary, ''), new.full_text);
END;

CREATE TRIGGER IF NOT EXISTS decisions_ad AFTER DELETE ON decisions BEGIN
  INSERT INTO decisions_fts(decisions_fts, rowid, case_number, title, summary, full_text)
  VALUES ('delete', old.id, old.case_number, old.title, COALESCE(old.summary, ''), old.full_text);
END;

CREATE TRIGGER IF NOT EXISTS decisions_au AFTER UPDATE ON decisions BEGIN
  INSERT INTO decisions_fts(decisions_fts, rowid, case_number, title, summary, full_text)
  VALUES ('delete', old.id, old.case_number, old.title, COALESCE(old.summary, ''), old.full_text);
  INSERT INTO decisions_fts(rowid, case_number, title, summary, full_text)
  VALUES (new.id, new.case_number, new.title, COALESCE(new.summary, ''), new.full_text);
END;

CREATE TABLE IF NOT EXISTS mergers (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  case_number      TEXT    NOT NULL UNIQUE,
  title            TEXT    NOT NULL,
  date             TEXT,
  sector           TEXT,
  acquiring_party  TEXT,
  target           TEXT,
  summary          TEXT,
  full_text        TEXT    NOT NULL,
  outcome          TEXT,
  turnover         REAL
);

CREATE INDEX IF NOT EXISTS idx_mergers_date     ON mergers(date);
CREATE INDEX IF NOT EXISTS idx_mergers_sector   ON mergers(sector);
CREATE INDEX IF NOT EXISTS idx_mergers_outcome  ON mergers(outcome);

CREATE VIRTUAL TABLE IF NOT EXISTS mergers_fts USING fts5(
  case_number, title, acquiring_party, target, summary, full_text,
  content='mergers',
  content_rowid='id'
);

CREATE TRIGGER IF NOT EXISTS mergers_ai AFTER INSERT ON mergers BEGIN
  INSERT INTO mergers_fts(rowid, case_number, title, acquiring_party, target, summary, full_text)
  VALUES (new.id, new.case_number, new.title, COALESCE(new.acquiring_party, ''), COALESCE(new.target, ''), COALESCE(new.summary, ''), new.full_text);
END;

CREATE TRIGGER IF NOT EXISTS mergers_ad AFTER DELETE ON mergers BEGIN
  INSERT INTO mergers_fts(mergers_fts, rowid, case_number, title, acquiring_party, target, summary, full_text)
  VALUES ('delete', old.id, old.case_number, old.title, COALESCE(old.acquiring_party, ''), COALESCE(old.target, ''), COALESCE(old.summary, ''), old.full_text);
END;

CREATE TRIGGER IF NOT EXISTS mergers_au AFTER UPDATE ON mergers BEGIN
  INSERT INTO mergers_fts(mergers_fts, rowid, case_number, title, acquiring_party, target, summary, full_text)
  VALUES ('delete', old.id, old.case_number, old.title, COALESCE(old.acquiring_party, ''), COALESCE(old.target, ''), COALESCE(old.summary, ''), old.full_text);
  INSERT INTO mergers_fts(rowid, case_number, title, acquiring_party, target, summary, full_text)
  VALUES (new.id, new.case_number, new.title, COALESCE(new.acquiring_party, ''), COALESCE(new.target, ''), COALESCE(new.summary, ''), new.full_text);
END;

CREATE TABLE IF NOT EXISTS guidelines (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  doc_id      TEXT    NOT NULL UNIQUE,
  title       TEXT    NOT NULL,
  date        TEXT,
  type        TEXT,
  summary     TEXT,
  full_text   TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_guidelines_date ON guidelines(date);
CREATE INDEX IF NOT EXISTS idx_guidelines_type ON guidelines(type);

CREATE VIRTUAL TABLE IF NOT EXISTS guidelines_fts USING fts5(
  doc_id, title, summary, full_text,
  content='guidelines',
  content_rowid='id'
);

CREATE TRIGGER IF NOT EXISTS guidelines_ai AFTER INSERT ON guidelines BEGIN
  INSERT INTO guidelines_fts(rowid, doc_id, title, summary, full_text)
  VALUES (new.id, new.doc_id, new.title, COALESCE(new.summary, ''), new.full_text);
END;

CREATE TRIGGER IF NOT EXISTS guidelines_ad AFTER DELETE ON guidelines BEGIN
  INSERT INTO guidelines_fts(guidelines_fts, rowid, doc_id, title, summary, full_text)
  VALUES ('delete', old.id, old.doc_id, old.title, COALESCE(old.summary, ''), old.full_text);
END;

CREATE TRIGGER IF NOT EXISTS guidelines_au AFTER UPDATE ON guidelines BEGIN
  INSERT INTO guidelines_fts(guidelines_fts, rowid, doc_id, title, summary, full_text)
  VALUES ('delete', old.id, old.doc_id, old.title, COALESCE(old.summary, ''), old.full_text);
  INSERT INTO guidelines_fts(rowid, doc_id, title, summary, full_text)
  VALUES (new.id, new.doc_id, new.title, COALESCE(new.summary, ''), new.full_text);
END;

CREATE TABLE IF NOT EXISTS sectors (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  name_en        TEXT,
  description    TEXT,
  decision_count INTEGER DEFAULT 0,
  merger_count   INTEGER DEFAULT 0
);
`;

// --- Interfaces ---------------------------------------------------------------

export interface Decision {
  id: number;
  case_number: string;
  title: string;
  date: string | null;
  type: string | null;
  sector: string | null;
  parties: string | null;
  summary: string | null;
  full_text: string;
  outcome: string | null;
  fine_amount: number | null;
  legal_basis: string | null;
  status: string;
}

export interface Merger {
  id: number;
  case_number: string;
  title: string;
  date: string | null;
  sector: string | null;
  acquiring_party: string | null;
  target: string | null;
  summary: string | null;
  full_text: string;
  outcome: string | null;
  turnover: number | null;
}

export interface Guideline {
  id: number;
  doc_id: string;
  title: string;
  date: string | null;
  type: string | null;
  summary: string | null;
  full_text: string;
}

export interface Sector {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  decision_count: number;
  merger_count: number;
}

// --- DB singleton -------------------------------------------------------------

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  const dir = dirname(DB_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  _db.exec(SCHEMA_SQL);

  return _db;
}

// --- Decision queries ---------------------------------------------------------

export interface SearchDecisionsOptions {
  query: string;
  type?: string | undefined;
  sector?: string | undefined;
  outcome?: string | undefined;
  limit?: number | undefined;
}

export function searchDecisions(opts: SearchDecisionsOptions): Decision[] {
  const db = getDb();
  const limit = opts.limit ?? 20;

  const conditions: string[] = ["decisions_fts MATCH :query"];
  const params: Record<string, unknown> = { query: opts.query, limit };

  if (opts.type) {
    conditions.push("d.type = :type");
    params["type"] = opts.type;
  }
  if (opts.sector) {
    conditions.push("d.sector = :sector");
    params["sector"] = opts.sector;
  }
  if (opts.outcome) {
    conditions.push("d.outcome = :outcome");
    params["outcome"] = opts.outcome;
  }

  const where = conditions.join(" AND ");
  return db
    .prepare(
      `SELECT d.* FROM decisions_fts f
       JOIN decisions d ON d.id = f.rowid
       WHERE ${where}
       ORDER BY rank
       LIMIT :limit`,
    )
    .all(params) as Decision[];
}

export function getDecision(caseNumber: string): Decision | null {
  const db = getDb();
  return (
    (db
      .prepare("SELECT * FROM decisions WHERE case_number = ? LIMIT 1")
      .get(caseNumber) as Decision | undefined) ?? null
  );
}

// --- Merger queries -----------------------------------------------------------

export interface SearchMergersOptions {
  query: string;
  sector?: string | undefined;
  outcome?: string | undefined;
  limit?: number | undefined;
}

export function searchMergers(opts: SearchMergersOptions): Merger[] {
  const db = getDb();
  const limit = opts.limit ?? 20;

  const conditions: string[] = ["mergers_fts MATCH :query"];
  const params: Record<string, unknown> = { query: opts.query, limit };

  if (opts.sector) {
    conditions.push("m.sector = :sector");
    params["sector"] = opts.sector;
  }
  if (opts.outcome) {
    conditions.push("m.outcome = :outcome");
    params["outcome"] = opts.outcome;
  }

  const where = conditions.join(" AND ");
  return db
    .prepare(
      `SELECT m.* FROM mergers_fts f
       JOIN mergers m ON m.id = f.rowid
       WHERE ${where}
       ORDER BY rank
       LIMIT :limit`,
    )
    .all(params) as Merger[];
}

export function getMerger(caseNumber: string): Merger | null {
  const db = getDb();
  return (
    (db
      .prepare("SELECT * FROM mergers WHERE case_number = ? LIMIT 1")
      .get(caseNumber) as Merger | undefined) ?? null
  );
}

// --- Guideline queries --------------------------------------------------------

export interface SearchGuidelinesOptions {
  query: string;
  type?: string | undefined;
  limit?: number | undefined;
}

export function searchGuidelines(opts: SearchGuidelinesOptions): Guideline[] {
  const db = getDb();
  const limit = opts.limit ?? 20;

  const conditions: string[] = ["guidelines_fts MATCH :query"];
  const params: Record<string, unknown> = { query: opts.query, limit };

  if (opts.type) {
    conditions.push("g.type = :type");
    params["type"] = opts.type;
  }

  const where = conditions.join(" AND ");
  return db
    .prepare(
      `SELECT g.* FROM guidelines_fts f
       JOIN guidelines g ON g.id = f.rowid
       WHERE ${where}
       ORDER BY rank
       LIMIT :limit`,
    )
    .all(params) as Guideline[];
}

export function getGuideline(docId: string): Guideline | null {
  const db = getDb();
  return (
    (db
      .prepare("SELECT * FROM guidelines WHERE doc_id = ? LIMIT 1")
      .get(docId) as Guideline | undefined) ?? null
  );
}

// --- Sector queries -----------------------------------------------------------

export function listSectors(): Sector[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM sectors ORDER BY decision_count DESC, merger_count DESC")
    .all() as Sector[];
}
