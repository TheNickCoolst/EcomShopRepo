# LootLager-Umfrage (Marktforschung)

Unsere **Primärforschung**: eine kurze Online-Umfrage, die auf **Railway** läuft.

- **11 Fragen, ca. 2 Minuten** (Vorgabe: höchstens 3 Minuten)
- fast nur **geschlossene Fragen** zum Antippen, **1 Kontrollfrage** (Aufmerksamkeits-Check „Bitte tippe auf Lila“) und **1 offene Frage** (freiwillig)
- **handytauglich**: eine Frage pro Bildschirm, große Knöpfe, Fortschrittsbalken
- **am PC genauso**: links die Bühne mit der Truhe, rechts die Frage. Mit den Zifferntasten wählt man eine Antwort, mit Enter geht es weiter
- **schnell auswertbar**: Im **Auswertungszentrum** stehen sofort alle Ergebnisse (siehe unten), dazu gibt es einen CSV-Download für Excel
- **anonym**: keine Namen, keine E-Mail, keine IP-Adressen

## Drei Versionen: Nick, Noah und Luca

Die Umfrage gibt es dreimal. Jeder verteilt seinen eigenen Link, die Antworten werden getrennt gespeichert und jeder hat sein eigenes Auswertungszentrum mit eigenem Passwort. Alles läuft in **einem** Railway-Projekt, aber jede Version auf einem **eigenen Port**. So bekommt jede Version ihre eigene Domain.

| Wer | Port | Umfrage | Auswertungszentrum | Passwort-Variable in Railway |
|---|---|---|---|---|
| Nick | 8080 | eigene Domain | eigene Domain + `/auswertung` | `PASSWORT_NICK` |
| Noah | 8081 | eigene Domain | eigene Domain + `/auswertung` | `PASSWORT_NOAH` |
| Luca | 8082 | eigene Domain | eigene Domain + `/auswertung` | `PASSWORT_LUCA` |
| Team (alle zusammen) | jeder | – | jede Domain + `/team/auswertung` | `ADMIN_PASSWORT` |

- **Die Fragen sind je Version leicht anders formuliert** (z. B. „Wie alt bist du?“ bei Nick, „Zu welcher Altersgruppe gehörst du?“ bei Noah). Die Antworten zum Antippen sind überall gleich, damit das Team-Zentrum alles zusammenzählen kann. Die Formulierungen stehen in [`fragen.js`](fragen.js) unter `varianten`. Im Auswertungszentrum steht immer die Fassung von Nick.
- Auf jeder Domain funktionieren zusätzlich die Adressen `/nick`, `/noah` und `/luca`.

- Das **Team-Zentrum** zeigt alle Antworten zusammen. Dort kann man zusätzlich nach Version filtern und die Versionen vergleichen. Für die Präsentation nehmt ihr am besten diese Zahlen, weil es mehr Antworten sind.
- Hat eine Version kein eigenes Passwort, gilt für sie `ADMIN_PASSWORT`.
- Namen, Ports ändern oder eine Version ergänzen: in [`versionen.js`](versionen.js).

## Das Auswertungszentrum

Nach der Anmeldung gibt es links (am Handy oben) ein Menü:

| Menüpunkt | Was ist da? |
|---|---|
| **Übersicht** | Teilnahmen, gültige und aussortierte Antworten, typische Dauer, **Kernaussagen für die Präsentation**, häufigste Antwort pro Frage, Teilnahmen pro Tag, euer Umfrage-Link zum Kopieren |
| **Alle Fragen** | jede Frage mit Balken, Prozent und Anzahl |
| **Vergleichen** | zwei Fragen gegeneinander, z. B. „Preis nach Alter“ oder „Produkte nach Plattform“ (Kreuztabelle) |
| **Offene Antworten** | alle Texte aus der offenen Frage |
| **Einzelne Antworten** | eine Zeile pro Teilnahme |
| **Sekundärforschung** | Preise, Angebote und Bewertungen der Mitbewerber, Einkaufspreise, Marktdaten (siehe unten) |
| **Export & Verwaltung** | CSV für Excel, Drucken als PDF, Testantworten löschen |

Oben auf den Seiten steht ein **Filter**: Damit zählt ihr nur Befragte mit einer bestimmten Antwort, z. B. nur die 16- bis 20-Jährigen. Mit dem Häkchen „auch aussortierte zählen“ kommen die Antworten mit falscher Kontrollfrage dazu.

## Sekundärforschung

Die Daten stehen in [`sekundaer.js`](sekundaer.js): pro Produkt die Mitbewerber (Preis, Angebot, Bewertung, Quelle), die Einkaufspreise (EK) und ein Fazit, dazu Zahlen zum Gaming-Markt.

**Wichtig:** Die Werte stammen aus Suchergebnissen vom 17.11.2026. Die Shop-Seiten selbst wurden dabei nicht geöffnet. **Prüft jeden Wert, den ihr zeigt, über den Link in der Spalte „Quelle“ nach** und korrigiert ihn in `sekundaer.js`.

Die Einkaufspreise aus dem Großhandel stehen in US-Dollar. Tragt in `sekundaer.js` bei `dollarKurs` den aktuellen Kurs ein (z. B. `0.92`), dann rechnet die Seite den Rohgewinn pro Stück aus.

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
   - **Branch**: der Standard-Branch des Repos (dort landet der Ordner `umfrage` nach dem Mergen)
   - **Settings → Deploy**: Start Command `node server.js`, Healthcheck Path `/gesund`. Unter **Build → Watch Paths** `/umfrage/**`, dann baut Railway nur bei Änderungen im Ordner `umfrage` neu.
