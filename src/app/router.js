import { state } from '../data/state.js';

const registry = {};

export function register(screenName, renderFn) {
  registry[screenName] = renderFn;
}

export function go(s) {
  state.screen    = s;
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

/**
 * Sets the topbar with the Bowline brand mark + title + optional subtitle.
 * Pass `branded: false` for the splash screen, which renders its own header.
 */
export function setTopbar(title, sub = '', { branded = true } = {}) {
  if (!branded) {
    document.getElementById('topbar-content').innerHTML = '';
    return;
  }

  document.getElementById('topbar-content').innerHTML = `
    <div class="topbar-row">
      <svg class="bowline-mark" aria-hidden="true"><use href="#bowline-mark"/></svg>
      <div>
        <h1>${title}</h1>
        ${sub ? `<p class="sub">${sub}</p>` : ''}
      </div>
    </div>`;
}
