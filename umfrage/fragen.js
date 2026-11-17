// Alle Fragen der Umfrage stehen hier. Wer hier etwas ändert, ändert Umfrage UND Auswertung.
//
// Fragetypen:
//   einfach   – genau eine Antwort (Tippen geht direkt zur nächsten Frage)
//   mehrfach  – mehrere Antworten; "exklusiv" ist die Antwort, die alle anderen abwählt (z. B. "Keins davon")
//   skala     – 1 bis 5, mit Beschriftung links (min) und rechts (max)
//   kontrolle – Aufmerksamkeits-Check: wer nicht "richtig" wählt, zählt in der Auswertung nicht mit
//   text      – offene Frage, freiwillig
//
// "varianten": leicht andere Formulierung der Frage für einzelne Versionen (siehe versionen.js).
// Nur der Fragetext ändert sich. Die Antworten bleiben gleich, damit das Team-Zentrum alles zusammenzählen kann.
// "text" ist die Fassung von Nick und die, die im Auswertungszentrum steht.
// "kurz" ist die Kurzbezeichnung der Frage für Tabellen und Menüs im Auswertungszentrum.
//
// Achtung: Wenn die Umfrage schon läuft, keine Antworttexte mehr ändern.
// Die Auswertung zählt nach dem genauen Text, alte Antworten würden sonst nicht mehr passen.

