# Tools -- Norwegian Competition MCP

10 tools for searching and retrieving Norwegian competition law enforcement data from Konkurransetilsynet.

All data is in Norwegian. Tool descriptions and parameter names are in English.

---

## 1. no_comp_search_decisions

Full-text search across Konkurransetilsynet competition decisions -- cartel enforcement, abuse of dominance, merger decisions, and sector inquiries.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | Yes | Search query in Norwegian or English (e.g., `foretakssammenslutning`, `prissamarbeid`, `markedsmakt`, `konkurranseloven`) |
| `type` | string | No | Filter by decision type: `abuse_of_dominance`, `cartel`, `merger`, `sector_inquiry` |
| `sector` | string | No | Filter by sector ID (e.g., `grocery`, `energy`, `transport`, `construction`) |
| `outcome` | string | No | Filter by outcome: `prohibited`, `cleared`, `cleared_with_conditions`, `fine` |
| `limit` | number | No | Maximum results (default 20, max 100) |

**Returns:** Array of matching decisions with case_number, title, date, type, sector, parties, summary, full_text, outcome, fine_amount, legal_basis, and status.

**Example:**

```json
{
  "query": "prissamarbeid dagligvare",
  "type": "cartel",
  "sector": "grocery"
}
```

**Data sources:** Konkurransetilsynet (konkurransetilsynet.no).

**Limitations:** Curated dataset with 143 decisions. Summaries, not full legal text. Norwegian-language content only. Does not include appeal outcomes from Konkurranseklagenemnda or courts.

---

## 2. no_comp_get_decision

Get a specific Konkurransetilsynet decision by its case number. Returns the full record including summary, outcome, fine amount, and legal basis.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `case_number` | string | Yes | Konkurransetilsynet case number (e.g., `KT-2023-001`, `V2022-15`) |

**Returns:** Single decision record with all fields, or an error if not found.

**Example:**

```json
{
  "case_number": "KT-2023-001"
}
```

**Data sources:** Konkurransetilsynet (konkurransetilsynet.no).

**Limitations:** Exact match on case number. Partial matches are not supported -- use `no_comp_search_decisions` for fuzzy search.

---

## 3. no_comp_search_mergers

Search Konkurransetilsynet merger control decisions (foretakssammenslutninger). Returns merger cases with acquiring party, target, sector, outcome, and turnover.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | Yes | Search query (e.g., `foretakssammenslutning`, `oppkjop`, `fusjon`, `dagligvare`) |
| `sector` | string | No | Filter by sector ID (e.g., `energy`, `grocery`, `transport`). Optional. |
| `outcome` | string | No | Filter by merger outcome: `cleared`, `cleared_phase1`, `cleared_with_conditions`, `prohibited` |
| `limit` | number | No | Maximum results (default 20, max 100) |

**Returns:** Array of matching merger decisions with case_number, title, date, sector, acquiring_party, target, summary, full_text, outcome, and turnover.

**Example:**

```json
{
  "query": "oppkjop energi",
  "sector": "energy",
  "outcome": "cleared_with_conditions"
}
```

**Data sources:** Konkurransetilsynet (konkurransetilsynet.no).

**Limitations:** Curated dataset with 107 merger cases. Summaries, not full legal text. Norwegian-language content only. Does not include pre-notification consultations.

---

## 4. no_comp_get_merger

Get a specific Konkurransetilsynet merger control decision by its case number. Returns the full record including acquiring party, target, outcome, and turnover.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `case_number` | string | Yes | Merger case number (e.g., `KT-2023-M-001`) |

**Returns:** Single merger record with all fields, or an error if not found.

**Example:**

```json
{
  "case_number": "KT-2023-M-001"
}
```

**Data sources:** Konkurransetilsynet (konkurransetilsynet.no).

**Limitations:** Exact match on case number. Use `no_comp_search_mergers` for fuzzy search.

---

## 5. no_comp_search_guidelines

Search Konkurransetilsynet published guidelines, market studies, and reports.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | Yes | Search query (e.g., `dagligvare`, `konkurranse`, `markedsstudie`, `arsmelding`) |
| `type` | string | No | Filter by document type: `guideline`, `market_study`, `report` |
| `limit` | number | No | Maximum results (default 20, max 100) |

**Returns:** Array of matching guidelines with doc_id, title, date, type, summary, and full_text.

**Example:**

```json
{
  "query": "dagligvaremarkedet",
  "type": "market_study"
}
```

**Data sources:** Konkurransetilsynet (konkurransetilsynet.no).

**Limitations:** Curated dataset with 149 guidelines. Summaries only. Norwegian-language content only.

---

## 6. no_comp_list_sectors

List all sectors with Konkurransetilsynet enforcement activity, including decision counts and merger counts per sector. Takes no parameters.

**Parameters:** None.

**Returns:** Array of sectors with id, name, name_en (English name), description, decision_count, and merger_count.

**Example:**

```json
{}
```

**Data sources:** Cross-referenced from decisions and mergers tables.

**Limitations:** None.

---

## 7. no_comp_get_guideline

Get a specific Konkurransetilsynet guideline, market study, or report by document ID. Returns the full record.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `doc_id` | string | Yes | Document ID (e.g., `GL-2023-001`) |

**Returns:** Single guideline record with doc_id, title, date, type, summary, and full_text, or an error if not found.

**Example:**

```json
{
  "doc_id": "GL-2023-001"
}
```

**Data sources:** Konkurransetilsynet (konkurransetilsynet.no).

**Limitations:** Exact match on doc_id. Use `no_comp_search_guidelines` for fuzzy search.

---

## 8. no_comp_list_sources

List all data sources used by this MCP server, including authority, URL, item counts, and last refresh dates. Takes no parameters.

**Parameters:** None.

**Returns:** Array of source objects with id, name, authority, url, item_count, last_refresh, and refresh_frequency.

**Example:**

```json
{}
```

**Data sources:** data/coverage.json (bundled metadata).

**Limitations:** None.

---

## 9. no_comp_check_data_freshness

Check the freshness of the data corpus. Returns the corpus date, age in days, per-source item counts, and a staleness flag if data is older than 180 days.

**Parameters:** None.

**Returns:** corpus_date, data_age_days, is_stale (boolean), refresh_frequency, and per-source breakdown.

**Example:**

```json
{}
```

**Data sources:** data/coverage.json (bundled metadata).

**Limitations:** Reflects the bundled corpus snapshot date, not live data.

---

## 10. no_comp_about

Return metadata about this MCP server: version, description, data source, coverage summary, and tool list. Takes no parameters.

**Parameters:** None.

**Returns:** Server name, version, description, data_source URL, coverage object, and tool list with names and descriptions.

**Example:**

```json
{}
```

**Data sources:** N/A (server metadata).

**Limitations:** None.
