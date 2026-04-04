/**
 * Seed the Konkurransetilsynet database with sample decisions, mergers,
 * guidelines, and sectors for testing.
 *
 * Usage:
 *   npx tsx scripts/seed-sample.ts
 *   npx tsx scripts/seed-sample.ts --force
 */

import Database from "better-sqlite3";
import { existsSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname } from "node:path";
import { SCHEMA_SQL } from "../src/db.js";

const DB_PATH = process.env["NO_COMP_DB_PATH"] ?? "data/no-comp.db";
const force = process.argv.includes("--force");

const dir = dirname(DB_PATH);
if (!existsSync(dir)) { mkdirSync(dir, { recursive: true }); }
if (force && existsSync(DB_PATH)) { unlinkSync(DB_PATH); console.log(`Deleted existing database at ${DB_PATH}`); }

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(SCHEMA_SQL);
console.log(`Database initialised at ${DB_PATH}`);

interface SectorRow { id: string; name: string; name_en: string; description: string; decision_count: number; merger_count: number; }

const sectors: SectorRow[] = [
  { id: "grocery", name: "Dagligvare", name_en: "Grocery",
    description: "Dagligvarehandel, supermarkeder, grossister og leverandorrelasjoner i Norge.", decision_count: 2, merger_count: 1 },
  { id: "energy", name: "Energi", name_en: "Energy",
    description: "Kraftproduksjon, distribusjon og omsetning av elektrisk kraft i det norske energimarkedet.", decision_count: 1, merger_count: 1 },
  { id: "transport", name: "Transport", name_en: "Transport",
    description: "Persontransport, godstransport, luftfart og maritim transport i Norge.", decision_count: 1, merger_count: 1 },
  { id: "construction", name: "Bygg og anlegg", name_en: "Construction",
    description: "Byggematerialer, entreprenortjenester og eiendomsutvikling i Norge.", decision_count: 1, merger_count: 0 },
  { id: "financial_services", name: "Finansielle tjenester", name_en: "Financial services",
    description: "Banker, forsikring, betalingslosninger og finansmarkedsinfrastruktur i Norge.", decision_count: 0, merger_count: 1 },
  { id: "telecommunications", name: "Telekommunikasjon", name_en: "Telecommunications",
    description: "Mobil, bredband, fastnett og telekommunikasjonsinfrastruktur i Norge.", decision_count: 0, merger_count: 1 },
  { id: "healthcare", name: "Helse", name_en: "Healthcare",
    description: "Sykehus, legemiddelindustri, medisinsk utstyr og helseforsikring i Norge.", decision_count: 1, merger_count: 0 },
];

const insertSector = db.prepare("INSERT OR IGNORE INTO sectors (id, name, name_en, description, decision_count, merger_count) VALUES (?, ?, ?, ?, ?, ?)");
for (const s of sectors) { insertSector.run(s.id, s.name, s.name_en, s.description, s.decision_count, s.merger_count); }
console.log(`Inserted ${sectors.length} sectors`);

interface DecisionRow { case_number: string; title: string; date: string; type: string; sector: string; parties: string; summary: string; full_text: string; outcome: string; fine_amount: number | null; legal_basis: string; status: string; }

