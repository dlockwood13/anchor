import { state, ACCENT } from '../../data/state.js';
import { register, setTopbar, go } from '../../app/router.js';

const MOODS = [
  { l: 'Clear',         cls: '' },
  { l: 'Foggy',         cls: 'foggy' },
  { l: 'Tired',         cls: 'tired' },
  { l: 'Anxious',       cls: 'anxious' },
  { l: 'Overstimulated',cls: 'over' },
  { l: 'Burnt out',     cls: 'tired' },
  { l: 'In pain',       cls: 'peach' },
  { l: 'Not sure',      cls: '' },
];

const MOOD_NOTICE = {
  foggy:   'purple',
  tired:   'blue',
  anxious: 'amber',
  over:    'peach',
};

export function renderToday() {
  setTopbar('Today', 'A calmer way through your day');

  const undone = state.tasks.filter(t => !t.done);
  const done   = state.tasks.filter(t =>  t.done);
  const cur    = undone[0];
  const foggy  = ['Foggy', 'Tired', 'Burnt out'].includes(state.mood);

  document.getElementById('content').innerHTML = `
    <div class="screen">
      ${!state.mood ? `
        <div class="card teal">
          <div class="card-label">How are you starting today?</div>
          <div class="mood-grid">
            ${MOODS.map(m => `
              <button class="mood-btn ${m.cls}" onclick="setMood('${m.l}','${m.cls}')">
                ${m.l}
              </button>`).join('')}
          </div>
        </div>
      ` : `
        <div class="notice ${state.moodColor || 'green'}">
          You marked <strong>${state.mood}</strong>.
          ${foggy ? 'Showing essentials first. The plan can change.' : 'Here is what matters today.'}
        </div>
      `}

      ${state.mood === 'Overstimulated' ? `
        <div class="notice peach">
          <strong>Your body may need a reset first.</strong><br>
          No pressure to start tasks yet.
          <br>
          <button class="btn peach" style="margin-top:10px;margin-bottom:0" onclick="go('reset')">
            <i class="ti ti-refresh"></i> Open reset
          </button>
        </div>
      ` : ''}

      <div class="section-label">
        <i class="ti ti-bolt" style="color:var(--teal);font-size:14px" aria-hidden="true"></i> Now
      </div>

      <div class="card teal">
        <div class="card-label">Your next step</div>
        <div class="card-main">${cur ? cur.text : 'All done for now. Rest is valid.'}</div>
        ${cur ? `<div class="card-sub">${cur.meta}</div>` : ''}
        ${cur ? `
          <button class="btn primary" style="margin-top:12px;margin-bottom:0" onclick="go('now')">
            <i class="ti ti-player-play"></i> Start this
          </button>
        ` : ''}
      </div>

      <div class="section-label">
        <i class="ti ti-list" style="color:var(--lavender);font-size:14px" aria-hidden="true"></i> Your anchors
      </div>

      <div class="card" style="padding:0.5rem 1.25rem">
        ${undone.map(t => `
          <div class="task-row">
            <div class="task-check${t.done ? ' done' : ''}"
              style="${!t.done ? `border-color:${ACCENT[t.color] || '#d3d1c7'}` : ''}"
              onclick="toggleTask(${t.id})">
              ${t.done ? '<i class="ti ti-check" style="font-size:14px"></i>' : ''}
            </div>
            <div style="flex:1">
              <div class="task-text${t.done ? ' done' : ''}">${t.text}</div>
              <div class="task-meta">${t.meta}</div>
            </div>
            <span style="width:6px;height:6px;border-radius:50%;background:${ACCENT[t.color] || '#888780'};flex-shrink:0;margin-top:8px"></span>
          </div>
        `).join('')}
        ${done.map(t => `
          <div class="task-row" style="opacity:0.45">
            <div class="task-check done"><i class="ti ti-check" style="font-size:14px"></i></div>
            <div class="task-text done">${t.text}</div>
          </div>
        `).join('')}
      </div>

      <div class="section-label">
        <i class="ti ti-clock" style="color:var(--amber);font-size:14px" aria-hidden="true"></i> Later today
      </div>

      <div class="card amber">
        <div class="card-main" style="font-size:16px">Appointment at 3:00 PM</div>
        <div class="card-sub">Leave at 2:20 PM · Bring ID</div>
        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
          <span class="tag amber"><i class="ti ti-clock" style="font-size:12px"></i> Leave 2:20 PM</span>
          <span class="tag purple"><i class="ti ti-id" style="font-size:12px"></i> Bring ID</span>
        </div>
      </div>

      <div class="section-label">Quick actions</div>
      <button class="btn sky"       onclick="go('tldr')">     <i class="ti ti-message-2"></i> Understand a message</button>
      <button class="btn lavender"  onclick="go('reset')">    <i class="ti ti-refresh"></i>   I need a reset first</button>
      <button class="btn amber-btn" onclick="showEssentials()"><i class="ti ti-minimize"></i>  Show essentials only</button>
    </div>`;
}

window.setMood = (m, cls) => {
  state.mood      = m;
  state.moodColor = MOOD_NOTICE[cls] || 'green';
  renderToday();
};

window.toggleTask = (id) => {
  const t = state.tasks.find(t => t.id === id);
  if (t) t.done = !t.done;
  renderToday();
};

window.showEssentials = () => {
  state.tasks = state.tasks.filter(t =>
    t.meta.includes('Essentials') || t.text.includes('Appointment')
  );
  renderToday();
};

register('today', renderToday);
