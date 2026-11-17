// LootLager-Umfrage: kleiner Webserver ohne zusätzliche Pakete (nur Node.js).
//   /                         die Umfrage (für alle, die den Link haben)
//   /auswertung               Ergebnisse, geschützt mit ADMIN_PASSWORT
//   /auswertung/antworten.csv alle Antworten als Excel-Datei (CSV)
import http from 'node:http';
import crypto from 'node:crypto';
import path from 'node:path';
import { readFile, appendFile, mkdir, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { oeffentlicheFragen, pruefeAntworten, istGueltig } from './fragen.js';
import { auswertungSeite, alsCsv, escapeHtml } from './auswertung.js';

const hier = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const ADMIN_PASSWORT = process.env.ADMIN_PASSWORT || '';

// Auf Railway bleibt eine Datei nur erhalten, wenn ein Volume angehängt ist.
// Railway setzt dann RAILWAY_VOLUME_MOUNT_PATH automatisch.
const datenOrdner = process.env.DATEN_ORDNER || process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(hier, 'daten');
const antwortDatei = path.join(datenOrdner, 'antworten.jsonl');
const aufRailway = Boolean(process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_PROJECT_ID);
const ohneVolume = aufRailway && !process.env.RAILWAY_VOLUME_MOUNT_PATH && !process.env.DATEN_ORDNER;

const statisch = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/umfrage.css': ['umfrage.css', 'text/css; charset=utf-8'],
  '/umfrage.js': ['umfrage.js', 'text/javascript; charset=utf-8'],
  '/auswertung.css': ['auswertung.css', 'text/css; charset=utf-8'],
  '/logo-lootlager.png': ['logo-lootlager.png', 'image/png'],
  '/favicon.png': ['favicon.png', 'image/png'],
  '/apple-touch-icon.png': ['apple-touch-icon.png', 'image/png'],
};

const sicherheit = {
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; " +
    "connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  // Die Umfrage wird nur per Link geteilt, Suchmaschinen sollen sie nicht aufnehmen.
  'X-Robots-Tag': 'noindex, nofollow',
};

function senden(res, status, inhalt, typ, extra = {}) {
  res.writeHead(status, { 'Content-Type': typ, 'Cache-Control': 'no-store', ...sicherheit, ...extra });
  res.end(inhalt);
}

const json = (res, status, daten) => senden(res, status, JSON.stringify(daten), 'application/json; charset=utf-8');

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

// --- Speichern: eine Zeile pro Teilnahme (JSON Lines) ---------------------------------
let schreibKette = Promise.resolve();
function speichern(satz) {
  const auftrag = schreibKette.then(async () => {
    await mkdir(datenOrdner, { recursive: true });
    await appendFile(antwortDatei, JSON.stringify(satz) + '\n', 'utf8');
  });
  schreibKette = auftrag.catch(() => {});
  return auftrag;
}

async function alleAntworten() {
  let text;
  try {
    text = await readFile(antwortDatei, 'utf8');
  } catch (fehler) {
    if (fehler.code === 'ENOENT') return [];
    throw fehler;
  }
  return text.split('\n').flatMap((zeile) => {
    if (!zeile.trim()) return [];
    try { return [JSON.parse(zeile)]; } catch { return []; }
  });
}

// --- Einfacher Schutz gegen Spam: höchstens 20 Antworten pro 10 Minuten und Gerät ------
// Die IP-Adresse wird nur kurz im Arbeitsspeicher gehalten und nie gespeichert.
const zaehler = new Map();
function zuViele(req) {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const jetzt = Date.now();
  const eintrag = zaehler.get(ip);
  if (!eintrag || jetzt - eintrag.start > 10 * 60 * 1000) {
    zaehler.set(ip, { start: jetzt, anzahl: 1 });
    if (zaehler.size > 5000) zaehler.clear();
    return false;
  }
  eintrag.anzahl += 1;
  return eintrag.anzahl > 20;
}

// --- Passwort für die Auswertung (HTTP Basic Auth) ------------------------------------
function hash(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest();
}
function istAdmin(req) {
  const kopf = req.headers.authorization || '';
  if (!kopf.startsWith('Basic ')) return false;
  const dekodiert = Buffer.from(kopf.slice(6), 'base64').toString('utf8');
  const passwort = dekodiert.slice(dekodiert.indexOf(':') + 1);
  return crypto.timingSafeEqual(hash(passwort), hash(ADMIN_PASSWORT));
}
function adminPruefen(req, res) {
  if (!ADMIN_PASSWORT) {
    senden(res, 503, 'Die Auswertung ist gesperrt: In Railway fehlt die Variable ADMIN_PASSWORT.', 'text/plain; charset=utf-8');
    return false;
  }
  if (!istAdmin(req)) {
    senden(res, 401, 'Passwort nötig. Den Benutzernamen könnt ihr leer lassen.', 'text/plain; charset=utf-8', {
      'WWW-Authenticate': 'Basic realm="LootLager Auswertung", charset="UTF-8"',
    });
    return false;
  }
  return true;
}