const decisions: DecisionRow[] = [
  {
    case_number: "V2022-15",
    title: "NorgesGruppen — misbruk av dominerende stilling i dagligvaremarkedet",
    date: "2022-06-15", type: "abuse_of_dominance", sector: "grocery",
    parties: JSON.stringify(["NorgesGruppen ASA"]),
    summary: "Konkurransetilsynet undersakte om NorgesGruppen misbrukte sin dominerende stilling i det norske dagligvaremarkedet gjennom hylleplassavtaler og eksklusive leverandorvilkar som begrenset konkurransen fra nye aktorer.",
    full_text: "Konkurransetilsynet apnet en undersokelse av NorgesGruppen ASA sin adferd i det norske dagligvaremarkedet i henhold til konkurranseloven paragraf 11 og EOS-avtalens artikkel 54. Det norske dagligvaremarkedet er sterkt konsentrert med tre dominerende kjeder: NorgesGruppen (Kiwi, Meny, Spar, Joker), Coop Norge (Extra, Obs, Prix, Mega) og Rema 1000. NorgesGruppen har en samlet markedsandel pa om lag 44 prosent. Konkurransetilsynet undersakte om NorgesGruppens avtaler med leverandorer inneholdt vilkar som vanskeliggjorde tilgangen for konkurrenter. Spesifikke problemstillinger: (1) Hylleplassavtaler som betinget leverandorenes tilgang til NorgesGruppens butikker av at leverandorene ikke ga bedre vilkar til konkurrerende kjeder. (2) Innkjopsbetingelser som innebar at NorgesGruppen fikk en mest-begunstiget-klausul pa leverandorpriser. (3) Samarbeid om kategoriutvikling som ga NorgesGruppen innsyn i konkurrenters sortiment og priser. Konkurransetilsynet vurderte at flere av disse avtalene kunne utgjore misbruk av dominerende stilling. NorgesGruppen aksepterte a endre sine leverandoravtaler og fjerne de mest problematiske klausulene. Saken ble avsluttet med tilsagn.",
    outcome: "cleared_with_conditions", fine_amount: null,
    legal_basis: JSON.stringify(["konkurranseloven paragraf 11", "EOS-avtalens artikkel 54"]), status: "final",
  },
  {
    case_number: "V2023-08",
    title: "Asfaltbransjen — prissamarbeid ved offentlige anbud",
    date: "2023-03-22", type: "cartel", sector: "construction",
    parties: JSON.stringify(["Veidekke ASA", "Skanska Norge AS", "NCC Norge AS"]),
    summary: "Konkurransetilsynet iverksatte sanksjoner mot tre store entreprenorselskaper for deltakelse i prissamarbeid (anbudssamarbeid) ved offentlige anskaffelser av asfaltlegging og veivedlikehold i Sor-Norge.",
    full_text: "Konkurransetilsynet avsluttet en undersokelse av anbudssamarbeid i den norske asfaltbransjen. Tilsynet samarbeidet med Okokrim om etterforskningen, som startet etter en lempningssoknad (leniency). Det avdekkede kartellet: Selskapene deltok i et systematisk system for koordinering av anbud ved offentlige anskaffelser for asfaltlegging og veivedlikehold. (1) Forhands koordinering — selskapene kommuniserte for tilbudsfrister om hvilket selskap som skulle vinne det aktuelle anbudet. (2) Dekningstilbud — de ovrige deltakerne leverte bevisst ikke-konkurransedyktige tilbud for a simulere reell konkurranse. (3) Kompensasjonsavtaler — tapende parter mottok kompensasjon i form av underentreprisekontrakter fra den vinnende parten. Pavirte anbud: Asfaltlegging, veivedlikehold og veirehabilitering i Sost- og Vestlandet i perioden 2017-2022. Konkurransetilsynet ila overtredelsesgebyr pa til sammen 150 millioner kroner. Okokrim reiste tiltale mot flere enkeltpersoner for brudd pa konkurranselovens straffebestemmelser.",
    outcome: "fine", fine_amount: 150_000_000,
    legal_basis: JSON.stringify(["konkurranseloven paragraf 10", "EOS-avtalens artikkel 53"]), status: "appealed",
  },
  {
    case_number: "V2023-19",
    title: "Dagligvaremarkedet — markedsstudie av konkurransen i dagligvaresektoren",
    date: "2023-09-10", type: "sector_inquiry", sector: "grocery",
    parties: JSON.stringify(["Dagligvareaktorer i det norske markedet"]),
    summary: "Konkurransetilsynet gjennomforte en markedsstudie av konkurransen i det norske dagligvaremarkedet, med fokus pa vertikale relasjoner mellom leverandorer og dagligvarekjeder, etableringsbarrierer og prisovervakning.",
    full_text: "Konkurransetilsynet igangsatte en bred markedsstudie av det norske dagligvaremarkedet i henhold til konkurranseloven paragraf 9 forste ledd bokstav e. Norge har et av Europas mest konsentrerte dagligvaremarkeder med tre kjeder som kontrollerer over 96 prosent av markedet. Studien dekket folgende omrader: (1) Vertikale relasjoner — forholdet mellom leverandorer og dagligvarekjeder, herunder leverandorvilkar, hylleplassavtaler, joint marketing-avtaler og kategoristyring. Studien kartla omfanget av kjededrivne merkevarer (EMV) og deres betydning for leverandorenes forhandlingsposisjon. (2) Etableringsbarrierer — analyse av hva som hindrer nye aktorer fra a etablere seg i det norske dagligvaremarkedet. Tilgang til attraktive butikklokaler, distribusjonsnettverket og grossistfunksjonen ble identifisert som sentrale barrierer. (3) Prismekanismer — undersokelse av priskonkurransen mellom kjedene, herunder prisovervakningssystemer og prisgarantier. Konkurransetilsynet analyserte om prisovervakningspraksiser kan fasilitere koordinerte effekter. (4) EOS-rettslige vurderinger — EOS-avtalens konkurranseregler gjelder direkte i Norge gjennom EOS-loven. Studien vurderte forholdet til EU-kommisjonens praksis og ESAs tilsynsrolle. Konkurransetilsynet foreslo regulatoriske tiltak for a styrke konkurransen, herunder et forbud mot bestemte former for hylleplassavtaler.",
    outcome: "cleared", fine_amount: null,
    legal_basis: JSON.stringify(["konkurranseloven paragraf 9"]), status: "final",
  },
  {
    case_number: "V2024-03",
    title: "Flyselskaper — informasjonsutveksling om kapasitetsplaner",
    date: "2024-01-18", type: "cartel", sector: "transport",
    parties: JSON.stringify(["SAS AB", "Norwegian Air Shuttle ASA"]),
    summary: "Konkurransetilsynet undersakte mulig informasjonsutveksling mellom SAS og Norwegian om kapasitetsplaner og rutebeslutninger pa innenriksruter i Norge. Saken ble avsluttet med tilsagn om endret praksis.",
    full_text: "Konkurransetilsynet gjennomforte en undersokelse av mulig informasjonsutveksling mellom de to storste flyselskapene pa det norske innenriksmarkedet i henhold til konkurranseloven paragraf 10 og EOS-avtalens artikkel 53. Det norske innenriksluftfartsmarkedet er i praksis et duopol etter at Norwegian og SAS dominerer de fleste ruter. Konkurransetilsynet undersakte om det foregikk en utveksling av konkurransesensitiv informasjon som kunne fasilitere koordinert adferd. Spesifikke problemstillinger: (1) Utveksling av fremadrettede opplysninger om planlagte kapasitetsendringer pa innenriksruter. (2) Kommunikasjon om ruteplanlegging og rutenedleggelser som viste mistenkelig korrelasjon. (3) Prisovervakningssystemer som ga begge selskapene innsyn i konkurrentens billettpriser i sanntid. Konkurransetilsynet vurderte at visse former for informasjonsutveksling var i strid med konkurransereglene. Selskapene aksepterte tilsagn om a opphore med utveksling av fremadrettet kapasitetsinformasjon og innfore interne retningslinjer for konkurranserett.",
    outcome: "cleared_with_conditions", fine_amount: null,
    legal_basis: JSON.stringify(["konkurranseloven paragraf 10", "EOS-avtalens artikkel 53"]), status: "final",
  },
  {
    case_number: "V2024-11",
    title: "Legemiddelmarkedet — markedsstudie av generiske legemidler",
    date: "2024-05-30", type: "sector_inquiry", sector: "healthcare",
    parties: JSON.stringify(["Legemiddelaktorer i det norske markedet"]),
    summary: "Konkurransetilsynet gjennomforte en markedsstudie av konkurransen i markedet for generiske legemidler i Norge. Studien analyserte trinnprissystemet, parallellimport, og vertikale relasjoner mellom produsenter, grossister og apotek.",
    full_text: "Konkurransetilsynet igangsatte en markedsstudie av markedet for generiske legemidler i Norge. Norges trinnprissystem er en prisreguleringsordning som reduserer utsalgsprisen pa legemidler etter at patentet er utlopt. Studien dekket: (1) Trinnprissystemet — analyse av om trinnprissystemet gir tilstrekkelige insentiver til priskonkurranse mellom generiske produsenter. (2) Grossistmarkedet — NMD (Norsk Medisinaldepot), Alliance Healthcare og Apotek 1 Gruppen er de dominerende grossistene, alle vertikalt integrert med apotekkjeder. Konkurransetilsynet vurderte om denne vertikale integrasjonen kan begrense konkurransen. (3) Parallellimport — analyse av omfanget av og barrierene mot parallellimport av legemidler fra andre EOS-land. (4) Biosimilaerer — vurdering av konkurransen for biologiske legemidler og biosimilaerer i det norske markedet. Konkurransetilsynet anbefalte justeringer i trinnprissystemet og tiltak for a fremme parallellimport og biosimilaerkonkurranse.",
    outcome: "cleared", fine_amount: null,
    legal_basis: JSON.stringify(["konkurranseloven paragraf 9"]), status: "ongoing",
  },
];

