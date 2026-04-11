#!/usr/bin/env node

/**
 * HTTP Server Entry Point for Docker Deployment
 *
 * Provides Streamable HTTP transport for remote MCP clients.
 * Use src/index.ts for local stdio-based usage.
 *
 * Endpoints:
 *   GET  /health  — liveness probe
 *   POST /mcp     — MCP Streamable HTTP (session-aware)
 */

import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
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

const PORT = parseInt(process.env["PORT"] ?? "3000", 10);
const SERVER_NAME = "norwegian-competition-mcp";

// --- Response metadata -------------------------------------------------------

const META = {
  disclaimer: "Data from Konkurransetilsynet public records. Not legal advice.",
  data_age: "2026-04-04",
  copyright: "Konkurransetilsynet — Norwegian government public domain",
  source_url: "https://konkurransetilsynet.no",
};

let pkgVersion = "0.1.0";
try {
  const pkg = JSON.parse(
    readFileSync(join(__dirname, "..", "package.json"), "utf8"),
  ) as { version: string };
  pkgVersion = pkg.version;
} catch {
  // fallback
}

// --- Tool definitions (shared with index.ts) ---------------------------------

const TOOLS = [
  {
    name: "no_comp_search_decisions",
    description:
      "Search Konkurransetilsynet competition decisions — merger control, cartel enforcement, abuse of dominance, and market investigations.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query (e.g., 'foretakssammenslutning', 'prissamarbeid', 'markedsmakt')" },
        type: {
          type: "string",
          enum: ["abuse_of_dominance", "cartel", "merger", "sector_inquiry"],
          description: "Filter by decision type. Optional.",
        },
        sector: { type: "string", description: "Filter by sector ID. Optional." },
        outcome: {
          type: "string",
          enum: ["prohibited", "cleared", "cleared_with_conditions", "fine"],
          description: "Filter by outcome. Optional.",
        },
        limit: { type: "number", description: "Max results (default 20)." },
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
        case_number: { type: "string", description: "Case number (e.g., 'KT-2023-001', 'V2022-15')" },
      },
      required: ["case_number"],
    },
  },
  {
    name: "no_comp_search_mergers",
    description:
      "Search Konkurransetilsynet merger control decisions (foretakssammenslutninger).",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query (e.g., 'foretakssammenslutning', 'oppkjop', 'fusjon')" },
        sector: { type: "string", description: "Filter by sector ID. Optional." },
        outcome: {
          type: "string",
          enum: ["cleared", "cleared_phase1", "cleared_with_conditions", "prohibited"],
          description: "Filter by merger outcome. Optional.",
        },
        limit: { type: "number", description: "Max results (default 20)." },
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
        case_number: { type: "string", description: "Merger case number (e.g., 'KT-2023-M-001')" },
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
        query: { type: "string", description: "Search query (e.g., 'dagligvare', 'konkurranse', 'markedsstudie')" },
        type: {
          type: "string",
          enum: ["guideline", "market_study", "report"],
          description: "Filter by document type. Optional.",
        },
        limit: { type: "number", description: "Max results (default 20)." },
      },
      required: ["query"],
    },
  },
  {
    name: "no_comp_list_sectors",
    description:
      "List all sectors with Konkurransetilsynet enforcement activity, including decision and merger counts.",
    inputSchema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "no_comp_get_guideline",
    description:
      "Get a specific Konkurransetilsynet guideline, market study, or report by document ID.",
    inputSchema: {
      type: "object" as const,
      properties: {
        doc_id: { type: "string", description: "Document ID (e.g., 'GL-2023-001')" },
      },
      required: ["doc_id"],
    },
  },
  {
    name: "no_comp_list_sources",
    description:
      "List all data sources used by this MCP server, including authority, URL, item counts, and last refresh dates.",
    inputSchema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "no_comp_check_data_freshness",
    description:
      "Check the freshness of the data corpus. Returns the corpus date, age in days, item counts per source, and a staleness flag (>180 days).",
    inputSchema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "no_comp_about",
    description:
      "Norwegian Competition MCP server. Covers Konkurransetilsynet merger decisions, cartel enforcement, market studies, and competition guidelines.",
    inputSchema: { type: "object" as const, properties: {}, required: [] },
  },
];

// --- Zod schemas -------------------------------------------------------------

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

// --- MCP server factory ------------------------------------------------------

function createMcpServer(): Server {
  const server = new Server(
    { name: SERVER_NAME, version: pkgVersion },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    function textContent(data: Record<string, unknown>) {
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ ...data, _meta: META }, null, 2) }],
      };
    }

    function errorContent(message: string, errorType: "not_found" | "tool_error" | "unknown_tool" = "tool_error") {
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ error: message, _error_type: errorType }, null, 2) }],
        isError: true as const,
      };
    }

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

  return server;
}

// --- HTTP server -------------------------------------------------------------

async function main(): Promise<void> {
  const sessions = new Map<
    string,
    { transport: StreamableHTTPServerTransport; server: Server }
  >();

  const httpServer = createServer((req, res) => {
    handleRequest(req, res, sessions).catch((err) => {
      console.error(`[${SERVER_NAME}] Unhandled error:`, err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    });
  });

  async function handleRequest(
    req: import("node:http").IncomingMessage,
    res: import("node:http").ServerResponse,
    activeSessions: Map<
      string,
      { transport: StreamableHTTPServerTransport; server: Server }
    >,
  ): Promise<void> {
    const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

    if (url.pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", server: SERVER_NAME, version: pkgVersion }));
      return;
    }

    if (url.pathname === "/mcp") {
      const sessionId = req.headers["mcp-session-id"] as string | undefined;

      if (sessionId && activeSessions.has(sessionId)) {
        const session = activeSessions.get(sessionId)!;
        await session.transport.handleRequest(req, res);
        return;
      }

      const mcpServer = createMcpServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- SDK type mismatch with exactOptionalPropertyTypes
      await mcpServer.connect(transport as any);

      transport.onclose = () => {
        if (transport.sessionId) {
          activeSessions.delete(transport.sessionId);
        }
        mcpServer.close().catch(() => {});
      };

      await transport.handleRequest(req, res);

      if (transport.sessionId) {
        activeSessions.set(transport.sessionId, { transport, server: mcpServer });
      }
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }

  httpServer.listen(PORT, () => {
    console.error(`${SERVER_NAME} v${pkgVersion} (HTTP) listening on port ${PORT}`);
    console.error(`MCP endpoint:  http://localhost:${PORT}/mcp`);
    console.error(`Health check:  http://localhost:${PORT}/health`);
  });

  process.on("SIGTERM", () => {
    console.error("Received SIGTERM, shutting down...");
    httpServer.close(() => process.exit(0));
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
