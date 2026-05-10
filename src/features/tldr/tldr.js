import { state } from '../../data/state.js';
import { register, setTopbar } from '../../app/router.js';
import { callClaude, TLDR_PROMPTS } from '../../services/api.js';

export function renderTldr() {
  setTopbar('TL;DR Assist', 'Paste a message. Get what matters.');
  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="notice blue">
        Paste an email, message, letter, or instruction. Anchor pulls out what matters.
      </div>
      <textarea id="tldr-in" placeholder="Paste the message here…" style="min-height:140px">${state.tldrInput}</textarea>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
        <button class="btn primary"   style="margin:0;justify-content:center" onclick="doTldr('full')">
          <i class="ti ti-sparkles"></i> Summarize
        </button>
        <button class="btn lavender"  style="margin:0;justify-content:center" onclick="doTldr('tone')">
          <i class="ti ti-mood-neutral"></i> Explain tone
        </button>
        <button class="btn sky"       style="margin:0;justify-content:center" onclick="doTldr('actions')">
          <i class="ti ti-checklist"></i> Action items
        </button>
        <button class="btn amber-btn" style="margin:0;justify-content:center" onclick="doTldr('reply')">
          <i class="ti ti-send"></i> Make reply
        </button>
      </div>

      ${state.tldrLoading ? `
        <div style="display:flex;align-items:center;gap:10px;margin-top:14px">
          <div class="spinner"></div>
          <span style="font-size:14px;color:var(--text-secondary)">Reading this for you…</span>
        </div>` : ''}

      ${state.tldrOutput ? `
        <div class="ai-out">${state.tldrOutput}</div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="btn" style="flex:1;justify-content:center" onclick="addTldrToday()">
            <i class="ti ti-calendar-plus"></i> Save to Today
          </button>
          <button class="btn" style="flex:1;justify-content:center;color:var(--text-muted)" onclick="clearTldr()">
            <i class="ti ti-trash"></i> Clear
          </button>
        </div>` : ''}
    </div>`;

  const ta = document.getElementById('tldr-in');
  if (ta) ta.addEventListener('input', () => state.tldrInput = ta.value);
}

window.doTldr = async (mode) => {
  const v = document.getElementById('tldr-in')?.value?.trim() || state.tldrInput;
  if (!v) { alert('Please paste a message first.'); return; }
  state.tldrInput  = v;
  state.tldrLoading = true;
  state.tldrOutput  = null;
  renderTldr();
  try {
    state.tldrOutput = await callClaude(TLDR_PROMPTS[mode](v));
  } catch (e) {
    state.tldrOutput = 'Something went wrong. Please try again.';
  }
  state.tldrLoading = false;
  renderTldr();
};

window.addTldrToday = () => {
  state.tasks.push({
    id:   Date.now(),
    text: 'Follow up on message (from TL;DR)',
    meta: 'Added from TL;DR',
    color:'sky',
    done: false,
  });
  alert('Added to Today.');
};

window.clearTldr = () => {
  state.tldrInput  = '';
  state.tldrOutput = null;
  renderTldr();
};

register('tldr', renderTldr);};
