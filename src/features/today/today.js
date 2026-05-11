import { state, ACCENT } from '../../data/state.js';
import { register, setTopbar, go } from '../../app/router.js';

// ─── Mood definitions — 12 states, each with full support ─────
const MOODS = [
  {
    k: 'clear',  l: 'Clear',          icon: 'ti-sun',           color: 'teal',
    cardColor: 'teal',
    message: 'Good day to begin. Use the energy gently.',
    suggestions: [
      'Do the harder task first while capacity is high',
      'Plan tomorrow before this clarity fades',
      'Take a 5-minute break before context switching',
    ],
    cta: 'today',
  },
  {
    k: 'foggy',  l: 'Foggy',          icon: 'ti-cloud',         color: 'lavender',
    cardColor: 'lavender',
    message: 'Brain feels slow today. That is OK. Show essentials first.',
    suggestions: [
      'Drink water — dehydration deepens fog',
      'Eat something within 30 minutes if you have not',
      'Choose one task only — not three',
      'Body doubling can help when starting feels impossible',
    ],
    cta: 'essentials',
  },
  {
    k: 'tired',  l: 'Tired',          icon: 'ti-moon',          color: 'sky',
    cardColor: 'sky',
    message: 'Tired brains can\'t push through. They can only do less.',
    suggestions: [
      'Today is a smaller-day. The plan can change',
      'Move 1–2 tasks to tomorrow now, before they nag',
      'Schedule recovery time after anything draining',
      'Rest is a valid use of today',
    ],
    cta: 'essentials',
  },
  {
    k: 'anxious', l: 'Anxious',       icon: 'ti-wind',          color: 'amber',
    cardColor: 'amber',
    message: 'Anxiety adds noise. Reducing the noise comes before the task.',
    suggestions: [
      'Slow exhales — 4 rounds, longer out-breath than in',
      'Feet flat on the floor. Notice 3 things you can see',
      'Do not check email or messages for the next 20 minutes',
      'A reset takes 5 minutes. The task will still be here',
    ],
    cta: 'reset:anxiety',
  },
  {
    k: 'over',   l: 'Overstimulated', icon: 'ti-volume-3',      color: 'peach',
    cardColor: 'peach',
    message: 'Your senses are full. Reduce input before doing anything else.',
    suggestions: [
      'Lower brightness, headphones on, away from noise',
      'Loosen anything tight on your body',
      'No new tasks for the next hour — only what is critical',
      'A sensory reset takes 10 minutes',
    ],
    cta: 'reset:over',
  },
  {
    k: 'burnt',  l: 'Burnt out',      icon: 'ti-flame',         color: 'peach',
    cardColor: 'peach',
    message: 'Burnout is real. Today is for survival, not output.',
    suggestions: [
      'Drop everything non-essential — even things you committed to',
      'Tell one person you trust that you are struggling',
      'Eat, drink water, sleep. That is the whole list',
      'Burnout recovery takes weeks. Today is one of those days',
    ],
    cta: 'essentials',
  },
  {
    k: 'pain',   l: 'In pain',        icon: 'ti-bandage',       color: 'lavender',
    cardColor: 'lavender',
    message: 'Pain reduces capacity — that is a fact, not a setting.',
    suggestions: [
      'Take any medication you need',
      'Get comfortable — set yourself up properly',
      'Today is smaller. Drop tasks freely',
      'Tell someone you are struggling — not for help, just to be witnessed',
    ],
    cta: 'reset:pain',
  },
  {
    k: 'sad',    l: 'Low or sad',     icon: 'ti-mood-sad',      color: 'sky',
    cardColor: 'sky',
    message: 'Sadness is information. Today can hold it.',
    suggestions: [
      'You do not need to feel productive to be OK',
      'Go outside for 5 minutes if you can',
      'Reach out to one person — even just to say hi',
      'A reduced day is still a valid day',
    ],
    cta: 'today',
  },
  {
    k: 'angry',  l: 'Angry',          icon: 'ti-flame',         color: 'amber',
    cardColor: 'amber',
    message: 'Anger is data. Something feels wrong or unfair.',
    suggestions: [
      'Do not reply to anyone for the next 10 minutes',
      'Move your body — pace, stretch, anything physical',
      'Name specifically what is making you angry',
      'The reply you write after cooling down will be better',
    ],
    cta: 'reset:anger',
  },
  {
    k: 'shut',   l: 'Shut down',      icon: 'ti-moon',          color: 'sky',
    cardColor: 'sky',
    message: 'Shutdown is your system protecting you. Do not push.',
    suggestions: [
      'Essentials only — water, food, somewhere quiet',
      'No decisions today. Decision-making is offline',
      'Cancel what you can. Tell people you need quiet',
      'Recovery can take hours or days. Both are normal',
    ],
    cta: 'reset:shutdown',
  },
  {
    k: 'wired',  l: 'Wired / restless', icon: 'ti-bolt',        color: 'amber',
    cardColor: 'amber',
    message: 'Lots of energy but no focus. Channel it before it crashes.',
    suggestions: [
      'Move your body first — 5 minutes of walking helps',
      'Pick the most physical task you have',
      'Body doubling locks scattered energy into one thing',
      'Caffeine probably won\'t help right now',
    ],
    cta: 'now',
  },
  {
    k: 'notsure', l: 'Not sure',      icon: 'ti-question-mark', color: 'teal',
    cardColor: 'teal',
    message: 'Not sure is a valid mood. Let\'s check the basics.',
    suggestions: [
      'When did you last drink water?',
      'When did you last eat?',
      'How much sleep did you get?',
      'When did you last go outside?',
    ],
    cta: 'reset:unknown',
  },
];

