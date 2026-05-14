import { state } from '../../data/state.js';
import { register, setTopbar, go } from '../../app/router.js';

// ─── Local state ──────────────────────────────────────────
if (!state.diagnosisCondition)  state.diagnosisCondition  = 'adhd'; // adhd | autism | dyslexia | dyspraxia
if (!state.diagnosisStage)      state.diagnosisStage      = null;
if (!state.diagnosisStageKey)   state.diagnosisStageKey   = {}; // { condition: stageKey }
if (!state.diagnosisTab)        state.diagnosisTab        = 'overview';
if (!state.diagnosisChecked)    state.diagnosisChecked    = {}; // { condition: { stageKey: [bool, ...] } }
if (!state.diagnosisNotes)      state.diagnosisNotes      = {}; // { condition: { stageKey: string } }

// Migrate old single-condition state if needed (from earlier version)
if (Array.isArray(state.diagnosisStageKey)) state.diagnosisStageKey = {};
if (typeof state.diagnosisStageKey === 'string') {
  const old = state.diagnosisStageKey;
  state.diagnosisStageKey = { adhd: old };
}

// ─── Conditions ───────────────────────────────────────────
const CONDITIONS = [
  { k: 'adhd',      l: 'ADHD',      icon: 'ti-brain',     color: 'lavender' },
  { k: 'autism',    l: 'Autism',    icon: 'ti-heart',     color: 'teal' },
  { k: 'dyslexia',  l: 'Dyslexia',  icon: 'ti-book',      color: 'sky' },
  { k: 'dyspraxia', l: 'Dyspraxia', icon: 'ti-hand-move', color: 'amber' },
];

