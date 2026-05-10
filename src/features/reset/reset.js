import { state } from '../../data/state.js';
import { register, setTopbar, go } from '../../app/router.js';

const RESETS = [
  {
    k: 'over', icon: 'ti-volume-3', l: 'Too much input', sub: 'Overstimulated', color: 'peach',
    steps: [
      'Move away from noise if possible',
      'Lower screen brightness',
      'Put on headphones or earplugs',
      'Loosen uncomfortable clothing',
      'Breathe out slowly three times',
      'Choose: continue, pause, or change plan',
    ],
  },
  {
    k: 'under', icon: 'ti-battery-1', l: 'Too little stimulation', sub: 'Understimulated, flat', color: 'amber',
    steps: [
      'Play familiar music',
      'Use a fidget or tactile object',
      'Stand up and move',
      'Walk for 2 minutes',
      'Try a timer challenge',
      'Pair task with a drink or snack',
    ],
  },
  {
    k: 'start', icon: 'ti-player-pause', l: "Can't start", sub: 'Frozen, stuck', color: 'lavender',
    steps: [
      'Choose the smallest possible first step',
      'Set a 3-minute timer',
      'You only need to start — not finish',
      'Notice resistance without judging it',
      'Begin, even if it feels wrong',
    ],
  },
  {
    k: 'anxiety', icon: 'ti-wind', l: 'Anxiety spike', sub: 'Racing thoughts', color: 'sky',
    steps: [
      'Breathe out slowly for 4 counts',
      'Place feet flat on the floor',
      'Name 3 things you can see',
      'What is actually certain right now?',
      'What can wait until later?',
      'Choose one very small action',
    ],
  },
  {
    k: 'change', icon: 'ti-route-x', l: 'Change of plan', sub: 'Something unexpected', color: 'amber',
    steps: [
      'Pause. This is allowed.',
      'What actually changed?',
      'What is still true?',
      'What is urgent right now?',
      'What can move to later?',
      'Choose the next single step',
    ],
  },
  {
    k: 'shutdown', icon: 'ti-moon', l: 'Shutdown', sub: 'Withdrawn, low, empty', color: 'sky',
    steps: [
      'Water',
      'Food or snack',
      'Lie down or sit somewhere quiet',
      'No decisions right now',
      'Rest is valid',
      'Return when ready — no timeline',
    ],
  },
  {
    k: 'decision', icon: 'ti-brain', l: 'Decision overload', sub: 'Too many choices', color: 'lavender',
    steps: [
      'Pause on all decisions for now',
      'What is the one most urgent thing?',
      'Can anything wait 24 hours?',
      'Choose the smallest available option',
      'Nothing else until that one is done',
    ],
  },
  {
    k: 'social', icon: 'ti-users', l: 'Social exhaustion', sub: 'After people', color: 'teal',
    steps: [
      'Find a quiet space',
      'Remove unnecessary stimulation',
      'Do not reply to anything yet',
      'Drink water',
      'Sit or lie down',
      'Come back to tasks when ready',
    ],
  },
];

// Map color names to CSS variable sets for inline styles
const BG = {
  peach:    'var(--peach-l)',
  amber:    'var(--amber-l)',
  lavender: 'var(--lavender-l)',
  sky:      'var(--sky-l)',
  teal:     'var(--teal-l)',
};

const BORDER = {
  peach:    'var(--peach-m)',
  amber:    'var(--amber-m)',
  lavender: 'var(--lavender-m)',
  sky:      'var(--sky-m)',
  teal:     'var(--teal-m)',
};

const ICON_COLOR = {
  peach:    'var(--peach)',
  amber:    'var(--amber)',
  lavender: 'var(--lavender)',
  sky:      'var(--sky)',
  teal:     'var(--teal)',
};

// Map color names to notice class
const NOTICE_CLASS = {
  peach:    'peach',
  amber:    'amber',
  lavender: 'purple',
  sky:      'blue',
  teal:     'green',
};

export function renderReset() {
  setTopbar('Reset', 'Regulation before action.');

  if (state.resetMode) { renderResetFlow(); return; }

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="notice purple">
        You do not need to do everything. What kind of hard is this?
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${RESETS.map(o => `
          <button class="btn"
            style="flex-direction:column;align-items:flex-start;gap:6px;padding:14px;height:auto;
                   background:${BG[o.color]};border-color:${BORDER[o.color]}"
            onclick="state.resetMode='${o.k}';renderResetScreen()">
            <i class="ti ${o.icon}" aria-hidden="true"
               style="font-size:24px;color:${ICON_COLOR[o.color]}"></i>
            <div>
              <div style="font-size:14px;font-weight:700">${o.l}</div>
              <div style="font-size:12px;color:var(--text-muted);font-weight:400">${o.sub}</div>
            </div>
          </button>
        `).join('')}
      </div>
    </div>`;
}

function renderResetFlow() {
  const flow = RESETS.find(r => r.k === state.resetMode);
  if (!flow) { renderReset(); return; }

  let step = 0;

  function show() {
    document.getElementById('content').innerHTML = `
      <div class="screen">
        <div class="card ${flow.color}">
          <div class="card-label">${flow.l}</div>
          <div class="card-main">${flow.steps[step]}</div>
          <div class="card-sub">Step ${step + 1} of ${flow.steps.length}</div>
        </div>

        <div class="progress-bar">
          <div class="progress-fill" style="width:${((step + 1) / flow.steps.length) * 100}%"></div>
        </div>

        ${step < flow.steps.length - 1
          ? `<button class="btn primary" onclick="step++;show()">
               <i class="ti ti-arrow-right"></i> Next step
             </button>`
          : `<div class="notice green">
               <strong>Reset complete.</strong> The plan can change.
             </div>
             <button class="btn primary" onclick="go('today')">
               <i class="ti ti-sun"></i> Back to Today
             </button>`
        }

        <button class="btn" style="margin-top:4px;color:var(--text-muted)"
          onclick="state.resetMode=null;renderResetScreen()">
          <i class="ti ti-arrow-left"></i> Choose different reset
        </button>
      </div>`;
  }

  show();
}

window.renderResetScreen = renderReset;
register('reset', renderReset);
