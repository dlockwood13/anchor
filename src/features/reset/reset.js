import { state } from '../../data/state.js';
import { register, setTopbar, go } from '../../app/router.js';

// ─── Local state ──────────────────────────────────────────
if (!state.resetView)   state.resetView   = 'picker';   // picker | flow | breathing | complete | journal
if (state.resetStep === undefined) state.resetStep = 0;
if (!state.resetOutcome) state.resetOutcome = null;

// ─── Reset definitions ────────────────────────────────────
// Each reset has: a colour, an intro, expanded steps (with type), and post-flow options.
const RESETS = [
  // ── 1. Overstimulation ─────────────────────────────────
  {
    k: 'over',
    icon: 'ti-volume-3',
    l: 'Too much input',
    sub: 'Overstimulated, sensory overload',
    color: 'peach',
    intro: "When your senses are full, your thinking brain shuts down. The fix is not willpower — it's reducing input.",
    steps: [
      { type: 'action',    text: 'Move away from the loudest source of noise if you can.', tip: 'Even one room over makes a difference.' },
      { type: 'action',    text: 'Lower the screen brightness on whatever device you can see right now.', tip: 'Brightness is sensory input too.' },
      { type: 'action',    text: 'Put on headphones, earplugs, or pull a hood over your head.', tip: 'Block what you can.' },
      { type: 'action',    text: 'Loosen anything tight: belt, waistband, collar, shoes.', tip: 'Skin contact matters.' },
      { type: 'breathing', text: 'Slow exhale × 3', detail: 'Breathe out for 6 counts. Pause. Repeat 3 times. The exhale tells your nervous system you are safe.' },
      { type: 'reflect',   text: 'What is still on?', detail: 'Notifications, screens, music, lights — what can you turn down or off right now?' },
      { type: 'choice',    text: 'Choose what comes next.' },
    ],
    recoveryHint: 'Sensory recovery can take 20–60 minutes. There is no rush.',
  },

  // ── 2. Understimulation ────────────────────────────────
  {
    k: 'under',
    icon: 'ti-battery-1',
    l: 'Too little stimulation',
    sub: 'Understimulated, flat, restless',
    color: 'amber',
    intro: "Understimulated brains can't focus either. They need safe input first — then the task gets possible.",
    steps: [
      { type: 'action',  text: 'Put on familiar music — something with energy you like.', tip: 'Familiar matters more than new.' },
      { type: 'action',  text: 'Pick up a fidget, stress ball, or tactile object.', tip: 'Anything to engage your hands.' },
      { type: 'action',  text: 'Stand up and move for one minute.', tip: 'Stretch, pace, dance — whatever.' },
      { type: 'action',  text: 'Walk to another room and back.', tip: 'Even small movement helps.' },
      { type: 'action',  text: 'Make a drink — something with flavour.', tip: 'Cold water, tea, coffee, squash. Sip slowly.' },
      { type: 'choice',  text: 'Choose what comes next.' },
    ],
    recoveryHint: "If you're still flat, try a body-double timer — sometimes only structure breaks through.",
  },

  // ── 3. Can't start ─────────────────────────────────────
  {
    k: 'start',
    icon: 'ti-player-pause',
    l: "Can't start",
    sub: 'Frozen, task paralysis',
    color: 'lavender',
    intro: "Freeze is real. It's not laziness. The way out is to shrink the task until your brain accepts it.",
    steps: [
      { type: 'reflect', text: 'What is the smallest possible first step?', detail: 'Not the first real step — the step before the first real step. Opening the email. Putting on shoes. Finding the file.' },
      { type: 'action',  text: 'Set a 3-minute timer.', tip: "Just 3 minutes. You don't have to continue after." },
      { type: 'action',  text: 'You only need to start. Not finish.', tip: 'Starting is the win.' },
      { type: 'reflect', text: 'Notice the resistance without judging it.', detail: 'Your brain is doing what it does. You are not broken.' },
      { type: 'action',  text: 'Begin — even if it feels wrong.', tip: 'Wrong-feeling progress is still progress.' },
      { type: 'choice',  text: 'Choose what comes next.' },
    ],
    recoveryHint: 'Task paralysis often eases once you have momentum. Body doubling helps lock that in.',
  },

  // ── 4. Anxiety spike ───────────────────────────────────
  {
    k: 'anxiety',
    icon: 'ti-wind',
    l: 'Anxiety spike',
    sub: 'Racing thoughts, tight chest',
    color: 'sky',
    intro: "Anxiety adds noise to everything. Reducing the noise is more useful than solving the worry.",
    steps: [
      { type: 'breathing', text: 'Slow exhale × 4', detail: 'Breathe out slowly for 4 counts. The exhale activates your calming nervous system.' },
      { type: 'action',    text: 'Place your feet flat on the floor.', tip: 'Press down gently. Feel the ground.' },
      { type: 'reflect',   text: 'Name 3 things you can see right now.', detail: 'Out loud or in your head. Just name them.' },
      { type: 'reflect',   text: 'What is actually certain right now?', detail: 'Not what might happen. What is true at this moment.' },
      { type: 'reflect',   text: 'What can wait until later?', detail: 'You do not have to solve everything in this hour.' },
      { type: 'action',    text: 'Choose one very small action.', tip: 'Drink water. Send one text. Stand up. One thing.' },
      { type: 'choice',    text: 'Choose what comes next.' },
    ],
    recoveryHint: 'If anxiety is high regularly, talking to your GP or therapist is a valid step.',
  },

  // ── 5. Change of plan ──────────────────────────────────
  {
    k: 'change',
    icon: 'ti-route-x',
    l: 'Change of plan',
    sub: 'Something unexpected happened',
    color: 'amber',
    intro: "Change of plan is hard for neurodivergent brains. The plan in your head needs time to be replaced — that's a real cost.",
    steps: [
      { type: 'reflect', text: 'Pause. This is allowed.', detail: 'You do not need to immediately adapt. Give yourself a minute.' },
      { type: 'reflect', text: 'What actually changed?', detail: 'Be specific. One sentence.' },
      { type: 'reflect', text: 'What is still true?', detail: 'Most of the day is probably the same. Anchor to what stayed.' },
      { type: 'reflect', text: 'What is urgent right now?', detail: 'Right now — not later, not maybe.' },
      { type: 'reflect', text: 'What can move to later or tomorrow?', detail: 'Reduce the active list to what truly matters.' },
      { type: 'action',  text: 'Choose the next single step.', tip: 'One thing only.' },
      { type: 'choice',  text: 'Choose what comes next.' },
    ],
    recoveryHint: 'After a change of plan, your brain may need a recovery buffer. Reduce demands for the next hour.',
  },

  // ── 6. Shutdown ────────────────────────────────────────
  {
    k: 'shutdown',
    icon: 'ti-moon',
    l: 'Shutdown',
    sub: 'Withdrawn, empty, blank',
    color: 'sky',
    intro: "Shutdown is when your system protects you by switching off. Pushing through makes it worse. Essentials only.",
    steps: [
      { type: 'action',  text: 'Drink water — even a few sips.', tip: 'Dehydration deepens shutdown.' },
      { type: 'action',  text: 'Eat something — anything. Toast, fruit, a snack.', tip: 'Low blood sugar mimics shutdown.' },
      { type: 'action',  text: 'Lie down or sit somewhere quiet.', tip: 'Lower physical demands.' },
      { type: 'reflect', text: 'No decisions right now.', detail: 'Decision-making is offline. Do not try to plan.' },
      { type: 'reflect', text: 'Rest is valid. This is information, not failure.', detail: 'Your body is protecting you. Trust it.' },
      { type: 'action',  text: 'Return when you are ready — no timeline.', tip: 'Some shutdowns last an hour. Some a day. Both are normal.' },
      { type: 'choice',  text: 'Choose what comes next.' },
    ],
    recoveryHint: 'Shutdown recovery can take hours or days. Tell people you need quiet — that is a complete sentence.',
  },

  // ── 7. Decision overload ───────────────────────────────
  {
    k: 'decision',
    icon: 'ti-brain',
    l: 'Decision overload',
    sub: 'Too many choices to make',
    color: 'lavender',
    intro: "When every option feels equally important, your brain can't pick. The fix is to remove options, not analyse them.",
    steps: [
      { type: 'reflect', text: 'Pause all decisions for the next 10 minutes.', detail: 'Set the timer mentally. Nothing has to be decided right now.' },
      { type: 'reflect', text: 'What is the one most urgent thing?', detail: 'Urgent means: there are consequences within hours.' },
      { type: 'reflect', text: 'Can anything wait 24 hours?', detail: "Be honest — most things can wait. They feel urgent but aren't." },
      { type: 'action',  text: 'Choose the smallest available option.', tip: "When in doubt, pick the one with the lowest cost." },
      { type: 'reflect', text: 'Nothing else until that one is done.', detail: 'Decision-making is a finite resource. Spend it on one thing.' },
      { type: 'choice',  text: 'Choose what comes next.' },
    ],
    recoveryHint: 'If decisions stack up regularly, try deciding less — automate, delegate, or just default to your usual choice.',
  },

  // ── 8. Social exhaustion ───────────────────────────────
  {
    k: 'social',
    icon: 'ti-users',
    l: 'Social exhaustion',
    sub: 'After people, before recovery',
    color: 'teal',
    intro: "Social interaction costs energy for neurodivergent brains — masking, reading rooms, performing fluency. Recovery is not optional.",
    steps: [
      { type: 'action',  text: 'Find a quiet space — alone if possible.', tip: 'Bedroom, bathroom, parked car, an unused room.' },
      { type: 'action',  text: 'Remove unnecessary stimulation — phone screen off if you can.', tip: 'Even friendly input is still input.' },
      { type: 'reflect', text: 'Do not reply to anything yet.', detail: 'Messages will wait. You are not being rude.' },
      { type: 'action',  text: 'Drink water.', tip: 'Always start here.' },
      { type: 'action',  text: 'Sit or lie down for 10–15 minutes.', tip: 'Static rest. No scrolling.' },
      { type: 'reflect', text: 'Come back to tasks only when you feel ready.', detail: 'Forcing it now leads to a worse crash later.' },
      { type: 'choice',  text: 'Choose what comes next.' },
    ],
    recoveryHint: 'Social events deserve recovery time built in advance — protect the hour after, every time.',
  },

  // ── 9. Meltdown risk ───────────────────────────────────
  {
    k: 'meltdown',
    icon: 'ti-bolt',
    l: 'Meltdown rising',
    sub: 'About to lose control',
    color: 'peach',
    intro: "If you can feel a meltdown rising, you still have a small window. The aim is to reduce input fast — not to suppress feelings.",
    steps: [
      { type: 'action',    text: 'Get away from people if you can.', tip: 'Even briefly. A toilet, a corridor, a car.' },
      { type: 'action',    text: 'Remove sensory input — eyes closed, headphones on, hood up.', tip: 'You do not have to function right now.' },
      { type: 'breathing', text: 'Long exhale × 5', detail: 'Slow out-breaths for as many counts as you can. The longer the exhale, the more your system calms.' },
      { type: 'action',    text: 'Press something firmly — palms together, hands on legs, weighted item.', tip: 'Deep pressure helps regulate.' },
      { type: 'reflect',   text: 'You do not need to communicate right now.', detail: 'Words can come later. Survive this minute first.' },
      { type: 'reflect',   text: 'Let it move through you if it needs to.', detail: 'Suppressing meltdowns extends them. Letting them happen safely shortens them.' },
      { type: 'choice',    text: 'Choose what comes next.' },
    ],
    recoveryHint: 'After a meltdown, give yourself the rest of the day at minimum. Cancel what you can.',
  },

  // ── 10. Anger / frustration ────────────────────────────
  {
    k: 'anger',
    icon: 'ti-flame',
    l: 'Anger or frustration',
    sub: 'Heat building, want to react',
    color: 'amber',
    intro: "Anger is data. Something feels wrong or unfair. The aim is to feel it without acting on it before you've cooled.",
    steps: [
      { type: 'action',    text: 'Delay any reply for 10 minutes.', tip: 'No texts, no emails, no Slack. Set the phone down.' },
      { type: 'breathing', text: 'Slow exhale × 4', detail: 'Out for 6, pause, repeat. Three rounds minimum.' },
      { type: 'action',    text: 'Move your body — pace, stretch, do 10 jumping jacks.', tip: 'Anger needs a physical outlet.' },
      { type: 'reflect',   text: 'What specifically is making me angry?', detail: 'One sentence. Be concrete.' },
      { type: 'reflect',   text: 'Is this about the present, or about something older?', detail: 'Both are valid — just notice which it is.' },
      { type: 'reflect',   text: 'What would I want to say after I cool down?', detail: 'Not the heated version. The version you would be proud of tomorrow.' },
      { type: 'choice',    text: 'Choose what comes next.' },
    ],
    recoveryHint: 'Anger that does not pass after a reset may need to be talked through — with a person you trust, or a professional.',
  },

  // ── 11. Pain / chronic illness ─────────────────────────
  {
    k: 'pain',
    icon: 'ti-bandage',
    l: 'Pain or illness',
    sub: 'Body is asking for less',
    color: 'lavender',
    intro: "Pain and illness reduce capacity — full stop. Today is a smaller-day. The plan must change.",
    steps: [
      { type: 'reflect', text: 'Today is a smaller day. That is allowed.', detail: 'Your capacity is real, not a setting you can change with effort.' },
      { type: 'action',  text: 'Take any medication you need.', tip: 'Pain meds, anti-nausea, whatever you have.' },
      { type: 'action',  text: 'Get comfortable — bed, sofa, blanket, water in reach.', tip: 'Set yourself up like you mean it.' },
      { type: 'reflect', text: 'Pick the 1–3 things that truly must happen today.', detail: 'Drop the rest. Move them to a "later" list.' },
      { type: 'action',  text: 'Tell someone you trust that you are struggling.', tip: 'Not for help — just to be witnessed.' },
      { type: 'reflect', text: 'Recovery counts as a task today.', detail: "Rest is the work today. That's real." },
      { type: 'choice',  text: 'Choose what comes next.' },
    ],
    recoveryHint: 'Chronic pain deserves chronic accommodation — see your doctor if today is part of a longer pattern.',
  },

  // ── 12. I don't know what's wrong ──────────────────────
  {
    k: 'unknown',
    icon: 'ti-question-mark',
    l: "I don't know what's wrong",
    sub: 'Something feels off',
    color: 'sky',
    intro: "Sometimes the brain just says 'no' and won't say why. That is also valid. Let's check the basics first.",
    steps: [
      { type: 'reflect', text: 'When did you last drink water?', detail: 'If more than 2 hours, drink some now.' },
      { type: 'reflect', text: 'When did you last eat?', detail: 'If more than 4 hours, eat something — even small.' },
      { type: 'reflect', text: 'How much sleep did you get?', detail: 'Under 6 hours puts everything in deficit.' },
      { type: 'reflect', text: 'Are you in pain anywhere?', detail: 'Including tension, headaches, eye strain.' },
      { type: 'reflect', text: 'When did you last go outside?', detail: 'Indoor-only days affect mood and energy.' },
      { type: 'reflect', text: 'Are you waiting for news, or holding stress about something specific?', detail: 'Background worry shows up as "I don\'t know what\'s wrong".' },
      { type: 'choice',  text: 'Choose what comes next.' },
    ],
    recoveryHint: "If you can't name what's wrong but it keeps happening, that's worth telling a GP or therapist.",
  },
];