const LINK_BG = {
  lavender: 'var(--lavender-l)', teal: 'var(--teal-l)',
  sky: 'var(--sky-l)', peach: 'var(--peach-l)', amber: 'var(--amber-l)',
};
const LINK_IC = {
  lavender: 'var(--lavender)', teal: 'var(--teal)',
  sky: 'var(--sky)', peach: 'var(--peach)', amber: 'var(--amber)',
};
// ═══════════════════════════════════════════════════════════
// ADHD — 10 stages, includes titration
// ═══════════════════════════════════════════════════════════
const STAGES_ADHD = [
  {
    k: 'noticing', num: 1, color: 'lavender', icon: 'ti-bulb',
    l: 'I think I might have ADHD',
    sub: 'Noticing patterns',
    what: 'You are noticing that focus, time, and organisation feel harder for you than they seem to for other people. ADHD is not just being distracted — it shows up as restlessness, difficulty starting things, time blindness, emotional intensity, hyperfocus on the wrong things, and forgetting what you walked into a room to do. At this stage, the goal is observation, not diagnosis.',

    next: [
      'Start writing down examples — focus, time, organisation, emotional regulation',
      'Note how long things have been this way — ADHD is lifelong',
      'Read accounts by adults with ADHD and see what resonates',
      'Talk to someone you trust about what you have noticed',
      'You do not need a diagnosis to start using support strategies today',
    ],

    prepare: [
      'List specific recent examples — missed deadlines, lost items, half-finished projects',
      'Note any childhood examples — school reports, parents\' descriptions',
      'Notice patterns: time blindness, rejection sensitivity, executive dysfunction',
      'Note any family history — ADHD has a strong genetic component',
      'Try a screening tool (ASRS-v1.1) to organise your thoughts',
    ],

    scripts: [
      { l: 'Thinking it out loud to yourself',
        t: 'I have always struggled with focus, follow-through, and time, more than the people around me. These patterns have been there since childhood. I think I might have ADHD and want to look into it.' },
      { l: 'Mentioning it to a friend or partner',
        t: 'I have been thinking I might have ADHD. The forgetting, the difficulty starting tasks, the emotional intensity — these have always been there. I am not asking for advice, just want to say it out loud.' },
    ],

    support: [
      'Use reminders and external structure now — you do not need a diagnosis first',
      'Break tasks into 2-minute first steps',
      'Body doubling helps with starting',
      'Notice your energy peaks — work with them, not against',
      'Reduce unnecessary demands where you can',
      'Track what causes overwhelm and what helps recovery',
    ],

    links: [
      { title: 'ADHD UK — Adult symptoms',
        sub: 'Comprehensive overview of adult ADHD presentations',
        url: 'https://adhduk.co.uk/symptoms-of-adhd/', icon: 'ti-brain', color: 'lavender' },
      { title: 'ADHD Foundation — Adult ADHD',
        sub: 'UK charity with adult-focused information',
        url: 'https://www.adhdfoundation.org.uk/information/adults/', icon: 'ti-heart', color: 'teal' },
      { title: 'ASRS-v1.1 — WHO adult ADHD screener',
        sub: 'Widely-used screening questionnaire (not a diagnosis)',
        url: 'https://add.org/adhd-questionnaire/', icon: 'ti-clipboard-check', color: 'amber' },
      { title: 'How to ADHD — YouTube',
        sub: 'Accessible video accounts of adult ADHD experience',
        url: 'https://www.youtube.com/@HowtoADHD', icon: 'ti-player-play', color: 'sky' },
    ],
  },

  {
    k: 'collecting', num: 2, color: 'sky', icon: 'ti-notes',
    l: 'I am collecting examples',
    sub: 'Building your ADHD picture',
    what: 'ADHD assessments rely heavily on history — both childhood and adult. The assessor needs evidence that symptoms have been present since before age 12 and continue to affect daily life. Writing examples down ahead of time makes the assessment much easier, especially because ADHD can make on-the-spot recall difficult.',

    next: [
      'Document specific examples across focus, time, organisation, impulsivity, emotion',
      'Gather childhood evidence — school reports, family memories',
      'Ask family members what they noticed about you as a child',
      'Note how symptoms affect work, relationships, finances, daily life',
      'Save your notes somewhere reliable',
    ],

    prepare: [
      'List 5-10 examples of focus problems (zoning out, hyperfocus, distraction)',
      'List 5-10 examples of executive dysfunction (starting, switching, finishing)',
      'List examples of time blindness — chronic lateness, missed deadlines, time disappearing',
      'List examples of impulsivity — interrupting, decisions, spending',
      'List emotional regulation examples — RSD, frustration, overwhelm',
      'Find school reports if you can — comments about daydreaming, talking, not finishing work',
      'Ask a parent: "What was I like as a child? What did teachers say?"',
    ],

    scripts: [
      { l: 'Asking a parent for childhood examples',
        t: 'I am exploring whether I have ADHD. Can you tell me what I was like as a child? Anything you remember about my focus, energy, school reports, or behaviour. Any detail helps, even things that seemed normal at the time.' },
      { l: 'Asking a partner for outside perspective',
        t: 'I am gathering examples of how ADHD might affect me. Could you tell me what you notice — things like forgetfulness, time issues, starting things, emotional intensity? I want your honest view.' },
      { l: 'Self-reflection prompt',
        t: 'When I think about my ADHD-like patterns: focus is hardest when [X]. Time slips away when [Y]. I struggle most with [Z]. The strategies that already help are [list].' },
    ],

    support: [
      'Use Bowline\'s Brain Dump to capture examples without organising them',
      'A list of 10-20 specific examples is plenty for an assessment',
      'Notice what helps too — that is just as useful as what is hard',
      'Take photos of school reports or write them out — assessors may want to see them',
      'Keep all notes in one place — a folder, a doc, a notes app',
    ],

    links: [
      { title: 'ADDitude — Preparing for ADHD assessment',
        sub: 'What to document before your appointment',
        url: 'https://www.additudemag.com/adhd-diagnosis-adults/', icon: 'ti-clipboard-check', color: 'amber' },
      { title: 'ADHD UK — Pre-assessment checklist',
        sub: 'Structured list of what to bring',
        url: 'https://adhduk.co.uk/getting-an-adhd-diagnosis/', icon: 'ti-list-check', color: 'lavender' },
      { title: 'CHADD — Adult ADHD symptoms',
        sub: 'US-based but comprehensive symptom guide',
        url: 'https://chadd.org/for-adults/overview/', icon: 'ti-book', color: 'sky' },
    ],
  },

  {
    k: 'gp', num: 3, color: 'teal', icon: 'ti-stethoscope',
    l: 'I have spoken to my GP',
    sub: 'First professional step',
    what: 'For NHS ADHD assessment, your GP is the gatekeeper. You need a referral. GPs cannot diagnose ADHD themselves — only a specialist (psychiatrist or specialist nurse) can. In England, Right to Choose lets you pick your assessment provider, often shortening the wait dramatically. Some GPs are excellent; others know little about adult ADHD. Be prepared for either.',

    next: [
      'Book a GP appointment specifically to discuss possible ADHD',
      'Ask for a referral to an adult ADHD assessment service',
      'Mention Right to Choose (England only) — this lets you pick the provider',
      'Get a copy of the referral letter',
      'Ask the GP what to do if you do not hear back within 6 weeks',
    ],

    prepare: [
      'Bring your written examples and any childhood evidence',
      'Have a clear opening sentence: "I would like a referral for an adult ADHD assessment"',
      'Mention any conditions ruled out (thyroid, anxiety, depression) if relevant',
      'Print the ASRS-v1.1 result if you completed one',
      'Know which Right to Choose providers exist before the appointment (England)',
      'Take a trusted person if appointments overwhelm you',
      'If the GP is dismissive, ask politely to escalate to a specialist opinion',
    ],

    scripts: [
      { l: 'Asking for a referral (direct)',
        t: 'I would like a referral for an adult ADHD assessment. I have lifelong patterns of focus, time, and executive function difficulties that affect my daily life. I have written examples I can share.' },
      { l: 'Asking about Right to Choose (England)',
        t: 'Under NHS Right to Choose, I would like to choose my assessment provider rather than use the local NHS waiting list. Could you include that in my referral? I have already identified [provider name] as the one I want.' },
      { l: 'If the GP seems unsure',
        t: 'I understand ADHD can be hard to spot in adults. I have written examples and a screening tool result. I would prefer to discuss this with a specialist rather than have it ruled out today.' },
      { l: 'Asking for the referral letter',
        t: 'Could you send me a copy of the referral letter? It helps me keep track and confirm the provider received it.' },
      { l: 'If you feel dismissed',
        t: 'Thank you for your time. I would like to book another appointment with a different GP to discuss this. ADHD is significantly affecting my daily life and I would like a specialist opinion.' },
    ],

    support: [
      'Take a trusted person with you',
      'Write down 3 things you must say at the start of the appointment',
      'Ask for written notes or a follow-up email',
      'Use TL;DR Assist on any letters you receive',
      'Note what the GP said immediately after — memory fades fast',
    ],

    links: [
      { title: 'NHS — Adult ADHD diagnosis',
        sub: 'Official NHS pathway and referral process',
        url: 'https://www.nhs.uk/conditions/attention-deficit-hyperactivity-disorder-adhd/diagnosis/', icon: 'ti-stethoscope', color: 'teal' },
      { title: 'NHS Right to Choose (England)',
        sub: 'Your right to pick your assessment provider',
        url: 'https://www.england.nhs.uk/contact-us/right-to-choose/', icon: 'ti-arrow-right', color: 'sky' },
      { title: 'ADHD UK — Right to Choose providers',
        sub: 'Up-to-date list of NHS-funded providers',
        url: 'https://adhduk.co.uk/right-to-choose/', icon: 'ti-list', color: 'amber' },
      { title: 'ADHD UK — Letter to GP template',
        sub: 'A pre-written letter to print and bring',
        url: 'https://adhduk.co.uk/gp-letter/', icon: 'ti-file-text', color: 'lavender' },
    ],
  },

  {
    k: 'referred', num: 4, color: 'amber', icon: 'ti-send',
    l: 'My referral has been sent',
    sub: 'Waiting for it to be accepted',
    what: 'The GP has sent the referral. Now the assessment service needs to accept it and add you to their waiting list. Right to Choose providers often respond within weeks. Local NHS services can take much longer just to acknowledge. Track the date carefully — you may need to chase.',

    next: [
      'Note the date of referral and the name of the service',
      'If you have not heard within 4-6 weeks, chase the service directly',
      'If chasing the service is hard, ask your GP to chase on your behalf',
      'Keep all correspondence (letters, emails) in one folder',
      'Update contact details with both GP and service if anything changes',
    ],

    prepare: [
      'Save the GP referral letter if you got a copy',
      'Note the service phone number and email',
      'Set a reminder in 4 weeks to chase if needed',
      'If using Right to Choose, you may receive paperwork from the provider directly',
      'Create a Bowline folder or notes file for everything ADHD-related',
    ],

    scripts: [
      { l: 'Chasing the service after 4-6 weeks',
        t: 'Hello, my GP referred me on [date] for an adult ADHD assessment. I have not yet had confirmation that my referral was accepted. Could you tell me the status and what happens next?' },
      { l: 'Asking about waiting times',
        t: 'Could you tell me the current waiting time for ADHD assessment, and what I should expect after the referral is accepted?' },
      { l: 'If the GP says they have not heard back',
        t: 'Could you re-send the referral, or contact the service directly to confirm it was received? It has been [X] weeks now.' },
    ],

    support: [
      'You do not need to wait for assessment to use support strategies',
      'Use Bowline\'s Today, Reset, and TL;DR tools while you wait',
      'Keep one folder for all ADHD-related correspondence',
      'Build a simple rhythm: check post weekly, not daily',
    ],

    links: [
      { title: 'ADHD UK — Navigating NHS waiting lists',
        sub: 'Practical guidance for the waiting period',
        url: 'https://adhduk.co.uk/nhs-assessment/', icon: 'ti-brain', color: 'lavender' },
      { title: 'NHS — Patient Advice and Liaison Service (PALS)',
        sub: 'If you have concerns about your referral or care',
        url: 'https://www.nhs.uk/nhs-services/hospitals/what-is-pals-patient-advice-and-liaison-service/', icon: 'ti-message-circle', color: 'sky' },
    ],
  },

  {
    k: 'waiting', num: 5, color: 'sky', icon: 'ti-clock',
    l: 'I am waiting',
    sub: 'On the waiting list',
    what: 'NHS adult ADHD waits can be months to several years depending on where you live. Right to Choose providers are often faster. The wait is not a reflection of how serious your needs are — the system is overwhelmed. Many people feel forgotten during this stage. You are not. Keep using strategies and supports now.',

    next: [
      'Use Bowline every day — Today, Reset, and TL;DR are built for this',
      'Apply for Access to Work — no diagnosis needed in the UK',
      'Speak to your employer about adjustments',
      'Find peer support — Reddit r/ADHDUK, ADHD UK communities',
      'Keep adding to your evidence list as things happen',
    ],

    prepare: [
      'Document anything significant — sick days, missed deadlines, work feedback',
      'Save records of impact — credit card late fees, parking fines, missed appointments',
      'Note any major life changes (job loss, relationship strain, financial issues)',
      'If your difficulties become a crisis, tell your GP — that may escalate the referral',
      'Connect with online peer support to reduce isolation during the wait',
    ],

    scripts: [
      { l: 'Asking employer for adjustments while waiting',
        t: 'I am currently waiting for an ADHD assessment. While I wait, I would like to discuss some adjustments that may help me work effectively — fewer interruptions, clearer written instructions, deadline reminders. Happy to share more detail.' },
      { l: 'Asking GP for interim support',
        t: 'I am on the ADHD waiting list but really struggling. Is any interim support available — coaching, therapy, or local services I could access now?' },
      { l: 'Reaching out to a friend for support',
        t: 'I am waiting for an ADHD assessment and it is taking a long time. I do not need advice, but it would help to know I can talk to you sometimes about how things are going.' },
    ],

    support: [
      'ADHD coaching can be accessed privately without a diagnosis',
      'Access to Work covers ADHD-related workplace support — apply now',
      'Body doubling apps and communities work without diagnosis',
      'Routine and external structure help everyone — start now',
      'You are allowed to drop, defer, and ask for help',
    ],

    links: [
      { title: 'ADHD UK — While you wait',
        sub: 'Specific strategies for the ADHD waiting period',
        url: 'https://adhduk.co.uk/i-am-waiting-for-an-adhd-assessment/', icon: 'ti-brain', color: 'lavender' },
      { title: 'Access to Work (UK government)',
        sub: 'Workplace support funding — no diagnosis required',
        url: 'https://www.gov.uk/access-to-work', icon: 'ti-briefcase', color: 'sky' },
      { title: 'r/ADHDUK — Reddit peer community',
        sub: 'Active UK-specific community for waiting & post-diagnosis',
        url: 'https://www.reddit.com/r/ADHDUK/', icon: 'ti-users', color: 'teal' },
      { title: 'ADDA — Adult ADHD support',
        sub: 'Online support groups and resources',
        url: 'https://add.org/', icon: 'ti-heart', color: 'peach' },
    ],
  },

  {
    k: 'booked', num: 6, color: 'teal', icon: 'ti-calendar-check',
    l: 'My assessment is booked',
    sub: 'Preparing for assessment',
    what: 'Your ADHD assessment is confirmed. It is usually a 2-3 hour conversation with a psychiatrist or specialist nurse, often online. They will go through DSM-5 or ICD-11 criteria, ask about childhood, work, relationships, and may ask for an informant report (a parent or partner who knew you well). It is not a test you can fail or pass — it is a structured conversation.',

    next: [
      'Gather all your written notes, childhood evidence, screening results',
      'Identify an informant — usually a parent — who can speak to childhood symptoms',
      'Plan what you need on the day — water, fidget, headphones, snack',
      'Plan recovery time after — assessments are exhausting',
      'Confirm the format (online/in-person) and what you need to set up',
    ],

    prepare: [
      'Review your notes one more time the day before, not the morning of',
      'Prepare your informant: tell them what the assessor may ask',
      'Have your school reports or childhood evidence ready to share',
      'Note what your daily life looks like — sleep, eating, work patterns',
      'Be ready to discuss past mental health (anxiety, depression often co-occur)',
      'List medications, supplements, recreational substances',
      'Eat and hydrate before — assessments can run long',
      'For online: test the video link and audio in advance',
    ],

    scripts: [
      { l: 'Asking about the format in advance',
        t: 'Could you tell me what to expect from the assessment? How long, what topics, will I need an informant present, and is it OK to bring written notes?' },
      { l: 'Asking your informant',
        t: 'I am being assessed for ADHD. The assessor may want to speak briefly to someone who knew me as a child. Would you be willing to give a short interview, or at least write a few sentences about what I was like growing up?' },
      { l: 'Asking for adjustments at assessment',
        t: 'I may need some adjustments. Could I have breaks if needed, written questions where possible, and is it OK to fidget or look away while thinking?' },
      { l: 'If you do not know an answer',
        t: 'I am not sure how to answer that. Can you rephrase, or can I think about it for a moment? I want to answer accurately rather than just quickly.' },
      { l: 'If the assessor moves too fast',
        t: 'Could we slow down? I am processing what you said and want to make sure I give an accurate answer.' },
    ],

    support: [
      'Tell the assessor about sensory needs at the start',
      'You can take notes or ask for things to be written down',
      'It is OK to fidget, look away, take breaks',
      'Plan nothing demanding for the rest of that day',
      'Pre-cook a meal, set up quiet entertainment — assessments leave you wiped',
    ],

    links: [
      { title: 'ADDitude — What happens at ADHD assessment',
        sub: 'Detailed walk-through of the assessment process',
        url: 'https://www.additudemag.com/adhd-testing-diagnosis/', icon: 'ti-clipboard-check', color: 'amber' },
      { title: 'ADHD UK — Assessment day guide',
        sub: 'Practical UK-specific tips for the appointment',
        url: 'https://adhduk.co.uk/getting-an-adhd-diagnosis/', icon: 'ti-list-check', color: 'lavender' },
      { title: 'DIVA-5 — Diagnostic interview',
        sub: 'The structured interview your assessor may use',
        url: 'https://www.divacenter.eu/DIVA.aspx', icon: 'ti-book', color: 'sky' },
    ],
  },

  {
    k: 'assessed', num: 7, color: 'lavender', icon: 'ti-clipboard-check',
    l: 'I have had my assessment',
    sub: 'Waiting for the outcome',
    what: 'The assessment has happened. Many ADHD assessors give an outcome verbally on the day. Others write a report you receive in 2-6 weeks. Either way, you may feel exposed, doubtful, exhausted, or relieved. All of that is normal. The waiting after assessment is its own kind of difficult.',

    next: [
      'Ask how and when you will receive the formal report',
      'Note anything verbally said you want to remember',
      'Ask what happens next — medication referral, follow-up, support?',
      'Get the assessor\'s or service\'s contact details',
      'Be gentle with yourself for the next few days',
    ],

    prepare: [
      'Think about who you want to tell, and when',
      'Think about what you want from a diagnosis — medication? identity? adjustments?',
      'Consider whether you want medication or other treatments',
      'Give yourself permission to feel everything — relief, doubt, sadness, all of it',
    ],

    scripts: [
      { l: 'Asking about the report timeline',
        t: 'Could you tell me when I will receive my written report, and how — post, email, or both?' },
      { l: 'Following up if you have not heard',
        t: 'I had my ADHD assessment on [date]. I have not yet received my written report. Could you give me an update?' },
      { l: 'Telling someone close',
        t: 'I had my ADHD assessment yesterday. I am still processing it. The formal report comes in a few weeks. I do not need to talk in detail yet, but wanted you to know.' },
    ],

    support: [
      'Be gentle with yourself for the next few days',
      'Use Bowline\'s Reset tools if you feel anxious or doubtful',
      'Sleep and food matter more than usual right now',
      'Do not push yourself to make big decisions until the report comes',
    ],

    links: [
      { title: 'ADHD UK — After your assessment',
        sub: 'What happens next, including report timeline',
        url: 'https://adhduk.co.uk/getting-an-adhd-diagnosis/', icon: 'ti-clock', color: 'lavender' },
      { title: 'Mind — Processing health appointments',
        sub: 'Mental health support after difficult appointments',
        url: 'https://www.mind.org.uk', icon: 'ti-heart', color: 'peach' },
    ],
  },

  {
    k: 'result', num: 8, color: 'peach', icon: 'ti-file-description',
    l: 'I have my result',
    sub: 'Processing the diagnosis',
    what: 'You have your outcome. Whether diagnosed or not, this can bring up a lot. Relief, grief, anger at the years before, validation, doubt — all of it normal. A diagnosis does not change who you are. It explains some of your experience. Take your time.',

    next: [
      'Read the report when you feel ready — not all at once if needed',
      'Keep your report safe — Access to Work, employers, future care may need it',
      'Decide who you want to tell, and when',
      'Ask about medication if you want to explore it',
      'Give yourself weeks or months to process',
    ],

    prepare: [
      'If diagnosed and considering medication — research the options (stimulant vs non-stimulant)',
      'Keep a copy of the report in two safe places',
      'Note any practical recommendations',
      'Consider neurodiversity-affirming therapy',
      'Look into ADHD coaching',
    ],

    scripts: [
      { l: 'Asking about medication',
        t: 'Now that I have a diagnosis, I would like to discuss medication. Can you tell me about the options, what titration looks like, and how soon I could start?' },
      { l: 'Telling your employer (formal)',
        t: 'I am writing to let you know I have been diagnosed with ADHD. I would like to arrange a meeting to discuss reasonable adjustments under the Equality Act.' },
      { l: 'Telling your employer (informal)',
        t: 'I wanted to share — I have just been diagnosed with ADHD. I am still figuring out what it means for me, but wanted you to know in case useful.' },
      { l: 'Telling a partner or close family',
        t: 'I just got my ADHD diagnosis. It explains a lot of things I have always struggled with. I am still processing it. I do not need answers, just understanding right now.' },
      { l: 'Telling a friend',
        t: 'I had an assessment and got an ADHD diagnosis. I am still figuring out what to do with it. Mostly I just wanted to tell you.' },
    ],

    support: [
      'Processing a diagnosis can take weeks or months',
      'A diagnosis does not change who you are — it explains some of your experience',
      'Peer communities can be a lifeline',
      'You may want to revisit your past with new context — take it slowly',
      'Therapy with a neurodiversity-affirming professional helps',
    ],

    links: [
      { title: 'ADHD UK — Newly diagnosed',
        sub: 'What to do after an adult ADHD diagnosis',
        url: 'https://adhduk.co.uk/newly-diagnosed-with-adhd/', icon: 'ti-brain', color: 'lavender' },
      { title: 'Access to Work (UK)',
        sub: 'Government funding for workplace adjustments',
        url: 'https://www.gov.uk/access-to-work', icon: 'ti-coin', color: 'teal' },
      { title: 'ADDitude — Newly diagnosed adults',
        sub: 'In-depth resources for the first year post-diagnosis',
        url: 'https://www.additudemag.com/adhd-adults/', icon: 'ti-book', color: 'sky' },
    ],
  },

  {
    k: 'support', num: 9, color: 'teal', icon: 'ti-lifebuoy',
    l: 'I need support now',
    sub: 'Support does not wait for diagnosis',
    what: 'Wherever you are in the process — pre-referral, waiting, just diagnosed, or years past — your ADHD needs are real now. You do not need a diagnosis to deserve support, ask for adjustments, or use strategies.',

    next: [
      'Use Bowline daily — Today, Now, Reset, TL;DR are built for ADHD brains',
      'Ask your employer about adjustments',
      'Apply for Access to Work',
      'Find peer support — r/ADHDUK is excellent',
      'Consider ADHD coaching (private, no diagnosis required)',
    ],

    prepare: [
      'You do not need to justify your needs — they are real regardless',
      'Write down what helps and what does not',
      'Identify your most pressing need and start there',
    ],

    scripts: [
      { l: 'Asking for workplace adjustments',
        t: 'I have difficulties with focus, transitions, and time management. I would like to discuss adjustments — clearer instructions, fewer interruptions, scheduled check-ins. Happy to share more.' },
      { l: 'Asking GP for mental health support',
        t: 'My ADHD-related difficulties are affecting my mental health. I would like to discuss what support is available now — therapy, coaching, peer groups.' },
      { l: 'Saying no to a demand',
        t: 'Thank you for asking. Right now I am not able to take this on. I will let you know if that changes.' },
    ],

    support: [
      'Routines, reminders, body doubling — all valid without diagnosis',
      'You are allowed to rest, reduce demands, and ask for help',
      'Crisis lines do not require a diagnosis',
    ],

    links: [
      { title: 'Mind — Crisis support',
        sub: 'UK mental health support and crisis resources',
        url: 'https://www.mind.org.uk/need-urgent-help/', icon: 'ti-heart', color: 'peach' },
      { title: 'Samaritans — 24/7 listening',
        sub: 'Free phone line: 116 123',
        url: 'https://www.samaritans.org', icon: 'ti-phone', color: 'sky' },
      { title: 'Access to Work (UK)',
        sub: 'Workplace adjustments funding',
        url: 'https://www.gov.uk/access-to-work', icon: 'ti-briefcase', color: 'teal' },
    ],
  },

  {
    k: 'titration', num: 10, color: 'sky', icon: 'ti-adjustments',
    l: 'I am starting titration',
    sub: 'Finding your medication and dose',
    what: 'Titration is the process of finding the right medication and the right dose for you. It is not a single appointment — it is a series of small steps over weeks or months. You start on a low dose, see how your body and brain respond, then adjust upwards (or sideways to a different medication) until you find what works. The goal is the lowest dose that gives you the benefit you need with side effects you can live with. Some people land on their first medication. Others try two or three. Both are normal.',

    next: [
      'You will start on a low dose of one medication',
      'You will be reviewed regularly — usually every 2 to 6 weeks at first',
      'At each review, the dose may go up, stay the same, or change',
      'You will keep going until you and your prescriber agree you have found the right dose',
      'Once stable, reviews drop to every 6 to 12 months',
      'Titration usually takes 2 to 6 months — sometimes longer',
    ],

    prepare: [
      'Ask which medication you are starting and why',
      'Ask what side effects to watch for in the first 2 weeks',
      'Ask what counts as a reason to call before your next review',
      'Set up Bowline\'s titration tracker on the Now screen — log daily',
      'Plan how you will collect prescriptions (Schedule 2 stimulants are not repeat-prescribed)',
      'Know which pharmacy stocks your medication — stimulants can be hard to find',
      'Have a baseline blood pressure and heart rate reading',
      'Tell someone close to you — they may notice changes you miss',
    ],

    scripts: [
      { l: 'At your first titration appointment',
        t: 'Before we start, can you tell me what to expect over the next few months? Starting dose, review schedule, and what to do if side effects appear between appointments?' },
      { l: 'Logging honestly — what to tell your prescriber',
        t: 'Since my last review: the medication helps with [focus / impulsivity / overwhelm] for about [X] hours. Side effects: [appetite / sleep / mood]. Benefit 1-10: [X]. Side effects 1-10: [X]. I would like to [stay / increase / change].' },
      { l: 'If a dose is not working',
        t: 'I have been on [dose] for [X] weeks. I am not seeing much benefit, and side effects are [list]. I would like to discuss increasing the dose or trying a different medication.' },
      { l: 'Asking about Shared Care (UK)',
        t: 'Now that I am stable, can we discuss moving to Shared Care with my GP? My GP would take over prescribing while you remain the specialist overseeing my treatment.' },
      { l: 'If you cannot get hold of your medication',
        t: 'I cannot fill my prescription at [pharmacy] — they have no stock. Can you help me find an alternative pharmacy or discuss a temporary alternative?' },
    ],

    support: [
      'Use Bowline\'s titration tracker daily — your prescriber needs this data',
      'Take medication at the same time every day',
      'Eat something before stimulants, even if appetite is low',
      'Drink water through the day',
      'Sleep is the first thing affected — protect it',
      'Honest feedback at reviews matters more than sounding "fine"',
      'You can stop or change medication at any point — this is your choice',
    ],

    links: [
      { title: 'NICE — ADHD medication guidance',
        sub: 'Official UK clinical guidelines for ADHD prescribing',
        url: 'https://www.nice.org.uk/guidance/ng87/chapter/Recommendations#medication', icon: 'ti-clipboard-check', color: 'teal' },
      { title: 'ADHD UK — Medication overview',
        sub: 'Plain-language guide to UK ADHD medications',
        url: 'https://adhduk.co.uk/adhd-medication/', icon: 'ti-pill', color: 'lavender' },
      { title: 'ADDitude — Titration explained',
        sub: 'What to expect during the dose-finding process',
        url: 'https://www.additudemag.com/adhd-medication-titration-process/', icon: 'ti-adjustments', color: 'sky' },
      { title: 'ADHD UK — Shared Care agreements',
        sub: 'Moving prescribing from specialist to GP once stable',
        url: 'https://adhduk.co.uk/shared-care/', icon: 'ti-users', color: 'amber' },
      { title: 'NHS — Methylphenidate',
        sub: 'Official NHS medicine information',
        url: 'https://www.nhs.uk/medicines/methylphenidate-adults/', icon: 'ti-info-circle', color: 'teal' },
      { title: 'NHS — Lisdexamfetamine (Elvanse)',
        sub: 'Official NHS medicine information',
        url: 'https://www.nhs.uk/medicines/lisdexamfetamine/', icon: 'ti-info-circle', color: 'teal' },
      { title: 'NHS — Atomoxetine',
        sub: 'Non-stimulant ADHD medication information',
        url: 'https://www.nhs.uk/medicines/atomoxetine/', icon: 'ti-info-circle', color: 'teal' },
      { title: 'NHS — Guanfacine',
        sub: 'Non-stimulant ADHD medication information',
        url: 'https://www.nhs.uk/medicines/guanfacine/', icon: 'ti-info-circle', color: 'teal' },
    ],
  },
];
// ═══════════════════════════════════════════════════════════
// AUTISM — 9 stages, no titration (no specific meds)
// ═══════════════════════════════════════════════════════════
const STAGES_AUTISM = [
  {
    k: 'noticing', num: 1, color: 'teal', icon: 'ti-bulb',
    l: 'I think I might be autistic',
    sub: 'Noticing patterns',
    what: 'You are noticing that the social world, sensory environment, or daily transitions cost you more energy than they seem to cost other people. Autism in adults — especially in women, non-binary people, and people of colour — is often missed because masking can hide it. Common patterns: social exhaustion, sensory overload, deep special interests, difficulty with unwritten rules, need for routine, autistic burnout. You do not need to be certain to start exploring.',

    next: [
      'Start writing down examples — social, sensory, routine, communication',
      'Note how long these patterns have been present (autism is lifelong)',
      'Read accounts by late-diagnosed autistic adults',
      'Try the AQ-10 or RAADS-R screening tools',
      'Talk to someone you trust about what you have noticed',
    ],

    prepare: [
      'List sensory examples — sounds, textures, lights that overwhelm or soothe',
      'List social examples — exhaustion after socialising, scripted interactions, masking',
      'Note your special interests across life — depth, intensity, longevity',
      'Notice your relationship with routine and change',
      'Consider whether anyone in your family is autistic — it has a genetic component',
    ],

    scripts: [
      { l: 'Thinking it out loud to yourself',
        t: 'I have always experienced the world differently — sensory things hit harder, social things take more effort, I need more downtime than others seem to. I think I might be autistic and want to explore this.' },
      { l: 'Mentioning it to a friend or partner',
        t: 'I have been thinking I might be autistic. The way social things drain me, sensory overload, my need for predictability — they have always been there. I am not asking for advice, just want to say it out loud.' },
    ],

    support: [
      'You do not need a diagnosis to start using autistic-affirming strategies',
      'Reduce sensory input where you can — headphones, sunglasses, quieter routes',
      'Honour your need for downtime — schedule recovery after social events',
      'Use written communication where possible',
      'Track what causes overwhelm and what helps recovery',
      'Read autistic writers — Pete Wharmby, Devon Price, Hannah Gadsby',
    ],

    links: [
      { title: 'National Autistic Society — signs of autism in adults',
        sub: 'NHS-aligned overview of common autism traits',
        url: 'https://www.autism.org.uk/advice-and-guidance/what-is-autism/the-history-of-autism/signs-of-autism-in-adults', icon: 'ti-heart', color: 'teal' },
      { title: 'Embrace Autism — RAADS-R screening',
        sub: 'A widely-used self-report screener',
        url: 'https://embrace-autism.com/raads-r/', icon: 'ti-clipboard-check', color: 'amber' },
      { title: 'AQ-10 — short autism screener',
        sub: 'NHS-aligned 10-item screening questionnaire',
        url: 'https://www.autismresearchcentre.com/tests/autism-spectrum-quotient-aq/', icon: 'ti-clipboard', color: 'sky' },
      { title: 'Autistic Not Weird — Adult perspectives',
        sub: 'Writing by an autistic adult and educator',
        url: 'https://autisticnotweird.com', icon: 'ti-users', color: 'lavender' },
    ],
  },

  {
    k: 'collecting', num: 2, color: 'sky', icon: 'ti-notes',
    l: 'I am collecting examples',
    sub: 'Building your autism picture',
    what: 'Autism assessments rely heavily on developmental history — what you were like as a child, how patterns have evolved, how they affect you now. Because masking can hide autism for years, the assessor needs evidence of long-term patterns. Writing examples down ahead of time is essential because the assessment itself can be overwhelming.',

    next: [
      'Document examples across: social communication, sensory, routines, interests',
      'Gather childhood evidence — school reports, family memories, photos if helpful',
      'Ask family members about you as a child',
      'Note how masking shows up — what scripts you use, what you suppress',
      'Save your notes in one place',
    ],

    prepare: [
      'List 5-10 social communication examples (literal interpretation, scripts, eye contact)',
      'List 5-10 sensory examples across all senses, both over- and under-responsive',
      'List routines and rituals — what you do daily, what disrupts you',
      'List special interests — current and past, depth and intensity',
      'Note executive function difficulties — transitions, planning, monotropism',
      'List childhood examples — what teachers said, how you played, friendships',
      'Note any autistic burnout episodes — duration, what triggered them',
      'Document masking — what you suppress, the cost of social events',
    ],

    scripts: [
      { l: 'Asking a parent for childhood examples',
        t: 'I am exploring whether I am autistic. Could you tell me what I was like as a child? How I played, friendships, sensory things, routines, interests. Even small details help — autism in girls and quiet kids is often missed.' },
      { l: 'Asking a partner for outside perspective',
        t: 'I am gathering examples for an autism assessment. Could you tell me what you notice — social exhaustion, sensory things, routines, my interests, how I communicate? I want your honest view.' },
      { l: 'Self-reflection prompt',
        t: 'Social interaction costs me [X] energy. Sensory overload happens when [Y]. My deep interests are [list]. The masking I do includes [examples]. Recovery from social events takes [X].' },
    ],

    support: [
      'Use Bowline\'s Brain Dump to capture without organising',
      'A list of 15-25 specific examples is plenty',
      'Notice what helps too — stimming, special interests, alone time',
      'Save school reports, photos, or other developmental evidence',
      'Keep all notes in one folder',
    ],

    links: [
      { title: 'NAS — Pre-assessment guide',
        sub: 'What to gather before your appointment',
        url: 'https://www.autism.org.uk/advice-and-guidance/topics/diagnosis/assessment-and-diagnosis', icon: 'ti-clipboard-check', color: 'teal' },
      { title: 'Embrace Autism — Diagnosis prep',
        sub: 'Detailed guide to documenting your experience',
        url: 'https://embrace-autism.com/autism-diagnosis-process/', icon: 'ti-list-check', color: 'amber' },
      { title: 'Autistic UK — Self-reflection prompts',
        sub: 'Questions to help organise your thoughts',
        url: 'https://autisticuk.org', icon: 'ti-book', color: 'sky' },
    ],
  },

  {
    k: 'gp', num: 3, color: 'lavender', icon: 'ti-stethoscope',
    l: 'I have spoken to my GP',
    sub: 'First professional step',
    what: 'For NHS autism assessment, your GP is the referral route. GPs cannot diagnose autism — only a specialist team (typically a psychologist, psychiatrist, and sometimes SLT or OT) can. Many GPs know little about adult autism, especially in women and people who mask well. Be prepared for either a smooth referral or a need to advocate firmly. Right to Choose (England) sometimes applies to autism, though provision is patchier than for ADHD.',

    next: [
      'Book an appointment specifically to discuss possible autism',
      'Ask for a referral to an adult autism assessment service',
      'Ask about Right to Choose providers if in England',
      'Get a copy of the referral letter',
      'Ask what to do if you have not heard back within 6 weeks',
    ],

    prepare: [
      'Bring your written examples',
      'Have a clear opening: "I would like a referral for an adult autism assessment"',
      'Print your screening results (AQ-10 or RAADS-R)',
      'Be ready to summarise key examples briefly — GPs are time-pressed',
      'Take a trusted person if appointments overwhelm you',
      'If the GP says "you do not seem autistic", explain masking calmly',
    ],

    scripts: [
      { l: 'Asking for a referral',
        t: 'I would like a referral for an adult autism assessment. I have lifelong patterns of sensory, social, and routine differences that significantly affect my daily life. I have written examples and screening results I can share.' },
      { l: 'Asking about Right to Choose',
        t: 'I understand Right to Choose may apply for autism assessment. Could you check if I can pick my provider and include that in the referral?' },
      { l: 'If the GP says you do not seem autistic',
        t: 'I understand it can be hard to see — I have been masking my whole life. That is the point. I would like a specialist opinion rather than have this ruled out today.' },
      { l: 'If the GP seems unsure',
        t: 'I have prepared written examples and a screening tool result. I would like to discuss this with a specialist who has experience with adult autism, especially in [women / non-binary / people who mask].' },
      { l: 'Asking for the referral letter',
        t: 'Could you send me a copy of the referral letter? It helps me track the process and confirm the provider received it.' },
    ],

    support: [
      'Bring written notes — appointments are short and stressful',
      'Take a trusted person for second pair of ears',
      'Ask for follow-up notes or a written summary',
      'Use TL;DR Assist on letters you receive',
      'Right after the appointment, write down what was said',
    ],

    links: [
      { title: 'NHS — Getting diagnosed with autism',
        sub: 'Official NHS guidance for adult autism assessment',
        url: 'https://www.nhs.uk/conditions/autism/getting-diagnosed/diagnosis/', icon: 'ti-stethoscope', color: 'teal' },
      { title: 'NAS — How to ask your GP',
        sub: 'Practical guide to the GP conversation',
        url: 'https://www.autism.org.uk/advice-and-guidance/topics/diagnosis/getting-a-diagnosis-as-an-adult', icon: 'ti-message-circle', color: 'lavender' },
      { title: 'NAS — GP letter template',
        sub: 'A pre-written letter for autism referral',
        url: 'https://www.autism.org.uk/advice-and-guidance/topics/diagnosis/getting-a-diagnosis-as-an-adult', icon: 'ti-file-text', color: 'sky' },
    ],
  },

  {
    k: 'waiting', num: 4, color: 'sky', icon: 'ti-clock',
    l: 'I am waiting',
    sub: 'On the assessment waiting list',
    what: 'NHS adult autism waiting lists are among the longest in mental health care — often 1-3 years, sometimes longer. The wait does not reflect your need. Some people pay privately to bypass the wait (£1,500-£3,500 typically). Others use the time to build their evidence base and access support that does not need diagnosis. Both are valid.',

    next: [
      'Use Bowline daily — Today, Reset, and TL;DR are built for this',
      'Apply for Access to Work — no diagnosis required',
      'Speak to your employer about adjustments',
      'Find peer support — autistic communities online (NAS, Reddit r/aspergers, r/autism)',
      'Consider whether private assessment is right for you',
      'Keep adding to your evidence as significant things happen',
    ],

    prepare: [
      'Document anything significant — sensory crashes, social aftermath, burnout',
      'Note major life changes that strain capacity',
      'If your difficulties become crisis, tell your GP — may escalate',
      'Look into autistic-affirming therapists (NAS directory)',
      'Connect with autistic communities to reduce isolation',
    ],

    scripts: [
      { l: 'Asking employer for adjustments while waiting',
        t: 'I am undergoing assessment for autism and would like to discuss some adjustments that may help me work effectively — quieter workspace, written instructions, predictable schedule, reduced spontaneous meetings.' },
      { l: 'Asking for university support',
        t: 'I am awaiting an autism assessment. I would like to speak to the disability team about what support is available now, with or without formal diagnosis. The wait is around [X] months.' },
      { l: 'Reaching out to a friend',
        t: 'I am waiting for an autism assessment and it is taking ages. I do not need advice. It would help to know I can talk to you sometimes about how it is going.' },
    ],

    support: [
      'Sensory tools (headphones, weighted blanket, sunglasses) are valid without label',
      'Stimming is regulation — not something to suppress in private',
      'Lower your social load — say no to optional things',
      'Stop trying to push through autistic burnout — it makes it worse',
      'Schedule recovery time after demanding events',
      'Many workplaces will adjust based on self-disclosure alone',
    ],

    links: [
      { title: 'NAS — Waiting for assessment',
        sub: 'What to expect during the long waiting period',
        url: 'https://www.autism.org.uk/advice-and-guidance/topics/diagnosis', icon: 'ti-clock', color: 'amber' },
      { title: 'Access to Work (UK)',
        sub: 'Workplace support funding — no diagnosis needed',
        url: 'https://www.gov.uk/access-to-work', icon: 'ti-briefcase', color: 'sky' },
      { title: 'NAS — Autistic-friendly therapist directory',
        sub: 'Find therapists experienced with autism',
        url: 'https://www.autism.org.uk/directory', icon: 'ti-heart', color: 'teal' },
      { title: 'Autistica — Research charity',
        sub: 'Research, resources, and community',
        url: 'https://www.autistica.org.uk', icon: 'ti-microscope', color: 'lavender' },
    ],
  },

  {
    k: 'booked', num: 5, color: 'teal', icon: 'ti-calendar-check',
    l: 'My assessment is booked',
    sub: 'Preparing for assessment',
    what: 'Autism assessments are typically longer than ADHD assessments — often 3-5 hours, sometimes split over 2 days. They may include a developmental interview (with you and an informant), the ADOS-2 (an observational assessment), and questionnaires. Masking during assessment can hide what they need to see — it is OK to come as yourself, including stimming, looking away, taking breaks.',

    next: [
      'Gather all notes, childhood evidence, screening results',
      'Identify an informant — a parent or someone who knew you as a child',
      'Plan what you need on the day — water, fidget, sunglasses, ear protection',
      'Plan recovery — autism assessments are deeply exhausting',
      'Confirm format and what you need to set up',
    ],

    prepare: [
      'Review notes the day before, not the morning of',
      'Prepare your informant: tell them what the assessor may ask',
      'Have school reports and developmental evidence ready',
      'List sensory needs — what helps, what is hard',
      'List masking strategies you use day to day',
      'Note any autistic burnout episodes — when, how long, what triggered them',
      'Eat and hydrate before — long assessments deplete you',
      'For online: test the link, audio, and your space',
      'Plan a quiet evening with no demands afterwards',
    ],

    scripts: [
      { l: 'Asking about the format',
        t: 'Could you tell me what to expect? How long, what topics, will I need an informant, what is the ADOS-2 if you use it, and is it OK to bring written notes or stim during the appointment?' },
      { l: 'Asking your informant',
        t: 'I am being assessed for autism. The assessor may want to interview someone who knew me as a child. Would you be willing to do this, or at least write a summary of what I was like growing up?' },
      { l: 'Asking for adjustments',
        t: 'I have some sensory and social needs. Could the room be quiet, lighting dimmable, and could we have breaks? Could I have written prompts where possible? Is it OK to stim or look away?' },
      { l: 'If you mask automatically',
        t: 'I want to flag that I mask heavily and automatically. What you see in this appointment may not reflect how I function. I have written notes about masking, and have tried to come as myself, but it is hard to switch off.' },
      { l: 'If the assessor moves too fast',
        t: 'Could we slow down? I am processing what you said. I want to give an accurate answer rather than the first thing that comes to mind.' },
    ],

    support: [
      'Tell the assessor about sensory needs at the start',
      'You can stim, fidget, look away, take breaks',
      'Bring sensory tools — headphones, sunglasses, fidget',
      'Bring water and snacks',
      'Plan nothing demanding for that day OR the day after',
      'Recovery from autism assessments often takes days',
    ],

    links: [
      { title: 'NAS — What to expect at autism assessment',
        sub: 'Detailed overview of the adult assessment process',
        url: 'https://www.autism.org.uk/advice-and-guidance/topics/diagnosis/assessment-and-diagnosis/adults', icon: 'ti-clipboard-check', color: 'teal' },
      { title: 'Embrace Autism — Diagnosis day guide',
        sub: 'Practical tips for the assessment appointment',
        url: 'https://embrace-autism.com/autism-diagnosis-process/', icon: 'ti-list-check', color: 'amber' },
      { title: 'About the ADOS-2',
        sub: 'What the observational assessment involves',
        url: 'https://www.autism.org.uk/advice-and-guidance/topics/diagnosis/assessment-and-diagnosis/adults/diagnostic-tools', icon: 'ti-info-circle', color: 'sky' },
    ],
  },

  {
    k: 'assessed', num: 6, color: 'lavender', icon: 'ti-clipboard-check',
    l: 'I have had my assessment',
    sub: 'Waiting for the outcome',
    what: 'The assessment is done. Some teams give a verbal outcome on the day; others write a formal report in 4-12 weeks. The aftermath of autism assessment can feel raw — you have just spent hours describing your life in detail. Exhaustion, sensory hangover, doubt, exposure are all normal. Take your time.',

    next: [
      'Ask when and how you will receive the written report',
      'Note anything verbally said you want to remember',
      'Ask what happens next — support, follow-up, signposting?',
      'Get the team\'s contact details',
      'Be very gentle with yourself for the next few days',
    ],

    prepare: [
      'Think about who you want to tell, and when',
      'Think about what you want from a diagnosis — adjustments, identity, both?',
      'Give yourself permission to feel everything',
      'Allow time for autistic burnout from the assessment itself',
    ],

    scripts: [
      { l: 'Asking about the report timeline',
        t: 'Could you tell me when I will receive my written report, and how? Will it come by post or email?' },
      { l: 'Following up if delayed',
        t: 'I had my autism assessment on [date]. I have not received my report. Could you give me an update?' },
      { l: 'Telling someone close',
        t: 'I had my autism assessment. I am completely wiped out. The report comes in a few weeks. I do not need to talk in detail yet, just wanted you to know.' },
    ],

    support: [
      'Autism assessment recovery can take days — plan for it',
      'Sensory protection: low lights, headphones, quiet space',
      'Use Bowline\'s Reset tools if you feel exposed or doubtful',
      'Sleep, food, water — the basics matter more than usual',
      'Do not push yourself to make big decisions until the report comes',
    ],

    links: [
      { title: 'NAS — Post-assessment information',
        sub: 'What happens between assessment and report',
        url: 'https://www.autism.org.uk/advice-and-guidance/topics/diagnosis', icon: 'ti-clock', color: 'teal' },
      { title: 'Mind — Processing health appointments',
        sub: 'Mental health support after difficult appointments',
        url: 'https://www.mind.org.uk', icon: 'ti-heart', color: 'peach' },
    ],
  },

  {
    k: 'result', num: 7, color: 'peach', icon: 'ti-file-description',
    l: 'I have my result',
    sub: 'Processing the diagnosis',
    what: 'You have your outcome. Whether diagnosed or not, processing can take months. Grief for the years before you knew, anger at missed support, relief, validation, doubt — all normal. A diagnosis does not change who you are. It explains some of your experience and gives you language. Late-diagnosed autistic adults often describe a "rewriting the past" phase. It can be intense. Go slowly.',

    next: [
      'Read the report when you feel ready — it does not need to be today',
      'Keep your report safe — Access to Work, employers, future care may need it',
      'Decide who you want to tell, and when',
      'Ask about local autistic-led groups',
      'Give yourself months to process — there is no rush',
    ],

    prepare: [
      'Keep a copy of the report in two safe places',
      'Note any practical recommendations',
      'Consider autistic-affirming therapy (NAS directory)',
      'Look at autistic community resources — NAS, Autistic UK',
      'You do not have to tell anyone unless and until you want to',
    ],

    scripts: [
      { l: 'Telling your employer (formal)',
        t: 'I am writing to share that I have been formally diagnosed as autistic. I would like to arrange a meeting to discuss reasonable adjustments under the Equality Act.' },
      { l: 'Telling your employer (informal)',
        t: 'I wanted to share that I have just been diagnosed as autistic. I am still figuring out what it means for me, but wanted you to know in case useful.' },
      { l: 'Telling a partner or close family',
        t: 'I have just been diagnosed as autistic. It explains a lot of things I have always experienced. I am still processing it. I do not need answers, just understanding right now.' },
      { l: 'Telling a friend',
        t: 'I had an assessment and got an autism diagnosis. I am still figuring out what to do with it. Mostly I just wanted to tell you, because you are someone I trust.' },
      { l: 'If you did not receive a diagnosis',
        t: 'I did not receive an autism diagnosis but still experience these things. What does the report recommend, and could I be reassessed in future? Are there other things to explore?' },
    ],

    support: [
      'Processing can take months — go slowly',
      'You can unmask in stages, with people you trust',
      'Late-diagnosis grief is real — find autistic peer support',
      'Therapy with an autism-affirming therapist helps a lot',
      'Autistic communities online and in person are a lifeline',
    ],

    links: [
      { title: 'NAS — After your diagnosis',
        sub: 'Official guidance from the National Autistic Society',
        url: 'https://www.autism.org.uk/advice-and-guidance/topics/diagnosis/after-your-diagnosis', icon: 'ti-arrow-right', color: 'teal' },
      { title: 'Autistic UK — After diagnosis',
        sub: 'Resources for newly-diagnosed autistic adults',
        url: 'https://autisticuk.org', icon: 'ti-heart', color: 'lavender' },
      { title: 'Access to Work (UK)',
        sub: 'Government funding for workplace adjustments',
        url: 'https://www.gov.uk/access-to-work', icon: 'ti-coin', color: 'sky' },
      { title: 'Neurodiversity Hub — Workplace disclosure',
        sub: 'Should you tell your employer? When and how?',
        url: 'https://www.neurodiversityhub.org', icon: 'ti-briefcase', color: 'amber' },
    ],
  },

  {
    k: 'support', num: 8, color: 'teal', icon: 'ti-lifebuoy',
    l: 'I need support now',
    sub: 'Support does not wait for diagnosis',
    what: 'Wherever you are — pre-referral, waiting, just diagnosed, or years past — your autistic needs are real now. You do not need a diagnosis to deserve sensory accommodations, social adjustments, or strategies. You also do not need to mask to be acceptable.',

    next: [
      'Use Bowline daily — Today, Now, Reset are built for autistic-friendly pacing',
      'Reduce sensory input where you can',
      'Reduce social load — say no to optional events',
      'Ask employer or school about adjustments',
      'Find autistic peer support — NAS forums, Reddit r/autism, local groups',
    ],

    prepare: [
      'You do not need to justify your needs — they are real regardless of label',
      'Identify your most draining demand right now',
      'Notice what sensory and social things consistently overwhelm you',
    ],

    scripts: [
      { l: 'Asking for workplace adjustments',
        t: 'I have difficulties with sensory environment, transitions, and unwritten expectations. I would like to discuss adjustments — quieter workspace, written instructions, predictable schedule, advance notice of changes.' },
      { l: 'Asking for university support',
        t: 'I am struggling with aspects of university life. I would like to speak to the disability team about what support is available, with or without a formal diagnosis.' },
      { l: 'Setting a boundary',
        t: 'Thank you for inviting me. I am not going to make it. It is not personal — I need a quiet evening.' },
      { l: 'Asking for accommodation in healthcare',
        t: 'I find waiting rooms and unfamiliar settings hard. Could I wait somewhere quieter, or get a clearer estimate of when I will be seen? It would help.' },
      { l: 'Telling someone you trust you are struggling',
        t: 'I have been finding things really hard lately. I do not always have the right words. I am not asking you to fix it — just want to let you know.' },
    ],

    support: [
      'Stimming, sensory tools, scripts — all valid without diagnosis',
      'Lower your social load — autistic burnout is real and slow to recover from',
      'Routines and predictability help — protect them',
      'You are allowed to rest, reduce demands, and ask for help',
      'Crisis lines do not require a diagnosis',
    ],

    links: [
      { title: 'Mind — Crisis support',
        sub: 'UK mental health support and crisis resources',
        url: 'https://www.mind.org.uk/need-urgent-help/', icon: 'ti-heart', color: 'peach' },
      { title: 'Samaritans — 24/7 listening',
        sub: 'Free phone line: 116 123',
        url: 'https://www.samaritans.org', icon: 'ti-phone', color: 'sky' },
      { title: 'Shout crisis text line',
        sub: 'Text HOME to 85258 (UK) — free, 24/7',
        url: 'https://giveusashout.org', icon: 'ti-message-circle', color: 'lavender' },
      { title: 'NAS helpline',
        sub: 'Information and support: 0808 800 4104',
        url: 'https://www.autism.org.uk/contact-us/helpline', icon: 'ti-phone-call', color: 'teal' },
    ],
  },

  {
    k: 'living', num: 9, color: 'lavender', icon: 'ti-heart-handshake',
    l: 'Living with diagnosis',
    sub: 'Long-term, post-processing',
    what: 'You are past the initial processing. Day-to-day life with autism is not a problem to be solved — it is a way of being that has costs, gifts, and rhythms. The work now is shaping a life that fits you, not bending yourself to fit a neurotypical mould. This stage is ongoing — there is no end point. Burnout cycles, sensory limits, social capacity all need ongoing care.',

    next: [
      'Notice your own patterns of burnout and prevent it before it lands',
      'Build a life that matches your actual capacity, not the one you "should" have',
      'Find your community — autistic friendships often feel different and easier',
      'Revisit adjustments at work or study — needs change over time',
      'Advocate for yourself, gently and persistently',
    ],

    prepare: [
      'Know your early warning signs of burnout',
      'Know what reliably regulates you — sensory, social, special interests',
      'Have a recovery protocol — what to do when things get hard',
      'Keep your diagnostic report safe and accessible — you will need it again',
      'Re-read the report once a year — context shifts as you understand more',
    ],

    scripts: [
      { l: 'Requesting updated adjustments at work',
        t: 'Some time has passed since we set up my adjustments. I would like to review them — what is working, what could be better, what I would like to change.' },
      { l: 'Saying no without guilt',
        t: 'Thank you for thinking of me. I am not going to take that on. I am protecting my capacity for [important thing].' },
      { l: 'Asking for autism-affirming therapy',
        t: 'I am looking for a therapist with experience supporting autistic adults. Could you let me know whether you have that experience, and if not, refer me to someone who does?' },
      { l: 'Educating someone close who does not get it',
        t: 'When I [behave a certain way], it is not [their assumption] — it is autism. It would help me if you could [specific request]. I am not asking you to change everything, just to understand this.' },
    ],

    support: [
      'Autistic burnout is the major risk — prevent it, do not just survive it',
      'Sensory hygiene matters every day — protect downtime',
      'Special interests are regulation, not indulgence',
      'Find autistic friends if you can — different rhythm, less translation',
      'Annual review of accommodations and life shape',
      'You are allowed to change your mind about what you need',
    ],

    links: [
      { title: 'NAS — Living with autism',
        sub: 'Long-term support and resources',
        url: 'https://www.autism.org.uk/advice-and-guidance', icon: 'ti-heart-handshake', color: 'teal' },
      { title: 'Autistic UK — Adult resources',
        sub: 'By and for autistic adults',
        url: 'https://autisticuk.org', icon: 'ti-users', color: 'lavender' },
      { title: 'Pete Wharmby — Autistic writer',
        sub: 'Books and writing on autistic adult life',
        url: 'https://www.petewharmby.com', icon: 'ti-book', color: 'sky' },
      { title: 'Reframing Autism',
        sub: 'Autistic-led education and community',
        url: 'https://reframingautism.org.au', icon: 'ti-bulb', color: 'amber' },
    ],
  },
];
// ═══════════════════════════════════════════════════════════
// DYSLEXIA — 8 stages, ed-psych / SpLD assessment pathway
// ═══════════════════════════════════════════════════════════
const STAGES_DYSLEXIA = [
  {
    k: 'noticing', num: 1, color: 'sky', icon: 'ti-bulb',
    l: 'I think I might be dyslexic',
    sub: 'Noticing patterns',
    what: 'Adult dyslexia goes beyond "reads slowly." It often shows up as effortful reading, spelling that does not stick, losing your place on a page, slow processing of written instructions, difficulty taking notes while listening, struggling to retrieve words, and exhaustion after a day of reading or writing. Many dyslexic adults are smart and compensated their way through school, then hit a wall in work or further study. Recognising it as dyslexia rather than "being slow" can change everything.',

    next: [
      'Start writing down examples — reading, spelling, note-taking, sequencing',
      'Note how long this has been the case (dyslexia is lifelong)',
      'Read accounts by adults with dyslexia',
      'Try the British Dyslexia Association adult checklist',
      'Talk to someone you trust about what you have noticed',
    ],

    prepare: [
      'List reading examples — slow reading, re-reading, losing place, comprehension drop',
      'List writing examples — spelling, word retrieval, organising thoughts on paper',
      'List sequencing examples — instructions, dates, phone numbers, directions',
      'List working memory examples — losing what you walked in for, dropping things mid-thought',
      'Note any family history — dyslexia has a strong genetic component',
      'Notice strengths too — verbal thinking, problem-solving, big-picture, creativity',
    ],

    scripts: [
      { l: 'Thinking it out loud to yourself',
        t: 'Reading and writing have always taken more effort for me than for the people around me. I think I might be dyslexic and want to understand whether that explains it.' },
      { l: 'Mentioning it to a friend or partner',
        t: 'I have been thinking I might be dyslexic. The reading speed, the spelling, the way I get tangled in written instructions — they have been there forever. I am not asking for advice, just want to say it out loud.' },
    ],

    support: [
      'Use text-to-speech (built into iOS, Android, Mac, Windows) for reading',
      'Use speech-to-text for writing emails and notes',
      'Increase font size and line spacing — reduces visual stress',
      'Try off-white backgrounds (cream, beige) instead of bright white',
      'Use Bowline\'s TL;DR Assist for complex written content',
      'Audio books and podcasts are valid ways to consume information',
    ],

    links: [
      { title: 'British Dyslexia Association — Adult checklist',
        sub: 'Self-screening for adult dyslexia',
        url: 'https://www.bdadyslexia.org.uk/dyslexia/about-dyslexia/dyslexia-and-specific-difficulties-overview/dyslexia/adult-dyslexia-checklist', icon: 'ti-clipboard-check', color: 'sky' },
      { title: 'BDA — About dyslexia',
        sub: 'Comprehensive UK information',
        url: 'https://www.bdadyslexia.org.uk/dyslexia', icon: 'ti-book', color: 'teal' },
      { title: 'Made by Dyslexia — Strengths perspective',
        sub: 'Dyslexic thinking as a different way of processing',
        url: 'https://www.madebydyslexia.org', icon: 'ti-bulb', color: 'amber' },
      { title: 'Dyslexia Association of Ireland — Adults',
        sub: 'Useful adult-focused info applicable across UK & Ireland',
        url: 'https://dyslexia.ie/info-hub/adults/', icon: 'ti-heart', color: 'lavender' },
    ],
  },

  {
    k: 'collecting', num: 2, color: 'teal', icon: 'ti-notes',
    l: 'I am collecting examples',
    sub: 'Building your dyslexia picture',
    what: 'A formal dyslexia assessment looks for a specific cognitive profile: difficulties with phonological processing, reading speed, working memory, and processing speed, alongside areas of cognitive strength. Writing down your experience ahead of time helps the assessor and helps you. School reports are particularly valuable evidence of long-standing patterns.',

    next: [
      'Document specific examples across reading, writing, sequencing, memory',
      'Find school reports — comments on reading, spelling, "could try harder"',
      'Ask family what they remember about your reading and writing as a child',
      'Note how dyslexia affects work or study now',
      'Save everything in one folder',
    ],

    prepare: [
      'List reading examples — slow, fatiguing, losing comprehension, avoiding reading',
      'List writing examples — spelling, sentence-level grammar, organising on paper',
      'List sequencing — alphabet, months, multi-step instructions, mental arithmetic',
      'List working memory — losing point mid-sentence, repeating questions, names',
      'Find childhood evidence — slow to read, hated reading aloud, spelling tests, school comments',
      'Note compensating strategies you developed — listening hard, asking others, audio',
      'Note strengths — verbal reasoning, problem-solving, creativity, big-picture thinking',
      'Save any previous assessments (SEN, school-based screening)',
    ],

    scripts: [
      { l: 'Asking a parent for childhood examples',
        t: 'I am exploring whether I am dyslexic. Could you tell me what you remember about my reading and writing as a child? School reports, struggles, what teachers said. Even small details help.' },
      { l: 'Asking a teacher or tutor (if still in touch)',
        t: 'I am exploring whether I have dyslexia. I remember struggling with [X]. Do you remember anything specific from when you taught me, or have any old records you could share?' },
      { l: 'Self-reflection prompt',
        t: 'When I read, [X] is hard. When I write, [Y] takes effort. Things I have always struggled with: [list]. Things I have developed to compensate: [list]. My strengths are: [list].' },
    ],

    support: [
      'Brain Dump your thoughts in Bowline — do not worry about spelling',
      'Use voice notes or speech-to-text to collect examples',
      'A list of 10-15 specific examples is plenty',
      'Find school reports if you can — even one or two photos help',
      'Note what helps reading too — fonts, colours, audio versions',
    ],

    links: [
      { title: 'BDA — Preparing for assessment',
        sub: 'What to gather before a diagnostic assessment',
        url: 'https://www.bdadyslexia.org.uk/services/assessments', icon: 'ti-clipboard-check', color: 'sky' },
      { title: 'PATOSS — SpLD professional body',
        sub: 'Information about SpLD assessors and assessments',
        url: 'https://www.patoss-dyslexia.org', icon: 'ti-school', color: 'teal' },
    ],
  },

  {
    k: 'route', num: 3, color: 'lavender', icon: 'ti-route',
    l: 'Choosing my assessment route',
    sub: 'NHS, private, university, or workplace',
    what: 'Unlike ADHD or autism, NHS dyslexia assessment for adults is rare. Most adults are assessed through: (1) university disability services if studying; (2) Access to Work via the Disabled Students\' Allowance (DSA) if going into higher education; (3) workplace via Access to Work; or (4) privately, paid yourself. Private assessment by a chartered psychologist or qualified SpLD specialist typically costs £400-£800. Some employers will pay. It is worth checking all routes before paying.',

    next: [
      'Check if you are eligible for assessment through university or college',
      'Check if your employer will pay (via Access to Work or HR)',
      'Get quotes from private SpLD assessors if going private',
      'Make sure the assessor is qualified — APC or AMBDA accredited',
      'Plan how the assessment will be used — DSA, workplace, personal clarity?',
    ],

    prepare: [
      'List your purpose: DSA funding? Workplace? Personal understanding? All three?',
      'Find your local Access to Work contact if employed',
      'Check university disability services if studying or about to study',
      'Get 2-3 quotes if going private — prices vary widely',
      'Verify assessor credentials — APC (Assessment Practising Certificate) or AMBDA',
      'Check what report format you need — DSA-compliant if applying for student support',
    ],

    scripts: [
      { l: 'Asking your university disability team',
        t: 'I am a student and think I may have dyslexia. Could you tell me about the assessment options — does the university provide assessment, signpost to it, or fund it through DSA?' },
      { l: 'Asking your employer',
        t: 'I think I may have dyslexia. I would like to discuss whether the company would support an assessment, either funded directly or through Access to Work. I think it would help me work more effectively.' },
      { l: 'Contacting a private assessor',
        t: 'I am looking for an adult dyslexia assessment. Could you confirm your qualifications, the cost, the format of the report, and what the assessment involves? I [do / do not] need a DSA-compliant report.' },
      { l: 'Asking your GP for a referral',
        t: 'I would like to discuss whether NHS support exists for adult dyslexia assessment in this area. I understand it is limited but want to know what is available before going private.' },
    ],

    support: [
      'You do not need to go private — workplace and university routes are valid',
      'A DSA-compliant report is more thorough but more expensive',
      'Some assessors offer online assessment, which is more flexible',
      'Check the assessor will see adults (some focus on children)',
      'A diagnosis from a child can still be valid as an adult — dig out old reports',
    ],

    links: [
      { title: 'BDA — Find an assessor',
        sub: 'Directory of qualified adult dyslexia assessors',
        url: 'https://www.bdadyslexia.org.uk/services/assessments', icon: 'ti-search', color: 'sky' },
      { title: 'Access to Work (UK)',
        sub: 'May fund assessment for working adults',
        url: 'https://www.gov.uk/access-to-work', icon: 'ti-briefcase', color: 'teal' },
      { title: 'Disabled Students\' Allowance (DSA)',
        sub: 'Funding for assessment and support in higher education',
        url: 'https://www.gov.uk/disabled-students-allowance-dsa', icon: 'ti-school', color: 'lavender' },
      { title: 'PATOSS — SpLD assessor directory',
        sub: 'Verified specialist teacher assessors',
        url: 'https://www.patoss-dyslexia.org/find-a-tutor', icon: 'ti-users', color: 'amber' },
    ],
  },

  {
    k: 'booked', num: 4, color: 'teal', icon: 'ti-calendar-check',
    l: 'My assessment is booked',
    sub: 'Preparing for assessment',
    what: 'Adult dyslexia assessment is typically 3-4 hours, in person or sometimes online. It includes cognitive tests (working memory, processing speed, phonological skills), reading and writing tasks, and an interview. It can feel exposing — being asked to read aloud, spell, do timed tasks. Remember: this is not an IQ test or a measure of intelligence. It is identifying a specific learning profile.',

    next: [
      'Gather all your notes, school reports, previous assessments',
      'Plan what you need on the day — water, snacks, glasses if you wear them',
      'Plan recovery time — assessments are mentally tiring',
      'Confirm format and what you need to bring',
      'Do not try to "prepare" by practising reading — just be yourself',
    ],

    prepare: [
      'Review your notes the day before',
      'Bring school reports and any previous assessments',
      'Bring any glasses or readers you use',
      'List the strategies you currently use — fonts, audio, colour overlays',
      'Eat a proper meal beforehand — concentration drops without food',
      'For online: test the platform, lighting, audio',
      'Plan something gentle afterwards — no demanding decisions',
    ],

    scripts: [
      { l: 'Asking about the format',
        t: 'Could you tell me what the assessment involves? How long, what tasks, what to bring, and can I have breaks during the session?' },
      { l: 'Asking for adjustments',
        t: 'I have [glasses / a colour overlay / specific lighting needs]. Could the room have adjustable lighting? Can I have a coloured overlay or paper if needed? Is it OK to take breaks?' },
      { l: 'If you feel pressured by timed tasks',
        t: 'The timed tasks are stressful for me. Could you remind me again what we are measuring? I want to know that "going slowly" is part of the data, not a failure.' },
      { l: 'If you misread or misspell something',
        t: 'I read that wrong / I am not sure how to spell that. Should I try again, or move on?' },
    ],

    support: [
      'Tell the assessor about visual stress or sensory needs at the start',
      'It is OK to take breaks',
      'It is OK to ask for instructions to be repeated',
      'Do not pretend to read faster or spell better than you do — that defeats the point',
      'You can ask for the assessor to read instructions aloud if helpful',
    ],

    links: [
      { title: 'BDA — What to expect at an assessment',
        sub: 'Overview of the diagnostic process',
        url: 'https://www.bdadyslexia.org.uk/services/assessments', icon: 'ti-clipboard-check', color: 'sky' },
      { title: 'PATOSS — Adult assessment guide',
        sub: 'Professional guidance from the SpLD body',
        url: 'https://www.patoss-dyslexia.org', icon: 'ti-school', color: 'teal' },
    ],
  },

  {
    k: 'assessed', num: 5, color: 'lavender', icon: 'ti-clipboard-check',
    l: 'I have had my assessment',
    sub: 'Waiting for the report',
    what: 'Your assessment is done. The report typically takes 2-4 weeks. It will identify whether you meet the criteria for dyslexia (or another SpLD like dyscalculia, dysgraphia, or dyspraxia) and give specific recommendations for support, technology, and adjustments. It is a detailed and useful document.',

    next: [
      'Ask when the report will arrive',
      'Note anything verbally said you want to remember',
      'Ask what happens next — recommendations, follow-up support?',
      'Be gentle with yourself for a few days',
    ],

    prepare: [
      'Think about who you want to tell, and when',
      'Think about what you will use the report for — DSA, work, personal?',
      'Plan how to store it safely (digital + physical copies)',
    ],

    scripts: [
      { l: 'Asking about the report timeline',
        t: 'Could you tell me when I will receive my report, and how — post, email, both? Will I receive a draft or just the final version?' },
      { l: 'Following up if delayed',
        t: 'I had my dyslexia assessment on [date]. I have not received my report. Could you let me know when to expect it?' },
      { l: 'Telling someone close',
        t: 'I had my dyslexia assessment. I am tired. The report comes in a few weeks. I do not need to talk about it in detail yet, but wanted you to know.' },
    ],

    support: [
      'Assessment is mentally tiring — rest properly afterwards',
      'Use Bowline\'s Reset tools if you feel exposed or doubtful',
      'Do not push yourself to make big decisions until the report comes',
    ],

    links: [
      { title: 'BDA — Understanding your report',
        sub: 'How to read your diagnostic report',
        url: 'https://www.bdadyslexia.org.uk/services/assessments', icon: 'ti-book-2', color: 'sky' },
    ],
  },

  {
    k: 'result', num: 6, color: 'peach', icon: 'ti-file-description',
    l: 'I have my report',
    sub: 'Using your diagnosis',
    what: 'You have your report. For many adults, a dyslexia diagnosis is a relief — it names something that has been there forever and was not laziness or low intelligence. It also opens doors: DSA funding, workplace adjustments, Access to Work technology, tax-free assistive equipment in some cases. Whether diagnosed or not, the report has actionable recommendations.',

    next: [
      'Read the report properly — it has specific recommendations',
      'Identify which recommendations to act on first',
      'If applying for DSA, send the report to Student Finance England (or equivalent)',
      'If at work, apply for Access to Work',
      'Keep your report safe — you will need it again',
    ],

    prepare: [
      'Two safe copies of the report (digital + physical)',
      'List the top 3 recommendations to action',
      'Research the technology recommended (Read&Write, Glean, ClaroRead, MindMeister)',
      'If in education, contact your university disability team with the report',
      'If at work, decide who to tell and when',
    ],

    scripts: [
      { l: 'Applying for Access to Work',
        t: 'I have been diagnosed with dyslexia and would like to apply for Access to Work support. I have a diagnostic report I can share. The support I think I need includes [reading software, mind mapping tools, a coach].' },
      { l: 'Telling your university',
        t: 'I have a diagnostic assessment for dyslexia and would like to register with the disability team. The report recommends [list]. Could we discuss exam adjustments and ongoing support?' },
      { l: 'Telling your employer (formal)',
        t: 'I am writing to let you know I have been diagnosed with dyslexia. I would like to arrange a meeting to discuss reasonable adjustments under the Equality Act. I have a diagnostic report I can share.' },
      { l: 'Telling your employer (informal)',
        t: 'I wanted to share — I have just been formally diagnosed with dyslexia. I am still working out what I need, but the report has some specific recommendations I would like to discuss.' },
      { l: 'Telling a friend or family member',
        t: 'I got my dyslexia diagnosis. It is a relief to have a name for it. I am still figuring out what to do with it. Mostly I just wanted to tell you.' },
    ],

    support: [
      'The diagnosis explains the pattern — it does not change who you are',
      'Most recommended tech is free or low-cost',
      'Access to Work can fund larger items, training, and coaching',
      'A dyslexia tutor or SpLD coach can be transformative — funded via DSA or AtW',
      'You do not have to tell anyone unless you want to',
    ],

    links: [
      { title: 'DSA — How to apply',
        sub: 'Step-by-step Disabled Students\' Allowance application',
        url: 'https://www.gov.uk/disabled-students-allowance-dsa', icon: 'ti-school', color: 'lavender' },
      { title: 'Access to Work (UK)',
        sub: 'Funding for workplace dyslexia support',
        url: 'https://www.gov.uk/access-to-work', icon: 'ti-briefcase', color: 'teal' },
      { title: 'BDA — Newly diagnosed adults',
        sub: 'Practical guidance for next steps',
        url: 'https://www.bdadyslexia.org.uk', icon: 'ti-arrow-right', color: 'sky' },
      { title: 'Read&Write — Assistive software',
        sub: 'Reading, writing, and study support tool',
        url: 'https://www.texthelp.com/products/read-and-write-education/', icon: 'ti-device-laptop', color: 'amber' },
    ],
  },

  {
    k: 'tools', num: 7, color: 'amber', icon: 'ti-tools',
    l: 'Setting up tools and tech',
    sub: 'Practical support and adjustments',
    what: 'Once you know how your brain works, the right tools can transform daily life. This stage is about putting them in place — and not waiting for permission. Many of these are free or come built into devices you already own. Access to Work, DSA, and many employers will fund more advanced ones.',

    next: [
      'Turn on built-in accessibility tools — text-to-speech, dictation',
      'Try free assistive tools — OpenDyslexic font, Microsoft Immersive Reader',
      'If funded, request the recommended software via DSA or AtW',
      'Try mind mapping for organising thoughts before writing',
      'Build a "reading toolkit" — what you reach for when text is heavy',
    ],

    prepare: [
      'iOS: enable Speak Screen, Speak Selection, Dictation',
      'Android: enable Select to Speak, Live Caption, Voice typing',
      'Mac: enable Speech, Dictation, increase font sizes',
      'Windows: try Immersive Reader in Edge/Word, Speech Recognition',
      'Try a coloured overlay or change the page tint on your screen',
      'Test mind-mapping (XMind, MindMeister, MindNode)',
      'Try one new tool at a time — adoption fatigue is real',
    ],

    scripts: [
      { l: 'Asking IT for assistive software at work',
        t: 'I have a dyslexia diagnosis and the report recommends [Read&Write / Glean / ClaroRead]. Could you arrange a licence and install? I am happy to share the report. Access to Work may fund this if it is not in the standard budget.' },
      { l: 'Asking a colleague for written follow-up',
        t: 'Could you drop me a quick written summary after meetings? Live note-taking is hard for me, and written notes mean I can fully focus during the conversation.' },
      { l: 'Asking for documents in advance',
        t: 'Could you share the document a day before the meeting? Reading on the spot is harder for me than reading in advance.' },
    ],

    support: [
      'Audio is your friend — books, podcasts, speech-to-text everywhere',
      'Larger fonts, more line spacing, off-white backgrounds reduce visual fatigue',
      'Voice notes save you from writing things you only need temporarily',
      'Mind maps let you think non-linearly — they suit dyslexic brains',
      'Read in chunks, with breaks — not in one long session',
      'A dyslexia tutor or SpLD coach can teach reading and writing strategies',
    ],

    links: [
      { title: 'Microsoft Immersive Reader',
        sub: 'Free built-in reading support for Edge, Word, OneNote',
        url: 'https://education.microsoft.com/en-us/resource/9b010288', icon: 'ti-book-2', color: 'sky' },
      { title: 'Apple accessibility — vision and reading',
        sub: 'Built-in iOS and Mac tools',
        url: 'https://www.apple.com/accessibility/vision/', icon: 'ti-device-mobile', color: 'lavender' },
      { title: 'OpenDyslexic font (free)',
        sub: 'Free typeface designed to reduce reading errors',
        url: 'https://opendyslexic.org', icon: 'ti-typography', color: 'amber' },
      { title: 'Glean — Note-taking app',
        sub: 'Records, organises, and syncs notes for dyslexic learners',
        url: 'https://glean.co', icon: 'ti-notes', color: 'teal' },
      { title: 'BDA — Assistive tech overview',
        sub: 'Guide to tools and software',
        url: 'https://www.bdadyslexia.org.uk/advice/employers/dyslexia-friendly-workplace/assistive-technology', icon: 'ti-tools', color: 'peach' },
    ],
  },

  {
    k: 'support', num: 8, color: 'teal', icon: 'ti-lifebuoy',
    l: 'I need support now',
    sub: 'Support does not wait for diagnosis',
    what: 'Whether you have a diagnosis or not, dyslexia-friendly strategies and tools are available now. The Equality Act covers you regardless of formal assessment if dyslexia substantially affects your daily life. Self-disclosure is enough for many adjustments — you do not always need a report.',

    next: [
      'Use Bowline\'s TL;DR Assist to break down complex written content',
      'Turn on text-to-speech for emails, documents, articles',
      'Ask employer or university for the adjustments you need',
      'Find dyslexic peer groups online — share strategies',
      'Apply for Access to Work — they will fund a workplace needs assessment',
    ],

    prepare: [
      'You do not need to justify your needs — they are real',
      'Identify the 1-2 tasks that drain you most — start there',
      'Notice what helps and what does not',
    ],

    scripts: [
      { l: 'Asking for workplace adjustments without diagnosis',
        t: 'I find reading and writing-heavy tasks particularly draining. I would like to discuss adjustments — software like Read&Write, written meeting notes, documents shared in advance. I [do/do not] have a formal diagnosis but am happy to discuss further.' },
      { l: 'Asking for university support without diagnosis',
        t: 'I am struggling with reading and writing demands. I would like to talk to the disability team about what support is available while I look into getting a formal assessment.' },
      { l: 'Telling someone you trust you are struggling',
        t: 'I have been finding reading and writing really tiring recently. I do not always have the right words to explain. I am not asking you to fix it — just want to let you know.' },
      { l: 'Saying no to a high-text-load task',
        t: 'I am not able to take this on right now. Reading-heavy tasks take longer for me and I am at capacity.' },
    ],

    support: [
      'Self-disclosure is often enough for workplace adjustments',
      'Crisis lines do not require a diagnosis',
      'Audio books, speech-to-text, large fonts — all valid without label',
      'Lowered demands when reading-fatigued is not laziness — it is recovery',
      'You are allowed to ask for things to be shorter, simpler, in advance',
    ],

    links: [
      { title: 'Mind — Crisis support',
        sub: 'UK mental health support and crisis resources',
        url: 'https://www.mind.org.uk/need-urgent-help/', icon: 'ti-heart', color: 'peach' },
      { title: 'Samaritans — 24/7 listening',
        sub: 'Free phone line: 116 123',
        url: 'https://www.samaritans.org', icon: 'ti-phone', color: 'sky' },
      { title: 'BDA helpline',
        sub: '0333 405 4567 — UK adult dyslexia support',
        url: 'https://www.bdadyslexia.org.uk/contact-us', icon: 'ti-phone-call', color: 'teal' },
      { title: 'Access to Work',
        sub: 'Workplace support funding — no diagnosis needed to enquire',
        url: 'https://www.gov.uk/access-to-work', icon: 'ti-briefcase', color: 'lavender' },
    ],
  },
];
// ═══════════════════════════════════════════════════════════
// DYSPRAXIA (DCD) — 8 stages, OT / clinical psychology route
// ═══════════════════════════════════════════════════════════
const STAGES_DYSPRAXIA = [
  {
    k: 'noticing', num: 1, color: 'amber', icon: 'ti-bulb',
    l: 'I think I might be dyspraxic',
    sub: 'Noticing patterns',
    what: 'Dyspraxia (also called Developmental Coordination Disorder or DCD) is more than "clumsy". It affects motor planning, organisation, sequencing, balance, fine motor skills, and often working memory and time management. Many adults with dyspraxia describe constant low-level bruising, struggling with handwriting, getting lost easily, finding new physical skills exhausting to learn, and sequencing breakdowns under pressure. It is lifelong and frequently co-occurs with ADHD, autism, and dyslexia.',

    next: [
      'Start writing down examples — motor, sequencing, organisation, daily life',
      'Note how long this has been the case (dyspraxia is lifelong)',
      'Read accounts by adults with DCD',
      'Try the Adult Dyspraxia Checklist (Movement Matters or Dyspraxia Foundation)',
      'Talk to someone you trust about what you have noticed',
    ],

    prepare: [
      'List motor examples — clumsiness, dropping things, handwriting, sport',
      'List sequencing examples — instructions, getting ready, multi-step tasks',
      'List spatial examples — getting lost, parking, judging distance, bumping into things',
      'List daily living examples — kitchen tasks, ironing, cooking timing, tying shoelaces',
      'Note how dyspraxia affects work — typing, presentations, equipment, fatigue',
      'Note any family history — dyspraxia has a genetic component',
    ],

    scripts: [
      { l: 'Thinking it out loud to yourself',
        t: 'I have always been "clumsy" but it is more than that — I struggle with coordination, sequencing, organising my body and my day. I think I might be dyspraxic and want to understand this.' },
      { l: 'Mentioning it to a friend or partner',
        t: 'I have been thinking I might be dyspraxic. The constant bumping into things, the slow handwriting, getting lost everywhere, dropping things — they have always been there. Not asking for advice, just saying it out loud.' },
    ],

    support: [
      'You do not need a diagnosis to use dyspraxia-friendly strategies',
      'Routines and checklists reduce sequencing load',
      'Voice notes save you from handwriting',
      'Speech-to-text for emails and documents',
      'Reduce visual clutter at home and work — easier to find things',
      'Body doubling helps with starting physical tasks',
    ],

    links: [
      { title: 'Dyspraxia Foundation UK',
        sub: 'UK charity with adult-focused information',
        url: 'https://dyspraxiafoundation.org.uk/about-dyspraxia/adults/', icon: 'ti-heart', color: 'amber' },
      { title: 'Movement Matters — DCD/Dyspraxia overview',
        sub: 'Information for UK adults with DCD',
        url: 'https://www.movementmattersuk.org', icon: 'ti-walk', color: 'teal' },
      { title: 'NHS — Dyspraxia in adults',
        sub: 'Official NHS overview',
        url: 'https://www.nhs.uk/conditions/developmental-coordination-disorder-dyspraxia/', icon: 'ti-stethoscope', color: 'lavender' },
      { title: 'Adult Dyspraxia Checklist',
        sub: 'Self-screening (not diagnostic)',
        url: 'https://dyspraxiafoundation.org.uk/about-dyspraxia/adults/', icon: 'ti-clipboard-check', color: 'sky' },
    ],
  },

  {
    k: 'collecting', num: 2, color: 'sky', icon: 'ti-notes',
    l: 'I am collecting examples',
    sub: 'Building your dyspraxia picture',
    what: 'Dyspraxia assessment looks for difficulty with motor coordination and planning that has been present since childhood and affects daily life. Childhood evidence matters — school PE reports, comments about handwriting, descriptions of clumsiness. The assessor will also look at how dyspraxia shows up now in work, home, and social life.',

    next: [
      'Document examples across motor, sequencing, spatial, organisational areas',
      'Find childhood evidence — school reports, photos, family memories',
      'Ask family what they remember about your coordination and motor skills',
      'Note how it affects work and daily life now',
      'Save everything in one folder',
    ],

    prepare: [
      'List gross motor examples — bumping into things, balance, sport, dancing',
      'List fine motor examples — handwriting, buttons, cutlery, typing, drawing',
      'List sequencing — getting ready, multi-step recipes, instructions',
      'List spatial examples — getting lost, parking, packing, judging distances',
      'List childhood evidence — late milestones, sport, school PE comments',
      'List adult impact — work, driving, cooking, social, fatigue',
      'Note co-occurring patterns — ADHD-like focus, autism-like sensory, dyslexia-like reading',
      'Note compensating strategies — extra time, asking for help, avoiding tasks',
    ],

    scripts: [
      { l: 'Asking a parent for childhood examples',
        t: 'I am exploring whether I am dyspraxic. Could you tell me what you remember about my coordination as a child? Walking, running, sport, handwriting, getting dressed, anything physical. School reports too if you have them.' },
      { l: 'Asking a partner for outside perspective',
        t: 'I am gathering examples for a possible dyspraxia assessment. Could you tell me what you notice — coordination, bumping into things, sequencing issues, things I avoid? I want your honest view.' },
      { l: 'Self-reflection prompt',
        t: 'Motor tasks that take effort: [list]. Sequencing things I find hard: [list]. Spatial things I struggle with: [list]. What helps me: [list]. What I avoid: [list].' },
    ],

    support: [
      'Use Bowline\'s Brain Dump to capture without organising',
      'Voice notes work well for collecting examples',
      'A list of 10-15 specific examples is plenty',
      'Find school reports if you can — PE, handwriting, "could try harder"',
      'Take photos of your environment — many adaptations you already make',
    ],

    links: [
      { title: 'Dyspraxia Foundation — Adult assessment prep',
        sub: 'What to gather and document',
        url: 'https://dyspraxiafoundation.org.uk/about-dyspraxia/adults/', icon: 'ti-clipboard-check', color: 'amber' },
      { title: 'Movement Matters — DCD evidence',
        sub: 'What evidence supports DCD diagnosis',
        url: 'https://www.movementmattersuk.org', icon: 'ti-walk', color: 'teal' },
    ],
  },

  {
    k: 'route', num: 3, color: 'lavender', icon: 'ti-route',
    l: 'Choosing my assessment route',
    sub: 'NHS, OT, or private',
    what: 'Adult dyspraxia assessment in the UK is limited. The main routes: (1) NHS via GP referral to an Occupational Therapist or clinical psychologist (rare, often refused for adults); (2) private OT or psychologist with DCD experience (£300-£600); (3) educational psychologist via university or DSA if studying. Unlike dyslexia, formal DCD assessment is harder to find. Some adults pursue an OT functional assessment instead, which can support workplace adjustments without a formal diagnosis.',

    next: [
      'Check NHS provision in your area — some regions do adult DCD, most do not',
      'Look for private OTs or psychologists with adult DCD experience',
      'If at university, check disability services for OT assessment',
      'If at work, check Access to Work — they may fund a workplace needs assessment',
      'Decide your purpose — DSA, workplace, personal clarity?',
    ],

    prepare: [
      'List your purpose: DSA? Access to Work? Personal? Adjustments?',
      'Contact local NHS first — GP, OT services',
      'Check Movement Matters and Dyspraxia Foundation directories',
      'Verify the assessor has adult DCD experience',
      'Get quotes — private assessments vary widely',
      'Check what report format you need (DSA-compliant if for student support)',
    ],

    scripts: [
      { l: 'Asking your GP',
        t: 'I think I may have dyspraxia (DCD). I understand adult assessment is limited but would like to know what NHS options exist locally — Occupational Therapy referral, psychology, or another route?' },
      { l: 'If NHS says no to assessment',
        t: 'I understand NHS assessment may not be available. Could you refer me for an OT functional assessment instead, to support workplace or daily living adjustments?' },
      { l: 'Contacting a private assessor',
        t: 'I am looking for an adult DCD/dyspraxia assessment. Could you confirm your experience with adult DCD, the assessment process, cost, and report format?' },
      { l: 'Asking university disability team',
        t: 'I am a student and think I may have dyspraxia. Could you tell me about the assessment options — does the university provide, signpost to, or fund DCD assessment?' },
      { l: 'Asking employer',
        t: 'I think I may have dyspraxia. I would like to discuss whether the company would support assessment via Access to Work, or whether an OT workplace assessment would be appropriate first.' },
    ],

    support: [
      'A formal DCD diagnosis is helpful but not always needed for adjustments',
      'An OT functional assessment can support workplace changes without diagnosis',
      'A childhood diagnosis (even informal) can still be valid as an adult',
      'Access to Work will often fund equipment and coaching with self-disclosure plus OT input',
      'Some private OTs offer remote assessment',
    ],

    links: [
      { title: 'Dyspraxia Foundation — Finding an assessor',
        sub: 'UK directory of adult-friendly assessors',
        url: 'https://dyspraxiafoundation.org.uk/about-dyspraxia/adults/', icon: 'ti-search', color: 'amber' },
      { title: 'Royal College of Occupational Therapists',
        sub: 'Find a registered OT',
        url: 'https://www.rcot.co.uk/practice-resources/find-occupational-therapist', icon: 'ti-stethoscope', color: 'teal' },
      { title: 'Access to Work (UK)',
        sub: 'May fund OT workplace assessment',
        url: 'https://www.gov.uk/access-to-work', icon: 'ti-briefcase', color: 'sky' },
      { title: 'Disabled Students\' Allowance (DSA)',
        sub: 'Funding for assessment and support in higher education',
        url: 'https://www.gov.uk/disabled-students-allowance-dsa', icon: 'ti-school', color: 'lavender' },
    ],
  },

  {
    k: 'booked', num: 4, color: 'teal', icon: 'ti-calendar-check',
    l: 'My assessment is booked',
    sub: 'Preparing for assessment',
    what: 'Adult dyspraxia assessment is typically 2-3 hours and includes motor coordination tasks (balance, sequencing, fine motor), questionnaires about daily life and childhood, and an interview. It can feel exposing — being watched while you do physical tasks you have always found hard. Remember: the assessor is not judging, they are identifying a pattern. "Failing" the motor tasks is exactly what gives them the data they need.',

    next: [
      'Gather all your notes, childhood evidence, previous reports',
      'Plan what you need on the day — water, snacks, comfortable clothing',
      'Plan recovery time — assessments can be physically and mentally tiring',
      'Confirm format and what you need to bring',
    ],

    prepare: [
      'Review your notes the day before',
      'Bring school reports and any previous assessments',
      'Wear comfortable clothes you can move in',
      'Bring glasses if you wear them',
      'Eat a proper meal beforehand — coordination drops without food',
      'List what currently helps you cope — environment changes, tools, routines',
      'For online: test the platform, lighting, audio, space to move',
      'Plan something gentle afterwards',
    ],

    scripts: [
      { l: 'Asking about the format',
        t: 'Could you tell me what the assessment involves? How long, what physical tasks, what to bring, and can I have breaks during the session?' },
      { l: 'Asking for adjustments',
        t: 'I have some sensory and physical needs. Could the room have non-slip flooring? Can I have breaks? Is there time pressure on the tasks, or can I work at my own pace?' },
      { l: 'If a task is hard or embarrassing',
        t: 'I find this hard / this is embarrassing. Should I keep trying or move on? I want you to see what is actually difficult for me, not what I can fake.' },
      { l: 'If you are not sure how to do a task',
        t: 'Could you demonstrate that, or break it down further? I want to make sure I understand what you are asking before I try.' },
    ],

    support: [
      'It is OK to struggle — that is the point of the assessment',
      'Take breaks if you need them',
      'Do not "perform" — be yourself, including the hard parts',
      'You can ask for instructions to be repeated or demonstrated',
      'Tell the assessor about co-occurring conditions (ADHD, autism, dyslexia)',
    ],

    links: [
      { title: 'Dyspraxia Foundation — What to expect',
        sub: 'Overview of the adult assessment process',
        url: 'https://dyspraxiafoundation.org.uk/about-dyspraxia/adults/', icon: 'ti-clipboard-check', color: 'amber' },
      { title: 'Movement Matters — Assessment guide',
        sub: 'DCD-specific assessment information',
        url: 'https://www.movementmattersuk.org', icon: 'ti-walk', color: 'teal' },
    ],
  },

  {
    k: 'assessed', num: 5, color: 'lavender', icon: 'ti-clipboard-check',
    l: 'I have had my assessment',
    sub: 'Waiting for the report',
    what: 'Your assessment is done. The report typically arrives in 2-6 weeks. It will identify whether you meet DCD criteria, describe your motor and cognitive profile, and provide specific recommendations for tools, adjustments, and strategies. The waiting period can feel vulnerable — you have just spent hours showing your hardest things to someone.',

    next: [
      'Ask when the report will arrive',
      'Note anything verbally said you want to remember',
      'Ask what happens next — recommendations, OT support, follow-up?',
      'Be gentle with yourself for a few days',
    ],

    prepare: [
      'Think about who you want to tell, and when',
      'Think about what you will use the report for',
      'Plan how to store it safely (digital + physical copies)',
    ],

    scripts: [
      { l: 'Asking about the report timeline',
        t: 'Could you tell me when I will receive the report, and how — post, email? Will I see a draft or just the final version?' },
      { l: 'Following up if delayed',
        t: 'I had my dyspraxia assessment on [date]. I have not received the report. Could you let me know when to expect it?' },
      { l: 'Telling someone close',
        t: 'I had my dyspraxia assessment. I am tired. The report comes in a few weeks. I do not need to talk about it in detail yet, but wanted you to know.' },
    ],

    support: [
      'Physical and mental rest after the assessment',
      'Use Bowline\'s Reset tools if you feel exposed',
      'Avoid demanding physical tasks for a couple of days',
      'Do not push yourself to make big decisions until the report arrives',
    ],

    links: [
      { title: 'Dyspraxia Foundation — After assessment',
        sub: 'Understanding your report and next steps',
        url: 'https://dyspraxiafoundation.org.uk/about-dyspraxia/adults/', icon: 'ti-clock', color: 'amber' },
    ],
  },

  {
    k: 'result', num: 6, color: 'peach', icon: 'ti-file-description',
    l: 'I have my report',
    sub: 'Using your diagnosis',
    what: 'You have your report. A dyspraxia diagnosis often brings relief — there is a name for the constant bruises, the hard handwriting, the fights with your own body. It also opens doors: workplace adjustments, Access to Work funding, university adjustments, OT support. Whether diagnosed or not, the report\'s recommendations are actionable.',

    next: [
      'Read the report properly — it contains specific recommendations',
      'Identify which recommendations to act on first',
      'If at work, apply for Access to Work',
      'If at university, register with disability services',
      'Find dyspraxia peer support online',
    ],

    prepare: [
      'Two safe copies of the report (digital + physical)',
      'List the top 3 recommendations to action',
      'Research tools recommended — voice control, ergonomic equipment, mind mapping',
      'If in education, contact disability team with the report',
      'If at work, decide who to tell and when',
    ],

    scripts: [
      { l: 'Applying for Access to Work',
        t: 'I have been diagnosed with dyspraxia and would like to apply for Access to Work. I have a diagnostic report. The support I think I need includes [ergonomic equipment, voice software, mind mapping tools, a coach].' },
      { l: 'Telling your university',
        t: 'I have a diagnostic assessment for dyspraxia and would like to register with the disability team. The report recommends [list]. Could we discuss exam adjustments, ongoing support, and physical accommodations?' },
      { l: 'Telling your employer (formal)',
        t: 'I am writing to let you know I have been diagnosed with dyspraxia. I would like to arrange a meeting to discuss reasonable adjustments under the Equality Act. I have a diagnostic report I can share.' },
      { l: 'Telling your employer (informal)',
        t: 'I wanted to share — I have been diagnosed with dyspraxia. I am still working out what it means in practice, but the report has specific recommendations I would like to discuss.' },
      { l: 'Telling family',
        t: 'I got a dyspraxia diagnosis. It is a relief to have a name for the patterns I have had all my life. I am still figuring out what to do with it. Mostly I just wanted to tell you.' },
    ],

    support: [
      'Diagnosis explains the pattern — it does not change who you are',
      'Most recommended adjustments are simple and low-cost',
      'Access to Work can fund significant equipment and coaching',
      'An OT can do an in-depth functional assessment for home or work',
      'You do not have to tell anyone unless you want to',
    ],

    links: [
      { title: 'Dyspraxia Foundation — Newly diagnosed adults',
        sub: 'Practical guidance for next steps',
        url: 'https://dyspraxiafoundation.org.uk/about-dyspraxia/adults/', icon: 'ti-arrow-right', color: 'amber' },
      { title: 'Access to Work (UK)',
        sub: 'Funding for workplace dyspraxia support',
        url: 'https://www.gov.uk/access-to-work', icon: 'ti-briefcase', color: 'teal' },
      { title: 'DSA — How to apply',
        sub: 'Disabled Students\' Allowance for higher education',
        url: 'https://www.gov.uk/disabled-students-allowance-dsa', icon: 'ti-school', color: 'lavender' },
      { title: 'Movement Matters — Adult support',
        sub: 'Adult DCD community and resources',
        url: 'https://www.movementmattersuk.org', icon: 'ti-users', color: 'sky' },
    ],
  },

  {
    k: 'tools', num: 7, color: 'amber', icon: 'ti-tools',
    l: 'Setting up tools and adjustments',
    sub: 'Practical, hands-on changes',
    what: 'With dyspraxia, environment and tools can transform daily life. The aim is to reduce the planning load on your brain and the precision load on your body. Some changes are tiny (one-handed kitchen tools, a phone holder, voice control). Others are bigger (ergonomic desk, dictation software, occupational therapy). Many are free or low-cost.',

    next: [
      'Turn on dictation and voice control on your phone and computer',
      'Try a planner or app for sequencing daily routines',
      'Look at your kitchen, desk, and bag — what consistently goes wrong?',
      'Build a "going out kit" — everything you always forget in one place',
      'Consider OT input for home or workplace if available',
    ],

    prepare: [
      'iOS: enable Dictation, Voice Control, Back Tap shortcuts',
      'Android: enable Voice typing, Voice Access',
      'Mac/Windows: enable Speech Recognition, Dictation',
      'Try a digital planner that breaks tasks into steps',
      'Set up reminders for things you always forget — keys, lunch, charger',
      'Try ergonomic equipment — chunky pens, ergonomic mouse, split keyboard',
      'Voice notes instead of writing things by hand',
    ],

    scripts: [
      { l: 'Asking IT for ergonomic equipment',
        t: 'I have a dyspraxia diagnosis. The report recommends [ergonomic mouse / split keyboard / standing desk / voice software]. Could you arrange this through Access to Work or the standard budget?' },
      { l: 'Asking for written instructions',
        t: 'Could you put the instructions in writing? Verbal multi-step instructions are hard for me to hold onto reliably.' },
      { l: 'Asking for a slower pace',
        t: 'I am not slow at thinking — I am slow at the physical part. Could we build in a bit more time, or could I have the materials in advance?' },
      { l: 'Asking for OT input',
        t: 'I would like an OT functional assessment to look at my [workspace / home / daily routine]. Could you refer me, or would Access to Work fund this?' },
    ],

    support: [
      'Routines reduce sequencing load — protect them',
      'Voice everything you can — calls, messages, notes, search',
      'Lay things out the night before — clothes, bag, work setup',
      'Photograph things before you take them apart — so you can put them back',
      'A standing or treadmill desk can help if sitting affects coordination',
      'OT coaching teaches strategies that work for you specifically',
    ],

    links: [
      { title: 'Apple — Voice Control accessibility',
        sub: 'Use your iPhone or Mac entirely by voice',
        url: 'https://www.apple.com/accessibility/motor/', icon: 'ti-device-mobile', color: 'lavender' },
      { title: 'Microsoft accessibility — motor and mobility',
        sub: 'Built-in Windows tools',
        url: 'https://www.microsoft.com/en-gb/accessibility/mobility', icon: 'ti-device-laptop', color: 'sky' },
      { title: 'Dragon — Speech recognition software',
        sub: 'Industry-standard dictation for heavy writing tasks',
        url: 'https://www.nuance.com/dragon.html', icon: 'ti-microphone', color: 'teal' },
      { title: 'Dyspraxia Foundation — Daily living tips',
        sub: 'Practical strategies for adult life',
        url: 'https://dyspraxiafoundation.org.uk/about-dyspraxia/adults/', icon: 'ti-home', color: 'amber' },
      { title: 'College of Occupational Therapists — Find an OT',
        sub: 'Locate a UK-registered occupational therapist',
        url: 'https://www.rcot.co.uk/practice-resources/find-occupational-therapist', icon: 'ti-search', color: 'peach' },
    ],
  },

  {
    k: 'support', num: 8, color: 'teal', icon: 'ti-lifebuoy',
    l: 'I need support now',
    sub: 'Support does not wait for diagnosis',
    what: 'Whether you have a diagnosis or not, dyspraxia-friendly strategies are available now. The Equality Act covers you if dyspraxia substantially affects your daily life, regardless of formal assessment. Self-disclosure plus an OT functional assessment is often enough for workplace and educational adjustments.',

    next: [
      'Use Bowline daily — break tasks into smaller motor and cognitive steps',
      'Voice dictate instead of writing where you can',
      'Reduce sequencing load — fewer steps, written instructions, set routines',
      'Ask employer or university for adjustments',
      'Find peer support — Dyspraxia Foundation forums, Reddit r/dyspraxia',
    ],

    prepare: [
      'You do not need to justify your needs — they are real',
      'Identify the 1-2 tasks that consistently fail or exhaust you',
      'Notice what helps and what does not',
    ],

    scripts: [
      { l: 'Asking for workplace adjustments without diagnosis',
        t: 'I have coordination, sequencing, and organisational difficulties that affect my work. I would like to discuss adjustments — ergonomic equipment, voice software, written instructions, more time for physical tasks. I [do/do not] have a formal diagnosis but am happy to discuss further.' },
      { l: 'Asking for university support without diagnosis',
        t: 'I am struggling with physical and organisational aspects of student life. I would like to speak to the disability team about what support is available while I look into formal assessment.' },
      { l: 'Telling someone you trust',
        t: 'I have been finding day-to-day things really tiring — the physical co-ordination, organising, sequencing. I do not always have the words. I am not asking you to fix it — just want to let you know.' },
      { l: 'Saying no to a physically demanding task',
        t: 'I am not going to be the right person for that — it is physically demanding in ways that take a lot of energy for me. Could we find someone else, or change the approach?' },
      { l: 'Asking for healthcare accommodation',
        t: 'I have some coordination difficulties and find new environments hard to navigate. Could someone show me where I am going, or give me extra time?' },
    ],

    support: [
      'Self-disclosure is often enough for many adjustments',
      'Voice dictation, larger pens, ergonomic kit — all valid without label',
      'Lowered demands when physically fatigued is not laziness',
      'You are allowed to ask for things to be slower, demonstrated, in writing',
      'Crisis lines do not require a diagnosis',
    ],

    links: [
      { title: 'Mind — Crisis support',
        sub: 'UK mental health support and crisis resources',
        url: 'https://www.mind.org.uk/need-urgent-help/', icon: 'ti-heart', color: 'peach' },
      { title: 'Samaritans — 24/7 listening',
        sub: 'Free phone line: 116 123',
        url: 'https://www.samaritans.org', icon: 'ti-phone', color: 'sky' },
      { title: 'Dyspraxia Foundation helpline',
        sub: 'UK adult support and information',
        url: 'https://dyspraxiafoundation.org.uk/contact-us/', icon: 'ti-phone-call', color: 'teal' },
      { title: 'Access to Work',
        sub: 'Workplace support — no diagnosis needed to enquire',
        url: 'https://www.gov.uk/access-to-work', icon: 'ti-briefcase', color: 'lavender' },
    ],
  },
];

