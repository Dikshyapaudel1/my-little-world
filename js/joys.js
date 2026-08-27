/* ============================================================
   MY LITTLE WORLD — LITTLE JOYS JAR LOGIC
   ============================================================ */
(function(){
  const els = {
    jarVisual: document.getElementById('jarVisual'),
    count: document.getElementById('jarCount'),
    input: document.getElementById('joyInput'),
    addBtn: document.getElementById('addJoyBtn'),
    pickBtn: document.getElementById('pickJoyBtn'),
    list: document.getElementById('joyList'),
    empty: document.getElementById('joyEmpty'),
    modalBackdrop: document.getElementById('joyModalBackdrop'),
    modalText: document.getElementById('joyModalText'),
    closeModal: document.getElementById('closeJoyModal')
  };

  function getJoys(){ return World.get(World.KEYS.joys, []); }
  function saveJoys(list){ World.set(World.KEYS.joys, list); }

  els.addBtn.addEventListener('click', () => {
    const text = els.input.value.trim();
    if(!text) return;
    const list = getJoys();
    list.push({ id: World.uid('joy'), text, date: World.todayISO() });
    saveJoys(list);
    els.input.value = '';
    render();
    toast('dropped into the jar ♡');
  });
  els.input.addEventListener('keydown', (e) => { if(e.key === 'Enter') els.addBtn.click(); });

  els.pickBtn.addEventListener('click', () => {
    const list = getJoys();
    if(!list.length){ toast('the jar is empty right now ♡'); return; }
    const pick = pickRandom(list);
    els.modalText.textContent = '“' + pick.text + '”';
    els.modalBackdrop.classList.remove('hidden');
  });
  els.closeModal.addEventListener('click', () => els.modalBackdrop.classList.add('hidden'));
  els.modalBackdrop.addEventListener('click', (e) => { if(e.target === els.modalBackdrop) els.modalBackdrop.classList.add('hidden'); });

  function paintJar(list){
    els.jarVisual.innerHTML = '';
    list.slice(-14).forEach((joy) => {
      const note = document.createElement('span');
      note.className = 'jar-note';
      note.textContent = joy.text.slice(0,18) + (joy.text.length > 18 ? '…' : '');
      note.style.left = (10 + Math.random()*70) + '%';
      note.style.bottom = (6 + Math.random()*70) + '%';
      note.style.transform = `rotate(${(Math.random()*20-10).toFixed(0)}deg)`;
      els.jarVisual.appendChild(note);
    });
  }

  function render(){
    const list = getJoys();
    els.count.textContent = `${list.length} little joy${list.length === 1 ? '' : 's'} saved`;
    paintJar(list);

    els.list.innerHTML = '';
    els.empty.style.display = list.length ? 'none' : 'block';
    list.slice().reverse().forEach(joy => {
      const card = document.createElement('div');
      card.className = 'paper-card';
      card.innerHTML = `
        <p style="font-family:var(--font-hand);font-size:1.15rem;margin:0 0 .3rem;">${escapeHTML(joy.text)}</p>
        <p style="font-size:.75rem;color:var(--plum-soft);margin:0 0 .5rem;">${World.formatDate(joy.date)}</p>
        <button class="btn btn-sm btn-danger" data-id="${joy.id}">remove</button>
      `;
      card.querySelector('.btn-danger').addEventListener('click', () => {
        saveJoys(getJoys().filter(x => x.id !== joy.id));
        render();
      });
      els.list.appendChild(card);
    });
  }

  document.addEventListener('DOMContentLoaded', render);
})();
