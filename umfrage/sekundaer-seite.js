// Ansicht "Sekundärforschung" im Auswertungszentrum. Die Daten stehen in sekundaer.js.
import { stand, produkte, marktdaten, dollarKurs } from './sekundaer.js';
import { fragen } from './fragen.js';
import { escapeHtml as e, prozent, frageAuswerten } from './auswertung.js';

const MWST = 0.19;

function median(zahlen) {
  const sortiert = [...zahlen].sort((a, b) => a - b);
  const mitte = Math.floor(sortiert.length / 2);
  return sortiert.length % 2 ? sortiert[mitte] : (sortiert[mitte - 1] + sortiert[mitte]) / 2;
}

const quelle = (eintrag) => {
  if (!eintrag.quelle) return '<span class="leise">–</span>';
  let name = eintrag.quelle;
  try { name = new URL(eintrag.quelle).hostname.replace(/^www\./, ''); } catch { /* Text statt Link */ }
  return `<a class="textlink" href="${e(eintrag.quelle)}" target="_blank" rel="noopener noreferrer">${e(name)}</a>`;
};

// Preisstrahl: jeder Punkt ist ein Angebot, die Raute ist unser Preis.
function preisstrahl(produkt, euro) {
  const angebote = produkt.mitbewerber.filter((m) => Number.isFinite(m.preis));
  if (angebote.length === 0) return '';
  const hoechster = Math.max(produkt.unserPreis, ...angebote.map((m) => m.preis));
  const schritt = [5, 10, 20, 25, 50, 100, 200].find((s) => hoechster / s <= 6) ?? 500;
  const ende = Math.ceil((hoechster * 1.05) / schritt) * schritt;
  const links = (preis) => `${((preis / ende) * 100).toFixed(2)}%`;
  const striche = [];
  for (let t = 0; t <= ende; t += schritt) striche.push(t);
  const wir = produkt.unserPreis / ende;
  const schildSeite = wir > 0.8 ? ' schild--rechts' : wir < 0.2 ? ' schild--links' : '';
  const preise = angebote.map((m) => m.preis);
  return `<div class="strahl" role="img" aria-label="${e(`Preise der Mitbewerber von ${euro.format(Math.min(...preise))} bis ${euro.format(Math.max(...preise))}. Unser Preis: ${euro.format(produkt.unserPreis)}.`)}">
    <div class="strahl__feld">
      <span class="strahl__linie"></span>
      ${striche.map((t) => `<span class="strahl__strich" style="left:${links(t)}"><i>${t} €</i></span>`).join('')}
      ${angebote.map((m) => `<span class="punkt${m.eigenesDesign ? '' : ' punkt--ohne'}" style="left:${links(m.preis)}" tabindex="0" data-tip="${e(`${m.anbieter}: ${m.preisText ?? euro.format(m.preis)}`)}"></span>`).join('')}
      <span class="punkt punkt--wir" style="left:${links(produkt.unserPreis)}" tabindex="0" data-tip="${e(`LootLager: ${euro.format(produkt.unserPreis)}`)}"></span>
      <span class="schild${schildSeite}" style="left:${links(produkt.unserPreis)}">LootLager ${e(euro.format(produkt.unserPreis))}</span>
    </div>
    <p class="legende" aria-hidden="true">
      <span><i class="punkt punkt--wir"></i>unser Preis</span>
      <span><i class="punkt"></i>Mitbewerber mit eigenem Design</span>
      <span><i class="punkt punkt--ohne"></i>Mitbewerber ohne eigenes Design</span>
    </p>
  </div>`;
}

function einordnung(produkt, euro) {
  const preise = produkt.mitbewerber.map((m) => m.preis).filter(Number.isFinite);
  if (preise.length === 0) return null;
  const guenstiger = preise.filter((p) => p < produkt.unserPreis).length;
  return {
    von: Math.min(...preise),
    bis: Math.max(...preise),
    median: median(preise),
    anzahl: preise.length,
    text: `${guenstiger} von ${preise.length} Angeboten sind günstiger als wir (${euro.format(produkt.unserPreis)}).`,
  };
}

// Rohgewinn pro Stück: unser Preis ohne Mehrwertsteuer minus Einkaufspreis.
// Gerechnet wird mit dem Einkauf, der in sekundaer.js mit "fuerRechnung" markiert ist.
// Steht der EK in US-Dollar, braucht es dafür den dollarKurs aus sekundaer.js.
function kalkulation(produkt) {
  const netto = produkt.unserPreis / (1 + MWST);
  const quelleEk = produkt.einkauf.find((k) => k.fuerRechnung && Number.isFinite(k.preis));
  if (!quelleEk) return { netto, ek: null };
  const kurs = quelleEk.waehrung === 'EUR' ? 1 : (quelleEk.waehrung === 'USD' && dollarKurs > 0 ? dollarKurs : null);
  if (!kurs) return { netto, ek: null, quelleEk };
  const preis = quelleEk.preis * kurs;
  return { netto, quelleEk, ek: { ...quelleEk, preis }, umgerechnet: kurs !== 1, rohgewinn: netto - preis, spanne: (netto - preis) / netto };
}

