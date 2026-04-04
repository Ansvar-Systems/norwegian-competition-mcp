# Coverage -- Norwegian Competition MCP

Current coverage of Norwegian competition law enforcement data from Konkurransetilsynet (Norwegian Competition Authority).

**Last updated:** 2026-04-04

---

## Sources

| Source | Authority | Records | Content |
|--------|-----------|---------|---------|
| **Konkurransetilsynet** | Norwegian Competition Authority | 143 decisions | Cartel enforcement, abuse of dominance, gun jumping, sector inquiries, obstruction -- fines totaling 6.48B+ NOK |
| **Konkurransetilsynet** | Norwegian Competition Authority | 107 mergers | Merger control (foretakssammenslutninger) -- cleared, conditional, prohibited, closed |
| **Konkurransetilsynet** | Norwegian Competition Authority | 149 guidelines | Market studies, hearing statements, enforcement guidelines, legislation summaries |
| **Sectors** | Cross-referenced | 17 sectors | Grocery, energy, transport, construction, financial services, healthcare, telecommunications, media, digital platforms, and more |
| **Total** | | **416 records** | 680 KB SQLite database |

---

## Decision Types

| Type | Norwegian Term | Count | Description |
|------|----------------|-------|-------------|
| `gun_jumping` | Gjennomforingsforbud | 39 | Premature implementation of mergers before clearance |
| `merger_decision` | Fusjonsvedtak | 31 | Merger decisions handled through the decisions table |
| `cartel` | Kartellsaker | 30 | Price-fixing, market sharing, bid rigging under konkurranseloven ss. 10 |
| `sector_inquiry` | Sektorundersokelse | 18 | Market studies and sector investigations |
| `abuse_of_dominance` | Misbruk av dominerende stilling | 8 | Exclusionary and exploitative conduct under konkurranseloven ss. 11 |
| `obstruction` | Hindring av tilsyn | 6 | Obstruction of investigations |
| `administrative` | Administrativt | 4 | Administrative enforcement actions |
| `commitments` | Avhjelpende tiltak | 4 | Commitment decisions |
| `regulatory` | Regulatorisk | 3 | Regulatory decisions |

### Fine Amounts

Total fines across all decisions: **6.48 billion NOK**. Includes major enforcement actions in grocery, construction, and transport sectors.

---

## Merger Outcomes

| Outcome | Norwegian Term | Count | Description |
|---------|----------------|-------|-------------|
| `cleared_phase1` | Godkjent fase I | 40 | Approved in Phase I review |
| `cleared_with_conditions` | Godkjent med vilkar | 26 | Approved subject to remedies |
| `prohibited` | Forbudt | 17 | Blocked by Konkurransetilsynet |
| `closed` | Avsluttet | 9 | Investigation closed without decision |
| `notification_required` | Meldeplikt | 9 | Notification obligation imposed |
| `cleared_phase2` | Godkjent fase II | 2 | Approved after Phase II review |
| `implementation_prohibition` | Gjennomforingsforbud | 2 | Prohibition on implementation pending review |
| `rejected` | Avvist | 2 | Notification rejected |

---

## Guideline Types

| Type | Count | Description |
|------|-------|-------------|
| `market_study` | 63 | Sector analyses, market monitoring reports |
| `hearing_statement` | 49 | Consultation responses, regulatory hearing submissions |
| `guideline` | 31 | Enforcement guidelines, compliance guidance, procedural rules |
| `legislation` | 4 | Legislative summaries and Competition Act materials |
| `regulation` | 2 | Regulatory framework documents |

---

## Sectors Covered

17 sectors with enforcement activity:

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
| Fuel (drivstoff) | Medium | Medium | Fuel distribution, retail pricing |
| Digital platforms (digitale plattformer) | Low | Medium | Platform competition, digital markets |
| Offshore | Medium | Low | Petroleum services, offshore supply |
| Beverages (drikkevarer) | Low | Medium | Beverage distribution, brewery mergers |
| Retail (detaljhandel) | Low | Medium | Non-grocery retail, e-commerce |
| Security (sikkerhet) | Low | Low | Security services, alarm systems |
| Waste (avfall) | Low | Low | Waste management, recycling |

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

- **Norwegian text only** -- all content is in Norwegian. English search queries may return limited results.
- **Summaries, not full legal text** -- records contain representative summaries, not the complete official text from konkurransetilsynet.no.
- **Manual refresh** -- data is updated manually. Recent decisions and guidelines may not be reflected.
- **No appeal tracking** -- decisions marked "final" may have been appealed or overturned.

---

## Planned Improvements

Automated refresh and additional sources planned:

- **konkurransetilsynet.no** -- automated ingestion of new decisions, merger notifications, guidelines
- **lovdata.no** -- konkurranseloven (Competition Act) text, forskrifter (regulations), court judgments
- **Konkurranseklagenemnda** -- Competition Appeals Board decisions

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
