# EcomShopRepo

![LootLager-Logo](assets/logo-lootlager.png)

Gruppenprojekt: Wir gründen einen (fiktiven) Onlineshop – die **LootLager UG (haftungsbeschränkt)**, ein Shop für Gaming-Zubehör mit Custom Designs. Dazu gehören Firmenname, Rechtsform, KI-Logo, die Anbietersuche für die Homepage, der fertige Shop und eine Präsentation.

- Planung: [PLANUNG.md](PLANUNG.md)
- Präsentation (8 Folien) in zwei Versionen: [v1](praesentation/LootLager_Praesentation_v1.pptx) (Luca und Nick) und [v2](praesentation/LootLager_Praesentation_v2.pptx) (Luca, Noah und Nick). Sie unterscheiden sich nur in der Gruppenzeile auf Folie 1 und 8
- Nutzwertanalyse als Excel-Datei: [praesentation/Nutzwertanalyse.xlsx](praesentation/Nutzwertanalyse.xlsx)
- Shop: [shop/](shop/) – zum Ansehen `shop/index.html` öffnen. Mit Logo, Name, Domain, 5 Produkten, Warenkorb und Test-Kasse
- Anbieter: **Netlify**, gebaut mit Claude Code (Begründung in [PLANUNG.md](PLANUNG.md), Abschnitt 5). `netlify.toml` veröffentlicht den Ordner `shop`
- Passwortschutz: Online ist der Shop nur mit Passwort erreichbar (kennt die Gruppe, steht absichtlich nicht hier) ([netlify/edge-functions/passwortschutz.js](netlify/edge-functions/passwortschutz.js)). Er ist damit nicht öffentlich, deshalb kein echtes Impressum. Funktioniert nur, wenn Netlify mit GitHub verbunden ist, nicht beim Hochladen per Drag-and-drop
- Logo: [assets/](assets/)
- KI-Bilder für Shop und Präsentation (Gemini), mit allen Prompts: [assets/ki-bilder/](assets/ki-bilder/PROMPTS.md)
