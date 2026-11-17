// Auswertung: zählt die Antworten aus (Häufigkeiten, Kreuztabelle, Kernaussagen) und baut die CSV-Datei.
// Die Seiten des Auswertungszentrums stehen in seiten.js.
import { fragen, kontrollfrage } from './fragen.js';
import { versionen } from './versionen.js';

export const prozent = new Intl.NumberFormat('de-DE', { style: 'percent', maximumFractionDigits: 0 });
export const komma = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });
export const datumZeit = new Intl.DateTimeFormat('de-DE', {
  timeZone: 'Europe/Berlin', dateStyle: 'short', timeStyle: 'short',
});
const tagSchluessel = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', dateStyle: 'short' });
const tagText = new Intl.DateTimeFormat('de-DE', {
  timeZone: 'Europe/Berlin', weekday: 'short', day: '2-digit', month: '2-digit',
});

export function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export function minuten(sekunden) {
  if (sekunden == null || Number.isNaN(sekunden)) return '–';
  const s = Math.round(sekunden);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} min`;
}

function median(zahlen) {
  if (zahlen.length === 0) return null;
  const sortiert = [...zahlen].sort((a, b) => a - b);
  const mitte = Math.floor(sortiert.length / 2);
  return sortiert.length % 2 ? sortiert[mitte] : (sortiert[mitte - 1] + sortiert[mitte]) / 2;
}

// Im Team-Zentrum gibt es zusätzlich die "Frage", über wessen Link eine Antwort kam.
// So lässt sich nach Version filtern und vergleichen.
export const versionsFrage = {
  id: 'version',
  typ: 'einfach',
  pseudo: true,
  kurz: 'Version',
  text: 'Über wessen Link kam die Antwort?',
  optionen: versionen.map((v) => v.name),
};

export const kurzname = (frage) => frage.kurz ?? frage.text;

// Alle Fragen eines Zentrums, im Team-Zentrum mit der Versions-Frage vorneweg.
export function fragenFuer(zentrum) {
  return zentrum.team ? [versionsFrage, ...fragen] : fragen;
}

// Fragen mit festen Antworten (alles außer der offenen Frage). Nur die kann man filtern und vergleichen.
export const istGeschlossen = (frage) => frage.typ !== 'text';

export function wert(satz, frage) {
  if (frage.pseudo) return versionen.find((v) => v.id === satz.version)?.name ?? null;
  return satz.antworten?.[frage.id];
}

export function optionenVon(frage) {
  if (frage.typ === 'skala') return ['1', '2', '3', '4', '5'];
  return frage.optionen ?? [];
}

export function waehlte(satz, frage, option) {
  const w = wert(satz, frage);
  if (Array.isArray(w)) return w.includes(option);
  if (frage.typ === 'skala') return String(w) === option;
  return w === option;
}

export function hatAntwort(satz, frage) {
  const w = wert(satz, frage);
  if (Array.isArray(w)) return w.length > 0;
  if (frage.typ === 'skala') return Number.isInteger(w);
  return w != null && w !== '';
}

// Liest den Filter aus der Adresse, z. B. "alter:1" = zweite Antwort der Frage "alter".
export function filterLesen(text, zentrum) {
  const treffer = /^([a-z0-9_]+):(\d{1,2})$/.exec(text || '');
  if (!treffer) return null;
  const frage = fragenFuer(zentrum).find((f) => f.id === treffer[1] && istGeschlossen(f));
  const option = frage && optionenVon(frage)[Number(treffer[2])];
  return option == null ? null : { frage, option, schluessel: `${frage.id}:${Number(treffer[2])}` };
}

// Welche Antworten gezählt werden: nur gültige (Kontrollfrage richtig), außer man will alle,
// und auf Wunsch nur die Befragten, die eine bestimmte Antwort gegeben haben.
export function auswahl(alleSaetze, { auchUngueltige = false, filter = null } = {}) {
  let saetze = auchUngueltige ? alleSaetze : alleSaetze.filter((s) => s.gueltig);
  if (filter) saetze = saetze.filter((s) => waehlte(s, filter.frage, filter.option));
  return saetze;
}

// Zählt eine Frage aus.
export function frageAuswerten(saetze, frage) {
  if (frage.typ === 'text') {
    const texte = saetze
      .map((s) => ({ satz: s, text: wert(s, frage) }))
      .filter((t) => typeof t.text === 'string' && t.text.trim() !== '');
    return { frage, texte, n: texte.length };
  }
  const beantwortet = saetze.filter((s) => hatAntwort(s, frage));
  const zeilen = optionenVon(frage).map((option) => ({
    option,
    anzahl: beantwortet.filter((s) => waehlte(s, frage, option)).length,
  }));
  const ergebnis = { frage, zeilen, n: beantwortet.length };
  if (frage.typ === 'skala') {
    const zahlen = beantwortet.map((s) => wert(s, frage));
    ergebnis.schnitt = zahlen.length ? zahlen.reduce((a, b) => a + b, 0) / zahlen.length : null;
  }
  return ergebnis;
}

// Kennzahlen und alle Fragen. "alleSaetze" = alles im Zentrum, "saetze" = was nach Filter gezählt wird.
export function auswerten(alleSaetze, saetze, zentrum) {
  const gueltige = alleSaetze.filter((s) => s.gueltig);
  const dauer = saetze.map((s) => s.dauerSekunden).filter((d) => Number.isFinite(d) && d > 0);
  const zeiten = alleSaetze.map((s) => s.zeit).filter(Boolean).sort();
  return {
    gesamt: alleSaetze.length,
    gueltig: gueltige.length,
    aussortiert: alleSaetze.length - gueltige.length,
    gezaehlt: saetze.length,
    dauerSchnitt: dauer.length ? dauer.reduce((a, b) => a + b, 0) / dauer.length : null,
    dauerMedian: median(dauer),
    erste: zeiten[0],
    letzte: zeiten.at(-1),
    ergebnisse: fragenFuer(zentrum).map((frage) => frageAuswerten(saetze, frage)),
  };
}

// Die häufigste Antwort einer Frage (bei Gleichstand mehrere).
export function spitzenreiter(ergebnis) {
  const { frage, zeilen, n } = ergebnis;
  if (!zeilen || n === 0) return null;
  if (frage.typ === 'skala') {
    return { text: `Durchschnitt ${komma.format(ergebnis.schnitt)} von 5`, anteil: (ergebnis.schnitt - 1) / 4, skala: true };
  }
  const kandidaten = zeilen.filter((z) => z.option !== frage.exklusiv);
  const max = Math.max(...kandidaten.map((z) => z.anzahl));
  if (max === 0) return null;
  const vorne = kandidaten.filter((z) => z.anzahl === max).map((z) => z.option);
  return { text: vorne.join(' und '), anteil: max / n };
}

// Teilnahmen pro Tag (deutsche Zeit), ältester Tag zuerst.
export function proTag(saetze) {
  const tage = new Map();
  for (const s of saetze) {
    const zeit = new Date(s.zeit);
    if (Number.isNaN(zeit.getTime())) continue;
    const schluessel = tagSchluessel.format(zeit);
    const eintrag = tage.get(schluessel) ?? { text: tagText.format(zeit), anzahl: 0 };
    eintrag.anzahl += 1;
    tage.set(schluessel, eintrag);
  }
  return [...tage.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, eintrag]) => eintrag);
}

// Kreuztabelle: Wie haben die Gruppen von Frage B (Spalten) auf Frage A (Zeilen) geantwortet?
// Jede Zelle: Anteil der Gruppe, der diese Antwort gewählt hat.
export function kreuztabelle(saetze, frageA, frageB) {
  const mitA = saetze.filter((s) => hatAntwort(s, frageA));
  const gruppen = [
    { name: 'Alle', alle: true, saetze: mitA },
    ...optionenVon(frageB).map((option) => ({
      name: option,
      saetze: mitA.filter((s) => waehlte(s, frageB, option)),
    })),
  ];
  const zeilen = optionenVon(frageA).map((option) => ({
    option,
    zellen: gruppen.map((g) => {
      const anzahl = g.saetze.filter((s) => waehlte(s, frageA, option)).length;
      return { anzahl, n: g.saetze.length, anteil: g.saetze.length ? anzahl / g.saetze.length : null };
    }),
  }));
  let schnitt = null;
  if (frageA.typ === 'skala') {
    schnitt = gruppen.map((g) => {
      const zahlen = g.saetze.map((s) => wert(s, frageA));
      return zahlen.length ? zahlen.reduce((a, b) => a + b, 0) / zahlen.length : null;
    });
  }
  return { gruppen: gruppen.map((g) => ({ name: g.name, alle: Boolean(g.alle), n: g.saetze.length })), zeilen, schnitt };
}

// Kernaussagen für die Präsentation. Jede Aussage gibt es nur, wenn die passende Frage
// noch so in fragen.js steht. Fehlt sie, fällt die Aussage einfach weg.
export function kernaussagen(a) {
  const finde = (id) => a.ergebnisse.find((e) => e.frage.id === id && e.n > 0);
  const anteil = (ergebnis, optionen) => {
    const zeilen = ergebnis.zeilen.filter((z) => optionen.includes(z.option));
    if (zeilen.length !== optionen.length) return null;
    return zeilen.reduce((summe, z) => summe + z.anzahl, 0) / ergebnis.n;
  };
  const aussagen = [];

  // Leitfrage: Ist es sinnvoll, den Onlineshop so einzurichten?
  const vergleich = finde('vergleich');
  const kaufen = vergleich && anteil(vergleich, ['Ja, sicher', 'Eher ja']);
  if (kaufen != null) {
    aussagen.push({
      wert: prozent.format(kaufen),
      text: 'würden bei LootLager bestellen, wenn sie unseren Preis mit den Spezial-Shops vergleichen (sicher oder eher ja). Das beantwortet unsere Leitfrage.',
    });
  }

  const alter = finde('alter');
  const zielgruppe = alter && anteil(alter, ['16–20', '21–25', '26–30']);
  if (zielgruppe != null) {
    aussagen.push({ wert: prozent.format(zielgruppe), text: 'sind 16 bis 30 Jahre alt. Das ist unsere Zielgruppe.' });
  }

  const produkte = finde('produkte');
  const lieblingsprodukt = produkte && spitzenreiter(produkte);
  if (lieblingsprodukt) {
    aussagen.push({
      wert: prozent.format(lieblingsprodukt.anteil),
      text: `würden sich ${lieblingsprodukt.text} mit eigenem Design holen. Das ist unser gefragtestes Produkt.`,
    });
  }

  const design = finde('design');
  const designWichtig = design && anteil(design, ['4', '5']);
  if (designWichtig != null) {
    aussagen.push({
      wert: prozent.format(designWichtig),
      text: `ist ein eigenes Design wichtig (4 oder 5 von 5). Durchschnitt: ${komma.format(design.schnitt)}.`,
    });
  }

  const preis = finde('preis');
  const mehrAls25 = preis && anteil(preis, ['26–35 €', 'mehr als 35 €']);
  if (mehrAls25 != null) {
    aussagen.push({ wert: prozent.format(mehrAls25), text: 'würden für ein XXL-Mauspad mit eigenem Design mehr als 25 € zahlen.' });
  }

  for (const [id, satz] of [
    ['kaufgrund', (t) => `ist „${t}“ beim Kauf am wichtigsten. Damit sollten wir werben.`],
    ['kaufort', (t) => `kaufen Gaming-Zubehör meistens hier: ${t}. Das ist unser stärkster Mitbewerber.`],
    ['kanal', (t) => `würden über ${t} von einem neuen Shop erfahren. Dort lohnt sich Werbung.`],
  ]) {
    const ergebnis = finde(id);
    const vorne = ergebnis && spitzenreiter(ergebnis);
    if (vorne) aussagen.push({ wert: prozent.format(vorne.anteil), text: satz(vorne.text) });
  }
  return aussagen;
}

// CSV mit Semikolon und BOM, damit Excel (deutsch) Umlaute und Spalten richtig erkennt.
export function alsCsv(alleSaetze) {
  const zelle = (inhalt) => {
    let text = inhalt == null ? '' : String(inhalt);
    // Schutz vor Formeln in Excel (z. B. wenn jemand "=..." in die offene Frage schreibt)
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return /[";\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  const kopf = ['Nr', 'Version', 'Zeit', 'Dauer (Sekunden)', 'Gültig', ...fragen.map((f) => f.text)];
  const zeilen = alleSaetze.map((s, i) => [
    i + 1,
    wert(s, versionsFrage) ?? '',
    datumZeit.format(new Date(s.zeit)),
    s.dauerSekunden ?? '',
    s.gueltig ? 'ja' : 'nein',
    ...fragen.map((f) => {
      const w = s.antworten?.[f.id];
      return Array.isArray(w) ? w.join(', ') : w;
    }),
  ]);
  return '﻿' + [kopf, ...zeilen].map((z) => z.map(zelle).join(';')).join('\r\n') + '\r\n';
}

export { kontrollfrage };
