import { state, BRAND } from '../../data/state.js';
import { register, setTopbar } from '../../app/router.js';

// Init local state
if (!state.supportTab) state.supportTab = 'adhd';

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

const SENSORY_TOOLS = [
  'Headphones', 'Sunglasses', 'Weighted blanket', 'Fidget', 
  'Hoodie', 'Quiet room', 'Familiar music', 'Movement'
];

const ESSENTIALS = [
  'Water', 'Food', 'Medication', 'Hygiene minimum', 'Sleep', 'Key responsibility'
];

const SUPPORT_TABS = [
  { k: 'adhd',       l: 'ADHD' },
  { k: 'autism',     l: 'Autism' },
  { k: 'strategies', l: 'Strategies' },
  { k: 'crisis',     l: 'Crisis' },
];

const SUPPORT_LINKS = {
  adhd: [
    { title: 'ADHD Foundation (UK)',    sub: 'Resources, diagnosis info, adult ADHD support',          url: 'https://www.adhdfoundation.org.uk',                             icon: 'ti-brain',       color: 'lavender' },
    { title: 'CHADD',                   sub: 'Evidence-based ADHD information and support',            url: 'https://chadd.org',                                             icon: 'ti-book',        color: 'lavender' },
    { title: 'How to ADHD (YouTube)',   sub: 'Practical strategies from a neurodivergent creator',     url: 'https://www.youtube.com/@HowtoADHD',                            icon: 'ti-player-play', color: 'sky' },
    { title: 'Body doubling explained', sub: 'Why working alongside others helps ADHD focus',          url: 'https://www.additudemag.com/body-doubling-adhd-focus/',           icon: 'ti-users',       color: 'teal' },
    { title: 'ADDitude Magazine',       sub: 'Practical guidance for ADHD adults and parents',         url: 'https://www.additudemag.com',                                   icon: 'ti-news',        color: 'amber' },
  ],
  autism: [
    { title: 'Autistic UK',             sub: 'Autistic-led support and resources',                     url: 'https://autisticuk.org',                                        icon: 'ti-heart',       color: 'teal' },
    { title: 'Autism Toolbox',          sub: 'Strategies for everyday autistic life',                  url: 'https://www.autismtoolbox.co.uk',                               icon: 'ti-tool',        color: 'teal' },
    { title: 'Understanding sensory needs', sub: 'NHS guide to sensory processing',                    url: 'https://www.nhs.uk/conditions/autism/signs/children/',          icon: 'ti-ear',         color: 'sky' },
    { title: 'Meltdown vs shutdown',    sub: 'What they are and how to recover',                       url: 'https://neuroclastic.com/meltdown-vs-shutdown/',                icon: 'ti-info-circle', color: 'amber' },
    { title: 'Ambitious About Autism',  sub: 'UK charity for autistic children and young people',      url: 'https://www.ambitiousaboutautism.org.uk',                       icon: 'ti-star',        color: 'lavender' },
  ],
  strategies: [
    { title: 'Pomodoro technique',      sub: 'Work in short timed bursts with breaks',                 url: 'https://en.wikipedia.org/wiki/Pomodoro_Technique',                icon: 'ti-clock',       color: 'amber' },
    { title: 'Interoception guide',     sub: "Recognising your body's internal signals",               url: 'https://www.sensorysmart.com.au/interoception.html',              icon: 'ti-activity',    color: 'peach' },
    { title: 'Sensory diet planning',   sub: 'Building a personalised sensory routine',                url: 'https://www.sensoryprocessingdisorder.com/sensory-diet.html',     icon: 'ti-list',        color: 'teal' },
    { title: 'Task initiation strategies',   sub: 'Practical ways to start when you feel stuck',       url: 'https://www.additudemag.com/how-to-start-tasks-adhd/',            icon: 'ti-player-play', color: 'lavender' },
    { title: 'Executive function explained', sub: 'What it is and how to work with it',                url: 'https://www.understood.org/articles/what-is-executive-function',  icon: 'ti-brain',       color: 'sky' },
  ],
  crisis: [
    { title: 'Mind (UK)',              sub: 'Mental health support and crisis resources', url: 'https://www.mind.org.uk',                                                  icon: 'ti-heart',          color: 'peach' },
    { title: 'Samaritans',             sub: 'Free, 24/7 listening — call 116 123',        url: 'https://www.samaritans.org',                                               icon: 'ti-phone',          color: 'sky' },
    { title: 'Neurodivergent burnout', sub: 'Understanding and recovering from burnout',  url: 'https://neuroclastic.com/autistic-burnout/',                               icon: 'ti-flame',          color: 'amber' },
    { title: 'Shout crisis text line', sub: 'Text HOME to 85258 (UK) — free, 24/7',       url: 'https://giveusashout.org',                                                 icon: 'ti-message-circle', color: 'lavender' },
    { title: 'Crisis Care (NHS)',      sub: 'How to get urgent mental health help',       url: 'https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/behaviours/help-for-suicidal-thoughts/', icon: 'ti-first-aid-kit', color: 'teal' },
  ],
};

