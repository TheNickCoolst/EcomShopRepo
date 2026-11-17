// Die Seiten des Auswertungszentrums: Anmeldung, Menü und alle Ansichten.
// Gezählt wird in auswertung.js, die Sekundärforschung steht in sekundaer.js.
import {
  escapeHtml as e, prozent, komma, datumZeit, minuten, kurzname, fragenFuer, istGeschlossen,
  wert, optionenVon, auswahl, auswerten, frageAuswerten, spitzenreiter, proTag, kreuztabelle,
  kernaussagen, filterLesen,
} from './auswertung.js';
import { versionen, TEAM, passwortVariable } from './versionen.js';
import { sekundaerAnsicht } from './sekundaer-seite.js';

const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

// --- Bausteine ------------------------------------------------------------------------

const symbole = {
  uebersicht: '<path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-3H4zM14 7h6V4h-6z"/>',
  fragen: '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
  vergleich: '<path d="M3 5h18v14H3zM3 10h18M9 5v14M15 5v14"/>',
  texte: '<path d="M4 5h16v11H9l-5 4z"/>',
  antworten: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  sekundaer: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>',
  export: '<path d="M12 4v11M7 11l5 5 5-5M4 20h16"/>',
};
const symbol = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${symbole[name]}</svg>`;

const ansichten = [
  { id: '', symbol: 'uebersicht', name: 'Übersicht' },
  { id: 'fragen', symbol: 'fragen', name: 'Alle Fragen' },
  { id: 'vergleich', symbol: 'vergleich', name: 'Vergleichen' },
  { id: 'texte', symbol: 'texte', name: 'Offene Antworten' },
  { id: 'antworten', symbol: 'antworten', name: 'Einzelne Antworten' },
  { id: 'sekundaer', symbol: 'sekundaer', name: 'Sekundärforschung' },
  { id: 'export', symbol: 'export', name: 'Export & Verwaltung' },
];

export function adresse(zentrum, ansicht = '', parameter = {}) {
  const p = new URLSearchParams();
  for (const [name, inhalt] of Object.entries(parameter)) if (inhalt) p.set(name, inhalt);
  const q = p.toString();
  return `/${zentrum.id}/auswertung${ansicht ? `/${ansicht}` : ''}${q ? `?${q}` : ''}`;
}

const kopf = (titel, css) => `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>${e(titel)}</title>
  <link rel="icon" href="/favicon.png">
  <link rel="stylesheet" href="${css}">
