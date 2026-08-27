/* ============================================================
   MY LITTLE WORLD — MONTHLY RESET LOGIC
   ============================================================ */
(function(){
  const QUESTIONS = [
    { key:'happened', q:'What happened this month?' },
    { key:'happy', q:'What made me happy?' },
    { key:'challenged', q:'What challenged me?' },
    { key:'learned', q:'What did I learn?' },
    { key:'proud', q:'What am I proud of?' },
    { key:'leaving', q:'What am I leaving behind?' },
    { key:'taking', q:'What am I taking with me?' },
    { key:'nextMonth', q:'What do I want next month to feel like?' }
  ];

  const monthInput = document.getElementById('resetMonth');
  const loadBtn = document.getElementById('loadMonthBtn');
  const form = document.getElementById('resetForm');
  const questionsWrap = document.getElementById('resetQuestions');
  const saveBtn = document.getElementById('saveResetBtn');
  const archive = document.getElementById('resetArchive');
  const emptyState = document.getElementById('resetEmpty');

  function getAll(){ return World.get(World.KEYS.monthlyReset, {}); } // keyed by "YYYY-MM"
  function saveAll(obj){ World.set(World.KEYS.monthlyReset, obj); }

  function renderForm(monthKey){
    const all = getAll();
    const data = all[monthKey] || {};
    questionsWrap.innerHTML = QUESTIONS.map(item => `
      <label for="q-${item.key}">${item.q}</label>
      <textarea id="q-${item.key}" data-key="${item.key}" style="min-height:70px;">${escapeHTML(data[item.key] || '')}</textarea>
    `).join('');
    form.style.display = 'block';
  }

  loadBtn.addEventListener('click', () => {
    if(!monthInput.value){ toast('pick a month first ♡'); return; }
    renderForm(monthInput.value);
  });

  saveBtn.addEventListener('click', () => {
    if(!monthInput.value){ toast('pick a month first ♡'); return; }
    const all = getAll();
    const data = { month: monthInput.value };
    questionsWrap.querySelectorAll('textarea').forEach(t => { data[t.dataset.key] = t.value.trim(); });
    all[monthInput.value] = data;
    saveAll(all);
    toast('this month is saved ♡');
    renderArchive();
  });

  function renderArchive(){
    const all = getAll();
    const months = Object.keys(all).sort().reverse();
    archive.innerHTML = '';
    emptyState.style.display = months.length ? 'none' : 'block';
    months.forEach(m => {
      const data = all[m];
      const card = document.createElement('div');
      card.className = 'paper-card';
      const label = new Date(m + '-01').toLocaleDateString(undefined, { year:'numeric', month:'long' });
      const firstAnswer = QUESTIONS.map(q => data[q.key]).find(Boolean) || '';
      card.innerHTML = `
        <h3>${label}</h3>
        <p class="entry-snippet">${escapeHTML(firstAnswer.slice(0,120))}</p>
        <div class="quick-actions">
          <button class="btn btn-sm btn-outline" data-act="edit">view / edit</button>
          <button class="btn btn-sm btn-danger" data-act="delete">delete</button>
        </div>
      `;
      card.querySelector('[data-act="edit"]').addEventListener('click', () => {
        monthInput.value = m;
        renderForm(m);
        window.scrollTo({ top: 0, behavior:'smooth' });
      });
      card.querySelector('[data-act="delete"]').addEventListener('click', () => {
        if(confirm('Delete this monthly reset?')){
          const all2 = getAll();
          delete all2[m];
          saveAll(all2);
          renderArchive();
        }
      });
      archive.appendChild(card);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    monthInput.value = now.toISOString().slice(0,7);
    renderArchive();
  });
})();