function umfrageBezug(produkt, saetze, balkenListe) {
  if (saetze.length === 0) return '<p class="leise">Sobald es gültige Antworten gibt, steht hier, was unsere Umfrage zu diesem Produkt sagt.</p>';
  const teile = [];
  const produktFrage = fragen.find((f) => f.id === 'produkte');
  if (produktFrage && produkt.umfrageOption && produktFrage.optionen.includes(produkt.umfrageOption)) {
    const ergebnis = frageAuswerten(saetze, produktFrage);
    const zeile = ergebnis.zeilen.find((z) => z.option === produkt.umfrageOption);
    if (ergebnis.n > 0) {
      teile.push(`<p><strong>${prozent.format(zeile.anzahl / ergebnis.n)}</strong> der Befragten (${zeile.anzahl} von ${ergebnis.n}) würden sich dieses Produkt mit eigenem Design holen.</p>`);
    }
  }
  for (const frageId of [produkt.preisFrage, produkt.kaufFrage]) {
    const preisFrage = frageId && fragen.find((f) => f.id === frageId);
    if (!preisFrage) continue;
    const ergebnis = frageAuswerten(saetze, preisFrage);
    if (ergebnis.n > 0) {
      teile.push(`<p class="leise">${e(preisFrage.text)} (${ergebnis.n} Antworten)</p>`);
      teile.push(balkenListe(ergebnis.zeilen.map((z) => ({
        name: e(z.option),
        anteil: z.anzahl / ergebnis.n,
        anzahl: z.anzahl,
        zahl: `<strong>${prozent.format(z.anzahl / ergebnis.n)}</strong><span>${z.anzahl}</span>`,
        tip: `${z.option}: ${z.anzahl} von ${ergebnis.n}`,
      }))));
    }
  }
  return teile.join('') || '<p class="leise">Zu diesem Produkt gibt es keine eigene Frage in der Umfrage.</p>';
}

