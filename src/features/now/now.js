import { state } from '../../data/state.js';
import { setTopbar, go, render } from '../../app/router.js';

const STUCK_OPTIONS = [
  { k: 'start', l: "Don't know where to start" },
  { k: 'big', l: 'It feels too big' },
  { k: 'boring', l: 'It feels boring' },
  { k: 'anxious', l: "I'm anxious" },
  { k: 'over', l: "I'm overstimulated" },
  { k: 'tired', l: "I'm tired" },
  { k: 'forget', l: 'I forgot why this matters' },
  { k: 'change', l: 'Something changed' },
];

const STUCK_RESPONSES = {
  start: '<div class="notice">Show only the first step.<br><br>First step: just open the thing. Nothing else yet.</div>',
  big: `<div class="notice">Break this into smaller parts.<br><br><button class="btn soft" onclick="state.planMode='breakdown';state.stuckFlow=false;go('plan')">Break it down →</button></div>`,
  boring: '<div class="notice amber">Try pairing this with something easier.<br><br>· Put on familiar music<br>· Make a drink first<br>· Use a 5-minute timer challenge</div>',
  anxious: `<div class="notice amber">Pause before action.<br><br><button class="btn warn" onclick="state.stuckFlow=false;go('reset')">Open reset →</button></div>`,
  over: `<div class="notice amber">Reduce input first.<br><br><button class="btn warn" onclick="state.stuckFlow=false;go('reset')">Open sensory reset →</button></div>`,
  tired: '<div class="notice">Rest is valid. A smaller version still counts.<br><br>What is the smallest possible version of this task?</div>',
  forget: '<div class="notice blue">It matters because finishing it reduces future pressure — not because you have to be productive.</div>',
  change: `<div class="notice amber">Something changed. That is allowed.<br><br><button class="btn warn" onclick="state.stuckFlow=false;go('reset')">Rebuild today →</button></div>`,
};

export function renderNow() {
  setTopbar('Now', 'What do I do next?');

  const undone = state.tasks.filter(t => !t.done);
  const cur = undone[0];

  if (!cur) {
    document.getElementById('content').innerHTML = `
      <div class="screen">
        <div class="notice">All done for now. Rest is valid.</div>
        <button class="btn" onclick="go('plan')"><i class="ti ti-plus"></i> Add something</button>
      </div>`;
    return;
  }

  if (state.stuckFlow) { renderStuck(); return; }

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="card">
        <div class="card-title">Next helpful step</div>
        <div class="card-main">${cur.text}</div>
        <div class="card-sub">${cur.meta}</div>
        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
          <span class="tag green"><i class="ti ti-bolt" style="font-size:13px"></i> Low energy</span>
          <span class="tag amber"><i class="ti ti-clock" style="font-size:13px"></i> 5 min</span>
        </div>
      </div>
      <button class="btn primary" onclick="markDone(${cur.id})"><i class="ti ti-check"></i> Done</button>
      <button class="btn soft" onclick="state.stuckFlow=true;render()"><i class="ti ti-help"></i> I'm stuck</button>
      <button class="btn" onclick="snoozeTask(${cur.id})"><i class="ti ti-clock"></i> Snooze this</button>
      <button class="btn" onclick="go('reset')"><i class="ti ti-refresh"></i> Reset first</button>

      <div class="section-label">Next up</div>
      <div class="card" style="padding:0.5rem 1.25rem">
        ${undone.slice(1, 3).map(t => `
          <div class="task-row">
            <div class="task-text" style="font-size:14px">${t.text}</div>
            <div class="task-meta">${t.meta}</div>
          </div>
        `).join('') || '<div class="task-row"><div class="task-text" style="font-size:14px;color:var(--color-text-secondary)">Nothing else queued.</div></div>'}
      </div>
    </div>`;
}

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
