import { state, ACCENT } from '../../data/state.js';
import { register, setTopbar, go } from '../../app/router.js';

// Expose 'go' globally for inline HTML onclick handlers
window.go = go;

// ─── Local state ──────────────────────────────────────────
if (!state.todayView) state.todayView = 'main'; // main | journal
if (!state._originalTasks) state._originalTasks = null;
if (state.essentialsMode === undefined) state.essentialsMode = false;
if (!state.moodLog) state.moodLog = [];

if (!state.journalDraft) {
  state.journalDraft = {
    topic: '',
    feelings: '',
    happened: '',
    lookingBack: '',
    lookingForward: ''
  };
}

// ─── Shared Palette ────────────────────────────────────────
const PALETTE = {
  lavender: { bg: '#f5f3ff', border: '#ddd6fe', text: '#4c1d95', sub: '#6d28d9', icon: '#8b5cf6', badgeBg: '#ede9fe' },
  teal:     { bg: '#ecfdf5', border: '#a7f3d0', text: '#047857', sub: '#059669', icon: '#10b981', badgeBg: '#d1fae5' },
  sky:      { bg: '#f0f9ff', border: '#bae6fd', text: '#0369a1', sub: '#0284c7', icon: '#0ea5e9', badgeBg: '#e0f2fe' },
  amber:    { bg: '#fffbeb', border: '#fde68a', text: '#b45309', sub: '#d97706', icon: '#f59e0b', badgeBg: '#fef3c7' },
  peach:    { bg: '#fef2f2', border: '#fecaca', text: '#9f1239', sub: '#be123c', icon: '#f43f5e', badgeBg: '#ffe4e6' },
  default:  { bg: '#f8fafc', border: '#e2e8f0', text: '#1e293b', sub: '#64748b', icon: '#94a3b8', badgeBg: '#f1f5f9' }
};

