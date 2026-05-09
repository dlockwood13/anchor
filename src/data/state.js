export const state = {
  screen: 'today',
  mood: null,
  tasks: [
    { id: 1, text: 'Eat something', meta: 'Essentials · 5 min', done: false },
    { id: 2, text: "Reply to Sam's email", meta: 'Medium energy · 10 min', done: false },
    { id: 3, text: 'Take medication', meta: 'Essentials · 1 min', done: false },
    { id: 4, text: 'Appointment at 3:00 PM', meta: 'Leave at 2:20 PM', done: false },
  ],
  stuckFlow: false,
  planMode: null,
  resetMode: null,
  tldrInput: '',
  tldrOutput: null,
  tldrLoading: false,
  breakdownOutput: null,
  breakdownLoading: false,
};
