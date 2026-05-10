import { state } from '../data/state.js';

const registry = {};

export function register(screenName, renderFn) {
  registry[screenName] = renderFn;
}

export function go(s) {
  state.screen  = s;
  state.planMode  = null;
  state.stuckFlow = false;
  state.resetMode = null;

  document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
  const nb = document.getElementById('nb-' + s);
  if (nb) nb.classList.add('active');

  render();
}

export function render() {
  const fn = registry[state.screen];
  if (fn) fn();
}

export function setTopbar(title, sub = '') {
  document.getElementById('topbar-content').innerHTML = `
    <h1><span class="anchor-dot"></span> ${title}</h1>
    ${sub ? `<p class="sub">${sub}</p>` : ''}`;
}