const MOOD_NOTICE_CLASS = {
  teal:     'green',
  lavender: 'purple',
  sky:      'blue',
  amber:    'amber',
  peach:    'peach',
};

// ─── Main Today renderer ──────────────────────────────────
export function renderToday() {
  setTopbar('Today', 'A calmer way through your day');

  const undone = state.tasks.filter(t => !t.done);
  const done   = state.tasks.filter(t =>  t.done);
  const cur    = undone[0];

  // ─── Mood selection view ───
  if (!state.mood) {
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
    return;
  }

  // ─── Mood-aware Today view ───
  const mood = MOODS.find(m => m.k === state.mood);
  if (!mood) { state.mood = null; renderToday(); return; }

  document.getElementById('content').innerHTML = `
    <div class="screen">

      <!-- Mood card with full support -->
      <div class="card ${mood.cardColor}">
        <div style="display:flex;align-items:flex-start;gap:12px">
          <i class="ti ${mood.icon}" style="font-size:28px;color:var(--${mood.color});flex-shrink:0"></i>
          <div style="flex:1">
            <div class="card-label">Today you are</div>
            <div class="card-main">${mood.l}</div>
            <div class="card-sub" style="margin-top:6px;line-height:1.6">${mood.message}</div>
          </div>
          <button onclick="changeMood()"
            style="border:none;background:none;cursor:pointer;color:var(--text-muted);font-size:13px;font-weight:700;padding:4px 8px;border-radius:6px;flex-shrink:0"
            aria-label="Change mood">
            <i class="ti ti-pencil" style="font-size:16px"></i>
          </button>
        </div>

        <!-- Suggestions specific to this mood -->
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
        ${moodCta(mood)}
      </div>

      ${state.moodLog && state.moodLog.length > 1 ? renderMoodHistory() : ''}

      <!-- Standard Today content -->
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

      <div class="section-label">
        <i class="ti ti-list" style="color:var(--lavender);font-size:14px"></i> Your anchors
      </div>
      <div class="card" style="padding:0.5rem 1.25rem">
        ${undone.map(t => `
          <div class="task-row">
            <div class="task-check"
              style="border-color:${ACCENT[t.color]}"
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
            <div class="task-check done"><i class="ti ti-check" style="font-size:14px"></i></div>
            <div class="task-text done">${t.text}</div>
          </div>
        `).join('')}
      </div>

      <div class="section-label">
        <i class="ti ti-clock" style="color:var(--amber);font-size:14px"></i> Later today
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
      <button class="btn sky" onclick="go('tldr')"><i class="ti ti-message-2"></i> Understand a message</button>
      <button class="btn lavender" onclick="go('reset')"><i class="ti ti-refresh"></i> I need a reset first</button>
      <button class="btn amber-btn" onclick="showEssentials()"><i class="ti ti-minimize"></i> Show essentials only</button>
    </div>`;
}