export const fragen = [
  {
    id: 'alter',
    kurz: 'Alter',
    typ: 'einfach',
    text: 'Wie alt bist du?',
    varianten: {
      noah: 'Zu welcher Altersgruppe gehörst du?',
      luca: 'Zuerst kurz zu dir: Wie alt bist du?',
    },
    optionen: ['unter 16', '16–20', '21–25', '26–30', 'über 30'],
  },
  {
    id: 'zocken',
    kurz: 'Zocken',
    typ: 'einfach',
    text: 'Wie oft zockst du?',
    varianten: {
      noah: 'Wie häufig spielst du Videospiele?',
      luca: 'Wie oft sitzt du in einer normalen Woche am Zocken?',
    },
    optionen: ['Täglich', 'Mehrmals pro Woche', 'Etwa einmal pro Woche', 'Seltener', 'Nie'],
  },
  {
    id: 'plattform',
    kurz: 'Plattform',
    typ: 'mehrfach',
    text: 'Worauf spielst du?',
    varianten: {
      noah: 'Auf welchen Geräten spielst du?',
      luca: 'Womit zockst du?',
    },
    hinweis: 'Mehrere Antworten möglich',
    optionen: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Handy', 'Gar nicht'],
    exklusiv: 'Gar nicht',
  },
  {
    id: 'produkte',
    kurz: 'Produkte',
    typ: 'mehrfach',
    text: 'Welche Produkte würdest du dir mit eigenem Design holen?',
    varianten: {
      noah: 'Welche dieser Produkte würdest du mit deinem eigenen Design kaufen?',
      luca: 'Stell dir vor, du kannst das Design selbst bestimmen: Was davon würdest du bestellen?',
    },
    hinweis: 'Mehrere Antworten möglich',
    optionen: [
      'XXL-Mauspad',
      'Controller-Skin',
      'Custom Keycaps',
      'LED-Schild mit Namen',
      'Headset-Halter',
      'Keins davon',
    ],
    exklusiv: 'Keins davon',
  },
  {
    id: 'design',
    kurz: 'Eigenes Design',
    typ: 'skala',
    text: 'Wie wichtig ist dir ein eigenes Design bei Gaming-Zubehör?',
    varianten: {
      noah: 'Wie wichtig ist es dir, dass dein Gaming-Zubehör ein eigenes Design hat?',
      luca: 'Eigenes Design auf deinem Gaming-Zubehör: Wie wichtig ist dir das?',
    },
    min: 'egal',
    max: 'sehr wichtig',
  },
  {
    id: 'preis',
    kurz: 'Preis Mauspad',
    typ: 'einfach',
    text: 'Wie viel würdest du für ein XXL-Mauspad mit deinem eigenen Design zahlen?',
    varianten: {
      noah: 'Was wäre dir ein XXL-Mauspad mit deinem eigenen Design wert?',
      luca: 'Ein XXL-Mauspad mit deinem eigenen Motiv: Wie viel würdest du höchstens ausgeben?',
    },
    optionen: ['bis 15 €', '16–25 €', '26–35 €', 'mehr als 35 €'],
  },
  {
    // Sekundärforschung in der Umfrage: Die Preise stammen aus sekundaer.js (Mauspad, Spezial-Shops
    // für eigene Designs: Deskyou 39,95 € bis propads.gg 49,99 €). Ändern sich die Preise dort, hier mit anpassen.
    // Diese Frage beantwortet die Leitfrage: Ist es sinnvoll, den Onlineshop so einzurichten?
    id: 'vergleich',
    kurz: 'Kaufabsicht',
    typ: 'einfach',
    text: 'Spezial-Shops verlangen für ein XXL-Mauspad mit eigenem Design ca. 40 bis 50 €. Bei LootLager kostet es 24,99 €. Würdest du bei uns bestellen?',
    varianten: {
      noah: 'Ein XXL-Mauspad mit eigenem Design kostet in Spezial-Shops ca. 40 bis 50 €, bei LootLager 24,99 €. Würdest du bei uns bestellen?',
      luca: 'Zum Vergleich: Andere Shops nehmen für ein XXL-Mauspad mit eigenem Design ca. 40 bis 50 €, wir 24,99 €. Würdest du bei LootLager bestellen?',
    },
    optionen: ['Ja, sicher', 'Eher ja', 'Eher nicht', 'Nein'],
  },
  {
    id: 'kontrolle',
    kurz: 'Kontrollfrage',
    typ: 'kontrolle',
    text: 'Kurzer Aufmerksamkeits-Check: Bitte tippe auf „Lila“.',
    varianten: {
      noah: 'Kleiner Test, ob du noch dabei bist: Wähle bitte „Lila“.',
      luca: 'Nur zur Kontrolle: Tippe hier bitte auf „Lila“.',
    },
    optionen: ['Rot', 'Grün', 'Lila', 'Blau'],
    richtig: 'Lila',
  },
  {
    id: 'kaufgrund',
    kurz: 'Kaufgrund',
    typ: 'einfach',
    text: 'Was ist dir beim Kauf von Gaming-Zubehör am wichtigsten?',
    varianten: {
      noah: 'Worauf achtest du beim Kauf von Gaming-Zubehör am meisten?',
      luca: 'Wenn du Gaming-Zubehör kaufst: Was zählt für dich am meisten?',
    },
    optionen: ['Niedriger Preis', 'Gute Qualität', 'Cooles Design', 'Schnelle Lieferung', 'Gute Bewertungen'],
  },
  {
    id: 'kaufort',
    kurz: 'Kaufort',
    typ: 'mehrfach',
    text: 'Wo kaufst du Gaming-Zubehör meistens?',
    varianten: {
      noah: 'Wo bestellst oder kaufst du dein Gaming-Zubehör normalerweise?',
      luca: 'Wo holst du dir dein Gaming-Zubehör am häufigsten?',
    },
    hinweis: 'Mehrere Antworten möglich',
    optionen: [
      'Amazon',
      'MediaMarkt oder Saturn',
      'Direkt bei Marken (z. B. Logitech, Razer)',
      'Etsy oder kleine Online-Shops',
      'Noch nie welches gekauft',
    ],
    exklusiv: 'Noch nie welches gekauft',
  },
  {
    id: 'kontrolle2',
    kurz: 'Kontrollfrage 2',
    typ: 'kontrolle',
    text: 'Noch ein kurzer Check: Wie viele Beine hat eine Katze?',
    varianten: {
      noah: 'Zweiter Test, ob du noch dabei bist: Wie viele Beine hat eine Katze?',
      luca: 'Fast geschafft. Nur zur Kontrolle: Wie viele Beine hat eine Katze?',
    },
    optionen: ['2', '3', '4', '6'],
    richtig: '4',
  },
  {
    id: 'kanal',
    kurz: 'Werbekanal',
    typ: 'einfach',
    text: 'Wo würdest du am ehesten von einem neuen Gaming-Shop erfahren?',
    varianten: {
      noah: 'Über welchen Kanal würdest du einen neuen Gaming-Shop am ehesten entdecken?',
      luca: 'Wo müsste ein neuer Gaming-Shop auftauchen, damit du ihn bemerkst?',
    },
    optionen: ['TikTok', 'Instagram', 'YouTube', 'Twitch', 'Freunde', 'Google-Suche'],
  },
  {
    id: 'wunsch',
    kurz: 'Wunsch',
    typ: 'text',
    text: 'Was müsste ein neuer Gaming-Shop bieten, damit du dort bestellst?',
    varianten: {
      noah: 'Was würde dich überzeugen, bei einem neuen Gaming-Shop zu bestellen?',
      luca: 'Was fehlt dir bei den Gaming-Shops, die du kennst?',
    },
    hinweis: 'Freiwillig. Zum Beispiel ein Produkt, das dir fehlt, ein Rabatt oder etwas ganz anderes',
    maxLaenge: 500,
  },
];

