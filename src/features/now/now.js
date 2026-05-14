import { state, ACCENT } from '../../data/state.js';
import { register, setTopbar, go } from '../../app/router.js';
import { callClaude } from '../../services/api.js';

// Expose 'go' globally for inline HTML onclick handlers
window.go = go;

// Init local state
if (!state.nowView)        state.nowView = 'main';
if (!state.nowStuckReason) state.nowStuckReason = null;
if (!state.nowTimerEnd)    state.nowTimerEnd = null;
if (!state.nowTimerMins)   state.nowTimerMins = null;
if (!state.nowAiSteps)     state.nowAiSteps = null;
if (!state.nowAiLoading)   state.nowAiLoading = false;

// Titration tracker state
if (!state.titrationEntries) state.titrationEntries = []; // array of log entries
if (!state.titrationDraft)   state.titrationDraft = null;  // entry being built

const STUCK_OPTIONS = [
  { k: 'start',   l: 'Do not know where to start', icon: 'ti-player-pause' },
  { k: 'big',     l: 'It feels too big',           icon: 'ti-arrows-maximize' },
  { k: 'steps',   l: 'Too many steps',             icon: 'ti-list-numbers' },
  { k: 'boring',  l: 'It feels boring',            icon: 'ti-zzz' },
  { k: 'anxious', l: 'I am anxious',               icon: 'ti-wind' },
  { k: 'over',    l: 'I am overstimulated',        icon: 'ti-volume-3' },
  { k: 'tired',   l: 'I am tired',                 icon: 'ti-moon' },
  { k: 'forget',  l: 'I forgot why this matters',  icon: 'ti-question-mark' },
  { k: 'unclear', l: 'I do not understand it',     icon: 'ti-help' },
  { k: 'change',  l: 'Something changed',          icon: 'ti-route-x' },
];

const STUCK_RESPONSES = {
  start: {
    title: 'Show only the first step',
    color: 'teal',
    body: 'First step: just open the thing. Nothing else yet. Do not read it. Do not plan. Just open it.',
    actions: [
      { l: 'Make this smaller',      cls: 'lavender',  go: 'smaller' },
      { l: 'Start a 3-minute timer', cls: 'sky',       go: 'timer', mins: 3 },
      { l: 'Body double with me',    cls: 'amber-btn', go: 'bodyDouble' },
    ],
  },
  big: {
    title: 'Break this into smaller parts',
    color: 'lavender',
    body: 'A big task is usually 5 to 10 small steps wearing a costume. Let us get the costume off.',
    actions: [
      { l: 'Break it down with AI',   cls: 'primary',  go: 'aiSteps' },
      { l: 'Just make it smaller',    cls: 'lavender', go: 'smaller' },
    ],
  },
  steps: {
    title: 'Only the first step matters',
    color: 'lavender',
    body: 'The middle steps will still exist after you do step one. Forget the rest. What is step one?',
    actions: [
      { l: 'Get step one with AI',     cls: 'primary',   go: 'aiSteps' },
      { l: 'Body double on step one',  cls: 'amber-btn', go: 'bodyDouble' },
    ],
  },
  boring: {
    title: 'Try pairing it with something easier',
    color: 'amber',
    body: 'Boring tasks need help getting started. Try music, a drink, a short timer, or body doubling.',
    actions: [
      { l: 'Start a 5-min timer', cls: 'amber-btn', go: 'timer', mins: 5 },
      { l: 'Body double',         cls: 'sky',       go: 'bodyDouble' },
    ],
  },
  anxious: {
    title: 'Pause before action',
    color: 'amber',
    body: 'Anxiety adds noise. A reset takes 3 to 5 minutes. The task will still be here.',
    actions: [
      { l: 'Open anxiety reset', cls: 'amber-btn', goReset: 'anxiety' },
      { l: 'Make this smaller',  cls: 'lavender',  go: 'smaller' },
    ],
  },
  over: {
    title: 'Reduce input first',
    color: 'peach',
    body: 'You cannot think clearly when your senses are full. Sensory reset comes first.',
    actions: [
      { l: 'Open sensory reset', cls: 'peach',   goReset: 'over' },
      { l: 'Come back later',    cls: 'sky',     go: 'snooze' },
    ],
  },
  tired: {
    title: 'Rest is valid',
    color: 'sky',
    body: 'Tired brains cannot push through. They can only do less. What is the smallest version of this task?',
    actions: [
      { l: 'Make this much smaller', cls: 'lavender', go: 'smaller' },
      { l: 'Move it to tomorrow',    cls: 'sky',      go: 'snooze' },
      { l: 'Open shutdown reset',    cls: 'primary',  goReset: 'shutdown' },
    ],
  },
  forget: {
    title: 'It matters because future-you needs it done',
    color: 'lavender',
    body: 'Not because you have to be productive. Not because anyone is watching. Just to reduce pressure on tomorrow-you.',
    actions: [
      { l: 'OK, I can start',  cls: 'primary',  go: 'back' },
      { l: 'Make it smaller',  cls: 'lavender', go: 'smaller' },
    ],
  },
  unclear: {
    title: 'You only need to understand enough to start',
    color: 'sky',
    body: 'If this is a message, use TL;DR to extract the key point. If it is a task, AI can break it down.',
    actions: [
      { l: 'Open TL;DR Assist',     cls: 'sky',     goNav: 'tldr' },
      { l: 'Break it down with AI', cls: 'primary', go: 'aiSteps' },
    ],
  },
  change: {
    title: 'Something changed. That is allowed.',
    color: 'amber',
    body: 'Change of plan is information, not failure. A reset for change-of-plan can help, or just do less.',
    actions: [
      { l: 'Open change-of-plan reset', cls: 'amber-btn', goReset: 'change' },
      { l: 'Just do a smaller version', cls: 'lavender',  go: 'smaller' },
    ],
  },
};

const SMALLER_OPTIONS = [
  { l: 'Just open it. Do not do it yet.',     meta: '30 seconds' },
  { l: 'Set a 3-minute timer. Stop when done.', meta: '3 minutes', mins: 3 },
  { l: 'Do one tenth of it. Then stop.',      meta: 'Whatever counts as a bit' },
  { l: 'Read or look at it. Do not act yet.', meta: 'Just gather information' },
  { l: 'Tell someone you are doing it.',      meta: 'Body double via text' },
  { l: 'Do the boring prep only.',            meta: 'Set up the environment' },
];

// ─── Titration tracker definitions ──────────────────────
const SIDE_EFFECTS = [
  { k: 'appetite',    l: 'Appetite ↓',     icon: 'ti-bowl' },
  { k: 'sleep',       l: 'Sleep affected', icon: 'ti-zzz' },
  { k: 'headache',    l: 'Headache',       icon: 'ti-mood-puzzled' },
  { k: 'jitters',     l: 'Jitters',        icon: 'ti-activity' },
  { k: 'dryMouth',    l: 'Dry mouth',      icon: 'ti-droplet-off' },
  { k: 'moodDip',     l: 'Mood dip',       icon: 'ti-mood-sad' },
  { k: 'heartRacing', l: 'Heart racing',   icon: 'ti-heart-rate-monitor' },
  { k: 'nausea',      l: 'Nausea',         icon: 'ti-stomach' },
];