function warnungText() {
  if (ohneVolume) {
    return '<strong>Achtung: Kein Volume angehängt.</strong> Die Antworten gehen beim nächsten Deploy oder Neustart verloren. ' +
      'In Railway beim Dienst ein Volume mit dem Pfad <code>/daten</code> anlegen (Anleitung in umfrage/README.md).';
  }
  return '';
}

// --- Anfragen verteilen ---------------------------------------------------------------
async function bearbeiten(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const weg = url.pathname;

  if (req.method === 'GET' && statisch[weg]) {
    const [datei, typ] = statisch[weg];
    const inhalt = await readFile(path.join(hier, 'public', datei));
    const cache = typ.startsWith('image/') ? { 'Cache-Control': 'public, max-age=86400' } : {};
    return senden(res, 200, inhalt, typ, cache);
  }

  if (req.method === 'GET' && weg === '/gesund') return senden(res, 200, 'ok', 'text/plain; charset=utf-8');

  if (req.method === 'GET' && weg === '/api/fragen') return json(res, 200, oeffentlicheFragen());

  if (req.method === 'POST' && weg === '/api/antwort') {
    if (zuViele(req)) return json(res, 429, { fehler: 'Zu viele Antworten von diesem Gerät. Bitte später noch einmal.' });
    let eingang;
    try {
      eingang = JSON.parse(await koerperLesen(req));
    } catch (fehler) {
      return json(res, fehler.status || 400, { fehler: 'Die Antwort konnte nicht gelesen werden.' });
    }
    const { antworten, fehler } = pruefeAntworten(eingang?.antworten);
    if (fehler) return json(res, 400, { fehler });
    const dauer = Number(eingang.dauerSekunden);
    await speichern({
      id: crypto.randomUUID(),
      zeit: new Date().toISOString(),
      dauerSekunden: Number.isFinite(dauer) && dauer > 0 ? Math.min(Math.round(dauer), 3600) : null,
      gueltig: istGueltig(antworten),
      antworten,
    });
    return json(res, 201, { ok: true });
  }

  if (weg === '/auswertung' || weg.startsWith('/auswertung/')) {
    if (!adminPruefen(req, res)) return;

    if (req.method === 'GET' && weg === '/auswertung') {
      const html = auswertungSeite(await alleAntworten(), {
        auchUngueltige: url.searchParams.get('alle') === '1',
        warnung: warnungText(),
      });
      return senden(res, 200, html, 'text/html; charset=utf-8');
    }

    if (req.method === 'GET' && weg === '/auswertung/antworten.csv') {
      const tag = new Date().toISOString().slice(0, 10);
      return senden(res, 200, alsCsv(await alleAntworten()), 'text/csv; charset=utf-8', {
        'Content-Disposition': `attachment; filename="lootlager-umfrage-${tag}.csv"`,
      });
    }

    if (req.method === 'POST' && weg === '/auswertung/zuruecksetzen') {
      // Nur Formulare von dieser Seite selbst annehmen
      const herkunft = req.headers.origin;
      let fremd = false;
      try { fremd = Boolean(herkunft) && new URL(herkunft).host !== req.headers.host; } catch { fremd = true; }
      if (fremd) {
        return senden(res, 403, 'Nicht erlaubt.', 'text/plain; charset=utf-8');
      }
      const form = new URLSearchParams(await koerperLesen(req));
      if (form.get('bestaetigung') !== 'LÖSCHEN') {
        return senden(res, 400, 'Zum Löschen bitte genau LÖSCHEN eintippen.', 'text/plain; charset=utf-8');
      }
      const stempel = new Date().toISOString().replaceAll(':', '-').slice(0, 19);
      try {
        await rename(antwortDatei, path.join(datenOrdner, `sicherung-${stempel}.jsonl`));
      } catch (fehler) {
        if (fehler.code !== 'ENOENT') throw fehler;
      }
      res.writeHead(303, { Location: '/auswertung', ...sicherheit });
      return res.end();
    }
  }

  senden(res, 404, `Nicht gefunden: ${escapeHtml(weg)}`, 'text/plain; charset=utf-8');
}

const server = http.createServer((req, res) => {
  bearbeiten(req, res).catch((fehler) => {
    console.error(fehler);
    if (!res.headersSent) senden(res, 500, 'Serverfehler', 'text/plain; charset=utf-8');
    else res.end();
  });
});

server.listen(PORT, () => {
  console.log(`LootLager-Umfrage läuft auf Port ${PORT}`);
  console.log(`Antworten werden gespeichert in: ${antwortDatei}`);
  if (!ADMIN_PASSWORT) console.warn('Hinweis: ADMIN_PASSWORT ist nicht gesetzt, /auswertung ist deshalb gesperrt.');
  if (ohneVolume) console.warn('Achtung: Kein Railway-Volume angehängt. Antworten gehen beim nächsten Deploy verloren.');
});
