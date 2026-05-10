import { state, BRAND } from '../../data/state.js';
import { register, setTopbar } from '../../app/router.js';

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

const LINK_BG = {
  lavender: 'var(--lavender-l)', teal: 'var(--teal-l)',
  sky: 'var(--sky-l)', peach: 'var(--peach-l)', amber: 'var(--amber-l)',
};
const LINK_IC = {
  lavender: 'var(--lavender)', teal: 'var(--teal)',
  sky: 'var(--sky)', peach: 'var(--peach)', amber: 'var(--amber)',
};

export function renderMe() {
  setTopbar('Me', 'Your support profile.');

  const links = SUPPORT_LINKS[state.supportTab] || [];

  document.getElementById('content').innerHTML = `
    <div class="screen">

      <!-- Branded header card -->
      <div class="card teal" style="display:flex;align-items:center;gap:14px">
        <svg class="bowline-mark-lg" aria-hidden="true"><use href="#bowline-mark"/></svg>
        <div>
          <div class="card-main" style="font-size:18px">${BRAND.name}</div>
          <div class="card-sub">${BRAND.tagline}</div>
        </div>
      </div>

      <!-- Support tabs -->
      <div class="section-label">
        <i class="ti ti-link" style="color:var(--lavender);font-size:14px" aria-hidden="true"></i>
        Support resources
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
            <i class="ti ${lk.icon}" aria-hidden="true" style="color:${LINK_IC[lk.color]}"></i>
          </div>
          <div style="flex:1">
            <div class="link-title">${lk.title}</div>
            <div class="link-sub">${lk.sub}</div>
          </div>
          <i class="ti ti-external-link" aria-hidden="true" style="font-size:16px;color:var(--text-muted);flex-shrink:0"></i>
        </a>
      `).join('')}

      <!-- Communication scripts -->
      <div class="section-label" style="margin-top:1.5rem">
        <i class="ti ti-message-circle" style="color:var(--sky);font-size:14px" aria-hidden="true"></i>
        Communication scripts
      </div>

      <div class="notice blue" style="margin-bottom:0.85rem">
        Tap the copy icon to copy a script to your clipboard.
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
        <i class="ti ti-heart" style="color:var(--peach);font-size:14px" aria-hidden="true"></i>
        My sensory tools
      </div>
      <div class="chip-wrap" style="margin-bottom:1rem">
        ${SENSORY_TOOLS.map(s => `<span class="chip sel">${s}</span>`).join('')}
      </div>

      <!-- Essentials -->
      <div class="section-label">
        <i class="ti ti-check" style="color:var(--teal);font-size:14px" aria-hidden="true"></i>
        My essentials
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

      <!-- Brand footer -->
      <div class="notice green" style="margin-top:1.5rem;text-align:center">
        ${BRAND.motto}
      </div>

    </div>`;
}

window.switchSupportTab = (tab) => {
  state.supportTab = tab;
  renderMe();
};

window.copyScript = (text, btn) => {
  navigator.clipboard.writeText(text).catch(() => {});
  btn.innerHTML = '<i class="ti ti-check" style="color:var(--teal)"></i>';
  setTimeout(() => { btn.innerHTML = '<i class="ti ti-copy"></i>'; }, 1500);
};

register('me', renderMe);
