import { state, ACCENT } from '../../data/state.js';
import { register, setTopbar, go } from '../../app/router.js';

// Save the original task list so essentials mode can be reversed
if (!state._originalTasks) state._originalTasks = null;
if (state.essentialsMode === undefined) state.essentialsMode = false;
if (!state.moodLog) state.moodLog = [];

// 12 moods, each with compassionate support content
const MOODS = [
  {
    k: 'clear', l: 'Clear', icon: 'ti-sun', color: 'teal',
    message: 'Good day to begin. Use the energy gently.',
    suggestions: [
      'Do the harder task first while capacity is high',
      'Plan tomorrow before this clarity fades',
      'Take a 5-minute break before context switching',
    ],
    ctaText: 'See my anchors', ctaIcon: 'ti-list', ctaAction: 'today',
  },
  {
    k: 'foggy', l: 'Foggy', icon: 'ti-cloud', color: 'lavender',
    message: 'Brain feels slow today. That is OK. Show essentials first.',
    suggestions: [
      'Drink water — dehydration deepens fog',
      'Eat something within 30 minutes if you have not',
      'Choose one task only, not three',
      'Body doubling can help when starting feels impossible',
    ],
    ctaText: 'Switch to essentials', ctaIcon: 'ti-minimize', ctaAction: 'essentials',
  },
  {
    k: 'tired', l: 'Tired', icon: 'ti-moon', color: 'sky',
    message: 'Tired brains cannot push through. They can only do less.',
    suggestions: [
      'Today is a smaller day. The plan can change',
      'Move 1-2 tasks to tomorrow now, before they nag',
      'Schedule recovery time after anything draining',
      'Rest is a valid use of today',
    ],
    ctaText: 'Switch to essentials', ctaIcon: 'ti-minimize', ctaAction: 'essentials',
  },
  {
    k: 'anxious', l: 'Anxious', icon: 'ti-wind', color: 'amber',
    message: 'Anxiety adds noise. Reducing the noise comes before the task.',
    suggestions: [
      'Slow exhales: 4 rounds, longer out-breath than in',
      'Feet flat on the floor. Notice 3 things you can see',
      'Do not check email or messages for the next 20 minutes',
      'A reset takes 5 minutes. The task will still be here',
    ],
    ctaText: 'Open anxiety reset', ctaIcon: 'ti-refresh', ctaAction: 'reset:anxiety',
  },
  {
    k: 'over', l: 'Overstimulated', icon: 'ti-volume-3', color: 'peach',
    message: 'Your senses are full. Reduce input before doing anything else.',
    suggestions: [
      'Lower brightness, headphones on, away from noise',
      'Loosen anything tight on your body',
      'No new tasks for the next hour, only what is critical',
      'A sensory reset takes 10 minutes',
    ],
    ctaText: 'Open sensory reset', ctaIcon: 'ti-refresh', ctaAction: 'reset:over',
  },
  {
    k: 'burnt', l: 'Burnt out', icon: 'ti-flame', color: 'peach',
    message: 'Burnout is real. Today is for survival, not output.',
    suggestions: [
      'Drop everything non-essential, even things you committed to',
      'Tell one person you trust that you are struggling',
      'Eat, drink water, sleep. That is the whole list',
      'Burnout recovery takes weeks. Today is one of those days',
    ],
    ctaText: 'Switch to essentials', ctaIcon: 'ti-minimize', ctaAction: 'essentials',
  },
  {
    k: 'pain', l: 'In pain', icon: 'ti-bandage', color: 'lavender',
    message: 'Pain reduces capacity. That is a fact, not a setting.',
    suggestions: [
      'Take any medication you need',
      'Get comfortable, set yourself up properly',
      'Today is smaller. Drop tasks freely',
      'Tell someone you are struggling, just to be witnessed',
    ],
    ctaText: 'Open pain reset', ctaIcon: 'ti-refresh', ctaAction: 'reset:pain',
  },
  {
    k: 'sad', l: 'Low or sad', icon: 'ti-mood-sad', color: 'sky',
    message: 'Sadness is information. Today can hold it.',
    suggestions: [
      'You do not need to feel productive to be OK',
      'Go outside for 5 minutes if you can',
      'Reach out to one person, even just to say hi',
      'A reduced day is still a valid day',
    ],
    ctaText: 'See my anchors', ctaIcon: 'ti-list', ctaAction: 'today',
  },
  {
    k: 'angry', l: 'Angry', icon: 'ti-flame', color: 'amber',
    message: 'Anger is data. Something feels wrong or unfair.',
    suggestions: [
      'Do not reply to anyone for the next 10 minutes',
      'Move your body: pace, stretch, anything physical',
      'Name specifically what is making you angry',
      'The reply you write after cooling down will be better',
    ],
    ctaText: 'Open anger reset', ctaIcon: 'ti-refresh', ctaAction: 'reset:anger',
  },
  {
    k: 'shut', l: 'Shut down', icon: 'ti-moon', color: 'sky',
    message: 'Shutdown is your system protecting you. Do not push.',
    suggestions: [
      'Essentials only: water, food, somewhere quiet',
      'No decisions today. Decision-making is offline',
      'Cancel what you can. Tell people you need quiet',
      'Recovery can take hours or days. Both are normal',
    ],
    ctaText: 'Open shutdown reset', ctaIcon: 'ti-refresh', ctaAction: 'reset:shutdown',
  },
  {
    k: 'wired', l: 'Wired', icon: 'ti-bolt', color: 'amber',
    message: 'Lots of energy but no focus. Channel it before it crashes.',
    suggestions: [
      'Move your body first: 5 minutes of walking helps',
      'Pick the most physical task you have',
      'Body doubling locks scattered energy into one thing',
      'Caffeine probably will not help right now',
    ],
    ctaText: 'Try the next step', ctaIcon: 'ti-player-play', ctaAction: 'now',
  },
  {
    k: 'notsure', l: 'Not sure', icon: 'ti-question-mark', color: 'teal',
    message: 'Not sure is a valid mood. Let us check the basics.',
    suggestions: [
      'When did you last drink water?',
      'When did you last eat?',
      'How much sleep did you get?',
      'When did you last go outside?',
    ],
    ctaText: 'Run a basics check', ctaIcon: 'ti-refresh', ctaAction: 'reset:unknown',
  },
];

