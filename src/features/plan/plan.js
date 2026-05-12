import { state, ACCENT } from '../../data/state.js';
import { register, setTopbar, go } from '../../app/router.js';
import { callClaude, BREAKDOWN_SYSTEM } from '../../services/api.js';

// ─── Local state ──────────────────────────────────────────
if (!state.planMode)         state.planMode = 'home'; // home | masterlist | timeblock | chunking | tiered | kanban | shape | brainDump | routines | quickAdd
if (!state.masterList)       state.masterList = []; // { id, text, priority, done }
if (!state.timeBlocks)       state.timeBlocks = []; // { id, hour, label, color }
if (!state.tieredGoals)      state.tieredGoals = { monthly: '', weekly: [], daily: [] };
if (!state.kanban)           state.kanban = { todo: [], doing: [], done: [] };
if (!state.shape)            state.shape = { friction: '', supports: '', environment: '', plan: '', evaluate: '' };
if (!state.brainDumpText)    state.brainDumpText = '';
if (!state.bdOutput)         state.bdOutput = null;
if (!state.bdLoading)        state.bdLoading = false;
if (!state.bdTaskInput)      state.bdTaskInput = '';
if (!state.activeRoutine)    state.activeRoutine = null;
if (!state.routineStep)      state.routineStep = 0;

// ─── Planning methodologies — each is a full tool ─────────
const METHODOLOGIES = [
  {
    k: 'masterlist',
    icon: 'ti-list-check',
    color: 'teal',
    l: 'Master List',
    sub: 'One brain dump. Anxiety down.',
    why: 'A single ongoing list captures everything so your brain stops trying to remember it. Good for chronic overwhelm and forgetting.',
  },
  {
    k: 'chunking',
    icon: 'ti-arrows-split',
    color: 'lavender',
    l: 'Chunking',
    sub: 'Big task → small actions',
    why: 'Break overwhelming tasks into tiny actionable steps. "Clean house" becomes "wash dishes, vacuum room". Good for paralysis and ambiguity.',
  },
  {
    k: 'timeblock',
    icon: 'ti-layout-grid',
    color: 'amber',
    l: 'Time Blocking',
    sub: 'Day in colour-coded chunks',
    why: 'Divide the day into specific blocks for types of activity. Reduces decision fatigue and gives the day shape.',
  },
  {
    k: 'tiered',
    icon: 'ti-stairs',
    color: 'sky',
    l: 'Tiered Goals',
    sub: 'Monthly → weekly → daily',
    why: 'A big monthly goal breaks into weekly steps, which break into daily tasks. Useful when you need to see the path from now to a long-term goal.',
  },
  {
    k: 'kanban',
    icon: 'ti-columns-3',
    color: 'sky',
    l: 'Kanban Board',
    sub: 'To-do · Doing · Done',
    why: 'Visual columns showing what is to do, in progress, and complete. Good for visual processors and people who lose track of what is in flight.',
  },
  {
    k: 'shape',
    icon: 'ti-shapes',
    color: 'peach',
    l: 'SHAPE Method',
    sub: 'Workplace planning framework',
    why: 'Source friction → Hold conversation → Assess environment → Plan → Evaluate. A structured framework for workplace adjustments.',
  },
];

// ─── Routine templates (existing) ────────────────────────
const ROUTINES = {
  morning: { l: 'Basic morning',  c: 'teal',     steps: ['Sit up', 'Drink water', 'Bathroom', 'Medication', 'Eat something', 'Get dressed', 'Check Today', 'Choose first step'] },
  leaving: { l: 'Leaving home',   c: 'sky',      steps: ['Check time', 'Check destination', 'Keys', 'Phone', 'Wallet/card', 'Headphones', 'Medication', 'Weather item', 'Shoes', 'Leave'] },
  bedtime: { l: 'Wind-down',      c: 'lavender', steps: ['Set tomorrow reminder', 'Phone away', 'Dim lights', 'Wash face', 'Drink water', 'Get into bed', 'Review today (optional)'] },
  work:    { l: 'Work start',     c: 'amber',    steps: ['Open Today', 'Check first task', 'Clear desk', 'Headphones on', 'Set first timer', 'Begin'] },
};

// ─── Main render router ──────────────────────────────────
export function renderPlan() {
  setTopbar('Plan', 'Choose how to plan today.');

  switch (state.planMode) {
    case 'masterlist':  return renderMasterList();
    case 'chunking':    return renderChunking();
    case 'timeblock':   return renderTimeBlock();
    case 'tiered':      return renderTiered();
    case 'kanban':      return renderKanban();
    case 'shape':       return renderShape();
    case 'brainDump':   return renderBrainDump();
    case 'routines':    return renderRoutineList();
    case 'routineFlow': return renderRoutineFlow();
    case 'quickAdd':    return renderQuickAdd();
    default:            return renderHome();
  }
}

