# Norwegian Competition MCP

MCP server for Norwegian competition law enforcement -- Konkurransetilsynet decisions, merger control, cartel enforcement, market studies, and competition guidelines.

[![npm version](https://badge.fury.io/js/@ansvar%2Fnorwegian-competition-mcp.svg)](https://www.npmjs.com/package/@ansvar/norwegian-competition-mcp)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Covers Norwegian competition enforcement under konkurranseloven (Competition Act) and EEA Articles 53-54, with full-text search across decisions, mergers, and guidelines. All data is in Norwegian.

Built by [Ansvar Systems](https://ansvar.eu) -- Stockholm, Sweden

---

## Authority Covered

| Authority | Role | Website |
|-----------|------|---------|
| **Konkurransetilsynet** (Norwegian Competition Authority) | Competition enforcement, merger control, market studies, cartel investigations, sector inquiries | [konkurransetilsynet.no](https://konkurransetilsynet.no) |

---

## Quick Start

### Use Remotely (No Install Needed)

**Endpoint:** `https://mcp.ansvar.eu/norwegian-competition/mcp`

| Client | How to Connect |
|--------|---------------|
| **Claude Desktop** | Add to `claude_desktop_config.json` (see below) |
| **Claude Code** | `claude mcp add norwegian-competition --transport http https://mcp.ansvar.eu/norwegian-competition/mcp` |

**Claude Desktop** -- add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "norwegian-competition": {
      "type": "url",
      "url": "https://mcp.ansvar.eu/norwegian-competition/mcp"
    }
  }
}
```

### Use Locally (npm)

```bash
npx @ansvar/norwegian-competition-mcp
```

Or add to Claude Desktop config for stdio:

```json
{
  "mcpServers": {
    "norwegian-competition": {
      "command": "npx",
      "args": ["-y", "@ansvar/norwegian-competition-mcp"]
    }
  }
}
```

---

## Tools

| Tool | Description |
|------|-------------|
| `no_comp_search_decisions` | Full-text search across Konkurransetilsynet competition decisions (cartels, abuse of dominance, sector inquiries) |
| `no_comp_get_decision` | Get a specific decision by case number (e.g., `KT-2023-001`) |
| `no_comp_search_mergers` | Search merger control decisions (foretakssammenslutninger) with outcome and sector filters |
| `no_comp_get_merger` | Get a specific merger decision by case number |
| `no_comp_search_guidelines` | Search published guidelines, market studies, and reports |
| `no_comp_list_sectors` | List all sectors with enforcement activity and case counts |
| `no_comp_about` | Return server metadata: version, coverage, tool list |

Full tool documentation: [TOOLS.md](TOOLS.md)

---

## Data Coverage

| Category | Records | Content |
|----------|---------|---------|
| Decisions | 73 | Cartel enforcement, abuse of dominance, sector inquiries -- fines totaling 6.48B NOK |
| Mergers | 43 | Approved, conditional, prohibited merger decisions (foretakssammenslutninger) |
| Guidelines | 69 | Market studies, annual reports, enforcement guidance, legislative summaries |
| Sectors | 15 | Grocery, energy, transport, construction, financial services, healthcare, telecommunications, media, and more |
| **Total** | **200 records** | ~525 KB database |

**Language note:** All content is in Norwegian. Search queries work best in Norwegian (e.g., `foretakssammenslutning`, `prissamarbeid`, `kartell`, `dagligvare`, `overtredelsesgebyr`).

Full coverage details: [COVERAGE.md](COVERAGE.md)

---

## Data Sources

See [sources.yml](sources.yml) for machine-readable provenance metadata.

---

## Docker

```bash
docker build -t norwegian-competition-mcp .
docker run --rm -p 3000:3000 -v /path/to/data:/app/data norwegian-competition-mcp
```

Set `NO_COMP_DB_PATH` to use a custom database location (default: `data/no-comp.db`).

---

## Development

```bash
npm install
npm run build
npm run seed         # populate sample data
npm run dev          # HTTP server on port 3000
```

---

## Further Reading

- [TOOLS.md](TOOLS.md) -- full tool documentation with examples
- [COVERAGE.md](COVERAGE.md) -- data coverage and limitations
- [sources.yml](sources.yml) -- data provenance metadata
- [DISCLAIMER.md](DISCLAIMER.md) -- legal disclaimer
- [PRIVACY.md](PRIVACY.md) -- privacy policy
- [SECURITY.md](SECURITY.md) -- vulnerability disclosure

---

## License

Apache-2.0 -- [Ansvar Systems AB](https://ansvar.eu)

See [LICENSE](LICENSE) for the full license text.

See [DISCLAIMER.md](DISCLAIMER.md) for important legal disclaimers about the use of this competition law data.

---

[ansvar.ai/mcp](https://ansvar.ai/mcp) -- Full MCP server catalog