const SEVERITY = [
  { k: 'none',     l: 'None',     color: '#9aa39c' },
  { k: 'mild',     l: 'Mild',     color: '#7fb89a' },
  { k: 'moderate', l: 'Moderate', color: '#e0a96d' },
  { k: 'severe',   l: 'Severe',   color: '#d97a7a' },
];

const TITRATION_MOODS = [
  { k: 1, l: 'Awful',  icon: 'ti-mood-sad' },
  { k: 2, l: 'Low',    icon: 'ti-mood-empty' },
  { k: 3, l: 'OK',     icon: 'ti-mood-neutral' },
  { k: 4, l: 'Good',   icon: 'ti-mood-smile' },
  { k: 5, l: 'Great',  icon: 'ti-mood-happy' },
];

// ─── Main router ──────────────────────────────────────────
export function renderNow() {
  setTopbar('Now', 'Focus on one thing at a time.');

  switch (state.nowView) {
    case 'stuck':            return renderStuck();
    case 'stuckResponse':    return renderStuckResponse();
    case 'smaller':          return renderSmaller();
    case 'bodyDouble':       return renderBodyDouble();
    case 'timerSetup':       return renderTimerSetup();
    case 'timer':            return renderTimerActive();
    case 'timerEnd':         return renderTimerEnd();
    case 'aiSteps':          return renderAiSteps();
    case 'titration':        return renderTitrationHub();
    case 'titrationLog':     return renderTitrationLog();
    case 'titrationHistory': return renderTitrationHistory();
    case 'titrationChart':   return renderTitrationChart();
    case 'titrationExport':  return renderTitrationExport();
    default:                 return renderMain();
  }
}

// ─── Main view ────────────────────────────────────────────
function renderMain() {
  const undone = state.tasks.filter(t => !t.done);
  const cur    = undone[0];

  if (!cur) {
    document.getElementById('content').innerHTML = `
      <div class="screen" style="max-width: 600px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; padding: 12px;">
        <!-- Empty State Hero -->
        <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 32px 24px; text-align: center; margin-bottom: 24px;">
          <div style="width: 56px; height: 56px; background: #ecfdf5; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #059669;">
            <i class="ti ti-check" style="font-size: 32px;"></i>
          </div>
          <div style="font-size: 20px; font-weight: 800; color: #1e293b; margin-bottom: 8px;">All done for now.</div>
          <div style="font-size: 14px; color: #64748b; line-height: 1.5;">Rest is valid. A smaller day still counts.</div>
        </div>
        <!-- Quick Actions Grid -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px;">
          <button onclick="go('today')" style="background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 16px; font-weight: 700; color: #1e293b; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <i class="ti ti-sun" style="color: #d97706; font-size: 20px;"></i> Back to Today
          </button>
          <button onclick="go('plan')" style="background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 16px; font-weight: 700; color: #1e293b; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <i class="ti ti-plus" style="color: #3b82f6; font-size: 20px;"></i> Add Task
          </button>
        </div>
        ${renderHealthTools()}
      </div>
    `;
    return;
  }

  document.getElementById('content').innerHTML = `
    <div class="screen" style="max-width: 600px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; padding: 16px 12px;">
      
      <!-- Main Task Card (Compacted) -->
      <div style="background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; border-left: 6px solid var(--teal, #41967a); padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <div>
            <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">YOUR NEXT STEP</div>
            <div style="font-size: 18px; font-weight: 700; color: #1e293b; line-height: 1.3;">${cur.text}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 6px; display: flex; align-items: center; gap: 8px;">
              <span>${cur.meta || 'Essentials'}</span>
              <span style="color: #cbd5e1;">|</span>
              <span style="color: #059669; font-weight: 600; display: flex; align-items: center; gap: 4px;"><i class="ti ti-bolt"></i> Low energy</span>
            </div>
          </div>
        </div>

        <button onclick="nowDone(${cur.id})" style="width: 100%; padding: 12px; background: var(--teal, #41967a); color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 4px;">
          <i class="ti ti-check" style="font-size: 18px;"></i> Mark as Done
        </button>

        ${undone.length > 1 ? `
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #f1f5f9; display: flex; align-items: center; gap: 8px; font-size: 12px; color: #64748b;">
            <span style="font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">NEXT UP:</span>
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">${undone[1].text}</span>
          </div>
        ` : ''}
      </div>

      <!-- Settings Grid (Descriptive labels + Fits in screen) -->
      <div style="background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
        <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 12px;">NEED TO ADJUST?</div>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
          <button onclick="nowSetView('stuck')" class="grid-action-btn">
            <i class="ti ti-help-circle" style="color: #059669;"></i>
            <div class="gab-title">I'm stuck</div>
            <div class="gab-sub">Find a way in</div>
          </button>
          <button onclick="nowSetView('smaller')" class="grid-action-btn">
            <i class="ti ti-arrows-minimize" style="color: #3b82f6;"></i>
            <div class="gab-title">Smaller</div>
            <div class="gab-sub">Break it down</div>
          </button>
          <button onclick="nowSetView('bodyDouble')" class="grid-action-btn">
            <i class="ti ti-users" style="color: #8b5cf6;"></i>
            <div class="gab-title">Double</div>
            <div class="gab-sub">Work together</div>
          </button>
          <button onclick="nowSetView('timerSetup')" class="grid-action-btn">
            <i class="ti ti-clock" style="color: #d97706;"></i>
            <div class="gab-title">Timer</div>
            <div class="gab-sub">Time-box it</div>
          </button>
          <button onclick="nowSnooze(${cur.id})" class="grid-action-btn">
            <i class="ti ti-clock-pause" style="color: #94a3b8;"></i>
            <div class="gab-title">Snooze</div>
            <div class="gab-sub">Do it later</div>
          </button>
          <button onclick="nowSwap(${cur.id})" class="grid-action-btn">
            <i class="ti ti-arrows-shuffle" style="color: #94a3b8;"></i>
            <div class="gab-title">Swap</div>
            <div class="gab-sub">Change task</div>
          </button>
        </div>
      </div>

      ${renderHealthTools()}
      
    </div>
    
    ${actionGridStyles()}
  `;
}

// ─── Reusable UI Helpers ───────────────────────────────────

