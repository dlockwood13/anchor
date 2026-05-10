import { state } from '../../data/state.js';
import { setTopbar, go } from '../../app/router.js';
import { callClaude, BREAKDOWN_SYSTEM } from '../../services/api.js';

const ENERGY_LEVELS = [
  { k: 'vlow', l: 'Very low', tasks: ['Drink water', 'Eat a simple snack', 'Open the document', 'Put one item away', 'Rest without planning'] },
  { k: 'low', l: 'Low', tasks: ['Send one short reply', 'Set a reminder', 'Read one thing', 'Do one small task'] },
  { k: 'med', l: 'Medium', tasks: ['Reply to emails', 'Admin tasks', 'Cleaning', 'Planning tomorrow'] },
  { k: 'high', l: 'High', tasks: ['Complex work', 'Important decisions', 'Long tasks', 'Social calls'] },
];

const ROUTINES = {
  morning: { l: 'Basic morning', steps: ['Sit up', 'Drink water', 'Bathroom', 'Medication', 'Eat something', 'Get dressed', 'Check Today', 'Choose first step'] },
  leaving: { l: 'Leaving home', steps: ['Check time', 'Check destination', 'Keys', 'Phone', 'Wallet/card', 'Headphones', 'Medication', 'Weather item', 'Shoes', 'Leave'] },
  bedtime: { l: 'Wind-down', steps: ['Set tomorrow reminder', 'Phone away', 'Dim lights', 'Wash face', 'Drink water', 'Get into bed', 'Review today (optional)'] },
  work: { l: 'Work start', steps: ['Open Today', 'Check first task', 'Clear desk', 'Put on headphones', 'Set first timer', 'Begin'] },
};

export function renderPlan() {
  setTopbar('Plan', 'Get it out of your head.');

  if (state.planMode === 'dump') { renderBrainDump(); return; }
  if (state.planMode === 'breakdown') { renderBreakdown(); return; }
  if (state.planMode === 'energy') { renderEnergy(); return; }
  if (state.planMode === 'routine') { renderRoutineList(); return; }

  const opts = [
    { k: 'dump', icon: 'ti-brain', l: 'Brain dump', sub: 'Get everything out' },
    { k: 'breakdown', icon: 'ti-list-details', l: 'Break down a task', sub: 'Into clear steps' },
    { k: 'energy', icon: 'ti-battery-2', l: 'Plan around energy', sub: 'Match tasks to capacity' },
    { k: 'routine', icon: 'ti-repeat', l: 'Add a routine', sub: 'Morning, bedtime, leaving home' },
  ];

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="notice blue">Choose one planning tool. Sorting comes after.</div>
      ${opts.map(o => `
        <button class="btn" onclick="state.planMode='${o.k}';renderPlan()">
          <i class="ti ${o.icon}" aria-hidden="true"></i>
          <div>
            <div>${o.l}</div>
            <div style="font-size:12px;color:var(--color-text-secondary)">${o.sub}</div>
          </div>
        </button>
      `).join('')}
      <button class="btn" onclick="addTask()"><i class="ti ti-plus"></i> Add a task quickly</button>
    </div>`;
}

function renderBrainDump() {
  setTopbar('Brain dump', 'Get it out of your head.');
  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="notice">Write anything your brain is holding. Sorting comes later.</div>
      <textarea id="dump-input" placeholder="Email Alex, book appointment, laundry, eat, fill form…" style="min-height:160px"></textarea>
      <button class="btn primary" style="margin-top:8px" onclick="sortDump()"><i class="ti ti-sort-ascending"></i> Sort this</button>
      <button class="btn" style="margin-top:4px" onclick="state.planMode=null;renderPlan()"><i class="ti ti-arrow-left"></i> Back</button>
    </div>`;
}

window.sortDump = () => {
  const v = document.getElementById('dump-input').value.trim();
  if (!v) return;
  const cats = ['Must happen today', 'Helpful today', 'Can wait', 'Needs more info', 'Delete'];
  const items = v.split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="notice">Items sorted. Tap a category to assign.</div>
      ${items.map(item => `
        <div class="card" style="margin-bottom:8px">
          <div class="card-main" style="font-size:14px;margin-bottom:8px">${item}</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            ${cats.map(c => `<button class="chip" onclick="assignItem(this)" style="font-size:12px;padding:5px 10px">${c}</button>`).join('')}
          </div>
        </div>
      `).join('')}
      <div class="notice" style="margin-top:0.5rem">Deleting a task is a valid decision.</div>
      <button class="btn soft" onclick="state.planMode=null;renderPlan()" style="margin-top:4px"><i class="ti ti-check"></i> Done sorting</button>
    </div>`;
};

window.assignItem = (el) => {
  const card = el.closest('.card');
  card.style.opacity = '0.4';
  card.style.pointerEvents = 'none';
  el.style.background = '#E1F5EE'; el.style.color = '#085041'; el.style.borderColor = '#1D9E75';
};

function renderBreakdown() {
  setTopbar('Break it down', 'Into clear steps.');
  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="notice blue">What task needs breaking down?</div>
      <textarea id="bd-input" placeholder="e.g. Reply to that email, clean the kitchen, fill out the form…" style="min-height:80px"></textarea>
      <button class="btn primary" id="bd-btn" style="margin-top:8px" onclick="doBreakdown()">
        <i class="ti ti-list-details"></i> Break it down
      </button>
      ${state.breakdownLoading ? `
        <div style="display:flex;align-items:center;gap:8px;margin-top:10px">
          <div class="spinner"></div>
          <span style="font-size:13px;color:var(--color-text-secondary)">Breaking this down…</span>
        </div>` : ''}
      ${state.breakdownOutput ? `
        <div class="ai-out">${state.breakdownOutput}</div>
        <button class="btn soft" style="margin-top:8px" onclick="addBreakdownToday()">
          <i class="ti ti-calendar-plus"></i> Add first step to Today
        </button>` : ''}
      <button class="btn" style="margin-top:4px;color:var(--color-text-secondary)" onclick="state.planMode=null;state.breakdownOutput=null;renderPlan()">
        <i class="ti ti-arrow-left"></i> Back
      </button>
    </div>`;
}

