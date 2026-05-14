import { state, ACCENT } from '../../data/state.js';
import { register, setTopbar, go } from '../../app/router.js';
import { callClaude, TLDR_PROMPTS } from '../../services/api.js';

// Expose 'go' globally for inline HTML onclick handlers
window.go = go;

// Init local state
if (!state.tldrInput)        state.tldrInput = '';
if (!state.tldrOutput)       state.tldrOutput = null;
if (!state.tldrMode)         state.tldrMode = null;
if (!state.tldrLoading)      state.tldrLoading = false;
if (!state.tldrHistory)      state.tldrHistory = [];
if (!state.tldrParsedActions) state.tldrParsedActions = [];
if (state.tldrShowHistory === undefined) state.tldrShowHistory = false;

// ─── Shared Palette ────────────────────────────────────────
const PALETTE = {
  lavender: { bg: '#f5f3ff', border: '#ddd6fe', text: '#4c1d95', sub: '#6d28d9', icon: '#8b5cf6', badgeBg: '#ede9fe' },
  teal:     { bg: '#ecfdf5', border: '#a7f3d0', text: '#047857', sub: '#059669', icon: '#10b981', badgeBg: '#d1fae5' },
  sky:      { bg: '#f0f9ff', border: '#bae6fd', text: '#0369a1', sub: '#0284c7', icon: '#0ea5e9', badgeBg: '#e0f2fe' },
  amber:    { bg: '#fffbeb', border: '#fde68a', text: '#b45309', sub: '#d97706', icon: '#f59e0b', badgeBg: '#fef3c7' },
  peach:    { bg: '#fef2f2', border: '#fecaca', text: '#9f1239', sub: '#be123c', icon: '#f43f5e', badgeBg: '#ffe4e6' },
  default:  { bg: '#f8fafc', border: '#e2e8f0', text: '#1e293b', sub: '#64748b', icon: '#94a3b8', badgeBg: '#f1f5f9' }
};

const MODE_LABELS = {
  full:    { l: 'Summarize',    icon: 'ti-sparkles',     sub: 'Main points, details & dates',     color: 'teal' },
  tone:    { l: 'Explain tone', icon: 'ti-mood-neutral', sub: 'Read between the lines',           color: 'lavender' },
  actions: { l: 'Action items', icon: 'ti-checklist',    sub: 'Just the things you need to do',   color: 'sky' },
  reply:   { l: 'Draft reply',  icon: 'ti-send',         sub: 'A short, calm response template',  color: 'amber' },
};

function renderSectionHeader(title) {
  return `
    <div style="display: flex; align-items: center; gap: 12px; margin: 24px 0 16px;">
      <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.2px; white-space: nowrap;">${title}</div>
      <div style="flex: 1; height: 1.5px; background: #e2e8f0;"></div>
    </div>
  `;
}