// ─── Picker view ───────────────────────────────────────────
function renderPicker() {
  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="notice purple">
        <strong>Regulation before productivity.</strong><br>
        You do not need to do everything. What kind of hard is this?
      </div>

      <div class="section-label">Sensory</div>
      ${renderResetButtons(['over', 'under'])}

      <div class="section-label">Cognitive</div>
      ${renderResetButtons(['start', 'decision', 'change'])}

      <div class="section-label">Emotional</div>
      ${renderResetButtons(['anxiety', 'anger', 'meltdown'])}

      <div class="section-label">Recovery</div>
      ${renderResetButtons(['shutdown', 'social', 'pain'])}

      <div class="section-label">Not sure</div>
      ${renderResetButtons(['unknown'])}
    </div>`;
}

function renderResetButtons(keys) {
  return keys.map(k => {
    const r = RESETS.find(r => r.k === k);
    if (!r) return '';
    return `
      <button class="btn" style="margin-bottom:6px;padding:14px 16px;
                 background:var(--${r.color}-l);
                 border-color:var(--${r.color}-m)"
        onclick="openReset('${r.k}')">
        <i class="ti ${r.icon}" style="font-size:22px;color:var(--${r.color});flex-shrink:0"></i>
        <div style="flex:1">
          <div style="color:var(--${r.color}-d)">${r.l}</div>
          <div style="font-size:12px;font-weight:400;color:var(--text-muted);margin-top:2px">${r.sub}</div>
        </div>
      </button>`;
  }).join('');
}

// ─── Step-by-step flow ─────────────────────────────────────
function renderFlow() {
  const r = RESETS.find(r => r.k === state.resetMode);
  if (!r) { state.resetView = 'picker'; renderReset(); return; }

  const step    = state.resetStep || 0;
  const current = r.steps[step];
  const isLast  = step === r.steps.length - 1;

  if (current.type === 'choice') {
    renderCompletion();
    return;
  }

  const pct = ((step + 1) / r.steps.length) * 100;

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <!-- Intro card on first step -->
      ${step === 0 ? `
        <div class="notice ${r.color === 'lavender' ? 'purple' : r.color === 'sky' ? 'blue' : r.color === 'teal' ? 'green' : r.color}" style="margin-bottom:14px">
          ${r.intro}
        </div>
      ` : ''}

      <!-- Step card -->
      <div class="card ${r.color}">
        <div class="card-label">${r.l} · Step ${step + 1} of ${r.steps.length - 1}</div>
        ${current.type === 'breathing' ? `
          <div style="text-align:center;padding:1rem 0">
            <i class="ti ti-wind" style="font-size:48px;color:var(--${r.color})"></i>
            <div class="card-main" style="font-size:20px;margin-top:8px">${current.text}</div>
            <div class="card-sub" style="margin-top:8px;font-size:14px">${current.detail}</div>
          </div>
        ` : current.type === 'reflect' ? `
          <div class="card-main" style="font-size:17px">${current.text}</div>
          ${current.detail ? `<div class="card-sub" style="margin-top:8px;font-size:14px;line-height:1.6">${current.detail}</div>` : ''}
        ` : `
          <div class="card-main" style="font-size:17px">${current.text}</div>
          ${current.tip ? `<div class="card-sub" style="margin-top:8px;font-size:13px;font-style:italic">${current.tip}</div>` : ''}
        `}
      </div>

      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>

      ${current.type === 'breathing' ? `
        <button class="btn primary" onclick="startBreathing()">
          <i class="ti ti-player-play"></i> Start guided breathing
        </button>
        <button class="btn" onclick="nextStep()">
          <i class="ti ti-arrow-right"></i> Done — next step
        </button>
      ` : `
        <button class="btn primary" onclick="nextStep()">
          <i class="ti ti-check"></i> ${current.type === 'reflect' ? 'I have considered this' : 'Done'} — next step
        </button>
      `}

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px">
        <button class="btn" style="margin:0" onclick="prevStep()" ${step === 0 ? 'disabled style="opacity:0.4"' : ''}>
          <i class="ti ti-arrow-left"></i> Back
        </button>
        <button class="btn" style="margin:0" onclick="skipStep()">
          <i class="ti ti-skip-forward"></i> Skip
        </button>
      </div>

      <button class="btn" style="margin-top:8px;color:var(--text-muted)" onclick="exitReset()">
        <i class="ti ti-x"></i> Exit reset
      </button>
    </div>`;
}