</head>`;

// Balken: ein Name, ein Balken und eine Zahl pro Zeile. "anteil" 0–1 bestimmt die Länge.
function balkenListe(zeilen, { klasse = '' } = {}) {
  return `<ul class="balken ${klasse}">${zeilen.map((z) => `
    <li class="balken__zeile${z.klasse ? ` ${z.klasse}` : ''}"${z.tip ? ` data-tip="${e(z.tip)}"` : ''}>
      <span class="balken__name">${z.name}</span>
      <span class="balken__spur"><span class="balken__fuellung${z.anzahl > 0 ? ' hat-wert' : ''}" style="width:${(z.anteil * 100).toFixed(1)}%"></span></span>
      <span class="balken__zahl">${z.zahl}</span>
    </li>`).join('')}</ul>`;
}

function frageBalken(ergebnis) {
  const { frage, zeilen, n } = ergebnis;
  const kandidaten = zeilen.filter((z) => z.option !== frage.exklusiv);
  const max = Math.max(0, ...kandidaten.map((z) => z.anzahl));
  return balkenListe(zeilen.map((z) => {
    const anteil = n ? z.anzahl / n : 0;
    const richtig = frage.typ === 'kontrolle' && z.option === frage.richtig;
    const spitze = frage.typ !== 'kontrolle' && z.anzahl === max && max > 0 && z.option !== frage.exklusiv;
    let name = e(z.option);
    if (frage.typ === 'skala' && z.option === '1') name = `1 <small>${e(frage.min)}</small>`;
    if (frage.typ === 'skala' && z.option === '5') name = `5 <small>${e(frage.max)}</small>`;
    if (richtig) name += ' <small class="gut">✓ richtig</small>';
    return {
      name,
      anteil,
      anzahl: z.anzahl,
      zahl: `<strong>${prozent.format(anteil)}</strong><span>${z.anzahl}</span>`,
      tip: `${z.option}: ${z.anzahl} von ${n} (${prozent.format(anteil)})`,
      klasse: [spitze && 'ist-spitze', richtig && 'ist-richtig', frage.typ === 'kontrolle' && !richtig && 'ist-grau']
        .filter(Boolean).join(' '),
    };
  }));
}

function frageInfo(ergebnis) {
  const { frage, n } = ergebnis;
  const teile = [`${n} ${n === 1 ? 'Antwort' : 'Antworten'}`];
  if (frage.typ === 'mehrfach') teile.push('Mehrfachauswahl, zusammen über 100 % möglich');
  if (frage.typ === 'skala' && ergebnis.schnitt != null) teile.push(`Durchschnitt ${komma.format(ergebnis.schnitt)} von 5`);
  if (frage.typ === 'kontrolle') teile.push('Kontrollfrage: Wer falsch tippt, wird aussortiert');
  if (frage.typ === 'text') teile.push('freiwillig');
  return teile.join(' · ');
}

// --- Rahmen mit Menü ------------------------------------------------------------------

function filterLeiste({ zentrum, ansicht, zustand, filter, versteckt = {} }) {
  const gruppen = fragenFuer(zentrum)
    .filter((f) => istGeschlossen(f) && f.typ !== 'kontrolle')
    .map((f) => `<optgroup label="${e(kurzname(f))}">${optionenVon(f).map((option, i) => {
      const schluessel = `${f.id}:${i}`;
      return `<option value="${schluessel}"${filter?.schluessel === schluessel ? ' selected' : ''}>${e(kurzname(f))}: ${e(option)}</option>`;
    }).join('')}</optgroup>`).join('');
  const felder = Object.entries(versteckt)
    .map(([name, inhalt]) => (inhalt ? `<input type="hidden" name="${e(name)}" value="${e(inhalt)}">` : '')).join('');
  return `<form class="filter" method="get" action="${adresse(zentrum, ansicht)}" data-sofort>
    ${felder}
    <label class="filter__feld"><span>Nur Befragte mit dieser Antwort</span>
      <select name="filter"><option value="">Alle Befragten</option>${gruppen}</select>
    </label>
    <label class="filter__haken"><input type="checkbox" name="alle" value="1"${zustand.alle ? ' checked' : ''}> auch aussortierte zählen</label>
    <button class="knopf knopf--klein" type="submit">Anwenden</button>
    ${filter || zustand.alle ? `<a class="filter__weg" href="${adresse(zentrum, ansicht, versteckt)}">Filter zurücksetzen</a>` : ''}
  </form>`;
}

function rahmen({ zentrum, ansicht, titel, untertitel, inhalt, zustand, warnung, leiste = '' }) {
  const menue = ansichten.map((a) => `<a href="${adresse(zentrum, a.id, zustand)}"${a.id === ansicht ? ' class="ist-aktiv" aria-current="page"' : ''}>${symbol(a.symbol)}<span>${a.name}</span></a>`).join('');
  const andere = [TEAM, ...versionen].filter((z) => z.id !== zentrum.id)
    .map((z) => `<a href="${adresse(z)}">${e(z.name)}</a>`).join('');
  return `${kopf(`${titel} · Auswertungszentrum ${zentrum.name}`, '/zentrum.css')}
<body>
  <a class="sprung" href="#inhalt">Zum Inhalt springen</a>
  <aside class="leiste">
    <a class="leiste__logo" href="${adresse(zentrum)}"><img src="/logo-lootlager.png" alt="LootLager" width="150" height="41"></a>
    <p class="leiste__titel"><span>Auswertungszentrum</span><strong>${e(zentrum.name)}</strong></p>
    <nav class="leiste__menue" aria-label="Menü">${menue}</nav>
    <div class="leiste__fuss">
      ${zentrum.team ? '' : `<a class="leiste__link" href="/${zentrum.id}" target="_blank" rel="noopener">Zur Umfrage ↗</a>`}
      <p class="leiste__andere"><span>Andere Zentren</span>${andere}</p>
      <form method="post" action="${adresse(zentrum, 'abmelden')}"><button class="leiste__link" type="submit">Abmelden</button></form>
    </div>
  </aside>
  <main id="inhalt" class="inhalt">
    <header class="kopfzeile">
      <div>
        <h1>${e(titel)}</h1>
        <p class="leise">${untertitel}</p>
      </div>
      <a class="knopf knopf--klein nicht-drucken" href="${adresse(zentrum, ansicht, zustand)}">Aktualisieren</a>
    </header>
    ${warnung ? `<p class="warnung">${warnung}</p>` : ''}
    ${leiste}
    ${inhalt}
  </main>
  <div class="tip" id="tip" role="status" hidden></div>
  <script src="/zentrum.js" defer></script>