4. **Variables** → **New Variable**, vier Stück anlegen: `ADMIN_PASSWORT` (Team-Zentrum), `PASSWORT_NICK`, `PASSWORT_NOAH` und `PASSWORT_LUCA`. Jeder denkt sich sein eigenes Passwort aus, am besten mindestens 12 Zeichen.
5. **Volume anlegen**, damit die Antworten nicht verloren gehen: Rechtsklick auf den Dienst (oder `Strg+K` bzw. `Cmd+K` → „Volume“) → **Attach Volume** → Mount Path: `/daten`.
   Ohne Volume löscht Railway die Antworten bei jedem neuen Deploy. Das Auswertungszentrum zeigt dann eine rote Warnung.
6. **Settings** → **Networking** → **Generate Domain**, und zwar **dreimal**. Railway fragt jedes Mal nach dem Port (Target Port): einmal `8080` (Nick), einmal `8081` (Noah), einmal `8082` (Luca). Ihr bekommt drei Adressen wie `irgendwas.up.railway.app`. Jede ist der Umfrage-Link einer Version. Eigene Domains (Custom Domain) lassen sich genauso je Port anlegen. Den Namen vor `.up.railway.app` könnt ihr per Stift-Symbol ändern, z. B. `lootlager-nick`. Steht der Port einer bestehenden Domain falsch, ebenfalls über das Stift-Symbol ändern.
7. Falls Railway eine **Region** anbietet (Settings → Deploy): eine in Europa wählen, z. B. EU West (Amsterdam). Dann liegen die Antworten in der EU.

**Testen, bevor ihr den Link teilt (jeder für seine Version):**
1. Eigene Domain auf dem Handy öffnen und die Umfrage einmal komplett ausfüllen.
2. Eigene Domain mit `/auswertung` dahinter öffnen und mit dem eigenen Passwort anmelden. Die Testantwort muss dort stehen. Die Anmeldung gilt 12 Stunden. Nach 8 falschen Versuchen ist die Anmeldung für dieses Gerät 10 Minuten gesperrt.
3. Im Menü „Export & Verwaltung“ ganz unten „Alle Antworten dieser Version löschen“ aufklappen, `LÖSCHEN` eintippen und bestätigen. Jetzt steht alles auf 0 und die echte Umfrage kann losgehen.
4. Wer einmal mitgemacht hat, sieht beim nächsten Öffnen „Du hast schon mitgemacht“, auch bei den Links der anderen. Zum erneuten Testen unten auf „Jemand anderes nutzt dieses Handy …“ tippen.

**Link verteilen:** Den eigenen Link findet jeder in seinem Zentrum auf der Übersicht („Link kopieren“). In Gruppen schicken oder einen QR-Code erstellen (z. B. in PowerPoint oder mit einem QR-Code-Generator) und auf eine Folie oder ein Plakat setzen.

## Kosten

Railway gibt neuen Konten einmalig ein **Testguthaben von 5 $** ([Railway-Doku](https://docs.railway.com/pricing/plans.md), Stand November 2026). Diese kleine App braucht für ein paar Tage nur wenige Cent davon. Danach kostet der Hobby-Tarif ca. 5 $ im Monat. Deshalb:

**Nach dem Projekt:** CSV herunterladen und das Projekt in Railway löschen (Settings → Danger → Delete Project). Dann entstehen keine Kosten mehr und die Antworten sind gelöscht, so wie es auf der Startseite der Umfrage versprochen wird.

## Auf dem eigenen Rechner ausprobieren

Nötig ist nur [Node.js](https://nodejs.org) ab Version 20, weitere Pakete braucht die App nicht.

```bash
cd umfrage
ADMIN_PASSWORT=test PASSWORT_NICK=nick npm start
```

Dann im Browser öffnen: `http://localhost:8080` (Nick), `http://localhost:8081` (Noah), `http://localhost:8082` (Luca). Das Zentrum liegt jeweils unter `/auswertung` (Passwort für Nick: `nick`, sonst `test`), das Team-Zentrum unter `http://localhost:8080/team/auswertung` (Passwort `test`). Die Antworten landen lokal in `umfrage/daten/`. Dieser Ordner wird nicht mit hochgeladen.

## Dateien

| Datei | Inhalt |
|---|---|
| [`fragen.js`](fragen.js) | alle Fragen und die Prüfung der Antworten |
| [`versionen.js`](versionen.js) | die drei Versionen (Nick, Noah, Luca) |
| [`sekundaer.js`](sekundaer.js) | die Daten der Sekundärforschung |
| [`server.js`](server.js) | der Webserver: Umfrage ausliefern, Antworten speichern, Anmeldung im Auswertungszentrum |
| [`auswertung.js`](auswertung.js) | zählt die Antworten aus und baut die CSV-Datei |
| [`seiten.js`](seiten.js), [`sekundaer-seite.js`](sekundaer-seite.js) | die Seiten des Auswertungszentrums |
| [`public/`](public/) | Startseite, Aussehen (CSS), Ablauf der Umfrage im Browser, Bilder |
