// LootLager-Umfrage: kleiner Webserver ohne zusätzliche Pakete (nur Node.js).
//
//   /nick, /noah, /luca            die Umfrage, je Version ein eigener Link
//   /nick/auswertung (usw.)        das Auswertungszentrum der Version, mit eigenem Passwort
//   /team/auswertung               alle Versionen zusammen
//   /                              Auswahl, falls jemand nur die Hauptadresse öffnet
//
// Die Versionen stehen in versionen.js, die Fragen in fragen.js.
import http from 'node:http';
import crypto from 'node:crypto';
import path from 'node:path';
import { readFile, appendFile, mkdir, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { oeffentlicheFragen, pruefeAntworten, istGueltig } from './fragen.js';
import { versionen, TEAM, versionVon, zentrumVon, passwortVon, passwortVariable } from './versionen.js';
import { alsCsv, escapeHtml } from './auswertung.js';
import { zentrumSeite, anmeldeSeite, auswahlSeite, adresse } from './seiten.js';

const hier = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

// Auf Railway bleibt eine Datei nur erhalten, wenn ein Volume angehängt ist.
// Railway setzt dann RAILWAY_VOLUME_MOUNT_PATH automatisch.
const datenOrdner = process.env.DATEN_ORDNER || process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(hier, 'daten');
const antwortDatei = (version) => path.join(datenOrdner, `antworten-${version.id}.jsonl`);
const aufRailway = Boolean(process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_PROJECT_ID);
const ohneVolume = aufRailway && !process.env.RAILWAY_VOLUME_MOUNT_PATH && !process.env.DATEN_ORDNER;

const statisch = {
  '/umfrage.css': ['umfrage.css', 'text/css; charset=utf-8'],
  '/umfrage.js': ['umfrage.js', 'text/javascript; charset=utf-8'],
  '/zentrum.css': ['zentrum.css', 'text/css; charset=utf-8'],
  '/zentrum.js': ['zentrum.js', 'text/javascript; charset=utf-8'],
  '/logo-lootlager.png': ['logo-lootlager.png', 'image/png'],
  '/hero-truhe.webp': ['hero-truhe.webp', 'image/webp'],
  '/favicon.png': ['favicon.png', 'image/png'],
  '/apple-touch-icon.png': ['apple-touch-icon.png', 'image/png'],
};

const sicherheit = {
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; " +
    "connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
  'X-Content-Type-Options': 'nosniff',
  // same-origin: Nach außen wird keine Herkunft verraten. Formulare dieser Seite schicken sie aber mit,
  // daran erkennt der Server, dass ein Formular wirklich von hier kommt.
  'Referrer-Policy': 'same-origin',
  // Die Umfrage wird nur per Link geteilt, Suchmaschinen sollen sie nicht aufnehmen.
  'X-Robots-Tag': 'noindex, nofollow',
};

function senden(res, status, inhalt, typ, extra = {}) {
  res.writeHead(status, { 'Content-Type': typ, 'Cache-Control': 'no-store', ...sicherheit, ...extra });
  res.end(inhalt);
}
const text = (res, status, inhalt, extra) => senden(res, status, inhalt, 'text/plain; charset=utf-8', extra);
const html = (res, status, inhalt, extra) => senden(res, status, inhalt, 'text/html; charset=utf-8', extra);
const json = (res, status, daten) => senden(res, status, JSON.stringify(daten), 'application/json; charset=utf-8');
function weiterleiten(res, ziel, extra = {}) {
  res.writeHead(303, { Location: ziel, 'Cache-Control': 'no-store', ...sicherheit, ...extra });
  res.end();
}

function koerperLesen(req, grenze = 16 * 1024) {
  return new Promise((resolve, reject) => {
    let groesse = 0;
    const teile = [];
    req.on('data', (stueck) => {
      groesse += stueck.length;
      if (groesse > grenze) {
        reject(Object.assign(new Error('zu groß'), { status: 413 }));
        req.destroy();
        return;
      }
      teile.push(stueck);
    });
    req.on('end', () => resolve(Buffer.concat(teile).toString('utf8')));
    req.on('error', reject);
  });
}

// --- Speichern: pro Version eine Datei, eine Zeile pro Teilnahme (JSON Lines) -----------
let schreibKette = Promise.resolve();
function speichern(version, satz) {
  const auftrag = schreibKette.then(async () => {
    await mkdir(datenOrdner, { recursive: true });
    await appendFile(antwortDatei(version), JSON.stringify(satz) + '\n', 'utf8');
  });
  schreibKette = auftrag.catch(() => {});
  return auftrag;
}

async function antwortenVon(version) {
  let inhalt;
  try {
    inhalt = await readFile(antwortDatei(version), 'utf8');
  } catch (fehler) {
    if (fehler.code === 'ENOENT') return [];
    throw fehler;
  }
  return inhalt.split('\n').flatMap((zeile) => {
    if (!zeile.trim()) return [];
    try { return [{ ...JSON.parse(zeile), version: version.id }]; } catch { return []; }
  });
}

// Antworten eines Zentrums: eine Version oder (Team) alle zusammen, nach Zeit sortiert.
async function antwortenFuer(zentrum) {
  if (!zentrum.team) return antwortenVon(zentrum);
  const alle = (await Promise.all(versionen.map(antwortenVon))).flat();
  return alle.sort((a, b) => String(a.zeit).localeCompare(String(b.zeit)));
}

// --- Wer fragt an? ------------------------------------------------------------------------
// Railway reicht die Adresse des Geräts in X-Real-IP durch. Sie wird nur kurz im Arbeitsspeicher
// zum Zählen benutzt (Schutz gegen Spam und Passwort-Raten) und nie gespeichert.
function geraet(req) {
  return String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '')
    .split(',')[0].trim();
}

