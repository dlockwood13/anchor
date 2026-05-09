import { state } from '../../data/state.js';
import { setTopbar, go } from '../../app/router.js';

const MOODS = ['Clear', 'Foggy', 'Tired', 'Anxious', 'Overstimulated', 'Burnt out', 'In pain', 'Not sure'];

export function renderToday() {
  setTopbar('Today', 'A calmer way through your day.');

  const undone = state.tasks.filter(t => !t.done);
  const done = state.tasks.filter(t => t.done);
  const cur = undone[0];
  const foggy = ['Foggy', 'Tired', 'Burnt out'].includes(state.mood);

  document.getElementById('content').innerHTML = `
    <div class="screen">
      ${!state.mood ? `
        <div class="card">
          <div class="card-title">How are you starting today?</div>
          <div class="mood-strip">
            ${MOODS.map(m => `<button class="mood-btn" onclick="setMood('${m}')">${m}</button>`).join('')}
          </div>
        </div>
      ` : `
        <div class="notice">
          You marked <strong>${state.mood}</strong>.
          ${foggy ? 'Showing essentials first. The plan can change.' : 'Here is what matters today.'}
        </div>
      `}

      ${state.mood === 'Overstimulated' ? `
        <div class="notice amber">
          Would you like a reset before starting?
          <br>
          <button class="btn soft" style="margin-top:8px;margin-bottom:0" onclick="go('reset')">
            <i class="ti ti-refresh"></i> Open reset
          </button>
        </div>
      ` : ''}

      <div class="section-label">Now</div>
      <div class="card">
        <div class="card-title">Current step</div>
        <div class="card-main">${cur ? cur.text : 'All done for now.'}</div>
        ${cur ? `<div class="card-sub">${cur.meta}</div>` : ''}
        ${cur ? `
          <button class="btn primary" style="margin-top:0.75rem;margin-bottom:0" onclick="go('now')">
            <i class="ti ti-player-play"></i> Start this
          </button>
        ` : ''}
      </div>

      <div class="section-label">Your anchors</div>
      <div class="card" style="padding:0.5rem 1.25rem">
        ${undone.map(t => `
          <div class="task-row">
            <div class="task-check${t.done ? ' done' : ''}" onclick="toggleTask(${t.id})">
              ${t.done ? '<i class="ti ti-check" style="font-size:12px"></i>' : ''}
            </div>
            <div style="flex:1">
              <div class="task-text${t.done ? ' done' : ''}">${t.text}</div>
              <div class="task-meta">${t.meta}</div>
            </div>
          </div>
        `).join('')}
        ${done.length ? done.map(t => `
          <div class="task-row" style="opacity:0.5">
            <div class="task-check done"><i class="ti ti-check" style="font-size:12px"></i></div>
            <div class="task-text done">${t.text}</div>
          </div>
        `).join('') : ''}
      </div>

      <div class="section-label">Later</div>
      <div class="card">
        <div class="card-main" style="font-size:15px">Appointment at 3:00 PM</div>
        <div class="card-sub">Leave at 2:20 PM · Bring ID</div>
        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
          <span class="tag amber"><i class="ti ti-clock" style="font-size:13px"></i> 3:00 PM</span>
          <span class="tag green">Leave 2:20 PM</span>
        </div>
      </div>

      <div class="section-label" style="margin-bottom:0.75rem">Quick actions</div>
      <button class="btn" onclick="go('tldr')"><i class="ti ti-message-2"></i> Understand a message</button>
      <button class="btn" onclick="go('reset')"><i class="ti ti-refresh"></i> I need a reset first</button>
      <button class="btn" onclick="showEssentials()"><i class="ti ti-minimize"></i> Show essentials only</button>
    </div>`;
}

window.setMood = (m) => { state.mood = m; renderToday(); };

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