// 12 moods, each with compassionate support content
const MOODS = [
  { k: 'clear', l: 'Clear', icon: 'ti-sun', color: 'teal', message: 'Good day to begin. Use the energy gently.',
    suggestions: ['Do the harder task first while capacity is high', 'Plan tomorrow before this clarity fades', 'Take a 5-minute break before context switching'],
    ctaText: 'See my anchors', ctaIcon: 'ti-list', ctaAction: 'today' },
  { k: 'foggy', l: 'Foggy', icon: 'ti-cloud', color: 'lavender', message: 'Brain feels slow today. That is OK. Show essentials first.',
    suggestions: ['Drink water — dehydration deepens fog', 'Eat something within 30 minutes if you have not', 'Choose one task only, not three', 'Body doubling can help when starting feels impossible'],
    ctaText: 'Switch to essentials', ctaIcon: 'ti-minimize', ctaAction: 'essentials' },
  { k: 'tired', l: 'Tired', icon: 'ti-moon', color: 'sky', message: 'Tired brains cannot push through. They can only do less.',
    suggestions: ['Today is a smaller day. The plan can change', 'Move 1-2 tasks to tomorrow now, before they nag', 'Schedule recovery time after anything draining', 'Rest is a valid use of today'],
    ctaText: 'Switch to essentials', ctaIcon: 'ti-minimize', ctaAction: 'essentials' },
  { k: 'anxious', l: 'Anxious', icon: 'ti-wind', color: 'amber', message: 'Anxiety adds noise. Reducing the noise comes before the task.',
    suggestions: ['Slow exhales: 4 rounds, longer out-breath than in', 'Feet flat on the floor. Notice 3 things you can see', 'Do not check email or messages for the next 20 minutes', 'A reset takes 5 minutes. The task will still be here'],
    ctaText: 'Open anxiety reset', ctaIcon: 'ti-refresh', ctaAction: 'reset:anxiety' },
  { k: 'over', l: 'Overstimulated', icon: 'ti-volume-3', color: 'peach', message: 'Your senses are full. Reduce input before doing anything else.',
    suggestions: ['Lower brightness, headphones on, away from noise', 'Loosen anything tight on your body', 'No new tasks for the next hour, only what is critical', 'A sensory reset takes 10 minutes'],
    ctaText: 'Open sensory reset', ctaIcon: 'ti-refresh', ctaAction: 'reset:over' },
  { k: 'burnt', l: 'Burnt out', icon: 'ti-flame', color: 'peach', message: 'Burnout is real. Today is for survival, not output.',
    suggestions: ['Drop everything non-essential, even things you committed to', 'Tell one person you trust that you are struggling', 'Eat, drink water, sleep. That is the whole list', 'Burnout recovery takes weeks. Today is one of those days'],
    ctaText: 'Switch to essentials', ctaIcon: 'ti-minimize', ctaAction: 'essentials' },
  { k: 'pain', l: 'In pain', icon: 'ti-bandage', color: 'lavender', message: 'Pain reduces capacity. That is a fact, not a setting.',
    suggestions: ['Take any medication you need', 'Get comfortable, set yourself up properly', 'Today is smaller. Drop tasks freely', 'Tell someone you are struggling, just to be witnessed'],
    ctaText: 'Open pain reset', ctaIcon: 'ti-refresh', ctaAction: 'reset:pain' },
  { k: 'sad', l: 'Low or sad', icon: 'ti-mood-sad', color: 'sky', message: 'Sadness is information. Today can hold it.',
    suggestions: ['You do not need to feel productive to be OK', 'Go outside for 5 minutes if you can', 'Reach out to one person, even just to say hi', 'A reduced day is still a valid day'],
    ctaText: 'See my anchors', ctaIcon: 'ti-list', ctaAction: 'today' },
  { k: 'angry', l: 'Angry', icon: 'ti-flame', color: 'amber', message: 'Anger is data. Something feels wrong or unfair.',
    suggestions: ['Do not reply to anyone for the next 10 minutes', 'Move your body: pace, stretch, anything physical', 'Name specifically what is making you angry', 'The reply you write after cooling down will be better'],
    ctaText: 'Open anger reset', ctaIcon: 'ti-refresh', ctaAction: 'reset:anger' },
  { k: 'shut', l: 'Shut down', icon: 'ti-moon', color: 'sky', message: 'Shutdown is your system protecting you. Do not push.',
    suggestions: ['Essentials only: water, food, somewhere quiet', 'No decisions today. Decision-making is offline', 'Cancel what you can. Tell people you need quiet', 'Recovery can take hours or days. Both are normal'],
    ctaText: 'Open shutdown reset', ctaIcon: 'ti-refresh', ctaAction: 'reset:shutdown' },
  { k: 'wired', l: 'Wired', icon: 'ti-bolt', color: 'amber', message: 'Lots of energy but no focus. Channel it before it crashes.',
    suggestions: ['Move your body first: 5 minutes of walking helps', 'Pick the most physical task you have', 'Body doubling locks scattered energy into one thing', 'Caffeine probably will not help right now'],
    ctaText: 'Try the next step', ctaIcon: 'ti-player-play', ctaAction: 'now' },
  { k: 'notsure', l: 'Not sure', icon: 'ti-question-mark', color: 'teal', message: 'Not sure is a valid mood. Let us check the basics.',
    suggestions: ['When did you last drink water?', 'When did you last eat?', 'How much sleep did you get?', 'When did you last go outside?'],
    ctaText: 'Run a basics check', ctaIcon: 'ti-refresh', ctaAction: 'reset:unknown' },
];

