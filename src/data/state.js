export const state = {
  screen: 'today',
  mood: null,
  moodColor: null,
  tasks: [
    { id: 1, text: 'Eat something',        meta: 'Essentials · 5 min',      color: 'teal',     done: false },
    { id: 2, text: "Reply to Sam's email", meta: 'Medium energy · 10 min',  color: 'sky',      done: false },
    { id: 3, text: 'Take medication',      meta: 'Essentials · 1 min',      color: 'teal',     done: false },
    { id: 4, text: 'Appointment at 3 PM',  meta: 'Leave at 2:20 PM',        color: 'lavender', done: false },
  ],
  stuckFlow:    false,
  planMode:     null,
  resetMode:    null,
  tldrInput:    '',
  tldrOutput:   null,
  tldrLoading:  false,
  bdOutput:     null,
  bdLoading:    false,
  supportTab:   'adhd',
};

export const ACCENT = {
  teal:     '#1D9E75',
  sky:      '#85B7EB',
  lavender: '#7F77DD',
  peach:    '#F0997B',
  amber:    '#EF9F27',
};
