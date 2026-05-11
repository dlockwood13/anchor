import { state, BRAND } from '../../data/state.js';
import { register, setTopbar } from '../../app/router.js';
import {
  initCalendar, signIn, signOut, isSignedIn,
  fetchTodayEvents, fetchUpcomingEvents, getPrepChecklist,
} from '../../services/calendar.js';

// ─── Local state ──────────────────────────────────────────
if (!state.calendarConnected) state.calendarConnected = false;
if (!state.calendarEvents)    state.calendarEvents    = null;
if (!state.calendarLoading)   state.calendarLoading   = false;
if (!state.calendarDemo)      state.calendarDemo      = false;
if (!state.calendarView)      state.calendarView      = 'today'; // today | week | event
if (!state.calendarEventOpen) state.calendarEventOpen = null;

const SCRIPTS = [
  { l: 'Ask for clarity',    t: 'Thanks for the message. Could you clarify what you need from me and by when?' },
  { l: 'Running late',       t: "I'm running late. I'm still coming, but I need more time. I'll update you when I know my arrival time." },
  { l: 'Need more time',     t: "I've seen this. I need time to process before I reply properly." },
  { l: 'Overwhelmed',        t: "I'm overwhelmed and need a quieter moment before I can respond. I'm not ignoring you." },
  { l: 'Set boundary',       t: "I'm not available for this today. I can look at it on [date]." },
  { l: 'Say no',             t: "Thanks for asking. I'm not able to do this." },
  { l: 'Social recovery',    t: "I enjoyed seeing you. I need quiet time now, so I may not reply quickly." },
  { l: 'Change of plan',     t: "I can adapt, but I need a few minutes to understand the new plan." },
];

const SENSORY_TOOLS = ['Headphones', 'Sunglasses', 'Weighted blanket', 'Fidget', 'Hoodie', 'Quiet room', 'Familiar music', 'Movement'];
const ESSENTIALS    = ['Water', 'Food', 'Medication', 'Hygiene minimum', 'Sleep', 'Key responsibility'];

const SUPPORT_TABS = [
  { k: 'adhd',       l: 'ADHD' },
  { k: 'autism',     l: 'Autism' },
  { k: 'strategies', l: 'Strategies' },
  { k: 'crisis',     l: 'Crisis' },
];

