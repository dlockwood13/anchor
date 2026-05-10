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
 * Top bar with the Bowline icon mark + screen title.
 * Pass `branded: false` for the splash screen which renders its own header.
 */
export function setTopbar(title, sub = '', { branded = true } = {}) {
  if (!branded) {
    document.getElementById('topbar-content').innerHTML = '';
    return;
  }

  document.getElementById('topbar-content').innerHTML = `
    <div class="topbar-row">
      <img src="src/assets/bowline-icon.png" alt="" class="bowline-mark" />
      <div>
        <h1>${title}</h1>
        ${sub ? `<p class="sub">${sub}</p>` : ''}
      </div>
    </div>`;
}
