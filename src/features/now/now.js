import { state, ACCENT } from '../../data/state.js';
import { register, setTopbar, go, render } from '../../app/router.js';

// ─── Now-screen local state ────────────────────────────────
// These live on `state` so they survive navigation.
if (!state.nowView)         state.nowView = 'main';        // main | stuck | smaller | bodyDouble | timer | aiSteps
if (!state.nowDoubleTime)   state.nowDoubleTime = null;
if (!state.nowDoubleEnd)    state.nowDoubleEnd = null;
if (!state.nowStuckReason)  state.nowStuckReason = null;
if (!state.nowAiSteps)      state.nowAiSteps = null;
if (!state.nowAiLoading)    state.nowAiLoading = false;
if (!state.nowSmallerOpts)  state.nowSmallerOpts = null;

const STUCK_OPTIONS = [
  { k: 'start',   l: "Don't know where to start", icon: 'ti-player-pause' },
  { k: 'big',     l: 'It feels too big',          icon: 'ti-arrows-maximize' },
  { k: 'steps',   l: 'Too many steps',            icon: 'ti-list-numbers' },
  { k: 'boring',  l: 'It feels boring',           icon: 'ti-zzz' },
  { k: 'anxious', l: "I'm anxious",               icon: 'ti-wind' },
  { k: 'over',    l: "I'm overstimulated",        icon: 'ti-volume-3' },
  { k: 'tired',   l: "I'm tired",                 icon: 'ti-moon' },
  { k: 'forget',  l: 'I forgot why this matters', icon: 'ti-question-mark' },
  { k: 'unclear', l: "I don't understand it",     icon: 'ti-help' },
  { k: 'change',  l: 'Something changed',         icon: 'ti-route-x' },
];

