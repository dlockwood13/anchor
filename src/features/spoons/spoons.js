import { state } from '../../data/state.js';
import { register, setTopbar, go } from '../../app/router.js';
import { hasFeature } from '../../services/subscription.js';
import { renderUpgradePrompt } from '../paywall/paywall.js';

// ─── Local state ──────────────────────────────────────────
if (!state.spoons) state.spoons = {
  current:  { executive: 5, social: 5, sensory: 5, physical: 5 },
  history:  [],                       // [{ date, ...levels }]
  drainers: [],                       // [{ id, label, when }]
  restorers:[],                       // [{ id, label, when }]
};

const DIMENSIONS = [
  { k: 'executive', l: 'Executive function', icon: 'ti-brain',  color: 'lavender',
    desc: 'Planning, starting, switching, focusing' },
  { k: 'social',    l: 'Social capacity',    icon: 'ti-users',  color: 'sky',
    desc: 'Conversation, masking, meetings, calls' },
  { k: 'sensory',   l: 'Sensory bandwidth',  icon: 'ti-ear',    color: 'peach',
    desc: 'Noise, lights, crowds, screens, smells' },
  { k: 'physical',  l: 'Physical energy',    icon: 'ti-bolt',   color: 'amber',
    desc: 'Body, sleep, pain, stamina' },
];

const COMMON_DRAINERS = [
  'Masking at work',  'Loud environment',  'Back-to-back meetings',
  'Unexpected change', 'Difficult conversation', 'Sensory overload',
  'Bright lights', 'Crowds', 'Phone calls', 'Travel',
  'Decision overload', 'Multitasking',
];

const COMMON_RESTORERS = [
  'Alone time', 'Familiar music', 'Stimming', 'Special interest',
  'Quiet room', 'Deep pressure', 'Walking outside', 'Headphones on',
  'Nap', 'Comfort food', 'Pet time', 'Hyperfocus session',
];

// ─── Main render ──────────────────────────────────────────
export function renderSpoons() {
  setTopbar('Spoons', 'How is your energy?');

  if (!hasFeature('spoons')) {
    document.getElementById('content').innerHTML = `
      <div class="screen">
        ${renderUpgradePrompt('Spoon energy tracking')}
        <div class="card sky" style="margin-top:1rem">
          <div class="card-label">What is Spoon Theory?</div>
          <div style="font-size:14px;line-height:1.6;margin-top:8px">
            "Spoons" are units of available energy. You have a limited number each day — and you spend them on every task, conversation, and decision. Tracking spoons helps you plan around what you actually have, not what you think you should have.
          </div>
        </div>
      </div>`;
    return;
  }

  renderSpoonsMain();
}

