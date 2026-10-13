// LootLager – Menü, Suche, Warenkorb, Kasse und Design-Vorschau. Alles läuft nur im Browser.

const VERSAND = 4.9;
const VERSANDFREI_AB = 50;
const SPEICHER = "lootlager-warenkorb";
const MAX_BILD_MB = 8;

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
const $ = (auswahl) => document.querySelector(auswahl);
const $$ = (auswahl) => [...document.querySelectorAll(auswahl)];

// Produktdaten stehen im HTML, damit die Seite auch ohne JavaScript alles zeigt.
const karten = $$(".produkt");
const produkte = new Map(
  karten.map((karte) => [
    karte.dataset.id,
    {
      name: karte.dataset.name,
      preis: Number(karte.dataset.preis),
      bild: karte.querySelector("img").getAttribute("src"),
    },
  ]),
);

/* ---------- Menü (kleine Bildschirme) ---------- */

const menueKnopf = $("#menue-knopf");
const hauptnav = $("#hauptnav");

function menueSchalten(offen) {
  hauptnav.classList.toggle("ist-offen", offen);
  menueKnopf.setAttribute("aria-expanded", String(offen));
}

menueKnopf.hidden = false; // ohne JavaScript bleibt der Knopf versteckt
menueKnopf.addEventListener("click", () => menueSchalten(menueKnopf.getAttribute("aria-expanded") !== "true"));
hauptnav.addEventListener("click", (ereignis) => {
  if (ereignis.target.closest("a")) menueSchalten(false);
});
document.addEventListener("keydown", (ereignis) => {
  if (ereignis.key === "Escape") menueSchalten(false);
});

/* ---------- Suche ---------- */

const suchfeld = $("#suchfeld");
const suchStatus = $("#such-status");
const suchLeer = $("#such-leer");

function filtern() {
  const begriffe = suchfeld.value.toLowerCase().split(/\s+/).filter(Boolean);
  let treffer = 0;
  for (const karte of karten) {
    const text = `${karte.dataset.name} ${karte.dataset.suche}`.toLowerCase();
    const passt = begriffe.every((begriff) => text.includes(begriff));
    karte.hidden = !passt;
    if (passt) treffer += 1;
  }
  suchStatus.textContent = begriffe.length ? `${treffer} von ${karten.length} Produkten` : `${karten.length} Produkte`;
  suchLeer.hidden = treffer > 0;
}

suchfeld.addEventListener("input", filtern);
$("#suche").addEventListener("submit", (ereignis) => {
  ereignis.preventDefault();
  $("#produkte").scrollIntoView();
});
$("#suche-leeren").addEventListener("click", () => {
  suchfeld.value = "";
  filtern();
  suchfeld.focus();
});

/* ---------- Warenkorb ---------- */

const korb = $("#korb");
const korbListe = $("#korb-liste");
const korbZahl = $("#korb-zahl");
const meldung = $("#meldung");
let meldungUhr;

// Ein Eintrag: { id, zusatz, menge }. "zusatz" beschreibt ein eigenes Design.
let eintraege = laden();

function laden() {
  try {
    const roh = JSON.parse(localStorage.getItem(SPEICHER)) ?? [];
    return roh.filter((e) => produkte.has(e.id) && Number.isInteger(e.menge) && e.menge > 0);
  } catch {
    return [];
  }
}

function speichern() {
  try {
    localStorage.setItem(SPEICHER, JSON.stringify(eintraege));
  } catch {
    // Ohne Speicher (z. B. privates Fenster) bleibt der Warenkorb bis zum Neuladen erhalten.
  }
}

function hinzufuegen(id, zusatz = "") {
  const vorhanden = eintraege.find((e) => e.id === id && e.zusatz === zusatz);
  if (vorhanden) vorhanden.menge += 1;
  else eintraege.push({ id, zusatz, menge: 1 });
  korbAktualisieren();
  melden(`${produkte.get(id).name} liegt im Warenkorb.`);
}

