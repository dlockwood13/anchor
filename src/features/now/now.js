import { state, ACCENT } from '../../data/state.js';
import { register, setTopbar, go, render } from '../../app/router.js';

const STUCK_OPTIONS = [
  { k: 'start',   l: "Don't know where to start" },
  { k: 'big',     l: 'It feels too big' },
  { k: 'boring',  l: 'It feels boring' },
  { k: 'anxious', l: "I'm anxious" },
  { k: 'over',    l: "I'm overstimulated" },
  { k: 'tired',   l: "I'm tired" },
  { k: 'forget',  l: 'I forgot why this matters' },
  { k: 'change',  l: 'Something changed' },
];

const STUCK_RESPONSES = {
  start: `<div class="notice green">
    <strong>Show only the first step.</strong><br><br>
    First step: just open the thing. Nothing else yet.
  </div>`,

  big: `<div class="notice purple">
    Break this into smaller parts.<br><br>
    <button class="btn lavender" onclick="state.planMode='breakdown';state.stuckFlow=false;go('plan')">
      <i class="ti ti-list-details"></i> Break it down
    </button>
  </div>`,

  boring: `<div class="notice amber">
    <strong>Try pairing this with something easier.</strong><br><br>
    · Put on familiar music<br>
    · Make a drink first<br>
    · Use a 5-minute timer<br>
    · Body doubling
  </div>`,

  anxious: `<div class="notice amber">
    <strong>Pause before action.</strong><br><br>
    <button class="btn amber-btn" onclick="state.stuckFlow=false;go('reset')">
      <i class="ti ti-refresh"></i> Open reset
    </button>
  </div>`,

  over: `<div class="notice peach">
    <strong>Reduce input first.</strong><br><br>
    <button class="btn peach" onclick="state.stuckFlow=false;go('reset')">
      <i class="ti ti-refresh"></i> Open sensory reset
    </button>
  </div>`,

  tired: `<div class="notice blue">
    <strong>Rest is valid.</strong><br><br>
    What is the smallest possible version of this task?
  </div>`,

  forget: `<div class="notice purple">
    <strong>It matters because finishing it reduces future pressure.</strong><br><br>
    Not because you have to be productive.
  </div>`,

  change: `<div class="notice amber">
    <strong>Something changed. That is allowed.</strong><br><br>
    <button class="btn amber-btn" onclick="state.stuckFlow=false;go('reset')">
      <i class="ti ti-refresh"></i> Rebuild today
    </button>
  </div>`,
};

export function renderNow() {
  setTopbar('Now', 'What do I do next?');

  const undone = state.tasks.filter(t => !t.done);
  const cur    = undone[0];

  if (!cur) {
    document.getElementById('content').innerHTML = `
      <div class="screen">
        <div class="notice green">All done for now. Rest is valid. A smaller day still counts.</div>
        <button class="btn" onclick="go('plan')"><i class="ti ti-plus"></i> Add something</button>
      </div>`;
    return;
  }

  if (state.stuckFlow) { renderStuck(); return; }

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="card teal">
        <div class="card-label">Your next step</div>
        <div class="card-main">${cur.text}</div>
        <div class="card-sub">${cur.meta}</div>
        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
          <span class="tag green"><i class="ti ti-bolt" style="font-size:12px"></i> Low energy</span>
          <span class="tag amber"><i class="ti ti-clock" style="font-size:12px"></i> 5 min</span>
        </div>
      </div>

      <button class="btn primary"   onclick="markDone(${cur.id})"><i class="ti ti-check"></i> Done</button>
      <button class="btn lavender"  onclick="state.stuckFlow=true;render()"><i class="ti ti-help"></i> I'm stuck</button>
      <button class="btn sky"       onclick="snoozeTask(${cur.id})"><i class="ti ti-clock"></i> Snooze this</button>
      <button class="btn amber-btn" onclick="go('reset')"><i class="ti ti-refresh"></i> Reset first</button>

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

function renderStuck() {
  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="notice purple">
        <strong>Stuck is information.</strong><br>
        It tells us something about the task, not about you. What is making this hard?
      </div>
      ${STUCK_OPTIONS.map(o => `
        <button class="btn" onclick="handleStuck('${o.k}')">${o.l}</button>
      `).join('')}
      <button class="btn" style="color:var(--text-muted)" onclick="state.stuckFlow=false;render()">
        <i class="ti ti-arrow-left"></i> Back
      </button>
    </div>`;
}

window.handleStuck = (k) => {
  document.getElementById('content').innerHTML = `
    <div class="screen">
      ${STUCK_RESPONSES[k] || ''}
      <button class="btn" style="margin-top:8px;color:var(--text-muted)" onclick="state.stuckFlow=false;render()">
        <i class="ti ti-arrow-left"></i> Back to Now
      </button>
    </div>`;
};

window.markDone = (id) => {
  const t = state.tasks.find(t => t.id === id);
  if (t) t.done = true;
  renderNow();
};

window.snoozeTask = (id) => {
  const t = state.tasks.find(t => t.id === id);
  if (t) { const i = state.tasks.indexOf(t); state.tasks.splice(i, 1); state.tasks.push(t); }
  renderNow();
};

register('now', renderNow);}

function renderStuck() {
  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="card">
        <div class="card-title">Stuck is information</div>
        <div class="card-main" style="font-size:15px">What is making this hard?</div>
      </div>
      ${STUCK_OPTIONS.map(o => `<button class="btn" onclick="handleStuck('${o.k}')">${o.l}</button>`).join('')}
      <button class="btn" style="color:var(--color-text-secondary)" onclick="state.stuckFlow=false;render()">
        <i class="ti ti-arrow-left"></i> Back
      </button>
    </div>`;
}

window.handleStuck = (k) => {
  document.getElementById('content').innerHTML = `
    <div class="screen">
      ${STUCK_RESPONSES[k] || ''}
      <button class="btn" style="margin-top:8px;color:var(--color-text-secondary)" onclick="state.stuckFlow=false;render()">
        <i class="ti ti-arrow-left"></i> Back to Now
      </button>
    </div>`;
};

window.markDone = (id) => {
  const t = state.tasks.find(t => t.id === id);
  if (t) t.done = true;
  renderNow();
};

window.snoozeTask = (id) => {
  const t = state.tasks.find(t => t.id === id);
  if (t) { const i = state.tasks.indexOf(t); state.tasks.splice(i, 1); state.tasks.push(t); }
  renderNow();
};
