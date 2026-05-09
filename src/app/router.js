import { state } from '../data/state.js';
import { renderToday } from '../features/today/today.js';
import { renderNow } from '../features/now/now.js';
import { renderPlan } from '../features/plan/plan.js';
import { renderTldr } from '../features/tldr/tldr.js';
import { renderReset } from '../features/reset/reset.js';
import { renderMe } from '../features/me/me.js';

const screens = {
  today: renderToday,
  now: renderNow,
  plan: renderPlan,
  tldr: renderTldr,
  reset: renderReset,
  me: renderMe,
};

export function go(s) {
  state.screen = s;
  state.planMode = null;
  state.stuckFlow = false;

  document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
  const nb = document.getElementById('nb-' + s);
  if (nb) nb.classList.add('active');

  render();
}

export function render() {
  const fn = screens[state.screen];
  if (fn) fn();
}

export function setTopbar(title, sub = '') {
  document.getElementById('topbar-content').innerHTML =
    `<h1>${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ''}`;
}