const SUPPORT_LINKS = {
  adhd: [
    { title: 'ADHD Foundation (UK)',    sub: 'Resources, diagnosis info, adult ADHD support',          url: 'https://www.adhdfoundation.org.uk',                              icon: 'ti-brain',       color: 'lavender' },
    { title: 'CHADD',                   sub: 'Evidence-based ADHD information and support',            url: 'https://chadd.org',                                              icon: 'ti-book',        color: 'lavender' },
    { title: 'How to ADHD (YouTube)',   sub: 'Practical strategies from a neurodivergent creator',     url: 'https://www.youtube.com/@HowtoADHD',                             icon: 'ti-player-play', color: 'sky' },
    { title: 'Body doubling explained', sub: 'Why working alongside others helps ADHD focus',          url: 'https://www.additudemag.com/body-doubling-adhd-focus/',           icon: 'ti-users',       color: 'teal' },
    { title: 'ADDitude Magazine',       sub: 'Practical guidance for ADHD adults and parents',         url: 'https://www.additudemag.com',                                    icon: 'ti-news',        color: 'amber' },
  ],
  autism: [
    { title: 'Autistic UK',                 sub: 'Autistic-led support and resources',              url: 'https://autisticuk.org',                              icon: 'ti-heart',       color: 'teal' },
    { title: 'Autism Toolbox',              sub: 'Strategies for everyday autistic life',           url: 'https://www.autismtoolbox.co.uk',                     icon: 'ti-tool',        color: 'teal' },
    { title: 'Understanding sensory needs', sub: 'NHS guide to sensory processing',                  url: 'https://www.nhs.uk/conditions/autism/signs/children/', icon: 'ti-ear',         color: 'sky' },
    { title: 'Meltdown vs shutdown',        sub: 'What they are and how to recover',                 url: 'https://neuroclastic.com/meltdown-vs-shutdown/',      icon: 'ti-info-circle', color: 'amber' },
    { title: 'Ambitious About Autism',      sub: 'UK charity for autistic children and young people', url: 'https://www.ambitiousaboutautism.org.uk',             icon: 'ti-star',        color: 'lavender' },
  ],
  strategies: [
    { title: 'Pomodoro technique',           sub: 'Work in short timed bursts with breaks',           url: 'https://en.wikipedia.org/wiki/Pomodoro_Technique',                 icon: 'ti-clock',       color: 'amber' },
    { title: 'Interoception guide',          sub: "Recognising your body's internal signals",         url: 'https://www.sensorysmart.com.au/interoception.html',               icon: 'ti-activity',    color: 'peach' },
    { title: 'Sensory diet planning',        sub: 'Building a personalised sensory routine',          url: 'https://www.sensoryprocessingdisorder.com/sensory-diet.html',     icon: 'ti-list',        color: 'teal' },
    { title: 'Task initiation strategies',   sub: 'Practical ways to start when you feel stuck',      url: 'https://www.additudemag.com/how-to-start-tasks-adhd/',             icon: 'ti-player-play', color: 'lavender' },
    { title: 'Executive function explained', sub: 'What it is and how to work with it',               url: 'https://www.understood.org/articles/what-is-executive-function',   icon: 'ti-brain',       color: 'sky' },
  ],
  crisis: [
    { title: 'Mind (UK)',              sub: 'Mental health support and crisis resources',          url: 'https://www.mind.org.uk',                                                                                                  icon: 'ti-heart',          color: 'peach' },
    { title: 'Samaritans',             sub: 'Free, 24/7 listening — call 116 123',                 url: 'https://www.samaritans.org',                                                                                                icon: 'ti-phone',          color: 'sky' },
    { title: 'Neurodivergent burnout', sub: 'Understanding and recovering from burnout',           url: 'https://neuroclastic.com/autistic-burnout/',                                                                                icon: 'ti-flame',          color: 'amber' },
    { title: 'Shout crisis text line', sub: 'Text HOME to 85258 (UK) — free, 24/7',                url: 'https://giveusashout.org',                                                                                                  icon: 'ti-message-circle', color: 'lavender' },
    { title: 'Crisis Care (NHS)',      sub: 'How to get urgent mental health help',                url: 'https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/behaviours/help-for-suicidal-thoughts/',                       icon: 'ti-first-aid-kit',  color: 'teal' },
  ],
};

const LINK_BG = { lavender: 'var(--lavender-l)', teal: 'var(--teal-l)', sky: 'var(--sky-l)', peach: 'var(--peach-l)', amber: 'var(--amber-l)' };
const LINK_IC = { lavender: 'var(--lavender)',   teal: 'var(--teal)',   sky: 'var(--sky)',   peach: 'var(--peach)',   amber: 'var(--amber)' };

const EVENT_TYPE_LABELS = {
  medical:        { l: 'Medical',        color: 'peach',    icon: 'ti-stethoscope' },
  'high-stakes':  { l: 'High-stakes',    color: 'amber',    icon: 'ti-alert-triangle' },
  social:         { l: 'Social',         color: 'lavender', icon: 'ti-users' },
  'work-meeting': { l: 'Work meeting',   color: 'sky',      icon: 'ti-briefcase' },
  focus:          { l: 'Focus block',    color: 'teal',     icon: 'ti-bolt' },
  travel:         { l: 'Travel',         color: 'amber',    icon: 'ti-plane' },
  'in-person':    { l: 'In-person',      color: 'lavender', icon: 'ti-map-pin' },
  general:        { l: 'Event',          color: 'sky',      icon: 'ti-calendar' },
};