const STUCK_RESPONSES = {
  start: {
    title: 'Show only the first step',
    color: 'green',
    body: `<p style="margin-bottom:12px"><strong>First step:</strong> just open the thing. Nothing else yet.</p>
           <p style="margin-bottom:12px">Don't read it. Don't plan. Don't think about how long it'll take.</p>
           <p>Open. That's it.</p>`,
    actions: [
      { l: 'Make this smaller',  cls: 'lavender', go: 'smaller' },
      { l: 'Try a 3-min timer',  cls: 'sky',      go: 'timer',     timer: 3 },
      { l: 'Body double with me', cls: '',         go: 'bodyDouble' },
    ],
  },
  big: {
    title: 'Break this into smaller parts',
    color: 'purple',
    body: `<p style="margin-bottom:12px">A big task is usually 5–10 small steps wearing a costume.</p>
           <p>Let's get the costume off. AI can break this down for you in seconds.</p>`,
    actions: [
      { l: 'Break it down with AI', cls: 'primary',  go: 'aiSteps' },
      { l: 'I just want a smaller version', cls: 'lavender', go: 'smaller' },
    ],
  },
  steps: {
    title: 'Only the first step matters',
    color: 'purple',
    body: `<p style="margin-bottom:12px">The middle steps will still exist after you do step one.</p>
           <p style="margin-bottom:12px">Forget the rest. Just do step one.</p>
           <p><strong>What is step one?</strong> If you don't know, ask AI to find it.</p>`,
    actions: [
      { l: 'Get step one with AI', cls: 'primary', go: 'aiSteps' },
      { l: 'Body double on step one', cls: '',     go: 'bodyDouble' },
    ],
  },
  boring: {
    title: 'Try pairing it with something easier',
    color: 'amber',
    body: `<p style="margin-bottom:14px">Boring tasks need help getting started. Pair them with something pleasant:</p>
           <ul style="margin:0 0 12px 18px;line-height:1.9">
             <li>Put on familiar music or a podcast</li>
             <li>Make a drink first</li>
             <li>Use a 5-minute timer challenge</li>
             <li>Body double with the app</li>
             <li>Sit somewhere different than usual</li>
           </ul>`,
    actions: [
      { l: 'Start a 5-min timer', cls: 'amber-btn', go: 'timer', timer: 5 },
      { l: 'Body double',         cls: '',          go: 'bodyDouble' },
    ],
  },
  anxious: {
    title: 'Pause before action',
    color: 'amber',
    body: `<p style="margin-bottom:12px">Anxiety adds noise to the task. Try to reduce the noise first.</p>
           <p style="margin-bottom:12px">A reset takes 3–5 minutes. The task will still be here.</p>
           <p>You are not behind.</p>`,
    actions: [
      { l: 'Open anxiety reset', cls: 'amber-btn', goReset: 'anxiety' },
      { l: 'Make this smaller',  cls: 'lavender',  go: 'smaller' },
    ],
  },
  over: {
    title: 'Reduce input first',
    color: 'peach',
    body: `<p style="margin-bottom:12px">You can't think clearly when your senses are full.</p>
           <p>Sensory reset comes first. The task can wait.</p>`,
    actions: [
      { l: 'Open sensory reset', cls: 'peach',    goReset: 'over' },
      { l: "I'll come back later", cls: '',        go: 'snooze' },
    ],
  },
  tired: {
    title: 'Rest is valid',
    color: 'blue',
    body: `<p style="margin-bottom:12px">Tired brains can't push through. They can only do less.</p>
           <p style="margin-bottom:12px">What is the smallest possible version of this task?</p>
           <p>A reduced version still counts.</p>`,
    actions: [
      { l: 'Make this much smaller', cls: 'lavender', go: 'smaller' },
      { l: 'Move it to tomorrow',    cls: 'sky',      go: 'snooze' },
      { l: 'Open shutdown reset',    cls: '',          goReset: 'shutdown' },
    ],
  },
  forget: {
    title: 'It matters because future-you needs it done',
    color: 'purple',
    body: `<p style="margin-bottom:12px">Not because you have to be productive.</p>
           <p style="margin-bottom:12px">Not because anyone is watching.</p>
           <p>Finishing it just reduces pressure on the version of you who exists tomorrow.</p>`,
    actions: [
      { l: 'OK, I can start', cls: 'primary', go: 'back' },
      { l: 'Make it smaller', cls: 'lavender', go: 'smaller' },
    ],
  },
  unclear: {
    title: "Don't try to understand the whole thing",
    color: 'blue',
    body: `<p style="margin-bottom:12px">You need to understand <em>just enough</em> to start.</p>
           <p style="margin-bottom:12px">If this is a message or document, use TL;DR Assist to extract the key point.</p>
           <p>If it's a task, AI can break it down.</p>`,
    actions: [
      { l: 'Open TL;DR Assist', cls: 'sky', goNav: 'tldr' },
      { l: 'Break it down with AI', cls: 'primary', go: 'aiSteps' },
    ],
  },
  change: {
    title: 'Something changed. That is allowed.',
    color: 'amber',
    body: `<p style="margin-bottom:12px">Change of plan is information, not failure.</p>
           <p style="margin-bottom:12px">Open the reset for change-of-plan, or move on with a smaller version.</p>`,
    actions: [
      { l: 'Open change-of-plan reset', cls: 'amber-btn', goReset: 'change' },
      { l: 'Just do a smaller version', cls: 'lavender',  go: 'smaller' },
    ],
  },
};

// ─── Main entry ────────────────────────────────────────────
export function renderNow() {
  setTopbar('Now', 'What do I do next?');

  const view = state.nowView || 'main';
  if (view === 'stuck')      return renderStuck();
  if (view === 'smaller')    return renderSmaller();
  if (view === 'bodyDouble') return renderBodyDouble();
  if (view === 'timer')      return renderTimer();
  if (view === 'aiSteps')    return renderAiSteps();
  renderMain();
}

