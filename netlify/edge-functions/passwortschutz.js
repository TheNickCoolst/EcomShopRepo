// Passwortschutz für den ganzen Shop.
// Netlify führt diese Datei vor jedem Aufruf aus. Ohne Anmeldung gibt es nur die Passwortseite,
// Seiten, Bilder und Skripte des Shops bekommt man erst nach dem richtigen Passwort.
//
// Das Projekt auf GitHub ist öffentlich, deshalb steht das Passwort hier nicht im Klartext.
// So entsteht der Wert unten:  sha256( sha256("lootlager-zugang:" + passwort) )
// Neues Passwort: im Terminal ausrechnen und ZUGANG_SHA256 ersetzen.
//   S=$(printf '%s' 'lootlager-zugang:NEUES-PASSWORT' | shasum -a 256 | cut -d' ' -f1); printf '%s' "$S" | shasum -a 256

const ZUGANG_SHA256 = "3682976f0795a8ac9a2f1acc38a34c3830644d31fc18f526001ac35f49b82d9f";
const COOKIE = "lootlager_zugang";
const GUELTIG_TAGE = 30;

// Diese Bilder braucht die Passwortseite selbst, sie sind auch ohne Anmeldung erreichbar.
const OFFEN = new Set(["/img/logo-lootlager.png", "/img/favicon.png", "/img/apple-touch-icon.png"]);

async function sha256(text) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Der Schlüssel im Cookie lässt sich nur mit dem Passwort berechnen, nicht aus dem Wert oben.
// Groß- und Kleinschreibung und Leerzeichen am Rand spielen keine Rolle.
const schluesselAus = (passwort) => sha256(`lootlager-zugang:${passwort.trim().toLowerCase()}`);
const istGueltig = async (schluessel) => Boolean(schluessel) && (await sha256(schluessel)) === ZUGANG_SHA256;

export default async (request, context) => {
  const url = new URL(request.url);
  if (OFFEN.has(url.pathname)) return context.next();
  if (await istGueltig(context.cookies.get(COOKIE))) return context.next();

  if (request.method === "POST") {
    const formular = await request.formData().catch(() => null);
    const schluessel = await schluesselAus(String(formular?.get("passwort") ?? ""));
    if (await istGueltig(schluessel)) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: url.pathname + url.search,
          "Set-Cookie": `${COOKIE}=${schluessel}; Path=/; Max-Age=${GUELTIG_TAGE * 86400}; HttpOnly; Secure; SameSite=Lax`,
          "Cache-Control": "no-store",
        },
      });
    }
    return passwortseite(true);
  }
  return passwortseite(false);
};

export const config = { path: "/*" };

function passwortseite(falsch) {
  return new Response(html(falsch), {
    status: 401,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  });
}

const html = (falsch) => `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Passwort – LootLager</title>
  <meta name="robots" content="noindex">
  <meta name="theme-color" content="#111827">
  <link rel="icon" type="image/png" href="/img/favicon.png">
  <link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
  <style>
    :root {
      --violett: #7c3aed; --violett-dunkel: #5b21b6; --tuerkis: #22d3ee; --nacht: #111827;
      --text: #111827; --text-leise: #566072; --linie: #e6e1f5; --rot: #b42318;
      --schrift: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      --schrift-titel: ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", "Nunito", "Segoe UI", system-ui, sans-serif;
    }
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px 16px;
      font-family: var(--schrift); line-height: 1.55; color: var(--text);
      background: radial-gradient(circle at 20% 10%, rgb(124 58 237 / 0.45), transparent 55%),
                  radial-gradient(circle at 85% 90%, rgb(34 211 238 / 0.3), transparent 50%), var(--nacht);
      -webkit-font-smoothing: antialiased;
    }
    main {
      width: min(100%, 400px); padding: 32px 28px; border-radius: 20px;
      background: #fff; box-shadow: 0 20px 50px rgb(0 0 0 / 0.35); text-align: center;
    }
    img { display: block; width: 220px; max-width: 100%; height: auto; margin: 0 auto 20px; }
    h1 { margin: 0 0 8px; font-family: var(--schrift-titel); font-size: 1.5rem; font-weight: 800; line-height: 1.15; }
    p { margin: 0 0 20px; color: var(--text-leise); }
    form { display: grid; gap: 12px; text-align: left; }
    label { font-weight: 600; }
    input {
      width: 100%; padding: 12px 14px; border: 2px solid var(--linie); border-radius: 12px;
      font: inherit; color: inherit; background: #fff;
    }
    input:focus { outline: none; border-color: var(--violett); }
    button {
      padding: 12px 18px; border: 0; border-radius: 999px; cursor: pointer;
      font: inherit; font-weight: 700; color: #fff; background: var(--violett);
    }
    button:hover { background: var(--violett-dunkel); }
    :focus-visible { outline: 3px solid var(--tuerkis); outline-offset: 3px; }
    .fehler { margin: 0; color: var(--rot); font-weight: 600; }
    small { display: block; margin-top: 20px; color: var(--text-leise); }
  </style>
</head>
<body>
  <main>
    <img src="/img/logo-lootlager.png" alt="LootLager" width="760" height="207">
    <h1>Nur für unsere Klasse</h1>
    <p>Dieser Shop ist ein Schulprojekt und nicht öffentlich. Bitte gib das Passwort ein.</p>
    <form method="post">
      <label for="passwort">Passwort</label>
      <input id="passwort" name="passwort" type="password" autocomplete="current-password" required autofocus${falsch ? ' aria-describedby="fehler" aria-invalid="true"' : ""}>
      ${falsch ? '<p class="fehler" id="fehler" role="alert">Das Passwort stimmt nicht. Versuch es noch einmal.</p>' : ""}
      <button type="submit">Shop öffnen</button>
    </form>
    <small>Schulprojekt der Gruppe 4 im Fach E-Commerce · fiktiver Shop</small>
  </main>
</body>
</html>`;