const QUOTES = {
  clear: [
    { t: 'You do not have to do it all today. Just the next true thing.', a: null },
    { t: 'Between stimulus and response there is a space. In that space is our power to choose.', a: 'Viktor Frankl' },
    { t: 'A clear morning is a gift. Spend it on what matters, not on what is loudest.', a: null },
  ],
  foggy: [
    { t: 'The fog is not you. It is weather. Weather passes.', a: null },
    { t: 'You do not have to think clearly to be doing something right.', a: null },
    { t: 'When you cannot see far ahead, just take the next small step.', a: null },
  ],
  tired: [
    { t: 'Rest is not a reward for finishing. It is part of how you finish anything.', a: null },
    { t: 'Almost everything will work again if you unplug it for a few minutes, including you.', a: 'Anne Lamott' },
    { t: 'You cannot pour from an empty cup. Take care of yourself first.', a: null },
  ],
  anxious: [
    { t: 'You have survived 100% of your worst days. The evidence is that you are here.', a: null },
    { t: 'Anxiety is the dizziness of freedom.', a: 'Soren Kierkegaard' },
    { t: 'Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.', a: 'Thich Nhat Hanh' },
  ],
  over: [
    { t: 'When the world is too loud, smaller is wiser.', a: null },
    { t: 'Quiet is not absence. It is medicine.', a: null },
    { t: 'You are not too sensitive. The world is too loud.', a: null },
  ],
  burnt: [
    { t: 'Burnout is not weakness. It is what happens when strong people carry too much for too long.', a: null },
    { t: 'You do not need to set yourself on fire to keep other people warm.', a: null },
    { t: 'Recovery is not a straight line. Today counts even if nothing visible got done.', a: null },
  ],
  pain: [
    { t: 'Pain is real. It is not a measure of your worth.', a: null },
    { t: 'You are not the pain. You are the one noticing it.', a: null },
    { t: 'Be patient with yourself. Self-growth is tender; it is holy ground.', a: 'Stephen Covey' },
  ],
  sad: [
    { t: 'Tears are how the heart speaks when words are not enough.', a: null },
    { t: 'You do not have to be okay all the time. You just have to be here.', a: null },
    { t: 'The wound is the place where the light enters you.', a: 'Rumi' },
  ],
  angry: [
    { t: 'Anger is a messenger. Listen to the message, then let it go.', a: null },
    { t: 'Holding on to anger is like grasping a hot coal with the intent of throwing it at someone else.', a: 'attributed to the Buddha' },
    { t: 'Your anger is information. It tells you where your line is.', a: null },
  ],
  shut: [
    { t: 'Shutdown is the system protecting itself. Trust it.', a: null },
    { t: 'You do not have to be functional to be valuable.', a: null },
    { t: 'Stillness is the gift you can give yourself today.', a: null },
  ],
  wired: [
    { t: 'Energy without direction is noise. Pick one thing.', a: null },
    { t: 'Move the body first. The mind will catch up.', a: null },
    { t: 'You do not need to use all of today\'s energy today.', a: null },
  ],
  notsure: [
    { t: 'Not knowing is the most intimate.', a: 'Zen saying' },
    { t: 'You do not have to name it to honour it.', a: null },
    { t: 'Begin with the basics: water, food, breath, light. The rest will follow.', a: null },
  ],
};

function renderSectionHeader(title, icon = null) {
  return `
    <div style="display: flex; align-items: center; gap: 12px; margin: 32px 0 16px;">
      ${icon ? `<i class="ti ${icon}" style="color: #8b5cf6; font-size: 16px;"></i>` : ''}
      <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.2px; white-space: nowrap;">${title}</div>
      <div style="flex: 1; height: 1.5px; background: #e2e8f0;"></div>
    </div>
  `;
}

// ─── Main render ──────────────────────────────────────────
export function renderToday() {
  setTopbar('Today', 'A calmer way through your day');

  if (state.todayView === 'journal') return renderJournal();
  if (!state.mood) return renderMoodPicker();

  renderTodayView();
}