// ─── Guided breathing animation ────────────────────────────
function renderBreathing() {
  const r = RESETS.find(r => r.k === state.resetMode);
  if (!r) { exitReset(); return; }

  const phase = state.breathPhase || 'breathe-out';
  const round = state.breathRound || 1;
  const max   = 4;

  document.getElementById('content').innerHTML = `
    <div class="screen" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center;padding:2rem 1rem">
      <div style="position:relative;width:200px;height:200px;display:flex;align-items:center;justify-content:center;margin-bottom:24px">
        <div id="breath-circle" style="
          width:${phase === 'breathe-out' ? '180' : '80'}px;
          height:${phase === 'breathe-out' ? '180' : '80'}px;
          border-radius:50%;
          background:var(--${r.color}-l);
          border:3px solid var(--${r.color});
          transition:all 6s ease-in-out;
          display:flex;align-items:center;justify-content:center;
        ">
          <span style="font-size:14px;font-weight:700;color:var(--${r.color}-d)">
            ${phase === 'breathe-out' ? 'breathe out' : 'pause'}
          </span>
        </div>
      </div>

      <div style="font-size:32px;font-weight:700;color:var(--teal-deep);font-variant-numeric:tabular-nums">
        Round ${round} of ${max}
      </div>
      <div style="font-size:14px;color:var(--text-secondary);margin-top:8px;max-width:280px">
        Out for 6 counts. Pause. Repeat.
      </div>

      <button class="btn primary" style="max-width:240px;margin-top:32px" onclick="endBreathing()">
        <i class="ti ti-check"></i> Done with breathing
      </button>
    </div>`;

  // Toggle phase every 6 seconds, advance round every 12s
  if (round <= max) {
    setTimeout(() => {
      if (state.resetView !== 'breathing') return;
      if (phase === 'breathe-out') {
        state.breathPhase = 'pause';
      } else {
        state.breathPhase = 'breathe-out';
        state.breathRound = round + 1;
      }
      if (state.breathRound > max) { endBreathing(); return; }
      renderBreathing();
    }, 6000);
  } else {
    endBreathing();
  }
}