function renderHealthTools() {
  return `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
      
      <!-- Reset Card (Compact) -->
      <div style="background: #ecfdf5; border: 1.5px solid #a7f3d0; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px;">
        <div>
          <div style="font-size: 13px; font-weight: 700; color: #065f46; margin-bottom: 2px;">Need a reset?</div>
          <div style="font-size: 11px; color: #064e3b; line-height: 1.3;">Step away completely.</div>
        </div>
        <button onclick="go('reset')" style="width: 100%; padding: 8px; background: #ffffff; border: 1.5px solid #a7f3d0; color: #059669; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; transition: background 0.2s;">
          Take a Reset
        </button>
      </div>

      <!-- Titration Card (Compact) -->
      <div style="background: #f5f3ff; border: 1.5px solid #ddd6fe; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px;">
        <div>
          <div style="font-size: 13px; font-weight: 700; color: #4c1d95; margin-bottom: 2px;">Titration Log</div>
          <div style="font-size: 11px; color: #5b21b6; line-height: 1.3;">Log meds & vitals.</div>
        </div>
        <button onclick="nowSetView('titration')" style="width: 100%; padding: 8px; background: #ffffff; border: 1.5px solid #ddd6fe; color: #6d28d9; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; transition: background 0.2s;">
          Open Log
        </button>
      </div>

    </div>
  `;
}

function actionGridStyles() {
  return `
    <style>
      .grid-action-btn {
        background: #fff;
        border: 1.5px solid #e2e8f0;
        border-radius: 10px;
        padding: 12px 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        cursor: pointer;
        transition: border-color 0.2s, background 0.2s;
        color: #1e293b;
        font-family: inherit;
      }
      .grid-action-btn:hover {
        border-color: #cbd5e1;
        background: #f8fafc;
      }
      .grid-action-btn i {
        font-size: 20px;
        margin-bottom: 2px;
      }
      .gab-title {
        font-size: 12px;
        font-weight: 700;
        text-align: center;
      }
      .gab-sub {
        font-size: 10px;
        font-weight: 500;
        color: #64748b;
        text-align: center;
        line-height: 1.1;
      }
    </style>
  `;
}

// ─── Stuck picker ─────────────────────────────────────────
function renderStuck() {
  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="notice purple">
        <strong>Stuck is information.</strong><br>
        It tells us something about the task, not about you. What is making this hard?
      </div>
      ${STUCK_OPTIONS.map(o => `
        <button class="btn" onclick="nowPickStuck('${o.k}')">
          <i class="ti ${o.icon}"></i>${o.l}
        </button>
      `).join('')}
      <button class="btn" style="margin-top:8px;color:var(--text-muted)" onclick="nowSetView('main')">
        <i class="ti ti-arrow-left"></i> Back
      </button>
    </div>`;
}

// ─── Stuck response ───────────────────────────────────────
function renderStuckResponse() {
  const r = STUCK_RESPONSES[state.nowStuckReason];
  if (!r) { state.nowView = 'stuck'; renderNow(); return; }

  const colorClass = r.color === 'lavender' ? 'lavender' :
                     r.color === 'sky' ? 'sky' :
                     r.color === 'amber' ? 'amber' :
                     r.color === 'peach' ? 'peach' : 'teal';

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="card ${colorClass}">
        <div class="card-label">${r.title}</div>
        <div style="font-size:15px;line-height:1.6;margin-top:8px">${r.body}</div>
      </div>

      ${r.actions.map(a => {
        if (a.goReset) {
          return `<button class="btn ${a.cls}" onclick="nowOpenReset('${a.goReset}')">${a.l}</button>`;
        }
        if (a.goNav) {
          return `<button class="btn ${a.cls}" onclick="go('${a.goNav}')">${a.l}</button>`;
        }
        if (a.go === 'snooze') {
          return `<button class="btn ${a.cls}" onclick="nowSnoozeCurrent()">${a.l}</button>`;
        }
        if (a.go === 'back') {
          return `<button class="btn ${a.cls}" onclick="nowSetView('main')">${a.l}</button>`;
        }
        if (a.go === 'timer') {
          return `<button class="btn ${a.cls}" onclick="nowStartTimer(${a.mins})">${a.l}</button>`;
        }
        return `<button class="btn ${a.cls}" onclick="nowSetView('${a.go}')">${a.l}</button>`;
      }).join('')}

      <button class="btn" style="margin-top:8px;color:var(--text-muted)" onclick="state.nowStuckReason=null;nowSetView('stuck')">
        <i class="ti ti-arrow-left"></i> Different reason
      </button>
    </div>`;
}

// ─── Make smaller ─────────────────────────────────────────
function renderSmaller() {
  const undone = state.tasks.filter(t => !t.done);
  const cur    = undone[0];
  if (!cur) { state.nowView = 'main'; renderNow(); return; }

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="card teal">
        <div class="card-label">Original task</div>
        <div class="card-main" style="font-size:16px">${cur.text}</div>
      </div>
      <div class="notice green">
        A smaller version still counts. Pick one. You can always do more later.
      </div>
      ${SMALLER_OPTIONS.map((o, i) => `
        <button class="btn" onclick="${o.mins ? `nowStartTimer(${o.mins})` : `nowApplySmaller(${i})`}">
          <div style="flex:1">
            <div>${o.l}</div>
            <div style="font-size:12px;font-weight:400;color:var(--text-muted);margin-top:2px">${o.meta}</div>
          </div>
        </button>
      `).join('')}
      <button class="btn" style="margin-top:8px;color:var(--text-muted)" onclick="nowSetView('main')">
        <i class="ti ti-arrow-left"></i> Back
      </button>
    </div>`;
}

// ─── Body double picker ──────────────────────────────────
function renderBodyDouble() {
  const times = [3, 5, 10, 15, 25];
  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="notice blue">
        <strong>Body doubling.</strong><br>
        Work alongside the app for a set time. Done is not required. Starting counts.
      </div>
      <div class="section-label">Choose a length</div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:14px">
        ${times.map(t => `
          <button class="mood-btn" onclick="nowStartTimer(${t})">${t} min</button>
        `).join('')}
      </div>
      <div class="notice green">
        Stay with the first step. Starting counts. You can go slowly. Notice distractions and return gently.
      </div>
      <button class="btn" style="margin-top:14px;color:var(--text-muted)" onclick="nowSetView('main')">
        <i class="ti ti-arrow-left"></i> Back
      </button>
    </div>`;
}

