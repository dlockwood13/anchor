import { state } from '../../data/state.js';
import { register, setTopbar } from '../../app/router.js';

const STAGES = [
  {
    k: 'noticing',
    l: 'I think I might be neurodivergent',
    sub: 'Noticing patterns',
    color: 'lavender',
    icon: 'ti-bulb',
    what: 'You are noticing that life feels harder than it seems to for other people. You do not need to be certain yet. You just need enough reason to ask for help.',
    next: [
      'Start writing down examples of what is difficult',
      'Note how long things have been this way',
      'Research ADHD, autism, dyslexia, dyspraxia — see what fits',
      'You do not need a diagnosis to start using support strategies',
    ],
    prepare: [
      'Keep a simple list of struggles — focus, sensory, social, emotional, sleep',
      'Note any childhood examples you remember',
      'Write down what makes life harder and what makes it easier',
    ],
    scripts: [
      { l: 'Thinking out loud', t: 'I have been noticing some patterns in how I function that I want to understand better. I think I might be neurodivergent.' },
    ],
    support: [
      'Use reminders and external structure now — you do not need a diagnosis first',
      'Break tasks into steps',
      'Reduce unnecessary demands where you can',
      'Wear headphones or earplugs if noise is difficult',
      'Track what causes overwhelm',
    ],
    links: [
      { title: 'ADHD Foundation self-referral info', url: 'https://www.adhdfoundation.org.uk', icon: 'ti-brain', color: 'lavender' },
      { title: 'Autistic UK — am I autistic?', url: 'https://autisticuk.org', icon: 'ti-heart', color: 'teal' },
      { title: 'Understood — ADHD and learning differences', url: 'https://www.understood.org', icon: 'ti-book', color: 'sky' },
    ],
  },
  {
    k: 'collecting',
    l: 'I am collecting examples',
    sub: 'Building your picture',
    color: 'sky',
    icon: 'ti-notes',
    what: 'Writing down your experiences makes appointments easier. You do not have to remember everything on the spot.',
    next: [
      'Write examples of focus problems, sensory issues, emotional overwhelm, shutdowns',
      'Include school, work, relationships, and daily life',
      'Note childhood examples if you remember them',
      'Keep your notes somewhere safe for your appointment',
    ],
    prepare: [
      'Focus on patterns, not single events',
      'Include things that other people seem to find easy that you find hard',
      'Note how things affect your work, relationships, or daily functioning',
      'If possible, ask a parent or someone who knew you as a child for examples',
    ],
    scripts: [
      { l: 'Asking a family member', t: 'I am trying to understand some patterns I have noticed. Do you remember me struggling with [focus / sensory things / social situations] when I was younger?' },
    ],
    support: [
      'The Anchor Brain Dump feature can help you get thoughts out',
      'Use the TL;DR tool to process any letters or forms',
      'Keep all notes in one place — a folder, an app, or a document',
    ],
    links: [
      { title: 'ADDitude symptom checker', url: 'https://www.additudemag.com/adhd-symptoms-test-adults/', icon: 'ti-clipboard-check', color: 'amber' },
      { title: 'National Autistic Society — getting a diagnosis', url: 'https://www.autism.org.uk/advice-and-guidance/topics/diagnosis', icon: 'ti-heart', color: 'teal' },
    ],
  },
  {
    k: 'gp',
    l: 'I have spoken to my GP',
    sub: 'First professional step',
    color: 'teal',
    icon: 'ti-stethoscope',
    what: 'Speaking to a GP is usually the starting point on the NHS. You can ask to be referred for an assessment. You do not need to prove you are neurodivergent — you just need to describe your difficulties.',
    next: [
      'Ask your GP for a referral to a specialist for ADHD or autism assessment',
      'Mention how difficulties affect your daily functioning',
      'Ask about Right to Choose if you are in England — this may let you choose your assessment provider',
      'Note the date of your referral and who sent it',
    ],
    prepare: [
      'Bring your written examples to the appointment',
      'Say clearly: "I would like to be referred for an assessment"',
      'Mention any conditions that have already been ruled out',
      'Ask for a copy of the referral letter',
    ],
    scripts: [
      { l: 'Asking for a referral', t: 'I think I may be neurodivergent. I struggle with daily functioning in several areas. I would like to be referred for an assessment.' },
      { l: 'Asking about Right to Choose', t: 'I understand I may have the right to choose my assessment provider under NHS Right to Choose. Can you include that in my referral?' },
      { l: 'If the GP is unsure', t: 'I have written down specific examples of how this affects my work and daily life. I would like to discuss them with a specialist rather than rule it out at this stage.' },
    ],
    support: [
      'Take a trusted person with you if that helps',
      'Ask for written notes from the appointment',
      'You can ask to have things repeated or written down',
      'Use the Anchor TL;DR tool to process any paperwork you receive',
    ],
    links: [
      { title: 'NHS — getting an autism assessment', url: 'https://www.nhs.uk/conditions/autism/diagnosis/', icon: 'ti-heart', color: 'teal' },
      { title: 'NHS — ADHD referral information', url: 'https://www.nhs.uk/conditions/attention-deficit-hyperactivity-disorder-adhd/diagnosis/', icon: 'ti-brain', color: 'lavender' },
      { title: 'Right to Choose explained', url: 'https://www.england.nhs.uk/patient-choice/', icon: 'ti-arrow-right', color: 'sky' },
    ],
  },
  {
    k: 'referred',
    l: 'My referral has been sent',
    sub: 'Waiting for acceptance',
    color: 'amber',
    icon: 'ti-send',
    what: 'Your GP has sent a referral. The next step is for the service to accept it and add you to the waiting list. This can take weeks to months.',
    next: [
      'Chase your GP or the service after 4–6 weeks if you have not heard back',
      'Ask for written confirmation that your referral has been received',
      'Keep any letters or reference numbers safe',
      'Ask what the expected waiting time is',
    ],
    prepare: [
      'Note the name of the service your referral was sent to',
      'Keep your contact details up to date with your GP',
      'If you move, tell both your GP and the service',
    ],
    scripts: [
      { l: 'Chasing the referral', t: 'I was referred by my GP on [date] for a neurodevelopmental assessment. I have not yet heard whether it has been accepted. Could you confirm the status of my referral?' },
      { l: 'Asking for timeline', t: 'Can you tell me the approximate waiting time for an assessment, and what happens next after my referral is accepted?' },
    ],
    support: [
      'You do not need to wait for your assessment to start using strategies',
      'Use Anchor routines, TL;DR, and Reset tools while you wait',
      'Keep a folder for all correspondence',
    ],
    links: [
      { title: 'National Autistic Society — waiting for assessment', url: 'https://www.autism.org.uk/advice-and-guidance/topics/diagnosis/assessment-and-diagnosis', icon: 'ti-clock', color: 'amber' },
      { title: 'ADHD UK — waiting list guidance', url: 'https://adhduk.co.uk', icon: 'ti-brain', color: 'lavender' },
    ],
  },
  {
    k: 'waiting',
    l: 'I am waiting',
    sub: 'On the waiting list',
    color: 'sky',
    icon: 'ti-clock',
    what: 'Waiting is often the longest part. NHS autism assessments can take over 16 months on average. ADHD assessments can also take months to years. This is not a reflection of how serious your needs are.',
    next: [
      'Use strategies and tools now — you do not need to wait for a diagnosis',
      'Keep a record of how your difficulties are affecting you',
      'Ask your GP if there is any interim support available',
      'Look into whether your employer or school can offer adjustments while you wait',
    ],
    prepare: [
      'Continue adding to your notes — examples of difficulties are useful at the assessment',
      'Note any significant changes in your life or functioning',
      'If your difficulties become crisis-level, speak to your GP',
    ],
    scripts: [
      { l: 'Asking for workplace adjustments while waiting', t: 'I am currently waiting for a neurodevelopmental assessment. While I wait, I would like to discuss some adjustments that may help me function better at work.' },
      { l: 'Asking GP for interim support', t: 'I am on the waiting list for assessment. While I wait, I am finding it hard to cope. Is there any interim support available to me?' },
    ],
    support: [
      'Use Anchor every day — the Today, Now, Reset and TL;DR tools are built for this',
      'Routine and structure help now, before and after diagnosis',
      'Contact Mind or a local support group for peer support while you wait',
    ],
    links: [
      { title: 'Mind — support while waiting', url: 'https://www.mind.org.uk', icon: 'ti-heart', color: 'peach' },
      { title: 'ADHD UK — while you wait', url: 'https://adhduk.co.uk/adhd-while-waiting-for-diagnosis/', icon: 'ti-brain', color: 'lavender' },
      { title: 'NAS — support before diagnosis', url: 'https://www.autism.org.uk', icon: 'ti-heart', color: 'teal' },
    ],
  },
  {
    k: 'booked',
    l: 'My assessment is booked',
    sub: 'Preparing for assessment',
    color: 'teal',
    icon: 'ti-calendar-check',
    what: 'Your assessment appointment is confirmed. Preparing well helps you feel less overwhelmed on the day. You do not need to perform or prove anything — just describe your real experience.',
    next: [
      'Gather all your written notes and examples',
      'Prepare answers to common assessment questions',
      'Plan your journey and what you need to bring',
      'Plan recovery time after the appointment',
    ],
    prepare: [
      'Review your notes — childhood, school, work, relationships, daily functioning',
      'Note examples of masking if relevant',
      'Bring a trusted person if allowed and if it helps',
      'Write down anything you are worried about forgetting to mention',
      'Plan what to do if you get overwhelmed during the appointment',
    ],
    scripts: [
      { l: 'Asking about the format in advance', t: 'Could you tell me what to expect from the assessment? How long will it take, and what kinds of questions will be asked?' },
      { l: 'Asking for adjustments at assessment', t: 'I may need some adjustments during the assessment. Could I have breaks if needed, and can I have questions repeated if I need them?' },
      { l: 'If asked about masking', t: 'I find that I mask a lot in social and professional situations. What you see in this appointment may not reflect how I function day to day.' },
    ],
    support: [
      'Plan something calming for after the appointment',
      'Tell the assessor about your sensory needs at the start',
      'You are allowed to take notes or ask for things to be written down',
    ],
    links: [
      { title: 'NAS — what to expect at an autism assessment', url: 'https://www.autism.org.uk/advice-and-guidance/topics/diagnosis/assessment-and-diagnosis', icon: 'ti-clipboard-check', color: 'teal' },
      { title: 'ADDitude — ADHD assessment preparation', url: 'https://www.additudemag.com/adhd-testing-diagnosis/', icon: 'ti-brain', color: 'lavender' },
    ],
  },
  {
    k: 'assessed',
    l: 'I have had my assessment',
    sub: 'Waiting for the outcome',
    color: 'lavender',
    icon: 'ti-clipboard-check',
    what: 'The assessment has happened. You may be waiting for the report. This can take days to weeks. Try to be patient with yourself — the waiting can feel hard.',
    next: [
      'Ask how long the report will take',
      'Note the name and contact of the assessor or service',
      'Ask what happens next — will they contact you, or do you contact them?',
    ],
    prepare: [
      'Think about who you want to tell, and when',
      'Think about what you want from the outcome',
      'Consider what support you would like if you receive a diagnosis',
    ],
    scripts: [
      { l: 'Asking about the timeline for the report', t: 'Could you tell me how long the report will take and how I will receive it?' },
      { l: 'Following up if you have not heard', t: 'I had my assessment on [date]. I have not yet received my report. Could you give me an update on when to expect it?' },
    ],
    support: [
      'The waiting after assessment can be emotionally difficult',
      'Use Reset tools if you feel anxious or overwhelmed',
      'Talk to someone you trust about how you are feeling',
    ],
    links: [
      { title: 'Mind — processing a health experience', url: 'https://www.mind.org.uk', icon: 'ti-heart', color: 'peach' },
    ],
  },
  {
    k: 'result',
    l: 'I have my result',
    sub: 'Processing the outcome',
    color: 'peach',
    icon: 'ti-file-description',
    what: 'You have received your outcome. Whether you were diagnosed or not, this can bring up a lot of feelings. Relief, sadness, anger, confusion — all of these are normal.',
    next: [
      'Read your report when you feel ready — not all at once if needed',
      'Keep your report safe — you may need it for work, university, benefits, or future care',
      'Decide who you want to share it with, if anyone',
      'Ask about next steps — medication, therapy, support, or further assessment',
    ],
    prepare: [
      'If you were diagnosed: ask about what support is available next',
      'If you were not diagnosed: ask what the report recommends, and whether another assessment is suggested',
      'You are allowed to ask questions and request clarification',
    ],
    scripts: [
      { l: 'Asking about next steps after diagnosis', t: 'Now that I have a diagnosis, what support is available to me? What should I do next?' },
      { l: 'If you did not receive a diagnosis', t: 'I did not receive a diagnosis, but I still struggle with these things. What do you recommend I do next?' },
      { l: 'Sharing your diagnosis at work', t: 'I have recently received a diagnosis of [condition]. I would like to discuss what adjustments might help me at work.' },
      { l: 'Sharing your diagnosis with someone close', t: 'I have just received a diagnosis. I am still processing it. I wanted to tell you because it explains a lot about how I experience things.' },
    ],
    support: [
      'Processing a diagnosis takes time — there is no right speed',
      'A diagnosis does not change who you are — it explains some of your experience',
      'Peer support communities can be helpful — people who understand from the inside',
    ],
    links: [
      { title: 'Autistic UK — after diagnosis', url: 'https://autisticuk.org', icon: 'ti-heart', color: 'teal' },
      { title: 'ADHD UK — after diagnosis', url: 'https://adhduk.co.uk', icon: 'ti-brain', color: 'lavender' },
      { title: 'NAS — next steps after autism diagnosis', url: 'https://www.autism.org.uk/advice-and-guidance/topics/diagnosis/assessment-and-diagnosis', icon: 'ti-arrow-right', color: 'sky' },
    ],
  },
  {
    k: 'support',
    l: 'I need support now',
    sub: 'Support does not wait for diagnosis',
    color: 'teal',
    icon: 'ti-lifebuoy',
    what: 'You do not need a diagnosis to deserve support. Your needs are real now. This section is for anyone who needs help regardless of where they are in the process.',
    next: [
      'Use Anchor daily — Today, Now, Reset, and TL;DR are built for your needs',
      'Ask your employer or school about adjustments',
      'Contact your GP if difficulties are affecting your mental health',
      'Find a peer support community',
    ],
    prepare: [
      'You do not need to justify your needs — they are real regardless of a label',
      'Write down what helps and what does not',
      'Identify your most pressing need right now and start there',
    ],
    scripts: [
      { l: 'Asking for workplace adjustments', t: 'I am experiencing difficulties with [focus / sensory environment / written instructions] that affect my work. I would like to discuss some adjustments.' },
      { l: 'Asking for university support', t: 'I am struggling with aspects of university life. I would like to speak to the disability team about what support is available, with or without a formal diagnosis.' },
      { l: 'Talking to someone you trust', t: "I have been finding things really hard. I don't always have the words to explain it, but I wanted to let you know I'm struggling." },
    ],
    support: [
      'Routines, reminders, and structure help everyone — diagnosis or not',
      'Sensory tools (headphones, weighted blanket, fidget) are valid without a diagnosis',
      'Breaking tasks into steps reduces executive function load immediately',
      'You are allowed to rest, reduce demands, and ask for help',
    ],
    links: [
      { title: 'Mind — mental health support', url: 'https://www.mind.org.uk', icon: 'ti-heart', color: 'peach' },
      { title: 'Scope — disability and work adjustments', url: 'https://www.scope.org.uk', icon: 'ti-briefcase', color: 'sky' },
      { title: 'Samaritans — 116 123', url: 'https://www.samaritans.org', icon: 'ti-phone', color: 'teal' },
      { title: 'Shout — text HOME to 85258', url: 'https://giveusashout.org', icon: 'ti-message-circle', color: 'lavender' },
    ],
  },
];