// ─── Completion screen ────────────────────────────────────
function renderCompletion() {
  const r = RESETS.find(r => r.k === state.resetMode);
  if (!r) { state.resetView = 'picker'; renderReset(); return; }

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="notice green" style="text-align:center;padding:1.5rem">
        <i class="ti ti-circle-check" style="font-size:36px;color:var(--teal);display:block;margin-bottom:8px"></i>
        <div style="font-size:18px;font-weight:700;margin-bottom:6px">Reset complete.</div>
        <div>The plan can change. A smaller version still counts.</div>
      </div>

      ${r.recoveryHint ? `
        <div class="notice blue">
          <strong>Hint:</strong> ${r.recoveryHint}
        </div>
      ` : ''}

      <div class="section-label">How do you feel now?</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:14px">
        <button class="mood-btn" onclick="logOutcome('better')">A bit better</button>
        <button class="mood-btn" onclick="logOutcome('same')">About the same</button>
        <button class="mood-btn" onclick="logOutcome('worse')">Worse — need more</button>
        <button class="mood-btn" onclick="logOutcome('done')">Done, moving on</button>
      </div>

      ${state.resetOutcome === 'worse' ? `
        <div class="notice peach">
          <strong>If the reset didn't help:</strong>
          <ul style="margin:8px 0 0 18px;line-height:1.9">
            <li>Try essentials only — drop everything non-urgent</li>
            <li>Reach out to someone you trust</li>
            <li>If this is a recurring crisis, contact Mind, Samaritans (116 123), or Shout (text HOME to 85258)</li>
          </ul>
        </div>
      ` : ''}

      <div class="section-label">What's next?</div>
      <button class="btn primary" onclick="exitToToday()"><i class="ti ti-sun"></i> Back to Today</button>
      <button class="btn lavender" onclick="exitToEssentials()"><i class="ti ti-minimize"></i> Essentials only mode</button>
      <button class="btn sky" onclick="exitToNow()"><i class="ti ti-player-play"></i> Try the next step</button>
      <button class="btn amber-btn" onclick="restartReset()"><i class="ti ti-rotate"></i> Run this reset again</button>
      <button class="btn" onclick="goToPicker()"><i class="ti ti-list"></i> Different reset</button>
    </div>`;
}

// ─── Main render entry ────────────────────────────────────
export function renderReset() {
  setTopbar('Reset', 'Regulation before action.');
  if (!state.resetMode || state.resetView === 'picker') return renderPicker();
  if (state.resetView === 'breathing') return renderBreathing();
  if (state.resetView === 'complete')  return renderCompletion();
  renderFlow();
}

// ─── Window-scoped handlers ───────────────────────────────
window.openReset = (k) => {
  state.resetMode    = k;
  state.resetStep    = 0;
  state.resetView    = 'flow';
  state.resetOutcome = null;
  renderReset();
};

window.nextStep = () => {
  const r = RESETS.find(r => r.k === state.resetMode);
  if (!r) return;
  state.resetStep = Math.min(state.resetStep + 1, r.steps.length - 1);
  if (r.steps[state.resetStep].type === 'choice') {
    state.resetView = 'complete';
  }
  renderReset();
};

window.prevStep = () => {
  state.resetStep = Math.max(state.resetStep - 1, 0);
  renderReset();
};

window.skipStep = () => { window.nextStep(); };

window.startBreathing = () => {
  state.resetView   = 'breathing';
  state.breathPhase = 'breathe-out';
  state.breathRound = 1;
  renderReset();
};

window.endBreathing = () => {
  state.resetView = 'flow';
  delete state.breathPhase;
  delete state.breathRound;
  window.nextStep();
};

window.logOutcome = (o) => {
  state.resetOutcome = o;
  renderCompletion();
};

window.exitReset = () => {
  state.resetMode    = null;
  state.resetView    = 'picker';
  state.resetStep    = 0;
  state.resetOutcome = null;
  renderReset();
};

window.exitToToday = () => { window.exitReset(); go('today'); };

window.exitToNow = () => { window.exitReset(); go('now'); };

window.exitToEssentials = () => {
  state.tasks = state.tasks.filter(t =>
    t.meta.includes('Essentials') || t.text.toLowerCase().includes('appointment')
  );
  window.exitReset();
  go('today');
};

window.restartReset = () => {
  state.resetStep    = 0;
  state.resetView    = 'flow';
  state.resetOutcome = null;
  renderReset();
};

window.goToPicker = () => {
  state.resetMode    = null;
  state.resetView    = 'picker';
  state.resetStep    = 0;
  state.resetOutcome = null;
  renderReset();
};

register('reset', renderReset);
