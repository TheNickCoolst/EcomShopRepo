// Die Versionen der Umfrage. Jede Version hat
//   - einen eigenen Link:               /nick, /noah, /luca
//   - eigene Antworten:                 daten/antworten-nick.jsonl usw.
//   - ein eigenes Auswertungszentrum:   /nick/auswertung usw., mit eigenem Passwort
// Dazu kommt das Team-Zentrum /team/auswertung, das alle Antworten zusammen zeigt.
//
// Wer einen Namen ändert oder eine Version ergänzt: "id" nur aus Kleinbuchstaben und Ziffern.
// Das Passwort einer Version steht in Railway in der Variable PASSWORT_<ID in Großbuchstaben>.

export const versionen = [
  { id: 'nick', name: 'Nick' },
  { id: 'noah', name: 'Noah' },
  { id: 'luca', name: 'Luca' },
];

export const TEAM = { id: 'team', name: 'Team', team: true };

export const versionVon = (id) => versionen.find((v) => v.id === id) ?? null;

// Ein Zentrum ist entweder eine der Versionen oder das Team-Zentrum.
export const zentrumVon = (id) => (id === TEAM.id ? TEAM : versionVon(id));

export function passwortVariable(zentrum) {
  return zentrum.team ? 'ADMIN_PASSWORT' : `PASSWORT_${zentrum.id.toUpperCase()}`;
}

// Passwort eines Zentrums. Fehlt das eigene Passwort einer Version, gilt ADMIN_PASSWORT.
export function passwortVon(zentrum, env = process.env) {
  if (zentrum.team) return env.ADMIN_PASSWORT || '';
  return env[passwortVariable(zentrum)] || env.ADMIN_PASSWORT || '';
}

const reserviert = new Set(['team', 'api', 'auswertung', 'gesund']);
for (const v of versionen) {
  if (!/^[a-z0-9]{1,20}$/.test(v.id) || reserviert.has(v.id)) {
    throw new Error(`versionen.js: „${v.id}“ ist als id nicht erlaubt (nur Kleinbuchstaben und Ziffern, nicht team/api/auswertung/gesund).`);
  }
}
if (new Set(versionen.map((v) => v.id)).size !== versionen.length) {
  throw new Error('versionen.js: Jede id darf nur einmal vorkommen.');
}