function renderSpoonsMain() {
  const s = state.spoons.current;
  const avg = Math.round((s.executive + s.social + s.sensory + s.physical) / 4);

  document.getElementById('content').innerHTML = `
    <div class="screen">

      <!-- Average overview -->
      <div class="card teal">
        <div class="card-label">Overall capacity right now</div>
        <div style="display:flex;align-items:center;gap:14px;margin-top:8px">
          <div style="font-size:48px;font-weight:700;color:var(--teal-deep);line-height:1">${avg}</div>
          <div style="flex:1">
            <div style="font-size:13px;color:var(--text-secondary);margin-bottom:4px">${getEnergyLabel(avg)} / 10</div>
            <div class="progress-bar" style="margin:0">
              <div class="progress-fill" style="width:${avg * 10}%;background:${getEnergyColor(avg)}"></div>
            </div>
          </div>
        </div>
        <div class="card-sub" style="margin-top:10px;line-height:1.5">${getEnergyMessage(avg)}</div>
      </div>

      <!-- Per-dimension sliders -->
      <div class="section-label">By dimension</div>
      ${DIMENSIONS.map(d => renderDimensionSlider(d, s[d.k])).join('')}

      <!-- Suggestions based on capacity -->
      <div class="section-label">Suggested for this capacity</div>
      ${renderCapacitySuggestions(s)}

      <!-- Log drainer/restorer -->
      <div class="section-label">What is using your spoons?</div>
      <div class="card peach">
        <div class="card-label">Drainers — what's costing energy</div>
        <div class="chip-wrap" style="margin-top:10px">
          ${COMMON_DRAINERS.map(d => `
            <button class="chip" onclick="logDrainer('${d.replace(/'/g, "\\'")}')">${d}</button>
          `).join('')}
        </div>
      </div>

      <div class="card teal" style="margin-top:10px">
        <div class="card-label">Restorers — what's giving energy back</div>
        <div class="chip-wrap" style="margin-top:10px">
          ${COMMON_RESTORERS.map(r => `
            <button class="chip" onclick="logRestorer('${r.replace(/'/g, "\\'")}')">${r}</button>
          `).join('')}
        </div>
      </div>

      <!-- Recent log -->
      ${(state.spoons.drainers.length > 0 || state.spoons.restorers.length > 0) ? `
        <div class="section-label">Today's log</div>
        <div class="card" style="padding:0.5rem 1.25rem">
          ${[...state.spoons.drainers, ...state.spoons.restorers]
            .sort((a, b) => b.when - a.when).slice(0, 10).map(item => {
              const isDrainer = state.spoons.drainers.includes(item);
              return `
                <div class="task-row">
                  <i class="ti ${isDrainer ? 'ti-arrow-down' : 'ti-arrow-up'}"
                    style="color:var(--${isDrainer ? 'peach' : 'teal'});font-size:18px;flex-shrink:0;margin-top:2px"></i>
                  <div style="flex:1">
                    <div class="task-text" style="font-size:14px;font-weight:400">${item.label}</div>
                    <div class="task-meta">${new Date(item.when).toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit'})}</div>
                  </div>
                </div>`;
            }).join('')}
        </div>
      ` : ''}

      <!-- History -->
      ${state.spoons.history.length > 0 ? renderSpoonHistory() : ''}

      <button class="btn" style="margin-top:1rem;color:var(--text-muted)" onclick="logTodaySnapshot()">
        <i class="ti ti-camera"></i> Save today's snapshot
      </button>
    </div>`;
}

function renderDimensionSlider(d, value) {
  return `
    <div class="card ${d.color}" style="margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <i class="ti ${d.icon}" style="font-size:22px;color:var(--${d.color});flex-shrink:0"></i>
        <div style="flex:1">
          <div class="card-main" style="font-size:14px">${d.l}</div>
          <div class="card-sub" style="font-size:12px;margin-top:0">${d.desc}</div>
        </div>
        <div style="font-size:22px;font-weight:700;color:var(--${d.color}-d);min-width:32px;text-align:right">${value}</div>
      </div>
      <input type="range" min="0" max="10" value="${value}"
        oninput="setSpoon('${d.k}', this.value)"
        style="width:100%;accent-color:var(--${d.color})">
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-top:4px">
        <span>empty</span><span>half</span><span>full</span>
      </div>
    </div>`;
}

function renderCapacitySuggestions(s) {
  const ideas = [];

  if (s.executive <= 3) {
    ideas.push({ icon: 'ti-list-check', l: 'Use Master List, not Time Blocking', sub: 'Lists feel less rigid than schedules' });
    ideas.push({ icon: 'ti-arrows-minimize', l: 'Try "Make smaller" in Now', sub: 'A tiny version still counts' });
  }
  if (s.social <= 3) {
    ideas.push({ icon: 'ti-message-x', l: 'Avoid phone calls today', sub: 'Text or email instead if you can' });
    ideas.push({ icon: 'ti-home', l: 'Work from a quiet space', sub: 'Reduce conversational demand' });
  }
  if (s.sensory <= 3) {
    ideas.push({ icon: 'ti-volume-3', l: 'Open sensory reset', sub: 'Reduce input before tasks' });
    ideas.push({ icon: 'ti-headphones', l: 'Headphones on, lights dim', sub: 'Lower environmental load' });
  }
  if (s.physical <= 3) {
    ideas.push({ icon: 'ti-bed', l: 'Rest is a valid use of today', sub: 'Drop tasks you can drop' });
    ideas.push({ icon: 'ti-glass-full', l: 'Water, food, medication', sub: 'The basics matter most' });
  }
  if (ideas.length === 0) {
    ideas.push({ icon: 'ti-sparkles', l: "You're at full capacity", sub: 'Good day for hard tasks' });
    ideas.push({ icon: 'ti-bolt', l: 'Do the difficult thing first', sub: 'Spend the spoons while you have them' });
  }

  return ideas.slice(0, 4).map(i => `
    <button class="btn" onclick="suggestionClick('${i.l.replace(/'/g, "\\'")}')">
      <i class="ti ${i.icon}" style="color:var(--teal)"></i>
      <div style="flex:1">
        <div style="font-size:14px">${i.l}</div>
        <div style="font-size:12px;font-weight:400;color:var(--text-muted);margin-top:2px">${i.sub}</div>
      </div>
    </button>
  `).join('');
}

