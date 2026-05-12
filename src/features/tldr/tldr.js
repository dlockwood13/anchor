import { state, ACCENT } from '../../data/state.js';
import { register, setTopbar, go } from '../../app/router.js';
import { callClaude, TLDR_PROMPTS } from '../../services/api.js';

// Init local state
if (!state.tldrInput)        state.tldrInput = '';
if (!state.tldrOutput)       state.tldrOutput = null;
if (!state.tldrMode)         state.tldrMode = null;
if (!state.tldrLoading)      state.tldrLoading = false;
if (!state.tldrHistory)      state.tldrHistory = [];
if (!state.tldrParsedActions) state.tldrParsedActions = [];
if (state.tldrShowHistory === undefined) state.tldrShowHistory = false;

const MODE_LABELS = {
  full:    { l: 'Summarize',     icon: 'ti-sparkles',      sub: 'Main point, details, actions, dates, tone' },
  tone:    { l: 'Explain tone',  icon: 'ti-mood-neutral',  sub: 'What is clear, what is not, what not to assume' },
  actions: { l: 'Action items',  icon: 'ti-checklist',     sub: 'Just the things you need to do' },
  reply:   { l: 'Draft reply',   icon: 'ti-send',          sub: 'A short, calm response' },
};

// ─── Main render ──────────────────────────────────────────
export function renderTldr() {
  setTopbar('TL;DR Assist', 'Paste a message. Get what matters.');

  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="notice blue">
        Paste an email, letter, message, or instruction below. Bowline pulls out what matters.
      </div>

      <textarea id="tldr-input"
        placeholder="Paste the message here..."
        style="min-height:140px"
        oninput="tldrUpdateInput(this.value)">${state.tldrInput}</textarea>

      ${state.tldrInput ? `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;padding:0 2px">
          <span style="font-size:12px;color:var(--text-muted)">${state.tldrInput.length} characters</span>
          <button onclick="tldrClear()" style="border:none;background:none;color:var(--text-muted);font-size:12px;cursor:pointer;font-family:var(--font);text-decoration:underline">
            Clear
          </button>
        </div>
      ` : ''}

      <!-- Mode buttons -->
      <div class="section-label" style="margin-top:1.25rem">What do you want?</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <button class="btn primary" style="margin:0;justify-content:center;padding:12px"
                onclick="tldrRun('full')">
          <i class="ti ti-sparkles"></i> Summarize
        </button>
        <button class="btn lavender" style="margin:0;justify-content:center;padding:12px"
                onclick="tldrRun('tone')">
          <i class="ti ti-mood-neutral"></i> Explain tone
        </button>
        <button class="btn sky" style="margin:0;justify-content:center;padding:12px"
                onclick="tldrRun('actions')">
          <i class="ti ti-checklist"></i> Action items
        </button>
        <button class="btn amber-btn" style="margin:0;justify-content:center;padding:12px"
                onclick="tldrRun('reply')">
          <i class="ti ti-send"></i> Draft reply
        </button>
      </div>

      <!-- Loading state -->
      ${state.tldrLoading ? `
        <div class="card" style="margin-top:14px">
          <div style="display:flex;align-items:center;gap:12px;padding:8px 0">
            <div class="spinner"></div>
            <span style="font-size:14px;color:var(--text-secondary)">
              ${getLoadingMessage(state.tldrMode)}
            </span>
          </div>
        </div>
      ` : ''}

      <!-- Output -->
      ${state.tldrOutput ? renderOutput() : ''}

      <!-- History -->
      ${state.tldrHistory.length > 0 ? renderHistory() : ''}

      <!-- How it works -->
      ${!state.tldrInput && !state.tldrOutput ? renderHowItWorks() : ''}

    </div>`;
}

function getLoadingMessage(mode) {
  const m = {
    full:    'Reading the message...',
    tone:    'Looking at the tone...',
    actions: 'Finding what needs doing...',
    reply:   'Drafting a calm response...',
  };
  return m[mode] || 'Working on it...';
}

// ─── Output card with extracted actions ──────────────────
function renderOutput() {
  const mode = MODE_LABELS[state.tldrMode] || MODE_LABELS.full;

  return `
    <div class="section-label" style="margin-top:1.5rem">
      <i class="ti ${mode.icon}" style="color:var(--teal);font-size:14px"></i> ${mode.l}
    </div>

    <div class="card teal">
      <div class="ai-out" style="margin:0;background:transparent;border:none;padding:0">${state.tldrOutput}</div>
    </div>

    <!-- Detected actions, if any -->
    ${state.tldrParsedActions.length > 0 ? `
      <div class="section-label">
        <i class="ti ti-plus" style="color:var(--lavender);font-size:14px"></i> Add to Today?
      </div>
      <div class="notice blue" style="margin-bottom:0.85rem">
        Tap any action to add it to your tasks.
      </div>
      <div class="card" style="padding:0.5rem 1.25rem">
        ${state.tldrParsedActions.map((a, i) => `
          <div class="task-row">
            <button onclick="tldrAddAction(${i})"
              style="border:none;background:var(--teal-l);color:var(--teal-d);width:26px;height:26px;border-radius:50%;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;margin-top:1px"
              aria-label="Add to Today">
              <i class="ti ti-plus" style="font-size:14px"></i>
            </button>
            <div class="task-text" style="font-size:14px;font-weight:400;line-height:1.5">${a}</div>
          </div>
        `).join('')}
      </div>
    ` : ''}

    <!-- Output actions -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">
      <button class="btn" style="margin:0;justify-content:center" onclick="tldrCopy()">
        <i class="ti ti-copy"></i> Copy
      </button>
      <button class="btn" style="margin:0;justify-content:center" onclick="tldrSaveAll()">
        <i class="ti ti-calendar-plus"></i> Save all to Today
      </button>
    </div>

    <button class="btn" style="margin-top:4px;color:var(--text-muted)" onclick="tldrClearOutput()">
      <i class="ti ti-x"></i> Clear result
    </button>
  `;
}

// ─── History view ────────────────────────────────────────
function renderHistory() {
  return `
    <div class="section-label" style="margin-top:1.5rem;cursor:pointer" onclick="tldrToggleHistory()">
      <i class="ti ti-history" style="color:var(--text-muted);font-size:14px"></i>
      Previous (${state.tldrHistory.length})
      <i class="ti ${state.tldrShowHistory ? 'ti-chevron-up' : 'ti-chevron-down'}" style="margin-left:auto;font-size:14px"></i>
    </div>
    ${state.tldrShowHistory ? `
      <div class="card" style="padding:0.5rem 1.25rem">
        ${state.tldrHistory.slice().reverse().map((h, idx) => `
          <div class="task-row">
            <i class="ti ${MODE_LABELS[h.mode]?.icon || 'ti-message-2'}" style="color:var(--teal);font-size:18px;margin-top:2px;flex-shrink:0"></i>
            <div style="flex:1">
              <div class="task-text" style="font-size:13px">${(h.input || '').slice(0, 60)}${(h.input || '').length > 60 ? '...' : ''}</div>
              <div class="task-meta">${MODE_LABELS[h.mode]?.l || 'Result'} · ${h.time}</div>
            </div>
            <button onclick="tldrRestore(${state.tldrHistory.length - 1 - idx})"
              style="border:none;background:none;color:var(--teal);cursor:pointer;padding:4px"
              aria-label="Restore">
              <i class="ti ti-rotate-clockwise" style="font-size:16px"></i>
            </button>
          </div>
        `).join('')}
        <div class="task-row">
          <button onclick="tldrClearHistory()"
            style="border:none;background:none;color:var(--text-muted);cursor:pointer;font-family:var(--font);font-size:13px;text-decoration:underline">
            Clear history
          </button>
        </div>
      </div>
    ` : ''}
  `;
}

// ─── How it works (shown when empty) ─────────────────────
function renderHowItWorks() {
  return `
    <div class="section-label" style="margin-top:1.5rem">How TL;DR helps</div>
    <div class="card lavender">
      <div style="display:flex;gap:10px;margin-bottom:14px">
        <i class="ti ti-sparkles" style="font-size:22px;color:var(--lavender);flex-shrink:0;margin-top:2px"></i>
        <div>
          <div class="card-main" style="font-size:14px;margin-bottom:4px">Summarize</div>
          <div class="card-sub" style="line-height:1.5">Pulls out the main point, key details, what you need to do, dates, and tone — in a clean format.</div>
        </div>
      </div>
      <div style="display:flex;gap:10px;margin-bottom:14px">
        <i class="ti ti-mood-neutral" style="font-size:22px;color:var(--lavender);flex-shrink:0;margin-top:2px"></i>
        <div>
          <div class="card-main" style="font-size:14px;margin-bottom:4px">Explain tone</div>
          <div class="card-sub" style="line-height:1.5">Tells you what tone is clear, what is not clear, and what you should not assume. Helpful when you cannot tell if someone is angry.</div>
        </div>
      </div>
      <div style="display:flex;gap:10px;margin-bottom:14px">
        <i class="ti ti-checklist" style="font-size:22px;color:var(--lavender);flex-shrink:0;margin-top:2px"></i>
        <div>
          <div class="card-main" style="font-size:14px;margin-bottom:4px">Action items</div>
          <div class="card-sub" style="line-height:1.5">Just the things you need to do, as a numbered list. Each one can be added to your Today list with one tap.</div>
        </div>
      </div>
      <div style="display:flex;gap:10px">
        <i class="ti ti-send" style="font-size:22px;color:var(--lavender);flex-shrink:0;margin-top:2px"></i>
        <div>
          <div class="card-main" style="font-size:14px;margin-bottom:4px">Draft reply</div>
          <div class="card-sub" style="line-height:1.5">Writes a short, calm response. Use it as a starting point and edit to sound like you.</div>
        </div>
      </div>
    </div>

    <div class="notice green">
      <strong>Privacy:</strong> The message is sent to an AI service to be analysed. It is not stored or used to train models.
    </div>
  `;
}

// ─── Action extraction from output ───────────────────────
function parseActions(text) {
  if (!text) return [];
  const lines = text.split(/\n/);
  const actions = [];
  let inActions = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect action sections
    if (/^(WHAT YOU NEED TO DO|YOU NEED TO|ACTION ITEMS)/i.test(trimmed)) {
      inActions = true;
      continue;
    }
    // Stop on next section header
    if (inActions && /^[A-Z][A-Z\s]{3,}$/.test(trimmed)) {
      inActions = false;
      continue;
    }
    // Numbered or bulleted items in action section
    if (inActions) {
      const m = trimmed.match(/^(?:\d+[.)\s]|[-•·*]\s)(.+)/);
      if (m && m[1].length > 4) actions.push(m[1].trim());
    }
  }

  // Also catch numbered lists outside specific section headers (for action-only mode)
  if (actions.length === 0) {
    for (const line of lines) {
      const m = line.trim().match(/^\d+[.)\s]+(.+)/);
      if (m && m[1].length > 4 && !/^[A-Z\s]+:$/.test(m[1])) {
        actions.push(m[1].trim());
      }
    }
  }

  return actions.slice(0, 8); // cap to 8
}

// ─── Window handlers ──────────────────────────────────────
window.tldrUpdateInput = function (val) {
  state.tldrInput = val;
};

window.tldrRun = async function (mode) {
  const input = (document.getElementById('tldr-input')?.value || state.tldrInput || '').trim();

  if (!input) {
    alert('Please paste a message first.');
    return;
  }

  state.tldrInput   = input;
  state.tldrMode    = mode;
  state.tldrOutput  = null;
  state.tldrLoading = true;
  state.tldrParsedActions = [];
  renderTldr();

  try {
    const prompt = TLDR_PROMPTS[mode](input);
    const result = await callClaude(prompt);
    state.tldrOutput = result;
    state.tldrParsedActions = parseActions(result);

    // Save to history
    state.tldrHistory.push({
      input,
      output: result,
      mode,
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    });
    if (state.tldrHistory.length > 20) state.tldrHistory = state.tldrHistory.slice(-20);
  } catch (e) {
    // Graceful fallback when AI is not configured or fails
    state.tldrOutput = getFallbackResponse(mode, input);
    state.tldrParsedActions = parseActions(state.tldrOutput);
  }

  state.tldrLoading = false;
  renderTldr();
};

// ─── Fallback templates (when AI is unavailable) ─────────
function getFallbackResponse(mode, input) {
  const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 5);
  const firstSentence = sentences[0] ? sentences[0].trim() : 'The message';
  const dateMatch = input.match(/\b(?:on |by |before )?(\w+day|\d{1,2}(?:st|nd|rd|th)?(?: of)? \w+|\d{1,2}\/\d{1,2}|next \w+|tomorrow|today|tonight)\b/i);
  const timeMatch = input.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM))\b/);
  const questionMatch = /\?/.test(input);

  if (mode === 'full') {
    return [
      'AI is not available right now. Here is a basic breakdown:',
      '',
      'MAIN POINT',
      firstSentence + '.',
      '',
      'KEY DETAILS',
      sentences.slice(1, 4).map(s => '· ' + s.trim()).join('\n') || '· (no further detail extracted)',
      '',
      'WHAT YOU NEED TO DO',
      questionMatch ? '1. Reply to the question they asked' : '1. Read the message in full',
      dateMatch || timeMatch ? '2. Note the date/time mentioned: ' + (dateMatch ? dateMatch[0] : '') + (timeMatch ? ' ' + timeMatch[0] : '') : '2. Decide if any response is needed',
      '',
      'DATES AND DEADLINES',
      (dateMatch || timeMatch) ? (dateMatch ? dateMatch[0] : '') + (timeMatch ? ' ' + timeMatch[0] : '') : 'None mentioned',
      '',
      'TONE',
      'Cannot analyse tone offline. Consider asking someone you trust if it feels ambiguous.',
    ].join('\n');
  }

  if (mode === 'tone') {
    return [
      'AI is not available right now. A few things to consider on your own:',
      '',
      'WHAT IS CLEAR',
      '· The literal content of the message',
      '',
      'WHAT IS NOT CLEAR',
      '· The emotional tone behind the words',
      '· Whether the sender is annoyed, neutral, or friendly',
      '',
      'DO NOT ASSUME',
      '· That punctuation or word choice signals emotion',
      '· That a short reply means anger',
      '',
      'SAFEST REPLY',
      'A short, factual reply that asks for clarification if needed.',
    ].join('\n');
  }

  if (mode === 'actions') {
    return [
      'AI is not available right now. Best-guess actions:',
      '',
      'YOU NEED TO:',
      questionMatch ? '1. Reply to the question they asked' : '1. Read the message in full',
      dateMatch ? '2. Note the date: ' + dateMatch[0] : '2. Decide whether any response is needed',
      timeMatch ? '3. Note the time: ' + timeMatch[0] : '',
    ].filter(Boolean).join('\n');
  }

  if (mode === 'reply') {
    return [
      'AI is not available right now. A basic template:',
      '',
      'Thanks for your message. ',
      questionMatch ? 'Yes, [your answer here]. ' : '',
      'Let me know if you need anything else.',
      '',
      '(Edit this to sound like you before sending.)',
    ].join('\n');
  }

  return 'AI is not available right now. Please try again later.';
}

window.tldrClear = function () {
  state.tldrInput = '';
  state.tldrOutput = null;
  state.tldrParsedActions = [];
  const input = document.getElementById('tldr-input');
  if (input) input.value = '';
  renderTldr();
};

window.tldrClearOutput = function () {
  state.tldrOutput = null;
  state.tldrParsedActions = [];
  renderTldr();
};

window.tldrCopy = function () {
  if (!state.tldrOutput) return;
  navigator.clipboard.writeText(state.tldrOutput).catch(() => {});
  // Brief visual confirmation
  alert('Copied to clipboard.');
};

window.tldrAddAction = function (idx) {
  const action = state.tldrParsedActions[idx];
  if (!action) return;
  state.tasks.push({
    id: Date.now() + idx,
    text: action,
    meta: 'From TL;DR · Medium energy',
    color: 'sky',
    done: false,
  });
  state.tldrParsedActions.splice(idx, 1);
  renderTldr();
};

window.tldrSaveAll = function () {
  if (state.tldrParsedActions.length === 0) {
    // Save the whole result as a single follow-up task
    state.tasks.push({
      id: Date.now(),
      text: 'Follow up on message',
      meta: 'From TL;DR · Medium energy',
      color: 'sky',
      done: false,
    });
    alert('Added a follow-up task to Today.');
  } else {
    state.tldrParsedActions.forEach((a, i) => {
      state.tasks.push({
        id: Date.now() + i,
        text: a,
        meta: 'From TL;DR · Medium energy',
        color: 'sky',
        done: false,
      });
    });
    alert('Added ' + state.tldrParsedActions.length + ' tasks to Today.');
    state.tldrParsedActions = [];
  }
  renderTldr();
};

window.tldrToggleHistory = function () {
  state.tldrShowHistory = !state.tldrShowHistory;
  renderTldr();
};

window.tldrRestore = function (idx) {
  const h = state.tldrHistory[idx];
  if (!h) return;
  state.tldrInput = h.input;
  state.tldrOutput = h.output;
  state.tldrMode = h.mode;
  state.tldrParsedActions = parseActions(h.output);
  state.tldrShowHistory = false;
  renderTldr();
};

window.tldrClearHistory = function () {
  if (confirm('Clear all TL;DR history?')) {
    state.tldrHistory = [];
    renderTldr();
  }
};

register('tldr', renderTldr);