function produktKarte(produkt, { saetze, euro, balkenListe }) {
  const ein = einordnung(produkt, euro);
  const kalk = kalkulation(produkt);
  return `<section class="karte produkt" id="produkt-${e(produkt.id)}">
    <h2>${e(produkt.name)}</h2>
    <p class="leise">Unser Angebot: ${e(produkt.unserAngebot)} für <strong>${e(euro.format(produkt.unserPreis))}</strong></p>

    <h3>Preise der Mitbewerber</h3>
    ${preisstrahl(produkt, euro)}
    ${ein ? `<p>${e(ein.text)} Die Mitbewerber liegen zwischen ${e(euro.format(ein.von))} und ${e(euro.format(ein.bis))}, der mittlere Preis (Median) ist ${e(euro.format(ein.median))}.</p>` : ''}
    <div class="rollen">
      <table class="tabelle">
        <thead><tr><th scope="col">Anbieter</th><th scope="col">Produkt</th><th scope="col" class="rechts">Preis</th><th scope="col">Angebot</th><th scope="col">Bewertung (Reaktionen)</th><th scope="col">Quelle</th></tr></thead>
        <tbody>${produkt.mitbewerber.map((m) => `<tr>
          <th scope="row">${e(m.anbieter)}</th>
          <td>${e(m.produkt)}${m.eigenesDesign ? ' <span class="marke">eigenes Design</span>' : ''}</td>
          <td class="rechts nowrap">${e(m.preisText ?? (Number.isFinite(m.preis) ? euro.format(m.preis) : '–'))}</td>
          <td>${e(m.angebot ?? '–')}</td>
          <td>${e(m.bewertung ?? 'keine Angabe')}</td>
          <td>${quelle(m)}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>

    <h3>Einkaufspreis (EK) und Rohgewinn</h3>
    ${produkt.einkauf.length ? `<div class="rollen">
      <table class="tabelle">
        <thead><tr><th scope="col">Lieferant</th><th scope="col">Produkt</th><th scope="col" class="rechts">Preis pro Stück</th><th scope="col">Hinweis</th><th scope="col">Quelle</th></tr></thead>
        <tbody>${produkt.einkauf.map((k) => `<tr>
          <th scope="row">${e(k.lieferant)}</th>
          <td>${e(k.produkt)}</td>
          <td class="rechts nowrap">${e(k.preisText ?? euro.format(k.preis))}</td>
          <td>${e(k.hinweis ?? '–')}</td>
          <td>${quelle(k)}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>` : '<p class="leise">Noch kein Einkaufspreis eingetragen.</p>'}
    ${kalk.ek ? `<dl class="rechnung">
      <div><dt>Unser Preis mit MwSt.</dt><dd>${e(euro.format(produkt.unserPreis))}</dd></div>
      <div><dt>ohne 19 % MwSt.</dt><dd>${e(euro.format(kalk.netto))}</dd></div>
      <div><dt>EK bei ${e(kalk.ek.lieferant)}${kalk.umgerechnet ? ', umgerechnet' : ''}</dt><dd>− ${e(euro.format(kalk.ek.preis))}</dd></div>
      <div class="rechnung__summe"><dt>Rohgewinn pro Stück</dt><dd>${e(euro.format(kalk.rohgewinn))} <small>(${prozent.format(kalk.spanne)} vom Nettopreis)</small></dd></div>
    </dl>
    <p class="leise">Vom Rohgewinn gehen noch Versand zum Kunden, Verpackung, Werbung, Zahlungsgebühren und unsere Arbeit ab. Beim Einkauf im Ausland kommen Versand, Zoll und Einfuhrumsatzsteuer dazu.</p>` : (kalk.quelleEk ? `<p class="hinweis-kasten">Der Einkaufspreis steht in US-Dollar. Tragt in <code>umfrage/sekundaer.js</code> bei <code>dollarKurs</code> den aktuellen Kurs ein, dann rechnet diese Seite den Rohgewinn pro Stück aus.</p>` : '')}

    <h3>Dazu aus unserer Umfrage (Primärforschung)</h3>
    ${umfrageBezug(produkt, saetze, balkenListe)}

    ${produkt.fazit ? `<p class="fazit"><strong>Fazit:</strong> ${e(produkt.fazit)}</p>` : ''}
  </section>`;
}

export function sekundaerAnsicht({ saetze, euro, balkenListe }) {
  const zeilen = produkte.map((p) => ({ p, ein: einordnung(p, euro), kalk: kalkulation(p) }));
  return `
    <section class="karte">
      <h2>Worum geht es?</h2>
      <p>Bei der <strong>Sekundärforschung</strong> nutzen wir Daten, die es schon gibt: Preise, Angebote und Bewertungen unserer Mitbewerber und die Preise, zu denen wir einkaufen könnten. Die Umfrage ist dagegen <strong>Primärforschung</strong>, weil wir dort selbst neue Daten erheben.</p>
      <p class="warnung"><strong>Bitte vor der Präsentation nachprüfen:</strong> Alle Preise und Bewertungen stammen aus Suchergebnissen vom ${e(stand)}. Die Shop-Seiten selbst wurden dabei nicht geöffnet, einzelne Werte können deshalb veraltet oder falsch zugeordnet sein. Öffnet für jeden Wert, den ihr zeigt, den Link in der Spalte „Quelle“ und korrigiert ihn bei Bedarf in der Datei <code>umfrage/sekundaer.js</code>.</p>
    </section>

    <section class="karte">
      <h2>Alle Produkte im Überblick</h2>
      <div class="rollen">
        <table class="tabelle">
          <thead><tr><th scope="col">Produkt</th><th scope="col" class="rechts">Unser Preis</th><th scope="col" class="rechts">Mitbewerber von – bis</th><th scope="col" class="rechts">Mittlerer Preis</th><th scope="col" class="rechts">Einkaufspreis (EK)</th><th scope="col" class="rechts">Rohgewinn</th></tr></thead>
          <tbody>${zeilen.map(({ p, ein, kalk }) => `<tr>
            <th scope="row"><a class="textlink" href="#produkt-${e(p.id)}">${e(p.name)}</a></th>
            <td class="rechts nowrap">${e(euro.format(p.unserPreis))}</td>
            <td class="rechts nowrap">${ein ? `${e(euro.format(ein.von))} – ${e(euro.format(ein.bis))}` : '–'}</td>
            <td class="rechts nowrap">${ein ? e(euro.format(ein.median)) : '–'}</td>
            <td class="rechts nowrap">${kalk.quelleEk ? e(kalk.quelleEk.preisText ?? euro.format(kalk.quelleEk.preis)) : '–'}</td>
            <td class="rechts nowrap">${kalk.ek ? `${e(euro.format(kalk.rohgewinn))} (${prozent.format(kalk.spanne)})` : '–'}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
      <p class="leise">Mittlerer Preis = Median der gefundenen Angebote. Rohgewinn = unser Preis ohne 19 % Mehrwertsteuer minus Einkaufspreis.${dollarKurs > 0 ? ` US-Dollar sind mit dem Kurs ${String(dollarKurs).replace('.', ',')} € umgerechnet.` : ' Die Einkaufspreise stehen in US-Dollar. Der Rohgewinn erscheint, sobald in <code>umfrage/sekundaer.js</code> der <code>dollarKurs</code> eingetragen ist.'}</p>
    </section>

    ${produkte.map((p) => produktKarte(p, { saetze, euro, balkenListe })).join('')}

    ${marktdaten.length ? `<section class="karte">
      <h2>Marktdaten</h2>
      <ul class="aussagen">${marktdaten.map((m) => `<li><strong>${e(m.zahl)}</strong><span>${e(m.text)} <span class="leise">(${e(m.jahr)}, ${quelle(m)})</span></span></li>`).join('')}</ul>
    </section>` : ''}`;
}