// ─── Main render ──────────────────────────────────────────
export function renderMe() {
  setTopbar('Me', 'Your support profile.');

  if (state.calendarView === 'event' && state.calendarEventOpen) {
    return renderEventDetail();
  }

  const links = SUPPORT_LINKS[state.supportTab] || [];

  document.getElementById('content').innerHTML = `
    <div class="screen">

      <!-- Branded header -->
      <div class="card teal" style="text-align:center;padding:1.5rem 1.25rem">
        <img src="src/assets/bowline-lockup.png"
             alt="Bowline — A calmer way through your day"
             style="max-width:100%;height:auto;max-height:80px" />
      </div>

      <!-- Calendar integration -->
      <div class="section-label">
        <i class="ti ti-calendar" style="color:var(--teal);font-size:14px"></i> Calendar
      </div>

      ${renderCalendarSection()}

      <!-- Support tabs -->
      <div class="section-label">
        <i class="ti ti-link" style="color:var(--lavender);font-size:14px"></i> Support resources
      </div>

      <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap" role="tablist">
        ${SUPPORT_TABS.map(t => `
          <button role="tab" aria-selected="${state.supportTab === t.k}"
            onclick="switchSupportTab('${t.k}')"
            style="padding:8px 16px;
                   border:2px solid ${state.supportTab === t.k ? 'var(--teal)' : 'var(--border)'};
                   border-radius:var(--r-pill);
                   background:${state.supportTab === t.k ? 'var(--teal-l)' : 'var(--bg-card)'};
                   color:${state.supportTab === t.k ? 'var(--teal-d)' : 'var(--text-primary)'};
                   font-size:13px;font-weight:700;font-family:var(--font);
                   cursor:pointer;transition:all 0.15s">
            ${t.l}
          </button>
        `).join('')}
      </div>

      ${links.map(lk => `
        <a href="${lk.url}" target="_blank" rel="noopener noreferrer" class="link-card">
          <div class="link-icon" style="background:${LINK_BG[lk.color]}">
            <i class="ti ${lk.icon}" style="color:${LINK_IC[lk.color]}"></i>
          </div>
          <div style="flex:1">
            <div class="link-title">${lk.title}</div>
            <div class="link-sub">${lk.sub}</div>
          </div>
          <i class="ti ti-external-link" style="font-size:16px;color:var(--text-muted);flex-shrink:0"></i>
        </a>
      `).join('')}

      <!-- Communication scripts -->
      <div class="section-label" style="margin-top:1.5rem">
        <i class="ti ti-message-circle" style="color:var(--sky);font-size:14px"></i> Communication scripts
      </div>
      <div class="notice blue" style="margin-bottom:0.85rem">
        Tap the copy icon to copy a script.
      </div>
      <div class="card" style="padding:0.5rem 1.25rem">
        ${SCRIPTS.map(s => `
          <div class="task-row">
            <div style="flex:1">
              <div class="task-text" style="font-size:14px">${s.l}</div>
              <div class="task-meta" style="line-height:1.5">${s.t}</div>
            </div>
            <button onclick="copyScript('${s.t.replace(/'/g, "\\'")}', this)"
              style="border:none;background:none;cursor:pointer;color:var(--teal);font-size:18px;flex-shrink:0;padding:4px"
              aria-label="Copy: ${s.l}">
              <i class="ti ti-copy"></i>
            </button>
          </div>
        `).join('')}
      </div>

      <!-- Sensory tools -->
      <div class="section-label">
        <i class="ti ti-heart" style="color:var(--peach);font-size:14px"></i> My sensory tools
      </div>
      <div class="chip-wrap" style="margin-bottom:1rem">
        ${SENSORY_TOOLS.map(s => `<span class="chip sel">${s}</span>`).join('')}
      </div>

      <!-- Essentials -->
      <div class="section-label">
        <i class="ti ti-check" style="color:var(--teal);font-size:14px"></i> My essentials
      </div>
      <div class="card" style="padding:0.5rem 1.25rem">
        ${ESSENTIALS.map(e => `
          <div class="task-row">
            <div class="task-check"
              onclick="this.classList.toggle('done');
                       this.innerHTML = this.classList.contains('done')
                         ? '<i class=\\'ti ti-check\\' style=\\'font-size:14px\\'></i>'
                         : '';"
              role="checkbox" aria-label="${e}">
            </div>
            <div class="task-text">${e}</div>
          </div>
        `).join('')}
      </div>

      <div class="notice green" style="margin-top:1.5rem;text-align:center">
        ${BRAND.motto}
      </div>
    </div>`;
}