function mengeAendern(index, schritt) {
  eintraege[index].menge += schritt;
  if (eintraege[index].menge < 1) eintraege.splice(index, 1);
  korbAktualisieren();

  // Die Liste wird neu aufgebaut. Der Fokus soll trotzdem auf dem gleichen Knopf bleiben.
  const zeile = korbListe.children[Math.min(index, eintraege.length - 1)];
  const knopf = zeile?.querySelector(schritt > 0 ? ".menge button:last-child" : ".menge button:first-child");
  (knopf ?? $("#korb-schliessen")).focus();
}

function melden(text) {
  meldung.textContent = text;
  meldung.classList.add("ist-sichtbar");
  clearTimeout(meldungUhr);
  meldungUhr = setTimeout(() => meldung.classList.remove("ist-sichtbar"), 2600);
}

function element(tag, klasse, text) {
  const neu = document.createElement(tag);
  if (klasse) neu.className = klasse;
  if (text !== undefined) neu.textContent = text;
  return neu;
}

function summen() {
  const waren = eintraege.reduce((summe, e) => summe + produkte.get(e.id).preis * e.menge, 0);
  const versand = waren >= VERSANDFREI_AB ? 0 : VERSAND;
  return { waren, versand, gesamt: waren + versand };
}

function korbAktualisieren() {
  speichern();

  const anzahl = eintraege.reduce((summe, e) => summe + e.menge, 0);
  korbZahl.textContent = anzahl;
  korbZahl.setAttribute("aria-label", `${anzahl} Artikel im Warenkorb`);

  korbListe.replaceChildren(
    ...eintraege.map((eintrag, index) => {
      const produkt = produkte.get(eintrag.id);
      const zeile = element("li");

      const bild = element("img");
      bild.src = produkt.bild;
      bild.alt = "";
      bild.width = 64;
      bild.height = 48;

      const mitte = element("div");
      mitte.append(element("p", "korb__name", produkt.name));
      if (eintrag.zusatz) mitte.append(element("p", "korb__zusatz", eintrag.zusatz));

      const menge = element("div", "menge");
      const weniger = element("button", "", "−");
      weniger.type = "button";
      weniger.setAttribute("aria-label", `Weniger: ${produkt.name}`);
      weniger.addEventListener("click", () => mengeAendern(index, -1));
      const mehr = element("button", "", "+");
      mehr.type = "button";
      mehr.setAttribute("aria-label", `Mehr: ${produkt.name}`);
      mehr.addEventListener("click", () => mengeAendern(index, 1));
      menge.append(weniger, element("span", "", eintrag.menge), mehr);
      mitte.append(menge);

      zeile.append(bild, mitte, element("p", "korb__preis", euro.format(produkt.preis * eintrag.menge)));
      return zeile;
    }),
  );

  const { waren, versand, gesamt } = summen();
  $("#korb-leer").hidden = anzahl > 0;
  $("#korb-summe").hidden = anzahl === 0;
  $("#summe-waren").textContent = euro.format(waren);
  $("#summe-versand").textContent = versand ? euro.format(versand) : "kostenlos";
  $("#versand-hinweis").textContent = versand ? `(ab ${euro.format(VERSANDFREI_AB)} kostenlos)` : "";
  $("#summe-gesamt").textContent = euro.format(gesamt);
}

$("#korb-oeffnen").addEventListener("click", () => korb.showModal());
$("#korb-schliessen").addEventListener("click", () => korb.close());
korb.addEventListener("click", (ereignis) => {
  if (ereignis.target === korb) korb.close(); // Klick auf den abgedunkelten Hintergrund
});
$("#zur-kasse").addEventListener("click", kasseOeffnen);

for (const karte of karten) {
  karte.querySelector("[data-in-korb]").addEventListener("click", () => hinzufuegen(karte.dataset.id));
  karte.querySelector("[data-gestalten]").addEventListener("click", () => produktWaehlen(karte.dataset.id));
}

/* ---------- Kasse (Testbestellung) ---------- */

const kasse = $("#kasse");
const kasseFormular = $("#kasse-formular");
const kasseDanke = $("#kasse-danke");

