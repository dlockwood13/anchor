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

// ─── Daily quotes, keyed by mood ──────────────────────────
// Each mood has a pool. A day-of-year index picks one, so the
// quote changes daily but stays stable if reopened the same day.
const QUOTES = {
  clear: [
    { t: 'You do not have to do it all today. Just the next true thing.', a: null },
    { t: 'Between stimulus and response there is a space. In that space is our power to choose.', a: 'Viktor Frankl' },
    { t: 'A clear morning is a gift. Spend it on what matters, not on what is loudest.', a: null },
    { t: 'Tend to the body and the mind will follow.', a: null },
    { t: 'Be where your feet are.', a: null },
    { t: 'The present moment is the only moment available to us, and it is the door to all moments.', a: 'Thich Nhat Hanh' },
    { t: 'Capacity is not the same as obligation. Use today gently.', a: null },
  ],
  foggy: [
    { t: 'The fog is not you. It is weather. Weather passes.', a: null },
    { t: 'You do not have to think clearly to be doing something right.', a: null },
    { t: 'When you cannot see far ahead, just take the next small step.', a: null },
    { t: 'Slow is a pace, not a failure.', a: null },
    { t: 'You are allowed to be a work in progress and a masterpiece at the same time.', a: 'Sophia Bush' },
    { t: 'Today, less is the right amount.', a: null },
    { t: 'The mind is like water. When it is turbulent, it is difficult to see. When it is calm, everything becomes clear.', a: 'Prasad Mahes' },
  ],
  tired: [
    { t: 'Rest is not a reward for finishing. It is part of how you finish anything.', a: null },
    { t: 'Almost everything will work again if you unplug it for a few minutes, including you.', a: 'Anne Lamott' },
    { t: 'You cannot pour from an empty cup. Take care of yourself first.', a: null },
    { t: 'Sleep is not lost time. It is the work that lets the rest of the work happen.', a: null },
    { t: 'Tired is a signal, not a failure of character.', a: null },
    { t: 'Today, lower the bar. Tomorrow will still be there.', a: null },
    { t: 'Take rest; a field that has rested gives a bountiful crop.', a: 'Ovid' },
  ],
  anxious: [
    { t: 'You have survived 100% of your worst days. The evidence is that you are here.', a: null },
    { t: 'Anxiety is the dizziness of freedom.', a: 'Soren Kierkegaard' },
    { t: 'Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.', a: 'Thich Nhat Hanh' },
    { t: 'You do not have to control your thoughts. You just have to stop letting them control you.', a: 'Dan Millman' },
    { t: 'Breathe out longer than you breathe in. Your nervous system is listening.', a: null },
    { t: 'Worry pretends to be useful. It almost never is.', a: null },
    { t: 'Right now, in this exact moment, you are safe enough to take one slow breath.', a: null },
  ],
  over: [
    { t: 'When the world is too loud, smaller is wiser.', a: null },
    { t: 'Quiet is not absence. It is medicine.', a: null },
    { t: 'You are not too sensitive. The world is too loud.', a: null },
    { t: 'Solitude is where I place my chaos to rest and awaken my inner peace.', a: 'Nikki Rowe' },
    { t: 'Lower the lights. Soften the sound. The world can wait.', a: null },
    { t: 'Sensory overload is not a personality flaw. It is a full inbox.', a: null },
    { t: 'When in doubt, close the door. The next decision can wait.', a: null },
  ],
  burnt: [
    { t: 'Burnout is not weakness. It is what happens when strong people carry too much for too long.', a: null },
    { t: 'You do not need to set yourself on fire to keep other people warm.', a: null },
    { t: 'Recovery is not a straight line. Today counts even if nothing visible got done.', a: null },
    { t: 'Rest is resistance.', a: 'Tricia Hersey' },
    { t: 'The most loving thing you can do today might be nothing at all.', a: null },
    { t: 'You are allowed to disappoint people in order to stay alive to yourself.', a: null },
    { t: 'There is virtue in work and there is virtue in rest. Use both and overlook neither.', a: 'Alan Cohen' },
  ],
  pain: [
    { t: 'Pain is real. It is not a measure of your worth.', a: null },
    { t: 'You are not the pain. You are the one noticing it.', a: null },
    { t: 'Be patient with yourself. Self-growth is tender; it is holy ground.', a: 'Stephen Covey' },
    { t: 'Surviving a hard day is an achievement. It counts.', a: null },
    { t: 'Comfort is not a luxury today. It is medicine.', a: null },
    { t: 'Soft is a strategy.', a: null },
    { t: 'The body keeps the score. Listen to it.', a: 'Bessel van der Kolk' },
  ],
  sad: [
    { t: 'Tears are how the heart speaks when words are not enough.', a: null },
    { t: 'You do not have to be okay all the time. You just have to be here.', a: null },
    { t: 'The wound is the place where the light enters you.', a: 'Rumi' },
    { t: 'Sadness is not a problem to solve. It is a guest to sit with.', a: null },
    { t: 'There is a crack in everything. That is how the light gets in.', a: 'Leonard Cohen' },
    { t: 'You are allowed to feel everything you are feeling, even if you cannot explain it yet.', a: null },
    { t: 'Be gentle with yourself. You are doing the best you can with what you have today.', a: null },
  ],
  angry: [
    { t: 'Anger is a messenger. Listen to the message, then let it go.', a: null },
    { t: 'Holding on to anger is like grasping a hot coal with the intent of throwing it at someone else.', a: 'attributed to the Buddha' },
    { t: 'Your anger is information. It tells you where your line is.', a: null },
    { t: 'Pause before you reply. The 10 minutes you wait will save you an hour of repair.', a: null },
    { t: 'For every minute you remain angry, you give up sixty seconds of peace of mind.', a: 'Ralph Waldo Emerson' },
    { t: 'Anger is not the enemy. Reacting from it before you have thought is.', a: null },
    { t: 'Speak when you are angry and you will make the best speech you will ever regret.', a: 'Ambrose Bierce' },
  ],
  shut: [
    { t: 'Shutdown is the system protecting itself. Trust it.', a: null },
    { t: 'You do not have to be functional to be valuable.', a: null },
    { t: 'Stillness is the gift you can give yourself today.', a: null },
    { t: 'Sometimes the most important thing in a whole day is the rest we take between two deep breaths.', a: 'Etty Hillesum' },
    { t: 'No decisions today. Tomorrow you will think more clearly.', a: null },
    { t: 'You are not gone. You are quiet. There is a difference.', a: null },
    { t: 'Pause. Soften. Let the world go on without you for an afternoon.', a: null },
  ],
  wired: [
    { t: 'Energy without direction is noise. Pick one thing.', a: null },
    { t: 'Move the body first. The mind will catch up.', a: null },
    { t: 'You do not need to use all of today\'s energy today.', a: null },
    { t: 'Restlessness is a form of attention looking for somewhere to land.', a: null },
    { t: 'Channel the current, do not chase it.', a: null },
    { t: 'A walk is a tiny pilgrimage.', a: null },
    { t: 'The faster you go, the more you miss. Slow down enough to actually arrive.', a: null },
  ],
  notsure: [
    { t: 'Not knowing is the most intimate.', a: 'Zen saying' },
    { t: 'You do not have to name it to honour it.', a: null },
    { t: 'Begin with the basics: water, food, breath, light. The rest will follow.', a: null },
    { t: 'It is OK to be a question today, not an answer.', a: null },
    { t: 'When in doubt, do less, but do it gently.', a: null },
    { t: 'The cure for anything is salt water: sweat, tears, or the sea.', a: 'Isak Dinesen' },
    { t: 'You are allowed to not know how you feel and still be moving forward.', a: null },
  ],
};

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

      ${renderDailyQuote(mood)}
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

// ─── Daily quote (mood-matched, deterministic per day) ────
function dayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function renderDailyQuote(mood) {
  const pool = QUOTES[mood.k];
  if (!pool || pool.length === 0) return '';

  const idx = dayOfYear() % pool.length;
  const q = pool[idx];

  return `
    <div class="section-label" style="margin-top:1.5rem">
      <i class="ti ti-quote" style="color:var(--${mood.color});font-size:14px"></i> A thought for today
    </div>
    <div class="card ${mood.color}" style="text-align:center;padding:1.5rem 1.25rem">
      <i class="ti ti-quote" style="font-size:24px;color:var(--${mood.color});opacity:0.5;display:block;margin-bottom:8px"></i>
      <div style="font-size:15px;line-height:1.7;font-style:italic;color:var(--text-primary)">
        ${q.t}
      </div>
      ${q.a ? `
        <div style="font-size:12px;color:var(--text-muted);margin-top:10px;letter-spacing:0.3px">
          — ${q.a}
        </div>
      ` : ''}
    </div>
  `;
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
