// Sekundärforschung: Daten, die es schon gibt.
// Preise, Angebote und Bewertungen (Reaktionen) der Mitbewerber, dazu Einkaufspreise (EK).
// Angezeigt wird das alles im Auswertungszentrum unter "Sekundärforschung".
//
// WICHTIG: Alle Werte stammen aus Suchergebnissen vom 17.11.2026. Die Shop-Seiten selbst
// konnten bei der Recherche nicht geöffnet werden. Jeden Wert, den ihr in der Präsentation zeigt,
// vorher über den Link in "quelle" nachprüfen und hier korrigieren.
//
// Felder bei einem Mitbewerber:
//   preis         Zahl in Euro für den Preisstrahl. null, wenn der Preis nicht in Euro vorliegt.
//   preisText     so, wie der Preis gefunden wurde (z. B. "ab 14,95 €")
//   eigenesDesign true = der Kunde kann sein eigenes Design bekommen (direkter Mitbewerber)
//   bewertung     Sterne und Anzahl der Bewertungen, falls gefunden

export const stand = '17.11.2026';

// 1 US-Dollar in Euro. Die Einkaufspreise aus dem Großhandel stehen in US-Dollar.
// Tragt hier den aktuellen Kurs ein (z. B. 0.92), dann rechnet die Seite den Rohgewinn aus.
// Den Kurs findet ihr z. B. bei der Europäischen Zentralbank (Euro-Referenzkurse).
export const dollarKurs = null;