const LINK_BG = {
  lavender: 'var(--lavender-l)', teal: 'var(--teal-l)',
  sky: 'var(--sky-l)', peach: 'var(--peach-l)', amber: 'var(--amber-l)',
};
const LINK_IC = {
  lavender: 'var(--lavender)', teal: 'var(--teal)',
  sky: 'var(--sky)', peach: 'var(--peach)', amber: 'var(--amber)',
};

export function renderDiagnosis() {
  setTopbar('Journey', 'Where are you in the process?');

  // Stage list view
  if (!state.diagnosisStage) {
    const savedStage = state.diagnosisStageKey || null;

    document.getElementById('content').innerHTML = `
      <div class="screen">
        <div class="notice purple">
          <strong>You do not need to wait for a diagnosis to deserve support.</strong><br>
          Your needs are real now. Tap where you are to see what to do next.
        </div>

        ${savedStage ? `
          <div class="notice green">
            You last selected: <strong>${STAGES.find(s => s.k === savedStage)?.l || ''}</strong><br>
            <button class="btn primary" style="margin-top:10px;margin-bottom:0"
              onclick="openStage('${savedStage}')">
              <i class="ti ti-arrow-right"></i> Continue from here
            </button>
          </div>
        ` : ''}

        <div class="section-label">Where are you right now?</div>

        ${STAGES.map((s, i) => `
          <button class="btn ${s.k === savedStage ? 'primary' : ''}"
            style="${s.k !== savedStage ? `border-left:4px solid var(--${s.color});` : ''}"
            onclick="openStage('${s.k}')">
            <span style="
              width:28px;height:28px;border-radius:50%;
              background:var(--${s.color}-l);
              color:var(--${s.color}-d);
              font-size:12px;font-weight:700;
              display:flex;align-items:center;justify-content:center;
              flex-shrink:0">${i + 1}</span>
            <div>
              <div style="font-size:14px">${s.l}</div>
              <div style="font-size:12px;font-weight:400;opacity:0.7;margin-top:2px">${s.sub}</div>
            </div>
          </button>
        `).join('')}
      </div>`;
    return;
  }

  // Stage detail view
  const s = STAGES.find(s => s.k === state.diagnosisStage);
  if (!s) { state.diagnosisStage = null; renderDiagnosis(); return; }

  // Sub-tab within a stage
  const tab = state.diagnosisTab || 'next';

  const TABS = [
    { k: 'next',    l: 'What next',  icon: 'ti-arrow-right' },
    { k: 'prepare', l: 'Prepare',    icon: 'ti-checklist' },
    { k: 'scripts', l: 'Scripts',    icon: 'ti-message-2' },
    { k: 'support', l: 'Support',    icon: 'ti-heart' },
    { k: 'links',   l: 'Links',      icon: 'ti-external-link' },
  ];

  const stageIdx = STAGES.findIndex(x => x.k === state.diagnosisStage);
  const prevStage = stageIdx > 0 ? STAGES[stageIdx - 1] : null;
  const nextStage = stageIdx < STAGES.length - 1 ? STAGES[stageIdx + 1] : null;

  document.getElementById('content').innerHTML = `
    <div class="screen">

      <!-- Back + stage header -->
      <button class="btn" style="margin-bottom:10px;color:var(--text-muted)"
        onclick="state.diagnosisStage=null;state.diagnosisTab=null;renderDiagnosisScreen()">
        <i class="ti ti-arrow-left"></i> All stages
      </button>

      <div class="card ${s.color}">
        <div class="card-label">Stage ${stageIdx + 1} of ${STAGES.length}</div>
        <div class="card-main">${s.l}</div>
        <div class="card-sub" style="margin-top:8px;line-height:1.6">${s.what}</div>
      </div>

      <!-- Progress bar -->
      <div class="progress-bar" style="margin-bottom:16px">
        <div class="progress-fill"
          style="width:${((stageIdx + 1) / STAGES.length) * 100}%"></div>
      </div>

      <!-- Sub-tabs -->
      <div style="display:flex;gap:6px;margin-bottom:14px;overflow-x:auto;padding-bottom:2px">
        ${TABS.map(t => `
          <button onclick="state.diagnosisTab='${t.k}';renderDiagnosisScreen()"
            style="padding:7px 12px;white-space:nowrap;
                   border:2px solid ${tab === t.k ? `var(--${s.color})` : 'var(--border)'};
                   border-radius:var(--r-pill);
                   background:${tab === t.k ? `var(--${s.color}-l)` : 'var(--bg-card)'};
                   color:${tab === t.k ? `var(--${s.color}-d)` : 'var(--text-primary)'};
                   font-size:12px;font-weight:700;font-family:var(--font);cursor:pointer;
                   display:flex;align-items:center;gap:5px">
            <i class="ti ${t.icon}" style="font-size:14px"></i>${t.l}
          </button>`).join('')}
      </div>

      <!-- Tab content -->
      ${tab === 'next' ? `
        <div class="section-label">What happens next</div>
        ${s.next.map((item, i) => `
          <div style="display:flex;gap:12px;align-items:flex-start;
                      padding:10px 0;border-bottom:1.5px solid var(--border)">
            <span style="
              width:24px;height:24px;border-radius:50%;flex-shrink:0;margin-top:1px;
              background:var(--${s.color}-l);color:var(--${s.color}-d);
              font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center">
              ${i + 1}
            </span>
            <div style="font-size:15px;color:var(--text-primary);line-height:1.5">${item}</div>
          </div>`).join('')}
      ` : ''}

      ${tab === 'prepare' ? `
        <div class="section-label">How to prepare</div>
        ${s.prepare.map(item => `
          <div class="task-row">
            <div class="task-check"
              onclick="this.classList.toggle('done');
                this.innerHTML = this.classList.contains('done')
                  ? '<i class=\\'ti ti-check\\' style=\\'font-size:14px\\'></i>' : ''">
            </div>
            <div style="font-size:15px;color:var(--text-primary);line-height:1.5;flex:1">${item}</div>
          </div>`).join('')}
      ` : ''}

      ${tab === 'scripts' ? `
        <div class="section-label">Scripts for appointments and conversations</div>
        <div class="notice blue" style="margin-bottom:12px">
          These are starting points. Change the words to sound like you.
        </div>
        ${s.scripts.map(sc => `
          <div class="card" style="margin-bottom:10px">
            <div class="card-label">${sc.l}</div>
            <div style="font-size:15px;color:var(--text-primary);line-height:1.6;margin-bottom:10px">"${sc.t}"</div>
            <button onclick="copyDiagScript('${sc.t.replace(/'/g, "\\'")}', this)"
              class="btn sky" style="width:auto;padding:8px 14px;margin:0;font-size:13px">
              <i class="ti ti-copy"></i> Copy
            </button>
          </div>`).join('')}
      ` : ''}

      ${tab === 'support' ? `
        <div class="section-label">Support you can use now</div>
        <div class="notice green" style="margin-bottom:12px">
          You do not need to wait for a diagnosis to use these.
        </div>
        ${s.support.map(item => `
          <div class="task-row">
            <span style="color:var(--teal);font-size:18px;flex-shrink:0;margin-top:2px">
              <i class="ti ti-check" aria-hidden="true"></i>
            </span>
            <div style="font-size:15px;color:var(--text-primary);line-height:1.5;flex:1">${item}</div>
          </div>`).join('')}
      ` : ''}

      ${tab === 'links' ? `
        <div class="section-label">Useful links for this stage</div>
        ${s.links.map(lk => `
          <a href="${lk.url}" target="_blank" rel="noopener noreferrer" class="link-card">
            <div class="link-icon" style="background:${LINK_BG[lk.color]}">
              <i class="ti ${lk.icon}" aria-hidden="true" style="color:${LINK_IC[lk.color]}"></i>
            </div>
            <div style="flex:1">
              <div class="link-title">${lk.title}</div>
              <div class="link-sub">${lk.url.replace(/^https?:\/\//, '').split('/')[0]}</div>
            </div>
            <i class="ti ti-external-link" aria-hidden="true"
               style="font-size:16px;color:var(--text-muted);flex-shrink:0"></i>
          </a>`).join('')}
      ` : ''}

      <!-- Stage navigation -->
      <div style="display:flex;gap:8px;margin-top:1.5rem">
        ${prevStage ? `
          <button class="btn" style="flex:1;justify-content:flex-start"
            onclick="openStage('${prevStage.k}')">
            <i class="ti ti-arrow-left"></i> ${prevStage.sub}
          </button>` : '<div style="flex:1"></div>'}
        ${nextStage ? `
          <button class="btn primary" style="flex:1;justify-content:flex-end"
            onclick="openStage('${nextStage.k}')">
            ${nextStage.sub} <i class="ti ti-arrow-right"></i>
          </button>` : ''}
      </div>

    </div>`;
}

window.openStage = (k) => {
  state.diagnosisStage    = k;
  state.diagnosisStageKey = k;   // persist the last-selected stage
  state.diagnosisTab      = 'next';
  renderDiagnosis();
};

window.copyDiagScript = (text, btn) => {
  navigator.clipboard.writeText(text).catch(() => {});
  btn.innerHTML = '<i class="ti ti-check"></i> Copied';
  setTimeout(() => { btn.innerHTML = '<i class="ti ti-copy"></i> Copy'; }, 1500);
};

window.renderDiagnosisScreen = renderDiagnosis;
register('diagnosis', renderDiagnosis);