// ─── Mood picker ──────────────────────────────────────────
function renderMoodPicker() {
  document.getElementById('content').innerHTML = `
    <div class="screen" style="max-width: 600px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif;">
      
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0;">
        <div style="width: 44px; height: 44px; background: var(--teal, #41967a); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white;">
          <i class="ti ti-sun" style="font-size: 24px;"></i>
        </div>
        <div>
          <div style="font-size: 22px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px;">Today</div>
          <div style="font-size: 15px; color: #64748b;">A calmer way through your day</div>
        </div>
      </div>

      ${renderSectionHeader('HOW ARE YOU STARTING TODAY?')}

      <div style="background: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <div style="font-size: 13px; color: #0369a1; line-height: 1.5;">Pick whatever fits. There is no wrong answer, and you can change it later.</div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px;">
        ${MOODS.map(m => {
          const pal = PALETTE[m.color] || PALETTE.teal;
          return `
            <button onclick="setMood('${m.k}')" 
              style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 16px 8px;
                     border: 1.5px solid #e2e8f0; background: #fff; border-radius: 12px; cursor: pointer; transition: all 0.2s; font-family: inherit;">
              <i class="ti ${m.icon}" style="font-size: 24px; color: ${pal.icon};"></i>
              <span style="font-size: 13px; font-weight: 700; color: #334155;">${m.l}</span>
            </button>
          `;
        }).join('')}
      </div>

      <div style="background: #ecfdf5; border: 1.5px solid #a7f3d0; border-radius: 12px; padding: 16px;">
        <strong style="color: #065f46; font-size: 14px;">Why we ask.</strong>
        <div style="color: #064e3b; font-size: 13px; line-height: 1.5; margin-top: 4px;">Bowline adjusts what you see based on how you feel. The plan you need on a clear day is not the plan you need on a hard one.</div>
      </div>
    </div>
  `;
}

