// Umfrage im Browser: eine Frage pro Bildschirm, Antippen geht direkt weiter.
'use strict';

const SCHON_DABEI = 'lootlager-umfrage-erledigt';
const app = document.getElementById('app');
const startKarte = document.getElementById('start');
const losKnopf = document.getElementById('los');

let fragen = [];
let schritt = 0;
let startZeit = 0;
const antworten = {};

function speicherLesen(schluessel) {
  try { return localStorage.getItem(schluessel); } catch { return null; }
}
function speicherSchreiben(schluessel, wert) {
  try {
    if (wert == null) localStorage.removeItem(schluessel);
    else localStorage.setItem(schluessel, wert);
  } catch { /* privater Modus: egal */ }
}

function el(tag, klasse, text) {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (text != null) e.textContent = text;
  return e;
}

function knopf(text, klasse = 'knopf') {
  const b = el('button', klasse, text);
  b.type = 'button';
  return b;
}

function zeigen(karte) {
  app.replaceChildren(karte);
  const titel = karte.querySelector('h1, h2');
  if (titel) {
    titel.tabIndex = -1;
    titel.focus({ preventScroll: true });
  }
  window.scrollTo({ top: 0 });
}

function istBeantwortet(frage) {
  const wert = antworten[frage.id];
  if (frage.typ === 'text') return true;
  if (frage.typ === 'mehrfach') return Array.isArray(wert) && wert.length > 0;
  return wert != null;
}

function weiter() {
  if (schritt < fragen.length - 1) {
    schritt += 1;
    frageZeigen();
  } else {
    absenden();
  }
}

function zurueck() {
  if (schritt > 0) {
    schritt -= 1;
    frageZeigen();
  } else {
    zeigen(startKarte);
  }
}

function frageZeigen() {
  const frage = fragen[schritt];
  const letzte = schritt === fragen.length - 1;
  const karte = el('section', 'karte');

  // Fortschritt
  const leiste = el('div', 'fortschritt');
  const navi = el('div', 'fortschritt__zeile');
  const zurueckKnopf = knopf('‹ Zurück', 'link');
  zurueckKnopf.addEventListener('click', zurueck);
  const zaehler = el('span', 'fortschritt__text', `Frage ${schritt + 1} von ${fragen.length}`);
  navi.append(zurueckKnopf, zaehler);
  const spur = el('div', 'fortschritt__spur');
  const fuellung = el('div', 'fortschritt__fuellung');
  fuellung.style.width = `${(schritt / fragen.length) * 100}%`;
  spur.append(fuellung);
  spur.setAttribute('role', 'progressbar');
  spur.setAttribute('aria-valuemin', '0');
  spur.setAttribute('aria-valuemax', String(fragen.length));
  spur.setAttribute('aria-valuenow', String(schritt));
  leiste.append(navi, spur);

  const titel = el('h2', 'frage', frage.text);
  karte.append(leiste, titel);
  if (frage.hinweis) karte.append(el('p', 'hinweis', frage.hinweis));

  const fertigKnopf = knopf(letzte ? 'Absenden' : 'Weiter', 'knopf knopf--gross');
  fertigKnopf.addEventListener('click', weiter);

  if (frage.typ === 'einfach' || frage.typ === 'kontrolle') {
    const liste = el('div', 'optionen');
    for (const option of frage.optionen) {
      const b = knopf(option, 'option');
      b.setAttribute('aria-pressed', String(antworten[frage.id] === option));
      b.addEventListener('click', () => {
        antworten[frage.id] = option;
        liste.querySelectorAll('.option').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
        liste.classList.add('gesperrt');
        setTimeout(weiter, 220);
      });
      liste.append(b);
    }
    karte.append(liste);
  }

  if (frage.typ === 'mehrfach') {
    const gewaehlt = new Set(antworten[frage.id] || []);
    const liste = el('div', 'optionen');
    const aktualisieren = () => {
      antworten[frage.id] = frage.optionen.filter((o) => gewaehlt.has(o));
      liste.querySelectorAll('.option').forEach((o) => o.setAttribute('aria-pressed', String(gewaehlt.has(o.dataset.wert))));
      fertigKnopf.disabled = gewaehlt.size === 0;
    };
    for (const option of frage.optionen) {
      const b = knopf(option, 'option option--mehrfach');
      b.dataset.wert = option;
      b.addEventListener('click', () => {
        if (gewaehlt.has(option)) {
          gewaehlt.delete(option);
        } else if (option === frage.exklusiv) {
          gewaehlt.clear();
          gewaehlt.add(option);
        } else {
          gewaehlt.delete(frage.exklusiv);
          gewaehlt.add(option);
        }
        aktualisieren();
      });
      liste.append(b);
    }
    karte.append(liste, fertigKnopf);
    aktualisieren();
  }

  if (frage.typ === 'skala') {
    const reihe = el('div', 'skala');
    for (let stufe = 1; stufe <= 5; stufe += 1) {
      const b = knopf(String(stufe), 'option option--skala');
      b.setAttribute('aria-pressed', String(antworten[frage.id] === stufe));
      if (stufe === 1) b.setAttribute('aria-label', `1, ${frage.min}`);
      if (stufe === 5) b.setAttribute('aria-label', `5, ${frage.max}`);
      b.addEventListener('click', () => {
        antworten[frage.id] = stufe;
        reihe.querySelectorAll('.option').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
        reihe.classList.add('gesperrt');
        setTimeout(weiter, 220);
      });
      reihe.append(b);
    }
    const legende = el('div', 'skala__legende');
    legende.setAttribute('aria-hidden', 'true');
    legende.append(el('span', '', `1 = ${frage.min}`), el('span', '', `5 = ${frage.max}`));
    karte.append(reihe, legende);
  }

  if (frage.typ === 'text') {
    const max = frage.maxLaenge || 500;
    const feld = el('textarea', 'textfeld');
    feld.rows = 4;
    feld.maxLength = max;
    feld.placeholder = 'Deine Antwort (freiwillig)';
    feld.setAttribute('aria-label', frage.text);
    feld.value = antworten[frage.id] || '';
    const rest = el('p', 'zeichen', '');
    const zaehlen = () => {
      antworten[frage.id] = feld.value;
      rest.textContent = `${feld.value.length} / ${max} Zeichen`;
    };
    feld.addEventListener('input', zaehlen);
    zaehlen();
    karte.append(feld, rest, fertigKnopf);
  }

  // Wer mit "Zurück" auf eine schon beantwortete Frage kommt, kann auch ohne neues Antippen weiter
  if ((frage.typ === 'einfach' || frage.typ === 'kontrolle' || frage.typ === 'skala') && istBeantwortet(frage)) {
    karte.append(fertigKnopf);
  }

  zeigen(karte);
}