export const kontrollfragen = fragen.filter((f) => f.typ === 'kontrolle');
export const kontrollfrage = kontrollfragen[0];

// Fassung für den Browser: ohne die richtige Antwort der Kontrollfrage,
// mit der Formulierung der jeweiligen Version.
export function oeffentlicheFragen(versionId) {
  return fragen.map(({ richtig, kurz, varianten, ...rest }) => ({ ...rest, text: varianten?.[versionId] ?? rest.text }));
}

export function istGueltig(antworten) {
  return kontrollfragen.every((f) => antworten[f.id] === f.richtig);
}

// Prüft eine eingesandte Antwort. Gibt { antworten } zurück oder { fehler }.
export function pruefeAntworten(eingang) {
  if (!eingang || typeof eingang !== 'object' || Array.isArray(eingang)) {
    return { fehler: 'Antworten fehlen' };
  }
  const antworten = {};
  for (const frage of fragen) {
    const wert = eingang[frage.id];
    switch (frage.typ) {
      case 'einfach':
      case 'kontrolle':
        if (!frage.optionen.includes(wert)) return { fehler: `Frage „${frage.id}“ fehlt` };
        antworten[frage.id] = wert;
        break;
      case 'mehrfach': {
        if (!Array.isArray(wert) || wert.length === 0) return { fehler: `Frage „${frage.id}“ fehlt` };
        const auswahl = frage.optionen.filter((o) => wert.includes(o));
        if (auswahl.length !== new Set(wert).size) return { fehler: `Frage „${frage.id}“ hat eine unbekannte Antwort` };
        if (frage.exklusiv && auswahl.includes(frage.exklusiv) && auswahl.length > 1) {
          return { fehler: `Frage „${frage.id}“: „${frage.exklusiv}“ geht nicht zusammen mit anderen Antworten` };
        }
        antworten[frage.id] = auswahl;
        break;
      }
      case 'skala':
        if (!Number.isInteger(wert) || wert < 1 || wert > 5) return { fehler: `Frage „${frage.id}“ fehlt` };
        antworten[frage.id] = wert;
        break;
      case 'text': {
        const text = typeof wert === 'string' ? wert.trim().slice(0, frage.maxLaenge ?? 500) : '';
        antworten[frage.id] = text;
        break;
      }
      default:
        return { fehler: `Unbekannter Fragetyp „${frage.typ}“` };
    }
  }
  return { antworten };
}