// ─── Mood-aware Today view ────────────────────────────────
function renderTodayView() {
  const mood = MOODS.find(m => m.k === state.mood);
  if (!mood) { state.mood = null; renderToday(); return; }

  const undone = state.tasks.filter(t => !t.done);
  const done   = state.tasks.filter(t =>  t.done);
  const cur    = undone[0];
  const pal    = PALETTE[mood.color] || PALETTE.teal;

  document.getElementById('content').innerHTML = `
    <div class="screen" style="max-width: 600px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif;">

      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 44px; height: 44px; background: ${pal.bg}; border: 1.5px solid ${pal.border}; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
            <i class="ti ${mood.icon}" style="font-size: 24px; color: ${pal.text};"></i>
          </div>
          <div>
            <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.2px;">TODAY YOU ARE</div>
            <div style="font-size: 20px; font-weight: 800; color: #1e293b;">${mood.l}</div>
          </div>
        </div>
        <button onclick="changeMood()" style="background: transparent; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; font-size: 12px; font-weight: 700; color: #64748b; cursor: pointer;">
          Change
        </button>
      </div>

      <!-- Mood card with full support -->
      <div style="background: #fff; border: 1.5px solid #e2e8f0; border-left: 6px solid ${pal.icon}; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="font-size: 14px; font-weight: 600; color: #334155; line-height: 1.5; margin-bottom: 16px;">
          ${mood.message}
        </div>
        
        <div style="border-top: 1.5px solid #f1f5f9; padding-top: 16px; margin-bottom: 20px;">
          <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 12px;">SUGGESTIONS FOR TODAY</div>
          ${mood.suggestions.map(s => `
            <div style="display: flex; gap: 12px; align-items: flex-start; margin-bottom: 10px;">
              <i class="ti ti-point" style="color: ${pal.icon}; font-size: 16px; margin-top: 2px;"></i>
              <div style="font-size: 13px; color: #475569; line-height: 1.5;">${s}</div>
            </div>
          `).join('')}
        </div>

        <button onclick="handleMoodCta('${mood.ctaAction}')" style="width: 100%; padding: 14px; background: ${pal.bg}; border: 1.5px solid ${pal.border}; color: ${pal.text}; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: opacity 0.2s;">
          <i class="ti ${mood.ctaIcon}" style="font-size: 18px;"></i> ${mood.ctaText}
        </button>
      </div>

      ${state.essentialsMode ? `
        <div style="background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 12px; padding: 16px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <strong style="color: #b45309; font-size: 13px;">Essentials mode is on.</strong>
            <div style="color: #d97706; font-size: 12px; margin-top: 2px;">Showing reduced task list.</div>
          </div>
          <button onclick="exitEssentials()" style="background: transparent; border: none; color: #b45309; font-size: 12px; font-weight: 700; text-decoration: underline; cursor: pointer; padding: 4px;">
            Show all tasks
          </button>
        </div>
      ` : ''}

      ${renderSectionHeader('QUICK ACTIONS')}
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px;">
        <button onclick="go('tldr')" class="grid-action-btn">
          <i class="ti ti-message-2" style="color: #0ea5e9;"></i>
          <span>TL;DR Assist</span>
        </button>
        <button onclick="go('reset')" class="grid-action-btn">
          <i class="ti ti-refresh" style="color: #10b981;"></i>
          <span>Take a Reset</span>
        </button>
        <button onclick="openJournal()" class="grid-action-btn">
          <i class="ti ti-notebook" style="color: #f43f5e;"></i>
          <span>Journal</span>
        </button>
        <button onclick="go('plan')" class="grid-action-btn">
          <i class="ti ti-plus" style="color: #8b5cf6;"></i>
          <span>Add a task</span>
        </button>
        ${!state.essentialsMode ? `
          <button onclick="enableEssentials()" class="grid-action-btn">
            <i class="ti ti-minimize" style="color: #d97706;"></i>
            <span>Essentials</span>
          </button>
        ` : '<div></div>'}
      </div>

      ${renderSectionHeader('YOUR ANCHORS')}
      ${state.tasks.length === 0 ? `
        <div style="background: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 12px; padding: 24px; text-align: center; color: #64748b; font-size: 14px;">
          No tasks yet. Add some in Plan.
        </div>
      ` : `
        <div style="background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
          ${undone.map((t, idx) => `
            <div style="padding: 16px; display: flex; align-items: flex-start; gap: 16px; border-bottom: ${idx < undone.length - 1 || done.length > 0 ? '1.5px solid #e2e8f0' : 'none'}; cursor: pointer; transition: background 0.2s;"
                 onclick="toggleTask(${t.id})">
              <div class="task-check" style="width: 24px; height: 24px; border: 2px solid ${ACCENT[t.color] || '#cbd5e1'}; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; transition: all 0.2s; flex-shrink: 0; margin-top: 2px;"></div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 15px; font-weight: 600; color: #1e293b; margin-bottom: 4px;">${t.text}</div>
                <div style="font-size: 12px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.meta}</div>
              </div>
            </div>
          `).join('')}
          ${done.map((t, idx) => `
            <div style="padding: 16px; display: flex; align-items: center; gap: 16px; border-bottom: ${idx < done.length - 1 ? '1.5px solid #e2e8f0' : 'none'}; cursor: pointer; opacity: 0.5;"
                 onclick="toggleTask(${t.id})">
              <div class="task-check done" style="width: 24px; height: 24px; background: #cbd5e1; border: 2px solid #cbd5e1; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;">
                <i class="ti ti-check" style="font-size:16px"></i>
              </div>
              <div style="font-size: 15px; font-weight: 500; color: #64748b; text-decoration: line-through; flex: 1;">${t.text}</div>
            </div>
          `).join('')}
        </div>
      `}

      ${renderMoodHistory()}
      ${renderDailyQuote(mood, pal)}
      
    </div>
    
    <style>
      .grid-action-btn {
        background: #fff;
        border: 1.5px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
        transition: all 0.2s;
        color: #475569;
        font-family: inherit;
      }
      .grid-action-btn:hover {
        border-color: #cbd5e1;
        background: #f8fafc;
      }
      .grid-action-btn i { font-size: 24px; }
      .grid-action-btn span { font-size: 12px; font-weight: 700; text-align: center; }
    </style>
  `;
}

