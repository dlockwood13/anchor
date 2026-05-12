import { state, ACCENT } from '../../data/state.js';
import { register, setTopbar, go } from '../../app/router.js';
import { callClaude } from '../../services/api.js';

// Init local state
if (!state.nowView)        state.nowView = 'main';
if (!state.nowStuckReason) state.nowStuckReason = null;
if (!state.nowTimerEnd)    state.nowTimerEnd = null;
if (!state.nowTimerMins)   state.nowTimerMins = null;
if (!state.nowAiSteps)     state.nowAiSteps = null;
if (!state.nowAiLoading)   state.nowAiLoading = false;

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

// ─── Main router ──────────────────────────────────────────
export function renderNow() {
  setTopbar('Now', 'What do I do next?');

  switch (state.nowView) {
    case 'stuck':         return renderStuck();
    case 'stuckResponse': return renderStuckResponse();
    case 'smaller':       return renderSmaller();
    case 'bodyDouble':    return renderBodyDouble();
    case 'timerSetup':    return renderTimerSetup();
    case 'timer':         return renderTimerActive();
    case 'timerEnd':      return renderTimerEnd();
    case 'aiSteps':       return renderAiSteps();
    default:              return renderMain();
  }
}

// ─── Main view ────────────────────────────────────────────
function renderMain() {
  const undone = state.tasks.filter(t => !t.done);
  const cur    = undone[0];

  if (!cur) {
    document.getElementById('content').innerHTML = `
      <div class="screen">
        <div class="notice green" style="text-align:center;padding:1.5rem">
          <div style="font-size:18px;font-weight:700;margin-bottom:8px">All done for now.</div>
          <div>Rest is valid. A smaller day still counts.</div>
        </div>
        <button class="btn primary" onclick="go('today')"><i class="ti ti-sun"></i> Back to Today</button>
        <button class="btn" onclick="go('plan')"><i class="ti ti-plus"></i> Add something</button>
        <button class="btn sky" onclick="go('reset')"><i class="ti ti-refresh"></i> Take a recovery moment</button>
      </div>`;
    return;
  }

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="card teal">
        <div class="card-label">Your next step</div>
        <div class="card-main">${cur.text}</div>
        <div class="card-sub">${cur.meta}</div>
        <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
          <span class="tag green"><i class="ti ti-bolt" style="font-size:12px"></i> Low energy</span>
          <span class="tag amber"><i class="ti ti-clock" style="font-size:12px"></i> 5 min</span>
        </div>
      </div>

      <button class="btn primary" onclick="nowDone(${cur.id})">
        <i class="ti ti-check"></i> Done
      </button>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <button class="btn lavender" style="margin:0" onclick="nowSetView('stuck')">
          <i class="ti ti-help"></i> I am stuck
        </button>
        <button class="btn sky" style="margin:0" onclick="nowSetView('smaller')">
          <i class="ti ti-arrows-minimize"></i> Make smaller
        </button>
        <button class="btn" style="margin:0" onclick="nowSetView('bodyDouble')">
          <i class="ti ti-users"></i> Body double
        </button>
        <button class="btn" style="margin:0" onclick="nowSetView('timerSetup')">
          <i class="ti ti-clock"></i> Timer
        </button>
      </div>

      <button class="btn amber-btn" onclick="nowSnooze(${cur.id})">
        <i class="ti ti-clock-pause"></i> Snooze · do this later
      </button>
      <button class="btn" onclick="nowSwap(${cur.id})">
        <i class="ti ti-arrows-shuffle"></i> Swap to next task
      </button>
      <button class="btn peach" onclick="go('reset')">
        <i class="ti ti-refresh"></i> I need a reset first
      </button>

      <div class="section-label">Next up</div>
      <div class="card" style="padding:0.5rem 1.25rem">
        ${undone.slice(1, 3).map(t => `
          <div class="task-row">
            <div style="flex:1">
              <div class="task-text" style="font-size:14px">${t.text}</div>
              <div class="task-meta">${t.meta}</div>
            </div>
            <span style="width:6px;height:6px;border-radius:50%;background:${ACCENT[t.color] || '#888780'};margin-top:8px;flex-shrink:0"></span>
          </div>
        `).join('') || `
          <div class="task-row">
            <div class="task-text" style="color:var(--text-muted);font-size:14px">Nothing else queued.</div>
          </div>`}
      </div>
    </div>`;
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

register('now', renderNow);