function zaehlerBauen(fensterMs, grenze) {
  const eintraege = new Map();
  return {
    zuViele(schluessel) {
      const eintrag = eintraege.get(schluessel);
      return Boolean(eintrag) && Date.now() - eintrag.start <= fensterMs && eintrag.anzahl >= grenze;
    },
    zaehlen(schluessel) {
      const jetzt = Date.now();
      const eintrag = eintraege.get(schluessel);
      if (!eintrag || jetzt - eintrag.start > fensterMs) {
        if (eintraege.size > 5000) eintraege.clear();
        eintraege.set(schluessel, { start: jetzt, anzahl: 1 });
      } else {
        eintrag.anzahl += 1;
      }
    },
  };
}
const antwortZaehler = zaehlerBauen(10 * 60 * 1000, 20); // höchstens 20 Antworten pro 10 Minuten und Gerät
const fehlversuche = zaehlerBauen(10 * 60 * 1000, 8); // höchstens 8 falsche Passwörter pro 10 Minuten und Gerät
const fehlversucheGesamt = zaehlerBauen(10 * 60 * 1000, 60); // und 60 insgesamt

// --- Anmeldung im Auswertungszentrum -------------------------------------------------------
// Nach dem Passwort bekommt der Browser ein Cookie, das 12 Stunden gilt und nur für dieses
// Zentrum passt. Der Schlüssel entsteht bei jedem Start neu: Nach einem neuen Deploy
// muss man sich einmal neu anmelden.
const SITZUNG_SEKUNDEN = 12 * 60 * 60;
const sitzungSchluessel = crypto.randomBytes(32);
const cookieName = (zentrum) => `lootlager_${zentrum.id}`;
const siegel = (inhalt) => crypto.createHmac('sha256', sitzungSchluessel).update(inhalt).digest();

function sitzungErstellen(zentrum) {
  const inhalt = `${zentrum.id}.${Date.now() + SITZUNG_SEKUNDEN * 1000}`;
  return `${inhalt}.${siegel(inhalt).toString('base64url')}`;
}

function istAngemeldet(req, zentrum) {
  const cookies = String(req.headers.cookie || '').split(';').map((c) => c.trim());
  const eigenes = cookies.find((c) => c.startsWith(`${cookieName(zentrum)}=`));
  if (!eigenes) return false;
  const [id, ablauf, unterschrift, ...rest] = eigenes.slice(cookieName(zentrum).length + 1).split('.');
  if (rest.length || id !== zentrum.id || !/^\d{1,16}$/.test(ablauf || '') || !unterschrift) return false;
  const soll = siegel(`${id}.${ablauf}`);
  const ist = Buffer.from(unterschrift, 'base64url');
  return ist.length === soll.length && crypto.timingSafeEqual(ist, soll) && Number(ablauf) > Date.now();
}

const istHttps = (req) => String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';
function cookieSetzen(req, zentrum, inhalt, sekunden) {
  return `${cookieName(zentrum)}=${inhalt}; Path=/${zentrum.id}/auswertung; Max-Age=${sekunden}; HttpOnly; SameSite=Lax${istHttps(req) ? '; Secure' : ''}`;
}

const hash = (inhalt) => crypto.createHash('sha256').update(String(inhalt), 'utf8').digest();
const passwortStimmt = (eingabe, zentrum) => crypto.timingSafeEqual(hash(eingabe), hash(passwortVon(zentrum)));
const warten = (ms) => new Promise((fertig) => { setTimeout(fertig, ms); });