// ─── Stage sets indexed by condition ─────────────────────
const STAGE_SETS = {
  adhd:      STAGES_ADHD,
  autism:    STAGES_AUTISM,
  dyslexia:  STAGES_DYSLEXIA,
  dyspraxia: STAGES_DYSPRAXIA,
};

function getStages() {
  return STAGE_SETS[state.diagnosisCondition] || STAGES_ADHD;
}

function getCondition() {
  return CONDITIONS.find(c => c.k === state.diagnosisCondition) || CONDITIONS[0];
}

function getChecked(stageKey) {
  const cond = state.diagnosisCondition;
  if (!state.diagnosisChecked[cond]) state.diagnosisChecked[cond] = {};
  return state.diagnosisChecked[cond][stageKey];
}

function setChecked(stageKey, arr) {
  const cond = state.diagnosisCondition;
  if (!state.diagnosisChecked[cond]) state.diagnosisChecked[cond] = {};
  state.diagnosisChecked[cond][stageKey] = arr;
}

function getStageKey() {
  return state.diagnosisStageKey[state.diagnosisCondition] || null;
}

function setStageKey(k) {
  state.diagnosisStageKey[state.diagnosisCondition] = k;
}
// ═══════════════════════════════════════════════════════════
// RENDER FUNCTIONS
// ═══════════════════════════════════════════════════════════

