#!/usr/bin/env node

/**
 * Konkurransetilsynet Competition MCP — stdio entry point.
 *
 * Provides MCP tools for querying Konkurransetilsynet decisions, merger control
 * cases, cartel enforcement, market studies, and competition guidelines.
 *
 * Tool prefix: no_comp_
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  searchDecisions,
  getDecision,
  searchMergers,
  getMerger,
  searchGuidelines,
  getGuideline,
  listSectors,
} from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let pkgVersion = "0.1.0";
try {
  const pkg = JSON.parse(
    readFileSync(join(__dirname, "..", "package.json"), "utf8"),
  ) as { version: string };
  pkgVersion = pkg.version;
} catch {
  // fallback to default
}

const SERVER_NAME = "norwegian-competition-mcp";

// --- Response metadata -------------------------------------------------------

const META = {
  disclaimer: "Data from Konkurransetilsynet public records. Not legal advice.",
  data_age: "2026-04-04",
  copyright: "Konkurransetilsynet — Norwegian government public domain",
  source_url: "https://konkurransetilsynet.no",
};

// --- Tool definitions ---------------------------------------------------------

const TOOLS = [
  {
    name: "no_comp_search_decisions",
    description:
      "Search Konkurransetilsynet competition decisions — merger control, cartel enforcement, abuse of dominance, and market investigations.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Search query (e.g., 'foretakssammenslutning', 'prissamarbeid', 'markedsmakt', 'konkurranseloven')",
        },
        type: {
          type: "string",
          enum: ["abuse_of_dominance", "cartel", "merger", "sector_inquiry"],
          description: "Filter by decision type. Optional.",
        },
        sector: {
          type: "string",
          description: "Filter by sector ID (e.g., 'grocery', 'energy', 'transport'). Optional.",
        },
        outcome: {
          type: "string",
          enum: ["prohibited", "cleared", "cleared_with_conditions", "fine"],
          description: "Filter by outcome. Optional.",
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return. Defaults to 20.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "no_comp_get_decision",
    description:
      "Get a specific Konkurransetilsynet decision by case number.",
    inputSchema: {
      type: "object" as const,
      properties: {
        case_number: {
          type: "string",
          description: "Konkurransetilsynet case number (e.g., 'KT-2023-001', 'V2022-15')",
        },
      },
      required: ["case_number"],
    },
  },
  {
    name: "no_comp_search_mergers",
    description:
      "Search Konkurransetilsynet merger control decisions (foretakssammenslutninger). Returns merger cases with acquiring party, target, sector, and outcome.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Search query (e.g., 'foretakssammenslutning', 'oppkjop', 'fusjon')",
        },
        sector: {
          type: "string",
          description: "Filter by sector ID (e.g., 'energy', 'grocery', 'transport'). Optional.",
        },
        outcome: {
          type: "string",
          enum: ["cleared", "cleared_phase1", "cleared_with_conditions", "prohibited"],
          description: "Filter by merger outcome. Optional.",
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return. Defaults to 20.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "no_comp_get_merger",
    description:
      "Get a specific Konkurransetilsynet merger control decision by case number.",
    inputSchema: {
      type: "object" as const,
      properties: {
        case_number: {
          type: "string",
          description: "Merger case number (e.g., 'KT-2023-M-001')",
        },
      },
      required: ["case_number"],
    },
  },
  {
    name: "no_comp_search_guidelines",
    description:
      "Search Konkurransetilsynet published guidelines and market studies.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Search query (e.g., 'dagligvare', 'konkurranse', 'markedsstudie')",
        },
        type: {
          type: "string",
          enum: ["guideline", "market_study", "report"],
          description: "Filter by document type. Optional.",
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return. Defaults to 20.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "no_comp_list_sectors",
    description:
      "List all sectors with Konkurransetilsynet enforcement activity, including decision counts and merger counts per sector.",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "no_comp_get_guideline",
    description:
      "Get a specific Konkurransetilsynet guideline, market study, or report by document ID.",
    inputSchema: {
      type: "object" as const,
      properties: {
        doc_id: {
          type: "string",
          description: "Document ID (e.g., 'GL-2023-001')",
        },
      },
      required: ["doc_id"],
    },
  },
  {
    name: "no_comp_list_sources",
    description:
      "List all data sources used by this MCP server, including authority, URL, item counts, and last refresh dates.",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "no_comp_check_data_freshness",
    description:
      "Check the freshness of the data corpus. Returns the corpus date, age in days, item counts per source, and a staleness flag (>180 days).",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "no_comp_about",
    description:
      "Norwegian Competition MCP server. Covers Konkurransetilsynet merger decisions, cartel enforcement, market studies, and competition guidelines.",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];

// --- Zod schemas for argument validation --------------------------------------

const SearchDecisionsArgs = z.object({
  query: z.string().min(1),
  type: z.enum(["abuse_of_dominance", "cartel", "merger", "sector_inquiry"]).optional(),
  sector: z.string().optional(),
  outcome: z.enum(["prohibited", "cleared", "cleared_with_conditions", "fine"]).optional(),
  limit: z.number().int().positive().max(100).optional(),
});

const GetDecisionArgs = z.object({
  case_number: z.string().min(1),
});

const SearchMergersArgs = z.object({
  query: z.string().min(1),
  sector: z.string().optional(),
  outcome: z.enum(["cleared", "cleared_phase1", "cleared_with_conditions", "prohibited"]).optional(),
  limit: z.number().int().positive().max(100).optional(),
});

const GetMergerArgs = z.object({
  case_number: z.string().min(1),
});

const SearchGuidelinesArgs = z.object({
  query: z.string().min(1),
  type: z.enum(["guideline", "market_study", "report"]).optional(),
  limit: z.number().int().positive().max(100).optional(),
});

const GetGuidelineArgs = z.object({
  doc_id: z.string().min(1),
});

// --- Helper ------------------------------------------------------------------

function textContent(data: Record<string, unknown>) {
  return {
    content: [
      { type: "text" as const, text: JSON.stringify({ ...data, _meta: META }, null, 2) },
    ],
  };
}

function errorContent(message: string, errorType: "not_found" | "tool_error" | "unknown_tool" = "tool_error") {
  return {
    content: [{ type: "text" as const, text: JSON.stringify({ error: message, _error_type: errorType }, null, 2) }],
    isError: true as const,
  };
}

// --- Server setup ------------------------------------------------------------

const server = new Server(
  { name: SERVER_NAME, version: pkgVersion },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case "no_comp_search_decisions": {
        const parsed = SearchDecisionsArgs.parse(args);
        const results = searchDecisions({
          query: parsed.query,
          type: parsed.type,
          sector: parsed.sector,
          outcome: parsed.outcome,
          limit: parsed.limit,
        });
        const resultsWithCitation = results.map((r) => ({
          ...r,
          _citation: {
            canonical_ref: r.case_number,
            lookup: { tool: "no_comp_get_decision", args: { case_number: r.case_number } },
          },
        }));
        return textContent({ results: resultsWithCitation, count: results.length });
      }

      case "no_comp_get_decision": {
        const parsed = GetDecisionArgs.parse(args);
        const decision = getDecision(parsed.case_number);
        if (!decision) {
          return errorContent(`Decision not found: ${parsed.case_number}`, "not_found");
        }
        return textContent({
          ...decision,
          _citation: {
            canonical_ref: decision.case_number,
            lookup: { tool: "no_comp_get_decision", args: { case_number: decision.case_number } },
          },
        });
      }

      case "no_comp_search_mergers": {
        const parsed = SearchMergersArgs.parse(args);
        const results = searchMergers({
          query: parsed.query,
          sector: parsed.sector,
          outcome: parsed.outcome,
          limit: parsed.limit,
        });
        const resultsWithCitation = results.map((r) => ({
          ...r,
          _citation: {
            canonical_ref: r.case_number,
            lookup: { tool: "no_comp_get_merger", args: { case_number: r.case_number } },
          },
        }));
        return textContent({ results: resultsWithCitation, count: results.length });
      }

      case "no_comp_get_merger": {
        const parsed = GetMergerArgs.parse(args);
        const merger = getMerger(parsed.case_number);
        if (!merger) {
          return errorContent(`Merger case not found: ${parsed.case_number}`, "not_found");
        }
        return textContent({
          ...merger,
          _citation: {
            canonical_ref: merger.case_number,
            lookup: { tool: "no_comp_get_merger", args: { case_number: merger.case_number } },
          },
        });
      }

      case "no_comp_search_guidelines": {
        const parsed = SearchGuidelinesArgs.parse(args);
        const results = searchGuidelines({
          query: parsed.query,
          type: parsed.type,
          limit: parsed.limit,
        });
        const resultsWithCitation = results.map((r) => ({
          ...r,
          _citation: {
            canonical_ref: r.doc_id,
            lookup: { tool: "no_comp_get_guideline", args: { doc_id: r.doc_id } },
          },
        }));
        return textContent({ results: resultsWithCitation, count: results.length });
      }

      case "no_comp_list_sectors": {
        const sectors = listSectors();
        return textContent({ sectors, count: sectors.length });
      }

      case "no_comp_get_guideline": {
        const parsed = GetGuidelineArgs.parse(args);
        const guideline = getGuideline(parsed.doc_id);
        if (!guideline) {
          return errorContent(`Guideline not found: ${parsed.doc_id}`, "not_found");
        }
        return textContent({
          ...guideline,
          _citation: {
            canonical_ref: guideline.doc_id,
            lookup: { tool: "no_comp_get_guideline", args: { doc_id: guideline.doc_id } },
          },
        });
      }

      case "no_comp_list_sources": {
        const coverage = JSON.parse(
          readFileSync(join(__dirname, "..", "data", "coverage.json"), "utf8"),
        ) as { schema_version: string; sources: unknown[] };
        return textContent({ sources: coverage.sources, schema_version: coverage.schema_version });
      }

      case "no_comp_check_data_freshness": {
        const coverage = JSON.parse(
          readFileSync(join(__dirname, "..", "data", "coverage.json"), "utf8"),
        ) as {
          coverage_date: string;
          sources: Array<{ id: string; last_refresh: string; item_count: number; refresh_frequency: string }>;
        };
        const corpusDate = coverage.coverage_date;
        const ageMs = Date.now() - new Date(corpusDate).getTime();
        const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
        return textContent({
          corpus_date: corpusDate,
          data_age_days: ageDays,
          is_stale: ageDays > 180,
          refresh_frequency: "quarterly",
          sources: coverage.sources.map((s) => ({
            id: s.id,
            last_refresh: s.last_refresh,
            item_count: s.item_count,
          })),
        });
      }

      case "no_comp_about": {
        return textContent({
          name: SERVER_NAME,
          version: pkgVersion,
          description:
            "Norwegian Competition MCP server. Covers Konkurransetilsynet merger decisions, cartel enforcement, market studies, and competition guidelines under konkurranseloven (Competition Act) and EEA Articles 53-54.",
          data_source: "Konkurransetilsynet (https://konkurransetilsynet.no/)",
          coverage: {
            decisions: "Abuse of dominance, cartel enforcement, and sector inquiries under konkurranseloven",
            mergers: "Merger control decisions (foretakssammenslutninger) — Phase I and Phase II",
            guidelines: "Published guidelines, market studies, and reports",
            sectors: "Grocery, energy, transport, construction, financial services, healthcare, telecommunications, media",
          },
          tools: TOOLS.map((t) => ({ name: t.name, description: t.description })),
        });
      }

      default:
        return errorContent(`Unknown tool: ${name}`, "unknown_tool");
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return errorContent(`Error executing ${name}: ${message}`, "tool_error");
  }
});

// --- Main --------------------------------------------------------------------

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`${SERVER_NAME} v${pkgVersion} running on stdio\n`);
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