const PALETTE = {
  lavender: { bg: '#f5f3ff', text: '#6d28d9' },
  teal:     { bg: '#ecfdf5', text: '#059669' },
  sky:      { bg: '#f0f9ff', text: '#0284c7' },
  amber:    { bg: '#fffbeb', text: '#d97706' },
  peach:    { bg: '#fef2f2', text: '#e11d48' }
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

export function renderMe() {
  setTopbar('Me', 'Your support profile.');

  const links = SUPPORT_LINKS[state.supportTab] || [];

  document.getElementById('content').innerHTML = `
    <div class="screen" style="max-width: 600px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif;">

      <!-- Topbar Header -->
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0;">
        <div style="width: 44px; height: 44px; background: var(--teal, #41967a); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white;">
          <i class="ti ti-user" style="font-size: 24px;"></i>
        </div>
        <div>
          <div style="font-size: 22px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px;">Me</div>
          <div style="font-size: 15px; color: #64748b;">Your support profile.</div>
        </div>
      </div>

      <!-- Branded header -->
      <div style="background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <img src="src/assets/bowline-lockup.png"
             alt="Bowline — A calmer way through your day"
             style="max-width: 100%; height: auto; max-height: 40px; opacity: 0.9;" />
      </div>

      ${renderSectionHeader('SUPPORT RESOURCES', 'ti-link')}

      <!-- Support tabs -->
      <div style="display: flex; gap: 8px; margin-bottom: 16px; overflow-x: auto; padding-bottom: 4px; -webkit-overflow-scrolling: touch;">
        ${SUPPORT_TABS.map(t => {
          const isActive = state.supportTab === t.k;
          return `
            <button onclick="switchSupportTab('${t.k}')"
              style="padding: 8px 16px; white-space: nowrap; border-radius: 20px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s;
                     border: 1.5px solid ${isActive ? '#10b981' : '#e2e8f0'};
                     background: ${isActive ? '#ecfdf5' : '#fff'};
                     color: ${isActive ? '#064e3b' : '#475569'};">
              ${t.l}
            </button>
          `;
        }).join('')}
      </div>

      <!-- Support Links -->
      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px;">
        ${links.map(lk => {
          const pal = PALETTE[lk.color] || PALETTE.lavender;
          return `
            <a href="${lk.url}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; gap: 16px; padding: 16px; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; text-decoration: none; transition: border-color 0.2s;">
              <div style="width: 40px; height: 40px; border-radius: 10px; background: ${pal.bg}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i class="ti ${lk.icon}" style="font-size: 20px; color: ${pal.text};"></i>
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">${lk.title}</div>
                <div style="font-size: 13px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${lk.sub}</div>
              </div>
              <i class="ti ti-external-link" style="font-size: 18px; color: #cbd5e1; flex-shrink: 0;"></i>
            </a>
          `;
        }).join('')}
      </div>

      ${renderSectionHeader('COMMUNICATION SCRIPTS', 'ti-message-circle')}
      
      <div style="background: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
        <div style="font-size: 13px; color: #0369a1;">Tap the copy icon to copy a script.</div>
      </div>

      <div style="background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; margin-bottom: 32px; overflow: hidden;">
        ${SCRIPTS.map((s, idx) => `
          <div style="padding: 16px; display: flex; align-items: flex-start; gap: 16px; border-bottom: ${idx < SCRIPTS.length - 1 ? '1.5px solid #e2e8f0' : 'none'};">
            <div style="flex: 1;">
              <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">${s.l}</div>
              <div style="font-size: 13px; color: #64748b; line-height: 1.5;">${s.t}</div>
            </div>
            <button onclick="copyScript(${idx}, this)"
                    style="background: transparent; border: none; cursor: pointer; padding: 4px; color: #10b981; flex-shrink: 0;"
                    aria-label="Copy: ${s.l}">
              <i class="ti ti-copy" style="font-size: 20px;"></i>
            </button>
          </div>
        `).join('')}
      </div>

      ${renderSectionHeader('MY SENSORY TOOLS', 'ti-heart')}
      
      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px;">
        ${SENSORY_TOOLS.map(s => `
          <span style="padding: 8px 16px; background: #ecfdf5; border: 1.5px solid #10b981; color: #064e3b; border-radius: 20px; font-size: 13px; font-weight: 700;">${s}</span>
        `).join('')}
      </div>

      ${renderSectionHeader('MY ESSENTIALS', 'ti-check')}
      
      <div style="background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 32px;">
        ${ESSENTIALS.map((e, idx) => `
          <div style="padding: 16px; display: flex; align-items: center; gap: 16px; border-bottom: ${idx < ESSENTIALS.length - 1 ? '1.5px solid #e2e8f0' : 'none'}; cursor: pointer;"
               onclick="toggleEssential(this)">
            <div class="task-check" style="width: 24px; height: 24px; border: 2px solid #cbd5e1; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; transition: all 0.2s;" role="checkbox" aria-label="${e}"></div>
            <div style="font-size: 14px; font-weight: 600; color: #334155; flex: 1;">${e}</div>
          </div>
        `).join('')}
      </div>

      <div style="text-align: center; color: #94a3b8; font-size: 13px; margin-top: 40px; margin-bottom: 20px;">
        ${BRAND ? BRAND.motto : 'A calmer way through your day.'}
      </div>

    </div>
    
    <style>
      .task-check.done {
        background: #10b981;
        border-color: #10b981 !important;
      }
    </style>
  `;
}

// ─── Global Handlers ───
window.switchSupportTab = (t) => { 
  state.supportTab = t; 
  renderMe(); 
};

// Extracted script copying to prevent quote escaping errors
window.copyScript = (idx, btn) => {
  const textToCopy = SCRIPTS[idx].t;
  navigator.clipboard.writeText(textToCopy).catch(() => {});
  
  btn.innerHTML = '<i class="ti ti-check" style="color: #10b981; font-size: 20px;"></i>';
  setTimeout(() => { 
    btn.innerHTML = '<i class="ti ti-copy" style="font-size: 20px;"></i>'; 
  }, 1500);
};

// Extracted checklist toggling to prevent inline HTML breaking
window.toggleEssential = (element) => {
  const check = element.querySelector('.task-check');
  if (!check) return;
  
  check.classList.toggle('done');
  if (check.classList.contains('done')) {
    check.innerHTML = '<i class="ti ti-check" style="font-size:16px"></i>';
  } else {
    check.innerHTML = '';
  }
};

register('me', renderMe);