function renderSpoonHistory() {
  const recent = state.spoons.history.slice(-7);
  return `
    <div class="section-label">Recent days</div>
    <div class="card">
      <div style="display:flex;gap:6px;align-items:flex-end;height:80px;padding:0 4px">
        ${recent.map(h => {
          const avg = Math.round((h.executive + h.social + h.sensory + h.physical) / 4);
          return `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
              <div style="width:100%;height:${avg * 6 + 4}px;background:${getEnergyColor(avg)};border-radius:4px 4px 0 0;min-height:4px"></div>
              <div style="font-size:9px;color:var(--text-muted);text-transform:uppercase">${h.short}</div>
              <div style="font-size:11px;font-weight:700">${avg}</div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

// ─── Helpers ──────────────────────────────────────────────
function getEnergyLabel(v) {
  if (v <= 2) return 'Critical';
  if (v <= 4) return 'Low';
  if (v <= 6) return 'Manageable';
  if (v <= 8) return 'Good';
  return 'Full';
}

function getEnergyColor(v) {
  if (v <= 2) return 'var(--peach)';
  if (v <= 4) return 'var(--amber)';
  if (v <= 6) return 'var(--sky)';
  if (v <= 8) return 'var(--teal)';
  return 'var(--teal-deep)';
}

function getEnergyMessage(v) {
  if (v <= 2) return 'Essentials only. Today is for surviving, not output.';
  if (v <= 4) return 'Low day. Smaller tasks, more recovery, fewer commitments.';
  if (v <= 6) return 'Manageable. Match tasks to capacity. Build in buffer time.';
  if (v <= 8) return 'Good day. You can do hard things, but pace yourself.';
  return 'Full capacity. Good day to do the demanding stuff.';
}

// ─── Window handlers ──────────────────────────────────────
window.setSpoon = function (k, v) {
  state.spoons.current[k] = parseInt(v, 10);
  // Re-render the overall stat without flicker
  const card = document.querySelector('.card.teal .card-main');
  // Just re-render the whole thing for simplicity
  renderSpoonsMain();
};

window.logDrainer = function (label) {
  state.spoons.drainers.push({ id: Date.now(), label, when: Date.now() });
  if (state.spoons.drainers.length > 50) state.spoons.drainers = state.spoons.drainers.slice(-50);
  renderSpoonsMain();
};

window.logRestorer = function (label) {
  state.spoons.restorers.push({ id: Date.now(), label, when: Date.now() });
  if (state.spoons.restorers.length > 50) state.spoons.restorers = state.spoons.restorers.slice(-50);
  renderSpoonsMain();
};

window.suggestionClick = function (label) {
  // Smart routing
  if (label.includes('Master List')) { state.planMode = 'masterlist'; go('plan'); return; }
  if (label.includes('Make smaller')) { go('now'); return; }
  if (label.includes('sensory reset')) { state.resetMode = 'over'; state.resetView = 'flow'; state.resetStep = 0; go('reset'); return; }
  if (label.includes('Rest')) { go('reset'); return; }
  // Default: just acknowledge
};

window.logTodaySnapshot = function () {
  const today = new Date();
  const date  = today.toLocaleDateString('en-GB');
  const short = today.toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 2);
  const snap  = { ...state.spoons.current, date, short, when: Date.now() };

  if (state.spoons.history.length && state.spoons.history[state.spoons.history.length - 1].date === date) {
    state.spoons.history[state.spoons.history.length - 1] = snap;
  } else {
    state.spoons.history.push(snap);
  }
  if (state.spoons.history.length > 30) state.spoons.history = state.spoons.history.slice(-30);
  alert("Today's snapshot saved.");
  renderSpoonsMain();
};

register('spoons', renderSpoons);