// ─── Timer setup ─────────────────────────────────────────
function renderTimerSetup() {
  const times = [
    { m: 2,  l: 'Just begin',     sub: '2 min' },
    { m: 3,  l: 'Tiny step',      sub: '3 min' },
    { m: 5,  l: 'Short burst',    sub: '5 min' },
    { m: 10, l: 'Focused chunk',  sub: '10 min' },
    { m: 25, l: 'Pomodoro',       sub: '25 min' },
  ];
  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="notice blue">
        <strong>Timer.</strong><br>
        A short, contained burst. When the timer ends, you can stop, continue, or run another.
      </div>
      ${times.map(t => `
        <button class="btn" onclick="nowStartTimer(${t.m})">
          <i class="ti ti-clock" style="color:var(--teal)"></i>
          <div style="flex:1">
            <div>${t.l}</div>
            <div style="font-size:12px;font-weight:400;color:var(--text-muted);margin-top:2px">${t.sub}</div>
          </div>
        </button>
      `).join('')}
      <button class="btn" style="margin-top:8px;color:var(--text-muted)" onclick="nowSetView('main')">
        <i class="ti ti-arrow-left"></i> Back
      </button>
    </div>`;
}

// ─── Timer active ────────────────────────────────────────
function renderTimerActive() {
  if (!state.nowTimerEnd || state.nowTimerEnd <= Date.now()) {
    state.nowView = 'timerEnd';
    renderNow();
    return;
  }

  const remainingMs = state.nowTimerEnd - Date.now();
  const totalMs     = state.nowTimerMins * 60 * 1000;
  const pct         = Math.max(0, Math.min(100, ((totalMs - remainingMs) / totalMs) * 100));
  const mins        = Math.floor(remainingMs / 60000);
  const secs        = Math.floor((remainingMs % 60000) / 1000);
  const timeStr     = mins + ':' + String(secs).padStart(2, '0');

  const undone = state.tasks.filter(t => !t.done);
  const cur    = undone[0];

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="card teal">
        <div class="card-label">Timer · ${state.nowTimerMins} min</div>
        <div class="card-main" style="font-size:16px">${cur ? cur.text : 'Stay with the task.'}</div>
      </div>

      <div style="text-align:center;padding:1.5rem 0">
        <div style="font-size:48px;font-weight:700;color:var(--teal-deep);letter-spacing:-1px;font-variant-numeric:tabular-nums">${timeStr}</div>
        <div style="font-size:13px;color:var(--text-muted);margin-top:4px">stay with it</div>
      </div>

      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>

      <div class="notice blue">
        Starting counts. You can go slowly. Done is not required.
      </div>

      <button class="btn primary" onclick="nowFinishTimerEarly()">
        <i class="ti ti-flag-check"></i> I am done — finish early
      </button>
      <button class="btn" onclick="nowCancelTimer()">
        <i class="ti ti-x"></i> Stop session
      </button>
    </div>`;

  // Tick the timer
  setTimeout(() => {
    if (state.screen === 'now' && state.nowView === 'timer') renderNow();
  }, 1000);
}

// ─── Timer end ───────────────────────────────────────────
function renderTimerEnd() {
  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="notice green" style="text-align:center;padding:1.5rem">
        <i class="ti ti-circle-check" style="font-size:32px;color:var(--teal);display:block;margin-bottom:8px"></i>
        <div style="font-size:18px;font-weight:700;margin-bottom:6px">Session complete.</div>
        <div>What happened?</div>
      </div>
      <button class="btn primary" onclick="nowTimerOutcome('started')"><i class="ti ti-check"></i> I started</button>
      <button class="btn sky" onclick="nowTimerOutcome('continued')"><i class="ti ti-player-play"></i> I continued</button>
      <button class="btn lavender" onclick="nowTimerOutcome('finished')"><i class="ti ti-flag-check"></i> I finished the task</button>
      <button class="btn amber-btn" onclick="nowTimerOutcome('stuck')"><i class="ti ti-help"></i> I got stuck</button>
      <button class="btn peach" onclick="nowTimerOutcome('reset')"><i class="ti ti-refresh"></i> I need a reset</button>
      <button class="btn" onclick="nowStartTimer(state.nowTimerMins || 5)"><i class="ti ti-rotate"></i> Another round</button>
    </div>`;
}

// ─── AI breakdown ────────────────────────────────────────
async function renderAiSteps() {
  const undone = state.tasks.filter(t => !t.done);
  const cur    = undone[0];

  // First time: trigger the API call
  if (!state.nowAiSteps && !state.nowAiLoading) {
    state.nowAiLoading = true;
    renderAiStepsView();
    try {
      state.nowAiSteps = await callClaude(
        'Break this task into 3 to 5 very small first steps. Each step should be one short sentence, doable in 2 minutes or less. Use plain language. No motivation. Just a numbered list. Task: ' + (cur ? cur.text : 'the current task'),
        'You are Bowline, a calm support app. Be literal, direct, and brief.'
      );
    } catch (e) {
      state.nowAiSteps = 'AI is not available right now. Try the Make smaller option instead — it works offline.';
    }
    state.nowAiLoading = false;
  }
  renderAiStepsView();
}

function renderAiStepsView() {
  const undone = state.tasks.filter(t => !t.done);
  const cur    = undone[0];

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="card teal">
        <div class="card-label">Breaking down</div>
        <div class="card-main" style="font-size:16px">${cur ? cur.text : 'The current task'}</div>
      </div>

      ${state.nowAiLoading ? `
        <div style="display:flex;align-items:center;gap:12px;padding:1.5rem;justify-content:center">
          <div class="spinner"></div>
          <span style="font-size:14px;color:var(--text-secondary)">Finding the smallest first step...</span>
        </div>
      ` : ''}

      ${state.nowAiSteps ? `
        <div class="ai-out">${state.nowAiSteps}</div>
        <button class="btn primary" style="margin-top:12px" onclick="nowStartTimer(5)">
          <i class="ti ti-clock"></i> Body double on step one for 5 min
        </button>
        <button class="btn" onclick="state.nowAiSteps=null;nowSetView('aiSteps')">
          <i class="ti ti-rotate"></i> Generate again
        </button>
      ` : ''}

      <button class="btn" style="margin-top:8px;color:var(--text-muted)" onclick="state.nowAiSteps=null;nowSetView('main')">
        <i class="ti ti-arrow-left"></i> Back
      </button>
    </div>`;
}

// ═══════════════════════════════════════════════════════════
// TITRATION TRACKER
// ═══════════════════════════════════════════════════════════