// Formulare nur von dieser Seite selbst annehmen
function fremdeHerkunft(req) {
  const herkunft = req.headers.origin;
  if (!herkunft) return false;
  const eigene = [req.headers.host, String(req.headers['x-forwarded-host'] || '').split(',')[0].trim()].filter(Boolean);
  try { return !eigene.includes(new URL(herkunft).host); } catch { return true; }
}

function basisUrl(req) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  const sauber = /^[a-z0-9.-]+(:\d{1,5})?$/i.test(host) ? host : 'localhost';
  return `${istHttps(req) ? 'https' : 'http'}://${sauber}`;
}

function warnungText() {
  if (!ohneVolume) return '';
  return '<strong>Achtung: Kein Volume angehängt.</strong> Die Antworten gehen beim nächsten Deploy oder Neustart verloren. ' +
    'In Railway beim Dienst ein Volume mit dem Pfad <code>/daten</code> anlegen (Anleitung in umfrage/README.md).';
}

// --- Das Auswertungszentrum ----------------------------------------------------------------
async function zentrumBearbeiten(req, res, url, zentrum, ansicht) {
  const anmeldeAdresse = adresse(zentrum, 'anmelden');
  const gesperrt = !passwortVon(zentrum);

  if (ansicht === 'anmelden') {
    if (req.method === 'GET') {
      if (!gesperrt && istAngemeldet(req, zentrum)) return weiterleiten(res, adresse(zentrum));
      return html(res, gesperrt ? 503 : 200, anmeldeSeite({ zentrum, gesperrt }));
    }
    if (req.method === 'POST') {
      if (gesperrt) return html(res, 503, anmeldeSeite({ zentrum, gesperrt }));
      if (fremdeHerkunft(req)) return text(res, 403, 'Nicht erlaubt.');
      const wer = geraet(req);
      if (fehlversuche.zuViele(wer) || fehlversucheGesamt.zuViele('alle')) {
        return html(res, 429, anmeldeSeite({ zentrum, fehler: 'Zu viele falsche Versuche. Bitte in 10 Minuten noch einmal probieren.' }));
      }
      const form = new URLSearchParams(await koerperLesen(req, 4 * 1024));
      if (!passwortStimmt(form.get('passwort') ?? '', zentrum)) {
        fehlversuche.zaehlen(wer);
        fehlversucheGesamt.zaehlen('alle');
        await warten(400);
        return html(res, 401, anmeldeSeite({ zentrum, fehler: 'Das Passwort stimmt nicht.' }));
      }
      return weiterleiten(res, adresse(zentrum), {
        'Set-Cookie': cookieSetzen(req, zentrum, sitzungErstellen(zentrum), SITZUNG_SEKUNDEN),
      });
    }
    return text(res, 405, 'Nicht erlaubt.');
  }

  if (ansicht === 'abmelden' && req.method === 'POST') {
    return weiterleiten(res, anmeldeAdresse, { 'Set-Cookie': cookieSetzen(req, zentrum, 'weg', 0) });
  }

  if (gesperrt || !istAngemeldet(req, zentrum)) {
    if (req.method === 'GET') return weiterleiten(res, anmeldeAdresse);
    return text(res, 401, 'Bitte zuerst anmelden.');
  }

  if (req.method === 'GET' && ansicht === 'antworten.csv') {
    const tag = new Date().toISOString().slice(0, 10);
    return senden(res, 200, alsCsv(await antwortenFuer(zentrum)), 'text/csv; charset=utf-8', {
      'Content-Disposition': `attachment; filename="lootlager-umfrage-${zentrum.id}-${tag}.csv"`,
    });
  }

  if (req.method === 'POST' && ansicht === 'zuruecksetzen') {
    if (fremdeHerkunft(req)) return text(res, 403, 'Nicht erlaubt.');
    if (zentrum.team) return text(res, 400, 'Im Team-Zentrum kann nichts gelöscht werden. Bitte im Zentrum der einzelnen Version zurücksetzen.');
    const form = new URLSearchParams(await koerperLesen(req));
    if (form.get('bestaetigung') !== 'LÖSCHEN') {
      return text(res, 400, 'Zum Löschen bitte genau LÖSCHEN eintippen.');
    }
    const stempel = new Date().toISOString().replaceAll(':', '-').slice(0, 19);
    // In der Schreib-Kette, damit keine gerade eingehende Antwort dazwischenkommt
    const auftrag = schreibKette.then(async () => {
      try {
        await rename(antwortDatei(zentrum), path.join(datenOrdner, `sicherung-${zentrum.id}-${stempel}.jsonl`));
      } catch (fehler) {
        if (fehler.code !== 'ENOENT') throw fehler;
      }
    });
    schreibKette = auftrag.catch(() => {});
    await auftrag;
    return weiterleiten(res, adresse(zentrum));
  }

  if (req.method === 'GET') {
    const seite = zentrumSeite({
      zentrum,
      ansicht,
      alleSaetze: await antwortenFuer(zentrum),
      abfrage: url.searchParams,
      basisUrl: basisUrl(req),
      warnung: warnungText(),
    });
    if (seite) return html(res, 200, seite);
  }
  return text(res, 404, 'Diese Ansicht gibt es nicht.');
}