// ─── Main render ──────────────────────────────────────────
export function renderTldr() {
  setTopbar('TL;DR Assist', 'Paste a message. Get what matters.');

  document.getElementById('content').innerHTML = `
    <div class="screen" style="max-width: 600px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif;">

      <div style="background: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <div style="font-size: 14px; color: #0369a1; line-height: 1.5;">
          Paste an email, letter, message, or instruction below. Bowline pulls out what matters.
        </div>
      </div>

      <!-- Input Area -->
      <div style="margin-bottom: 24px;">
        <textarea id="tldr-input"
          placeholder="Paste the message here..."
          style="width: 100%; min-height: 160px; padding: 16px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-family: inherit; font-size: 15px; color: #334155; resize: vertical; box-sizing: border-box; outline: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);"
          oninput="tldrUpdateInput(this.value)">${state.tldrInput}</textarea>

        ${state.tldrInput ? `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding: 0 4px;">
            <span style="font-size: 12px; font-weight: 600; color: #94a3b8;">${state.tldrInput.length} characters</span>
            <button onclick="tldrClear()" style="border: none; background: transparent; color: #f43f5e; font-size: 12px; font-weight: 700; cursor: pointer; text-decoration: underline;">
              Clear text
            </button>
          </div>
        ` : ''}
      </div>

      <!-- Mode buttons -->
      ${renderSectionHeader('WHAT DO YOU WANT?')}
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px;">
        ${Object.entries(MODE_LABELS).map(([k, m]) => {
          const pal = PALETTE[m.color];
          return `
            <button onclick="tldrRun('${k}')" 
                    class="action-btn"
                    style="background: #fff; border: 1.5px solid #e2e8f0; border-left: 6px solid ${pal.icon}; border-radius: 12px; padding: 16px 12px; text-align: left; cursor: pointer; transition: all 0.2s;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <i class="ti ${m.icon}" style="font-size: 20px; color: ${pal.text};"></i>
                <div style="font-size: 15px; font-weight: 800; color: #1e293b;">${m.l}</div>
              </div>
              <div style="font-size: 12px; color: #64748b; line-height: 1.4; font-weight: 500;">${m.sub}</div>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Loading state -->
      ${state.tldrLoading ? `
        <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <div class="spinner" style="margin: 0 auto 12px;"></div>
          <div style="font-size: 14px; font-weight: 600; color: #64748b;">
            ${getLoadingMessage(state.tldrMode)}
          </div>
        </div>
      ` : ''}

      <!-- Output -->
      ${state.tldrOutput && !state.tldrLoading ? renderOutput() : ''}

      <!-- History -->
      ${state.tldrHistory.length > 0 ? renderHistory() : ''}

      <!-- Privacy Notice -->
      <div style="background: #ecfdf5; border: 1.5px solid #a7f3d0; border-radius: 12px; padding: 16px; margin-top: 32px; margin-bottom: 24px;">
        <div style="font-size: 13px; color: #065f46; line-height: 1.5;">
          <strong>Privacy:</strong> The message is sent to an AI service to be analysed. It is not stored or used to train models.
        </div>
      </div>

    </div>
    
    <style>
      .action-btn:hover { background: #f8fafc !important; border-color: #cbd5e1 !important; }
    </style>
  `;
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
  const pal = PALETTE[mode.color] || PALETTE.teal;

  return `
    ${renderSectionHeader('RESULT')}

    <div style="background: ${pal.bg}; border: 1.5px solid ${pal.border}; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
        <i class="ti ${mode.icon}" style="font-size: 20px; color: ${pal.text};"></i>
        <div style="font-size: 14px; font-weight: 800; color: ${pal.text}; text-transform: uppercase; letter-spacing: 1px;">${mode.l}</div>
      </div>
      
      <div style="font-size: 15px; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${state.tldrOutput}</div>
    </div>

    <!-- Detected actions, if any -->
    ${state.tldrParsedActions.length > 0 ? `
      ${renderSectionHeader('DETECTED ACTIONS', 'ti-plus')}
      
      <div style="background: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 12px; padding: 12px 16px; margin-bottom: 16px;">
        <div style="font-size: 13px; color: #0369a1;">Tap any action to add it to your Today list.</div>
      </div>
      
      <div style="background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
        ${state.tldrParsedActions.map((a, i) => `
          <div style="padding: 16px; display: flex; align-items: flex-start; gap: 16px; border-bottom: ${i < state.tldrParsedActions.length - 1 ? '1.5px solid #e2e8f0' : 'none'};">
            <button onclick="tldrAddAction(${i})"
              style="width: 28px; height: 28px; border: none; background: #ecfdf5; color: #10b981; border-radius: 50%; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
              aria-label="Add to Today">
              <i class="ti ti-plus" style="font-size: 16px;"></i>
            </button>
            <div style="font-size: 14px; font-weight: 500; color: #334155; line-height: 1.5; padding-top: 4px;">${a}</div>
          </div>
        `).join('')}
      </div>
    ` : ''}

    <!-- Output actions -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
      <button onclick="tldrCopy(this)" style="padding: 14px; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 14px; font-weight: 700; color: #475569; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s;">
        <i class="ti ti-copy" style="font-size: 18px;"></i> Copy Result
      </button>
      <button onclick="tldrSaveAll()" style="padding: 14px; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 14px; font-weight: 700; color: #475569; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s;">
        <i class="ti ti-calendar-plus" style="font-size: 18px; color: #0ea5e9;"></i> Save All to Today
      </button>
    </div>

    <button onclick="tldrClearOutput()" style="width: 100%; padding: 14px; background: transparent; border: 1.5px dashed #cbd5e1; border-radius: 12px; font-size: 14px; font-weight: 600; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
      <i class="ti ti-x"></i> Clear Result
    </button>
  `;
}

// ─── History view ────────────────────────────────────────
function renderHistory() {
  return `
    <div style="display: flex; align-items: center; justify-content: space-between; margin: 32px 0 16px; cursor: pointer;" onclick="tldrToggleHistory()">
      <div style="display: flex; align-items: center; gap: 12px;">
        <i class="ti ti-history" style="color: #8b5cf6; font-size: 18px;"></i>
        <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.2px;">PREVIOUS (${state.tldrHistory.length})</div>
      </div>
      <i class="ti ${state.tldrShowHistory ? 'ti-chevron-up' : 'ti-chevron-down'}" style="color: #94a3b8; font-size: 18px;"></i>
    </div>
    
    ${state.tldrShowHistory ? `
      <div style="background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        ${state.tldrHistory.slice().reverse().map((h, idx) => {
          const modeInfo = MODE_LABELS[h.mode] || MODE_LABELS.full;
          const pal = PALETTE[modeInfo.color] || PALETTE.teal;
          return `
            <div style="padding: 16px; display: flex; align-items: center; gap: 16px; border-bottom: 1.5px solid #e2e8f0;">
              <div style="width: 36px; height: 36px; border-radius: 8px; background: ${pal.bg}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i class="ti ${modeInfo.icon}" style="font-size: 18px; color: ${pal.text};"></i>
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${(h.input || '').slice(0, 60)}${(h.input || '').length > 60 ? '...' : ''}
                </div>
                <div style="font-size: 12px; color: #64748b; font-weight: 500;">
                  ${modeInfo.l} · ${h.time}
                </div>
              </div>
              <button onclick="tldrRestore(${state.tldrHistory.length - 1 - idx})"
                style="border: none; background: transparent; color: #0ea5e9; cursor: pointer; padding: 8px; flex-shrink: 0;"
                aria-label="Restore">
                <i class="ti ti-rotate-clockwise" style="font-size: 20px;"></i>
              </button>
            </div>
          `;
        }).join('')}
        
        <div style="padding: 12px; background: #f8fafc; text-align: center;">
          <button onclick="tldrClearHistory()"
            style="border: none; background: transparent; color: #f43f5e; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; text-decoration: underline;">
            Clear all history
          </button>
        </div>
      </div>
    ` : ''}
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

window.tldrCopy = function (btn) {
  if (!state.tldrOutput) return;
  navigator.clipboard.writeText(state.tldrOutput).catch(() => {});
  
  if (btn) {
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="ti ti-check" style="font-size: 18px; color: #10b981;"></i> Copied';
    btn.style.borderColor = '#10b981';
    btn.style.color = '#059669';
    btn.style.background = '#ecfdf5';
    
    setTimeout(() => { 
      btn.innerHTML = originalHTML; 
      btn.style.borderColor = '';
      btn.style.color = '';
      btn.style.background = '';
    }, 1500);
  } else {
    alert('Copied to clipboard.');
  }
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