</body>
</html>`;
}

// --- Ansichten ------------------------------------------------------------------------

function zaehlHinweis(a, zustand, filter) {
  const teile = [];
  if (filter) {
    teile.push(`Filter aktiv: Gezählt werden nur die <strong>${a.gezaehlt}</strong> Befragten mit „${e(kurzname(filter.frage))}: ${e(filter.option)}“.`);
  } else {
    teile.push(zustand.alle
      ? `Gezählt werden <strong>alle ${a.gezaehlt}</strong> Antworten, auch die aussortierten.`
      : `Gezählt werden die <strong>${a.gezaehlt} gültigen</strong> Antworten.`);
  }
  if (a.gezaehlt > 0 && a.gezaehlt < 30) {
    teile.push('Bei weniger als 30 Antworten sind Prozentwerte nur eine grobe Tendenz.');
  }
  return `<p class="leise">${teile.join(' ')}</p>`;
}

function linkKarte(zentrum, basisUrl, eigenerPort) {
  const zeile = (v) => {
    const link = v.id === eigenerPort ? basisUrl : `${basisUrl}/${v.id}`;
    return `<li><span class="link-zeile__name">${zentrum.team ? `Version ${e(v.name)}` : 'Dein Umfrage-Link'}</span>
      <code>${e(link)}</code>
      <button class="knopf knopf--klein" type="button" data-kopieren="${e(link)}">Link kopieren</button></li>`;
  };
  const liste = zentrum.team ? versionen : [zentrum];
  return `<section class="karte nicht-drucken">
    <h2>${zentrum.team ? 'Die Umfrage-Links' : 'Diesen Link verteilst du'}</h2>
    <ul class="link-zeilen">${liste.map(zeile).join('')}</ul>
    <p class="leise">${zentrum.team
      ? 'Jede Version sammelt ihre Antworten getrennt. Hier im Team-Zentrum seht ihr alle zusammen.'
      : `Alle Antworten über diesen Link landen nur in deinem Zentrum und zusätzlich im <a href="${adresse(TEAM)}">Team-Zentrum</a>.`}</p>
  </section>`;
}

function uebersicht({ zentrum, alleSaetze, saetze, zustand, filter, basisUrl, eigenerPort }) {
  const a = auswerten(alleSaetze, saetze, zentrum);
  const aussagen = kernaussagen(a);
  const blick = a.ergebnisse
    .filter((ergebnis) => istGeschlossen(ergebnis.frage) && ergebnis.frage.typ !== 'kontrolle' && !ergebnis.frage.pseudo)
    .map((ergebnis) => ({ ergebnis, vorne: spitzenreiter(ergebnis) }))
    .filter((z) => z.vorne);
  const tage = proTag(saetze);
  const maxTag = Math.max(1, ...tage.map((t) => t.anzahl));
  const versionsErgebnis = a.ergebnisse.find((ergebnis) => ergebnis.frage.pseudo);

  return `
    <section class="kacheln" aria-label="Kennzahlen">
      <div class="kachel"><span class="kachel__name">Teilnahmen</span><strong class="kachel__wert">${a.gesamt}</strong></div>
      <div class="kachel"><span class="kachel__name">Gültig</span><strong class="kachel__wert">${a.gueltig}</strong><span class="kachel__info">Kontrollfrage richtig</span></div>
      <div class="kachel"><span class="kachel__name">Aussortiert</span><strong class="kachel__wert">${a.aussortiert}</strong><span class="kachel__info">Kontrollfrage falsch</span></div>
      <div class="kachel"><span class="kachel__name">Typische Dauer</span><strong class="kachel__wert">${minuten(a.dauerMedian)}</strong><span class="kachel__info">Median, Durchschnitt ${minuten(a.dauerSchnitt)}</span></div>
    </section>
    ${zaehlHinweis(a, zustand, filter)}

    ${a.gezaehlt === 0 ? `<section class="karte leer">
      <h2>Noch keine ${filter ? 'passenden ' : ''}Antworten</h2>
      <p>${filter ? 'Zu diesem Filter gibt es noch keine Antworten.' : 'Sobald jemand die Umfrage abschickt, erscheinen hier die Ergebnisse. Lade die Seite dann neu.'}</p>
    </section>` : ''}

    ${aussagen.length ? `<section class="karte">
      <h2>Kernaussagen für die Präsentation</h2>
      <p class="leise">Automatisch aus den ${a.gezaehlt} gezählten Antworten berechnet.</p>
      <ul class="aussagen">${aussagen.map((s) => `<li><strong>${e(s.wert)}</strong><span>${e(s.text)}</span></li>`).join('')}</ul>
    </section>` : ''}

    <div class="spalten">
      ${blick.length ? `<section class="karte">
        <h2>Häufigste Antwort pro Frage</h2>
        <table class="tabelle tabelle--blick">
          <thead><tr><th scope="col">Frage</th><th scope="col">Häufigste Antwort</th><th scope="col" class="rechts">Anteil</th></tr></thead>
          <tbody>${blick.map(({ ergebnis, vorne }) => `<tr>
            <th scope="row">${e(kurzname(ergebnis.frage))}</th>
            <td>${e(vorne.text)}</td>
            <td class="rechts">${vorne.skala ? '' : `<span class="mini"><span style="width:${(vorne.anteil * 100).toFixed(1)}%"></span></span> ${prozent.format(vorne.anteil)}`}</td>
          </tr>`).join('')}</tbody>
        </table>
        <p><a class="textlink" href="${adresse(zentrum, 'fragen', zustand)}">Alle Fragen mit Balken ansehen →</a></p>
      </section>` : ''}

      <div class="stapel">
        ${versionsErgebnis && versionsErgebnis.n ? `<section class="karte">
          <h2>Antworten pro Version</h2>
          <p class="leise">Über wessen Link kamen die Antworten?</p>
          ${frageBalken(versionsErgebnis)}
        </section>` : ''}
        ${tage.length ? `<section class="karte">
          <h2>Teilnahmen pro Tag</h2>
          ${balkenListe(tage.map((t) => ({
            name: e(t.text), anteil: t.anzahl / maxTag, anzahl: t.anzahl, zahl: `<strong>${t.anzahl}</strong>`,
            tip: `${t.text}: ${t.anzahl} ${t.anzahl === 1 ? 'Teilnahme' : 'Teilnahmen'}`,
          })), { klasse: 'balken--anzahl' })}
          <p class="leise">Erste Antwort ${e(datumZeit.format(new Date(a.erste)))} Uhr, letzte ${e(datumZeit.format(new Date(a.letzte)))} Uhr.</p>
        </section>` : ''}
        ${linkKarte(zentrum, basisUrl, eigenerPort)}
      </div>
    </div>`;
}

function alleFragen({ zentrum, alleSaetze, saetze, zustand, filter }) {
  const a = auswerten(alleSaetze, saetze, zentrum);
  const karten = a.ergebnisse.filter((ergebnis) => !ergebnis.frage.pseudo).map((ergebnis, i) => {
    const { frage } = ergebnis;
    const inhalt = frage.typ === 'text'
      ? `<p><a class="textlink" href="${adresse(zentrum, 'texte', zustand)}">${ergebnis.n} offene ${ergebnis.n === 1 ? 'Antwort' : 'Antworten'} lesen →</a></p>`
      : frageBalken(ergebnis);
    return `<section class="karte frage" id="frage-${e(frage.id)}">
      <h2><span class="nr">${i + 1}</span>${e(frage.text)}</h2>
      <p class="leise">${frageInfo(ergebnis)}</p>
      ${inhalt}
    </section>`;
  }).join('');
  return `${zaehlHinweis(a, zustand, filter)}<div class="fragen">${karten}</div>`;
}

function vergleich({ zentrum, saetze, zustand, abfrage }) {
  const waehlbar = fragenFuer(zentrum).filter((f) => istGeschlossen(f) && f.typ !== 'kontrolle');
  const finde = (id, ersatz) => waehlbar.find((f) => f.id === id) ?? waehlbar.find((f) => f.id === ersatz) ?? waehlbar[0];
  const frageA = finde(abfrage.get('a'), 'preis');
  let frageB = finde(abfrage.get('b'), zentrum.team ? 'version' : 'alter');
  if (frageB === frageA) frageB = waehlbar.find((f) => f !== frageA) ?? frageA;

  const auswahlFeld = (name, gewaehlt) => `<select name="${name}">${waehlbar.map((f) => `<option value="${e(f.id)}"${f === gewaehlt ? ' selected' : ''}>${e(kurzname(f))}</option>`).join('')}</select>`;
  const vorschlaege = [
    ['preis', 'alter'], ['produkte', 'plattform'], ['produkte', 'alter'], ['kanal', 'alter'], ['kaufgrund', 'zocken'],
    ...(zentrum.team ? [['alter', 'version'], ['produkte', 'version']] : []),
  ].filter(([x, y]) => waehlbar.some((f) => f.id === x) && waehlbar.some((f) => f.id === y))
    .map(([x, y]) => {
      const fx = waehlbar.find((f) => f.id === x);
      const fy = waehlbar.find((f) => f.id === y);
      const aktiv = fx === frageA && fy === frageB;
      return `<a class="pille${aktiv ? ' ist-aktiv' : ''}" href="${adresse(zentrum, 'vergleich', { ...zustand, a: x, b: y })}">${e(kurzname(fx))} nach ${e(kurzname(fy))}</a>`;
    }).join('');

  const k = kreuztabelle(saetze, frageA, frageB);
  const stufe = (anteil) => (anteil == null || anteil === 0 ? 0 : Math.min(5, Math.ceil(anteil * 5)));
  const zelle = (z, gruppe) => {
    if (z.anteil == null) return '<td class="zelle zelle--leer">–</td>';
    return `<td class="zelle stufe-${stufe(z.anteil)}${gruppe.n < 5 ? ' zelle--wenig' : ''}" data-tip="${e(`${z.anzahl} von ${gruppe.n} (${prozent.format(z.anteil)})`)}">${prozent.format(z.anteil)}</td>`;
  };

  // Lesebeispiel aus der größten Gruppe (ohne "Alle")
  let beispiel = '';
  const gruppenIndex = k.gruppen.map((g, i) => ({ g, i })).filter(({ g }) => !g.alle && g.n > 0)
    .sort((x, y) => y.g.n - x.g.n)[0];
  if (gruppenIndex) {
    const beste = [...k.zeilen].sort((x, y) => y.zellen[gruppenIndex.i].anzahl - x.zellen[gruppenIndex.i].anzahl)[0];
    const z = beste.zellen[gruppenIndex.i];
    beispiel = `<strong>So liest du die Tabelle:</strong> Von den ${gruppenIndex.g.n} Befragten mit „${e(kurzname(frageB))}: ${e(gruppenIndex.g.name)}“ haben ${prozent.format(z.anteil)} (${z.anzahl}) bei „${e(kurzname(frageA))}“ die Antwort „${e(beste.option)}“ gewählt.`;
  }
  const wenige = k.gruppen.some((g) => !g.alle && g.n > 0 && g.n < 5);

  return `
    <section class="karte nicht-drucken">
      <form class="vergleich-form" method="get" action="${adresse(zentrum, 'vergleich')}" data-sofort>
        ${zustand.alle ? '<input type="hidden" name="alle" value="1">' : ''}
        ${zustand.filter ? `<input type="hidden" name="filter" value="${e(zustand.filter)}">` : ''}
        <label><span>Diese Frage</span>${auswahlFeld('a', frageA)}</label>
        <label><span>aufteilen nach</span>${auswahlFeld('b', frageB)}</label>
        <button class="knopf knopf--klein" type="submit">Vergleichen</button>
      </form>
      ${vorschlaege ? `<p class="pillen"><span class="leise">Schnellauswahl:</span> ${vorschlaege}</p>` : ''}
    </section>
    <section class="karte">
      <h2>${e(kurzname(frageA))} nach ${e(kurzname(frageB))}</h2>
      <p class="leise">${e(frageA.text)} Aufgeteilt nach: ${e(frageB.text)}</p>
      ${saetze.length === 0 ? '<p>Noch keine Antworten zum Vergleichen.</p>' : `
      <div class="rollen">
        <table class="kreuz">
          <thead><tr>
            <th scope="col" class="kreuz__ecke">${e(kurzname(frageA))}</th>
            ${k.gruppen.map((g) => `<th scope="col"${g.alle ? ' class="kreuz__alle"' : ''}>${e(g.name)}<small>n = ${g.n}</small></th>`).join('')}
          </tr></thead>
          <tbody>
            ${k.zeilen.map((zeile) => `<tr><th scope="row">${e(zeile.option)}</th>${zeile.zellen.map((z, i) => zelle(z, k.gruppen[i])).join('')}</tr>`).join('')}
            ${k.schnitt ? `<tr class="kreuz__schnitt"><th scope="row">Durchschnitt</th>${k.schnitt.map((s) => `<td class="zelle">${s == null ? '–' : komma.format(s)}</td>`).join('')}</tr>` : ''}
          </tbody>
        </table>
      </div>
      <p class="skala-legende" aria-hidden="true"><span>0 %</span><i class="stufe-1"></i><i class="stufe-2"></i><i class="stufe-3"></i><i class="stufe-4"></i><i class="stufe-5"></i><span>100 %</span><span class="leise">Je dunkler, desto häufiger wurde die Antwort in dieser Gruppe gewählt.</span></p>
      <p class="leise">${beispiel}</p>
      <p class="leise">Die Prozente gelten pro Spalte. „n“ ist die Zahl der Befragten in der Gruppe.
        ${frageA.typ === 'mehrfach' ? ' Bei dieser Frage waren mehrere Antworten möglich, deshalb ergibt eine Spalte zusammen mehr als 100 %.' : ''}
        ${frageB.typ === 'mehrfach' ? ' Wer bei der Aufteilung mehrere Antworten gewählt hat, zählt in mehreren Spalten mit.' : ''}
        ${wenige ? ' Blass gedruckte Spalten haben weniger als 5 Befragte. Solche Werte sind Zufall und gehören nicht in die Präsentation.' : ''}</p>`}
    </section>`;
}

const kontextIds = ['alter', 'zocken'];
function marken(satz, zentrum) {
  return fragenFuer(zentrum)
    .filter((f) => f.pseudo || kontextIds.includes(f.id))
    .map((f) => wert(satz, f)).filter((w) => w != null && w !== '')
    .map((w) => `<span class="marke">${e(w)}</span>`).join('');
}

function texte({ zentrum, saetze }) {
  const offene = fragenFuer(zentrum).filter((f) => f.typ === 'text');
  if (offene.length === 0) return '<section class="karte"><p>Die Umfrage hat keine offene Frage.</p></section>';
  return offene.map((frage) => {
    const ergebnis = frageAuswerten(saetze, frage);
    const liste = [...ergebnis.texte].reverse();
    return `<section class="karte">
      <h2>${e(frage.text)}</h2>
      <p class="leise">${frageInfo(ergebnis)} · neueste zuerst</p>
      ${liste.length ? `<ol class="zitate">${liste.map((t) => `<li>
        <p>${e(t.text)}</p>
        <p class="zitate__meta">${marken(t.satz, zentrum)}<span class="leise">${e(datumZeit.format(new Date(t.satz.zeit)))} Uhr</span></p>
      </li>`).join('')}</ol>` : '<p>Noch keine Antworten auf die offene Frage.</p>'}
    </section>`;
  }).join('');
}

const HOECHSTENS = 300;
function einzelne({ zentrum, saetze }) {
  const spalten = fragenFuer(zentrum);
  const nummeriert = saetze.map((s, i) => ({ s, nr: i + 1 })).reverse();
  const gezeigt = nummeriert.slice(0, HOECHSTENS);
  const zelle = (s, f) => {
    const w = wert(s, f);
    const text = Array.isArray(w) ? w.join(', ') : (w ?? '');
    if (text === '') return '<td class="leise">–</td>';
    return f.typ === 'text' ? `<td class="lang">${e(text)}</td>` : `<td>${e(text)}</td>`;
  };
  return `<section class="karte">
    <h2>${saetze.length} ${saetze.length === 1 ? 'Antwort' : 'Antworten'}, neueste zuerst</h2>
    <p class="leise">Eine Zeile pro Teilnahme. Zum Weiterrechnen gibt es unter „Export &amp; Verwaltung“ alles als Datei für Excel.${nummeriert.length > HOECHSTENS ? ` Angezeigt werden die neuesten ${HOECHSTENS}.` : ''}</p>
    ${gezeigt.length ? `<div class="rollen">
      <table class="tabelle tabelle--breit">
        <thead><tr><th scope="col">Nr</th><th scope="col">Zeit</th><th scope="col">Dauer</th><th scope="col">Gültig</th>${spalten.map((f) => `<th scope="col" title="${e(f.text)}">${e(kurzname(f))}</th>`).join('')}</tr></thead>
        <tbody>${gezeigt.map(({ s, nr }) => `<tr${s.gueltig ? '' : ' class="ist-ungueltig"'}>
          <td>${nr}</td><td>${e(datumZeit.format(new Date(s.zeit)))}</td><td>${minuten(s.dauerSekunden)}</td><td>${s.gueltig ? 'ja' : 'nein'}</td>
          ${spalten.map((f) => zelle(s, f)).join('')}
        </tr>`).join('')}</tbody>
      </table>
    </div>` : '<p>Noch keine Antworten.</p>'}
  </section>`;
}

function exportAnsicht({ zentrum, alleSaetze, basisUrl, eigenerPort }) {
  return `
    <section class="karte">
      <h2>Antworten herunterladen</h2>
      <p>Alle ${alleSaetze.length} Antworten ${zentrum.team ? 'aller Versionen' : 'deiner Version'} als CSV-Datei. Sie lässt sich direkt in Excel öffnen (Umlaute und Spalten passen). Aussortierte Antworten sind dabei und in der Spalte „Gültig“ markiert.</p>
      <p class="knoepfe"><a class="knopf knopf--voll" href="${adresse(zentrum, 'antworten.csv')}">CSV für Excel herunterladen</a></p>
    </section>
    <section class="karte">
      <h2>Ergebnisse als PDF oder für Folien</h2>
      <p>Öffne die gewünschte Ansicht (zum Beispiel „Alle Fragen“) und drucke sie. Im Druckdialog „Als PDF speichern“ wählen. Menü und Filter werden nicht mitgedruckt.</p>
      <p class="knoepfe">
        <a class="knopf" href="${adresse(zentrum, '')}">Übersicht öffnen</a>
        <a class="knopf" href="${adresse(zentrum, 'fragen')}">Alle Fragen öffnen</a>
        <button class="knopf" type="button" data-drucken>Diese Seite drucken</button>
      </p>
    </section>
    ${linkKarte(zentrum, basisUrl, eigenerPort)}
    ${zentrum.team ? `<section class="karte">
      <h2>Antworten löschen</h2>
      <p>Im Team-Zentrum kann nichts gelöscht werden. Jede Version setzt ihre eigenen Antworten in ihrem eigenen Zentrum zurück.</p>
    </section>` : `<details class="karte gefahr">
      <summary>Alle Antworten dieser Version löschen (z. B. nach dem Testen)</summary>
      <p>Gelöscht werden nur die Antworten der Version „${e(zentrum.name)}“. Sie werden nicht endgültig gelöscht, sondern in eine Sicherungsdatei verschoben. Die Auswertung startet danach bei 0.</p>
      <form method="post" action="${adresse(zentrum, 'zuruecksetzen')}">
        <label>Zum Bestätigen <strong>LÖSCHEN</strong> eintippen:
          <input name="bestaetigung" autocomplete="off" required pattern="LÖSCHEN">
        </label>
        <button type="submit">Antworten zurücksetzen</button>
      </form>
    </details>`}`;
}

// --- Öffentliche Funktionen -----------------------------------------------------------

// Baut eine Ansicht des Zentrums. Gibt null zurück, wenn es die Ansicht nicht gibt.
export function zentrumSeite({ zentrum, ansicht, alleSaetze, abfrage, basisUrl, eigenerPort, warnung }) {
  const eintrag = ansichten.find((a) => a.id === ansicht);
  if (!eintrag) return null;
  const filter = filterLesen(abfrage.get('filter'), zentrum);
  const zustand = { alle: abfrage.get('alle') === '1' ? '1' : '', filter: filter?.schluessel ?? '' };
  const saetze = auswahl(alleSaetze, { auchUngueltige: Boolean(zustand.alle), filter });
  const daten = { zentrum, alleSaetze, saetze, zustand, filter, abfrage, basisUrl, eigenerPort };
  const stand = `Stand: ${e(datumZeit.format(new Date()))} Uhr`;
  const mitFilter = (versteckt) => filterLeiste({ zentrum, ansicht, zustand, filter, versteckt });

  let inhalt;
  let leiste = '';
  let untertitel = stand;
  switch (ansicht) {
    case '': inhalt = uebersicht(daten); leiste = mitFilter(); break;
    case 'fragen': inhalt = alleFragen(daten); leiste = mitFilter(); break;
    case 'vergleich':
      inhalt = vergleich(daten);
      leiste = mitFilter({ a: abfrage.get('a') ?? '', b: abfrage.get('b') ?? '' });
      untertitel = `Zwei Fragen miteinander vergleichen · ${stand}`;
      break;
    case 'texte': inhalt = texte(daten); leiste = mitFilter(); break;
    case 'antworten': inhalt = einzelne(daten); leiste = mitFilter(); break;
    case 'sekundaer':
      inhalt = sekundaerAnsicht({ saetze: auswahl(alleSaetze), euro, balkenListe });
      untertitel = 'Daten, die es schon gibt: Preise, Angebote und Bewertungen der Mitbewerber, dazu unser Einkaufspreis';
      break;
    case 'export': inhalt = exportAnsicht(daten); untertitel = stand; break;
    default: return null;
  }
  return rahmen({ zentrum, ansicht, titel: eintrag.name, untertitel, inhalt, zustand, warnung, leiste });
}

export function anmeldeSeite({ zentrum, fehler = '', gesperrt = false }) {
  const variable = passwortVariable(zentrum);
  return `${kopf(`Anmelden · Auswertungszentrum ${zentrum.name}`, '/zentrum.css')}
