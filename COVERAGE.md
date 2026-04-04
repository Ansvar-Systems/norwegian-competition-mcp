# Coverage -- Norwegian Competition MCP

Current coverage of Norwegian competition law enforcement data from Konkurransetilsynet (Norwegian Competition Authority).

**Last updated:** 2026-04-04

---

## Sources

| Source | Authority | Records | Content |
|--------|-----------|---------|---------|
| **Konkurransetilsynet** | Norwegian Competition Authority | 73 decisions | Cartel enforcement, abuse of dominance, sector inquiries -- fines totaling 6.48B NOK |
| **Konkurransetilsynet** | Norwegian Competition Authority | 43 mergers | Merger control (foretakssammenslutninger) -- approved, conditional, prohibited |
| **Konkurransetilsynet** | Norwegian Competition Authority | 69 guidelines | Market studies, annual reports, legislation summaries, enforcement guidance |
| **Sectors** | Cross-referenced | 15 sectors | Grocery, energy, transport, construction, financial services, healthcare, telecommunications, media, and more |
| **Total** | | **200 records** | ~525 KB SQLite database |

---

## Decision Types

| Type | Norwegian Term | Count | Description |
|------|----------------|-------|-------------|
| `cartel` | Kartellsaker | 31 | Price-fixing, market sharing, bid rigging under konkurranseloven ss. 10 |
| `abuse_of_dominance` | Misbruk av dominerende stilling | 24 | Exclusionary and exploitative conduct under konkurranseloven ss. 11 |
| `merger` | Foretakssammenslutning | 11 | Merger decisions handled through the decisions table |
| `sector_inquiry` | Sektorundersokelse | 7 | Market studies and sector investigations |

### Fine Amounts

Total fines across all decisions: **6.48 billion NOK**. Includes major enforcement actions in grocery, construction, and transport sectors.

---

## Merger Outcomes

| Outcome | Norwegian Term | Count | Description |
|---------|----------------|-------|-------------|
| `cleared` | Godkjent | 18 | Unconditionally approved |
| `cleared_phase1` | Godkjent fase I | 12 | Approved in Phase I review |
| `cleared_with_conditions` | Godkjent med vilkar | 9 | Approved subject to remedies |
| `prohibited` | Forbudt | 4 | Blocked by Konkurransetilsynet |

---

## Guideline Types

| Type | Count | Description |
|------|-------|-------------|
| `guideline` | 28 | Enforcement guidelines, compliance guidance, procedural rules |
| `market_study` | 22 | Sector analyses, market monitoring reports |
| `report` | 19 | Annual reports, legislative summaries, policy papers |

---

## Sectors Covered

15 sectors with enforcement activity:

| Sector | Decisions | Mergers | Key Areas |
|--------|-----------|---------|-----------|
| Grocery (dagligvare) | High | High | Retail concentration, supplier agreements, price monitoring |
| Energy (energi) | Medium | Medium | Electricity market, petroleum, district heating |
| Transport | Medium | Medium | Aviation, maritime, road transport |
| Construction (bygg og anlegg) | High | Low | Bid rigging, asphalt cartels |
| Financial services (finans) | Medium | Medium | Banking, insurance, payment services |
| Healthcare (helse) | Low | Medium | Hospital procurement, pharmaceutical distribution |
| Telecommunications (telekom) | Medium | Medium | Mobile operators, broadband |
| Media | Low | High | Broadcasting, publishing, digital media |
| Real estate (eiendom) | Low | Medium | Property development, brokerage |
| Agriculture (landbruk) | Low | Low | Cooperative agreements, supply chains |
| Fisheries (fiskeri) | Low | Low | Aquaculture, processing, export |
| Technology (teknologi) | Low | Medium | Software, IT services |
| Manufacturing (industri) | Medium | Low | Industrial cartels, supply agreements |
| Retail (detaljhandel) | Low | Medium | Non-grocery retail, e-commerce |
| Professional services | Low | Low | Legal, accounting, consulting |

---

## What Is NOT Included

This is a curated dataset. The following are not yet covered:

- **Full text of original documents** -- records contain summaries, not complete legal text from konkurransetilsynet.no
- **Konkurranseklagenemnda decisions** -- Competition Appeals Board rulings are not included
- **Court judgments** -- District court and Supreme Court competition rulings are not included
- **EFTA Surveillance Authority decisions** -- EEA-level competition enforcement is covered by the EU Regulations MCP, not this server
- **Leniency applications** -- Confidential leniency program details are not included
- **Ongoing investigations** -- Only published final decisions are covered
- **Decisions before 2004** -- Limited coverage of decisions under the previous competition act (konkurranseloven av 1993)
- **Dawn raid records** -- Investigative procedure details are not published
- **Sector-specific regulatory decisions** -- Decisions by sector regulators (e.g., Nkom, NVE) are not included

---

## Limitations

- **Curated dataset** -- 200 records covering major enforcement actions and guidelines. Not a complete archive.
- **Norwegian text only** -- all content is in Norwegian. English search queries may return limited results.
- **Summaries, not full legal text** -- records contain representative summaries, not the complete official text from konkurransetilsynet.no.
- **Manual refresh** -- data is updated manually. Recent decisions and guidelines may not be reflected.
- **No appeal tracking** -- decisions marked "final" may have been appealed or overturned.

---

## Planned Improvements

Full automated ingestion is planned from:

- **konkurransetilsynet.no** -- official decisions, merger notifications, guidelines, market studies
- **lovdata.no** -- konkurranseloven (Competition Act) text, forskrifter (regulations), court judgments

---

## Language

All content is in Norwegian. The following search terms are useful starting points:

| Norwegian Term | English Equivalent |
|----------------|-------------------|
| foretakssammenslutning | merger / concentration |
| kartell | cartel |
| prissamarbeid | price-fixing |
| markedsdeling | market sharing |
| anbudssamarbeid | bid rigging |
| misbruk av dominerende stilling | abuse of dominance |
| konkurranseloven | Competition Act |
| overtredelsesgebyr | administrative fine |
| markedsmakt | market power |
| dagligvare | grocery |
| sektorundersokelse | sector inquiry |
| fusjon | merger / fusion |
| oppkjop | acquisition |
| vilkar | conditions / remedies |