// ─── Main view: current task + actions ─────────────────────
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

      <!-- Primary action -->
      <button class="btn primary" onclick="nowDone(${cur.id})">
        <i class="ti ti-check"></i> Done
      </button>

      <!-- Secondary actions -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <button class="btn lavender" style="margin:0" onclick="setNowView('stuck')">
          <i class="ti ti-help"></i> I'm stuck
        </button>
        <button class="btn sky" style="margin:0" onclick="setNowView('smaller')">
          <i class="ti ti-arrows-minimize"></i> Make smaller
        </button>
        <button class="btn" style="margin:0" onclick="setNowView('bodyDouble')">
          <i class="ti ti-users"></i> Body double
        </button>
        <button class="btn" style="margin:0" onclick="setNowView('timer')">
          <i class="ti ti-clock"></i> Timer
        </button>
      </div>

      <!-- Tertiary actions -->
      <button class="btn amber-btn" onclick="nowSnooze(${cur.id})">
        <i class="ti ti-clock-pause"></i> Snooze · do this later
      </button>
      <button class="btn" onclick="nowSwap(${cur.id})">
        <i class="ti ti-arrows-shuffle"></i> Swap to next task
      </button>
      <button class="btn peach" onclick="go('reset')">
        <i class="ti ti-refresh"></i> I need a reset first
      </button>

      <!-- Next up preview -->
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

// ─── "I'm stuck" picker ────────────────────────────────────
function renderStuck() {
  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="notice purple">
        <strong>Stuck is information.</strong><br>
        It tells us something about the task — not about you. What is making this hard?
      </div>
      ${STUCK_OPTIONS.map(o => `
        <button class="btn" onclick="setStuckReason('${o.k}')">
          <i class="ti ${o.icon}"></i>${o.l}
        </button>
      `).join('')}
      <button class="btn" style="margin-top:8px;color:var(--text-muted)" onclick="setNowView('main')">
        <i class="ti ti-arrow-left"></i> Back
      </button>
    </div>`;
}

// ─── Specific stuck response ───────────────────────────────
function renderStuckResponse() {
  const r = STUCK_RESPONSES[state.nowStuckReason];
  if (!r) { state.nowView = 'stuck'; renderNow(); return; }

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="card ${r.color === 'green' ? 'teal' : r.color === 'purple' ? 'lavender' : r.color === 'amber' ? 'amber' : r.color === 'peach' ? 'peach' : 'sky'}">
        <div class="card-label">${r.title}</div>
        <div style="font-size:15px;line-height:1.6;margin-top:8px">${r.body}</div>
      </div>

      ${r.actions.map(a => {
        if (a.goReset) return `<button class="btn ${a.cls}" onclick="state.resetMode='${a.goReset}';go('reset')">${a.l} <i class="ti ti-arrow-right" style="margin-left:auto"></i></button>`;
        if (a.goNav)   return `<button class="btn ${a.cls}" onclick="go('${a.goNav}')">${a.l} <i class="ti ti-arrow-right" style="margin-left:auto"></i></button>`;
        if (a.go === 'snooze') return `<button class="btn ${a.cls}" onclick="nowSnoozeCurrent()">${a.l}</button>`;
        if (a.go === 'back')   return `<button class="btn ${a.cls}" onclick="setNowView('main')">${a.l}</button>`;
        if (a.go === 'timer')  return `<button class="btn ${a.cls}" onclick="startTimer(${a.timer})">${a.l}</button>`;
        return `<button class="btn ${a.cls}" onclick="setNowView('${a.go}')">${a.l}</button>`;
      }).join('')}

      <button class="btn" style="margin-top:8px;color:var(--text-muted)" onclick="state.nowStuckReason=null;setNowView('stuck')">
        <i class="ti ti-arrow-left"></i> Different reason
      </button>
    </div>`;
}