const PALETTE = {
  lavender: { bg: '#f5f3ff', border: '#ddd6fe', text: '#4c1d95', sub: '#6d28d9', icon: '#8b5cf6', badgeBg: '#ede9fe' },
  teal:     { bg: '#ecfdf5', border: '#a7f3d0', text: '#047857', sub: '#059669', icon: '#10b981', badgeBg: '#d1fae5' },
  sky:      { bg: '#f0f9ff', border: '#bae6fd', text: '#0369a1', sub: '#0284c7', icon: '#0ea5e9', badgeBg: '#e0f2fe' },
  amber:    { bg: '#fffbeb', border: '#fde68a', text: '#b45309', sub: '#d97706', icon: '#f59e0b', badgeBg: '#fef3c7' },
  peach:    { bg: '#fef2f2', border: '#fecaca', text: '#9f1239', sub: '#be123c', icon: '#f43f5e', badgeBg: '#ffe4e6' },
  default:  { bg: '#f8fafc', border: '#e2e8f0', text: '#1e293b', sub: '#64748b', icon: '#94a3b8', badgeBg: '#f1f5f9' }
};

function renderSectionHeader(title, icon = null) {
  return `
    <div style="display: flex; align-items: center; gap: 12px; margin: 28px 0 16px;">
      ${icon ? `<i class="ti ${icon}" style="color: #8b5cf6; font-size: 16px;"></i>` : ''}
      <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.2px; white-space: nowrap;">${title}</div>
      <div style="flex: 1; height: 1.5px; background: #e2e8f0;"></div>
    </div>
  `;
}