// ─── Reflective Journal Drill-down ─────────────────────────
function renderJournal() {
  const d = state.journalDraft;

  document.getElementById('content').innerHTML = `
    <div class="screen" style="max-width: 600px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif;">
      
      <button onclick="closeJournal()" style="background: transparent; border: none; color: #64748b; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; margin-bottom: 24px; padding: 0;">
        <i class="ti ti-arrow-left" style="font-size: 18px;"></i> Back to Today
      </button>

      <div style="margin-bottom: 24px;">
        <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px;">DRILL DOWN</div>
        <div style="font-size: 22px; font-weight: 800; color: #1e293b; margin-bottom: 6px;">Reflective Journal</div>
        <div style="font-size: 14px; color: #64748b; line-height: 1.5;">Process an event or interaction. Give the topic the attention it needs to find clarity.</div>
      </div>

      <!-- Section 1: The Event -->
      <div style="background: #fff; border: 1.5px solid #e2e8f0; border-left: 6px solid #10b981; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <div style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">What event or topic are you reflecting on?</div>
        <div style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 12px;">Give a brief description. You don’t need to give all the details, focus on the event itself. Remember to keep things confidential.</div>
        <textarea onblur="updateJournal('topic', this.value)" placeholder="Start typing here..." style="width: 100%; min-height: 100px; padding: 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-family: inherit; font-size: 14px; color: #334155; resize: vertical; box-sizing: border-box; outline: none;">${d.topic}</textarea>
      </div>

      <!-- Section 2: Feelings -->
      <div style="background: #fff; border: 1.5px solid #e2e8f0; border-left: 6px solid #f59e0b; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <div style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">Would you call this a positive or challenging event?</div>
        <div style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 12px;">Even when things go right, they can still be challenging. What feelings would you use to describe the event?</div>
        <textarea onblur="updateJournal('feelings', this.value)" placeholder="I felt..." style="width: 100%; min-height: 80px; padding: 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-family: inherit; font-size: 14px; color: #334155; resize: vertical; box-sizing: border-box; outline: none;">${d.feelings}</textarea>
      </div>

      <!-- Section 3: What happened -->
      <div style="background: #fff; border: 1.5px solid #e2e8f0; border-left: 6px solid #0ea5e9; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <div style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">What happened?</div>
        <div style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 12px;">How did you respond? How did your team respond? What did you feel during the event? What did you feel afterwards?</div>
        <textarea onblur="updateJournal('happened', this.value)" placeholder="During the event..." style="width: 100%; min-height: 120px; padding: 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-family: inherit; font-size: 14px; color: #334155; resize: vertical; box-sizing: border-box; outline: none;">${d.happened}</textarea>
      </div>

      <!-- Section 4: Looking Back -->
      <div style="background: #fff; border: 1.5px solid #e2e8f0; border-left: 6px solid #8b5cf6; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <div style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">Looking back</div>
        <div style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 12px;">Are you satisfied with how you responded? Do you think you worked effectively with colleagues? Did you have all the support you needed?</div>
        <textarea onblur="updateJournal('lookingBack', this.value)" placeholder="Looking back, I..." style="width: 100%; min-height: 100px; padding: 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-family: inherit; font-size: 14px; color: #334155; resize: vertical; box-sizing: border-box; outline: none;">${d.lookingBack}</textarea>
      </div>

      <!-- Section 5: Looking Forward -->
      <div style="background: #fff; border: 1.5px solid #e2e8f0; border-left: 6px solid #f43f5e; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">Looking forward</div>
        <div style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 12px;">If there is a similar event in future, would you do anything differently? What did you learn? Are there lessons to be learned for your team or policies?</div>
        <textarea onblur="updateJournal('lookingForward', this.value)" placeholder="In the future..." style="width: 100%; min-height: 120px; padding: 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-family: inherit; font-size: 14px; color: #334155; resize: vertical; box-sizing: border-box; outline: none;">${d.lookingForward}</textarea>
      </div>

      <!-- Actions -->
      <div style="display: flex; gap: 12px; margin-bottom: 32px;">
        <button onclick="copyJournal(this)" style="flex: 2; padding: 14px; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 14px; font-weight: 700; color: #1e293b; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <i class="ti ti-copy" style="color: #0ea5e9; font-size: 20px;"></i> Copy Reflection
        </button>
        <button onclick="clearJournal()" style="flex: 1; padding: 14px; background: transparent; border: 1.5px dashed #cbd5e1; border-radius: 12px; font-size: 14px; font-weight: 600; color: #64748b; cursor: pointer;">
          Clear
        </button>
      </div>

    </div>
  `;
}