export const produkte = [
  {
    id: 'mauspad',
    name: 'XXL-Mauspad',
    unserPreis: 24.99,
    unserAngebot: '900 × 400 mm, mit eigenem Motiv',
    umfrageOption: 'XXL-Mauspad',
    preisFrage: 'preis',
    mitbewerber: [
      { anbieter: 'propads.gg', produkt: 'Custom Mousepad XXL 900 × 400 mm', preis: 49.99, eigenesDesign: true, angebot: 'Dicke, Rand und Oberfläche wählbar, Produktion 2–3 Tage, Versand gratis ab 55 €', bewertung: '411 Bewertungen, ca. 95 % davon 5 Sterne', quelle: 'https://www.propads.gg/en/products/custom-mousepad-xxl-900x400mm' },
      { anbieter: 'Sunnywall', produkt: 'Gaming-Mauspad XXL selbst gestalten, 90 × 40 cm', preis: 49.95, eigenesDesign: true, angebot: 'eigenes Foto oder Logo, genähter Rand, Lieferzeit 1–3 Werktage, zzgl. Versand', bewertung: '4,4 von 5 (5 Bewertungen)', quelle: 'https://www.sunnywall.de/custom-xxl-mauspad-90x40.html' },
      { anbieter: 'SETUPKING', produkt: 'Custom Mauspad XXL 900 × 400 mm', preis: 44.99, eigenesDesign: true, angebot: 'eigenes Motiv, mit RGB-Rand 59,99 €, Produktion und Versand 5–7 Werktage', quelle: 'https://www.setupking.de/mauspad-selbst-gestalten' },
      { anbieter: 'Deskyou', produkt: 'Dein Design auf XXL-Mauspad, 90 × 40 cm', preis: 39.95, eigenesDesign: true, angebot: 'Design hochladen, Versand 3,90 €, gratis ab ca. 50 €, Lieferung 3–5 Werktage', quelle: 'https://deskyou.de/products/rf' },
      { anbieter: 'Amazon (Naispanda)', produkt: 'Personalisiertes Mauspad mit Foto und Text, 90 × 40 cm', preis: 20.99, preisText: 'ab 20,99 €', eigenesDesign: true, angebot: 'Foto und Text, genähte Kanten', bewertung: '4,5 von 5 (633 Bewertungen)', quelle: 'https://www.amazon.de/Personalisiertes-Bedruckt-Mousepad-Gestalten-Personalisiert-Schwarz/dp/B087X3RSVF' },
      { anbieter: 'Tissus Print (Frankreich)', produkt: 'Mauspad XXL selbst gestalten, 90 × 40 cm', preis: 19.9, eigenesDesign: true, angebot: 'Druck in Frankreich, Versand nach Deutschland nicht gefunden', quelle: 'https://www.tissus-print.com/en/mousepad/tp-96544-customised-mouse-pad-xxl-90x40-cm.html' },
      { anbieter: 'Amazon (PimeX)', produkt: 'Mauspad mit Foto, Text oder Logo, 90 × 40 cm', preis: 15, eigenesDesign: true, angebot: '3 mm Gummi, Foto, Text oder Logo', quelle: 'https://www.amazon.de/-/en/Custom-Mouse-Photo-Text-Logo-customized-color/dp/B0CH8X81RS' },
      { anbieter: 'Razer', produkt: 'Gigantus V2 XXL, 940 × 410 mm', preis: 39.99, eigenesDesign: false, angebot: 'Marken-Mauspad ohne eigenes Design, im Preisvergleich ab ca. 29 €', quelle: 'https://www.razer.com/eu-en/gaming-mouse-mats/razer-gigantus-v2/RZ02-03330400-R3M1' },
      { anbieter: 'OTTO (Titanwolf)', produkt: 'Gaming-Mauspad XXL Speed, 900 × 400 mm', preis: 14.95, eigenesDesign: false, angebot: 'Massenware ohne eigenes Design, UVP 26,99 €', bewertung: '4,8 von 5 (229 Bewertungen)', quelle: 'https://www.otto.de/p/titanwolf-gaming-mauspad-xxl-speed-mousepad-900-x-400-x-3-mm-grosse-tischunterlage-1-st-rutschfest-abwaschbar-geschwindigkeit-praezision-titanwolf-schrift-S0A200WU/' },
    ],
    einkauf: [
      { lieferant: 'Printful (Druck auf Bestellung)', produkt: 'Gaming-Mauspad 91 × 46 cm, Druck inklusive', preis: 11.95, waehrung: 'USD', preisText: '11,95 US-$', hinweis: 'keine Mindestmenge, zzgl. Versand und MwSt.', fuerRechnung: true, quelle: 'https://www.printful.com/custom/mouse-pads/personalized/gaming-mouse-pad' },
      { lieferant: 'Printful (deutsche Seite)', produkt: 'Mauspad bedrucken, kleinste Größe', preis: 7.95, waehrung: 'EUR', preisText: 'ab 7,95 €', hinweis: 'Startpreis für ein kleines Mauspad, nicht für 90 × 40 cm', quelle: 'https://www.printful.com/de/mousepad-bedrucken' },
      { lieferant: 'Alibaba (Großhandel China)', produkt: 'Mauspad 900 × 400 mm, unbedruckt', preis: 1.65, waehrung: 'USD', preisText: '1,65 US-$ (ab 500 Stück 0,55 US-$)', hinweis: 'ohne Druck, zzgl. Versand, Zoll und Einfuhrumsatzsteuer, Angebot über ein Jahr alt', quelle: 'https://www.alibaba.com/product-detail/900x400-oversize-sublimation-blank-custom-shape_1601283245144.html' },
    ],
    fazit: 'Mit 24,99 € sind wir deutlich günstiger als die spezialisierten Shops für eigene Designs (ca. 40 bis 50 €) und liegen knapp über den günstigen Angeboten bei Amazon (15 bis 21 €). Der Preis ist ein gutes Verkaufsargument. Beim Einkauf über Druck auf Bestellung bleibt aber wenig Gewinn übrig, das müssen wir nachrechnen.',
  },
  {
    id: 'skin',
    name: 'Controller-Skin',
    unserPreis: 14.99,
    unserAngebot: 'für PS5, Xbox und Switch',
    umfrageOption: 'Controller-Skin',
    mitbewerber: [
      { anbieter: 'DeinDesign', produkt: 'Folie für PS5- oder Xbox-Controller selbst gestalten', preis: 14.95, preisText: 'ab 14,95 €', eigenesDesign: true, angebot: 'eigenes Foto im Online-Designer, Versand 3,95 bis 4,95 €, Lieferung 4–6 Werktage', quelle: 'https://www.deindesign.de/de/folien-fuer-spielekonsolen/microsoft-xbox-series-x-controller/selbst-gestalten' },
      { anbieter: 'Skins4u', produkt: 'PS5-Controller-Skin selbst gestalten', preis: 12.95, eigenesDesign: true, angebot: 'Bild und Text im Konfigurator, fertige Designs 9,95 €. Im Suchergebnis als ausverkauft markiert', quelle: 'https://aufkleber.skins4u.de/products/playstation-5-ps5-controller-skin-individueller-aufkleber-selbst-gestalten-personalisiert' },
      { anbieter: 'Skins4u', produkt: 'Xbox-Series-Controller-Skin mit Wunschbild', preis: 9.99, eigenesDesign: true, angebot: 'eigenes Wunschbild auf Vinylfolie, fertige Designs ab 7,99 €', quelle: 'https://aufkleber.skins4u.de/products/xbox-series-controller-skin-aufkleber-design-selbst-erstellen-individuell-mit-deinem-wunschbild' },
      { anbieter: 'Amazon (Skins4u)', produkt: 'Designfolie für PS5-Controller mit eigenem Bild', preis: null, preisText: 'nicht gefunden', eigenesDesign: true, angebot: 'eigenes Bild über Konfigurator', bewertung: '4,3 von 5 (50 Bewertungen)', quelle: 'https://www.amazon.de/Skins4u-personalisierbare-Designfolie-Playstation-Controller/dp/B0BLHLWQDB' },
      { anbieter: 'Etsy', produkt: 'Personalized Gaming Controller Skin', preis: null, preisText: 'ab 17,40 US-$', eigenesDesign: true, angebot: 'personalisierte Vinylfolie, Versand aus dem Ausland', bewertung: '4,9 von 5 (700 Bewertungen)', quelle: 'https://www.etsy.com/listing/1023664487/personalized-ps5-controller-with-your' },
      { anbieter: 'Skinit (USA)', produkt: 'Custom PS5 DualSense Controller Skin', preis: null, preisText: '24,99 US-$', eigenesDesign: true, angebot: 'eigene Bilder, Versand international 10–14 Werktage', quelle: 'https://www.skinit.com/products/custom-ps5-controller-skin' },
      { anbieter: 'Amazon (Skins4u)', produkt: 'Design-Aufkleber für PS5 DualSense, fertige Motive', preis: 8.99, eigenesDesign: false, angebot: 'fertige Motive, zzgl. 2,95 € Lieferung', bewertung: 'je nach Motiv 3,3 bis 4,0 von 5 (je 11 bis 42 Bewertungen)', quelle: 'https://www.amazon.de/Skins4u-Aufkleber-Playstation-Controller-DualSense/dp/B08PTHY7C6' },
      { anbieter: 'OTTO (Hama)', produkt: 'Silikon-Grip-Skin für PS5-Controller', preis: 7.9, eigenesDesign: false, angebot: 'Silikonhülle ohne Design, UVP 10,99 €', quelle: 'https://www.otto.de/p/hama-konsolen-tasche-silikon-grip-skin-schwarz-fuer-sony-ps5-controller-schutz-huelle-cover-case-gel-anti-rutsch-ergonomisch-schutz-pad-folie-CS0RCB024/' },
    ],
    einkauf: [
      { lieferant: 'Alibaba (Großhandel China)', produkt: 'Skin-Sticker mit eigenem Design für PS5', preis: 2.7, waehrung: 'USD', preisText: '2,30 bis 2,70 US-$', hinweis: 'Mindestmenge 20, Sammelseite, Zuordnung unsicher, zzgl. Versand und Zoll', fuerRechnung: true, quelle: 'https://www.alibaba.com/wholesale/ps5-stickers.html' },
      { lieferant: 'Alibaba (Großhandel China)', produkt: 'Vinyl-Skin-Set mit eigenem Design', preis: 2.8, waehrung: 'USD', preisText: 'ca. 2,80 US-$', hinweis: 'Mindestmenge 100 Sets, Sammelseite, Zuordnung unsicher', quelle: 'https://www.alibaba.com/showroom/skin-sticker-for-controller.html' },
    ],
    fazit: 'Unser Preis von 14,99 € entspricht fast genau dem Marktführer DeinDesign (ab 14,95 €). Skins4u ist mit 9,99 bis 12,95 € günstiger. Über den Preis allein heben wir uns hier nicht ab, wir brauchen ein anderes Argument (z. B. Design-Service oder Set-Angebote).',
  },
  {
    id: 'keycaps',
    name: 'Custom Keycaps (4er-Set)',
    unserPreis: 19.99,
    unserAngebot: '4 Tasten mit Gamertag oder Logo',
    umfrageOption: 'Custom Keycaps',
    mitbewerber: [
      { anbieter: 'Krome Keycaps (UK)', produkt: 'Einzelne Taste mit eigenem Text oder Bild', preis: null, preisText: '3,00 £ pro Taste', eigenesDesign: true, angebot: 'nur Einzeltasten, Versand aus Großbritannien', quelle: 'https://www.kromekeycaps.com/products/create-your-own-custom-xda-text-keycap' },
      { anbieter: 'YUZU Keycaps', produkt: 'Custom Keycaps, eigenes Set gestalten', preis: null, preisText: '0,75 bis 1,10 US-$ pro Taste', eigenesDesign: true, angebot: 'jede Taste einzeln gestaltbar, ein 65-%-Set kostet ca. 64 US-$', quelle: 'https://yuzukeycaps.com/custom-keycaps' },
      { anbieter: 'Thockfactory (Nürnberg)', produkt: 'Custom Keycaps, komplettes Set (105 Tasten)', preis: null, preisText: '99,99 US-$', eigenesDesign: true, angebot: 'Konfigurator für Farben, Schrift und Bilder, Fertigung in China, 5–15 Werktage plus Versand', quelle: 'https://thockfactory.com/us/collections/custom-keycaps' },
      { anbieter: 'Razer', produkt: 'PBT Keycap Upgrade Set mit Kabel', preis: 59.99, eigenesDesign: false, angebot: 'komplettes Marken-Set ohne eigenes Design', bewertung: '4,3 von 5 bei Amazon (1.592 Bewertungen)', quelle: 'https://www.razer.com/de-de/gaming-keyboards-accessories/Razer-PBT-Keycap-Coiled-Cable-Upgrade-Set/RC21-01491000-R3M1' },
      { anbieter: 'Keychron', produkt: 'PBT Full Set, ISO-Layout', preis: 58.99, eigenesDesign: false, angebot: 'komplettes Set, kostenloser Versand in Deutschland', bewertung: '3 Bewertungen, alle mit Höchstwertung', quelle: 'https://keychron.de/en/products/iso-cherry-profile-dye-sub-pbt-full-set-keycap-set-developer' },
      { anbieter: 'Caseking (Glorious)', produkt: 'GPBT Keycaps, 115 Tasten, deutsches Layout', preis: 18.9, eigenesDesign: false, angebot: 'komplettes Set, reduziert (Streichpreis je nach Seite 31,99 oder 49,99 €)', bewertung: '4,8 von 5 (5 Bewertungen)', quelle: 'https://www.caseking.de/glorious-gpbt-keycaps-115-pbt-tastenkappen-iso-de-layout-black-ash-gata-1512.html' },
    ],
    einkauf: [
      { lieferant: 'YUZU Keycaps', produkt: 'bedruckte Einzeltasten, 4 Stück', preis: 3, waehrung: 'USD', preisText: 'ab 0,75 US-$ pro Taste, also 3,00 US-$ für 4', hinweis: 'Preis gilt erst ab 50 Tasten, zzgl. Versand', fuerRechnung: true, quelle: 'https://yuzukeycaps.com/custom-keycaps' },
      { lieferant: 'Alibaba (Großhandel China)', produkt: '104 weiße Tasten zum Selbstbedrucken', preis: 5.55, waehrung: 'USD', preisText: '5,55 US-$ pro Set', hinweis: 'Mindestmenge 10 Sets, ohne Druck, zzgl. Versand und Zoll', quelle: 'https://www.alibaba.com/product-detail/Prosub-Sublimation-Blanks-Keycap-Custom-Printing_1600111304570.html' },
    ],
    fazit: 'Einen deutschen Shop, der wie wir ein kleines Set aus 4 Tasten mit eigenem Design verkauft, haben wir nicht gefunden. Eigene Designs gibt es fast nur im Ausland und als ganzes Set für rund 100 US-$. Das ist unsere Lücke im Markt. Achtung: Für 18,90 € gibt es schon ein komplettes Marken-Set ohne eigenes Design, unser Preis pro Taste ist also hoch.',
  },
  {
    id: 'led',
    name: 'LED-Schild',
    unserPreis: 49.99,
    unserAngebot: 'Neon-Schriftzug mit deinem Namen',
    umfrageOption: 'LED-Schild mit Namen',
    mitbewerber: [
      { anbieter: 'Amazon (Namofactur)', produkt: 'Personalisiertes Gamer-LED-Schild mit Namen', preis: 19.99, eigenesDesign: true, angebot: 'Namensgravur. Kritik in Bewertungen: wackelig, dünnes Material', bewertung: '4,4 von 5 (635 Bewertungen)', quelle: 'https://www.amazon.de/Personalisiertes-Jugendzimmer-Leuchtschild-Zockerzimmer-Schreibtisch/dp/B0BFRBS19R' },
      { anbieter: 'Amazon (Optechvisual)', produkt: 'Personalisierte LED-Gaming-Lampe mit Namen', preis: 19.99, eigenesDesign: true, angebot: 'Acrylglas, 16 Farben, dimmbar', bewertung: '5,0 von 5 (ca. 6 Bewertungen)', quelle: 'https://www.amazon.de/Optechvisual-Personalisierte-Gaming-geschenk-Tischlampe/dp/B0CVS5DJ8T' },
      { anbieter: 'Amazon (soulglass)', produkt: 'Personalisiertes Gamertag-Leuchtschild', preis: 29.99, eigenesDesign: true, angebot: 'eigener Gamertag', quelle: 'https://www.amazon.de/soulglass-Personalisiertes-Leuchtreklame-benutzerdefiniertes-Nachtlicht/dp/B09T5ZXZN8' },
      { anbieter: 'Rosezo', produkt: 'Personalisiertes LED-Schild (Gamertag)', preis: 39.6, eigenesDesign: true, angebot: 'personalisiert, Versand und Lieferzeit nicht gefunden', quelle: 'https://www.rosezo.com/Personalisiertes-LED-Schild' },
      { anbieter: 'Etsy', produkt: 'Gaming LED Sign mit Gamertag', preis: null, preisText: '24,20 bis 28,50 US-$', eigenesDesign: true, angebot: 'gravierter Gamertag auf Acryl mit LED-Sockel', bewertung: 'ca. 4.400 Bewertungen', quelle: 'https://www.etsy.com/listing/888407311/gaming-led-sign-name-plaque-personalised' },
      { anbieter: 'NEON EVERGLOW', produkt: 'LED-Neon-Schriftzug selbst gestalten', preis: 199, preisText: 'ab 199 €', eigenesDesign: true, angebot: 'echtes LED-Neon nach Maß, Preis nach Größe und Textlänge', quelle: 'https://neoneverglow.de/en/products/neonkonfigurator' },
      { anbieter: 'BeMyNeon', produkt: 'Personalisiertes Neon-Schild', preis: 279, eigenesDesign: true, angebot: 'Konfigurator, Preis nach Größe, Design und Farbe', quelle: 'https://www.bemyneon.com/products/personalisiertes-neon-schild' },
    ],
    einkauf: [
      { lieferant: 'Made-in-China (Großhandel)', produkt: 'Acryl-Neon-Namensschild nach Wunsch', preis: 10.53, waehrung: 'USD', preisText: '7,78 bis 10,53 US-$', hinweis: 'Mindestmenge 1, Sammelseite, zzgl. Versand und Zoll', fuerRechnung: true, quelle: 'https://www.made-in-china.com/products-search/hot-china-products/Wholesale_Acrylic_Neon_Sign.html' },
      { lieferant: 'Alibaba (Großhandel China)', produkt: 'LED-Lampe mit graviertem Namen (Acryl)', preis: 7, waehrung: 'USD', preisText: '3,90 bis 7,00 US-$', hinweis: 'Mindestmenge 2, Sammelseite, Zuordnung unsicher', quelle: 'https://www.alibaba.com/wholesale/personalized-acrylic-night-lamp.html' },
    ],
    fazit: 'Es gibt zwei Preisklassen: gravierte Acryl-Schilder mit LED für ca. 20 bis 40 € und echte Neon-Schriftzüge ab ca. 200 €. Wir liegen mit 49,99 € dazwischen. Wir müssen klar zeigen, dass unser Schild ein echter Neon-Schriftzug ist und nicht nur eine gravierte Platte, sonst wirken wir teuer.',
  },
  {
    id: 'halter',
    name: 'Headset-Halter',
    unserPreis: 29.99,
    unserAngebot: 'mit graviertem Gamertag',
    umfrageOption: 'Headset-Halter',
    mitbewerber: [
      { anbieter: 'Amazon (YuanDian)', produkt: 'Personalisierter Kopfhörerständer mit RGB-Licht', preis: 24.99, preisText: 'ab 24,99 €', eigenesDesign: true, angebot: 'Gravur mit Namen oder Gamertag, Listenpreis 34,98 €', bewertung: '4,4 von 5', quelle: 'https://www.amazon.de/YuanDian-personalisierte-Kopfh%C3%B6rer-Schreibtisch-Gaming-Headset-Halter-Kundenspezifisch/dp/B0BJJ7VTP6' },
      { anbieter: 'LUMIQY', produkt: 'Holz-Ständer für 2 Controller und Headset', preis: 17.99, eigenesDesign: true, angebot: 'Lasergravur mit Gamertag oder Logo, Lieferzeit 2–3 Werktage', quelle: 'https://lumiqy.de/shop/holz-staender-fuer-2-controller-gamepads-und-headset-kopfhoerer-personalisierbar-individuelle-lasergravur/' },
      { anbieter: 'Etsy', produkt: 'Personalized Headphone Stand mit Gamertag', preis: null, preisText: '26,17 US-$ (statt 34,90)', eigenesDesign: true, angebot: 'Gamertag-Gravur mit LED, Versand aus dem Ausland', bewertung: '4,8 von 5 (123 Bewertungen)', quelle: 'https://www.etsy.com/listing/1680563347/personalized-headphone-stand-custom' },
      { anbieter: 'Razer', produkt: 'Base Station V2 Chroma', preis: 84.99, eigenesDesign: false, angebot: 'RGB-Licht und USB-Hub, im Preisvergleich ab ca. 75 €', quelle: 'https://www.razer.com/de-de/gaming-headsets-and-audio-accessories/Razer-Base-Station-V2-Chroma/RC21-01510100-R3M1' },
      { anbieter: 'Corsair', produkt: 'ST100 RGB Kopfhörerständer', preis: 59.85, preisText: 'ab 59,85 €', eigenesDesign: false, angebot: 'Aluminium, USB-Anschlüsse, Soundkarte', bewertung: '4,9 von 5 bei Alternate (16 Bewertungen)', quelle: 'https://geizhals.de/corsair-gaming-st100-rgb-kopfhoererstaender-ca-9011167-eu-a1699860.html' },
      { anbieter: 'OTTO (Piranha Gaming)', produkt: 'Gaming Headset Stand', preis: 12.99, eigenesDesign: false, angebot: 'einfacher Ständer', quelle: 'https://www.otto.de/p/piranha-gaming-gaming-headset-stand-kopfhoererstaender-S0M0W0VL/' },
      { anbieter: 'Speedlink', produkt: 'Excedo Gaming Headset Stand', preis: 11.97, preisText: 'ab 11,97 €', eigenesDesign: false, angebot: 'einfacher Ständer', quelle: 'https://geizhals.de/speedlink-excedo-gaming-headset-stand-schwarz-sl-800900-bk-a1592905.html' },
    ],
    einkauf: [
      { lieferant: 'Alibaba (Großhandel China)', produkt: 'Acryl-Kopfhörerständer, Farbe und Logo nach Wunsch', preis: 1.89, waehrung: 'USD', preisText: '1,79 bis 1,89 US-$', hinweis: 'Mindestmenge 100, Sammelseite, ohne Gravur, zzgl. Versand und Zoll', fuerRechnung: true, quelle: 'https://www.alibaba.com/showroom/acrylic-headphone-stand.html' },
      { lieferant: 'Made-in-China (Großhandel)', produkt: 'Acryl-Ständer mit eigenem Logodruck', preis: 19.99, waehrung: 'USD', preisText: '6,99 bis 19,99 US-$', hinweis: 'Mindestmenge 100', quelle: 'https://gondodisplays.en.made-in-china.com/product/lmLYoeZCbupP/China-POS-Retail-Store-Acrylic-Headphone-Display-Stand-Custom-Acrylic-Headphone-Display.html' },
    ],
    fazit: 'Einfache Halter gibt es ab 12 €, Marken-Halter mit Licht kosten 60 bis 85 €. Personalisierte Halter liegen bei 18 bis 25 €. Wir sind mit 29,99 € der teuerste personalisierte Halter. Entweder senken wir den Preis auf ca. 24,99 € oder wir begründen ihn mit besserem Material.',
  },
];