// ─── Main render ──────────────────────────────────────────
export function renderDiagnosis() {
  setTopbar('Journey', 'Where are you in the process?');

  if (state.diagnosisStage) return renderStage();
  renderStageList();
}

// ─── Condition selector strip ────────────────────────────
function renderConditionSelector() {
  const current = state.diagnosisCondition;
  return `
    ${renderSectionHeader('WHAT ARE YOU EXPLORING?', 'ti-aperture')}
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 24px;">
      ${CONDITIONS.map(c => {
        const isActive = c.k === current;
        const pal = PALETTE[c.color] || PALETTE.lavender;
        return `
          <button onclick="setCondition('${c.k}')"
            style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 14px 4px;
                   border: 1.5px solid ${isActive ? pal.border : '#e2e8f0'};
                   background: ${isActive ? pal.bg : '#fff'};
                   border-radius: 12px; cursor: pointer; transition: all 0.2s; font-family: inherit;">
            <i class="ti ${c.icon}" style="font-size: 22px; color: ${isActive ? pal.text : '#94a3b8'};"></i>
            <span style="font-size: 12px; font-weight: 700; color: ${isActive ? pal.text : '#475569'}; letter-spacing: 0.3px;">${c.l}</span>
          </button>
        `;
      }).join('')}
    </div>
  `;
}

