import { BRAND } from '../../data/state.js';
import { register, setTopbar } from '../../app/router.js';

export function renderSplash() {
  // Hide the topbar — splash screen is fully branded
  setTopbar('', '', { branded: false });

  document.getElementById('content').innerHTML = `
    <div class="screen splash">
      <img src="src/assets/bowline-lockup.png"
           alt="Bowline — A calmer way through your day"
           class="splash-lockup" />

      <button class="btn primary" style="max-width:280px;margin-top:36px"
              onclick="go('today')">
        <i class="ti ti-arrow-right"></i> Open ${BRAND.name}
      </button>

      <div style="margin-top:48px;max-width:340px;width:100%">
        <div class="notice green" style="margin-bottom:0;text-align:center">
          ${BRAND.motto}
        </div>
      </div>
    </div>`;
}

register('splash', renderSplash);