// Zahlen zum Markt (ebenfalls aus Suchergebnissen, vor der Präsentation über den Link prüfen)
export const marktdaten = [
  { zahl: '41,2 Mio.', text: 'Menschen in Deutschland spielen Computer- und Videospiele. Durchschnittsalter: 38,3 Jahre.', jahr: 'game-Verband, Jahresreport 2026', quelle: 'https://www.game.de/mehr-als-41-millionen-menschen-in-deutschland-spielen-games/' },
  { zahl: '89 %', text: 'der 16- bis 29-Jährigen spielen. Das ist unsere Zielgruppe.', jahr: 'Bitkom, Gaming in Deutschland 2026', quelle: 'https://www.bitkom.org/Presse/Presseinformation/Rund-39-Millionen-sind-Gamer' },
  { zahl: '1,4 Mrd. €', text: 'Umsatz mit Gaming-PC-Zubehör in Deutschland im Jahr 2025 (+13 %). Dazu zählen auch Grafikkarten, Monitore und Eingabegeräte.', jahr: 'game-Verband, März 2026', quelle: 'https://www.game.de/deutscher-games-markt-waechst-2025-um-4-prozent/' },
  { zahl: '360 Mio. €', text: 'Umsatz mit Konsolen-Zubehör in Deutschland im Jahr 2025 (−10 %).', jahr: 'game-Verband, März 2026', quelle: 'https://www.game.de/deutscher-games-markt-waechst-2025-um-4-prozent/' },
];