// ─── Calendar section ─────────────────────────────────────
function renderCalendarSection() {
  // Not connected yet
  if (!state.calendarConnected) {
    return `
      <div class="card teal">
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px">
          <i class="ti ti-calendar-event" style="font-size:28px;color:var(--teal);flex-shrink:0"></i>
          <div>
            <div class="card-main" style="font-size:16px">Connect Google Calendar</div>
            <div class="card-sub" style="margin-top:4px;line-height:1.5">
              Bowline reads your calendar (it never adds or changes events) and turns appointments into prep checklists, leave-time reminders, and recovery time.
            </div>
          </div>
        </div>
        <button class="btn primary" style="margin-top:8px;margin-bottom:0" onclick="connectCalendar()">
          <i class="ti ti-brand-google"></i> Connect Google Calendar
        </button>
        <button class="btn" style="margin-bottom:0" onclick="useDemoCalendar()">
          <i class="ti ti-eye"></i> See a demo first
        </button>
      </div>
      <div class="notice blue" style="margin-bottom:0.85rem">
        <strong>Privacy:</strong> Bowline reads your calendar in your browser only. Events are not sent to any server. You can disconnect at any time.
      </div>`;
  }

  // Loading
  if (state.calendarLoading) {
    return `
      <div class="card">
        <div style="display:flex;align-items:center;gap:10px;padding:1rem 0;justify-content:center">
          <div class="spinner"></div>
          <span style="font-size:14px;color:var(--text-secondary)">Reading your calendar…</span>
        </div>
      </div>`;
  }

  // Events loaded
  const events  = state.calendarEvents || [];
  const view    = state.calendarView || 'today';
  const today   = new Date();
  const sameDay = (d) => d.toDateString() === today.toDateString();

  const filtered = view === 'today'
    ? events.filter(e => sameDay(e.startDate))
    : events;

  return `
    <div style="display:flex;gap:6px;margin-bottom:12px">
      <button onclick="setCalendarView('today')"
        style="flex:1;padding:8px 14px;
               border:2px solid ${view === 'today' ? 'var(--teal)' : 'var(--border)'};
               border-radius:var(--r-pill);
               background:${view === 'today' ? 'var(--teal-l)' : 'var(--bg-card)'};
               color:${view === 'today' ? 'var(--teal-d)' : 'var(--text-primary)'};
               font-size:13px;font-weight:700;font-family:var(--font);cursor:pointer">
        Today
      </button>
      <button onclick="setCalendarView('week')"
        style="flex:1;padding:8px 14px;
               border:2px solid ${view === 'week' ? 'var(--teal)' : 'var(--border)'};
               border-radius:var(--r-pill);
               background:${view === 'week' ? 'var(--teal-l)' : 'var(--bg-card)'};
               color:${view === 'week' ? 'var(--teal-d)' : 'var(--text-primary)'};
               font-size:13px;font-weight:700;font-family:var(--font);cursor:pointer">
        Next 7 days
      </button>
    </div>

    ${state.calendarDemo ? `
      <div class="notice amber" style="margin-bottom:0.85rem;font-size:13px">
        <strong>Demo mode.</strong> Showing example events. Set up your Google Cloud Client ID in <code>src/services/calendar.js</code> to connect real calendar.
      </div>
    ` : ''}

    ${filtered.length === 0 ? `
      <div class="card" style="text-align:center;padding:1.5rem">
        <i class="ti ti-calendar-off" style="font-size:32px;color:var(--text-muted)"></i>
        <div style="margin-top:8px;color:var(--text-secondary);font-size:14px">
          No events ${view === 'today' ? 'left today' : 'in the next 7 days'}. A clear stretch is a good thing.
        </div>
      </div>
    ` : filtered.map(e => renderEventCard(e)).join('')}

    <button class="btn" style="margin-top:8px" onclick="refreshCalendar()">
      <i class="ti ti-refresh"></i> Refresh
    </button>
    <button class="btn" style="color:var(--text-muted)" onclick="disconnectCalendar()">
      <i class="ti ti-x"></i> Disconnect calendar
    </button>`;
}

