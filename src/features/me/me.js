import { setTopbar } from '../../app/router.js';

const SCRIPTS = [
  { l: 'Ask for clarity', t: 'Thanks for the message. Could you clarify what you need from me and by when?' },
  { l: 'Running late', t: "I'm running late. I'm still coming, but I need more time. I'll update you when I know my arrival time." },
  { l: 'Need more time', t: "I've seen this. I need time to process before I reply properly." },
  { l: 'Overwhelmed', t: "I'm overwhelmed and need a quieter moment before I can respond. I'm not ignoring you." },
  { l: 'Set boundary', t: "I'm not available for this today. I can look at it on [date]." },
  { l: 'Say no', t: "Thanks for asking. I'm not able to do this." },
];

const SENSORY_TOOLS = ['Headphones', 'Sunglasses', 'Weighted blanket', 'Fidget', 'Hoodie', 'Quiet room', 'Familiar music', 'Movement'];
const ESSENTIALS = ['Water', 'Food', 'Medication', 'Hygiene minimum', 'Sleep', 'Key responsibility'];

export function renderMe() {
  setTopbar('Me', 'Your support profile.');
  document.getElementById('content').innerHTML = `
    <div class="screen">
      <div class="section-label">Communication scripts</div>
      <div class="card" style="padding:0.5rem 1.25rem">
        ${SCRIPTS.map(s => `
          <div class="task-row">
            <div style="flex:1">
              <div class="task-text" style="font-size:14px;font-weight:500">${s.l}</div>
              <div class="task-meta" style="margin-top:2px;line-height:1.4">${s.t}</div>
            </div>
            <button onclick="copyScript('${s.t.replace(/'/g, "\\'")}',this)"
              style="border:none;background:none;cursor:pointer;color:#1D9E75;font-size:13px;flex-shrink:0"
              aria-label="Copy script">
              <i class="ti ti-copy"></i>
            </button>
          </div>
        `).join('')}
      </div>

      <div class="section-label">My sensory tools</div>
      <div class="chip-grid">
        ${SENSORY_TOOLS.map(s => `<span class="chip sel">${s}</span>`).join('')}
      </div>

      <div class="section-label">My essentials</div>
      <div class="card" style="padding:0.5rem 1.25rem">
        ${ESSENTIALS.map(e => `
          <div class="task-row">
            <div class="task-check" onclick="
              this.classList.toggle('done');
              this.innerHTML = this.classList.contains('done')
                ? '<i class=\\'ti ti-check\\' style=\\'font-size:12px\\'></i>' : '';
            "></div>
            <div class="task-text">${e}</div>
          </div>
        `).join('')}
      </div>

      <div class="section-label">Preferences</div>
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div style="font-size:14px">Reminders</div>
          <select style="font-size:13px;padding:4px 8px;border:0.5px solid var(--color-border-secondary);border-radius:var(--border-radius-md);background:var(--color-background-primary);color:var(--color-text-primary)">
            <option>Gentle</option><option>Firm</option><option>Silent</option><option>Persistent</option>
          </select>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div style="font-size:14px">Low-stimulation mode</div>
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
            <input type="checkbox" id="lowstim">
            <span id="lowstim-label" style="font-size:13px;color:var(--color-text-secondary)">Off</span>
          </label>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="font-size:14px">TL;DR output style</div>
          <select style="font-size:13px;padding:4px 8px;border:0.5px solid var(--color-border-secondary);border-radius:var(--border-radius-md);background:var(--color-background-primary);color:var(--color-text-primary)">
            <option>Three bullets</option><option>One sentence</option><option>Detailed</option>
          </select>
        </div>
      </div>

      <div class="notice" style="margin-top:0.75rem">A reduced day is still a valid day.</div>
    </div>`;

  document.getElementById('lowstim')?.addEventListener('change', function () {
    document.getElementById('lowstim-label').textContent = this.checked ? 'On' : 'Off';
  });
}

window.copyScript = (text, btn) => {
  navigator.clipboard.writeText(text).catch(() => {});
  btn.innerHTML = '<i class="ti ti-check" style="color:#1D9E75"></i>';
  setTimeout(() => btn.innerHTML = '<i class="ti ti-copy"></i>', 1500);
};
