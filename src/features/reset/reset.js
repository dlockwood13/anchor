import { state } from '../../data/state.js';
import { setTopbar, go } from '../../app/router.js';

const RESET_TYPES = [
  { k: 'over', icon: 'ti-volume-3', l: 'Too much input', sub: 'Overstimulated' },
  { k: 'under', icon: 'ti-battery-1', l: 'Too little stimulation', sub: 'Understimulated, flat' },
  { k: 'start', icon: 'ti-player-pause', l: "Can't start", sub: 'Frozen, stuck' },
  { k: 'anxiety', icon: 'ti-wind', l: 'Anxiety spike', sub: 'Racing thoughts' },
  { k: 'change', icon: 'ti-route-x', l: 'Change of plan', sub: 'Something unexpected' },
  { k: 'shutdown', icon: 'ti-moon', l: 'Shutdown', sub: 'Withdrawn, low, empty' },
  { k: 'decision', icon: 'ti-brain', l: 'Decision overload', sub: 'Too many choices' },
  { k: 'social', icon: 'ti-users', l: 'Social exhaustion', sub: 'After people' },
];

const FLOWS = {
  over: { title: 'Reduce input', steps: ['Move away from noise if possible', 'Lower brightness', 'Put on headphones or earplugs', 'Loosen uncomfortable clothing', 'Breathe out slowly three times', 'Choose: continue, pause, or change plan'] },
  under: { title: 'Add safe stimulation', steps: ['Play familiar music', 'Use a fidget or tactile object', 'Stand up and move', 'Walk for 2 minutes', 'Try a timer challenge', 'Pair task with a drink or snack'] },
  start: { title: 'Just begin', steps: ['Choose the smallest possible first step', 'Set a 3-minute timer', 'You only need to start — not finish', 'Notice resistance without judging it', 'Begin, even if it feels wrong'] },
  anxiety: { title: 'Slow down', steps: ['Breathe out slowly for 4 counts', 'Place feet flat on the floor', 'Name 3 things you can see', 'What is actually certain right now?', 'What can wait until later?', 'Choose one very small action'] },
  change: { title: 'Something changed', steps: ['Pause. This is allowed.', 'What actually changed?', 'What is still true?', 'What is urgent — right now?', 'What can move to later?', 'Choose the next single step'] },
  shutdown: { title: 'Essentials only', steps: ['Water', 'Food or snack', 'Lie down or sit somewhere quiet', 'No decisions right now', 'Rest is valid', 'Return when ready — no timeline'] },
  decision: { title: 'Reduce choices', steps: ['Pause on all decisions for now', 'What is the one most urgent thing?', 'Can anything wait 24 hours?', 'Choose the smallest available option', 'Nothing else until that one is done'] },
  social: { title: 'Recover after people', steps: ['Find a quiet space', 'Remove unnecessary stimulation', 'Do not reply to anything yet', 'Drink water', 'Sit or lie down', 'Come back to tasks when ready'] },
};

export function renderReset() {
  setTopbar('Reset', 'Regulation before action.');

  if (state.resetMode) { renderResetFlow(); return; }

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="notice">You do not need to do everything. What kind of hard is this?</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${RESET_TYPES.map(o => `
          <button class="btn" style="flex-direction:column;align-items:flex-start;gap:4px" onclick="state.resetMode='${o.k}';renderResetScreen()">
            <i class="ti ${o.icon}" aria-hidden="true" style="font-size:22px;color:#1D9E75"></i>
            <div>
              <div style="font-size:14px">${o.l}</div>
              <div style="font-size:12px;color:var(--color-text-secondary)">${o.sub}</div>
            </div>
          </button>
        `).join('')}
      </div>
    </div>`;
}

function renderResetFlow() {
  const flow = FLOWS[state.resetMode];
  let step = 0;

  function show() {
    document.getElementById('content').innerHTML = `
      <div class="screen">
        <div class="card">
          <div class="card-title">${flow.title}</div>
          <div class="card-main" style="font-size:15px">${flow.steps[step]}</div>
          <div class="card-sub">Step ${step + 1} of ${flow.steps.length}</div>
        </div>
        <div style="margin-bottom:12px">
          <div class="energy-bar">
            <div class="energy-fill" style="width:${((step + 1) / flow.steps.length) * 100}%"></div>
          </div>
        </div>
        ${step < flow.steps.length - 1
          ? `<button class="btn primary" onclick="step++;show()"><i class="ti ti-arrow-right"></i> Next step</button>`
          : `<div class="notice">Reset complete. The plan can change.</div>
             <button class="btn soft" onclick="go('today')"><i class="ti ti-sun"></i> Back to Today</button>`
        }
        <button class="btn" style="margin-top:4px;color:var(--color-text-secondary)" onclick="state.resetMode=null;renderResetScreen()">
          <i class="ti ti-arrow-left"></i> Choose different reset
        </button>
      </div>`;
  }
  show();
}

window.renderResetScreen = renderReset;