// --- Anfragen verteilen ---------------------------------------------------------------------
let umfrageVorlage;
async function umfrageSeite(version) {
  umfrageVorlage ??= await readFile(path.join(hier, 'public', 'index.html'), 'utf8');
  return umfrageVorlage
    .replaceAll('{{VERSION}}', escapeHtml(version.id))
    .replaceAll('{{NAME}}', escapeHtml(version.name));
}

async function bearbeiten(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const weg = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname;
  const teile = weg.split('/').filter(Boolean);

  if (req.method === 'GET' && statisch[weg]) {
    const [datei, typ] = statisch[weg];
    const inhalt = await readFile(path.join(hier, 'public', datei));
    const cache = typ.startsWith('image/') ? { 'Cache-Control': 'public, max-age=86400' } : {};
    return senden(res, 200, inhalt, typ, cache);
  }

  if (req.method === 'GET' && weg === '/') return html(res, 200, auswahlSeite());
  if (req.method === 'GET' && weg === '/gesund') return text(res, 200, 'ok');
  if (req.method === 'GET' && weg === '/api/fragen') return json(res, 200, oeffentlicheFragen());

  if (req.method === 'POST' && weg === '/api/antwort') {
    const wer = geraet(req);
    if (antwortZaehler.zuViele(wer)) return json(res, 429, { fehler: 'Zu viele Antworten von diesem Gerät. Bitte später noch einmal.' });
    let eingang;
    try {
      eingang = JSON.parse(await koerperLesen(req));
    } catch (fehler) {
      return json(res, fehler.status || 400, { fehler: 'Die Antwort konnte nicht gelesen werden.' });
    }
    const version = versionVon(typeof eingang?.version === 'string' ? eingang.version : '');
    if (!version) return json(res, 400, { fehler: 'Diese Version der Umfrage gibt es nicht. Bitte den Link noch einmal öffnen.' });
    const { antworten, fehler } = pruefeAntworten(eingang.antworten);
    if (fehler) return json(res, 400, { fehler });
    antwortZaehler.zaehlen(wer);
    const dauer = Number(eingang.dauerSekunden);
    await speichern(version, {
      id: crypto.randomUUID(),
      zeit: new Date().toISOString(),
      dauerSekunden: Number.isFinite(dauer) && dauer > 0 ? Math.min(Math.round(dauer), 3600) : null,
      gueltig: istGueltig(antworten),
      antworten,
    });
    return json(res, 201, { ok: true });
  }

  // Alte Adresse aus der ersten Fassung
  if (req.method === 'GET' && teile[0] === 'auswertung') return weiterleiten(res, adresse(TEAM));

  // /nick  →  Umfrage der Version
  if (req.method === 'GET' && teile.length === 1 && versionVon(teile[0])) {
    return html(res, 200, await umfrageSeite(versionVon(teile[0])));
  }

  // /nick/auswertung/...  und  /team/auswertung/...
  if (teile[1] === 'auswertung' && teile.length <= 3) {
    const zentrum = zentrumVon(teile[0]);
    if (zentrum) return zentrumBearbeiten(req, res, url, zentrum, teile[2] ?? '');
  }

  return text(res, 404, `Nicht gefunden: ${weg}`);
}

const server = http.createServer((req, res) => {
  bearbeiten(req, res).catch((fehler) => {
    console.error(fehler);
    if (!res.headersSent) text(res, fehler.status === 413 ? 413 : 500, fehler.status === 413 ? 'Zu groß.' : 'Serverfehler');
    else res.end();
  });
});

server.listen(PORT, () => {
  console.log(`LootLager-Umfrage läuft auf Port ${PORT}`);
  console.log(`Versionen: ${versionen.map((v) => `/${v.id}`).join(', ')} · Antworten liegen in: ${datenOrdner}`);
  for (const zentrum of [TEAM, ...versionen]) {
    if (!passwortVon(zentrum)) {
      console.warn(`Hinweis: ${passwortVariable(zentrum)} ist nicht gesetzt, /${zentrum.id}/auswertung ist deshalb gesperrt.`);
    }
  }
  if (ohneVolume) console.warn('Achtung: Kein Railway-Volume angehängt. Antworten gehen beim nächsten Deploy verloren.');
});
