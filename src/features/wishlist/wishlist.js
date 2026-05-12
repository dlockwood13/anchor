import { state } from '../../data/state.js';
import { register, setTopbar } from '../../app/router.js';
import { hasFeature } from '../../services/subscription.js';
import { renderUpgradePrompt } from '../paywall/paywall.js';

// ─── Local state ──────────────────────────────────────────
if (!state.wishlist) state.wishlist = [];

const COOL_OFF_HOURS = 72;

export function renderWishlist() {
  setTopbar('Wishlist', 'A 72-hour cooling-off space.');

  if (!hasFeature('wishlist')) {
    document.getElementById('content').innerHTML = `
      <div class="screen">
        ${renderUpgradePrompt('72-hour Wishlist')}
        <div class="card sky" style="margin-top:1rem">
          <div class="card-label">What this does</div>
          <div style="font-size:14px;line-height:1.6;margin-top:8px">
            Adds a 72-hour pause between "I want this" and "I'm buying this." Many ADHD adults find that the urge to purchase fades after a few days — and the things that <em>don't</em> fade are usually the ones worth getting. This protects your finances without judgement.
          </div>
        </div>
      </div>`;
    return;
  }

  renderWishlistMain();
}

function renderWishlistMain() {
  const now = Date.now();
  const items = state.wishlist;
  const ready    = items.filter(i => !i.decided && (now - i.addedAt) >= COOL_OFF_HOURS * 3600 * 1000);
  const cooling  = items.filter(i => !i.decided && (now - i.addedAt) <  COOL_OFF_HOURS * 3600 * 1000);
  const decided  = items.filter(i => i.decided);

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="card lavender">
        <div class="card-label">72-hour cooling-off</div>
        <div class="card-main" style="font-size:16px">Add things you want. Decide after 72 hours.</div>
        <div class="card-sub" style="margin-top:6px;line-height:1.6">
          Many impulse purchases lose their pull after a few days. The ones that stay are the ones worth getting.
        </div>
      </div>

      <!-- Add new -->
      <div class="card">
        <input id="wl-input" type="text" placeholder="What do you want to buy?"
          onkeydown="if(event.key==='Enter')wlAdd()"
          style="width:100%;border:2px solid var(--border);border-radius:var(--r-md);padding:0.85rem;font-size:15px;font-family:var(--font);outline:none;margin-bottom:8px">
        <input id="wl-price" type="number" placeholder="Price (optional, £)"
          style="width:100%;border:2px solid var(--border);border-radius:var(--r-md);padding:0.85rem;font-size:15px;font-family:var(--font);outline:none;margin-bottom:10px">
        <button class="btn primary" style="margin:0" onclick="wlAdd()">
          <i class="ti ti-plus"></i> Park it for 72 hours
        </button>
      </div>

      <!-- Ready to decide -->
      ${ready.length > 0 ? `
        <div class="section-label">
          <i class="ti ti-check" style="color:var(--teal);font-size:14px"></i>
          Ready to decide (${ready.length})
        </div>
        <div class="notice green" style="margin-bottom:0.85rem">
          These have waited 72 hours. Decide with the full picture now.
        </div>
        ${ready.map(i => renderWishItem(i, 'ready')).join('')}
      ` : ''}

      <!-- Cooling -->
      ${cooling.length > 0 ? `
        <div class="section-label">
          <i class="ti ti-clock" style="color:var(--amber);font-size:14px"></i>
          Cooling off (${cooling.length})
        </div>
        ${cooling.map(i => renderWishItem(i, 'cooling')).join('')}
      ` : ''}

      <!-- Past decisions -->
      ${decided.length > 0 ? `
        <div class="section-label">
          <i class="ti ti-history" style="color:var(--text-muted);font-size:14px"></i>
          Past decisions (${decided.length})
        </div>
        <div class="card" style="padding:0.5rem 1.25rem">
          ${decided.slice(-10).reverse().map(i => `
            <div class="task-row" style="opacity:0.65">
              <i class="ti ${i.outcome === 'bought' ? 'ti-shopping-cart' : 'ti-x'}"
                style="color:var(--${i.outcome === 'bought' ? 'teal' : 'text-muted'});font-size:18px;flex-shrink:0;margin-top:2px"></i>
              <div style="flex:1">
                <div class="task-text" style="font-size:13px;font-weight:400;text-decoration:${i.outcome === 'skipped' ? 'line-through' : 'none'}">${i.label}</div>
                <div class="task-meta">${i.outcome === 'bought' ? 'Bought' : 'Skipped'}${i.price ? ' · £' + i.price : ''}</div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${items.length === 0 ? `
        <div class="notice blue" style="margin-top:1rem">
          <strong>How it works.</strong> Add anything you're tempted to buy. Bowline holds it for 72 hours. After that, you decide with cooler thinking. No judgement either way.
        </div>
      ` : ''}

      ${decided.filter(i => i.outcome === 'skipped' && i.price).length > 0 ? `
        <div class="card teal" style="margin-top:1rem;text-align:center">
          <div class="card-label">Money saved</div>
          <div class="card-main" style="font-size:24px">£${decided.filter(i => i.outcome === 'skipped').reduce((s, i) => s + (parseFloat(i.price) || 0), 0).toFixed(2)}</div>
          <div class="card-sub" style="margin-top:4px">Total of items you decided to skip.</div>
        </div>
      ` : ''}
    </div>`;
}

function renderWishItem(item, status) {
  const hoursLeft = Math.max(0, Math.ceil((COOL_OFF_HOURS * 3600 * 1000 - (Date.now() - item.addedAt)) / (3600 * 1000)));
  const pct = Math.min(100, ((Date.now() - item.addedAt) / (COOL_OFF_HOURS * 3600 * 1000)) * 100);

  return `
    <div class="card ${status === 'ready' ? 'teal' : 'amber'}" style="margin-bottom:8px">
      <div style="display:flex;align-items:flex-start;gap:10px">
        <div style="flex:1">
          <div class="card-main" style="font-size:15px">${item.label}</div>
          ${item.price ? `<div class="card-sub" style="margin-top:4px">£${item.price}</div>` : ''}
        </div>
        <button onclick="wlDelete(${item.id})" style="border:none;background:none;color:var(--text-muted);cursor:pointer;padding:4px">
          <i class="ti ti-x" style="font-size:16px"></i>
        </button>
      </div>

      ${status === 'cooling' ? `
        <div style="margin-top:10px">
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:var(--amber)"></div></div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:6px">
            ${hoursLeft > 24 ? Math.ceil(hoursLeft / 24) + ' day' + (Math.ceil(hoursLeft / 24) === 1 ? '' : 's') + ' left' : hoursLeft + ' hours left'}
          </div>
        </div>
      ` : `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">
          <button class="btn primary" style="margin:0" onclick="wlDecide(${item.id}, 'bought')">
            <i class="ti ti-check"></i> Yes, buy it
          </button>
          <button class="btn" style="margin:0" onclick="wlDecide(${item.id}, 'skipped')">
            <i class="ti ti-x"></i> Skip it
          </button>
        </div>
      `}
    </div>`;
}

// ─── Window handlers ──────────────────────────────────────
window.wlAdd = function () {
  const label = (document.getElementById('wl-input')?.value || '').trim();
  if (!label) return;
  const price = parseFloat(document.getElementById('wl-price')?.value) || null;
  state.wishlist.push({
    id:       Date.now(),
    label, price,
    addedAt:  Date.now(),
    decided:  false,
    outcome:  null,
  });
  renderWishlistMain();
};

window.wlDelete = function (id) {
  if (confirm('Remove this item from your wishlist?')) {
    state.wishlist = state.wishlist.filter(i => i.id !== id);
    renderWishlistMain();
  }
};

window.wlDecide = function (id, outcome) {
  const item = state.wishlist.find(i => i.id === id);
  if (!item) return;
  item.decided = true;
  item.outcome = outcome;
  item.decidedAt = Date.now();
  renderWishlistMain();
};

register('wishlist', renderWishlist);