function kasseOeffnen() {
  kasseFormular.hidden = false;
  kasseDanke.hidden = true;
  $("#kasse-gesamt").textContent = euro.format(summen().gesamt);
  korb.close();
  kasse.showModal();
}

$("#kasse-schliessen").addEventListener("click", () => kasse.close());
$("#kasse-fertig").addEventListener("click", () => kasse.close());
kasse.addEventListener("click", (ereignis) => {
  if (ereignis.target === kasse) kasse.close();
});

// Nichts wird abgeschickt: Die Bestellung endet hier mit einem Hinweis.
kasseFormular.addEventListener("submit", (ereignis) => {
  ereignis.preventDefault();
  $("#kasse-zahlung").textContent = new FormData(kasseFormular).get("zahlung");
  kasseFormular.reset();
  kasseFormular.hidden = true;
  kasseDanke.hidden = false;
  kasseDanke.focus();
  eintraege = [];
  korbAktualisieren();
});

/* ---------- Eigenes Design ---------- */

const werkstatt = $("#werkstatt");
const vorschau = $("#vorschau");
const motivFeld = $("#motiv");
const motivFehler = $("#motiv-fehler");
const gamertag = $("#gamertag");
let motivAdresse = "";

function aktivesProdukt() {
  return new FormData(werkstatt).get("produkt");
}

function produktWaehlen(id) {
  werkstatt.elements.produkt.value = id;
  vorschauAktualisieren();
}

function vorschauAktualisieren() {
  const id = aktivesProdukt();
  const produkt = produkte.get(id);
  const tag = gamertag.value.trim();

  vorschau.dataset.aktiv = id;
  $("#vorschau-titel").textContent = `Vorschau: ${produkt.name} mit deinem Design`;
  $("#werkstatt-name").textContent = produkt.name;
  $("#werkstatt-preis").textContent = euro.format(produkt.preis);

  for (const text of vorschau.querySelectorAll("[data-tag]")) {
    const platzhalter = text.hasAttribute("data-neon") ? "GG!" : "";
    const inhalt = (tag || platzhalter).toUpperCase();
    text.textContent = inhalt;
    // Lange Namen auf dem LED-Schild kleiner setzen, damit sie in den Rahmen passen.
    if (text.hasAttribute("data-neon")) text.setAttribute("font-size", Math.min(50, Math.round(280 / Math.max(inhalt.length, 1))));
  }

  const tasten = (tag || "LOOT").toUpperCase().replace(/\s/g, "");
  for (const taste of vorschau.querySelectorAll("[data-taste]")) {
    taste.textContent = tasten[Number(taste.dataset.taste)] ?? "";
  }
}

motivFeld.addEventListener("change", () => {
  const datei = motivFeld.files[0];
  if (!datei) return;

  motivFehler.hidden = true;
  if (!datei.type.startsWith("image/")) {
    motivFehler.textContent = "Das ist kein Bild. Bitte wähle eine JPG- oder PNG-Datei.";
    motivFehler.hidden = false;
    return;
  }
  if (datei.size > MAX_BILD_MB * 1024 * 1024) {
    motivFehler.textContent = `Das Bild ist zu groß. Bitte wähle eine Datei unter ${MAX_BILD_MB} MB.`;
    motivFehler.hidden = false;
    return;
  }

  if (motivAdresse) URL.revokeObjectURL(motivAdresse);
  motivAdresse = URL.createObjectURL(datei);
  for (const bild of vorschau.querySelectorAll(".motiv")) bild.setAttribute("href", motivAdresse);
  $("#motiv-name").textContent = datei.name;
});

werkstatt.addEventListener("change", vorschauAktualisieren);
gamertag.addEventListener("input", vorschauAktualisieren);
werkstatt.addEventListener("submit", (ereignis) => {
  ereignis.preventDefault();
  const tag = gamertag.value.trim();
  const teile = ["Eigenes Design"];
  if (motivAdresse) teile.push("mit Motiv");
  if (tag) teile.push(`Gamertag „${tag}“`);
  hinzufuegen(aktivesProdukt(), teile.join(" · "));
});

filtern();
korbAktualisieren();
vorschauAktualisieren();