// ─── "Make smaller" reduction options ──────────────────────
function renderSmaller() {
  const undone = state.tasks.filter(t => !t.done);
  const cur    = undone[0];
  if (!cur) { setNowView('main'); return; }

  // Generic reductions that apply to almost any task
  const reductions = [
    { l: `Just open it. Don't do it yet.`,      meta: '30 seconds' },
    { l: `Set a 3-minute timer. Stop when it ends.`, meta: '3 minutes', timer: 3 },
    { l: `Do 1/10 of it. Then stop.`,           meta: 'Whatever counts as "a bit"' },
    { l: `Read it / look at it. Don't act yet.`, meta: 'Just gather information' },
    { l: `Tell someone you're doing it.`,        meta: 'Body-double via text' },
    { l: `Do the boring prep first only.`,       meta: 'Set up the environment' },
  ];

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="card teal">
        <div class="card-label">Original task</div>
        <div class="card-main" style="font-size:16px">${cur.text}</div>
      </div>
      <div class="notice green">
        A smaller version still counts. Pick one. You can always do more later.
      </div>
      ${reductions.map(r => `
        <button class="btn" onclick="${r.timer ? `startTimer(${r.timer})` : `applySmaller('${r.l.replace(/'/g, "\\'")}', '${r.meta}')`}">
          <div style="flex:1">
            <div>${r.l}</div>
            <div style="font-size:12px;font-weight:400;color:var(--text-muted);margin-top:2px">${r.meta}</div>
          </div>
        </button>
      `).join('')}
      <button class="btn" style="margin-top:8px;color:var(--text-muted)" onclick="setNowView('main')">
        <i class="ti ti-arrow-left"></i> Back
      </button>
    </div>`;
}

// ─── Body doubling ─────────────────────────────────────────
function renderBodyDouble() {
  // If a session is running, show the live screen
  if (state.nowDoubleEnd && state.nowDoubleEnd > Date.now()) {
    renderBodyDoubleActive();
    return;
  }

  // Otherwise, show the picker
  const times = [3, 5, 10, 15, 25];
  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="notice blue">
        <strong>Body doubling.</strong><br>
        Work alongside the app for a set time. You only need to stay with the task. Done is not required.
      </div>

      <div class="section-label">Choose a length</div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:14px">
        ${times.map(t => `
          <button class="mood-btn" onclick="startBodyDouble(${t})">${t} min</button>
        `).join('')}
      </div>

      <div class="notice green" style="margin-top:12px">
        <ul style="margin:0 0 0 18px;line-height:1.9">
          <li>Stay with the first step.</li>
          <li>Starting counts.</li>
          <li>You can go slowly.</li>
          <li>Notice distractions. Return gently.</li>
          <li>Done is not required.</li>
        </ul>
      </div>

      <button class="btn" style="margin-top:14px;color:var(--text-muted)" onclick="setNowView('main')">
        <i class="ti ti-arrow-left"></i> Back
      </button>
    </div>`;
}

function renderBodyDoubleActive() {
  const remainingMs = state.nowDoubleEnd - Date.now();
  const totalMs     = state.nowDoubleTime * 60 * 1000;
  const pct         = Math.max(0, Math.min(100, ((totalMs - remainingMs) / totalMs) * 100));
  const mins        = Math.floor(remainingMs / 60000);
  const secs        = Math.floor((remainingMs % 60000) / 1000);
  const timeStr     = `${mins}:${String(secs).padStart(2, '0')}`;

  const undone = state.tasks.filter(t => !t.done);
  const cur    = undone[0];

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="card teal">
        <div class="card-label">Body doubling · ${state.nowDoubleTime} min</div>
        <div class="card-main" style="font-size:16px">${cur ? cur.text : 'Stay with the task.'}</div>
      </div>

      <div style="text-align:center;padding:1.5rem 0">
        <div style="font-size:48px;font-weight:700;color:var(--teal-deep);letter-spacing:-1px;font-family:var(--font)">${timeStr}</div>
        <div style="font-size:13px;color:var(--text-muted);margin-top:4px">stay with it</div>
      </div>

      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>

      <div class="notice blue">
        Starting counts. You can go slowly. Done is not required.
      </div>

      <button class="btn primary" onclick="endBodyDouble()">
        <i class="ti ti-flag-check"></i> I'm done — finish early
      </button>
      <button class="btn" onclick="cancelBodyDouble()">
        <i class="ti ti-x"></i> Stop session
      </button>
    </div>`;

  // Tick the timer every second
  if (state.nowDoubleEnd > Date.now()) {
    setTimeout(() => {
      if (state.screen === 'now' && state.nowView === 'bodyDouble') renderNow();
    }, 1000);
  } else {
    renderBodyDoubleEnd();
  }
}

function renderBodyDoubleEnd() {
  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="notice green" style="text-align:center;padding:1.5rem">
        <div style="font-size:18px;font-weight:700;margin-bottom:8px">Session complete.</div>
        <div>What happened?</div>
      </div>
      <button class="btn primary" onclick="endBodyDoubleWith('started')"><i class="ti ti-check"></i> I started</button>
      <button class="btn sky" onclick="endBodyDoubleWith('continued')"><i class="ti ti-player-play"></i> I continued</button>
      <button class="btn lavender" onclick="endBodyDoubleWith('finished')"><i class="ti ti-flag-check"></i> I finished</button>
      <button class="btn amber-btn" onclick="endBodyDoubleWith('stuck')"><i class="ti ti-help"></i> I got stuck</button>
      <button class="btn peach" onclick="endBodyDoubleWith('reset')"><i class="ti ti-refresh"></i> I need a reset</button>
      <button class="btn" onclick="startBodyDouble(state.nowDoubleTime)"><i class="ti ti-rotate"></i> Another round</button>
    </div>`;
}

// ─── Timer (short focus burst) ─────────────────────────────
function renderTimer() {
  const times = [
    { m: 2,  l: 'Just begin', sub: '2 min' },
    { m: 3,  l: 'Tiny step',  sub: '3 min' },
    { m: 5,  l: 'Short burst', sub: '5 min' },
    { m: 10, l: 'Focused chunk', sub: '10 min' },
    { m: 25, l: 'Pomodoro', sub: '25 min' },
  ];

  if (state.nowDoubleEnd && state.nowDoubleEnd > Date.now()) {
    // Reuse the body-double active screen — same mechanic
    renderBodyDoubleActive();
    return;
  }

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="notice blue">
        <strong>Timer.</strong><br>
        A short, contained burst. When the timer ends, you can choose: stop, continue, or another round.
      </div>
      ${times.map(t => `
        <button class="btn" onclick="startBodyDouble(${t.m})">
          <i class="ti ti-clock" style="color:var(--teal)"></i>
          <div style="flex:1">
            <div>${t.l}</div>
            <div style="font-size:12px;font-weight:400;color:var(--text-muted);margin-top:2px">${t.sub}</div>
          </div>
        </button>
      `).join('')}
      <button class="btn" style="margin-top:8px;color:var(--text-muted)" onclick="setNowView('main')">
        <i class="ti ti-arrow-left"></i> Back
      </button>
    </div>`;
}

// ─── AI task breakdown (short version) ─────────────────────
async function renderAiSteps() {
  const undone = state.tasks.filter(t => !t.done);
  const cur    = undone[0];

  if (!state.nowAiSteps && !state.nowAiLoading) {
    // Trigger the AI call
    state.nowAiLoading = true;
    renderAiStepsView();
    try {
      const { callClaude } = await import('../../services/api.js');
      state.nowAiSteps = await callClaude(
        `Break this task into 3 to 5 very small first steps. Each step should be one short sentence, doable in 2 minutes or less. Use plain language. No motivation. Just a numbered list. Task: ${cur?.text || 'the current task'}`,
        'You are Bowline, a calm support app. Be literal, direct, and brief.'
      );
    } catch (e) {
      state.nowAiSteps = "Couldn't reach the AI right now. Try the 'Make smaller' option instead — it works offline.";
    }
    state.nowAiLoading = false;
    renderAiStepsView();
    return;
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
        <div class="card-main" style="font-size:16px">${cur?.text || 'The current task'}</div>
      </div>

      ${state.nowAiLoading ? `
        <div style="display:flex;align-items:center;gap:12px;padding:1.5rem;justify-content:center">
          <div class="spinner"></div>
          <span style="font-size:14px;color:var(--text-secondary)">Finding the smallest first step…</span>
        </div>` : ''}

      ${state.nowAiSteps ? `
        <div class="ai-out">${state.nowAiSteps}</div>
        <button class="btn primary" style="margin-top:12px" onclick="startBodyDouble(5)">
          <i class="ti ti-clock"></i> Body double on step one (5 min)
        </button>
        <button class="btn" onclick="state.nowAiSteps=null;setNowView('aiSteps')">
          <i class="ti ti-rotate"></i> Generate again
        </button>` : ''}

      <button class="btn" style="margin-top:8px;color:var(--text-muted)" onclick="state.nowAiSteps=null;setNowView('main')">
        <i class="ti ti-arrow-left"></i> Back
      </button>
    </div>`;
}

// ─── Action handlers (window-scoped) ───────────────────────
window.setNowView = (v) => { state.nowView = v; renderNow(); };

window.setStuckReason = (k) => {
  state.nowStuckReason = k;
  renderStuckResponse();
};

window.nowDone = (id) => {
  const t = state.tasks.find(t => t.id === id);
  if (t) t.done = true;
  state.nowView = 'main';
  renderNow();
};

window.nowSnooze = (id) => {
  const t = state.tasks.find(t => t.id === id);
  if (t) { const i = state.tasks.indexOf(t); state.tasks.splice(i, 1); state.tasks.push(t); }
  renderNow();
};

window.nowSnoozeCurrent = () => {
  const cur = state.tasks.filter(t => !t.done)[0];
  if (cur) window.nowSnooze(cur.id);
  state.nowView = 'main';
  renderNow();
};

window.nowSwap = (id) => {
  // Move current to position 2 (so a different task becomes current)
  const t = state.tasks.find(t => t.id === id);
  if (t) {
    const i = state.tasks.indexOf(t);
    state.tasks.splice(i, 1);
    state.tasks.splice(2, 0, t);
  }
  renderNow();
};

window.applySmaller = (text, meta) => {
  const undone = state.tasks.filter(t => !t.done);
  const cur    = undone[0];
  if (cur) {
    cur.text = text;
    cur.meta = `Reduced · ${meta}`;
  }
  state.nowView = 'main';
  renderNow();
};

window.startBodyDouble = (mins) => {
  state.nowDoubleTime = mins;
  state.nowDoubleEnd  = Date.now() + mins * 60 * 1000;
  state.nowView       = 'bodyDouble';
  renderNow();
};

window.startTimer = (mins) => { window.startBodyDouble(mins); };

window.endBodyDouble = () => {
  state.nowDoubleEnd = Date.now() - 1; // force the "what happened" screen
  renderNow();
};

window.cancelBodyDouble = () => {
  state.nowDoubleEnd  = null;
  state.nowDoubleTime = null;
  state.nowView       = 'main';
  renderNow();
};

window.endBodyDoubleWith = (outcome) => {
  state.nowDoubleEnd  = null;
  state.nowDoubleTime = null;
  if (outcome === 'finished') {
    const cur = state.tasks.filter(t => !t.done)[0];
    if (cur) cur.done = true;
  }
  if (outcome === 'reset') { state.nowView = 'main'; go('reset'); return; }
  state.nowView = 'main';
  renderNow();
};

register('now', renderNow);
