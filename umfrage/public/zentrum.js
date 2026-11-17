// Kleine Helfer im Auswertungszentrum: Hinweis-Fähnchen an Balken und Punkten,
// Filter sofort anwenden, Link kopieren, drucken.
'use strict';

const tip = document.getElementById('tip');

function tipZeigen(element) {
  if (!tip) return;
  tip.textContent = element.dataset.tip; // textContent: Antworten der Befragten nie als HTML einsetzen
  tip.hidden = false;
  const r = element.getBoundingClientRect();
  const breite = tip.offsetWidth;
  const links = Math.min(Math.max(8, r.left + r.width / 2 - breite / 2), window.innerWidth - breite - 8);
  const oben = r.top - tip.offsetHeight - 8;
  tip.style.left = `${links + window.scrollX}px`;
  tip.style.top = `${(oben < 8 ? r.bottom + 8 : oben) + window.scrollY}px`;
}
function tipWeg() { if (tip) tip.hidden = true; }

document.addEventListener('pointerover', (ereignis) => {
  const ziel = ereignis.target.closest('[data-tip]');
  if (ziel) tipZeigen(ziel); else tipWeg();
});
document.addEventListener('pointerleave', tipWeg, true);
document.addEventListener('focusin', (ereignis) => {
  const ziel = ereignis.target.closest('[data-tip]');
  if (ziel) tipZeigen(ziel);
});
document.addEventListener('focusout', tipWeg);
window.addEventListener('scroll', tipWeg, { passive: true });

// Auswahlfelder und Häkchen wenden den Filter sofort an
for (const formular of document.querySelectorAll('form[data-sofort]')) {
  formular.addEventListener('change', () => formular.requestSubmit());
  formular.querySelector('button[type="submit"]')?.classList.add('nur-ohne-js');
}

document.addEventListener('click', async (ereignis) => {
  const kopieren = ereignis.target.closest('[data-kopieren]');
  if (kopieren) {
    try {
      await navigator.clipboard.writeText(kopieren.dataset.kopieren);
      kopieren.textContent = 'Kopiert ✓';
    } catch {
      kopieren.textContent = 'Bitte von Hand kopieren';
    }
    setTimeout(() => { kopieren.textContent = 'Link kopieren'; }, 2500);
  }
  if (ereignis.target.closest('[data-drucken]')) window.print();
});
