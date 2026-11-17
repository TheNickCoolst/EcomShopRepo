# LootLager-Umfrage (Marktforschung)

Unsere **Primärforschung**: eine kurze Online-Umfrage, die auf **Railway** läuft.

- **11 Fragen, ca. 2 Minuten** (Vorgabe: höchstens 3 Minuten)
- fast nur **geschlossene Fragen** zum Antippen, **1 Kontrollfrage** (Aufmerksamkeits-Check „Bitte tippe auf Lila“) und **1 offene Frage** (freiwillig)
- **handytauglich**: eine Frage pro Bildschirm, große Knöpfe, Fortschrittsbalken
- **schnell auswertbar**: Auf `/auswertung` stehen sofort alle Ergebnisse als Balken, dazu „Auf einen Blick“ (häufigste Antwort pro Frage) und ein CSV-Download für Excel
- **anonym**: keine Namen, keine E-Mail, keine IP-Adressen

| Adresse | Was ist da? |
|---|---|
| `/` | die Umfrage, diesen Link teilt ihr |
| `/auswertung` | die Ergebnisse, nur mit Passwort |
| `/auswertung/antworten.csv` | alle Antworten als Excel-Datei |

## Die Fragen

| Nr | Frage | Art | Wozu? |
|---|---|---|---|
| 1 | Wie alt bist du? | eine Antwort | Passt die Zielgruppe 16–30? |
| 2 | Wie oft zockst du? | eine Antwort | Wie aktiv sind die Befragten? |
| 3 | Worauf spielst du? | mehrere | Welche Controller-Skins und Keycaps lohnen sich? |
| 4 | Welche Produkte würdest du dir mit eigenem Design holen? | mehrere | Welche unserer 5 Produkte sind gefragt? |
| 5 | Wie wichtig ist dir ein eigenes Design? | Skala 1–5 | Kommt unsere Geschäftsidee an? |
| 6 | Wie viel würdest du für ein XXL-Mauspad mit eigenem Design zahlen? | eine Antwort | Passt unser Preis von 24,99 €? |
| 7 | **Kontrollfrage**: Bitte tippe auf „Lila“ | eine Antwort | Wer falsch tippt, hat nicht gelesen und wird aussortiert |
| 8 | Was ist dir beim Kauf am wichtigsten? | eine Antwort | Womit sollen wir werben? |
| 9 | Wo kaufst du Gaming-Zubehör meistens? | mehrere | Wer sind unsere Mitbewerber? |
| 10 | Wo würdest du von einem neuen Gaming-Shop erfahren? | eine Antwort | Wo machen wir Werbung? |
| 11 | Was müsste ein neuer Gaming-Shop bieten, damit du dort bestellst? | **offen**, freiwillig | Ideen, an die wir nicht gedacht haben |

Ändern könnt ihr die Fragen in [`fragen.js`](fragen.js). Umfrage und Auswertung passen sich automatisch an. **Wenn die Umfrage schon läuft, keine Antworttexte mehr ändern**, sonst passen die alten Antworten nicht mehr.

## Auf Railway online stellen (ca. 10 Minuten)

1. Auf [railway.com](https://railway.com) mit GitHub anmelden.
2. **New Project** → **Deploy from GitHub repo** → `EcomShopRepo` auswählen. Falls das Repo nicht in der Liste steht: Railway auf GitHub den Zugriff auf das Repo erlauben.
3. Den neuen Dienst anklicken → **Settings** → **Source**:
   - **Root Directory**: `/umfrage` (wichtig, sonst findet Railway die App nicht)
   - **Branch**: der Branch, auf dem der Ordner `umfrage` liegt (nach dem Mergen `main`)
4. **Variables** → **New Variable**: Name `ADMIN_PASSWORT`, Wert: ein Passwort, das ihr euch ausdenkt. Damit öffnet ihr später die Auswertung.
5. **Volume anlegen**, damit die Antworten nicht verloren gehen: Rechtsklick auf den Dienst (oder `Strg+K` bzw. `Cmd+K` → „Volume“) → **Attach Volume** → Mount Path: `/daten`.
   Ohne Volume löscht Railway die Antworten bei jedem neuen Deploy. Die Auswertung zeigt dann eine rote Warnung.
6. **Settings** → **Networking** → **Generate Domain**. Railway zeigt euch eine Adresse wie `irgendwas.up.railway.app`. Das ist der Link zur Umfrage.
7. Falls Railway eine **Region** anbietet (Settings → Deploy): eine in Europa wählen, z. B. EU West (Amsterdam). Dann liegen die Antworten in der EU.

**Testen, bevor ihr den Link teilt:**
1. Link auf dem Handy öffnen und die Umfrage einmal komplett ausfüllen.
2. `…up.railway.app/auswertung` öffnen, Benutzername leer lassen, Passwort aus Schritt 4 eingeben. Eure Testantwort muss dort stehen.
3. Ganz unten auf der Auswertung „Alle Antworten löschen“ aufklappen, `LÖSCHEN` eintippen und bestätigen. Jetzt steht alles auf 0 und die echte Umfrage kann losgehen.
4. Wer einmal mitgemacht hat, sieht beim nächsten Öffnen „Du hast schon mitgemacht“. Zum erneuten Testen unten auf „Jemand anderes nutzt dieses Handy …“ tippen.

**Link verteilen:** in die Klassen-Gruppe schicken oder einen QR-Code erstellen (z. B. in PowerPoint oder mit einem QR-Code-Generator) und auf eine Folie oder ein Plakat setzen.

## Kosten

Railway gibt neuen Konten einmalig ein **Testguthaben von 5 $** ([Railway-Doku](https://docs.railway.com/pricing/plans.md), Stand November 2026). Diese kleine App braucht für ein paar Tage nur wenige Cent davon. Danach kostet der Hobby-Tarif ca. 5 $ im Monat. Deshalb:

**Nach dem Projekt:** CSV herunterladen und das Projekt in Railway löschen (Settings → Danger → Delete Project). Dann entstehen keine Kosten mehr und die Antworten sind gelöscht, so wie es auf der Startseite der Umfrage versprochen wird.

## Auf dem eigenen Rechner ausprobieren

Nötig ist nur [Node.js](https://nodejs.org) ab Version 20, weitere Pakete braucht die App nicht.

```bash
cd umfrage
ADMIN_PASSWORT=test npm start
```

Dann im Browser `http://localhost:3000` öffnen, die Auswertung unter `http://localhost:3000/auswertung` (Passwort `test`). Die Antworten landen lokal in `umfrage/daten/antworten.jsonl`. Dieser Ordner wird nicht mit hochgeladen.

## Dateien

| Datei | Inhalt |
|---|---|
| [`fragen.js`](fragen.js) | alle Fragen und die Prüfung der Antworten |
| [`server.js`](server.js) | der Webserver: Umfrage ausliefern, Antworten speichern, Passwort für die Auswertung |
| [`auswertung.js`](auswertung.js) | zählt die Antworten und baut die Auswertungsseite und die CSV-Datei |
| [`public/`](public/) | Startseite, Aussehen (CSS), Ablauf der Umfrage im Browser, Logo |
