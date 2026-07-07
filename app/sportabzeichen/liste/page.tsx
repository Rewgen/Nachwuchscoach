"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import type { SportabzeichenEintrag, Teilnehmer } from "@/lib/types";
import { useDaten } from "@/lib/store";
import {
  DSA_GRUPPEN,
  DSA_GRUPPEN_FARBEN,
  DSA_GRUPPEN_NAMEN,
  DSA_KATALOG,
  altersband,
  bestwert,
  bestwertFormat,
  dsaAlter,
  gesamtwertung,
  medailleFuerWert,
  sportabzeichenSettings,
  versucheAnzahl,
} from "@/lib/sportabzeichen";
import { LeererHinweis, primaerKnopf, sekundaerKnopf } from "@/components/ui";

export default function ListeSeite() {
  return (
    <Suspense fallback={null}>
      <Liste />
    </Suspense>
  );
}

type Zeile = { eintrag: SportabzeichenEintrag; teilnehmer: Teilnehmer };

function Liste() {
  const params = useSearchParams();
  const { daten, bereit } = useDaten();
  const jahr = parseInt(params.get("jahr") ?? "", 10) || new Date().getFullYear();
  const modus = params.get("modus") === "live" ? "live" : "leer";
  const settings = sportabzeichenSettings(daten.einstellungen);

  const kinder: Zeile[] = useMemo(() => {
    return daten.sportabzeichen
      .filter((e) => e.jahr === jahr)
      .map((e) => ({
        eintrag: e,
        teilnehmer: daten.teilnehmer.find((t) => t.id === e.teilnehmerId),
      }))
      .filter(
        (x): x is Zeile =>
          x.teilnehmer !== undefined &&
          !!x.teilnehmer.geschlecht &&
          dsaAlter(x.teilnehmer, jahr) !== null
      )
      .sort(
        (a, b) =>
          (a.eintrag.startNr ?? 999) - (b.eintrag.startNr ?? 999) ||
          a.teilnehmer.name.localeCompare(b.teilnehmer.name, "de")
      );
  }, [daten.sportabzeichen, daten.teilnehmer, jahr]);

  if (!bereit) return null;

  const kopfzeile = `${settings.verein}${settings.veranstaltung ? " · " + settings.veranstaltung : ""}${
    settings.datum ? " · " + settings.datum : ""
  } · ${jahr}`;

  return (
    <div>
      <style>{listeCss()}</style>

      <div className="print-verbergen mb-4">
        <Link
          href={`/sportabzeichen?jahr=${jahr}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft size={15} />
          Sportabzeichen
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            {modus === "leer" ? "Prüfer-Notizzettel" : "Ergebnisliste"} {jahr}
          </h1>
          <span className="text-sm text-slate-500">
            {kinder.length} Kinder · Druck im Querformat
          </span>
          <span className="flex-1" />
          <Link
            href={`/sportabzeichen/liste?jahr=${jahr}&modus=${modus === "leer" ? "live" : "leer"}`}
            className={sekundaerKnopf}
          >
            {modus === "leer" ? "Zur Ergebnisliste" : "Zum Notizzettel"}
          </Link>
          <button type="button" onClick={() => window.print()} className={primaerKnopf}>
            <Printer size={15} />
            Drucken
          </button>
        </div>
      </div>

      {kinder.length === 0 ? (
        <LeererHinweis
          titel="Keine Kinder gemeldet"
          text={`Für ${jahr} sind noch keine Teilnehmer fürs Sportabzeichen gemeldet.`}
        />
      ) : modus === "leer" ? (
        <NotizzettelDruck kinder={kinder} jahr={jahr} kopfzeile={kopfzeile} />
      ) : (
        <ErgebnisDruck kinder={kinder} jahr={jahr} kopfzeile={kopfzeile} />
      )}
    </div>
  );
}

/** Leere Notizzettel für die Prüfer: 7 Kinder pro Seite, Kästchen zum Eintragen. */
function NotizzettelDruck({
  kinder,
  jahr,
  kopfzeile,
}: {
  kinder: Zeile[];
  jahr: number;
  kopfzeile: string;
}) {
  const proSeite = 7;
  const seiten = Math.max(1, Math.ceil(kinder.length / proSeite));

  return (
    <div className="pab-liste">
      {Array.from({ length: seiten }).map((_, seite) => {
        const abschnitt = kinder.slice(seite * proSeite, (seite + 1) * proSeite);
        return (
          <div key={seite} className="pgsheet">
            <div className="pg-head">
              <span>
                <b>{kopfzeile}</b>
              </span>
              <span>
                Prüfer-Notizzettel · Seite {seite + 1}/{seiten} · Zeit: kleiner = besser ·
                Weite/Punkte: größer = besser
              </span>
            </div>
            <table className="pab">
              <thead>
                <tr>
                  <th className="nr">#</th>
                  <th className="who">Name / AK</th>
                  {DSA_GRUPPEN.map((g) => (
                    <th key={g}>{DSA_GRUPPEN_NAMEN[g]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: proSeite }).map((_, zeile) => {
                  const kind = abschnitt[zeile];
                  const nr = seite * proSeite + zeile + 1;
                  if (!kind) {
                    return (
                      <tr key={zeile}>
                        <td className="nr">{nr}</td>
                        <td className="who">
                          <span className="nmw">&nbsp;</span>
                          <span className="akw">AK ____</span>
                        </td>
                        {DSA_GRUPPEN.map((g) => (
                          <td key={g}>
                            <div className="pcell">
                              <div className="pex">&nbsp;</div>
                              <div className="pth">&nbsp;</div>
                              <div className="pboxes">
                                <span className="pbox" />
                                <span className="pbox" />
                                <span className="pbox" />
                              </div>
                              <MedaillenAnkreuzen />
                            </div>
                          </td>
                        ))}
                      </tr>
                    );
                  }
                  const geschlecht = kind.teilnehmer.geschlecht!;
                  const band = altersband(dsaAlter(kind.teilnehmer, jahr)!);
                  return (
                    <tr key={zeile}>
                      <td className="nr">{kind.eintrag.startNr ?? nr}</td>
                      <td className="who">
                        <span className="nmw">{kind.teilnehmer.name}</span>
                        <span className="akw">
                          {geschlecht === "m" ? "Junge" : "Mädchen"} · AK {band}
                        </span>
                      </td>
                      {DSA_GRUPPEN.map((g) => {
                        const disziplin = DSA_KATALOG[geschlecht][band][g];
                        const anzahl = versucheAnzahl(disziplin);
                        const istZone = disziplin.einheit === "Pkt.";
                        return (
                          <td key={g}>
                            <div className="pcell">
                              <div className="pex">
                                {DSA_GRUPPEN_NAMEN[g]}{" "}
                                <span className="pu">
                                  {disziplin.label.replace(/^\w+ /, "")} ({disziplin.einheit})
                                </span>
                              </div>
                              <div className="pth">
                                Ziel: B {disziplin.werte[0]} · S {disziplin.werte[1]} · G{" "}
                                {disziplin.werte[2]}
                                {istZone ? " · beste 3 von 4" : ""}
                              </div>
                              <div className={`pboxes${istZone ? " zone" : ""}`}>
                                {Array.from({ length: anzahl }).map((_, i) => (
                                  <span key={i} className="pbox" />
                                ))}
                                {istZone && (
                                  <>
                                    <span className="peq">=</span>
                                    <span className="pbox sum" />
                                  </>
                                )}
                              </div>
                              <MedaillenAnkreuzen />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

function MedaillenAnkreuzen() {
  return (
    <div className="ptick">
      <span className="b1" />
      Bronze&nbsp;&nbsp;<span className="b1" />
      Silber&nbsp;&nbsp;<span className="b1" />
      Gold
    </div>
  );
}

/** Ergebnisliste mit eingetragenen Versuchen, Bestwerten und Medaillen. */
function ErgebnisDruck({
  kinder,
  jahr,
  kopfzeile,
}: {
  kinder: Zeile[];
  jahr: number;
  kopfzeile: string;
}) {
  return (
    <div className="erg">
      <div className="pg-head">
        <span>
          <b>{kopfzeile}</b>
        </span>
        <span>
          Bronze 1 · Silber 2 · Gold 3 — Gesamt: 4–7 Bronze · 8–10 Silber · 11–12 Gold
        </span>
      </div>
      <table className="ergt">
        <thead>
          <tr>
            <th>Nr</th>
            <th className="l">Name</th>
            <th>m/w</th>
            <th>AK</th>
            {DSA_GRUPPEN.map((g) => (
              <th key={g} style={{ background: DSA_GRUPPEN_FARBEN[g] }}>
                {DSA_GRUPPEN_NAMEN[g]}
              </th>
            ))}
            <th>🏊</th>
            <th>Gesamt</th>
          </tr>
        </thead>
        <tbody>
          {kinder.map(({ eintrag, teilnehmer }) => {
            const geschlecht = teilnehmer.geschlecht!;
            const band = altersband(dsaAlter(teilnehmer, jahr)!);
            const wertung = gesamtwertung(geschlecht, band, eintrag);
            return (
              <tr key={teilnehmer.id}>
                <td>{eintrag.startNr ?? ""}</td>
                <td className="l nm">{teilnehmer.name}</td>
                <td>{geschlecht}</td>
                <td>
                  <b>{band}</b>
                </td>
                {DSA_GRUPPEN.map((g) => {
                  const disziplin = DSA_KATALOG[geschlecht][band][g];
                  const best = bestwert(disziplin, eintrag.versuche[g]);
                  const medaille = medailleFuerWert(disziplin, best);
                  const versuche = eintrag.versuche[g].filter((v) => v?.trim()).join(" / ");
                  return (
                    <td key={g}>
                      <span className="vers">{versuche || "—"}</span>
                      <br />
                      Best: <b>{bestwertFormat(disziplin, best)}</b>{" "}
                      <span className={`med med-${medaille ?? "leer"}`}>
                        {medaille === "gold"
                          ? "G"
                          : medaille === "silber"
                            ? "S"
                            : medaille === "bronze"
                              ? "B"
                              : "–"}
                      </span>
                    </td>
                  );
                })}
                <td>{eintrag.schwimmnachweis ? "ja" : "–"}</td>
                <td>
                  {wertung.fertig ? (
                    <b className={`ges ges-${wertung.abzeichen}`}>
                      {wertung.abzeichen.toUpperCase()} · {wertung.punkte} Pkt.
                    </b>
                  ) : (
                    <span className="offen">offen ({wertung.punkte} Pkt.)</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function listeCss(): string {
  return `
  .pg-head{display:flex;justify-content:space-between;align-items:baseline;margin:0 0 8px;font-size:12px;color:#334155}
  .pg-head b{font-size:14px;color:#0f172a}
  .pgsheet{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin-bottom:16px}
  table.pab{width:100%;border-collapse:collapse;table-layout:fixed}
  table.pab th,table.pab td{border:1px solid #333;padding:3px 6px;vertical-align:top}
  table.pab thead th{background:#eef2f7;font-size:11.5px;text-transform:uppercase}
  table.pab .nr{width:24px;text-align:center;font-weight:800;font-size:12px}
  table.pab .who{width:120px}
  table.pab td.who .nmw{font-weight:800;font-size:14px;border-bottom:1px solid #999;min-height:20px;display:block;margin-bottom:3px}
  table.pab td.who .akw{font-size:11px;color:#333}
  .pcell{display:flex;flex-direction:column;gap:2px}
  .pcell .pex{font-weight:800;font-size:10.5px;line-height:1.25;white-space:nowrap;overflow:hidden}
  .pcell .pu{color:#555;font-weight:600;font-size:9.5px}
  .pcell .pth{font-size:9.5px;color:#333;white-space:nowrap;overflow:hidden}
  .pboxes{min-height:24px;display:flex;gap:4px;align-items:center}
  .pbox{width:48px;height:22px;border:1.4px solid #666;border-radius:5px;flex:0 0 auto;display:inline-block}
  .pboxes.zone .pbox{width:27px}
  .pbox.sum{width:33px;border-color:#6366f1;border-width:1.8px}
  .peq{font-weight:900}
  .ptick{font-size:11px}
  .ptick .b1{border:1.5px solid #333;display:inline-block;width:13px;height:13px;vertical-align:-2px;margin-right:3px;border-radius:3px}
  /* Ergebnisliste */
  .erg{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:14px}
  table.ergt{width:100%;border-collapse:collapse;font-size:12px}
  table.ergt th,table.ergt td{border:1px solid #cbd5e1;padding:4px 6px;text-align:center;vertical-align:middle}
  table.ergt thead th{background:#0f172a;color:#fff;font-size:10.5px;text-transform:uppercase;padding:6px 5px}
  table.ergt .l{text-align:left}
  table.ergt td.nm{font-weight:600;white-space:nowrap}
  table.ergt .vers{color:#64748b;font-size:11px}
  .med{display:inline-block;min-width:16px;padding:0 5px;border-radius:8px;font-size:10.5px;font-weight:800;color:#fff}
  .med-bronze{background:#cd7f32}.med-silber{background:#9aa0a6}.med-gold{background:#e0a800;color:#4a3a00}
  .med-keine,.med-leer{background:#e2e8f0;color:#94a3b8}
  .ges-bronze{color:#a05a1f}.ges-silber{color:#64748b}.ges-gold{color:#a16207}
  .offen{color:#94a3b8}
  @media print{
    @page{size:A4 landscape;margin:8mm}
    *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .pgsheet{border:none;border-radius:0;padding:0;margin:0;page-break-after:always}
    .pgsheet:last-child{page-break-after:auto}
    .erg{border:none;border-radius:0;padding:0}
    table.ergt{font-size:10px}
    table.ergt th,table.ergt td{padding:2.5px 4px}
  }`;
}
