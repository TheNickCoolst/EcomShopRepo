// Auswertung: zählt die Antworten und baut daraus die Seite /auswertung und die CSV-Datei.
import { fragen, kontrollfrage } from './fragen.js';

const prozent = new Intl.NumberFormat('de-DE', { style: 'percent', maximumFractionDigits: 0 });
const komma = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });
const datumZeit = new Intl.DateTimeFormat('de-DE', {
  timeZone: 'Europe/Berlin', dateStyle: 'short', timeStyle: 'short',
});

export function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function minuten(sekunden) {
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

// Zählt alle Fragen aus. "saetze" sind die gespeicherten Antworten (eine pro Teilnahme).
export function auswerten(alleSaetze, { auchUngueltige = false } = {}) {
  const gueltige = alleSaetze.filter((s) => s.gueltig);
  const saetze = auchUngueltige ? alleSaetze : gueltige;
  const dauer = saetze.map((s) => s.dauerSekunden).filter((d) => Number.isFinite(d) && d > 0);

  const ergebnisse = fragen.map((frage) => {
    const werte = saetze.map((s) => s.antworten?.[frage.id]);
    if (frage.typ === 'text') {
      const texte = saetze
        .map((s) => ({ zeit: s.zeit, text: s.antworten?.[frage.id] }))
        .filter((t) => typeof t.text === 'string' && t.text.trim() !== '');
      return { frage, texte, n: texte.length };
    }
    if (frage.typ === 'skala') {
      const zahlen = werte.filter((w) => Number.isInteger(w));
      const zeilen = [1, 2, 3, 4, 5].map((stufe) => ({
        option: String(stufe), anzahl: zahlen.filter((z) => z === stufe).length,
      }));
      const schnitt = zahlen.length ? zahlen.reduce((a, b) => a + b, 0) / zahlen.length : null;
      return { frage, zeilen, n: zahlen.length, schnitt };
    }
    const beantwortet = werte.filter((w) => (Array.isArray(w) ? w.length > 0 : w != null));
    const zeilen = frage.optionen.map((option) => ({
      option,
      anzahl: beantwortet.filter((w) => (Array.isArray(w) ? w.includes(option) : w === option)).length,
    }));
    return { frage, zeilen, n: beantwortet.length };
  });

  return {
    gesamt: alleSaetze.length,
    gueltig: gueltige.length,
    aussortiert: alleSaetze.length - gueltige.length,
    gezaehlt: saetze.length,
    dauerSchnitt: dauer.length ? dauer.reduce((a, b) => a + b, 0) / dauer.length : null,
    dauerMedian: median(dauer),
    erste: alleSaetze[0]?.zeit,
    letzte: alleSaetze.at(-1)?.zeit,
    ergebnisse,
  };
}

// Die häufigste Antwort jeder Frage, für den Kasten "Auf einen Blick".
function spitzenreiter(ergebnis) {
  const { frage, zeilen, n } = ergebnis;
  if (!zeilen || n === 0) return null;
  if (frage.typ === 'skala') {
    return `Durchschnitt ${komma.format(ergebnis.schnitt)} von 5`;
  }
  const max = Math.max(...zeilen.map((z) => z.anzahl));
  const vorne = zeilen.filter((z) => z.anzahl === max).map((z) => `„${z.option}“`);
  return `${vorne.join(' und ')} (${prozent.format(max / n)})`;
}

function balken(ergebnis) {
  const { frage, zeilen, n } = ergebnis;
  const max = Math.max(1, ...zeilen.map((z) => z.anzahl));
  const beschriftung = (option) => {
    if (frage.typ !== 'skala') return escapeHtml(option);
    if (option === '1') return `1 <small>(${escapeHtml(frage.min)})</small>`;
    if (option === '5') return `5 <small>(${escapeHtml(frage.max)})</small>`;
    return option;
  };
  return `<ul class="balken">${zeilen.map((z) => {
    const anteil = n ? z.anzahl / n : 0;
    const richtig = frage.typ === 'kontrolle' && z.option === frage.richtig;
    const spitze = z.anzahl === max && z.anzahl > 0 && frage.typ !== 'kontrolle';
    return `<li class="${spitze ? 'spitze' : ''}${richtig ? ' richtig' : ''}">
      <span class="option">${beschriftung(z.option)}${richtig ? ' ✓' : ''}</span>
      <span class="spur"><span class="fuellung" style="width:${(z.anzahl / max) * 100}%"></span></span>
      <span class="zahl">${z.anzahl} · ${prozent.format(anteil)}</span>
    </li>`;
  }).join('')}</ul>`;
}

function frageKarte(ergebnis, nummer) {
  const { frage, n } = ergebnis;
  let inhalt;
  let info = `${n} Antworten`;
  if (frage.typ === 'text') {
    inhalt = ergebnis.texte.length
      ? `<ol class="texte">${ergebnis.texte.map((t) => `<li>${escapeHtml(t.text)}</li>`).join('')}</ol>`
      : '<p class="leise">Noch keine Antworten.</p>';
    info = `${n} Antworten (freiwillig)`;
  } else {
    inhalt = balken(ergebnis);
    if (frage.typ === 'mehrfach') info += ' · Mehrfachauswahl, deshalb über 100 % möglich';
    if (frage.typ === 'skala' && ergebnis.schnitt != null) info += ` · Durchschnitt ${komma.format(ergebnis.schnitt)}`;
    if (frage.typ === 'kontrolle') info += ' · Kontrollfrage, wer falsch tippt, wird aussortiert';
  }
  return `<section class="karte">
    <h2><span class="nr">${nummer}</span> ${escapeHtml(frage.text)}</h2>
    <p class="leise">${info}</p>
    ${inhalt}
  </section>`;
}

export function auswertungSeite(alleSaetze, { auchUngueltige, warnung }) {
  const a = auswerten(alleSaetze, { auchUngueltige });
  const blick = a.ergebnisse
    .filter((e) => e.frage.typ !== 'text' && e.frage.typ !== 'kontrolle')
    .map((e) => ({ frage: e.frage.text, antwort: spitzenreiter(e) }))
    .filter((z) => z.antwort);

  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Auswertung · LootLager-Umfrage</title>
  <link rel="icon" href="/favicon.png">
  <link rel="stylesheet" href="/auswertung.css">
</head>
<body>
  <header class="kopf">
    <img src="/logo-lootlager.png" alt="LootLager" width="190" height="52">
    <div>
      <h1>Auswertung der Umfrage</h1>
      <p class="leise">Stand: ${escapeHtml(datumZeit.format(new Date()))} Uhr</p>
    </div>
  </header>
  <main>
    ${warnung ? `<p class="warnung">${warnung}</p>` : ''}
    <section class="zahlen">
      <div><strong>${a.gesamt}</strong><span>Teilnahmen</span></div>
      <div><strong>${a.gueltig}</strong><span>gültig</span></div>
      <div><strong>${a.aussortiert}</strong><span>aussortiert (Kontrollfrage falsch)</span></div>
      <div><strong>${minuten(a.dauerMedian)}</strong><span>typische Dauer (Median), Ø ${minuten(a.dauerSchnitt)}</span></div>
    </section>
    <p class="leise">
      ${a.gesamt ? `Erste Antwort ${escapeHtml(datumZeit.format(new Date(a.erste)))}, letzte ${escapeHtml(datumZeit.format(new Date(a.letzte)))} Uhr. ` : ''}
      Gezählt werden ${auchUngueltige ? '<strong>alle</strong> Antworten, auch die aussortierten' : 'nur <strong>gültige</strong> Antworten'}.
    </p>
    <nav class="knoepfe">
      <a class="knopf" href="/auswertung">Aktualisieren</a>
      <a class="knopf" href="${auchUngueltige ? '/auswertung' : '/auswertung?alle=1'}">${auchUngueltige ? 'Nur gültige zählen' : 'Auch aussortierte zählen'}</a>
      <a class="knopf knopf--voll" href="/auswertung/antworten.csv">CSV für Excel herunterladen</a>
    </nav>

    ${blick.length ? `<section class="karte blick">
      <h2>Auf einen Blick</h2>
      <p class="leise">Häufigste Antwort pro Frage (${a.gezaehlt} ${auchUngueltige ? 'Antworten' : 'gültige Antworten'})</p>
      <dl>${blick.map((z) => `<dt>${escapeHtml(z.frage)}</dt><dd>${escapeHtml(z.antwort)}</dd>`).join('')}</dl>
    </section>` : '<section class="karte"><p>Noch keine gültigen Antworten. Sobald jemand die Umfrage abschickt, erscheinen hier die Ergebnisse.</p></section>'}

    ${a.ergebnisse.map((e, i) => frageKarte(e, i + 1)).join('')}

    <details class="karte gefahr">
      <summary>Alle Antworten löschen (z. B. nach dem Testen)</summary>
      <p>Die Antworten werden nicht endgültig gelöscht, sondern in eine Sicherungsdatei verschoben. Die Auswertung startet danach bei 0.</p>
      <form method="post" action="/auswertung/zuruecksetzen">
        <label>Zum Bestätigen <strong>LÖSCHEN</strong> eintippen:
          <input name="bestaetigung" autocomplete="off" required pattern="LÖSCHEN">
        </label>
        <button type="submit">Antworten zurücksetzen</button>
      </form>
    </details>
  </main>
</body>
</html>`;
}

// CSV mit Semikolon und BOM, damit Excel (deutsch) Umlaute und Spalten richtig erkennt.
export function alsCsv(alleSaetze) {
  const zelle = (wert) => {
    let text = wert == null ? '' : String(wert);
    // Schutz vor Formeln in Excel (z. B. wenn jemand "=..." in die offene Frage schreibt)
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return /[";\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  const kopf = ['Nr', 'Zeit', 'Dauer (Sekunden)', 'Gültig', ...fragen.map((f) => f.text)];
  const zeilen = alleSaetze.map((s, i) => [
    i + 1,
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
