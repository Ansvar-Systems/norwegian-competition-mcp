# Norwegian Competition MCP

<!-- ANSVAR-CTA-BEGIN -->
> ### ▶ Try this MCP instantly via Ansvar Gateway
> **50 free queries/day · no card required · OAuth signup at [ansvar.eu/gateway](https://ansvar.eu/gateway)**
>
> One endpoint, one OAuth signup, access from any MCP-compatible client.

### Connect

**Claude Code** (one line):

```bash
claude mcp add ansvar --transport http https://gateway.ansvar.eu/mcp
```

**Claude Desktop / Cursor** — add to `claude_desktop_config.json` (or `mcp.json`):

```json
{
  "mcpServers": {
    "ansvar": {
      "type": "url",
      "url": "https://gateway.ansvar.eu/mcp"
    }
  }
}
```

**Claude.ai** — Settings → Connectors → Add custom connector → paste `https://gateway.ansvar.eu/mcp`

First request opens an OAuth flow at [ansvar.eu/gateway](https://ansvar.eu/gateway). After signup, your client is bound to your account; tier (free / premium / team / company) determines fan-out, quota, and which downstream MCPs are reachable.

---

## Self-host this MCP

You can also clone this repo and build the corpus yourself. The schema,
fetcher, and tool implementations all live here. What is not in the repo is
the pre-built database — TDM and standards-licensing constraints on the
upstream sources mean we host the corpus on Ansvar infrastructure rather
than redistribute it as a public artifact.

Build your own: run this repo's ingestion script (entry-point varies per
repo — typically `scripts/ingest.sh`, `npm run ingest`, or `make ingest`;
check the repo root).
<!-- ANSVAR-CTA-END -->


MCP server for Norwegian competition law enforcement -- Konkurransetilsynet decisions, merger control, cartel enforcement, market studies, and competition guidelines.

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Covers Norwegian competition enforcement under konkurranseloven (Competition Act) and EEA Articles 53-54, with full-text search across decisions, mergers, and guidelines. All data is in Norwegian.

Built by [Ansvar Systems](https://ansvar.eu) -- Stockholm, Sweden

---

## Authority Covered

| Authority | Role | Website |
|-----------|------|---------|
| **Konkurransetilsynet** (Norwegian Competition Authority) | Competition enforcement, merger control, market studies, cartel investigations, sector inquiries | [konkurransetilsynet.no](https://konkurransetilsynet.no) |

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
