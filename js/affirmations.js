/* ============================================================
   MY LITTLE WORLD — AFFIRMATION GARDEN LOGIC
   ============================================================ */
(function(){
  const BLOOMS = ['🌸','🌷','🌼','🌺','🌻','🪷','💮','🏵️'];

  const els = {
    input: document.getElementById('newAffirmation'),
    addBtn: document.getElementById('addAffirmationBtn'),
    spotlight: document.getElementById('spotlightText'),
    giveMeBtn: document.getElementById('giveMeOneBtn'),
    garden: document.getElementById('gardenGrid'),
    empty: document.getElementById('gardenEmpty'),
    modalBackdrop: document.getElementById('flowerModalBackdrop'),
    modalText: document.getElementById('flowerModalText'),
    closeModal: document.getElementById('closeFlowerModal'),
    favBtn: document.getElementById('favoriteFlowerBtn'),
    editBtn: document.getElementById('editFlowerBtn'),
    deleteBtn: document.getElementById('deleteFlowerBtn')
  };

  let openId = null;

  function getAll(){ return World.get(World.KEYS.affirmations, []); }
  function saveAll(list){ World.set(World.KEYS.affirmations, list); }

  els.addBtn.addEventListener('click', () => {
    const text = els.input.value.trim();
    if(!text) return;
    const list = getAll();
    list.push({ id: World.uid('aff'), text, favorite:false, bloom: BLOOMS[list.length % BLOOMS.length], createdAt: new Date().toISOString() });
    saveAll(list);
    els.input.value = '';
    render();
    toast('planted a new affirmation 🌱');
  });
  els.input.addEventListener('keydown', (e) => { if(e.key === 'Enter') els.addBtn.click(); });

  function showSpotlight(){
    const list = getAll().map(a => a.text).concat(DEFAULT_AFFIRMATIONS);
    els.spotlight.textContent = '“' + pickRandom(list) + '”';
  }
  els.giveMeBtn.addEventListener('click', () => { showSpotlight(); sparkleAt(els.giveMeBtn); });

  function render(){
    const list = getAll();
    els.garden.innerHTML = '';
    els.empty.style.display = list.length ? 'none' : 'block';
    list.forEach(a => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'flower-btn' + (a.favorite ? ' favorite' : '');
      btn.innerHTML = `<span class="bloom">${a.bloom || '🌸'}</span><span class="stem-label">${escapeHTML(a.text.slice(0,28))}${a.text.length>28?'…':''}</span>`;
      btn.addEventListener('click', () => openFlower(a.id));
      els.garden.appendChild(btn);
    });
  }

  function openFlower(id){
    const a = getAll().find(x => x.id === id);
    if(!a) return;
    openId = id;
    els.modalText.textContent = '“' + a.text + '”';
    els.favBtn.textContent = a.favorite ? '★ favorited' : '☆ favorite';
    els.modalBackdrop.classList.remove('hidden');
  }
  function closeFlower(){ els.modalBackdrop.classList.add('hidden'); openId = null; }

  els.closeModal.addEventListener('click', closeFlower);
  els.modalBackdrop.addEventListener('click', (e) => { if(e.target === els.modalBackdrop) closeFlower(); });

  els.favBtn.addEventListener('click', () => {
    const list = getAll();
    const a = list.find(x => x.id === openId);
    if(!a) return;
    a.favorite = !a.favorite;
    saveAll(list);
    els.favBtn.textContent = a.favorite ? '★ favorited' : '☆ favorite';
    render();
  });

  els.editBtn.addEventListener('click', () => {
    const list = getAll();
    const a = list.find(x => x.id === openId);
    if(!a) return;
    const updated = prompt('Edit your affirmation:', a.text);
    if(updated && updated.trim()){
      a.text = updated.trim();
      saveAll(list);
      els.modalText.textContent = '“' + a.text + '”';
      render();
      toast('affirmation updated ♡');
    }
  });

  els.deleteBtn.addEventListener('click', () => {
    if(!confirm('Remove this affirmation from your garden?')) return;
    saveAll(getAll().filter(x => x.id !== openId));
    closeFlower();
    render();
    toast('removed from your garden');
  });

  document.addEventListener('DOMContentLoaded', () => { showSpotlight(); render(); });
})();