async function absenden() {
  const karte = el('section', 'karte karte--mitte');
  karte.append(el('h2', '', 'Wird gesendet …'));
  zeigen(karte);

  const fehlend = fragen.find((f) => !istBeantwortet(f));
  if (fehlend) {
    schritt = fragen.indexOf(fehlend);
    frageZeigen();
    return;
  }

  try {
    const antwort = await fetch('/api/antwort', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ antworten, dauerSekunden: Math.round((Date.now() - startZeit) / 1000) }),
    });
    const daten = await antwort.json().catch(() => ({}));
    if (!antwort.ok) throw new Error(daten.fehler || `Fehler ${antwort.status}`);
    speicherSchreiben(SCHON_DABEI, new Date().toISOString());
    dankeZeigen();
  } catch (fehler) {
    const fehlerKarte = el('section', 'karte karte--mitte');
    fehlerKarte.append(
      el('h2', '', 'Das hat leider nicht geklappt'),
      el('p', 'fehler', String(fehler.message || fehler)),
      el('p', '', 'Deine Antworten sind noch da. Prüf kurz dein Internet und versuch es noch einmal.'),
    );
    const nochmal = knopf('Noch einmal senden', 'knopf knopf--gross');
    nochmal.addEventListener('click', absenden);
    fehlerKarte.append(nochmal);
    zeigen(fehlerKarte);
  }
}

function teilenKnopf() {
  const b = knopf('Umfrage mit Freunden teilen', 'knopf knopf--hell');
  b.addEventListener('click', async () => {
    const daten = { title: 'LootLager-Umfrage', text: 'Hast du 2 Minuten für unser Unternehmen LootLager?', url: location.origin };
    try {
      if (navigator.share) {
        await navigator.share(daten);
      } else {
        await navigator.clipboard.writeText(daten.url);
        b.textContent = 'Link kopiert ✓';
      }
    } catch { /* abgebrochen */ }
  });
  return b;
}

function dankeZeigen() {
  const karte = el('section', 'karte karte--mitte');
  karte.append(
    el('p', 'gross', '🎉'),
    el('h2', '', 'Danke, das war’s schon!'),
    el('p', '', 'Deine Antworten sind gespeichert und helfen unserem Unternehmen sehr.'),
    teilenKnopf(),
  );
  zeigen(karte);
}

function schonDabeiZeigen() {
  const karte = el('section', 'karte karte--mitte');
  karte.append(
    el('p', 'gross', '✅'),
    el('h2', '', 'Du hast schon mitgemacht. Danke!'),
    el('p', '', 'Pro Person bitte nur einmal ausfüllen, sonst stimmt unsere Auswertung nicht.'),
    teilenKnopf(),
  );
  const neu = knopf('Jemand anderes nutzt dieses Handy und will auch mitmachen', 'link link--klein');
  neu.addEventListener('click', () => {
    speicherSchreiben(SCHON_DABEI, null);
    location.reload();
  });
  karte.append(neu);
  zeigen(karte);
}

async function laden() {
  if (speicherLesen(SCHON_DABEI)) {
    schonDabeiZeigen();
    return;
  }
  try {
    const antwort = await fetch('/api/fragen');
    if (!antwort.ok) throw new Error();
    fragen = await antwort.json();
  } catch {
    startKarte.append(el('p', 'fehler', 'Die Fragen konnten nicht geladen werden. Bitte lade die Seite neu.'));
    return;
  }
  const fakten = startKarte.querySelector('.fakten li');
  if (fakten) fakten.lastChild.textContent = ` ${fragen.length} Fragen, ca. 2 Minuten`;
  losKnopf.disabled = false;
  losKnopf.addEventListener('click', () => {
    if (!startZeit) startZeit = Date.now();
    schritt = 0;
    frageZeigen();
  });
}

laden();