// ─── Main render ──────────────────────────────────────────
export function renderToday() {
  setTopbar('Today', 'A calmer way through your day');

  // Mood not yet selected → show mood picker
  if (!state.mood) return renderMoodPicker();

  // Mood selected → show mood-aware Today
  renderTodayView();
}

// ─── Mood picker ──────────────────────────────────────────
function renderMoodPicker() {
  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="card teal">
        <div class="card-label">How are you starting today?</div>
        <div class="card-sub" style="margin-top:6px;margin-bottom:12px">
          Pick whatever fits. There is no wrong answer, and you can change it later.
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
          ${MOODS.map(m => `
            <button class="mood-btn"
              onclick="setMood('${m.k}')"
              style="display:flex;flex-direction:column;gap:4px;padding:14px 6px">
              <i class="ti ${m.icon}" style="font-size:22px;color:var(--${m.color})"></i>
              <span style="font-size:12px">${m.l}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="notice green" style="margin-top:14px">
        <strong>Why we ask.</strong> Bowline adjusts what you see based on how you feel.
        The plan you need on a clear day is not the plan you need on a hard one.
      </div>
    </div>`;
}

// ─── Mood-aware Today view ────────────────────────────────
function renderTodayView() {
  const mood = MOODS.find(m => m.k === state.mood);
  if (!mood) { state.mood = null; renderToday(); return; }

  const undone = state.tasks.filter(t => !t.done);
  const done   = state.tasks.filter(t =>  t.done);
  const cur    = undone[0];

  document.getElementById('content').innerHTML = `
    <div class="screen">

      <!-- Mood card with full support -->
      <div class="card ${mood.color}">
        <div style="display:flex;align-items:flex-start;gap:12px">
          <i class="ti ${mood.icon}" style="font-size:28px;color:var(--${mood.color});flex-shrink:0"></i>
          <div style="flex:1">
            <div class="card-label">Today you are</div>
            <div class="card-main">${mood.l}</div>
            <div class="card-sub" style="margin-top:6px;line-height:1.6">${mood.message}</div>
          </div>
          <button onclick="changeMood()"
            style="border:none;background:none;cursor:pointer;color:var(--text-muted);padding:4px;flex-shrink:0"
            aria-label="Change mood">
            <i class="ti ti-pencil" style="font-size:18px"></i>
          </button>
        </div>

        <!-- Suggestions for this mood -->
        <div style="margin-top:14px;padding-top:14px;border-top:1.5px solid var(--border)">
          <div class="card-label" style="margin-bottom:8px">Suggestions for today</div>
          ${mood.suggestions.map(s => `
            <div style="display:flex;gap:8px;align-items:flex-start;padding:6px 0">
              <i class="ti ti-point" style="color:var(--${mood.color});font-size:18px;flex-shrink:0;margin-top:2px"></i>
              <div style="font-size:14px;line-height:1.5">${s}</div>
            </div>
          `).join('')}
        </div>

        <!-- Mood CTA -->
        <button class="btn primary" style="margin-top:14px;margin-bottom:0" onclick="handleMoodCta('${mood.ctaAction}')">
          <i class="ti ${mood.ctaIcon}"></i> ${mood.ctaText}
        </button>
      </div>

      ${state.essentialsMode ? `
        <div class="notice amber" style="margin-bottom:0.85rem">
          <strong>Essentials mode is on.</strong> Showing reduced task list.
          <button onclick="exitEssentials()"
            style="border:none;background:none;cursor:pointer;color:var(--amber-d);font-weight:700;text-decoration:underline;margin-top:6px;padding:0;font-family:var(--font);font-size:13px">
            Show all tasks again
          </button>
        </div>
      ` : ''}

      ${renderMoodHistory()}

      <!-- Current step -->
      <div class="section-label">
        <i class="ti ti-bolt" style="color:var(--teal);font-size:14px"></i> Now
      </div>
      <div class="card teal">
        <div class="card-label">Your next step</div>
        <div class="card-main">${cur ? cur.text : 'All done for now. Rest is valid.'}</div>
        ${cur ? `
          <div class="card-sub">${cur.meta}</div>
          <button class="btn primary" style="margin-top:12px;margin-bottom:0" onclick="go('now')">
            <i class="ti ti-player-play"></i> Start this
          </button>
        ` : ''}
      </div>

      <!-- Task list -->
      <div class="section-label">
        <i class="ti ti-list" style="color:var(--lavender);font-size:14px"></i> Your anchors
      </div>
      ${state.tasks.length === 0 ? `
        <div class="card">
          <div class="card-sub" style="text-align:center;padding:1rem 0">
            No tasks yet. Add some in Plan.
          </div>
        </div>
      ` : `
        <div class="card" style="padding:0.5rem 1.25rem">
          ${undone.map(t => `
            <div class="task-row">
              <div class="task-check"
                style="border-color:${ACCENT[t.color] || '#d3d1c7'}"
                onclick="toggleTask(${t.id})"></div>
              <div style="flex:1">
                <div class="task-text">${t.text}</div>
                <div class="task-meta">${t.meta}</div>
              </div>
              <span style="width:6px;height:6px;border-radius:50%;background:${ACCENT[t.color] || '#888780'};margin-top:8px;flex-shrink:0"></span>
            </div>
          `).join('')}
          ${done.map(t => `
            <div class="task-row" style="opacity:0.45">
              <div class="task-check done" onclick="toggleTask(${t.id})"><i class="ti ti-check" style="font-size:14px"></i></div>
              <div class="task-text done">${t.text}</div>
            </div>
          `).join('')}
        </div>
      `}

      <!-- Quick actions -->
      <div class="section-label">Quick actions</div>
      <button class="btn sky" onclick="go('tldr')"><i class="ti ti-message-2"></i> Understand a message</button>
      <button class="btn lavender" onclick="go('reset')"><i class="ti ti-refresh"></i> I need a reset first</button>
      <button class="btn" onclick="go('plan')"><i class="ti ti-plus"></i> Add a task</button>
      ${!state.essentialsMode ? `
        <button class="btn amber-btn" onclick="enableEssentials()"><i class="ti ti-minimize"></i> Show essentials only</button>
      ` : ''}
    </div>`;
}

// ─── Mood history (last 7 days) ────────────────────────────
function renderMoodHistory() {
  if (state.moodLog.length < 2) return '';
  const recent = state.moodLog.slice(-7);
  return `
    <div class="section-label">
      <i class="ti ti-chart-line" style="color:var(--sky);font-size:14px"></i> Recent moods
    </div>
    <div class="card" style="padding:1rem 1.25rem">
      <div style="display:flex;gap:6px;align-items:flex-end">
        ${recent.map(entry => {
          const m = MOODS.find(mm => mm.k === entry.mood);
          if (!m) return '';
          return `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
              <div style="width:28px;height:28px;border-radius:6px;background:var(--${m.color}-l);display:flex;align-items:center;justify-content:center" title="${entry.date} — ${m.l}">
                <i class="ti ${m.icon}" style="font-size:15px;color:var(--${m.color})"></i>
              </div>
              <div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">${entry.short}</div>
            </div>`;
        }).join('')}
      </div>
      ${state.moodLog.length >= 3 ? `
        <div style="font-size:12px;color:var(--text-secondary);margin-top:10px;line-height:1.5">
          ${getMoodInsight()}
        </div>
      ` : ''}
    </div>`;
}

function getMoodInsight() {
  const recent = state.moodLog.slice(-7);
  const hardMoods = ['anxious', 'over', 'burnt', 'shut', 'pain', 'sad'];
  const hardCount = recent.filter(e => hardMoods.includes(e.mood)).length;

  if (hardCount >= 4) {
    return 'You have had several hard days recently. That is a lot. Is there someone you could talk to, or one demand you could drop?';
  }
  if (hardCount >= 2) {
    return 'A few harder days lately. What helped on the easier ones?';
  }
  return 'Your last week has been mostly manageable. Worth remembering when the next hard day comes.';
}

// ─── Window handlers ──────────────────────────────────────
window.setMood = function (k) {
  state.mood = k;

  const today = new Date();
  const short = today.toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 2);
  const date  = today.toLocaleDateString('en-GB');

  // Replace if already logged today, else add
  if (state.moodLog.length && state.moodLog[state.moodLog.length - 1].date === date) {
    state.moodLog[state.moodLog.length - 1] = { mood: k, date, short };
  } else {
    state.moodLog.push({ mood: k, date, short });
  }

  if (state.moodLog.length > 14) state.moodLog = state.moodLog.slice(-14);
  renderToday();
};

window.changeMood = function () {
  state.mood = null;
  renderToday();
};

window.toggleTask = function (id) {
  const t = state.tasks.find(t => t.id === id);
  if (t) t.done = !t.done;
  renderToday();
};

window.handleMoodCta = function (action) {
  if (action === 'today')      { renderToday(); return; }
  if (action === 'now')        { go('now'); return; }
  if (action === 'essentials') { enableEssentials(); return; }
  if (action.startsWith('reset:')) {
    const resetKey = action.split(':')[1];
    state.resetMode = resetKey;
    state.resetView = 'flow';
    state.resetStep = 0;
    go('reset');
    return;
  }
};

window.enableEssentials = function () {
  if (!state._originalTasks) {
    state._originalTasks = state.tasks.map(t => ({ ...t }));
  }
  state.tasks = state.tasks.filter(t =>
    t.meta.includes('Essentials') || t.text.toLowerCase().includes('appointment')
  );
  state.essentialsMode = true;
  renderToday();
};

window.exitEssentials = function () {
  if (state._originalTasks) {
    // Merge: keep done state from current, restore all tasks
    const doneIds = new Set(state.tasks.filter(t => t.done).map(t => t.id));
    state.tasks = state._originalTasks.map(t => ({
      ...t,
      done: doneIds.has(t.id) ? true : t.done,
    }));
    state._originalTasks = null;
  }
  state.essentialsMode = false;
  renderToday();
};

window.showEssentials = window.enableEssentials;

register('today', renderToday);