// ─── Stage list view ─────────────────────────────────────
function renderStageList() {
  const STAGES = getStages();
  const condition = getCondition();
  const condPal = PALETTE[condition.color] || PALETTE.lavender;
  const savedKey = getStageKey();

  document.getElementById('content').innerHTML = `
    <div class="screen" style="max-width: 600px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif;">
      
      <!-- Topbar Header -->
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0;">
        <div style="width: 44px; height: 44px; background: var(--teal, #41967a); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white;">
          <i class="ti ti-route" style="font-size: 24px;"></i>
        </div>
        <div>
          <div style="font-size: 22px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px;">Journey</div>
          <div style="font-size: 15px; color: #64748b;">Where are you in the process?</div>
        </div>
      </div>

      ${renderConditionSelector()}

      <!-- Journey Intro Card -->
      <div style="background: #fff; border: 1.5px solid #e2e8f0; border-left: 6px solid ${condPal.icon}; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; align-items: flex-start; gap: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: ${condPal.bg}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <i class="ti ${condition.icon}" style="font-size: 24px; color: ${condPal.text};"></i>
          </div>
          <div>
            <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 6px;">YOUR JOURNEY</div>
            <div style="font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 4px;">${condition.l}</div>
            <div style="font-size: 13px; color: #64748b;">${STAGES.length} stages · pick where you are now</div>
          </div>
        </div>
      </div>

      <!-- Purple Support Notice -->
      <div style="background: #f5f3ff; border: 1.5px solid #ddd6fe; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <div style="font-size: 14px; font-weight: 700; color: #4c1d95; margin-bottom: 4px;">You do not need to wait for a diagnosis to deserve support.</div>
        <div style="font-size: 13px; color: #6d28d9;">Your needs are real now. Tap where you are to see what to do next.</div>
      </div>

      ${renderSectionHeader('WHERE ARE YOU RIGHT NOW?')}

      <!-- Stage List -->
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px;">
        ${STAGES.map(s => {
          const sPal = PALETTE[s.color] || PALETTE.lavender;
          const isCurrent = s.k === savedKey;
          
          return `
            <button onclick="openStage('${s.k}')"
              style="display: flex; align-items: center; gap: 16px; padding: 16px; background: #fff;
                     border: 1.5px solid #e2e8f0; 
                     border-left: 6px solid ${sPal.icon};
                     border-radius: 12px; cursor: pointer; transition: background 0.2s, border-color 0.2s; text-align: left; font-family: inherit;">
              
              <div style="width: 32px; height: 32px; border-radius: 50%; background: ${sPal.badgeBg}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span style="font-size: 14px; font-weight: 800; color: ${sPal.text};">${s.num}</span>
              </div>
              
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">${s.l}</div>
                <div style="font-size: 13px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.sub}</div>
              </div>
              
              <i class="ti ti-chevron-right" style="font-size: 20px; color: #cbd5e1; flex-shrink: 0;"></i>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Blue Navigation Notice -->
      <div style="background: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <div style="font-size: 13px; color: #0369a1; line-height: 1.6;">
          <strong>Stage navigation.</strong> Pick the stage that fits where you are now. You can revisit any stage at any time, in any order. Switch conditions at the top — your progress in each is saved separately.
        </div>
      </div>
      
    </div>
  `;
}

// ─── Stage detail view ───────────────────────────────────
function renderStage() {
  const STAGES = getStages();
  const s = STAGES.find(st => st.k === state.diagnosisStage);
  if (!s) { state.diagnosisStage = null; renderDiagnosis(); return; }

  const tab = state.diagnosisTab || 'overview';
  const stageIdx = STAGES.findIndex(x => x.k === state.diagnosisStage);
  const prevStage = stageIdx > 0 ? STAGES[stageIdx - 1] : null;
  const nextStage = stageIdx < STAGES.length - 1 ? STAGES[stageIdx + 1] : null;

  const TABS = [
    { k: 'overview', l: 'Overview',  icon: 'ti-info-circle' },
    { k: 'prepare',  l: 'Prepare',   icon: 'ti-checklist' },
    { k: 'scripts',  l: 'Scripts',   icon: 'ti-message-2' },
    { k: 'support',  l: 'Support',   icon: 'ti-heart' },
    { k: 'links',    l: 'Links',     icon: 'ti-external-link' },
  ];

  const checked = getChecked(s.k) || new Array(s.prepare.length).fill(false);
  const completedCount = checked.filter(Boolean).length;
  const prepPct = (completedCount / s.prepare.length) * 100;

  let tabContent = '';
  if (tab === 'overview') tabContent = renderOverview(s);
  if (tab === 'prepare')  tabContent = renderPrepare(s, checked);
  if (tab === 'scripts')  tabContent = renderScripts(s);
  if (tab === 'support')  tabContent = renderSupport(s);
  if (tab === 'links')    tabContent = renderLinks(s);

  const condition = getCondition();

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <button class="btn" style="margin-bottom:10px;color:var(--text-muted)" onclick="closeStage()">
        <i class="ti ti-arrow-left"></i> All stages
      </button>

      <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:6px">
        ${condition.l} pathway
      </div>

      <div class="card ${s.color}">
        <div style="display:flex;align-items:flex-start;gap:12px">
          <i class="ti ${s.icon}" style="font-size:28px;color:var(--${s.color});flex-shrink:0"></i>
          <div>
            <div class="card-label">Stage ${s.num} of ${STAGES.length}</div>
            <div class="card-main">${s.l}</div>
          </div>
        </div>
      </div>

      ${tab === 'prepare' && s.prepare.length > 0 ? `
        <div class="progress-bar" style="margin-bottom:16px">
          <div class="progress-fill" style="width:${prepPct}%"></div>
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:14px;text-align:center">
          ${completedCount} of ${s.prepare.length} prep items done
        </div>
      ` : ''}

      <div style="display:flex;gap:6px;margin-bottom:14px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch">
        ${TABS.map(t => `
          <button onclick="setStageTab('${t.k}')"
            style="padding:7px 12px;white-space:nowrap;
                   border:2px solid ${tab === t.k ? `var(--${s.color})` : 'var(--border)'};
                   border-radius:var(--r-pill);
                   background:${tab === t.k ? `var(--${s.color}-l)` : 'var(--bg-card)'};
                   color:${tab === t.k ? `var(--${s.color}-d)` : 'var(--text-primary)'};
                   font-size:12px;font-weight:700;font-family:var(--font);cursor:pointer;
                   display:flex;align-items:center;gap:5px;flex-shrink:0">
            <i class="ti ${t.icon}" style="font-size:14px"></i>${t.l}
          </button>`).join('')}
      </div>

      ${tabContent}

      <div style="display:flex;gap:8px;margin-top:1.5rem">
        ${prevStage ? `
          <button class="btn" style="flex:1;justify-content:flex-start;font-size:13px" onclick="openStage('${prevStage.k}')">
            <i class="ti ti-arrow-left"></i> ${prevStage.sub}
          </button>` : '<div style="flex:1"></div>'}
        ${nextStage ? `
          <button class="btn primary" style="flex:1;justify-content:flex-end;font-size:13px" onclick="openStage('${nextStage.k}')">
            ${nextStage.sub} <i class="ti ti-arrow-right"></i>
          </button>` : '<div style="flex:1"></div>'}
      </div>
    </div>`;
}

