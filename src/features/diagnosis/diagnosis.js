import { state } from '../../data/state.js';
import { register, setTopbar, go } from '../../app/router.js';

// ─── Local state ──────────────────────────────────────────
if (!state.diagnosisStage)     state.diagnosisStage     = null;
if (!state.diagnosisStageKey)  state.diagnosisStageKey  = null;
if (!state.diagnosisTab)       state.diagnosisTab       = 'overview';
if (!state.diagnosisChecked)   state.diagnosisChecked   = {}; // { stageKey: [bool, bool, ...] }
if (!state.diagnosisNotes)     state.diagnosisNotes     = {}; // { stageKey: string }

// ─── Stage definitions (9 stages, full content) ──────────
const STAGES = [
  {
    k: 'noticing', num: 1, color: 'lavender', icon: 'ti-bulb',
    l: 'I think I might be neurodivergent',
    sub: 'Noticing patterns',
    what: 'You are noticing that life feels harder than it seems to for other people. You do not need to be certain yet. You just need enough reason to ask for help. At this stage, the goal is observation, not diagnosis.',

    next: [
      'Start writing down examples of what is difficult, in your own words',
      'Note how long things have been this way — childhood, recent, or always',
      'Research ADHD, autism, dyslexia, dyspraxia, and see what resonates',
      'Talk to someone you trust about what you have noticed',
      'You do not need a diagnosis to start using support strategies today',
    ],

    prepare: [
      'Keep a simple list of struggles — focus, sensory, social, emotional, sleep, work',
      'Note any childhood examples you remember (school reports can help)',
      'Write down what makes things harder and what makes them easier',
      'Identify the patterns that feel most consistent across years',
      'Consider whether anyone in your family has been diagnosed',
    ],

    scripts: [
      { l: 'Thinking it out loud to yourself',
        t: 'I have been noticing some patterns in how I function that I want to understand better. They have been there for a long time. I think it might be worth exploring whether I am neurodivergent.' },
      { l: 'Mentioning it to a friend or partner',
        t: 'I have been thinking about something for a while and want to share it. I have been noticing patterns in how I think and feel — things like [example] — and I am wondering if I might be neurodivergent. I am not looking for advice yet, just want to say it out loud.' },
    ],

    support: [
      'Use reminders and external structure now — you do not need a diagnosis first',
      'Break tasks into steps using Bowline\'s task breakdown',
      'Reduce unnecessary demands where you can',
      'Wear headphones or earplugs if noise is difficult',
      'Track what causes overwhelm using the mood log on Today',
      'Read accounts by neurodivergent adults to see if their experiences resonate',
    ],

    links: [
      { title: 'ADHD Foundation — Adult ADHD',
        sub: 'UK-based charity with adult-focused information',
        url: 'https://www.adhdfoundation.org.uk/information/adults/', icon: 'ti-brain', color: 'lavender' },
      { title: 'National Autistic Society — signs of autism in adults',
        sub: 'NHS-aligned overview of common autism traits',
        url: 'https://www.autism.org.uk/advice-and-guidance/what-is-autism/the-history-of-autism/signs-of-autism-in-adults', icon: 'ti-heart', color: 'teal' },
      { title: 'Understood — Adult ADHD signs',
        sub: 'Accessible introduction to adult ADHD experience',
        url: 'https://www.understood.org/articles/en/the-difference-between-adhd-in-kids-and-adults', icon: 'ti-book', color: 'sky' },
      { title: 'Embrace Autism — RAADS-R screening',
        sub: 'A widely-used screening questionnaire (not a diagnosis)',
        url: 'https://embrace-autism.com/raads-r/', icon: 'ti-clipboard-check', color: 'amber' },
    ],
  },

  {
    k: 'collecting', num: 2, color: 'sky', icon: 'ti-notes',
    l: 'I am collecting examples',
    sub: 'Building your picture',
    what: 'Writing down your experiences makes appointments much easier. You will not have to remember everything on the spot, and patterns become clearer once they are written down. There is no wrong way to do this.',

    next: [
      'Keep a running document of examples — focus, sensory, emotional, social',
      'Include school, work, relationships, and daily life',
      'Note childhood examples if you remember them',
      'Ask family members what they remember about you growing up',
      'Save your notes somewhere you can find them again',
    ],

    prepare: [
      'Focus on patterns, not single events',
      'Include things others find easy that you find hard',
      'Note how things affect work, relationships, or daily functioning',
      'If possible, ask a parent or someone who knew you as a child',
      'Keep examples specific — "I forgot to eat 4 days last week" is more useful than "I forget to eat"',
      'Save any school reports, work feedback, or old emails that show patterns',
    ],

    scripts: [
      { l: 'Asking a family member for childhood examples',
        t: 'I am trying to understand some patterns I have noticed. Do you remember me struggling with focus, sensory things, or social situations when I was younger? Anything specific you remember would really help me.' },
      { l: 'Asking a partner for outside perspective',
        t: 'I am putting together examples of things I find difficult. Could you tell me what you notice — things that seem harder for me than they would be for most people? I want your honest view.' },
      { l: 'Reflecting on your own experience',
        t: 'When I think about how I have always functioned, the things that have always been hard are: [list]. The things that have always been easy are: [list]. The patterns I see are: [list].' },
    ],

    support: [
      'Use Bowline\'s Brain Dump to get thoughts out without organising them first',
      'Use TL;DR Assist to process any official letters or referral forms',
      'Keep all notes in one place — a folder, a doc, or a notes app',
      'A list of 10-20 specific examples is plenty for an assessment',
      'Notice what helps too — that is just as useful as what is hard',
    ],

    links: [
      { title: 'ADDitude — How to prepare for ADHD assessment',
        sub: 'Practical guide to documenting symptoms and history',
        url: 'https://www.additudemag.com/adhd-diagnosis-adults/', icon: 'ti-clipboard-check', color: 'amber' },
      { title: 'National Autistic Society — Pre-assessment guide',
        sub: 'What to gather before your appointment',
        url: 'https://www.autism.org.uk/advice-and-guidance/topics/diagnosis/assessment-and-diagnosis', icon: 'ti-heart', color: 'teal' },
      { title: 'ADHD UK — Adult symptom checklist',
        sub: 'A self-screening tool to help organise your thoughts',
        url: 'https://adhduk.co.uk/symptoms-of-adhd/', icon: 'ti-list-check', color: 'lavender' },
    ],
  },

  {
    k: 'gp', num: 3, color: 'teal', icon: 'ti-stethoscope',
    l: 'I have spoken to my GP',
    sub: 'First professional step',
    what: 'Speaking to your GP is usually the NHS starting point. You can ask for a referral for an assessment. You do not need to prove you are neurodivergent — describing your difficulties and how they affect daily life is enough. If you feel dismissed, you can ask for a second opinion or a different GP.',

    next: [
      'Ask your GP to refer you to a specialist for ADHD or autism assessment',
      'Explain how difficulties affect your daily functioning',
      'Ask about Right to Choose (England only) — this lets you pick the assessment provider',
      'Note the date of the appointment and who sent the referral',
      'Ask for a copy of the referral letter',
    ],

    prepare: [
      'Bring your written examples to the appointment',
      'Write down 3 specific things you want to say at the start',
      'Have a clear sentence ready: "I would like a referral for an assessment"',
      'Mention any conditions that have been ruled out (anxiety, depression, thyroid)',
      'Ask for the referral letter to be copied to you',
      'Take a trusted person with you if it helps',
      'If the GP is unsure, ask politely to discuss it with a specialist instead',
    ],

    scripts: [
      { l: 'Asking for a referral (direct)',
        t: 'I think I may be neurodivergent. I have been struggling with daily functioning in several areas for many years. I would like to be referred for an assessment.' },
      { l: 'Asking about Right to Choose (England)',
        t: 'I understand I may have the right to choose my assessment provider under NHS Right to Choose. Can you include that in my referral and let me know which providers are available?' },
      { l: 'If the GP seems unsure',
        t: 'I understand it may not be obvious from this appointment. I have written down specific examples of how this affects my work and daily life. I would like to discuss them with a specialist rather than rule it out at this stage.' },
      { l: 'Asking for the referral letter',
        t: 'Could you send me a copy of the referral letter so I have a record? It will help me keep track of the process.' },
      { l: 'If you feel dismissed',
        t: 'Thank you for your time. I would like to make another appointment to discuss this further, ideally with a different GP if possible. This is important to me.' },
    ],

    support: [
      'Take a trusted person with you if that helps',
      'Ask for written notes from the appointment',
      'You can ask for things to be repeated or written down',
      'Use Bowline\'s TL;DR Assist to process any letters or forms you receive',
      'Note down what the GP said immediately after — memory fades quickly',
    ],

    links: [
      { title: 'NHS — Getting diagnosed with autism',
        sub: 'Official NHS guidance for adult autism assessment',
        url: 'https://www.nhs.uk/conditions/autism/getting-diagnosed/diagnosis/', icon: 'ti-heart', color: 'teal' },
      { title: 'NHS — ADHD diagnosis and referral',
        sub: 'How the NHS assesses adult ADHD',
        url: 'https://www.nhs.uk/conditions/attention-deficit-hyperactivity-disorder-adhd/diagnosis/', icon: 'ti-brain', color: 'lavender' },
      { title: 'NHS Right to Choose (England)',
        sub: 'Your right to pick your assessment provider',
        url: 'https://www.england.nhs.uk/contact-us/right-to-choose/', icon: 'ti-arrow-right', color: 'sky' },
      { title: 'ADHD UK — Right to Choose providers',
        sub: 'Up-to-date list of NHS-funded providers',
        url: 'https://adhduk.co.uk/right-to-choose/', icon: 'ti-list', color: 'amber' },
    ],
  },

  {
    k: 'referred', num: 4, color: 'amber', icon: 'ti-send',
    l: 'My referral has been sent',
    sub: 'Waiting for it to be accepted',
    what: 'Your GP has sent the referral. The next step is for the service to accept it and add you to their waiting list. This can take weeks. The service may write to you, or your GP, or both — keep an eye on post and email.',

    next: [
      'Chase your GP or the service after 4 to 6 weeks if you have not heard',
      'Ask for written confirmation that the referral has been received',
      'Keep all letters and reference numbers somewhere safe',
      'Ask what the expected waiting time is',
      'Update your contact details with your GP and the service if anything changes',
    ],

    prepare: [
      'Note the name of the service your referral was sent to',
      'Make sure your GP has your current phone number and address',
      'If you move house, tell both your GP and the service',
      'Create a folder (physical or digital) for everything related to the assessment',
      'Save the GP referral letter if you got a copy',
    ],

    scripts: [
      { l: 'Chasing the referral after 4-6 weeks',
        t: 'Hello, I was referred by my GP on [date] for a neurodevelopmental assessment. I have not yet heard whether my referral has been accepted. Could you confirm the status, and let me know what happens next?' },
      { l: 'Asking about expected timeline',
        t: 'Can you tell me the approximate waiting time for an assessment, and what I should expect after the referral is accepted?' },
      { l: 'If the GP says they have not heard back',
        t: 'Could you re-send the referral, or contact the service directly to check it was received? It has been [X] weeks now.' },
    ],

    support: [
      'You do not need to wait for the assessment to start using support strategies',
      'Use Bowline\'s Today, Reset, and TL;DR tools while you wait',
      'Keep a folder for all correspondence',
      'If you can, take some time off chasing every few weeks — it is exhausting',
    ],

    links: [
      { title: 'National Autistic Society — Waiting for assessment',
        sub: 'What to expect during the waiting period',
        url: 'https://www.autism.org.uk/advice-and-guidance/topics/diagnosis', icon: 'ti-clock', color: 'amber' },
      { title: 'ADHD UK — Waiting list guidance',
        sub: 'How to navigate NHS ADHD waiting lists',
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
    what: 'Waiting is often the longest part. NHS autism assessments in England can take over a year on average — sometimes much longer. ADHD assessments can also take months to years. The wait does not reflect how serious your needs are. You are not exaggerating; the system is overstretched.',

    next: [
      'Use Bowline and other strategies now — do not wait for diagnosis',
      'Keep a record of how difficulties are affecting you, in case the assessor asks',
      'Ask your GP if any interim support is available (some areas offer pre-diagnostic groups)',
      'Look into workplace or university adjustments you can ask for now',
      'Consider joining a peer support community while you wait',
    ],

    prepare: [
      'Continue adding to your notes when something significant happens',
      'Note any major life changes (job, relationship, health)',
      'If your difficulties become a crisis, speak to your GP — that may escalate the referral',
      'Save anything that shows the impact on your life (sick days, missed deadlines, feedback)',
      'Connect with neurodivergent communities online for peer support',
    ],

    scripts: [
      { l: 'Asking employer for adjustments while waiting',
        t: 'I am currently waiting for a neurodevelopmental assessment. While I wait, I would like to discuss some adjustments that may help me work more effectively. I am happy to provide more detail if useful.' },
      { l: 'Asking GP for interim support',
        t: 'I am on the waiting list for assessment, but I am really struggling in the meantime. Is there any interim support available — therapy, medication review, or local services I could access now?' },
      { l: 'Asking university disability team for support',
        t: 'I am currently undergoing assessment for [condition]. While I wait, I would like to discuss what support and adjustments are available to me. The waiting time is around [X] months.' },
      { l: 'Reaching out to a friend for support',
        t: 'I am in the middle of the assessment process and it is taking a long time. I do not need advice, but it would help to talk sometimes about how things are going.' },
    ],

    support: [
      'Use Bowline daily — Today, Now, Reset and TL;DR are built for this',
      'Routine and structure help now, before and after diagnosis',
      'Contact Mind or a local mental health charity for peer support',
      'Look into Access to Work (UK) — you can apply without a formal diagnosis',
      'Many workplaces will offer reasonable adjustments based on self-disclosure alone',
    ],

    links: [
      { title: 'Mind — Support while waiting for diagnosis',
        sub: 'General mental health support during long waits',
        url: 'https://www.mind.org.uk/information-support/types-of-mental-health-problems/mental-health-problems-introduction/seeking-help/', icon: 'ti-heart', color: 'peach' },
      { title: 'ADHD UK — While you wait',
        sub: 'Specific strategies for the ADHD waiting period',
        url: 'https://adhduk.co.uk/i-am-waiting-for-an-adhd-assessment/', icon: 'ti-brain', color: 'lavender' },
      { title: 'Access to Work (UK government)',
        sub: 'Workplace support funding — no diagnosis needed',
        url: 'https://www.gov.uk/access-to-work', icon: 'ti-briefcase', color: 'sky' },
      { title: 'Autistic Not Weird — Online community',
        sub: 'Peer support and writing by autistic adults',
        url: 'https://autisticnotweird.com', icon: 'ti-users', color: 'teal' },
    ],
  },

  {
    k: 'booked', num: 6, color: 'teal', icon: 'ti-calendar-check',
    l: 'My assessment is booked',
    sub: 'Preparing for assessment',
    what: 'Your appointment is confirmed. The assessment is a conversation — you do not need to perform, prove anything, or impress anyone. Just describe your real experience honestly. Masking during the appointment can hide what they need to see. It is OK to be tired, fidgety, or unsure.',

    next: [
      'Gather all your written notes and examples',
      'Plan your journey and what you need to bring',
      'Plan recovery time after the appointment — it will be tiring',
      'Write down anything you do not want to forget to mention',
      'Decide whether to bring a trusted person (if the format allows)',
    ],

    prepare: [
      'Review your notes — childhood, school, work, relationships, daily life',
      'List specific examples of masking if relevant ("I rehearse what to say at meetings")',
      'Bring or list any school reports, work feedback, or assessments you have',
      'Decide what you want from the assessment — diagnosis, advice, both?',
      'Prepare for waiting-room sensory overwhelm — bring headphones, fidget',
      'Eat and drink water before going — assessments can be 2-3 hours',
      'Plan something gentle for afterwards',
    ],

    scripts: [
      { l: 'Asking about the format in advance',
        t: 'Could you tell me what to expect from the assessment? How long will it take, what kinds of questions will be asked, and is it OK to bring written notes?' },
      { l: 'Asking for adjustments at assessment',
        t: 'I may need some adjustments during the assessment. Could I have breaks if needed, and can questions be repeated or rephrased if I need them to be? I may also want to bring a sensory item.' },
      { l: 'If asked whether you mask',
        t: 'Yes, I mask a lot in social and professional situations. What you may see in this appointment may not reflect how I function day to day. I have tried to come as myself, but it is hard to turn off.' },
      { l: 'If you do not know an answer',
        t: 'I am not sure how to answer that. Can you rephrase, or can I think about it for a moment? I do not want to give the wrong answer just to give one.' },
      { l: 'If the assessor moves too fast',
        t: 'Could we slow down a little? I am processing what you are saying and want to make sure I answer accurately.' },
    ],

    support: [
      'Tell the assessor about your sensory needs at the start',
      'You can take notes during, or ask for things to be written down',
      'It is OK to fidget, look away, or take breaks',
      'Plan calming sensory input for after — quiet, headphones, comfort food',
      'Do not schedule anything demanding for the rest of that day',
    ],

    links: [
      { title: 'NAS — What to expect at an autism assessment',
        sub: 'Detailed overview of the assessment process',
        url: 'https://www.autism.org.uk/advice-and-guidance/topics/diagnosis/assessment-and-diagnosis/adults', icon: 'ti-clipboard-check', color: 'teal' },
      { title: 'ADDitude — Preparing for ADHD assessment',
        sub: 'What questions to expect and how to prepare',
        url: 'https://www.additudemag.com/adhd-testing-diagnosis/', icon: 'ti-brain', color: 'lavender' },
      { title: 'ADHD UK — Assessment day guide',
        sub: 'Practical tips for the day of your appointment',
        url: 'https://adhduk.co.uk/getting-an-adhd-diagnosis/', icon: 'ti-list-check', color: 'amber' },
    ],
  },

  {
    k: 'assessed', num: 7, color: 'lavender', icon: 'ti-clipboard-check',
    l: 'I have had my assessment',
    sub: 'Waiting for the outcome',
    what: 'The assessment has happened. You may now be waiting for the formal written report. This can take days, weeks, or sometimes months depending on the service. The waiting after is its own kind of difficult — you may feel exposed, doubtful, or impatient. All of that is normal.',

    next: [
      'Ask how long the written report will take',
      'Get the name and contact of the assessor or service',
      'Ask what happens next — will they contact you, or do you contact them?',
      'Note anything the assessor said verbally that you want to remember',
    ],

    prepare: [
      'Think about who you want to tell, and when',
      'Think about what you want from the outcome — practical support, identity clarity, both?',
      'Consider what support you would like immediately if diagnosed',
      'Give yourself permission to feel everything — relief, doubt, exhaustion, all of it',
    ],

    scripts: [
      { l: 'Asking about the timeline for the report',
        t: 'Could you tell me how long the written report will take, and how I will receive it? Will it come by post, email, or both?' },
      { l: 'Following up if you have not heard',
        t: 'Hello, I had my assessment on [date]. I have not yet received my report. Could you give me an update on when to expect it?' },
      { l: 'Telling someone close that you have had the assessment',
        t: 'I had my assessment yesterday. I am still processing it. The outcome will come in a few weeks. I do not need to talk about it in detail yet, but I wanted you to know.' },
    ],

    support: [
      'The waiting after assessment can feel exposing — be gentle with yourself',
      'Use Bowline\'s Reset tools if you feel anxious or doubtful',
      'Talk to someone you trust about how you are feeling',
      'Do not push yourself to make any big decisions until the report comes',
      'Sleep and food matter more than usual right now',
    ],

    links: [
      { title: 'Mind — Processing health appointments',
        sub: 'General mental health support after difficult appointments',
        url: 'https://www.mind.org.uk', icon: 'ti-heart', color: 'peach' },
      { title: 'NAS — Post-assessment information',
        sub: 'What happens between assessment and report',
        url: 'https://www.autism.org.uk/advice-and-guidance/topics/diagnosis', icon: 'ti-clock', color: 'teal' },
    ],
  },

  {
    k: 'result', num: 8, color: 'peach', icon: 'ti-file-description',
    l: 'I have my result',
    sub: 'Processing the outcome',
    what: 'You have received your outcome. Whether you were diagnosed or not, this can bring up a lot. Relief, sadness, anger, grief for the version of you who did not know — all of it is normal. There is no right way to feel. Take your time.',

    next: [
      'Read the report when you feel ready — not all at once if needed',
      'Keep your report safe — you may need it for work, university, benefits, future care',
      'Decide who you want to share it with, if anyone',
      'Ask about next steps — medication, therapy, support groups, follow-up',
      'Give yourself weeks or months to process — there is no rush',
    ],

    prepare: [
      'If diagnosed — ask about local support services',
      'If not diagnosed — ask what the report recommends, and whether reassessment is advised',
      'Ask if any conditions were ruled out that you might want to follow up on',
      'Keep a copy of the report in at least two safe places (digital + physical)',
      'Note any practical next steps the report recommends',
    ],

    scripts: [
      { l: 'Asking about next steps after diagnosis',
        t: 'Now that I have a diagnosis, what support is available to me? Are there local services, support groups, or NHS follow-ups I should know about?' },
      { l: 'If you did not receive a diagnosis',
        t: 'I did not receive a diagnosis, but I still struggle with these things. What do you recommend I do next? Are there other conditions I should explore, or could I be reassessed in future?' },
      { l: 'Telling your employer (formal)',
        t: 'I am writing to let you know I have recently received a diagnosis of [condition]. I would like to arrange a meeting to discuss what reasonable adjustments might help me in my role.' },
      { l: 'Telling your employer (informal)',
        t: 'I wanted to share something with you. I have been recently diagnosed with [condition]. I am still working out what it means for me, but I wanted you to know in case it is useful context.' },
      { l: 'Telling a partner or close family',
        t: 'I have just received my diagnosis. I am still processing it. I wanted to tell you because it explains a lot about how I experience things. I do not need answers, just understanding right now.' },
      { l: 'Telling a friend',
        t: 'I had an assessment and got a diagnosis of [condition]. I am still figuring out what to do with it. Mostly I just wanted to tell you, because you are someone I trust.' },
    ],

    support: [
      'Processing a diagnosis can take weeks or months — there is no right speed',
      'A diagnosis does not change who you are — it explains some of your experience',
      'Peer support communities can be a lifeline — people who understand from the inside',
      'You may want to revisit your past with new context. That can be intense. Take it slowly',
      'Therapy with a neurodiversity-affirming professional can help with processing',
      'You do not have to tell anyone unless and until you want to',
    ],

    links: [
      { title: 'Autistic UK — After diagnosis',
        sub: 'Resources for newly-diagnosed autistic adults',
        url: 'https://autisticuk.org', icon: 'ti-heart', color: 'teal' },
      { title: 'ADHD UK — Newly diagnosed',
        sub: 'What to do after an adult ADHD diagnosis',
        url: 'https://adhduk.co.uk/newly-diagnosed-with-adhd/', icon: 'ti-brain', color: 'lavender' },
      { title: 'NAS — After your diagnosis',
        sub: 'Official guidance from the National Autistic Society',
        url: 'https://www.autism.org.uk/advice-and-guidance/topics/diagnosis/after-your-diagnosis', icon: 'ti-arrow-right', color: 'sky' },
      { title: 'Neurodiversity Hub — Workplace disclosure',
        sub: 'Should you tell your employer? When and how?',
        url: 'https://www.neurodiversityhub.org', icon: 'ti-briefcase', color: 'amber' },
      { title: 'Access to Work (UK)',
        sub: 'Government funding for workplace adjustments',
        url: 'https://www.gov.uk/access-to-work', icon: 'ti-coin', color: 'teal' },
    ],
  },

  {
    k: 'support', num: 9, color: 'teal', icon: 'ti-lifebuoy',
    l: 'I need support now',
    sub: 'Support does not wait for diagnosis',
    what: 'Wherever you are in the process — pre-referral, waiting, just diagnosed, or years past — your needs are real now. You do not need a diagnosis to deserve support, ask for adjustments, or use strategies that help.',

    next: [
      'Use Bowline every day — Today, Now, Reset, and TL;DR are built for your needs',
      'Ask your employer or school about adjustments',
      'Contact your GP if difficulties are affecting your mental health',
      'Find a peer support community',
      'Consider therapy with a neurodiversity-affirming practitioner',
    ],

    prepare: [
      'You do not need to justify your needs — they are real regardless of a label',
      'Write down what helps and what does not — this is your evidence',
      'Identify your most pressing need right now and start there',
      'Look at what is sustainable, not just what is ideal',
    ],

    scripts: [
      { l: 'Asking for workplace adjustments',
        t: 'I am experiencing some difficulties with [focus / sensory environment / unclear instructions] that affect my work. I would like to discuss some adjustments that could help. I am happy to share more detail if useful.' },
      { l: 'Asking for university support',
        t: 'I am struggling with aspects of university life. I would like to speak to the disability or wellbeing team about what support is available, with or without a formal diagnosis. Could you point me in the right direction?' },
      { l: 'Asking GP for mental health support',
        t: 'My mental health is being affected by difficulties I am having with daily functioning. I would like to discuss what support is available to me right now.' },
      { l: 'Talking to someone you trust about struggling',
        t: 'I have been finding things really hard lately. I do not always have the right words, but I wanted to let you know I am struggling. I am not asking you to fix it.' },
      { l: 'Saying no to a demand',
        t: 'Thank you for asking. Right now I am not able to take this on. I will let you know if that changes.' },
      { l: 'Asking for accommodation in a healthcare setting',
        t: 'I find waiting rooms and unfamiliar environments difficult. Could I wait somewhere quieter, or be given a clearer idea of when I will be seen? It would really help.' },
    ],

    support: [
      'Routines, reminders, and structure help everyone — diagnosis or not',
      'Sensory tools (headphones, weighted blanket, fidget) are valid without a label',
      'Breaking tasks into steps reduces executive function load immediately',
      'You are allowed to rest, reduce demands, and ask for help',
      'Crisis lines do not require a diagnosis — they are for anyone struggling',
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
      { title: 'Scope — Disability rights and adjustments',
        sub: 'Help with disability and work adjustments',
        url: 'https://www.scope.org.uk', icon: 'ti-briefcase', color: 'sky' },
      { title: 'NHS — Urgent mental health help',
        sub: 'How to get urgent mental health support',
        url: 'https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/behaviours/help-for-suicidal-thoughts/', icon: 'ti-first-aid-kit', color: 'teal' },
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

// ─── Main render ──────────────────────────────────────────
export function renderDiagnosis() {
  setTopbar('Journey', 'Where are you in the process?');

  if (state.diagnosisStage) return renderStage();
  renderStageList();
}

// ─── Stage list view ─────────────────────────────────────
function renderStageList() {
  const savedKey = state.diagnosisStageKey;
  const completedStages = Object.keys(state.diagnosisChecked).filter(k => {
    const arr = state.diagnosisChecked[k];
    const stage = STAGES.find(s => s.k === k);
    return stage && arr && arr.filter(Boolean).length === stage.prepare.length;
  });
  const progressPct = (completedStages.length / STAGES.length) * 100;

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="notice purple">
        <strong>You do not need to wait for a diagnosis to deserve support.</strong><br>
        Your needs are real now. Tap where you are to see what to do next.
      </div>

      ${completedStages.length > 0 ? `
        <div class="card teal">
          <div class="card-label">Your progress</div>
          <div class="card-main" style="font-size:16px">${completedStages.length} of ${STAGES.length} stages with completed prep</div>
          <div class="progress-bar" style="margin-top:12px;margin-bottom:0">
            <div class="progress-fill" style="width:${progressPct}%"></div>
          </div>
        </div>
      ` : ''}

      ${savedKey ? `
        <div class="notice green">
          You last looked at: <strong>${STAGES.find(s => s.k === savedKey)?.l || ''}</strong>
          <button class="btn primary" style="margin-top:10px;margin-bottom:0" onclick="openStage('${savedKey}')">
            <i class="ti ti-arrow-right"></i> Continue from here
          </button>
        </div>
      ` : ''}

      <div class="section-label">Where are you right now?</div>

      ${STAGES.map(s => {
        const isCurrent  = s.k === savedKey;
        const isComplete = completedStages.includes(s.k);
        return `
          <button class="btn ${isCurrent ? 'primary' : ''}"
            style="${!isCurrent ? `border-left:4px solid var(--${s.color})` : ''}"
            onclick="openStage('${s.k}')">
            <span style="
              width:30px;height:30px;border-radius:50%;
              background:${isCurrent ? 'rgba(255,255,255,0.2)' : `var(--${s.color}-l)`};
              color:${isCurrent ? '#fff' : `var(--${s.color}-d)`};
              font-size:13px;font-weight:700;
              display:flex;align-items:center;justify-content:center;
              flex-shrink:0">
              ${isComplete ? '<i class="ti ti-check" style="font-size:16px"></i>' : s.num}
            </span>
            <div style="flex:1;text-align:left">
              <div style="font-size:14px">${s.l}</div>
              <div style="font-size:12px;font-weight:400;opacity:${isCurrent ? '0.85' : '0.65'};margin-top:2px">${s.sub}</div>
            </div>
            <i class="ti ti-chevron-right" style="font-size:18px;opacity:0.5;flex-shrink:0"></i>
          </button>`;
      }).join('')}

      <div class="notice blue" style="margin-top:1.25rem">
        <strong>Stage navigation.</strong> Pick the stage that fits where you are now. You can revisit any stage at any time, in any order.
      </div>
    </div>`;
}

// ─── Stage detail view ───────────────────────────────────
function renderStage() {
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

  // Progress on prep checklist
  const checked = state.diagnosisChecked[s.k] || new Array(s.prepare.length).fill(false);
  const completedCount = checked.filter(Boolean).length;
  const prepPct = (completedCount / s.prepare.length) * 100;

  let tabContent = '';
  if (tab === 'overview') tabContent = renderOverview(s);
  if (tab === 'prepare')  tabContent = renderPrepare(s, checked);
  if (tab === 'scripts')  tabContent = renderScripts(s);
  if (tab === 'support')  tabContent = renderSupport(s);
  if (tab === 'links')    tabContent = renderLinks(s);

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <button class="btn" style="margin-bottom:10px;color:var(--text-muted)" onclick="closeStage()">
        <i class="ti ti-arrow-left"></i> All stages
      </button>

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

      <!-- Tab strip -->
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

      <!-- Stage navigation -->
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

// ─── Prepare tab (interactive checklist) ─────────────────
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

// ─── Scripts tab (copyable) ──────────────────────────────
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

// ─── Support tab ──────────────────────────────────────────
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

// ─── Links tab ────────────────────────────────────────────
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

// ─── Window handlers ──────────────────────────────────────
window.openStage = function (k) {
  state.diagnosisStage    = k;
  state.diagnosisStageKey = k;
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
  const stage = STAGES.find(s => s.k === k);
  if (!stage) return;
  if (!state.diagnosisChecked[k]) {
    state.diagnosisChecked[k] = new Array(stage.prepare.length).fill(false);
  }
  state.diagnosisChecked[k][idx] = !state.diagnosisChecked[k][idx];
  renderDiagnosis();
};

window.resetStagePrep = function () {
  const k = state.diagnosisStage;
  if (!k) return;
  if (confirm('Reset all prep checkboxes for this stage?')) {
    const stage = STAGES.find(s => s.k === k);
    if (stage) state.diagnosisChecked[k] = new Array(stage.prepare.length).fill(false);
    renderDiagnosis();
  }
};

window.copyScriptDiag = function (idx, btn) {
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