// ─── Helper Views ──────────────────────────────────────────
function renderMoodHistory() {
  if (state.moodLog.length < 2) return '';
  const recent = state.moodLog.slice(-7);
  return `
    ${renderSectionHeader('RECENT MOODS')}
    <div style="background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <div style="display: flex; gap: 8px; align-items: flex-end; margin-bottom: ${state.moodLog.length >= 3 ? '16px' : '0'};">
        ${recent.map(entry => {
          const m = MOODS.find(mm => mm.k === entry.mood);
          if (!m) return '';
          const pal = PALETTE[m.color] || PALETTE.teal;
          return `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;">
              <div style="width: 100%; aspect-ratio: 1; border-radius: 8px; background: ${pal.bg}; border: 1px solid ${pal.border}; display: flex; align-items: center; justify-content: center;" title="${entry.date} — ${m.l}">
                <i class="ti ${m.icon}" style="font-size: 16px; color: ${pal.icon};"></i>
              </div>
              <div style="font-size: 9px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${entry.short}</div>
            </div>`;
        }).join('')}
      </div>
      ${state.moodLog.length >= 3 ? `
        <div style="font-size: 13px; color: #64748b; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 12px;">
          ${getMoodInsight()}
        </div>
      ` : ''}
    </div>
  `;
}

function getMoodInsight() {
  const recent = state.moodLog.slice(-7);
  const hardMoods = ['anxious', 'over', 'burnt', 'shut', 'pain', 'sad'];
  const hardCount = recent.filter(e => hardMoods.includes(e.mood)).length;

  if (hardCount >= 4) return 'You have had several hard days recently. That is a lot. Is there someone you could talk to, or one demand you could drop?';
  if (hardCount >= 2) return 'A few harder days lately. What helped on the easier ones?';
  return 'Your last week has been mostly manageable. Worth remembering when the next hard day comes.';
}

function dayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function renderDailyQuote(mood, pal) {
  const pool = QUOTES[mood.k];
  if (!pool || pool.length === 0) return '';
  const idx = dayOfYear() % pool.length;
  const q = pool[idx];

  return `
    ${renderSectionHeader('A THOUGHT FOR TODAY')}
    <div style="background: ${pal.bg}; border: 1.5px solid ${pal.border}; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
      <i class="ti ti-quote" style="font-size: 28px; color: ${pal.icon}; opacity: 0.4; margin-bottom: 12px; display: block;"></i>
      <div style="font-size: 15px; font-weight: 500; color: ${pal.text}; line-height: 1.6; font-style: italic; margin-bottom: ${q.a ? '12px' : '0'};">
        "${q.t}"
      </div>
      ${q.a ? `
        <div style="font-size: 12px; font-weight: 700; color: ${pal.sub}; text-transform: uppercase; letter-spacing: 1px;">
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

// Journal Handlers
window.openJournal = () => {
  state.todayView = 'journal';
  renderToday();
};

window.closeJournal = () => {
  state.todayView = 'main';
  renderToday();
};

window.updateJournal = (key, value) => {
  if (state.journalDraft) {
    state.journalDraft[key] = value;
  }
};

window.copyJournal = (btn) => {
  const d = state.journalDraft;
  const text = `
REFLECTIVE JOURNAL
Date: ${new Date().toLocaleDateString('en-GB')}

THE EVENT:
${d.topic || 'N/A'}

FEELINGS & NATURE:
${d.feelings || 'N/A'}

WHAT HAPPENED:
${d.happened || 'N/A'}

LOOKING BACK:
${d.lookingBack || 'N/A'}

LOOKING FORWARD:
${d.lookingForward || 'N/A'}
  `.trim();

  navigator.clipboard.writeText(text).catch(() => {});
  
  btn.innerHTML = '<i class="ti ti-check" style="color: #10b981; font-size: 20px;"></i> Copied';
  setTimeout(() => {
    btn.innerHTML = '<i class="ti ti-copy" style="color: #0ea5e9; font-size: 20px;"></i> Copy Reflection';
  }, 2000);
};

window.clearJournal = () => {
  if (confirm('Clear your journal draft? This cannot be undone.')) {
    state.journalDraft = { topic: '', feelings: '', happened: '', lookingBack: '', lookingForward: '' };
    renderToday();
  }
};

register('today', renderToday);