// ─── Overview tab ────────────────────────────────────────
function renderOverview(s) {
  return `
    <div class="section-label">What this stage is about</div>
    <div class="notice ${s.color === 'lavender' ? 'purple' : s.color === 'sky' ? 'blue' : s.color === 'teal' ? 'green' : s.color}" style="line-height:1.7">
      ${s.what}
    </div>

    <div class="section-label">What happens next</div>
    ${s.next.map((item, i) => `
      <div style="display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1.5px solid var(--border)">
        <span style="
          width:24px;height:24px;border-radius:50%;flex-shrink:0;margin-top:1px;
          background:var(--${s.color}-l);color:var(--${s.color}-d);
          font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center">
          ${i + 1}
        </span>
        <div style="font-size:15px;color:var(--text-primary);line-height:1.5;flex:1">${item}</div>
      </div>`).join('')}

    <button class="btn primary" style="margin-top:1.25rem" onclick="setStageTab('prepare')">
      <i class="ti ti-checklist"></i> Start preparing
    </button>
  `;
}

// ─── Prepare tab ─────────────────────────────────────────
function renderPrepare(s, checked) {
  return `
    <div class="section-label">How to prepare</div>
    <div class="notice blue" style="margin-bottom:0.85rem">
      Tap each item to mark it done. Your progress is saved.
    </div>
    <div class="card" style="padding:0.5rem 1.25rem">
      ${s.prepare.map((item, i) => `
        <div class="task-row">
          <div class="task-check${checked[i] ? ' done' : ''}"
            onclick="toggleStagePrep(${i})"
            role="checkbox"
            aria-checked="${checked[i]}"
            aria-label="${item}">
            ${checked[i] ? '<i class="ti ti-check" style="font-size:14px"></i>' : ''}
          </div>
          <div class="task-text${checked[i] ? ' done' : ''}" style="font-size:15px;font-weight:${checked[i] ? '400' : '700'}">${item}</div>
        </div>`).join('')}
    </div>

    ${checked.filter(Boolean).length === s.prepare.length ? `
      <div class="notice green" style="margin-top:0.85rem;text-align:center">
        <strong>Prep complete for this stage.</strong> When you are ready, move to the next stage.
      </div>
    ` : ''}

    <button class="btn" style="margin-top:0.5rem" onclick="resetStagePrep()">
      <i class="ti ti-rotate"></i> Reset this checklist
    </button>
  `;
}