const insertDecision = db.prepare("INSERT OR IGNORE INTO decisions (case_number, title, date, type, sector, parties, summary, full_text, outcome, fine_amount, legal_basis, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
const insertDecisionsAll = db.transaction(() => { for (const d of decisions) { insertDecision.run(d.case_number, d.title, d.date, d.type, d.sector, d.parties, d.summary, d.full_text, d.outcome, d.fine_amount, d.legal_basis, d.status); } });
insertDecisionsAll();
console.log(`Inserted ${decisions.length} decisions`);

interface MergerRow { case_number: string; title: string; date: string; sector: string; acquiring_party: string; target: string; summary: string; full_text: string; outcome: string; turnover: number | null; }

const mergers: MergerRow[] = [
  {
    case_number: "KT-2022-M-001",
    title: "NorgesGruppen / Bunnpris — foretakssammenslutning i dagligvaremarkedet",
    date: "2022-04-25", sector: "grocery",
    acquiring_party: "NorgesGruppen ASA", target: "Bunnpris AS",
    summary: "Konkurransetilsynet vurderte NorgesGruppens oppkjop av Bunnpris og konkluderte med at sammenslutningen ville fore til en vesentlig begrensning av konkurransen i flere lokale dagligvaremarkeder. NorgesGruppen ble palagt a avhende butikker som vilkar for godkjenning.",
    full_text: "Konkurransetilsynet behandlet NorgesGruppen ASAs erverv av Bunnpris AS i henhold til konkurranseloven kapittel 4 om foretakssammenslutninger. NorgesGruppen er Norges storste dagligvarekonsern med kjedene Kiwi, Meny, Spar og Joker, med en samlet markedsandel pa om lag 44 prosent. Bunnpris er en uavhengig dagligvarekjede med sterk tilstedevaerelse i Midt-Norge og Nord-Norge. Konkurransetilsynet vurderte sammenslutningen pa de lokale dagligvaremarkedene. Dagligvaremarkeder er lokale i sin natur, typisk definert med en kjoreavstand pa 10-15 minutter. I en rekke lokale markeder i Trondelag, Nordland og Troms ville oppkjopet av Bunnpris bety at NorgesGruppen ville drive flere butikker i det lokale omradet, noe som ville redusere lokal konkurranse betydelig. Konkurransetilsynet anvendte SLC-testen (vesentlig begrensning av konkurransen). Sammenslutningen ble godkjent med vilkar: NorgesGruppen matte avhende 12 Bunnpris-butikker i spesifikke lokale markeder til en godkjent kjoper innen 12 maneder. Tilsynet sikret at kjoperne var uavhengige og i stand til a drive butikkene som selvstendige konkurrerende enheter.",
    outcome: "cleared_with_conditions", turnover: 12_000_000_000,
  },
  {
    case_number: "KT-2023-M-002",
    title: "Statkraft / TronderEnergi — sammenslutning i kraftmarkedet",
    date: "2023-06-12", sector: "energy",
    acquiring_party: "Statkraft AS", target: "TronderEnergi AS (kraftproduksjonsaktiver)",
    summary: "Konkurransetilsynet godkjente Statkrafts erverv av TronderEnergis kraftproduksjonsaktiver i Midt-Norge. Sammenslutningen ble godkjent i fase 1 etter at tilsynet konkluderte med at det ikke forelatte vesentlige horisontale overlapp pa de relevante markedene.",
    full_text: "Konkurransetilsynet behandlet Statkraft AS' erverv av kraftproduksjonsaktiver fra TronderEnergi AS. Statkraft er Europas storste produsent av fornybar energi og Norges dominerende kraftprodusent. TronderEnergi er et regionalt energiselskap i Midt-Norge med vannkraft- og vindkraftproduksjon. Transaksjonen omfattet: (1) Vannkraftverk i Trondelag — flere mellomstore vannkraftverk med samlet installert effekt pa 350 MW. (2) Vindkraftandeler — TronderEnergis andeler i Fosen Vind, et av Norges storste vindkraftprosjekter. Konkurransetilsynets analyse: Kraftmarkedet i Norge er organisert i prisomrader (NO1-NO5) som opereres av den nordiske kraftborsen Nord Pool. De horisontale overlappene mellom Statkraft og TronderEnergi er begrenset, da Statkraft primaert har sin produksjon i Sor-Norge (NO1, NO2, NO5) mens TronderEnergi opererer i Midt-Norge (NO3). Konkurransetilsynet vurderte at sammenslutningen ikke ville medfore en vesentlig begrensning av konkurransen og godkjente den i fase 1 uten vilkar.",
    outcome: "cleared_phase1", turnover: 25_000_000_000,
  },
  {
    case_number: "KT-2023-M-005",
    title: "Telenor / Telia (mobilnett) — sammenslutning i telekommunikasjon",
    date: "2023-10-28", sector: "telecommunications",
    acquiring_party: "Telenor ASA", target: "Telia Norge AS (deler av mobilnettinfrastruktur)",
    summary: "Konkurransetilsynet vurderte Telenors erverv av deler av Telias mobilnettinfrastruktur i Nord-Norge. Sammenslutningen ble godkjent med vilkar om nasjonal gjesting (roaming) for a sikre fortsatt konkurranse.",
    full_text: "Konkurransetilsynet behandlet Telenor ASAs erverv av deler av Telia Norge AS sin mobilnettinfrastruktur i Nord-Norge. Telenor er Norges storste telekommunikasjonsselskap med det mest utbygde mobilnettet. Telia Norge (tidligere NetCom/Tele2) er den nest storste mobiloperatoren. Transaksjonen gjaldt Telias mobilmaster og basestasjoner i Nordland, Troms og Finnmark. Konkurransetilsynets analyse: (1) Mobilmarkedet — det norske mobilmarkedet har tre nettverksoperatorer: Telenor, Telia og ICE (Lyse). Transaksjonen ville overfort en del av Telias nettverksinfrastruktur i Nord-Norge til Telenor. (2) Konkurranse i Nord-Norge — i omrader med begrenset dekning er det saerlig viktig a opprettholde konkurranse mellom nettverksoperatorer. (3) Gjestingsavtaler — etter transaksjonen ville Telia vaere avhengig av gjestingsavtaler med Telenor for a opprettholde dekning i de berorte omradene. Konkurransetilsynet godkjente sammenslutningen med vilkar: Telenor matte tilby Telia og ICE nasjonal gjesting pa rimelige og ikke-diskriminerende vilkar i de berorte omradene i minimum 10 ar.",
    outcome: "cleared_with_conditions", turnover: 18_000_000_000,
  },
  {
    case_number: "KT-2024-M-001",
    title: "Wideroe / Flyr — oppkjop av flyselskap",
    date: "2024-03-15", sector: "transport",
    acquiring_party: "Wideroe AS", target: "Flyr AS (konkursbo)",
    summary: "Konkurransetilsynet godkjente Wideroes erverv av eiendeler fra Flyrs konkursbo, herunder trafikkrettigheter og slotallokering. Sammenslutningen ble godkjent i fase 1 da Wideroe og Flyr i begrenset grad hadde overlappende ruter.",
    full_text: "Konkurransetilsynet behandlet Wideroe AS' erverv av eiendeler fra Flyr AS' konkursbo. Wideroe er Norges storste regionale flyselskap med hovedfokus pa kortbanenettet (STOL-ruter) og enkelte kommersiell ruter. Flyr var et lavprisselskap som driftet ruter mellom de storste byene i Norge for det gikk konkurs i 2024. Transaksjonen omfattet Flyrs trafikkrettigheter, slotallokering pa Oslo lufthavn Gardermoen og Bergen lufthavn Flesland, samt merkevarerettigheter. Konkurransetilsynets analyse: (1) Rutenettverk — Wideroe opererer primaert pa kortbanenettet i Nord-Norge og Vestlandet, mens Flyr drev kommersiell ruter mellom storbyene. De horisontale overlappene var begrenset til et fatall ruter. (2) Konkurransesituasjonen — etter Flyrs konkurs ville rutene uansett falt bort fra markedet. Transaksjonen hadde derfor begrenset konkurransedempende effekt sammenlignet med counterfactual (situasjonen uten transaksjonen). (3) Forbrukerhensyn — tilsynet vurderte at det var positivt for forbrukerne at det kom et nytt tilbud pa ruter som ellers ville mistet konkurranse. Konkurransetilsynet godkjente sammenslutningen i fase 1 uten vilkar.",
    outcome: "cleared_phase1", turnover: 500_000_000,
  },
  {
    case_number: "KT-2024-M-003",
    title: "DNB / Sbanken — oppkjop av nettbank",
    date: "2024-06-20", sector: "financial_services",
    acquiring_party: "DNB ASA", target: "Sbanken ASA",
    summary: "Konkurransetilsynet grep inn mot DNBs oppkjop av Sbanken etter a ha konkludert med at sammenslutningen ville fore til en vesentlig begrensning av konkurransen i markedet for personkundebankjenester i Norge. Vedtaket ble senere opphevet av Konkurranseklagenemnda.",
    full_text: "Konkurransetilsynet behandlet DNB ASAs oppkjop av Sbanken ASA i henhold til konkurranseloven kapittel 4. DNB er Norges storste finanskonsern med en bred portefolje av bankprodukter for privatpersoner og bedrifter. Sbanken (tidligere Skandiabanken) er Norges storste rene nettbank med en sterk posisjon innen fondssparing og personkundebankjenester. Konkurransetilsynets analyse: (1) Markedsavgrensning — tilsynet definerte relevante markeder for personkundebankjenester, herunder innskudd, utlan, boliglan og fondssparing. Sbanken ble ansett som en saerlig viktig utfordrer og innovator i personbankmarkedet. (2) Konkurransepress — Sbanken utovde et betydelig konkurransepress pa de etablerte storbankene (DNB, Nordea, SpareBank 1, Handelsbanken). Sbankens lavkostmodell og digitale innovasjon presset de andre bankene til a senke priser og forbedre sine digitale tjenester. (3) Konklusjon — Konkurransetilsynet konkluderte med at sammenslutningen ville vesentlig begrense konkurransen og vedtok a gripe inn mot oppkjopet. DNB anket vedtaket til Konkurranseklagenemnda, som opphevet Konkurransetilsynets vedtak og tillot oppkjopet. Nemnda la storre vekt pa at andre digitale banker og fintechselskaper kunne erstatte det konkurransepresset Sbanken utovde.",
    outcome: "prohibited", fine_amount: null,
    legal_basis: JSON.stringify(["konkurranseloven paragraf 16"]), status: "overturned_on_appeal",
  },
];

const insertDecision = db.prepare("INSERT OR IGNORE INTO decisions (case_number, title, date, type, sector, parties, summary, full_text, outcome, fine_amount, legal_basis, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
const insertDecisionsAll = db.transaction(() => { for (const d of decisions) { insertDecision.run(d.case_number, d.title, d.date, d.type, d.sector, d.parties, d.summary, d.full_text, d.outcome, d.fine_amount, d.legal_basis, d.status); } });
insertDecisionsAll();
console.log(`Inserted ${decisions.length} decisions`);

interface MergerRow { case_number: string; title: string; date: string; sector: string; acquiring_party: string; target: string; summary: string; full_text: string; outcome: string; turnover: number | null; }

const mergers: MergerRow[] = [
  {
    case_number: "KT-2022-M-001",
    title: "NorgesGruppen / Bunnpris — foretakssammenslutning i dagligvaremarkedet",
    date: "2022-04-25", sector: "grocery",
    acquiring_party: "NorgesGruppen ASA", target: "Bunnpris AS",
    summary: "Konkurransetilsynet vurderte NorgesGruppens oppkjop av Bunnpris og konkluderte med at sammenslutningen ville fore til en vesentlig begrensning av konkurransen i flere lokale dagligvaremarkeder.",
    full_text: "Konkurransetilsynet behandlet NorgesGruppen ASAs erverv av Bunnpris AS i henhold til konkurranseloven kapittel 4. NorgesGruppen er Norges storste dagligvarekonsern med en samlet markedsandel pa om lag 44 prosent. Bunnpris er en uavhengig dagligvarekjede med sterk tilstedevaerelse i Midt-Norge. Sammenslutningen ble godkjent med vilkar om avhending av 12 butikker.",
    outcome: "cleared_with_conditions", turnover: 12_000_000_000,
  },
  {
    case_number: "KT-2023-M-002",
    title: "Statkraft / TronderEnergi — sammenslutning i kraftmarkedet",
    date: "2023-06-12", sector: "energy",
    acquiring_party: "Statkraft AS", target: "TronderEnergi AS (kraftproduksjonsaktiver)",
    summary: "Konkurransetilsynet godkjente Statkrafts erverv av TronderEnergis kraftproduksjonsaktiver. Godkjent i fase 1 uten vilkar.",
    full_text: "Konkurransetilsynet behandlet Statkraft AS' erverv av kraftproduksjonsaktiver fra TronderEnergi AS. De horisontale overlappene var begrenset da selskapene primaert opererer i ulike prisomrader. Godkjent i fase 1 uten vilkar.",
    outcome: "cleared_phase1", turnover: 25_000_000_000,
  },
  {
    case_number: "KT-2023-M-005",
    title: "Telenor / Telia (mobilnett) — sammenslutning i telekommunikasjon",
    date: "2023-10-28", sector: "telecommunications",
    acquiring_party: "Telenor ASA", target: "Telia Norge AS (mobilnettinfrastruktur)",
    summary: "Godkjent med vilkar om nasjonal gjesting for a sikre fortsatt konkurranse i mobilmarkedet i Nord-Norge.",
    full_text: "Konkurransetilsynet behandlet Telenors erverv av deler av Telias mobilnettinfrastruktur i Nord-Norge. Godkjent med vilkar om gjesting i minimum 10 ar.",
    outcome: "cleared_with_conditions", turnover: 18_000_000_000,
  },
  {
    case_number: "KT-2024-M-001",
    title: "Wideroe / Flyr — oppkjop av flyselskap",
    date: "2024-03-15", sector: "transport",
    acquiring_party: "Wideroe AS", target: "Flyr AS (konkursbo)",
    summary: "Godkjent i fase 1 da Wideroe og Flyr i begrenset grad hadde overlappende ruter.",
    full_text: "Konkurransetilsynet godkjente Wideroes erverv av eiendeler fra Flyrs konkursbo. Begrenset horisontalt overlapp. Godkjent i fase 1 uten vilkar.",
    outcome: "cleared_phase1", turnover: 500_000_000,
  },
  {
    case_number: "KT-2024-M-003",
    title: "DNB / Sbanken — oppkjop av nettbank",
    date: "2024-06-20", sector: "financial_services",
    acquiring_party: "DNB ASA", target: "Sbanken ASA",
    summary: "Konkurransetilsynet grep inn mot oppkjopet. Vedtaket ble opphevet av Konkurranseklagenemnda.",
    full_text: "Konkurransetilsynet grep inn mot DNBs oppkjop av Sbanken. Sbanken ble ansett som en viktig utfordrer i personbankmarkedet. Vedtaket ble opphevet pa anke til Konkurranseklagenemnda.",
    outcome: "prohibited", turnover: 16_000_000_000,
  },
];

const insertMerger = db.prepare("INSERT OR IGNORE INTO mergers (case_number, title, date, sector, acquiring_party, target, summary, full_text, outcome, turnover) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
const insertMergersAll = db.transaction(() => { for (const m of mergers) { insertMerger.run(m.case_number, m.title, m.date, m.sector, m.acquiring_party, m.target, m.summary, m.full_text, m.outcome, m.turnover); } });
insertMergersAll();
console.log(`Inserted ${mergers.length} mergers`);

interface GuidelineRow { doc_id: string; title: string; date: string; type: string; summary: string; full_text: string; }

const guidelines: GuidelineRow[] = [
  {
    doc_id: "KT-GL-2023-001",
    title: "Veileder om foretakssammenslutninger — melding og saksbehandling",
    date: "2023-01-15", type: "guideline",
    summary: "Konkurransetilsynets veileder for melding av foretakssammenslutninger etter konkurranseloven kapittel 4. Beskriver meldeplikten, terskelverdier, saksbehandlingsprosessen og avhjelende tiltak.",
    full_text: "Konkurransetilsynets veileder om foretakssammenslutninger. Kapitlene dekker: (1) Meldeplikt — foretakssammenslutninger skal meldes til Konkurransetilsynet dersom de involverte foretakene har en samlet arlig omsetning i Norge pa over 1 milliard kroner, og minst to av foretakene har en arlig omsetning i Norge pa over 100 millioner kroner. (2) Alminnelig melding — innholdet i meldingen og dokumentasjonskrav. (3) Fullstendig melding — utvidet melding ved mistanke om konkurranseproblemer. (4) Saksbehandlingsprosessen — fase 1 (25 virkedager) og fase 2 (ytterligere 45 virkedager). (5) Avhjelende tiltak — strukturelle og atferdsmessige tiltak for a adressere konkurranseproblemer. (6) Inngrepsvedtak — vilkar for inngrep etter konkurranseloven paragraf 16. Veilederen er basert pa norsk konkurranselovgivning og EOS-rettslige prinsipper. Norge anvender EOS-avtalens konkurranseregler parallelt med den nasjonale konkurranseloven. ESA (EFTAs overvakningsorgan) har eksklusiv kompetanse til a handheve EOS-avtalens konkurranseregler for saker med EOS-dimensjon.",
  },
  {
    doc_id: "KT-MS-2024-001",
    title: "Markedsstudie — konkurransen i markedet for drivstoff og lading av elbiler",
    date: "2024-04-10", type: "market_study",
    summary: "Konkurransetilsynets markedsstudie av konkurransen i drivstoff- og ladeinfrastrukturmarkedene i Norge. Studien analyserer overgangen fra fossilt drivstoff til elektrisk mobilitet og konkurranseforholdene i lademarkedet.",
    full_text: "Konkurransetilsynets markedsstudie av konkurransen i drivstoff- og ladeinfrastrukturmarkedene. Norge har verdens hoyeste andel elbiler, og overgangen fra fossilt drivstoff til elektrisitet endrer konkurransedynamikken i mobilitetsmarkedet. Studien dekker: (1) Drivstoffmarkedet — det norske drivstoffmarkedet domineres av Circle K, Esso (ExxonMobil) og Uno-X. Priskonkurransen folger et mandag-fredag-monster med hoye priser mandag og lave priser fredag. Konkurransetilsynet har tidligere palagt overtredelsesgebyr for prissamarbeid i drivstoffmarkedet. (2) Ladeinfrastruktur — det norske lademarkedet vokser raskt med aktorer som Mer (Statkraft), Recharge, Kempower og Tesla Supercharger. Studien identifiserer etableringsbarrierer knyttet til tilgang til attraktive lokasjoner, nettilknytning og offentlige tilskuddsordninger. (3) Kryss-subsidier — vurdering av om vertikalt integrerte aktorer (som driver bade bensinstasjoner og ladestasjoner) kan bruke kryss-subsidier til a hindre konkurranse i lademarkedet. (4) Forbrukerhensyn — prisgennemsigtighet for ladepunkter, interoperabilitet mellom ladenettverk og tilgang til betalingslosninger. Konkurransetilsynet anbefalte tiltak for a sikre at overgangen til elektrisk mobilitet skjer pa en mate som fremmer konkurranse og forbrukervelferd.",
  },
];

const insertGuideline = db.prepare("INSERT OR IGNORE INTO guidelines (doc_id, title, date, type, summary, full_text) VALUES (?, ?, ?, ?, ?, ?)");
const insertGuidelinesAll = db.transaction(() => { for (const g of guidelines) { insertGuideline.run(g.doc_id, g.title, g.date, g.type, g.summary, g.full_text); } });
insertGuidelinesAll();
console.log(`Inserted ${guidelines.length} guidelines`);

const decisionCount = (db.prepare("SELECT count(*) as cnt FROM decisions").get() as { cnt: number }).cnt;
const mergerCount = (db.prepare("SELECT count(*) as cnt FROM mergers").get() as { cnt: number }).cnt;
const guidelineCount = (db.prepare("SELECT count(*) as cnt FROM guidelines").get() as { cnt: number }).cnt;
const sectorCount = (db.prepare("SELECT count(*) as cnt FROM sectors").get() as { cnt: number }).cnt;
console.log("\nDatabase summary:");
console.log(`  Sectors:     ${sectorCount}`);
console.log(`  Decisions:   ${decisionCount}`);
console.log(`  Mergers:     ${mergerCount}`);
console.log(`  Guidelines:  ${guidelineCount}`);
console.log(`\nDone. Database ready at ${DB_PATH}`);
db.close();
