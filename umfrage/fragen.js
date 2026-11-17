// Alle Fragen der Umfrage stehen hier. Wer hier etwas ändert, ändert Umfrage UND Auswertung.
//
// Fragetypen:
//   einfach   – genau eine Antwort (Tippen geht direkt zur nächsten Frage)
//   mehrfach  – mehrere Antworten; "exklusiv" ist die Antwort, die alle anderen abwählt (z. B. "Keins davon")
//   skala     – 1 bis 5, mit Beschriftung links (min) und rechts (max)
//   kontrolle – Aufmerksamkeits-Check: wer nicht "richtig" wählt, zählt in der Auswertung nicht mit
//   text      – offene Frage, freiwillig
//
// Achtung: Wenn die Umfrage schon läuft, keine Antworttexte mehr ändern.
// Die Auswertung zählt nach dem genauen Text, alte Antworten würden sonst nicht mehr passen.

export const fragen = [
  {
    id: 'alter',
    typ: 'einfach',
    text: 'Wie alt bist du?',
    optionen: ['unter 16', '16–20', '21–25', '26–30', 'über 30'],
  },
  {
    id: 'zocken',
    typ: 'einfach',
    text: 'Wie oft zockst du?',
    optionen: ['Täglich', 'Mehrmals pro Woche', 'Etwa einmal pro Woche', 'Seltener', 'Nie'],
  },
  {
    id: 'plattform',
    typ: 'mehrfach',
    text: 'Worauf spielst du?',
    hinweis: 'Mehrere Antworten möglich',
    optionen: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Handy', 'Gar nicht'],
    exklusiv: 'Gar nicht',
  },
  {
    id: 'produkte',
    typ: 'mehrfach',
    text: 'Welche Produkte würdest du dir mit eigenem Design holen?',
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
    typ: 'skala',
    text: 'Wie wichtig ist dir ein eigenes Design bei Gaming-Zubehör?',
    min: 'egal',
    max: 'sehr wichtig',
  },
  {
    id: 'preis',
    typ: 'einfach',
    text: 'Wie viel würdest du für ein XXL-Mauspad mit deinem eigenen Design zahlen?',
    optionen: ['bis 15 €', '16–25 €', '26–35 €', 'mehr als 35 €'],
  },
  {
    id: 'kontrolle',
    typ: 'kontrolle',
    text: 'Kurzer Aufmerksamkeits-Check: Bitte tippe auf „Lila“.',
    optionen: ['Rot', 'Grün', 'Lila', 'Blau'],
    richtig: 'Lila',
  },
  {
    id: 'kaufgrund',
    typ: 'einfach',
    text: 'Was ist dir beim Kauf von Gaming-Zubehör am wichtigsten?',
    optionen: ['Niedriger Preis', 'Gute Qualität', 'Cooles Design', 'Schnelle Lieferung', 'Gute Bewertungen'],
  },
  {
    id: 'kaufort',
    typ: 'mehrfach',
    text: 'Wo kaufst du Gaming-Zubehör meistens?',
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
    id: 'kanal',
    typ: 'einfach',
    text: 'Wo würdest du am ehesten von einem neuen Gaming-Shop erfahren?',
    optionen: ['TikTok', 'Instagram', 'YouTube', 'Twitch', 'Freunde', 'Google-Suche'],
  },
  {
    id: 'wunsch',
    typ: 'text',
    text: 'Was müsste ein neuer Gaming-Shop bieten, damit du dort bestellst?',
    hinweis: 'Freiwillig. Zum Beispiel ein Produkt, das dir fehlt, ein Rabatt oder etwas ganz anderes',
    maxLaenge: 500,
  },
];

export const kontrollfrage = fragen.find((f) => f.typ === 'kontrolle');

// Version für den Browser: ohne die richtige Antwort der Kontrollfrage.
export function oeffentlicheFragen() {
  return fragen.map(({ richtig, ...rest }) => rest);
}

export function istGueltig(antworten) {
  return !kontrollfrage || antworten[kontrollfrage.id] === kontrollfrage.richtig;
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