function renderEventCard(e) {
  const type   = EVENT_TYPE_LABELS[e.type] || EVENT_TYPE_LABELS.general;
  const time   = e.allDay
    ? 'All day'
    : e.startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const dayLbl = e.startDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const isToday = e.startDate.toDateString() === new Date().toDateString();

  return `
    <button class="card ${type.color}" style="width:100%;text-align:left;border:2px solid var(--border);border-left:5px solid var(--${type.color});background:var(--bg-card);cursor:pointer;font-family:var(--font);margin-bottom:0.85rem;padding:1.1rem 1.25rem"
      onclick="openEvent('${e.id}')">
      <div style="display:flex;align-items:flex-start;gap:12px">
        <i class="ti ${type.icon}" style="font-size:22px;color:var(--${type.color});flex-shrink:0;margin-top:2px"></i>
        <div style="flex:1;min-width:0">
          <div class="card-main" style="font-size:15px">${e.title}</div>
          <div class="card-sub" style="margin-top:4px">
            ${isToday ? '' : dayLbl + ' · '}${time}${e.location ? ' · ' + e.location : ''}
          </div>
          <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
            <span class="tag ${type.color === 'lavender' ? 'purple' : type.color === 'sky' ? 'green' : type.color === 'amber' ? 'amber' : type.color === 'peach' ? 'amber' : 'green'}" style="background:var(--${type.color}-l);color:var(--${type.color}-d)">
              ${type.l}
            </span>
            ${e.needsPrep ? `<span class="tag amber"><i class="ti ti-checklist" style="font-size:11px"></i> Prep</span>` : ''}
            ${e.leaveTime ? `<span class="tag amber"><i class="ti ti-clock" style="font-size:11px"></i> Leave ${e.leaveTime.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'})}</span>` : ''}
          </div>
        </div>
        <i class="ti ti-chevron-right" style="font-size:18px;color:var(--text-muted);flex-shrink:0"></i>
      </div>
    </button>`;
}

// ─── Event detail with prep + recovery ─────────────────────
function renderEventDetail() {
  const e    = state.calendarEvents.find(ev => ev.id === state.calendarEventOpen);
  if (!e) { state.calendarView = 'today'; renderMe(); return; }

  const type = EVENT_TYPE_LABELS[e.type] || EVENT_TYPE_LABELS.general;
  const prep = getPrepChecklist(e);

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <button class="btn" style="color:var(--text-muted);margin-bottom:10px" onclick="closeEvent()">
        <i class="ti ti-arrow-left"></i> Back to calendar
      </button>

      <div class="card ${type.color}">
        <div style="display:flex;align-items:flex-start;gap:12px">
          <i class="ti ${type.icon}" style="font-size:28px;color:var(--${type.color});flex-shrink:0"></i>
          <div style="flex:1">
            <div class="card-label">${type.l}</div>
            <div class="card-main">${e.title}</div>
            <div class="card-sub" style="margin-top:6px;line-height:1.6">
              ${e.startDate.toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
              ${e.location ? `<br>${e.location}` : ''}
            </div>
          </div>
        </div>
      </div>

      ${e.leaveTime ? `
        <div class="notice amber">
          <strong>Leave by ${e.leaveTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</strong> for a 30-minute buffer.
          ${e.type === 'medical' || e.type === 'high-stakes' ? 'For this one, consider 45 minutes early.' : ''}
        </div>
      ` : ''}

      ${e.needsPrep ? `
        <div class="section-label">
          <i class="ti ti-checklist" style="color:var(--lavender);font-size:14px"></i> Prep checklist
        </div>
        <div class="card" style="padding:0.5rem 1.25rem">
          ${prep.map((item, i) => `
            <div class="task-row">
              <div class="task-check"
                onclick="this.classList.toggle('done');
                         this.innerHTML = this.classList.contains('done')
                           ? '<i class=\\'ti ti-check\\' style=\\'font-size:14px\\'></i>' : '';"
                role="checkbox" aria-label="${item}">
              </div>
              <div class="task-text" style="font-size:14px">${item}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="section-label">
        <i class="ti ti-refresh" style="color:var(--sky);font-size:14px"></i> After this event
      </div>
      <div class="notice blue">
        <strong>Build in recovery time.</strong> ${recoveryGuidance(e.type)}
      </div>
      <button class="btn sky" onclick="state.resetMode='${recoveryReset(e.type)}';state.resetView='flow';state.resetStep=0;go('reset')">
        <i class="ti ti-refresh"></i> Open the right reset
      </button>

      ${e.description ? `
        <div class="section-label">
          <i class="ti ti-file-description" style="color:var(--text-muted);font-size:14px"></i> Event notes
        </div>
        <div class="card" style="font-size:13px;line-height:1.6;color:var(--text-secondary);white-space:pre-wrap">${e.description}</div>
      ` : ''}
    </div>`;
}

function recoveryGuidance(type) {
  switch (type) {
    case 'medical':       return 'Medical appointments often cost more energy than they seem to. Plan 30–60 minutes of quiet after.';
    case 'high-stakes':   return 'High-stakes events drain executive function. Avoid hard tasks for 1–2 hours after.';
    case 'social':        return 'Social events cost energy for neurodivergent brains. Quiet recovery time is not optional.';
    case 'in-person':     return 'Travel + masking + sensory input adds up. Give yourself a buffer.';
    case 'travel':        return 'Travel days are recovery days too. Be gentle with the rest of your schedule.';
    default:              return 'Give yourself a transition window — 10–15 minutes of quiet between this and the next thing.';
  }
}

function recoveryReset(type) {
  if (type === 'social') return 'social';
  if (type === 'medical' || type === 'high-stakes') return 'over';
  return 'shutdown';
}

// ─── Window handlers ──────────────────────────────────────
window.connectCalendar = async () => {
  state.calendarLoading = true;
  renderMe();
  try {
    const { demo } = await initCalendar();
    state.calendarDemo = demo;
    if (!demo) await signIn();
    const events = await fetchUpcomingEvents(7);
    state.calendarConnected = true;
    state.calendarEvents    = events;
  } catch (e) {
    alert('Could not connect to calendar. ' + (e.message || ''));
  }
  state.calendarLoading = false;
  renderMe();
};

window.useDemoCalendar = async () => {
  state.calendarLoading = true;
  renderMe();
  await initCalendar();
  const events = await fetchUpcomingEvents(7);
  state.calendarConnected = true;
  state.calendarDemo      = true;
  state.calendarEvents    = events;
  state.calendarLoading   = false;
  renderMe();
};

window.disconnectCalendar = () => {
  if (!state.calendarDemo) signOut();
  state.calendarConnected = false;
  state.calendarEvents    = null;
  state.calendarDemo      = false;
  renderMe();
};

window.refreshCalendar = async () => {
  state.calendarLoading = true;
  renderMe();
  state.calendarEvents = await fetchUpcomingEvents(7);
  state.calendarLoading = false;
  renderMe();
};

window.setCalendarView = (v) => {
  state.calendarView = v;
  renderMe();
};

window.openEvent = (id) => {
  state.calendarEventOpen = id;
  state.calendarView      = 'event';
  renderMe();
};

window.closeEvent = () => {
  state.calendarEventOpen = null;
  state.calendarView      = 'today';
  renderMe();
};

window.switchSupportTab = (t) => { state.supportTab = t; renderMe(); };

window.copyScript = (text, btn) => {
  navigator.clipboard.writeText(text).catch(() => {});
  btn.innerHTML = '<i class="ti ti-check" style="color:var(--teal)"></i>';
  setTimeout(() => { btn.innerHTML = '<i class="ti ti-copy"></i>'; }, 1500);
};

register('me', renderMe);