window.doBreakdown = async () => {
  const v = document.getElementById('bd-input')?.value?.trim();
  if (!v) return;
  state.breakdownLoading = true; state.breakdownOutput = null;
  renderBreakdown();
  try {
    state.breakdownOutput = await callClaude(`Break down this task: ${v}`, BREAKDOWN_SYSTEM);
  } catch (e) {
    state.breakdownOutput = 'Something went wrong. Please try again.';
  }
  state.breakdownLoading = false;
  renderBreakdown();
};

window.addBreakdownToday = () => {
  const firstLine = state.breakdownOutput?.split('\n').find(l => l.match(/^\d/));
  if (firstLine) state.tasks.unshift({ id: Date.now(), text: firstLine.replace(/^\d+\.\s*/, ''), meta: 'From breakdown · Low energy', done: false });
  state.planMode = null; state.breakdownOutput = null;
  go('today');
};

function renderEnergy() {
  setTopbar('Plan around energy', 'Match tasks to capacity.');
  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="notice blue">What is your capacity right now?</div>
      ${ENERGY_LEVELS.map(lv => `
        <div class="card" style="margin-bottom:8px">
          <div class="card-title" style="margin-bottom:8px">${lv.l}</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            ${lv.tasks.map(t => `<button class="chip" onclick="addFromEnergy('${t}',this)">${t}</button>`).join('')}
          </div>
        </div>
      `).join('')}
      <button class="btn" style="margin-top:4px;color:var(--color-text-secondary)" onclick="state.planMode=null;renderPlan()">
        <i class="ti ti-arrow-left"></i> Back
      </button>
    </div>`;
}

window.addFromEnergy = (task, el) => {
  state.tasks.unshift({ id: Date.now(), text: task, meta: 'Energy match · 5 min', done: false });
  el.classList.add('sel');
};

function renderRoutineList() {
  setTopbar('Routines', 'Step by step.');
  document.getElementById('content').innerHTML = `
    <div class="screen">
      ${Object.entries(ROUTINES).map(([k, r]) => `
        <div class="card" style="margin-bottom:10px">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div class="card-main" style="font-size:15px">${r.l}</div>
            <button class="btn" style="width:auto;margin:0;padding:6px 12px;font-size:13px" onclick="startRoutine('${k}')">Start</button>
          </div>
          <div class="card-sub">${r.steps.length} steps</div>
        </div>
      `).join('')}
      <button class="btn" style="margin-top:4px;color:var(--color-text-secondary)" onclick="state.planMode=null;renderPlan()">
        <i class="ti ti-arrow-left"></i> Back
      </button>
    </div>`;
}

window.startRoutine = (k) => {
  const steps = ROUTINES[k].steps;
  let step = 0;
  function show() {
    if (step >= steps.length) {
      document.getElementById('content').innerHTML = `
        <div class="screen">
          <div class="notice">Routine complete. Restart from any step or return to Today.</div>
          <button class="btn primary" onclick="state.planMode=null;go('today')">Back to Today</button>
        </div>`;
      return;
    }
    document.getElementById('content').innerHTML = `
      <div class="screen">
        <div class="notice blue">Step ${step + 1} of ${steps.length}</div>
        <div class="card">
          <div class="card-title">Current step</div>
          <div class="card-main">${steps[step]}</div>
        </div>
        <div style="margin-bottom:12px">
          <div class="energy-bar"><div class="energy-fill" style="width:${(step / steps.length) * 100}%"></div></div>
        </div>
        <button class="btn primary" onclick="step++;show()"><i class="ti ti-check"></i> Done — next step</button>
        <button class="btn" onclick="step=Math.max(0,step-1);show()"><i class="ti ti-arrow-left"></i> Back a step</button>
        <button class="btn" onclick="step++;show()"><i class="ti ti-skip-forward"></i> Skip this step</button>
        <button class="btn" style="color:var(--color-text-secondary)" onclick="state.planMode=null;renderPlan()">End routine</button>
      </div>`;
  }
  show();
};

window.addTask = () => {
  const t = prompt('What do you need to add?');
  if (t) state.tasks.push({ id: Date.now(), text: t, meta: 'Added manually', done: false });
  renderPlan();
};

window.renderPlan = renderPlan;
