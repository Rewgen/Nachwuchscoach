"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import type { DsaGruppe, SportabzeichenEintrag, Teilnehmer } from "@/lib/types";
import { useDaten } from "@/lib/store";
import {
  DSA_GRUPPEN_NAMEN,
  DSA_KATALOG,
  DSA_ZONEN,
  altersband,
  dsaAlter,
  einheitLabel,
  istJung,
  sportabzeichenSettings,
  versucheAnzahl,
  type DsaAltersband,
} from "@/lib/sportabzeichen";
import { LeererHinweis, primaerKnopf, sekundaerKnopf } from "@/components/ui";

export default function LaufzettelSeite() {
  return (
    <Suspense fallback={null}>
      <Laufzettel />
    </Suspense>
  );
}

const GRUPPEN_EMOJI: Record<DsaGruppe, string> = {
  schnell: "💨",
  ausdauer: "🏃",
  kraft: "🥎",
  koord: "🦘",
};

const GRUPPEN_REIHENFOLGE: DsaGruppe[] = ["schnell", "ausdauer", "kraft", "koord"];

/** Farbe abdunkeln (für den Verlauf im Kopf). */
function abdunkeln(hex: string, betrag: number): string {
  const n = parseInt(hex.slice(1), 16);
  const kanal = (wert: number) => Math.max(0, Math.min(255, wert - betrag));
  const r = kanal((n >> 16) & 255);
  const g = kanal((n >> 8) & 255);
  const b = kanal(n & 255);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function Laufzettel() {
  const params = useSearchParams();
  const { daten, bereit } = useDaten();
  const jahr = parseInt(params.get("jahr") ?? "", 10) || new Date().getFullYear();
  const [rueckseite, setRueckseite] = useState(true);
  const [zonentabelle, setZonentabelle] = useState(true);

  const settings = sportabzeichenSettings(daten.einstellungen);

  const kinder = useMemo(() => {
    return daten.sportabzeichen
      .filter((e) => e.jahr === jahr)
      .map((e) => ({
        eintrag: e,
        teilnehmer: daten.teilnehmer.find((t) => t.id === e.teilnehmerId),
      }))
      .filter(
        (x): x is { eintrag: SportabzeichenEintrag; teilnehmer: Teilnehmer } =>
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

  return (
    <div>
      <style>{laufzettelCss(settings.farbe, abdunkeln(settings.farbe, 40))}</style>

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
            Laufzettel {jahr}
          </h1>
          <span className="text-sm text-slate-500">
            {kinder.length} Kinder · Querformat, ein Zettel pro Kind
          </span>
          <span className="flex-1" />
          <label className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={rueckseite}
              onChange={(e) => setRueckseite(e.target.checked)}
              className="h-4 w-4 accent-sky-700"
            />
            Rückseite (Info) mitdrucken
          </label>
          <label className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={zonentabelle}
              onChange={(e) => setZonentabelle(e.target.checked)}
              className="h-4 w-4 accent-sky-700"
            />
            Zonenweitsprung-Tabelle
          </label>
          <button type="button" onClick={() => window.print()} className={primaerKnopf}>
            <Printer size={15} />
            Drucken (Querformat)
          </button>
        </div>
      </div>

      {kinder.length === 0 ? (
        <LeererHinweis
          titel="Keine Kinder gemeldet"
          text={`Für ${jahr} sind noch keine Teilnehmer fürs Sportabzeichen gemeldet.`}
        >
          <Link href={`/sportabzeichen?jahr=${jahr}`} className={sekundaerKnopf}>
            Teilnahme verwalten
          </Link>
        </LeererHinweis>
      ) : (
        <div className="lz-liste">
          {kinder.map(({ eintrag, teilnehmer }) => {
            const alter = dsaAlter(teilnehmer, jahr)!;
            const band = altersband(alter);
            return (
              <div key={teilnehmer.id}>
                <Vorderseite
                  teilnehmer={teilnehmer}
                  eintrag={eintrag}
                  band={band}
                  jahr={jahr}
                  verein={settings.verein}
                  veranstaltung={settings.veranstaltung}
                  datum={settings.datum}
                  duplex={rueckseite}
                />
                {rueckseite && <Rueckseite band={band} zonentabelle={zonentabelle} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Vorderseite({
  teilnehmer,
  eintrag,
  band,
  jahr,
  verein,
  veranstaltung,
  datum,
  duplex,
}: {
  teilnehmer: Teilnehmer;
  eintrag: SportabzeichenEintrag;
  band: DsaAltersband;
  jahr: number;
  verein: string;
  veranstaltung: string;
  datum: string;
  duplex: boolean;
}) {
  const geschlecht = teilnehmer.geschlecht!;
  return (
    <div className="lz-page lz-front">
      <div className="lz-top">
        <span className="big">🏅 Mein Sportabzeichen</span>
        <span className="meta">
          {verein}
          {veranstaltung ? ` · ${veranstaltung}` : ""}
          <br />
          {datum || jahr}
        </span>
      </div>
      <div className="lz-body">
        <div className="kidline">
          <span className="nm">{teilnehmer.name}</span>
          <span className="bits">
            {geschlecht === "m" ? "Junge" : "Mädchen"} · Altersklasse {band}
          </span>
          <span className="snr">Start-Nr. {eintrag.startNr ?? "—"}</span>
        </div>
        <div className="wichtig">
          <span className="ic">⭐</span>
          <div>
            <b>Wichtig!</b> Du brauchst in jeder Disziplin mindestens einen Punkt. Trage
            deine Versuche ein – der beste zählt! Beim Zonenweitsprung zählt die Summe
            deiner besten 3 Sprünge.
          </div>
        </div>
        <table className="kz">
          <thead>
            <tr>
              <th className="l">Disziplin</th>
              <th>🥉 Bronze</th>
              <th>🥈 Silber</th>
              <th>🥇 Gold</th>
              <th>Deine Versuche</th>
              <th>Erreicht (ankreuzen)</th>
            </tr>
          </thead>
          <tbody>
            {GRUPPEN_REIHENFOLGE.map((g) => {
              const disziplin = DSA_KATALOG[geschlecht][band][g];
              const anzahl = versucheAnzahl(disziplin);
              return (
                <tr key={g} className={`row-${g}`}>
                  <td className="disz">
                    <span className="grp">{DSA_GRUPPEN_NAMEN[g]}</span>
                    <span className="exline">
                      <span className="em">{GRUPPEN_EMOJI[g]}</span>
                      {disziplin.label}
                    </span>
                  </td>
                  {disziplin.werte.map((wert, i) => (
                    <td key={i} className={`val ${["bz", "si", "go"][i]}`}>
                      <b>{wert}</b>
                      <br />
                      <span className="hint">{einheitLabel(disziplin.einheit)}</span>
                    </td>
                  ))}
                  <td>
                    <div className="attempts">
                      {Array.from({ length: anzahl }).map((_, i) => (
                        <span key={i} className="abox" />
                      ))}
                      {disziplin.einheit === "Pkt." && (
                        <>
                          <span className="sumeq">=</span>
                          <span className="abox sum" />
                          <span className="sublab">
                            Summe
                            <br />
                            beste 3
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="last">
                    <div className="medchecks">
                      <span className="bz">
                        <span className="cb" />
                        🥉 Bronze
                      </span>
                      <span className="si">
                        <span className="cb" />
                        🥈 Silber
                      </span>
                      <span className="go">
                        <span className="cb" />
                        🥇 Gold
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="lz-foot">
          <span className="box">Punkte gesamt: ____ / 12</span>
          <span className="box">Bestanden ⬜</span>
          <span className="box">Schwimmnachweis ⬜</span>
          {duplex && <span className="flip">Dreh mich um! →</span>}
        </div>
        <div className="badge-result">
          <span className="lbl">🏅 Dein Abzeichen:</span>
          <span className="bchip bronze">
            <span className="cb" />
            🥉 Bronze
          </span>
          <span className="bchip silber">
            <span className="cb" />
            🥈 Silber
          </span>
          <span className="bchip gold">
            <span className="cb" />
            🥇 Gold
          </span>
        </div>
      </div>
    </div>
  );
}

function Rueckseite({
  band,
  zonentabelle,
}: {
  band: DsaAltersband;
  zonentabelle: boolean;
}) {
  const jung = istJung(band);
  return (
    <div className="lz-page lz-back">
      <div className="back-sheet">
        <div className="back-top">
          <div className="back-title">🏅 Was ist das Deutsche Sportabzeichen?</div>
          <div className="back-intro">
            Das Sportabzeichen zeigt, wie fit und vielseitig du bist: wie gut du springen,
            laufen, werfen und sprinten kannst – also wie stark, schnell, ausdauernd und
            geschickt du bist.
          </div>
          <div className="top-cols">
            <div className="tc">
              <div className="info-sub">
                Du wirst in vier Disziplinen bewertet – in jeder machst du eine Übung:
              </div>
              <div className="ueb-list">
                <span>Ausdauer</span>
                <span>Kraft</span>
                <span>Koordination</span>
                <span>Schnelligkeit</span>
              </div>
              <div className="funfacts">
                <div className="ff-h">🌟 Wusstest du schon?</div>
                <div className="ff">
                  <span className="ff-s">⭐</span>
                  <span>Polizei, Feuerwehr &amp; Bundeswehr verlangen oft das Sportabzeichen.</span>
                </div>
                <div className="ff">
                  <span className="ff-s">⭐</span>
                  <span>Sogar Menschen über 90 Jahre machen noch mit!</span>
                </div>
                <div className="ff">
                  <span className="ff-s">⭐</span>
                  <span>Es gibt das Deutsche Sportabzeichen schon seit 1913 – über 110 Jahre!</span>
                </div>
              </div>
            </div>
            <div className="tc">
              <div className="med-je">
                <div className="mh">Für jede Übung bekommst du Punkte:</div>
                <div className="mchips">
                  <span className="mchip bronze">🥉 Bronze = 1</span>
                  <span className="mchip silber">🥈 Silber = 2</span>
                  <span className="mchip gold">🥇 Gold = 3</span>
                </div>
              </div>
              <div className="med-ges">
                <div className="mh">Alle 4 Übungen zusammen ergeben dein Abzeichen:</div>
                <div className="gges">
                  <span>
                    4–7 Punkte
                    <br />
                    <b>🥉 Bronze</b>
                  </span>
                  <span>
                    8–10 Punkte
                    <br />
                    <b>🥈 Silber</b>
                  </span>
                  <span>
                    11–12 Punkte
                    <br />
                    <b>🥇 Gold</b>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="must-note">
            ❗ <b>Wichtig:</b> In <b>jeder</b> der vier Disziplinen brauchst du mindestens{" "}
            <b>1 Punkt</b> (Bronze) – sonst gibt es kein Sportabzeichen.
          </div>
        </div>
        <div className="half-div" />
        <div className="back-bottom">
          {jung && (
            <>
              <div className="zone-title">Besonderheit für 6–9 Jahre: Zonenweitsprung</div>
              <div className="zone-txt">
                Beim Springen wird nicht in Metern gemessen, sondern mit <b>Zonen</b> in der
                Sandgrube. Jede Zone ist <b>25&#8239;cm</b> breit und bringt Punkte – je
                weiter du springst, desto mehr! Du hast <b>4 Versuche</b>; die Punkte deiner{" "}
                <b>besten 3</b> Sprünge zählen zusammen. Gemessen wird ab dem Absprung.
              </div>
              {zonentabelle && (
                <table className="zone">
                  <tbody>
                    <tr>
                      <th>Weite ab Absprung (m)</th>
                      {DSA_ZONEN.map((z) => (
                        <td key={z[1]}>{z[0].replace("über ", ">").replace(" m", "")}</td>
                      ))}
                    </tr>
                    <tr>
                      <th>Punkte</th>
                      {DSA_ZONEN.map((z) => (
                        <td key={z[1]} className="p">
                          {z[1]}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Druck-CSS des Laufzettels (aus der bewährten Vorlage übernommen und angepasst). */
function laufzettelCss(akzent: string, akzentDunkel: string): string {
  return `
  .lz-liste{display:flex;flex-direction:column;gap:16px;
    --lz-accent:${akzent};--lz-accent-dark:${akzentDunkel};
    --lz-bronze:#cd7f32;--lz-silber:#9aa0a6;--lz-gold:#e0a800;
    --lz-schnell:#ef4444;--lz-ausdauer:#10b981;--lz-kraft:#f59e0b;--lz-koord:#6366f1}
  .lz-page{background:#fff;border-radius:12px;border:2px solid #dfe3ea;overflow:hidden;margin-bottom:16px}
  .lz-front{border-color:var(--lz-accent)}
  .lz-top{background:linear-gradient(120deg,var(--lz-accent),var(--lz-accent-dark));color:#fff;padding:12px 20px;display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px}
  .lz-top .big{font-size:24px;font-weight:900}
  .lz-top .meta{margin-left:auto;text-align:right;font-size:13px;opacity:.95}
  .lz-body{padding:14px 20px 16px}
  .kidline{display:flex;flex-wrap:wrap;gap:8px 22px;align-items:baseline;margin-bottom:10px}
  .kidline .nm{font-size:28px;font-weight:900}
  .kidline .bits{color:#475063;font-size:16px;font-weight:600}
  .kidline .snr{margin-left:auto;background:#fff3cd;border:2px dashed #e0a800;border-radius:10px;padding:5px 14px;font-weight:800;color:#7a5b00}
  .wichtig{display:flex;gap:10px;align-items:flex-start;background:#fff7ed;border:1.5px solid #fed7aa;border-radius:10px;padding:8px 12px;margin-bottom:12px;font-size:14px}
  .wichtig .ic{font-size:20px}
  table.kz{width:100%;border-collapse:separate;border-spacing:0 8px}
  table.kz th{font-size:11.5px;text-transform:uppercase;letter-spacing:.03em;color:#5b6270;padding:0 8px;text-align:center}
  table.kz th.l{text-align:left}
  table.kz td{background:#fff;padding:9px 8px;text-align:center;border-top:2px solid #eef0f4;border-bottom:2px solid #eef0f4;font-size:15px}
  table.kz td.disz{text-align:left;border-left:8px solid #ccc;border-top-left-radius:10px;border-bottom-left-radius:10px;min-width:210px}
  table.kz td.disz .grp{display:block;font-size:18px;font-weight:900}
  table.kz td.disz .exline{display:block;margin-top:2px;font-weight:600;color:#5b6270;font-size:13px}
  table.kz td.disz .exline .em{font-size:18px;margin-right:6px;vertical-align:-2px}
  table.kz td.val b{font-size:17px}
  table.kz td.val .hint{color:#6b7280;font-size:11px}
  table.kz td.last{border-top-right-radius:10px;border-bottom-right-radius:10px}
  .bz{color:var(--lz-bronze)}.si{color:#8a9098}.go{color:#b98900}
  .attempts{display:flex;gap:6px;justify-content:center;align-items:center;flex-wrap:wrap}
  .abox{width:52px;height:30px;border:1.5px solid #cfd4dc;border-radius:6px;background:#fbfcfe;display:inline-block}
  .abox.sum{width:60px;border-color:var(--lz-koord);background:#f5f6ff}
  .sumeq{font-weight:900;color:#6b7280}
  .sublab{font-size:10px;color:#6b7280;line-height:1.05}
  .medchecks{display:flex;flex-direction:row;flex-wrap:nowrap;gap:12px;align-items:center;font-size:12.5px;font-weight:700}
  .medchecks span{white-space:nowrap}
  .medchecks .cb{display:inline-block;width:15px;height:15px;border:1.6px solid #9aa1ac;border-radius:4px;vertical-align:-3px;margin-right:5px}
  .row-schnell td.disz{border-left-color:var(--lz-schnell)}
  .row-ausdauer td.disz{border-left-color:var(--lz-ausdauer)}
  .row-kraft td.disz{border-left-color:var(--lz-kraft)}
  .row-koord td.disz{border-left-color:var(--lz-koord)}
  .lz-foot{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;margin-top:10px;font-size:14px}
  .lz-foot .box{border:1.5px solid #d7dbe2;border-radius:8px;padding:6px 12px;font-weight:700}
  .flip{margin-left:auto;color:var(--lz-accent);font-weight:800}
  .badge-result{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:12px;padding-top:12px;border-top:2px dashed #e5e7eb}
  .badge-result .lbl{font-weight:900;font-size:16px}
  .bchip{display:inline-flex;align-items:center;gap:7px;border:3px solid;border-radius:12px;padding:8px 16px;font-weight:900;font-size:16px}
  .bchip .cb{display:inline-block;width:16px;height:16px;border:2px solid currentColor;border-radius:5px}
  .bchip.bronze{border-color:var(--lz-bronze);color:#8a5a20;background:#fbf1e6}
  .bchip.silber{border-color:#9aa0a6;color:#565b62;background:#f2f3f5}
  .bchip.gold{border-color:var(--lz-gold);color:#8a6d00;background:#fff8e1}
  /* Rückseite */
  .lz-back{border-color:var(--lz-koord)}
  .back-sheet{display:flex;flex-direction:column;padding:16px 22px}
  .back-title{font-size:22px;font-weight:900;margin-bottom:4px}
  .back-intro{font-size:14px;color:#3b4150;margin:0 0 10px}
  .top-cols{display:flex;gap:22px;align-items:flex-start}
  .top-cols .tc{flex:1}
  .info-sub{font-size:16px;font-weight:800;margin:10px 0 6px;color:var(--lz-accent-dark)}
  .ueb-list{display:flex;flex-direction:column;gap:5px;margin-bottom:12px}
  .ueb-list span{background:#f6f8fc;border:1px solid #e5e7eb;border-radius:8px;padding:6px 11px;font-weight:600;font-size:14px}
  .mchip{display:inline-flex;align-items:center;gap:6px;border:2px solid;border-radius:10px;padding:6px 12px;font-weight:800;font-size:14px}
  .mchip.bronze{border-color:var(--lz-bronze);color:#8a5a20;background:#fbf1e6}
  .mchip.silber{border-color:#9aa0a6;color:#565b62;background:#f2f3f5}
  .mchip.gold{border-color:var(--lz-gold);color:#8a6d00;background:#fff8e1}
  .med-je{background:#eaeef5;border:1.5px solid #d3dae6;border-radius:10px;padding:10px 12px;margin-bottom:12px}
  .med-je .mh{font-weight:800;font-size:14px;margin-bottom:7px}
  .med-je .mchips{display:flex;gap:8px;flex-wrap:wrap}
  .med-ges{background:linear-gradient(120deg,#fff6db,#ffe9b8);border:2.5px solid var(--lz-gold);border-radius:10px;padding:10px 12px}
  .med-ges .mh{font-weight:800;font-size:14px;margin-bottom:8px}
  .med-ges .gges{display:flex;gap:8px}
  .med-ges .gges span{flex:1;background:#fff;border:1px solid #ecdcae;border-radius:8px;padding:8px 6px;text-align:center;font-size:13px;line-height:1.3}
  .med-ges .gges b{font-size:15px}
  .half-div{border-top:2px dashed #cfd6e2;margin:12px 0}
  .must-note{background:#fff7ed;border:1.5px solid #fed7aa;border-radius:8px;padding:7px 12px;font-size:14px;font-weight:600;margin-top:8px}
  .zone-title{font-size:18px;font-weight:800;color:var(--lz-koord);margin-bottom:6px}
  .zone-txt{font-size:13.5px;line-height:1.4;margin-bottom:8px}
  table.zone{width:100%;border-collapse:collapse;margin-top:4px;font-size:11px}
  table.zone th,table.zone td{border:1px solid #c7d2fe;padding:3px 5px;text-align:center;white-space:nowrap}
  table.zone th{background:#e0e7ff;font-weight:800;text-align:left}
  table.zone td.p{font-weight:800;color:var(--lz-koord)}
  .funfacts{margin-top:10px;background:#fffdf3;border:1.5px solid #f3e2a8;border-radius:10px;padding:9px 12px}
  .funfacts .ff-h{font-size:16px;font-weight:900;margin-bottom:6px}
  .funfacts .ff{display:flex;gap:6px;margin:4px 0;font-size:13.5px;align-items:flex-start}
  .funfacts .ff-s{flex:0 0 auto}
  @media print{
    @page{size:A4 landscape;margin:8mm}
    *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .lz-liste{gap:0;display:block}
    .lz-page{break-inside:avoid;page-break-after:always;border-width:2px;height:192mm;overflow:hidden;margin-bottom:0;border-radius:12px}
    .lz-top{padding:7px 16px}
    .lz-top .big{font-size:19px}
    .lz-body{padding:9px 16px}
    .kidline{margin-bottom:6px}
    .kidline .nm{font-size:21px}
    .kidline .bits{font-size:14px}
    .wichtig{padding:6px 10px;font-size:11.5px;margin-bottom:7px}
    table.kz{border-spacing:0 5px}
    table.kz td{padding:5px 7px;font-size:13px}
    table.kz td.disz{min-width:180px}
    table.kz td.disz .grp{font-size:15px}
    table.kz td.disz .exline{font-size:11.5px}
    table.kz td.val b{font-size:15px}
    .abox{width:44px;height:24px}
    .medchecks{font-size:11.5px;gap:9px}
    .lz-foot{font-size:12px;margin-top:8px}
    .badge-result{margin-top:8px;padding-top:8px}
    .badge-result .lbl{font-size:15px}
    .bchip{padding:6px 12px;font-size:14px}
    .back-sheet{padding:9mm 12mm}
    .back-title{font-size:19px}
    .back-intro{font-size:12.5px;margin-bottom:8px}
    .info-sub{font-size:14px;margin:2px 0 5px}
    .ueb-list span{font-size:12.5px;padding:5px 9px}
    .mchip{font-size:12.5px;padding:5px 10px}
    .med-je,.med-ges{padding:8px 10px;margin-bottom:8px}
    table.zone{font-size:9.5px}
    table.zone th,table.zone td{padding:2px 3px}
    .must-note{font-size:12.5px;padding:6px 10px}
    .funfacts{font-size:12px;padding:8px 11px}
    .funfacts .ff-h{font-size:14px}
  }`;
}