// ─── HOME: methodology picker ────────────────────────────
function renderHome() {
  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="notice blue">
        <strong>How do you want to plan today?</strong><br>
        Different brains need different methods. Pick the one that fits how you feel right now.
      </div>

      <div class="section-label">Planning methodologies</div>
      ${METHODOLOGIES.map(m => `
        <button class="btn" style="border-left:5px solid var(--${m.color});text-align:left;padding:14px 16px"
                onclick="setPlanMode('${m.k}')">
          <i class="ti ${m.icon}" style="font-size:24px;color:var(--${m.color});flex-shrink:0"></i>
          <div style="flex:1">
            <div style="font-size:15px">${m.l}</div>
            <div style="font-size:12px;font-weight:400;color:var(--text-muted);margin-top:2px">${m.sub}</div>
          </div>
          <i class="ti ti-chevron-right" style="font-size:18px;color:var(--text-muted);flex-shrink:0"></i>
        </button>
      `).join('')}

      <div class="section-label">Quick tools</div>
      <button class="btn lavender" onclick="setPlanMode('brainDump')">
        <i class="ti ti-brain"></i>
        <div style="flex:1">
          <div>Brain dump</div>
          <div style="font-size:12px;font-weight:400;opacity:0.75;margin-top:2px">Get everything out, sorting comes later</div>
        </div>
      </button>
      <button class="btn sky" onclick="setPlanMode('routines')">
        <i class="ti ti-repeat"></i>
        <div style="flex:1">
          <div>Start a routine</div>
          <div style="font-size:12px;font-weight:400;opacity:0.75;margin-top:2px">Morning, bedtime, leaving home, work start</div>
        </div>
      </button>
      <button class="btn" onclick="setPlanMode('quickAdd')">
        <i class="ti ti-plus"></i>
        <div style="flex:1">
          <div>Quick add to Today</div>
          <div style="font-size:12px;font-weight:400;color:var(--text-muted);margin-top:2px">Add a single task right now</div>
        </div>
      </button>

      <!-- Neuro-inclusive strategies -->
      <div class="section-label">Strategies that help all methods</div>
      <div class="card sky">
        <div style="display:flex;gap:10px;margin-bottom:14px">
          <i class="ti ti-hourglass" style="font-size:22px;color:var(--sky);flex-shrink:0;margin-top:2px"></i>
          <div>
            <div class="card-main" style="font-size:14px;margin-bottom:4px">Buffer time</div>
            <div class="card-sub" style="line-height:1.5">Leave extra time between tasks. Transitions cost energy.</div>
          </div>
        </div>
        <div style="display:flex;gap:10px;margin-bottom:14px">
          <i class="ti ti-bell" style="font-size:22px;color:var(--sky);flex-shrink:0;margin-top:2px"></i>
          <div>
            <div class="card-main" style="font-size:14px;margin-bottom:4px">Gentle reminders</div>
            <div class="card-sub" style="line-height:1.5">Visual timers help when time blindness is real. Use Now\'s timer.</div>
          </div>
        </div>
        <div style="display:flex;gap:10px;margin-bottom:14px">
          <i class="ti ti-eye" style="font-size:22px;color:var(--sky);flex-shrink:0;margin-top:2px"></i>
          <div>
            <div class="card-main" style="font-size:14px;margin-bottom:4px">Keep it visible</div>
            <div class="card-sub" style="line-height:1.5">Out of sight = out of mind. Open tabs, sticky notes, whiteboards beat hidden apps.</div>
          </div>
        </div>
        <div style="display:flex;gap:10px">
          <i class="ti ti-leaf" style="font-size:22px;color:var(--sky);flex-shrink:0;margin-top:2px"></i>
          <div>
            <div class="card-main" style="font-size:14px;margin-bottom:4px">Stay flexible</div>
            <div class="card-sub" style="line-height:1.5">Rigid minute-by-minute plans cause anxiety when broken. Work with energy, not against it.</div>
          </div>
        </div>
      </div>
    </div>`;
}

// ─── METHOD 1: Master List ───────────────────────────────
function renderMasterList() {
  const items   = state.masterList;
  const undone  = items.filter(i => !i.done);
  const done    = items.filter(i =>  i.done);
  const byPrio  = { must: undone.filter(i => i.priority === 'must'),
                    helpful: undone.filter(i => i.priority === 'helpful'),
                    wait: undone.filter(i => i.priority === 'wait'),
                    unsorted: undone.filter(i => !i.priority) };

  document.getElementById('content').innerHTML = `
    <div class="screen">
      ${backButton()}

      <div class="card teal">
        <div class="card-label">Master List</div>
        <div class="card-main" style="font-size:16px">${items.length === 0 ? 'Start by adding anything that is on your mind.' : `${undone.length} items · ${done.length} done`}</div>
        <div class="card-sub" style="margin-top:6px">A single list captures everything so your brain stops trying to remember it.</div>
      </div>

      <!-- Add new item -->
      <div class="card" style="padding:0.85rem 1.25rem">
        <input id="ml-input" type="text" placeholder="Add anything..."
          onkeydown="if(event.key==='Enter')mlAdd()"
          style="width:100%;border:none;background:none;font-size:15px;font-family:var(--font);color:var(--text-primary);padding:8px 0;outline:none">
        <button class="btn primary" style="margin:8px 0 0;justify-content:center" onclick="mlAdd()">
          <i class="ti ti-plus"></i> Add to list
        </button>
      </div>

      ${items.length === 0 ? `
        <div class="notice blue">
          <strong>Tip.</strong> Do not filter or judge what you add. Write everything that is in your head, even tiny things. Sorting comes after.
        </div>
      ` : `
        ${byPrio.unsorted.length > 0 ? renderMasterSection('Unsorted', byPrio.unsorted, 'amber') : ''}
        ${byPrio.must.length > 0     ? renderMasterSection('Must happen today', byPrio.must, 'teal') : ''}
        ${byPrio.helpful.length > 0  ? renderMasterSection('Helpful today',     byPrio.helpful, 'sky') : ''}
        ${byPrio.wait.length > 0     ? renderMasterSection('Can wait',          byPrio.wait, 'lavender') : ''}
        ${done.length > 0            ? renderMasterDone(done) : ''}

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:1rem">
          <button class="btn" style="margin:0" onclick="mlPushAllMust()">
            <i class="ti ti-send"></i> Send "Must" to Today
          </button>
          <button class="btn" style="margin:0;color:var(--text-muted)" onclick="mlClear()">
            <i class="ti ti-trash"></i> Clear list
          </button>
        </div>
      `}
    </div>`;
}

function renderMasterSection(label, items, color) {
  return `
    <div class="section-label">${label}</div>
    <div class="card" style="padding:0.5rem 1.25rem;border-left:5px solid var(--${color})">
      ${items.map(i => `
        <div class="task-row">
          <div class="task-check" onclick="mlToggleDone(${i.id})" style="border-color:var(--${color})"></div>
          <div class="task-text" style="font-size:14px;flex:1">${i.text}</div>
          <div style="display:flex;gap:4px;flex-shrink:0">
            <button onclick="mlSetPriority(${i.id}, 'must')" title="Must today"
              style="border:none;background:${i.priority==='must'?'var(--teal-l)':'none'};color:${i.priority==='must'?'var(--teal-d)':'var(--text-muted)'};cursor:pointer;padding:4px 6px;border-radius:6px;font-size:11px;font-weight:700;font-family:var(--font)">M</button>
            <button onclick="mlSetPriority(${i.id}, 'helpful')" title="Helpful today"
              style="border:none;background:${i.priority==='helpful'?'var(--sky-l)':'none'};color:${i.priority==='helpful'?'var(--sky-d)':'var(--text-muted)'};cursor:pointer;padding:4px 6px;border-radius:6px;font-size:11px;font-weight:700;font-family:var(--font)">H</button>
            <button onclick="mlSetPriority(${i.id}, 'wait')" title="Can wait"
              style="border:none;background:${i.priority==='wait'?'var(--lavender-l)':'none'};color:${i.priority==='wait'?'var(--lavender-d)':'var(--text-muted)'};cursor:pointer;padding:4px 6px;border-radius:6px;font-size:11px;font-weight:700;font-family:var(--font)">W</button>
            <button onclick="mlDelete(${i.id})" title="Delete"
              style="border:none;background:none;color:var(--text-muted);cursor:pointer;padding:4px;border-radius:6px">
              <i class="ti ti-x" style="font-size:14px"></i>
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderMasterDone(done) {
  return `
    <div class="section-label" style="opacity:0.6">Done (${done.length})</div>
    <div class="card" style="padding:0.5rem 1.25rem;opacity:0.6">
      ${done.map(i => `
        <div class="task-row">
          <div class="task-check done" onclick="mlToggleDone(${i.id})"><i class="ti ti-check" style="font-size:14px"></i></div>
          <div class="task-text done" style="font-size:14px;flex:1">${i.text}</div>
          <button onclick="mlDelete(${i.id})" style="border:none;background:none;color:var(--text-muted);cursor:pointer;padding:4px">
            <i class="ti ti-x" style="font-size:14px"></i>
          </button>
        </div>
      `).join('')}
    </div>
  `;
}

// ─── METHOD 2: Chunking ──────────────────────────────────
function renderChunking() {
  document.getElementById('content').innerHTML = `
    <div class="screen">
      ${backButton()}

      <div class="card lavender">
        <div class="card-label">Chunking</div>
        <div class="card-main" style="font-size:16px">Break the big into the small.</div>
        <div class="card-sub" style="margin-top:6px">Bowline will break your task into Prepare → Start → Continue → Finish → Recover.</div>
      </div>

      <textarea id="bd-in" placeholder="What task feels too big? e.g. Clean the kitchen, file the tax return, reply to that email..." style="min-height:90px">${state.bdTaskInput || ''}</textarea>

      <button class="btn primary" style="margin-top:10px" onclick="doBreakdown()">
        <i class="ti ti-sparkles"></i> Break it down with AI
      </button>

      ${state.bdLoading ? `
        <div style="display:flex;align-items:center;gap:10px;padding:12px 0;justify-content:center">
          <div class="spinner"></div>
          <span style="font-size:14px;color:var(--text-secondary)">Finding the smallest first step...</span>
        </div>
      ` : ''}

      ${state.bdOutput ? `
        <div class="ai-out">${state.bdOutput}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">
          <button class="btn primary" style="margin:0" onclick="addBdFirstStepToToday()">
            <i class="ti ti-calendar-plus"></i> Add first step
          </button>
          <button class="btn" style="margin:0" onclick="addBdAllToToday()">
            <i class="ti ti-list-numbers"></i> Add all steps
          </button>
        </div>
        <button class="btn" style="margin-top:6px;color:var(--text-muted)" onclick="clearBdOutput()">
          <i class="ti ti-x"></i> Clear and try another
        </button>
      ` : ''}

      <div class="notice blue" style="margin-top:1.25rem">
        <strong>Tip.</strong> The first step does not need to be impressive. "Open the document" is a real step.
      </div>
    </div>`;
}

// ─── METHOD 3: Time Blocking ─────────────────────────────
function renderTimeBlock() {
  const hours = [];
  for (let h = 6; h <= 22; h++) hours.push(h);

  const colors = [
    { k: 'teal',     l: 'Focus' },
    { k: 'lavender', l: 'Admin' },
    { k: 'sky',      l: 'Calm/recovery' },
    { k: 'amber',    l: 'Energy' },
    { k: 'peach',    l: 'Self-care' },
  ];

  document.getElementById('content').innerHTML = `
    <div class="screen">
      ${backButton()}

      <div class="card amber">
        <div class="card-label">Time Blocking</div>
        <div class="card-main" style="font-size:16px">Give the day shape.</div>
        <div class="card-sub" style="margin-top:6px">Tap an hour to add a block. Pick a colour to match the activity type.</div>
      </div>

      <div class="card" style="padding:0.5rem 1.25rem">
        ${hours.map(h => {
          const block = state.timeBlocks.find(b => b.hour === h);
          return `
            <div class="task-row" style="align-items:center">
              <div style="font-size:13px;font-weight:700;color:var(--text-muted);width:48px;flex-shrink:0">${String(h).padStart(2,'0')}:00</div>
              ${block ? `
                <div style="flex:1;display:flex;align-items:center;gap:8px;background:var(--${block.color}-l);border-radius:8px;padding:8px 12px;border-left:4px solid var(--${block.color})">
                  <span style="font-size:14px;color:var(--${block.color}-d);font-weight:700;flex:1">${block.label}</span>
                  <button onclick="tbDelete(${h})" style="border:none;background:none;color:var(--${block.color}-d);cursor:pointer;padding:2px"><i class="ti ti-x" style="font-size:14px"></i></button>
                </div>
              ` : `
                <button onclick="tbAddPrompt(${h})" style="flex:1;text-align:left;border:1.5px dashed var(--border);background:transparent;cursor:pointer;padding:8px 12px;border-radius:8px;font-size:13px;color:var(--text-muted);font-family:var(--font)">
                  + Add a block
                </button>
              `}
            </div>
          `;
        }).join('')}
      </div>

      <div class="notice blue" style="margin-top:0.85rem">
        <strong>Tip.</strong> Leave 15-min gaps between blocks for transitions and buffer time. Most plans fall apart because they ignore transitions.
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
        <button class="btn" style="margin:0" onclick="tbAddSuggested()">
          <i class="ti ti-bulb"></i> Suggest a block
        </button>
        <button class="btn" style="margin:0;color:var(--text-muted)" onclick="tbClear()">
          <i class="ti ti-trash"></i> Clear day
        </button>
      </div>
    </div>`;
}

// ─── METHOD 4: Tiered Goals ──────────────────────────────
function renderTiered() {
  const g = state.tieredGoals;

  document.getElementById('content').innerHTML = `
    <div class="screen">
      ${backButton()}

      <div class="card sky">
        <div class="card-label">Tiered Goals</div>
        <div class="card-main" style="font-size:16px">Big goal → weekly steps → daily tasks.</div>
        <div class="card-sub" style="margin-top:6px">When you have a long-term thing that feels too far away to act on.</div>
      </div>

      <div class="section-label">This month\'s goal</div>
      <div class="card teal" style="padding:1rem 1.25rem">
        <textarea id="tg-monthly" placeholder="One sentence. What do you want to be different by the end of the month?"
          style="min-height:60px;margin-bottom:8px"
          onblur="state.tieredGoals.monthly=this.value">${g.monthly || ''}</textarea>
      </div>

      <div class="section-label">This week — break it down</div>
      ${g.weekly.map((w, i) => `
        <div class="card" style="padding:0.75rem 1rem;margin-bottom:6px;border-left:4px solid var(--lavender)">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:14px;flex:1">${w}</span>
            <button onclick="tgRemoveWeekly(${i})" style="border:none;background:none;color:var(--text-muted);cursor:pointer">
              <i class="ti ti-x" style="font-size:14px"></i>
            </button>
          </div>
        </div>
      `).join('')}
      <div class="card" style="padding:0.5rem 1rem">
        <input id="tg-weekly-input" type="text" placeholder="Add a weekly step..."
          onkeydown="if(event.key==='Enter')tgAddWeekly()"
          style="width:100%;border:none;background:none;font-size:14px;font-family:var(--font);outline:none;padding:6px 0">
        <button class="btn lavender" style="margin:6px 0 0;justify-content:center;padding:8px" onclick="tgAddWeekly()">
          <i class="ti ti-plus" style="font-size:16px"></i> Add weekly step
        </button>
      </div>

      <div class="section-label">Today — daily tasks</div>
      ${g.daily.map((d, i) => `
        <div class="card" style="padding:0.75rem 1rem;margin-bottom:6px;border-left:4px solid var(--teal)">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:14px;flex:1">${d}</span>
            <button onclick="tgPushDailyToToday(${i})" style="border:none;background:var(--teal-l);color:var(--teal-d);cursor:pointer;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:700;font-family:var(--font)">→ Today</button>
            <button onclick="tgRemoveDaily(${i})" style="border:none;background:none;color:var(--text-muted);cursor:pointer">
              <i class="ti ti-x" style="font-size:14px"></i>
            </button>
          </div>
        </div>
      `).join('')}
      <div class="card" style="padding:0.5rem 1rem">
        <input id="tg-daily-input" type="text" placeholder="Add a task for today..."
          onkeydown="if(event.key==='Enter')tgAddDaily()"
          style="width:100%;border:none;background:none;font-size:14px;font-family:var(--font);outline:none;padding:6px 0">
        <button class="btn primary" style="margin:6px 0 0;justify-content:center;padding:8px" onclick="tgAddDaily()">
          <i class="ti ti-plus" style="font-size:16px"></i> Add daily task
        </button>
      </div>

      <div class="notice blue" style="margin-top:1.25rem">
        <strong>Tip.</strong> Daily tasks should connect to weekly steps, which connect to the monthly goal. If a task does not, it might not belong here.
      </div>
    </div>`;
}

// ─── METHOD 5: Kanban Board ──────────────────────────────
function renderKanban() {
  const k = state.kanban;

  document.getElementById('content').innerHTML = `
    <div class="screen">
      ${backButton()}

      <div class="card sky">
        <div class="card-label">Kanban Board</div>
        <div class="card-main" style="font-size:16px">See where everything is at a glance.</div>
        <div class="card-sub" style="margin-top:6px">Tap → to move items across columns. Doing should only have 1-2 items.</div>
      </div>

      <!-- Add task -->
      <div class="card" style="padding:0.85rem 1rem">
        <input id="kb-input" type="text" placeholder="Add a task..."
          onkeydown="if(event.key==='Enter')kbAdd()"
          style="width:100%;border:none;background:none;font-size:15px;font-family:var(--font);outline:none;padding:8px 0">
        <button class="btn primary" style="margin:8px 0 0;justify-content:center" onclick="kbAdd()">
          <i class="ti ti-plus"></i> Add to To-do
        </button>
      </div>

      <!-- Three columns stacked vertically for mobile -->
      ${renderKanbanColumn('To do',  'todo',  k.todo,  'lavender', 'doing')}
      ${renderKanbanColumn('Doing',  'doing', k.doing, 'amber',    'done')}
      ${renderKanbanColumn('Done',   'done',  k.done,  'teal',     null)}

      ${k.doing.length > 2 ? `
        <div class="notice amber" style="margin-top:0.85rem">
          <strong>Too many in Doing.</strong> Try to keep "Doing" to 1-2 items max. Switching costs energy.
        </div>
      ` : ''}
    </div>`;
}

function renderKanbanColumn(label, key, items, color, nextCol) {
  return `
    <div class="section-label" style="display:flex;align-items:center;gap:6px">
      <span style="width:10px;height:10px;border-radius:50%;background:var(--${color})"></span>
      ${label} (${items.length})
    </div>
    ${items.length === 0 ? `
      <div class="card" style="padding:0.85rem 1rem;border-left:4px solid var(--${color})">
        <div style="font-size:13px;color:var(--text-muted)">No items.</div>
      </div>
    ` : `
      <div class="card" style="padding:0.5rem 0;border-left:4px solid var(--${color})">
        ${items.map((it, i) => `
          <div style="display:flex;align-items:center;gap:8px;padding:8px 1rem;border-bottom:1.5px solid var(--border)">
            <span style="font-size:14px;flex:1">${it}</span>
            ${nextCol ? `
              <button onclick="kbMove('${key}', '${nextCol}', ${i})"
                style="border:none;background:var(--${color}-l);color:var(--${color}-d);cursor:pointer;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:700;font-family:var(--font)">
                → ${nextCol === 'doing' ? 'Doing' : 'Done'}
              </button>
            ` : ''}
            ${key !== 'todo' ? `
              <button onclick="kbBack('${key}', ${i})"
                style="border:none;background:none;color:var(--text-muted);cursor:pointer;padding:4px"
                title="Move back">
                <i class="ti ti-arrow-left" style="font-size:14px"></i>
              </button>
            ` : ''}
            <button onclick="kbDelete('${key}', ${i})"
              style="border:none;background:none;color:var(--text-muted);cursor:pointer;padding:4px">
              <i class="ti ti-x" style="font-size:14px"></i>
            </button>
          </div>
        `).join('')}
      </div>
    `}
  `;
}

// ─── METHOD 6: SHAPE ─────────────────────────────────────
function renderShape() {
  const s = state.shape;

  const fields = [
    { k: 'friction', l: 'S — Sources of friction', icon: 'ti-alert-triangle', color: 'peach',
      placeholder: 'What is creating friction right now? e.g. noisy office, unclear briefs, back-to-back meetings...' },
    { k: 'supports', l: 'H — Holding supportive conversations', icon: 'ti-message-circle', color: 'sky',
      placeholder: 'Who could you talk to? What would you ask for? e.g. manager 1:1, occupational health...' },
    { k: 'environment', l: 'A — Assessing the environment', icon: 'ti-building', color: 'amber',
      placeholder: 'What environment changes could help? e.g. quiet room, written instructions, dimmer lights...' },
    { k: 'plan', l: 'P — Plan (focus on quick wins)', icon: 'ti-target', color: 'teal',
      placeholder: 'What is one small change you can try this week? Pick something achievable, not perfect...' },
    { k: 'evaluate', l: 'E — Evaluate', icon: 'ti-chart-line', color: 'lavender',
      placeholder: 'How will you know if it worked? What will you check in a week or month?' },
  ];

  document.getElementById('content').innerHTML = `
    <div class="screen">
      ${backButton()}

      <div class="card peach">
        <div class="card-label">SHAPE Method</div>
        <div class="card-main" style="font-size:16px">A framework for workplace adjustments.</div>
        <div class="card-sub" style="margin-top:6px">Especially useful for thinking through accommodations or planning a conversation with your manager.</div>
      </div>

      ${fields.map(f => `
        <div class="card ${f.color}">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <i class="ti ${f.icon}" style="font-size:20px;color:var(--${f.color});flex-shrink:0"></i>
            <div class="card-label" style="margin:0">${f.l}</div>
          </div>
          <textarea
            placeholder="${f.placeholder}"
            style="min-height:70px"
            onblur="state.shape['${f.k}']=this.value">${s[f.k] || ''}</textarea>
        </div>
      `).join('')}

      <div class="notice blue" style="margin-top:0.85rem">
        <strong>Quick wins first.</strong> SHAPE works best when you start small. One quick win this week beats a perfect plan you never act on.
      </div>

      <button class="btn primary" style="margin-top:8px" onclick="shapeExport()">
        <i class="ti ti-copy"></i> Copy SHAPE plan to clipboard
      </button>
    </div>`;
}

// ─── Brain Dump (kept as quick tool) ─────────────────────
function renderBrainDump() {
  document.getElementById('content').innerHTML = `
    <div class="screen">
      ${backButton()}

      <div class="card lavender">
        <div class="card-label">Brain Dump</div>
        <div class="card-main" style="font-size:16px">Get it out of your head first.</div>
        <div class="card-sub" style="margin-top:6px">Write anything. Do not filter. Sorting comes after.</div>
      </div>

      <textarea id="dump-in" placeholder="Email Alex, book appointment, laundry, eat, fill form, reply to message, mum's birthday, that thing I forgot..."
        style="min-height:200px"
        oninput="state.brainDumpText=this.value">${state.brainDumpText || ''}</textarea>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
        <button class="btn primary" style="margin:0" onclick="dumpToMasterList()">
          <i class="ti ti-list-check"></i> Send to Master List
        </button>
        <button class="btn sky" style="margin:0" onclick="dumpSort()">
          <i class="ti ti-sort-ascending"></i> Sort items
        </button>
      </div>

      <div class="notice blue" style="margin-top:0.85rem">
        <strong>Tip.</strong> A brain dump is messy on purpose. Send it to the Master List when done — that is where it becomes a real plan.
      </div>
    </div>`;
}

// ─── Routine list and flow ───────────────────────────────
function renderRoutineList() {
  document.getElementById('content').innerHTML = `
    <div class="screen">
      ${backButton()}

      <div class="card sky">
        <div class="card-label">Routines</div>
        <div class="card-main" style="font-size:16px">Step-by-step sequences for familiar moments.</div>
      </div>

      ${Object.entries(ROUTINES).map(([k, r]) => `
        <div class="card ${r.c}" style="margin-bottom:10px">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div>
              <div class="card-main" style="font-size:16px">${r.l}</div>
              <div class="card-sub">${r.steps.length} steps</div>
            </div>
            <button class="btn primary" style="width:auto;margin:0;padding:10px 18px;font-size:14px" onclick="startRoutine('${k}')">
              Start
            </button>
          </div>
        </div>
      `).join('')}
    </div>`;
}

function renderRoutineFlow() {
  const r = ROUTINES[state.activeRoutine];
  if (!r) { state.planMode = 'routines'; renderPlan(); return; }

  const step = state.routineStep;
  if (step >= r.steps.length) {
    document.getElementById('content').innerHTML = `
      <div class="screen">
        <div class="notice green" style="text-align:center;padding:1.5rem">
          <i class="ti ti-circle-check" style="font-size:32px;color:var(--teal);display:block;margin-bottom:8px"></i>
          <div style="font-size:18px;font-weight:700;margin-bottom:6px">Routine complete.</div>
          <div>Well done. Restart from any step or return to Today.</div>
        </div>
        <button class="btn primary" onclick="state.planMode='home';state.activeRoutine=null;go('today')">Back to Today</button>
        <button class="btn" onclick="state.routineStep=0;renderPlan()">Restart this routine</button>
      </div>`;
    return;
  }

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="notice blue">Step ${step + 1} of ${r.steps.length}</div>
      <div class="card teal">
        <div class="card-label">${r.l}</div>
        <div class="card-main">${r.steps[step]}</div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${(step / r.steps.length) * 100}%"></div>
      </div>
      <button class="btn primary" onclick="state.routineStep++;renderPlan()">
        <i class="ti ti-check"></i> Done — next step
      </button>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <button class="btn" style="margin:0" onclick="state.routineStep=Math.max(0,state.routineStep-1);renderPlan()">
          <i class="ti ti-arrow-left"></i> Back
        </button>
        <button class="btn" style="margin:0" onclick="state.routineStep++;renderPlan()">
          <i class="ti ti-skip-forward"></i> Skip
        </button>
      </div>
      <button class="btn" style="color:var(--text-muted)" onclick="state.planMode='routines';state.activeRoutine=null;state.routineStep=0;renderPlan()">
        End routine
      </button>
    </div>`;
}

// ─── Quick add (single task) ─────────────────────────────
function renderQuickAdd() {
  document.getElementById('content').innerHTML = `
    <div class="screen">
      ${backButton()}

      <div class="card teal">
        <div class="card-label">Quick add</div>
        <div class="card-main" style="font-size:16px">Add one task to Today.</div>
      </div>

      <div class="card">
        <input id="qa-input" type="text" placeholder="What needs to happen?"
          onkeydown="if(event.key==='Enter')qaAdd()"
          style="width:100%;border:2px solid var(--border);border-radius:var(--r-md);padding:0.85rem;font-size:15px;font-family:var(--font);outline:none;margin-bottom:10px">
        <div class="section-label" style="margin-top:0">Energy needed</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px">
          <button class="mood-btn" id="qa-low" onclick="qaSetEnergy('low')">Low</button>
          <button class="mood-btn" id="qa-med" onclick="qaSetEnergy('med')">Medium</button>
          <button class="mood-btn" id="qa-high" onclick="qaSetEnergy('high')">High</button>
        </div>
        <button class="btn primary" style="margin:0" onclick="qaAdd()">
          <i class="ti ti-plus"></i> Add to Today
        </button>
      </div>
    </div>`;
}

// ─── Helpers ──────────────────────────────────────────────
function backButton() {
  return `
    <button class="btn" style="margin-bottom:10px;color:var(--text-muted)" onclick="setPlanMode('home')">
      <i class="ti ti-arrow-left"></i> All planning tools
    </button>`;
}

// ─── Window handlers — generic ────────────────────────────
window.setPlanMode = function (m) {
  state.planMode = m;
  renderPlan();
};

// ─── Master List handlers ─────────────────────────────────
window.mlAdd = function () {
  const input = document.getElementById('ml-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  state.masterList.push({ id: Date.now(), text, priority: null, done: false });
  input.value = '';
  renderPlan();
  setTimeout(() => document.getElementById('ml-input')?.focus(), 50);
};

window.mlToggleDone = function (id) {
  const item = state.masterList.find(i => i.id === id);
  if (item) item.done = !item.done;
  renderPlan();
};

window.mlSetPriority = function (id, p) {
  const item = state.masterList.find(i => i.id === id);
  if (item) item.priority = item.priority === p ? null : p;
  renderPlan();
};

window.mlDelete = function (id) {
  state.masterList = state.masterList.filter(i => i.id !== id);
  renderPlan();
};

window.mlPushAllMust = function () {
  const musts = state.masterList.filter(i => i.priority === 'must' && !i.done);
  if (musts.length === 0) { alert('No items marked "Must" yet. Tap M next to an item.'); return; }
  musts.forEach(i => {
    state.tasks.push({ id: Date.now() + Math.random(), text: i.text, meta: 'Master List · Must today', color: 'teal', done: false });
  });
  alert(`Sent ${musts.length} items to Today.`);
};

window.mlClear = function () {
  if (confirm('Clear the entire Master List? Items already in Today will stay.')) {
    state.masterList = [];
    renderPlan();
  }
};

// ─── Chunking handlers ────────────────────────────────────
window.doBreakdown = async function () {
  const v = (document.getElementById('bd-in')?.value || state.bdTaskInput || '').trim();
  if (!v) return;
  state.bdTaskInput = v;
  state.bdLoading = true;
  state.bdOutput = null;
  renderPlan();
  try {
    state.bdOutput = await callClaude('Break down this task: ' + v, BREAKDOWN_SYSTEM);
  } catch (e) {
    state.bdOutput = 'AI is not available right now. Try writing the steps yourself: what is the smallest first step you could take in the next 5 minutes?';
  }
  state.bdLoading = false;
  renderPlan();
};

window.addBdFirstStepToToday = function () {
  if (!state.bdOutput) return;
  const firstLine = state.bdOutput.split('\n').find(l => l.match(/^\d/));
  if (firstLine) {
    state.tasks.unshift({
      id: Date.now(),
      text: firstLine.replace(/^\d+[.)]\s*/, ''),
      meta: 'Chunked task · Low energy',
      color: 'lavender', done: false,
    });
    alert('First step added to Today.');
  }
};

window.addBdAllToToday = function () {
  if (!state.bdOutput) return;
  const lines = state.bdOutput.split('\n').filter(l => /^\d/.test(l.trim()));
  lines.forEach((line, i) => {
    state.tasks.push({
      id: Date.now() + i,
      text: line.replace(/^\d+[.)]\s*/, ''),
      meta: 'Chunked task · Low energy',
      color: 'lavender', done: false,
    });
  });
  alert(`Added ${lines.length} steps to Today.`);
};

window.clearBdOutput = function () {
  state.bdOutput = null;
  state.bdTaskInput = '';
  renderPlan();
};

// ─── Time Block handlers ──────────────────────────────────
window.tbAddPrompt = function (hour) {
  const label = prompt('What is this hour for? (e.g. Focus on report, Lunch, Walk)');
  if (!label) return;
  const colors = ['teal', 'lavender', 'sky', 'amber', 'peach'];
  const colorChoice = prompt('Colour? Type one of: focus, admin, calm, energy, self-care', 'focus');
  const map = { focus: 'teal', admin: 'lavender', calm: 'sky', energy: 'amber', 'self-care': 'peach' };
  const color = map[colorChoice?.toLowerCase()] || 'teal';
  state.timeBlocks.push({ id: Date.now(), hour, label, color });
  renderPlan();
};

window.tbAddSuggested = function () {
  const suggestions = [
    { hour: 9,  label: 'Focus block',   color: 'teal' },
    { hour: 10, label: 'Buffer',         color: 'sky' },
    { hour: 11, label: 'Admin',          color: 'lavender' },
    { hour: 13, label: 'Lunch + walk',   color: 'peach' },
    { hour: 14, label: 'Focus block',    color: 'teal' },
    { hour: 16, label: 'Wrap-up',        color: 'amber' },
  ];
  const empty = suggestions.find(s => !state.timeBlocks.find(b => b.hour === s.hour));
  if (empty) {
    state.timeBlocks.push({ ...empty, id: Date.now() });
    renderPlan();
  } else {
    alert('Your day already has all the suggested blocks.');
  }
};

window.tbDelete = function (hour) {
  state.timeBlocks = state.timeBlocks.filter(b => b.hour !== hour);
  renderPlan();
};

window.tbClear = function () {
  if (confirm('Clear all time blocks?')) {
    state.timeBlocks = [];
    renderPlan();
  }
};

// ─── Tiered Goals handlers ────────────────────────────────
window.tgAddWeekly = function () {
  const input = document.getElementById('tg-weekly-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  state.tieredGoals.weekly.push(text);
  input.value = '';
  renderPlan();
};

window.tgRemoveWeekly = function (i) {
  state.tieredGoals.weekly.splice(i, 1);
  renderPlan();
};

window.tgAddDaily = function () {
  const input = document.getElementById('tg-daily-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  state.tieredGoals.daily.push(text);
  input.value = '';
  renderPlan();
};

window.tgRemoveDaily = function (i) {
  state.tieredGoals.daily.splice(i, 1);
  renderPlan();
};

window.tgPushDailyToToday = function (i) {
  const text = state.tieredGoals.daily[i];
  if (!text) return;
  state.tasks.push({
    id: Date.now(),
    text,
    meta: 'Tiered goal · Daily',
    color: 'sky', done: false,
  });
  state.tieredGoals.daily.splice(i, 1);
  renderPlan();
};

// ─── Kanban handlers ──────────────────────────────────────
window.kbAdd = function () {
  const input = document.getElementById('kb-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  state.kanban.todo.push(text);
  input.value = '';
  renderPlan();
  setTimeout(() => document.getElementById('kb-input')?.focus(), 50);
};

window.kbMove = function (fromCol, toCol, idx) {
  const item = state.kanban[fromCol].splice(idx, 1)[0];
  state.kanban[toCol].push(item);
  renderPlan();
};

window.kbBack = function (col, idx) {
  const back = col === 'done' ? 'doing' : col === 'doing' ? 'todo' : null;
  if (!back) return;
  const item = state.kanban[col].splice(idx, 1)[0];
  state.kanban[back].push(item);
  renderPlan();
};

window.kbDelete = function (col, idx) {
  state.kanban[col].splice(idx, 1);
  renderPlan();
};

// ─── SHAPE handlers ───────────────────────────────────────
window.shapeExport = function () {
  const s = state.shape;
  const text = [
    'SHAPE plan',
    '',
    'Sources of friction:',
    s.friction || '(empty)',
    '',
    'Holding supportive conversations:',
    s.supports || '(empty)',
    '',
    'Assessing the environment:',
    s.environment || '(empty)',
    '',
    'Plan (quick wins):',
    s.plan || '(empty)',
    '',
    'Evaluate:',
    s.evaluate || '(empty)',
  ].join('\n');

  navigator.clipboard.writeText(text).catch(() => {});
  alert('SHAPE plan copied to clipboard.');
};

// ─── Brain Dump handlers ──────────────────────────────────
window.dumpToMasterList = function () {
  const text = (document.getElementById('dump-in')?.value || state.brainDumpText || '').trim();
  if (!text) return;
  const items = text.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
  items.forEach(t => state.masterList.push({ id: Date.now() + Math.random(), text: t, priority: null, done: false }));
  state.brainDumpText = '';
  state.planMode = 'masterlist';
  renderPlan();
};

window.dumpSort = function () {
  const text = (document.getElementById('dump-in')?.value || state.brainDumpText || '').trim();
  if (!text) { alert('Write something first.'); return; }
  // Same as dumpToMasterList but stays on the same screen logic
  window.dumpToMasterList();
};

// ─── Routine handlers ─────────────────────────────────────
window.startRoutine = function (k) {
  state.activeRoutine = k;
  state.routineStep   = 0;
  state.planMode      = 'routineFlow';
  renderPlan();
};

// ─── Quick Add handlers ───────────────────────────────────
let qaEnergy = 'med';
window.qaSetEnergy = function (e) {
  qaEnergy = e;
  ['qa-low', 'qa-med', 'qa-high'].forEach(id => document.getElementById(id)?.classList.remove('sel'));
  document.getElementById('qa-' + e)?.classList.add('sel');
};

window.qaAdd = function () {
  const input = document.getElementById('qa-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  const energyMeta = { low: 'Low energy · 5 min', med: 'Medium energy · 10 min', high: 'High energy · 30+ min' };
  const colorMap = { low: 'teal', med: 'sky', high: 'amber' };
  state.tasks.push({
    id: Date.now(),
    text,
    meta: energyMeta[qaEnergy],
    color: colorMap[qaEnergy],
    done: false,
  });
  input.value = '';
  state.planMode = 'home';
  go('today');
};

register('plan', renderPlan);
