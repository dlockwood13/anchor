import { BRAND } from '../../data/state.js';
import { register, setTopbar, go } from '../../app/router.js';

export function renderSplash() {
  setTopbar('', '', { branded: false });

  document.getElementById('content').innerHTML = `
    <div class="screen splash">
      <svg class="bowline-mark-xl" aria-hidden="true">
        <use href="#bowline-mark"/>
      </svg>

      <h1 class="splash-title">${BRAND.name}</h1>
      <p class="splash-tag">${BRAND.tagline}</p>

      <button class="btn primary" style="max-width:280px;margin-top:32px" onclick="go('today')">
        <i class="ti ti-arrow-right"></i> Open ${BRAND.name}
      </button>

      <div style="margin-top:48px;max-width:320px;width:100%">
        <div class="notice green" style="margin-bottom:0;text-align:center">
          ${BRAND.motto}
        </div>
      </div>
    </div>`;
}

register('splash', renderSplash);