<body class="anmeldung">
  <main class="anmeldung__karte">
    <img src="/logo-lootlager.png" alt="LootLager" width="190" height="52">
    <p class="anmeldung__marke">Auswertungszentrum</p>
    <h1>${e(zentrum.name)}</h1>
    ${gesperrt ? `<p class="warnung">Dieses Zentrum ist noch gesperrt: In Railway fehlt die Variable <code>${e(variable)}</code>${zentrum.team ? '' : ' (oder <code>ADMIN_PASSWORT</code>)'}. Die Anleitung steht in <code>umfrage/README.md</code>.</p>` : `
    <form method="post" action="${adresse(zentrum, 'anmelden')}">
      <label for="passwort">Passwort</label>
      <input id="passwort" name="passwort" type="password" autocomplete="current-password" required autofocus>
      ${fehler ? `<p class="fehler" role="alert">${e(fehler)}</p>` : ''}
      <button class="knopf knopf--voll" type="submit">Anmelden</button>
    </form>`}
    <p class="anmeldung__andere">Anderes Zentrum: ${[TEAM, ...versionen].filter((z) => z.id !== zentrum.id).map((z) => `<a href="${adresse(z)}">${e(z.name)}</a>`).join(' · ')}</p>
  </main>
</body>
</html>`;
}

// Startseite ohne Version: Wer nur die Hauptadresse öffnet, wählt hier, von wem der Link kam.
export function auswahlSeite() {
  return `${kopf('Kurze Umfrage · LootLager', '/umfrage.css')}
<body data-zustand="start">
  <div class="seite">
    <aside class="buehne">
      <span class="buehne__logo"><img src="/logo-lootlager.png" alt="LootLager" width="160" height="44"></span>
      <div class="buehne__inhalt">
        <img class="buehne__truhe" src="/hero-truhe.webp" alt="" width="460" height="460">
        <p class="buehne__spruch">Level up <span>dein Setup.</span></p>
        <p class="buehne__text">Gaming-Zubehör mit deinem eigenen Design.</p>
      </div>
    </aside>
    <main class="arbeit">
      <section class="karte">
        <p class="marke">Unternehmen · E-Commerce</p>
        <h1>Von wem hast du den Link bekommen?</h1>
        <p>Unsere Umfrage dauert 2 Minuten und ist anonym. Tippe auf den Namen, dann geht es los.</p>
        <div class="optionen">${versionen.map((v) => `<a class="option" href="/${v.id}">${e(v.name)}</a>`).join('')}</div>
      </section>
    </main>
  </div>
</body>
</html>`;
}