// ─── Mood-specific CTA button ─────────────────────────────
function moodCta(mood) {
  const map = {
    today:       { l: 'See my anchors',        icon: 'ti-list',       handler: `go('today')` },
    now:         { l: 'Try the next step',     icon: 'ti-player-play',handler: `go('now')` },
    essentials:  { l: 'Switch to essentials',  icon: 'ti-minimize',   handler: `showEssentials()` },
  };
  // Reset routing — extract reset type if present
  if (mood.cta.startsWith('reset:')) {
    const resetKey = mood.cta.split(':')[1];
    return `<button class="btn primary" style="margin-top:14px;margin-bottom:0" onclick="state.resetMode='${resetKey}';state.resetView='flow';state.resetStep=0;go('reset')">
      <i class="ti ti-refresh"></i> Open the right reset for this
    </button>`;
  }
  const cta = map[mood.cta] || map.today;
  return `<button class="btn primary" style="margin-top:14px;margin-bottom:0" onclick="${cta.handler}">
    <i class="ti ${cta.icon}"></i> ${cta.l}
  </button>`;
}

// ─── Mood history (last 7 days, if logged) ────────────────
function renderMoodHistory() {
  if (!state.moodLog || state.moodLog.length < 2) return '';
  const recent = state.moodLog.slice(-7);
  return `
    <div class="section-label">
      <i class="ti ti-chart-line" style="color:var(--sky);font-size:14px"></i> Recent moods
    </div>
    <div class="card" style="padding:1rem 1.25rem">
      <div style="display:flex;gap:6px;align-items:flex-end;height:60px">
        ${recent.map(entry => {
          const m = MOODS.find(mm => mm.k === entry.mood);
          if (!m) return '';
          return `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px"
                 title="${entry.date} — ${m.l}">
              <div style="width:24px;height:24px;border-radius:6px;background:var(--${m.color}-l);display:flex;align-items:center;justify-content:center">
                <i class="ti ${m.icon}" style="font-size:14px;color:var(--${m.color})"></i>
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

// ─── Soft pattern detection (non-clinical) ────────────────
function getMoodInsight() {
  const recent = state.moodLog.slice(-7);
  const hardMoods = ['anxious', 'over', 'burnt', 'shut', 'pain', 'sad'];
  const hardCount = recent.filter(e => hardMoods.includes(e.mood)).length;

  if (hardCount >= 4) {
    return 'You\'ve had several hard days recently. That is a lot. Is there someone you could talk to, or one demand you could drop?';
  }
  if (hardCount >= 2) {
    return 'A few harder days lately — that is information worth noticing. What helped on the easier ones?';
  }
  return 'Your last week has been mostly manageable. Worth remembering when the next hard day comes.';
}

// ─── Window handlers ──────────────────────────────────────
window.setMood = (k) => {
  state.mood = k;
  if (!state.moodLog) state.moodLog = [];
  const today = new Date();
  const short = today.toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 2);
  const date  = today.toLocaleDateString('en-GB');
  // Replace if already logged today, otherwise add
  if (state.moodLog.length && state.moodLog[state.moodLog.length - 1].date === date) {
    state.moodLog[state.moodLog.length - 1] = { mood: k, date, short };
  } else {
    state.moodLog.push({ mood: k, date, short });
  }
  // Keep only last 14 days
  if (state.moodLog.length > 14) state.moodLog = state.moodLog.slice(-14);
  renderToday();
};

window.changeMood = () => {
  state.mood = null;
  renderToday();
};

window.toggleTask = (id) => {
  const t = state.tasks.find(t => t.id === id);
  if (t) t.done = !t.done;
  renderToday();
};

window.showEssentials = () => {
  state.tasks = state.tasks.filter(t =>
    t.meta.includes('Essentials') || t.text.toLowerCase().includes('appointment')
  );
  renderToday();
};

register('today', renderToday);
