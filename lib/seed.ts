import type { Uebung } from "./types";

// Startbestand der Übungsdatenbank: praxiserprobte Übungen und Spiele für die
// Kinderleichtathletik. Alle Übungen lassen sich in der App bearbeiten,
// löschen und durch eigene ergänzen.

const START = "2026-07-06T00:00:00.000Z";

function u(daten: Omit<Uebung, "favorit" | "eigene" | "erstelltAm">): Uebung {
  return { ...daten, favorit: false, eigene: false, erstelltAm: START };
}

export const SEED_UEBUNGEN: Uebung[] = [
  // ============ AUFWÄRMEN ============
  u({
    id: "feuer-wasser-blitz",
    titel: "Feuer, Wasser, Blitz",
    beschreibung:
      "Die Kinder laufen frei durch die Halle oder über den Platz. Auf Kommando führen alle die passende Aktion aus: Bei „Feuer“ in eine Ecke laufen, bei „Wasser“ auf etwas Erhöhtes steigen oder in den Liegestütz, bei „Blitz“ flach auf den Boden legen. Wer als Letztes reagiert, macht eine kleine Zusatzaufgabe (z. B. 3 Hampelmänner).",
    variationen:
      "Eigene Kommandos mit den Kindern erfinden (z. B. „Känguru“ = 5 Sprünge). Fortbewegungsart variieren: Hopserlauf, Rückwärtslaufen, Seitgalopp.",
    abschnitt: "aufwaermen",
    disziplinen: ["koordination"],
    ort: "beides",
    anlagen: [],
    material: [],
    altersVon: 5,
    altersBis: 10,
    gruppeMin: 6,
    gruppeMax: null,
    dauer: 10,
  }),
  u({
    id: "schattenlauf",
    titel: "Schattenlauf",
    beschreibung:
      "Immer zwei Kinder bilden ein Paar. Das vordere Kind läuft frei umher und wechselt Tempo, Richtung und Bewegungsform (Hüpfen, Seitgalopp, Anfersen). Das hintere Kind ist der „Schatten“ und macht alles exakt nach. Nach 1–2 Minuten wird gewechselt.",
    variationen:
      "Dreiergruppen bilden. Trainer gibt Bewegungsformen vor. Als Fangspiel: Auf Pfiff versucht der Schatten, den Vordermann abzuschlagen.",
    abschnitt: "aufwaermen",
    disziplinen: ["koordination"],
    ort: "beides",
    anlagen: [],
    material: [],
    altersVon: 6,
    altersBis: 12,
    gruppeMin: 6,
    gruppeMax: null,
    dauer: 8,
  }),
  u({
    id: "kettenfangen",
    titel: "Kettenfangen",
    beschreibung:
      "Ein Kind beginnt als Fänger. Jedes gefangene Kind fasst den Fänger an der Hand, die Kette wächst. Nur die äußeren Kettenglieder dürfen abschlagen. Gespielt wird in einem begrenzten Feld, damit viel gelaufen wird.",
    variationen:
      "Ab 4 Kindern teilt sich die Kette in Zweierpaare. Mehrere Ketten gleichzeitig starten lassen.",
    abschnitt: "aufwaermen",
    disziplinen: ["ausdauer"],
    ort: "beides",
    anlagen: [],
    material: ["Hütchen"],
    altersVon: 6,
    altersBis: 12,
    gruppeMin: 8,
    gruppeMax: null,
    dauer: 10,
  }),
  u({
    id: "farbenlauf",
    titel: "Farbenlauf",
    beschreibung:
      "In jeder Ecke des Feldes steht ein andersfarbiges Hütchen. Die Kinder traben durcheinander. Ruft der Trainer eine Farbe, sprinten alle zum passenden Hütchen. Die letzten Ankömmlinge bekommen eine kleine Zusatzaufgabe.",
    variationen:
      "Statt Farben Rechenaufgaben stellen (Ergebnis = Anzahl Hütchen). Zwei Farben nacheinander rufen. Fortbewegungsarten vorgeben.",
    abschnitt: "aufwaermen",
    disziplinen: ["sprint"],
    ort: "beides",
    anlagen: [],
    material: ["Hütchen"],
    altersVon: 5,
    altersBis: 10,
    gruppeMin: 6,
    gruppeMax: null,
    dauer: 8,
  }),
  u({
    id: "lauf-abc-parcours",
    titel: "Lauf-ABC-Parcours",
    beschreibung:
      "Auf 15–20 m werden mit Hütchen Bahnen markiert. Die Kinder durchlaufen sie nacheinander mit verschiedenen Aufgaben: Skippings, Anfersen, Hopserlauf, Seitgalopp, Storchengang. Rückweg locker traben. Auf saubere Ausführung achten, lieber kurz und knackig.",
    variationen:
      "Mit Koordinationsleiter kombinieren. Am Ende jeder Bahn einen kurzen Steigerungslauf anhängen.",
    abschnitt: "aufwaermen",
    disziplinen: ["sprint", "koordination"],
    ort: "beides",
    anlagen: [],
    material: ["Hütchen"],
    altersVon: 8,
    altersBis: 14,
    gruppeMin: 4,
    gruppeMax: null,
    dauer: 12,
  }),
  u({
    id: "autos-fahren",
    titel: "Autos fahren",
    beschreibung:
      "Die Kinder „fahren“ als Autos durch das Feld. Der Trainer gibt Kommandos: 1. Gang (Gehen), 2. Gang (Traben), 3. Gang (schnelles Laufen), rote Ampel (Stopp), Rückwärtsgang, Kurve (Richtungswechsel), Hupe (in die Hände klatschen). Schult Reaktion und Tempogefühl.",
    variationen:
      "Ein Kind gibt die Kommandos. Mit Reifen als „Lenkrad“ spielen. Parkplätze (Reifen) einbauen, in die bei „Parken“ eingeparkt wird.",
    abschnitt: "aufwaermen",
    disziplinen: ["koordination"],
    ort: "beides",
    anlagen: [],
    material: [],
    altersVon: 5,
    altersBis: 9,
    gruppeMin: 6,
    gruppeMax: null,
    dauer: 8,
  }),

  // ============ KENNENLERNSPIELE ============
  u({
    id: "namenskreis-mit-ball",
    titel: "Namenskreis mit Ball",
    beschreibung:
      "Alle stehen im Kreis. Ein Ball wird quer durch den Kreis geworfen; vor dem Wurf ruft man den Namen des Kindes, das fangen soll. Wer den Ball hat, wirft weiter. Später zweiten Ball dazunehmen und das Tempo erhöhen.",
    variationen:
      "Reihenfolge merken und immer an dasselbe Kind werfen, dann Zeit stoppen und als Team-Rekord knacken. Rückwärts durch die Reihenfolge werfen.",
    abschnitt: "kennenlernen",
    disziplinen: [],
    ort: "beides",
    anlagen: [],
    material: ["Softbälle"],
    altersVon: 5,
    altersBis: 12,
    gruppeMin: 6,
    gruppeMax: 20,
    dauer: 10,
  }),
  u({
    id: "sortier-challenge",
    titel: "Sortier-Challenge",
    beschreibung:
      "Die Gruppe stellt sich so schnell wie möglich in einer Reihe auf – sortiert nach Vorgabe: Körpergröße, Alter, Vorname im Alphabet, Geburtsmonat. Steigerung: ohne zu sprechen, nur mit Gesten. Danach wird laut kontrolliert, dabei lernen alle die Namen.",
    variationen:
      "Auf einer Langbank oder Linie balancierend sortieren, ohne den Boden zu berühren. Zeit stoppen und den Rekord verbessern.",
    abschnitt: "kennenlernen",
    disziplinen: [],
    ort: "beides",
    anlagen: [],
    material: [],
    altersVon: 6,
    altersBis: 14,
    gruppeMin: 8,
    gruppeMax: null,
    dauer: 8,
  }),

  // ============ HAUPTTEIL: SPRINT ============
  u({
    id: "tag-und-nacht",
    titel: "Tag und Nacht",
    beschreibung:
      "Zwei Teams („Tag“ und „Nacht“) stehen sich in der Feldmitte mit ca. 1,5 m Abstand gegenüber. Ruft der Trainer „Tag!“, jagt das Tag-Team das Nacht-Team bis zu dessen Ziellinie – und umgekehrt. Wer vor der Linie abgeschlagen wird, wechselt das Team. Perfekt für Reaktion und Antritt.",
    variationen:
      "Startpositionen variieren: sitzend, bäuchlings, mit dem Rücken zueinander. Kommandos als Geschichte verpacken („Ta-ta-ta-Tag!“) für maximale Spannung.",
    abschnitt: "hauptteil",
    disziplinen: ["sprint"],
    ort: "beides",
    anlagen: [],
    material: ["Hütchen"],
    altersVon: 6,
    altersBis: 14,
    gruppeMin: 8,
    gruppeMax: null,
    dauer: 15,
  }),
  u({
    id: "startpositionen-wettlauf",
    titel: "Wettläufe aus verschiedenen Startpositionen",
    beschreibung:
      "Sprints über 15–25 m, gestartet aus immer neuen Positionen: im Sitzen, im Schneidersitz, bäuchlings, rücklings, aus dem Vierfüßlerstand, mit Blick nach hinten. Start auf akustisches Signal. Schult Reaktionsfähigkeit und schnelles Aufrichten – die Grundlage für den Tiefstart.",
    variationen:
      "Als Duell: Zwei Kinder starten gleichzeitig, der Sieger rückt eine Bahn weiter („Aufstiegsrunde“). Startsignal variieren: Klatschen, Pfiff, Bewegung des Trainers.",
    abschnitt: "hauptteil",
    disziplinen: ["sprint"],
    ort: "beides",
    anlagen: [],
    material: ["Hütchen"],
    altersVon: 6,
    altersBis: 14,
    gruppeMin: 4,
    gruppeMax: null,
    dauer: 15,
  }),
  u({
    id: "nummernwettlauf",
    titel: "Nummernwettlauf",
    beschreibung:
      "Die Kinder sitzen in 2–4 gleich großen Teams in Reihen. Jedes Kind bekommt eine Nummer. Ruft der Trainer eine Nummer, sprinten die Kinder mit dieser Nummer los, umrunden ein Hütchen und setzen sich zurück auf ihren Platz. Der schnellste Läufer holt einen Punkt für sein Team.",
    variationen:
      "Zwei Nummern gleichzeitig rufen. Rechenaufgaben statt Nummern („3 + 4!“). Laufweg mit Slalom oder Zusatzaufgabe spicken.",
    abschnitt: "hauptteil",
    disziplinen: ["sprint"],
    ort: "beides",
    anlagen: [],
    material: ["Hütchen"],
    altersVon: 6,
    altersBis: 12,
    gruppeMin: 8,
    gruppeMax: null,
    dauer: 15,
  }),
  u({
    id: "fallstart-sprints",
    titel: "Fallstarts",
    beschreibung:
      "Die Kinder stehen aufrecht, Füße geschlossen, und lassen sich wie ein Brett nach vorn fallen. Im letzten Moment fangen sie sich mit einem explosiven ersten Schritt und sprinten 10–15 m. Vermittelt die Vorlage beim Sprintstart ganz ohne Technik-Ansage.",
    variationen:
      "Aus dem Fallstart ein Duell machen: Partner nebeneinander. Mit Steigerungsläufen über 30–40 m kombinieren.",
    abschnitt: "hauptteil",
    disziplinen: ["sprint"],
    ort: "beides",
    anlagen: [],
    material: [],
    altersVon: 8,
    altersBis: 14,
    gruppeMin: 4,
    gruppeMax: null,
    dauer: 10,
  }),
  u({
    id: "huetchen-klau",
    titel: "Hütchen-Klau",
    beschreibung:
      "In der Feldmitte liegen viele kleine Hütchen (oder Bälle). Jedes Team hat eine Ecke mit Reifen als „Schatzkammer“. Auf Signal sprinten die Kinder los und tragen pro Lauf genau einen Schatz in ihre Kammer – auch Klauen bei anderen Teams ist erlaubt! Nach 2–3 Minuten wird gezählt.",
    variationen:
      "Verteidigen verbieten (Standard) oder einen Wächter pro Team erlauben. Schätze weiter weg legen für längere Sprints.",
    abschnitt: "hauptteil",
    disziplinen: ["sprint", "ausdauer"],
    ort: "beides",
    anlagen: [],
    material: ["Hütchen", "Reifen"],
    altersVon: 5,
    altersBis: 11,
    gruppeMin: 8,
    gruppeMax: null,
    dauer: 12,
  }),

  // ============ HAUPTTEIL: SPRUNG ============
  u({
    id: "zonenweitsprung",
    titel: "Zonenweitsprung",
    beschreibung:
      "Vor der Sprunggrube werden Zonen markiert (z. B. alle 20 cm eine Punktzone). Die Kinder springen nach kurzem Anlauf aus einer Absprungzone und sammeln Punkte je nach erreichter Zone. Jeder Versuch zählt, addiert wird im Team oder einzeln – so hat auch der schwächste Springer Erfolgserlebnisse.",
    variationen:
      "Absprung aus einer Zone statt vom Balken nehmen (kein Übertreten möglich). Mit 3 Versuchen als kleinen Wettkampf mit Laufzettel durchführen.",
    abschnitt: "hauptteil",
    disziplinen: ["sprung"],
    ort: "draussen",
    anlagen: ["sprunggrube"],
    material: ["Hütchen", "Maßband"],
    altersVon: 6,
    altersBis: 14,
    gruppeMin: 4,
    gruppeMax: 16,
    dauer: 20,
  }),
  u({
    id: "standweitsprung-addition",
    titel: "Team-Standweitsprung",
    beschreibung:
      "Teams springen eine „Reise“: Das erste Kind macht einen Standweitsprung, das nächste springt von dessen Landepunkt weiter. Welches Team kommt mit einer Runde am weitesten? Braucht keinerlei Anlage und funktioniert auch in der Halle.",
    variationen:
      "Mit Ziellinie: Wie viele Sprünge braucht das Team bis zur Linie? Einbeinig oder rückwärts springen für Fortgeschrittene.",
    abschnitt: "hauptteil",
    disziplinen: ["sprung"],
    ort: "beides",
    anlagen: [],
    material: ["Kreide/Markierband"],
    altersVon: 6,
    altersBis: 12,
    gruppeMin: 6,
    gruppeMax: null,
    dauer: 12,
  }),
  u({
    id: "reifen-sprungparcours",
    titel: "Reifen-Sprungparcours",
    beschreibung:
      "Aus Reifen wird ein Parcours gelegt: beidbeinige Sprünge, Einbeinsprünge links/rechts, weite Sprünge zwischen entfernten Reifen, enge schnelle Frequenzen. Die Kinder durchlaufen den Parcours mehrfach, danach die Reihenfolge umbauen lassen – die Kinder gestalten gerne mit.",
    variationen:
      "Zwei parallele Parcours als Wettkampf. Rhythmen vorgeben (links-links-rechts). Mit Kastendeckel-Absprung am Ende kombinieren.",
    abschnitt: "hauptteil",
    disziplinen: ["sprung", "koordination"],
    ort: "beides",
    anlagen: [],
    material: ["Reifen"],
    altersVon: 5,
    altersBis: 12,
    gruppeMin: 4,
    gruppeMax: 20,
    dauer: 15,
  }),
  u({
    id: "fluss-ueberqueren",
    titel: "Über den Fluss springen",
    beschreibung:
      "Zwei Seile bilden einen „Fluss“, der an einer Seite schmal ist und immer breiter wird. Die Kinder suchen sich eine Stelle und springen mit Anlauf hinüber. Wer trocken landet, traut sich beim nächsten Mal eine breitere Stelle zu. Ideal, um Absprung mit einem Bein und weite Flugphase zu üben.",
    variationen:
      "Im Fluss „Steine“ (Reifen) auslegen, die als Zwischensprung genutzt werden dürfen. Als Fangspiel: das Krokodil (Trainer) darf im Fluss fangen.",
    abschnitt: "hauptteil",
    disziplinen: ["sprung"],
    ort: "beides",
    anlagen: [],
    material: ["Seil/Leine", "Springseile"],
    altersVon: 5,
    altersBis: 11,
    gruppeMin: 4,
    gruppeMax: null,
    dauer: 12,
  }),
  u({
    id: "hoch-hinaus-kartons",
    titel: "Hoch hinaus über Kartons",
    beschreibung:
      "Kastenteile oder stabile Kartons werden zu kleinen Hindernissen aufgebaut, dahinter liegen Matten. Die Kinder springen mit kurzem Anlauf einbeinig ab und landen auf der Matte. Höhe langsam steigern. Spielerische Vorbereitung auf den Hochsprung ohne Latte und ohne Angst.",
    variationen:
      "Absprungzonen markieren. Über eine Zauberschnur statt Kartons springen. Landung auf zwei Füßen bzw. auf dem Po (Richtung Flop) variieren.",
    abschnitt: "hauptteil",
    disziplinen: ["sprung"],
    ort: "drinnen",
    anlagen: [],
    material: ["Kastenteile/Kartons", "Turnmatten", "Weichbodenmatte"],
    altersVon: 7,
    altersBis: 12,
    gruppeMin: 4,
    gruppeMax: 16,
    dauer: 20,
  }),

  // ============ HAUPTTEIL: WURF ============
  u({
    id: "zonenweitwurf",
    titel: "Zonenweitwurf",
    beschreibung:
      "Mit Hütchen werden Wurfzonen markiert (z. B. alle 5 m). Die Kinder werfen Schlagbälle aus dem Anlauf oder Stand und sammeln Punkte je nach Zone. Durch die Zonen ist keine Einzelmessung nötig – hoher Durchsatz, viele Versuche, klare Erfolgserlebnisse.",
    variationen:
      "Mit verschiedenen Bällen werfen (Schlagball, Tennisball, Heuler). Als Teamwettkampf: Alle Punkte einer Mannschaft addieren.",
    abschnitt: "hauptteil",
    disziplinen: ["wurf"],
    ort: "draussen",
    anlagen: [],
    material: ["Schlagbälle", "Hütchen"],
    altersVon: 6,
    altersBis: 14,
    gruppeMin: 4,
    gruppeMax: null,
    dauer: 15,
  }),
  u({
    id: "zielwurf-huetchenburg",
    titel: "Burgenwerfen",
    beschreibung:
      "Zwei Teams bauen aus Hütchen und Kastenteilen je eine „Burg“ auf ihrer Seite. Aus sicherer Entfernung (Abwurflinie!) versuchen die Teams, die Burg der Gegner mit Softbällen abzuwerfen. Welche Burg fällt zuerst? Schult den zielgenauen Schlagwurf.",
    variationen:
      "Wächter erlauben, die Bälle abfangen dürfen. Entfernung der Abwurflinie ans Alter anpassen. Mit Punktesystem für verschiedene Burgteile.",
    abschnitt: "hauptteil",
    disziplinen: ["wurf"],
    ort: "beides",
    anlagen: [],
    material: ["Hütchen", "Softbälle", "Kastenteile/Kartons"],
    altersVon: 6,
    altersBis: 12,
    gruppeMin: 8,
    gruppeMax: null,
    dauer: 15,
  }),
  u({
    id: "zauberschnur-wurf",
    titel: "Wurf über die Zauberschnur",
    beschreibung:
      "Eine Schnur wird auf 2,5–4 m Höhe gespannt (z. B. zwischen Pfosten oder Basketballkörben). Die Kinder werfen Schlagbälle darüber, erst aus dem Stand, dann mit 3-Schritt-Anlauf. Die hohe Schnur erzwingt automatisch den steilen Abwurfwinkel – die wichtigste Korrektur beim Schlagballwurf, ganz ohne Worte.",
    variationen:
      "Hinter der Schnur Zielzonen auslegen. Abstand zur Schnur schrittweise vergrößern. Beidarmig üben (auch mit der „schwachen“ Hand werfen).",
    abschnitt: "hauptteil",
    disziplinen: ["wurf"],
    ort: "beides",
    anlagen: [],
    material: ["Seil/Leine", "Schlagbälle"],
    altersVon: 6,
    altersBis: 14,
    gruppeMin: 4,
    gruppeMax: 20,
    dauer: 15,
  }),
  u({
    id: "medizinball-stossen",
    titel: "Medizinball-Stoßen",
    beschreibung:
      "Beidhändiges Stoßen des Medizinballs (1 kg) von der Brust aus dem Stand – die kindgerechte Vorform des Kugelstoßens. Nach jedem Stoß Weite mit Hütchen markieren und den eigenen Rekord jagen. Auf Stoß (drücken) statt Wurf achten.",
    variationen:
      "Rückwärts über den Kopf werfen (Achtung: viel Platz!). Aus der Schrittstellung stoßen. Team-Addition: Von der Landestelle stößt das nächste Kind weiter.",
    abschnitt: "hauptteil",
    disziplinen: ["wurf"],
    ort: "beides",
    anlagen: [],
    material: ["Medizinbälle", "Hütchen"],
    altersVon: 8,
    altersBis: 14,
    gruppeMin: 4,
    gruppeMax: 16,
    dauer: 15,
  }),

  // ============ HAUPTTEIL: AUSDAUER ============
  u({
    id: "minutenlauf-schaetzen",
    titel: "Zeitschätzlauf",
    beschreibung:
      "Die Kinder laufen eine vorgegebene Zeit (z. B. 2 Minuten) in selbst gewähltem Tempo eine Runde und bleiben stehen, wenn sie glauben, dass die Zeit um ist – ohne Uhr! Wer am nächsten dran ist, gewinnt. Nimmt den Wettkampfdruck raus und schult das Tempogefühl.",
    variationen:
      "Zeit steigern (3, 4, 5 Minuten). Paarweise: Ein Kind läuft, das andere schätzt mit. Mit Zielzone statt exakter Zeit für jüngere Kinder.",
    abschnitt: "hauptteil",
    disziplinen: ["ausdauer"],
    ort: "beides",
    anlagen: [],
    material: ["Stoppuhr"],
    altersVon: 7,
    altersBis: 14,
    gruppeMin: 4,
    gruppeMax: null,
    dauer: 12,
  }),
  u({
    id: "team-puzzlelauf",
    titel: "Puzzle-Lauf",
    beschreibung:
      "Jedes Team läuft Runden um ein Hütchen-Oval. Pro gelaufener Runde darf ein Kind ein Puzzleteil (oder eine Memory-Karte) aus der Mitte holen. Welches Team hat sein Puzzle zuerst fertig? Die Kinder laufen viel, ohne es zu merken – der Kopf ist beim Puzzle.",
    variationen:
      "Memory statt Puzzle: Pro Runde darf ein Paar aufgedeckt werden. Rundenlänge ans Alter anpassen (80–200 m).",
    abschnitt: "hauptteil",
    disziplinen: ["ausdauer"],
    ort: "beides",
    anlagen: [],
    material: ["Hütchen"],
    altersVon: 6,
    altersBis: 12,
    gruppeMin: 6,
    gruppeMax: null,
    dauer: 15,
  }),
  u({
    id: "biathlon-runde",
    titel: "Kinder-Biathlon",
    beschreibung:
      "Laufrunde plus Wurfstation, wie beim Biathlon: Nach jeder Runde wirft das Kind 3 Bälle auf ein Ziel (Hütchen, Eimer, Kastenteil). Jeder Fehlwurf bedeutet eine kleine Strafrunde. 3–4 Durchgänge. Verbindet Ausdauer mit Zielwurf und bleibt durch den Wechsel spannend.",
    variationen:
      "Als Teamstaffel. Ziele unterschiedlich schwer aufbauen und die Kinder wählen lassen (mehr Risiko = kürzere Laufstrecke).",
    abschnitt: "hauptteil",
    disziplinen: ["ausdauer", "wurf"],
    ort: "beides",
    anlagen: [],
    material: ["Tennisbälle", "Hütchen"],
    altersVon: 7,
    altersBis: 13,
    gruppeMin: 6,
    gruppeMax: null,
    dauer: 20,
  }),

  // ============ HAUPTTEIL: KOORDINATION ============
  u({
    id: "koordinationsleiter-stationen",
    titel: "Koordinationsleiter-Stationen",
    beschreibung:
      "Verschiedene Schrittmuster durch die Koordinationsleiter: jeder Fuß in jedes Feld, beidbeinige Sprünge, Seitwärtslaufen, In-Out. Erst langsam und sauber, dann schneller. Kurze Bahnen, viele Wiederholungen, kleine Gruppen an mehreren Leitern parallel.",
    variationen:
      "Ohne Leiter: Muster mit Kreide oder Reifen legen. Am Ende der Leiter einen kurzen Sprint anhängen. Muster von Kindern erfinden lassen.",
    abschnitt: "hauptteil",
    disziplinen: ["koordination", "sprint"],
    ort: "beides",
    anlagen: [],
    material: ["Koordinationsleiter"],
    altersVon: 6,
    altersBis: 14,
    gruppeMin: 4,
    gruppeMax: 16,
    dauer: 15,
  }),
  u({
    id: "balancier-parcours",
    titel: "Balancier-Parcours",
    beschreibung:
      "Aus Langbänken (auch umgedreht), Seilen am Boden und Linien wird ein Balancier-Weg gebaut. Aufgaben unterwegs: Drehung, Ball fangen, in die Hocke gehen, rückwärts gehen. Wer den Boden berührt, startet am letzten Posten neu.",
    variationen:
      "Mit Zusatzmaterial: Säckchen auf dem Kopf balancieren. Begegnungsverkehr: Zwei Kinder starten von beiden Enden und müssen aneinander vorbei.",
    abschnitt: "hauptteil",
    disziplinen: ["koordination"],
    ort: "drinnen",
    anlagen: [],
    material: ["Langbänke", "Seil/Leine", "Softbälle"],
    altersVon: 5,
    altersBis: 11,
    gruppeMin: 4,
    gruppeMax: 16,
    dauer: 15,
  }),
  u({
    id: "seilspring-sammelkarte",
    titel: "Seilspring-Sammelkarte",
    beschreibung:
      "Jedes Kind bekommt ein Springseil und eine „Sammelkarte“ mit Sprungarten: 10× beidbeinig, 5× einbeinig links/rechts, 5× rückwärts, 3× Laufschritt. Wer eine Aufgabe schafft, hakt sie ab. Die Kinder arbeiten in eigenem Tempo, der Trainer hilft bei der Technik.",
    variationen:
      "Partner-Modus: Ein Kind zählt und kontrolliert. Wochen-Challenge daraus machen und die Karte übers Training hinaus laufen lassen.",
    abschnitt: "hauptteil",
    disziplinen: ["koordination", "ausdauer"],
    ort: "beides",
    anlagen: [],
    material: ["Springseile"],
    altersVon: 6,
    altersBis: 12,
    gruppeMin: 4,
    gruppeMax: null,
    dauer: 15,
  }),

  // ============ STAFFELN ============
  u({
    id: "pendelstaffel",
    titel: "Pendelstaffel",
    beschreibung:
      "Jedes Team teilt sich auf zwei gegenüberliegende Seiten auf. Das startende Kind sprintet zur anderen Seite und übergibt den Staffelstab (oder Ring) an das nächste Kind, das zurücksprintet. Übergabe im Stand üben: linke Hand nimmt, rechte Hand gibt.",
    variationen:
      "Statt Stab einen Tennisring oder ein Leibchen übergeben. Distanz variieren (15–30 m). Mit Slalomstrecke oder Hindernis in der Mitte.",
    abschnitt: "staffeln",
    disziplinen: ["sprint"],
    ort: "beides",
    anlagen: [],
    material: ["Staffelstäbe", "Hütchen"],
    altersVon: 6,
    altersBis: 14,
    gruppeMin: 8,
    gruppeMax: null,
    dauer: 15,
  }),
  u({
    id: "waescheklammer-staffel",
    titel: "Wäscheklammer-Staffel",
    beschreibung:
      "An einer Leine (oder einem Hütchen-Depot) hängen viele Wäscheklammern. Die Teams sprinten nacheinander los, holen pro Lauf genau eine Klammer und heften sie dem nächsten Läufer ans Trikot. Welches Team sammelt in 3 Minuten die meisten Klammern?",
    variationen:
      "Farben zählen unterschiedlich viele Punkte. Rückweg rückwärts oder im Hopserlauf. Klammern am Ende zum Buchstabenlegen verwenden.",
    abschnitt: "staffeln",
    disziplinen: ["sprint"],
    ort: "beides",
    anlagen: [],
    material: ["Wäscheklammern", "Hütchen", "Seil/Leine"],
    altersVon: 5,
    altersBis: 11,
    gruppeMin: 8,
    gruppeMax: null,
    dauer: 12,
  }),
  u({
    id: "wuerfelstaffel",
    titel: "Würfelstaffel",
    beschreibung:
      "Vor jedem Lauf würfelt das startende Kind: Die Zahl bestimmt die Aufgabe (1 = Slalom, 2 = rückwärts, 3 = Hopserlauf, 4 = zwei Runden, 5 = mit Ball prellen, 6 = freie Wahl). Der Zufall hält alle Teams im Spiel, weil das Glück mitentscheidet.",
    variationen:
      "Zahl = Anzahl der Runden um das Hütchen. Zwei Würfel für ältere Kinder (Aufgabe + Wiederholungen).",
    abschnitt: "staffeln",
    disziplinen: ["sprint", "koordination"],
    ort: "beides",
    anlagen: [],
    material: ["Schaumstoffwürfel", "Hütchen"],
    altersVon: 6,
    altersBis: 12,
    gruppeMin: 8,
    gruppeMax: null,
    dauer: 15,
  }),
  u({
    id: "rundenstaffel-bahn",
    titel: "Rundenstaffel auf der Bahn",
    beschreibung:
      "Teams verteilen sich an mehreren Übergabepunkten rund um die 400m-Bahn (z. B. alle 100 m ein Kind). Der Stab wandert im fliegenden Wechsel um die Bahn. Vorstufe zur Rundenstaffel im Wettkampf: Übergabe im Laufen, Blick nach vorne, Wechselraum markieren.",
    variationen:
      "Distanzen ans Alter anpassen (50–100 m pro Kind). Zwei Durchgänge laufen und die Teamzeit verbessern statt gegeneinander zu laufen.",
    abschnitt: "staffeln",
    disziplinen: ["sprint", "ausdauer"],
    ort: "draussen",
    anlagen: ["bahn400"],
    material: ["Staffelstäbe", "Hütchen"],
    altersVon: 8,
    altersBis: 14,
    gruppeMin: 8,
    gruppeMax: null,
    dauer: 20,
  }),

  // ============ ABSCHLUSS ============
  u({
    id: "zombieball",
    titel: "Zombieball",
    beschreibung:
      "Jeder gegen jeden: Wer den Ball hat, darf maximal 3 Schritte gehen und andere abwerfen. Wer getroffen wird, setzt sich an den Rand – und ist wieder frei, sobald der eigene „Abwerfer“ selbst getroffen wird. Der Dauerbrenner zum Trainingsabschluss, an dem alle bis zur letzten Minute beteiligt sind.",
    variationen:
      "Mit zwei Bällen spielen. Fangen erlaubt: Wer fängt, schickt den Werfer raus. Nur Treffer unterhalb der Hüfte zählen.",
    abschnitt: "abschluss",
    disziplinen: ["wurf"],
    ort: "drinnen",
    anlagen: [],
    material: ["Softbälle"],
    altersVon: 7,
    altersBis: 14,
    gruppeMin: 8,
    gruppeMax: null,
    dauer: 10,
  }),
  u({
    id: "zublinzeln",
    titel: "Zublinzeln",
    beschreibung:
      "Die Hälfte der Kinder sitzt im Kreis, hinter jedem steht ein Wächter – ein Stuhl/Platz bleibt leer. Das Kind mit leerem Platz blinzelt einem sitzenden Kind zu, das blitzschnell zu ihm sprinten muss, bevor sein Wächter es an der Schulter stoppt. Ruhiges Reaktionsspiel zum Runterkommen.",
    variationen:
      "Rollen nach ein paar Minuten tauschen. Mit größerem Kreis wird das Spiel laufintensiver.",
    abschnitt: "abschluss",
    disziplinen: [],
    ort: "beides",
    anlagen: [],
    material: [],
    altersVon: 6,
    altersBis: 12,
    gruppeMin: 9,
    gruppeMax: null,
    dauer: 10,
  }),
  u({
    id: "abschlusskreis",
    titel: "Abschlusskreis mit Daumen-Feedback",
    beschreibung:
      "Alle kommen im Kreis zusammen, kurzes gemeinsames Ausschütteln und Dehnen. Danach zeigt jedes Kind mit dem Daumen (hoch/quer/runter), wie das Training war – wer mag, sagt einen Satz dazu. Gibt dem Trainer ehrliches Feedback und dem Training einen festen, ruhigen Schlusspunkt.",
    variationen:
      "„Blitzlicht“: Jedes Kind nennt seine Lieblingsübung des Tages. Ausblick geben, was beim nächsten Mal ansteht.",
    abschnitt: "abschluss",
    disziplinen: [],
    ort: "beides",
    anlagen: [],
    material: [],
    altersVon: 5,
    altersBis: 14,
    gruppeMin: 4,
    gruppeMax: null,
    dauer: 5,
  }),
];
