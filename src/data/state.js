export const state = {
  // ── Navigation ──────────────────────────────────────────
  screen: 'splash',           // start at splash on first load

  // ── Today ───────────────────────────────────────────────
  mood:      null,
  moodColor: null,
  tasks: [
    { id: 1, text: 'Eat something',        meta: 'Essentials · 5 min',     color: 'teal',     done: false },
    { id: 2, text: "Reply to Sam's email", meta: 'Medium energy · 10 min', color: 'sky',      done: false },
    { id: 3, text: 'Take medication',      meta: 'Essentials · 1 min',     color: 'teal',     done: false },
    { id: 4, text: 'Appointment at 3 PM',  meta: 'Leave at 2:20 PM',       color: 'lavender', done: false },
  ],

  // ── Now ─────────────────────────────────────────────────
  stuckFlow: false,

  // ── Plan ────────────────────────────────────────────────
  planMode:  null,
  bdOutput:  null,
  bdLoading: false,

  // ── TL;DR ───────────────────────────────────────────────
  tldrInput:   '',
  tldrOutput:  null,
  tldrLoading: false,

  // ── Reset ───────────────────────────────────────────────
  resetMode: null,

  // ── Diagnosis Journey ───────────────────────────────────
  diagnosisStage:    null,
  diagnosisStageKey: null,
  diagnosisTab:      'next',

  // ── Me ──────────────────────────────────────────────────
  supportTab: 'adhd',
};

export const ACCENT = {
  teal:     '#3F8F73',   // updated brand teal
  sky:      '#85B7EB',
  lavender: '#7F77DD',
  peach:    '#F0997B',
  amber:    '#EF9F27',
};

export const BRAND = {
  name:    'Bowline',
  tagline: 'A calmer way through your day',
  motto:   'Structure when you need it. Never trapped by it.',
};