// ─── Scripts tab ─────────────────────────────────────────
function renderScripts(s) {
  return `
    <div class="section-label">Scripts for conversations</div>
    <div class="notice blue" style="margin-bottom:0.85rem">
      These are starting points. Edit them to sound like you before using.
    </div>
    ${s.scripts.map((sc, i) => `
      <div class="card" style="margin-bottom:10px">
        <div class="card-label">${sc.l}</div>
        <div style="font-size:14px;color:var(--text-primary);line-height:1.6;margin:8px 0 12px;padding:10px;background:var(--bg-page);border-radius:var(--r-md);border:1px solid var(--border)">
          "${sc.t}"
        </div>
        <button onclick="copyScriptDiag(${i}, this)"
          class="btn sky" style="width:auto;padding:8px 14px;margin:0;font-size:13px">
          <i class="ti ti-copy"></i> Copy
        </button>
      </div>`).join('')}
  `;
}

// ─── Support tab ─────────────────────────────────────────
function renderSupport(s) {
  return `
    <div class="section-label">Support you can use now</div>
    <div class="notice green" style="margin-bottom:0.85rem">
      You do not need to wait for a diagnosis to use any of these.
    </div>
    <div class="card" style="padding:0.5rem 1.25rem">
      ${s.support.map(item => `
        <div style="display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1.5px solid var(--border)">
          <i class="ti ti-check" style="color:var(--teal);font-size:18px;flex-shrink:0;margin-top:2px"></i>
          <div style="font-size:15px;color:var(--text-primary);line-height:1.5;flex:1">${item}</div>
        </div>`).join('')}
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:1rem">
      <button class="btn primary" style="margin:0" onclick="go('today')">
        <i class="ti ti-sun"></i> Open Today
      </button>
      <button class="btn sky" style="margin:0" onclick="go('reset')">
        <i class="ti ti-refresh"></i> Open Reset
      </button>
    </div>
  `;
}

// ─── Links tab ───────────────────────────────────────────
function renderLinks(s) {
  return `
    <div class="section-label">Useful links for this stage</div>
    <div class="notice blue" style="margin-bottom:0.85rem">
      External resources. All open in a new tab.
    </div>
    ${s.links.map(lk => `
      <a href="${lk.url}" target="_blank" rel="noopener noreferrer" class="link-card">
        <div class="link-icon" style="background:${LINK_BG[lk.color] || 'var(--teal-l)'}">
          <i class="ti ${lk.icon}" style="color:${LINK_IC[lk.color] || 'var(--teal)'}"></i>
        </div>
        <div style="flex:1;min-width:0">
          <div class="link-title">${lk.title}</div>
          <div class="link-sub">${lk.sub}</div>
        </div>
        <i class="ti ti-external-link" style="font-size:16px;color:var(--text-muted);flex-shrink:0"></i>
      </a>`).join('')}
  `;
}

// ═══════════════════════════════════════════════════════════
// WINDOW HANDLERS
// ═══════════════════════════════════════════════════════════
window.setCondition = function (k) {
  state.diagnosisCondition = k;
  state.diagnosisStage = null; // back to stage list when switching
  renderDiagnosis();
};

window.openStage = function (k) {
  state.diagnosisStage    = k;
  setStageKey(k);
  state.diagnosisTab      = 'overview';
  renderDiagnosis();
};

window.closeStage = function () {
  state.diagnosisStage = null;
  state.diagnosisTab   = 'overview';
  renderDiagnosis();
};

window.setStageTab = function (t) {
  state.diagnosisTab = t;
  renderDiagnosis();
};

window.toggleStagePrep = function (idx) {
  const k = state.diagnosisStage;
  if (!k) return;
  const STAGES = getStages();
  const stage = STAGES.find(s => s.k === k);
  if (!stage) return;
  let arr = getChecked(k);
  if (!arr) {
    arr = new Array(stage.prepare.length).fill(false);
  }
  arr[idx] = !arr[idx];
  setChecked(k, arr);
  renderDiagnosis();
};

window.resetStagePrep = function () {
  const k = state.diagnosisStage;
  if (!k) return;
  if (confirm('Reset all prep checkboxes for this stage?')) {
    const STAGES = getStages();
    const stage = STAGES.find(s => s.k === k);
    if (stage) setChecked(k, new Array(stage.prepare.length).fill(false));
    renderDiagnosis();
  }
};

window.copyScriptDiag = function (idx, btn) {
  const STAGES = getStages();
  const stage = STAGES.find(s => s.k === state.diagnosisStage);
  if (!stage) return;
  const script = stage.scripts[idx];
  if (!script) return;

  navigator.clipboard.writeText(script.t).catch(() => {});
  btn.innerHTML = '<i class="ti ti-check"></i> Copied';
  btn.style.background = 'var(--teal-l)';
  btn.style.color = 'var(--teal-d)';
  btn.style.borderColor = 'var(--teal)';
  setTimeout(() => {
    btn.innerHTML = '<i class="ti ti-copy"></i> Copy';
    btn.style.background = '';
    btn.style.color = '';
    btn.style.borderColor = '';
  }, 1800);
};

register('diagnosis', renderDiagnosis);