// ─── Helpers ─────────────────────────────────────────────
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function streakDays() {
  if (state.titrationEntries.length === 0) return 0;
  const dates = [...new Set(state.titrationEntries.map(e => e.dateISO))].sort().reverse();
  let streak = 0;
  let cursor = new Date();
  for (const d of dates) {
    const cursorISO = cursor.toISOString().slice(0, 10);
    if (d === cursorISO) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function trendArrow(values) {
  if (!values || values.length < 2) return { icon: 'ti-minus', color: 'var(--text-muted)', label: 'stable' };
  const recent = values.slice(-3).filter(v => v != null);
  const earlier = values.slice(-6, -3).filter(v => v != null);
  if (recent.length === 0 || earlier.length === 0) return { icon: 'ti-minus', color: 'var(--text-muted)', label: 'stable' };
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
  const diff = recentAvg - earlierAvg;
  const pct = earlierAvg ? (diff / earlierAvg) * 100 : 0;
  if (Math.abs(pct) < 3) return { icon: 'ti-minus', color: 'var(--teal)', label: 'stable' };
  if (pct > 0) return { icon: 'ti-trending-up', color: 'var(--amber)', label: 'up' };
  return { icon: 'ti-trending-down', color: 'var(--sky)', label: 'down' };
}

function severityColor(sev) {
  const s = SEVERITY.find(x => x.k === sev);
  return s ? s.color : '#9aa39c';
}

// ─── Titration hub ───────────────────────────────────────
function renderTitrationHub() {
  const entries = state.titrationEntries;
  const count = entries.length;
  const streak = streakDays();

  // Trend calculations
  const bpSysVals = entries.map(e => e.bp_sys).filter(v => v != null);
  const hrVals    = entries.map(e => e.hr).filter(v => v != null);
  const wtVals    = entries.map(e => e.weight).filter(v => v != null);
  const bpTrend = trendArrow(bpSysVals);
  const hrTrend = trendArrow(hrVals);
  const wtTrend = trendArrow(wtVals);

  const last = entries[entries.length - 1];

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <button class="btn" style="margin-bottom:10px;color:var(--text-muted)" onclick="nowSetView('main')">
        <i class="ti ti-arrow-left"></i> Back to Now
      </button>

      <div class="card lavender">
        <div style="display:flex;align-items:flex-start;gap:12px">
          <i class="ti ti-pill" style="font-size:28px;color:var(--lavender);flex-shrink:0"></i>
          <div style="flex:1">
            <div class="card-label">Titration tracker</div>
            <div class="card-main" style="font-size:17px">Your dose-finding companion</div>
            <div class="card-sub" style="margin-top:6px;line-height:1.6">
              Log what your body and brain are telling you. Honest data helps your prescriber adjust faster.
            </div>
          </div>
        </div>
      </div>

      ${count === 0 ? `
        <div class="notice blue" style="text-align:center;padding:1.25rem">
          <i class="ti ti-clipboard-plus" style="font-size:28px;color:var(--sky);display:block;margin-bottom:8px"></i>
          <strong>No entries yet.</strong><br>
          Start logging today. Even a quick entry helps build the picture.
        </div>
      ` : `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
          <div class="card teal" style="padding:1rem;text-align:center">
            <div style="font-size:28px;font-weight:700;color:var(--teal-deep);line-height:1">${streak}</div>
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-top:4px">day streak</div>
          </div>
          <div class="card sky" style="padding:1rem;text-align:center">
            <div style="font-size:28px;font-weight:700;color:var(--sky-deep, var(--sky));line-height:1">${count}</div>
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-top:4px">total entries</div>
          </div>
        </div>

        ${last ? `
          <div class="section-label">Last entry · ${formatDate(last.dateISO)} at ${last.time || '—'}</div>
          <div class="card" style="padding:0.85rem 1.25rem">
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;text-align:center">
              <div>
                <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">BP</div>
                <div style="font-size:16px;font-weight:700;margin-top:2px">${last.bp_sys != null && last.bp_dia != null ? `${last.bp_sys}/${last.bp_dia}` : '—'}</div>
                <i class="ti ${bpTrend.icon}" style="font-size:14px;color:${bpTrend.color};margin-top:2px"></i>
              </div>
              <div>
                <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">HR</div>
                <div style="font-size:16px;font-weight:700;margin-top:2px">${last.hr != null ? last.hr : '—'}</div>
                <i class="ti ${hrTrend.icon}" style="font-size:14px;color:${hrTrend.color};margin-top:2px"></i>
              </div>
              <div>
                <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Weight</div>
                <div style="font-size:16px;font-weight:700;margin-top:2px">${last.weight != null ? last.weight : '—'}</div>
                <i class="ti ${wtTrend.icon}" style="font-size:14px;color:${wtTrend.color};margin-top:2px"></i>
              </div>
            </div>
          </div>
        ` : ''}
      `}

      <button class="btn primary" onclick="titrationStartLog()">
        <i class="ti ti-clipboard-plus"></i> Log new entry
      </button>

      ${count > 0 ? `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
          <button class="btn sky" style="margin:0" onclick="nowSetView('titrationHistory')">
            <i class="ti ti-history"></i> History
          </button>
          <button class="btn teal" style="margin:0" onclick="nowSetView('titrationChart')">
            <i class="ti ti-chart-line"></i> Trends
          </button>
        </div>
        <button class="btn amber-btn" onclick="nowSetView('titrationExport')">
          <i class="ti ti-file-export"></i> Export for prescriber
        </button>
      ` : ''}

      <div class="notice green" style="margin-top:1.25rem">
        <strong>Why log?</strong> Memory fades between appointments. A few seconds a day gives your prescriber the evidence they need to get your dose right faster.
      </div>
    </div>`;
}

// ─── Titration log entry form ────────────────────────────
function renderTitrationLog() {
  if (!state.titrationDraft) {
    state.titrationDraft = {
      id: Date.now(),
      dateISO: todayISO(),
      time: nowTime(),
      dose: '',
      bp_sys: null,
      bp_dia: null,
      hr: null,
      weight: null,
      mood: null,
      sideEffects: {},
      notes: '',
    };
    SIDE_EFFECTS.forEach(se => { state.titrationDraft.sideEffects[se.k] = 'none'; });
  }
  const d = state.titrationDraft;

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <button class="btn" style="margin-bottom:10px;color:var(--text-muted)" onclick="titrationCancelLog()">
        <i class="ti ti-arrow-left"></i> Cancel
      </button>

      <div class="card lavender">
        <div class="card-label">New titration entry</div>
        <div class="card-main" style="font-size:16px">${formatDate(d.dateISO)}</div>
        <div class="card-sub">Fill what you can. Skip anything you do not have right now.</div>
      </div>

      <!-- Date & Time -->
      <div class="section-label"><i class="ti ti-calendar" style="color:var(--lavender);font-size:14px"></i> When</div>
      <div class="card" style="padding:1rem 1.25rem">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div>
            <label style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Date</label>
            <input type="date" id="t-date" value="${d.dateISO}" onchange="titrationField('dateISO', this.value)"
              style="width:100%;padding:8px;border:1.5px solid var(--border);border-radius:var(--r-md);font-family:var(--font);font-size:14px;margin-top:4px;background:var(--bg-card);color:var(--text-primary)">
          </div>
          <div>
            <label style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Time</label>
            <input type="time" id="t-time" value="${d.time}" onchange="titrationField('time', this.value)"
              style="width:100%;padding:8px;border:1.5px solid var(--border);border-radius:var(--r-md);font-family:var(--font);font-size:14px;margin-top:4px;background:var(--bg-card);color:var(--text-primary)">
          </div>
        </div>
      </div>

      <!-- Dose -->
      <div class="section-label"><i class="ti ti-pill" style="color:var(--lavender);font-size:14px"></i> Dose</div>
      <div class="card" style="padding:1rem 1.25rem">
        <input type="text" placeholder="e.g. Elvanse 30mg, Concerta 36mg" value="${d.dose || ''}"
          oninput="titrationField('dose', this.value)"
          style="width:100%;padding:10px;border:1.5px solid var(--border);border-radius:var(--r-md);font-family:var(--font);font-size:14px;background:var(--bg-card);color:var(--text-primary)">
      </div>

      <!-- Vitals -->
      <div class="section-label"><i class="ti ti-heart-rate-monitor" style="color:var(--teal);font-size:14px"></i> Vitals</div>
      <div class="card" style="padding:1rem 1.25rem">
        <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px">
          <div>
            <label style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Blood pressure</label>
            <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
              <input type="number" placeholder="120" value="${d.bp_sys ?? ''}" min="50" max="250"
                oninput="titrationField('bp_sys', this.value ? parseInt(this.value) : null)"
                style="width:100%;padding:8px;border:1.5px solid var(--border);border-radius:var(--r-md);font-family:var(--font);font-size:14px;text-align:center;background:var(--bg-card);color:var(--text-primary)">
              <span style="color:var(--text-muted);font-weight:700">/</span>
              <input type="number" placeholder="80" value="${d.bp_dia ?? ''}" min="30" max="150"
                oninput="titrationField('bp_dia', this.value ? parseInt(this.value) : null)"
                style="width:100%;padding:8px;border:1.5px solid var(--border);border-radius:var(--r-md);font-family:var(--font);font-size:14px;text-align:center;background:var(--bg-card);color:var(--text-primary)">
            </div>
          </div>
          <div>
            <label style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Heart rate</label>
            <input type="number" placeholder="bpm" value="${d.hr ?? ''}" min="30" max="250"
              oninput="titrationField('hr', this.value ? parseInt(this.value) : null)"
              style="width:100%;padding:8px;border:1.5px solid var(--border);border-radius:var(--r-md);font-family:var(--font);font-size:14px;text-align:center;margin-top:4px;background:var(--bg-card);color:var(--text-primary)">
          </div>
          <div>
            <label style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Weight</label>
            <input type="number" placeholder="kg" value="${d.weight ?? ''}" min="20" max="300" step="0.1"
              oninput="titrationField('weight', this.value ? parseFloat(this.value) : null)"
              style="width:100%;padding:8px;border:1.5px solid var(--border);border-radius:var(--r-md);font-family:var(--font);font-size:14px;text-align:center;margin-top:4px;background:var(--bg-card);color:var(--text-primary)">
          </div>
        </div>
      </div>

      <!-- Mood -->
      <div class="section-label"><i class="ti ti-mood-smile" style="color:var(--sky);font-size:14px"></i> Mood today</div>
      <div class="card" style="padding:0.85rem 1rem">
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px">
          ${TITRATION_MOODS.map(m => `
            <button onclick="titrationField('mood', ${m.k})"
              style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 4px;
                     border:2px solid ${d.mood === m.k ? 'var(--sky)' : 'var(--border)'};
                     background:${d.mood === m.k ? 'var(--sky-l)' : 'var(--bg-card)'};
                     border-radius:var(--r-md);cursor:pointer;font-family:var(--font);
                     color:var(--text-primary)">
              <i class="ti ${m.icon}" style="font-size:22px;color:${d.mood === m.k ? 'var(--sky-d, var(--sky))' : 'var(--text-secondary)'}"></i>
              <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.3px">${m.l}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Side effects -->
      <div class="section-label"><i class="ti ti-alert-circle" style="color:var(--amber);font-size:14px"></i> Side effects</div>
      <div class="notice blue" style="margin-bottom:0.85rem;font-size:13px">
        Tap to set severity. Default is none — only change what you noticed.
      </div>
      <div class="card" style="padding:0.5rem 1rem">
        ${SIDE_EFFECTS.map(se => `
          <div style="padding:10px 0;border-bottom:1.5px solid var(--border)">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
              <i class="ti ${se.icon}" style="font-size:18px;color:var(--text-secondary);flex-shrink:0"></i>
              <div style="font-size:14px;font-weight:700;flex:1">${se.l}</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px">
              ${SEVERITY.map(sev => {
                const isSelected = d.sideEffects[se.k] === sev.k;
                return `
                  <button onclick="titrationSetSideEffect('${se.k}', '${sev.k}')"
                    style="padding:6px 4px;
                           border:1.5px solid ${isSelected ? sev.color : 'var(--border)'};
                           background:${isSelected ? sev.color : 'var(--bg-card)'};
                           color:${isSelected ? '#fff' : 'var(--text-secondary)'};
                           border-radius:var(--r-pill);cursor:pointer;font-family:var(--font);
                           font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.3px">
                    ${sev.l}
                  </button>`;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Notes -->
      <div class="section-label"><i class="ti ti-note" style="color:var(--peach);font-size:14px"></i> Other notes</div>
      <div class="card" style="padding:1rem 1.25rem">
        <textarea placeholder="Anything else worth recording — other side effects, what helped, what was hard..."
          oninput="titrationField('notes', this.value)"
          style="width:100%;min-height:80px;padding:10px;border:1.5px solid var(--border);border-radius:var(--r-md);font-family:var(--font);font-size:14px;resize:vertical;background:var(--bg-card);color:var(--text-primary)">${d.notes || ''}</textarea>
      </div>

      <button class="btn primary" style="margin-top:1rem" onclick="titrationSaveLog()">
        <i class="ti ti-check"></i> Save entry
      </button>
      <button class="btn" onclick="titrationCancelLog()">
        <i class="ti ti-x"></i> Cancel
      </button>
    </div>`;
}

// ─── Titration history ───────────────────────────────────
function renderTitrationHistory() {
  const entries = [...state.titrationEntries].sort((a, b) => {
    if (a.dateISO !== b.dateISO) return b.dateISO.localeCompare(a.dateISO);
    return (b.time || '').localeCompare(a.time || '');
  });

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <button class="btn" style="margin-bottom:10px;color:var(--text-muted)" onclick="nowSetView('titration')">
        <i class="ti ti-arrow-left"></i> Back
      </button>

      <div class="card sky">
        <div class="card-label">History</div>
        <div class="card-main" style="font-size:16px">${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}</div>
        <div class="card-sub">Newest first. Tap any entry to delete it.</div>
      </div>

      ${entries.length === 0 ? `
        <div class="notice blue" style="text-align:center;padding:1.5rem">
          No entries yet. Log your first one to see it here.
        </div>
      ` : entries.map(e => {
        const flagged = Object.values(e.sideEffects || {}).filter(s => s === 'moderate' || s === 'severe').length;
        const mood = TITRATION_MOODS.find(m => m.k === e.mood);
        return `
          <div class="card" style="padding:1rem 1.25rem;margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:8px">
              <div>
                <div style="font-size:15px;font-weight:700">${formatDate(e.dateISO)}</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${e.time || '—'}${e.dose ? ' · ' + e.dose : ''}</div>
              </div>
              <button onclick="titrationDelete(${e.id})"
                style="background:none;border:none;color:var(--text-muted);cursor:pointer;padding:4px"
                aria-label="Delete entry">
                <i class="ti ti-trash" style="font-size:16px"></i>
              </button>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:8px 0;border-top:1.5px solid var(--border);border-bottom:1.5px solid var(--border);margin-bottom:8px">
              <div style="text-align:center">
                <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">BP</div>
                <div style="font-size:13px;font-weight:700;margin-top:2px">${e.bp_sys != null && e.bp_dia != null ? `${e.bp_sys}/${e.bp_dia}` : '—'}</div>
              </div>
              <div style="text-align:center">
                <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">HR</div>
                <div style="font-size:13px;font-weight:700;margin-top:2px">${e.hr ?? '—'}</div>
              </div>
              <div style="text-align:center">
                <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Weight</div>
                <div style="font-size:13px;font-weight:700;margin-top:2px">${e.weight ?? '—'}</div>
              </div>
              <div style="text-align:center">
                <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Mood</div>
                <div style="font-size:13px;font-weight:700;margin-top:2px">${mood ? mood.l : '—'}</div>
              </div>
            </div>
            ${flagged > 0 ? `
              <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">
                ${SIDE_EFFECTS.filter(se => {
                  const s = e.sideEffects?.[se.k];
                  return s === 'moderate' || s === 'severe';
                }).map(se => {
                  const sev = e.sideEffects[se.k];
                  return `<span style="font-size:11px;padding:3px 8px;border-radius:var(--r-pill);background:${severityColor(sev)};color:#fff;font-weight:700">${se.l} · ${sev}</span>`;
                }).join('')}
              </div>
            ` : ''}
            ${e.notes ? `
              <div style="font-size:13px;color:var(--text-secondary);line-height:1.5;font-style:italic">"${e.notes}"</div>
            ` : ''}
          </div>`;
      }).join('')}
    </div>`;
}

// ─── Titration chart ─────────────────────────────────────
function renderTitrationChart() {
  const entries = [...state.titrationEntries].sort((a, b) => a.dateISO.localeCompare(b.dateISO));

  if (entries.length < 2) {
    document.getElementById('content').innerHTML = `
      <div class="screen">
        <button class="btn" style="margin-bottom:10px;color:var(--text-muted)" onclick="nowSetView('titration')">
          <i class="ti ti-arrow-left"></i> Back
        </button>
        <div class="notice blue" style="text-align:center;padding:1.5rem">
          <i class="ti ti-chart-line" style="font-size:28px;color:var(--sky);display:block;margin-bottom:8px"></i>
          <strong>Need at least 2 entries for trends.</strong><br>
          Keep logging — patterns will appear once you have a few days of data.
        </div>
        <button class="btn primary" onclick="titrationStartLog()">
          <i class="ti ti-clipboard-plus"></i> Log new entry
        </button>
      </div>`;
    return;
  }

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <button class="btn" style="margin-bottom:10px;color:var(--text-muted)" onclick="nowSetView('titration')">
        <i class="ti ti-arrow-left"></i> Back
      </button>

      <div class="card teal">
        <div class="card-label">Trends</div>
        <div class="card-main" style="font-size:16px">Last ${Math.min(entries.length, 14)} entries</div>
        <div class="card-sub">Each point is one entry. Hover or tap for details.</div>
      </div>

      ${renderSparkline(entries, 'Blood pressure (systolic)', 'bp_sys', 'teal', 80, 180)}
      ${renderSparkline(entries, 'Blood pressure (diastolic)', 'bp_dia', 'sky', 50, 110)}
      ${renderSparkline(entries, 'Heart rate', 'hr', 'amber', 50, 140)}
      ${renderSparkline(entries, 'Weight', 'weight', 'lavender', null, null)}
      ${renderSparkline(entries, 'Mood (1-5)', 'mood', 'peach', 1, 5)}

      <div class="notice green" style="margin-top:1rem">
        <strong>What to share with your prescriber:</strong> any clear upward or downward trends, especially in BP, HR, or weight. Mood dips and side-effect spikes also matter.
      </div>
    </div>`;
}

function renderSparkline(entries, label, field, color, minOverride, maxOverride) {
  const data = entries.slice(-14).map(e => ({ x: e.dateISO, y: e[field] }));
  const validData = data.filter(d => d.y != null);
  if (validData.length < 2) {
    return `
      <div class="card" style="padding:1rem 1.25rem;margin-bottom:10px">
        <div class="card-label">${label}</div>
        <div style="font-size:12px;color:var(--text-muted);padding:8px 0">Not enough data yet.</div>
      </div>`;
  }

  const values = validData.map(d => d.y);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const min = minOverride != null ? Math.min(minOverride, dataMin) : dataMin;
  const max = maxOverride != null ? Math.max(maxOverride, dataMax) : dataMax;
  const range = max - min || 1;

  const w = 300;
  const h = 60;
  const pad = 4;
  const stepX = (w - pad * 2) / Math.max(1, validData.length - 1);

  const points = validData.map((d, i) => {
    const x = pad + i * stepX;
    const y = h - pad - ((d.y - min) / range) * (h - pad * 2);
    return { x, y, val: d.y, date: d.x };
  });

  const path = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
  const areaPath = `${path} L${points[points.length - 1].x},${h - pad} L${points[0].x},${h - pad} Z`;

  const latest = points[points.length - 1];
  const first  = points[0];
  const change = latest.val - first.val;
  const changeStr = change > 0 ? `+${change.toFixed(field === 'weight' ? 1 : 0)}` : change.toFixed(field === 'weight' ? 1 : 0);

  return `
    <div class="card" style="padding:1rem 1.25rem;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px">
        <div class="card-label">${label}</div>
        <div style="display:flex;gap:10px;align-items:baseline">
          <span style="font-size:18px;font-weight:700;color:var(--${color});line-height:1">${latest.val}${field === 'weight' ? '' : ''}</span>
          <span style="font-size:11px;color:var(--text-muted)">${change >= 0 ? '↑' : '↓'} ${changeStr}</span>
        </div>
      </div>
      <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:60px;overflow:visible">
        <path d="${areaPath}" fill="var(--${color}-l)" opacity="0.5"/>
        <path d="${path}" fill="none" stroke="var(--${color})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="3" fill="var(--${color})"><title>${p.date}: ${p.val}</title></circle>`).join('')}
      </svg>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);margin-top:4px">
        <span>${formatDate(validData[0].x)}</span>
        <span>${formatDate(validData[validData.length - 1].x)}</span>
      </div>
    </div>`;
}

// ─── Titration export ────────────────────────────────────
function renderTitrationExport() {
  const entries = [...state.titrationEntries].sort((a, b) => a.dateISO.localeCompare(b.dateISO));

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <button class="btn" style="margin-bottom:10px;color:var(--text-muted)" onclick="nowSetView('titration')">
        <i class="ti ti-arrow-left"></i> Back
      </button>

      <div class="card amber">
        <div class="card-label">Export for prescriber</div>
        <div class="card-main" style="font-size:16px">${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}</div>
        <div class="card-sub">Copy a summary, or download as CSV to email or print.</div>
      </div>

      <button class="btn primary" onclick="titrationCopyText(this)">
        <i class="ti ti-copy"></i> Copy summary to clipboard
      </button>
      <button class="btn sky" onclick="titrationDownloadCSV()">
        <i class="ti ti-download"></i> Download CSV
      </button>
      <button class="btn" onclick="titrationPrintView()">
        <i class="ti ti-printer"></i> Print
      </button>

      <div class="section-label">Preview</div>
      <div class="card" style="padding:1rem 1.25rem;font-family:var(--font-mono, monospace);font-size:11px;line-height:1.6;white-space:pre-wrap;overflow-x:auto">${buildExportText(entries)}</div>
    </div>`;
}

function buildExportText(entries) {
  let out = `BOWLINE — TITRATION LOG\n`;
  out += `Generated: ${new Date().toLocaleString('en-GB')}\n`;
  out += `Entries: ${entries.length}\n`;
  out += `${'─'.repeat(50)}\n\n`;

  entries.forEach(e => {
    out += `${formatDate(e.dateISO)} · ${e.time || '—'}\n`;
    if (e.dose) out += `  Dose: ${e.dose}\n`;
    if (e.bp_sys != null && e.bp_dia != null) out += `  BP: ${e.bp_sys}/${e.bp_dia} mmHg\n`;
    if (e.hr != null) out += `  HR: ${e.hr} bpm\n`;
    if (e.weight != null) out += `  Weight: ${e.weight} kg\n`;
    if (e.mood != null) {
      const mood = TITRATION_MOODS.find(m => m.k === e.mood);
      out += `  Mood: ${mood ? mood.l : e.mood}/5\n`;
    }
    const flagged = SIDE_EFFECTS.filter(se => {
      const s = e.sideEffects?.[se.k];
      return s && s !== 'none';
    });
    if (flagged.length > 0) {
      out += `  Side effects:\n`;
      flagged.forEach(se => {
        out += `    - ${se.l}: ${e.sideEffects[se.k]}\n`;
      });
    }
    if (e.notes) out += `  Notes: ${e.notes}\n`;
    out += '\n';
  });

  return out;
}

function buildCSV(entries) {
  const headers = [
    'Date', 'Time', 'Dose', 'BP_Systolic', 'BP_Diastolic', 'HR', 'Weight', 'Mood(1-5)',
    ...SIDE_EFFECTS.map(se => `SE_${se.k}`),
    'Notes',
  ];
  const rows = entries.map(e => [
    e.dateISO,
    e.time || '',
    e.dose || '',
    e.bp_sys ?? '',
    e.bp_dia ?? '',
    e.hr ?? '',
    e.weight ?? '',
    e.mood ?? '',
    ...SIDE_EFFECTS.map(se => e.sideEffects?.[se.k] || 'none'),
    (e.notes || '').replace(/"/g, '""'),
  ]);
  return [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
}

// ─── Window handlers ──────────────────────────────────────
window.nowSetView = function (v) {
  state.nowView = v;
  renderNow();
};

window.nowPickStuck = function (k) {
  state.nowStuckReason = k;
  state.nowView = 'stuckResponse';
  renderNow();
};

window.nowDone = function (id) {
  const t = state.tasks.find(t => t.id === id);
  if (t) t.done = true;
  state.nowView = 'main';
  renderNow();
};

window.nowSnooze = function (id) {
  const t = state.tasks.find(t => t.id === id);
  if (t) {
    const i = state.tasks.indexOf(t);
    state.tasks.splice(i, 1);
    state.tasks.push(t);
  }
  renderNow();
};

window.nowSnoozeCurrent = function () {
  const cur = state.tasks.filter(t => !t.done)[0];
  if (cur) window.nowSnooze(cur.id);
  state.nowView = 'main';
  renderNow();
};

window.nowSwap = function (id) {
  const t = state.tasks.find(t => t.id === id);
  if (t) {
    const i = state.tasks.indexOf(t);
    state.tasks.splice(i, 1);
    state.tasks.splice(Math.min(2, state.tasks.length), 0, t);
  }
  renderNow();
};

window.nowApplySmaller = function (idx) {
  const opt = SMALLER_OPTIONS[idx];
  const cur = state.tasks.filter(t => !t.done)[0];
  if (cur && opt) {
    cur.text = opt.l;
    cur.meta = 'Reduced · ' + opt.meta;
  }
  state.nowView = 'main';
  renderNow();
};

window.nowStartTimer = function (mins) {
  state.nowTimerMins = mins;
  state.nowTimerEnd  = Date.now() + (mins * 60 * 1000);
  state.nowView      = 'timer';
  renderNow();
};

window.nowFinishTimerEarly = function () {
  state.nowTimerEnd = Date.now() - 1;
  state.nowView     = 'timerEnd';
  renderNow();
};

window.nowCancelTimer = function () {
  state.nowTimerEnd  = null;
  state.nowTimerMins = null;
  state.nowView      = 'main';
  renderNow();
};

window.nowTimerOutcome = function (outcome) {
  state.nowTimerEnd  = null;
  if (outcome === 'finished') {
    const cur = state.tasks.filter(t => !t.done)[0];
    if (cur) cur.done = true;
  }
  if (outcome === 'reset') {
    state.nowView = 'main';
    go('reset');
    return;
  }
  state.nowView = 'main';
  renderNow();
};

window.nowOpenReset = function (resetKey) {
  state.nowView    = 'main';
  state.resetMode  = resetKey;
  state.resetView  = 'flow';
  state.resetStep  = 0;
  go('reset');
};

// ─── Titration window handlers ───────────────────────────
window.titrationStartLog = function () {
  state.titrationDraft = null; // force fresh draft
  state.nowView = 'titrationLog';
  renderNow();
};

window.titrationCancelLog = function () {
  state.titrationDraft = null;
  state.nowView = 'titration';
  renderNow();
};

window.titrationField = function (key, value) {
  if (!state.titrationDraft) return;
  state.titrationDraft[key] = value;
  // Do not re-render — keep input focus
};

window.titrationSetSideEffect = function (effectKey, severity) {
  if (!state.titrationDraft) return;
  state.titrationDraft.sideEffects[effectKey] = severity;
  renderNow();
};

window.titrationSaveLog = function () {
  const d = state.titrationDraft;
  if (!d) return;
  // Read latest values from inputs (covers fields that did not re-render)
  state.titrationEntries.push({ ...d });
  state.titrationDraft = null;
  state.nowView = 'titration';
  renderNow();
};

window.titrationDelete = function (id) {
  if (!confirm('Delete this entry? This cannot be undone.')) return;
  state.titrationEntries = state.titrationEntries.filter(e => e.id !== id);
  renderNow();
};

window.titrationCopyText = function (btn) {
  const entries = [...state.titrationEntries].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  const text = buildExportText(entries);
  navigator.clipboard.writeText(text).catch(() => {});
  const original = btn.innerHTML;
  btn.innerHTML = '<i class="ti ti-check"></i> Copied to clipboard';
  setTimeout(() => { btn.innerHTML = original; }, 1800);
};

window.titrationDownloadCSV = function () {
  const entries = [...state.titrationEntries].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  const csv = buildCSV(entries);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bowline-titration-${todayISO()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

window.titrationPrintView = function () {
  const entries = [...state.titrationEntries].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  const text = buildExportText(entries);
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`
    <html><head><title>Bowline Titration Log</title>
    <style>body{font-family:system-ui,sans-serif;padding:24px;max-width:720px;margin:0 auto;line-height:1.5}pre{white-space:pre-wrap;font-size:12px}</style>
    </head><body><h1>Bowline — Titration Log</h1><pre>${text.replace(/</g, '&lt;')}</pre></body></html>
  `);
  win.document.close();
  setTimeout(() => win.print(), 250);
};

register('now', renderNow);
