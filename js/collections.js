/* ============================================================
   MY LITTLE WORLD — COLLECTIONS LOGIC
   ============================================================ */
(function(){
  const STARTER_NAMES = [
    'favorite quotes','favorite movies','favorite books','favorite snacks',
    'favorite outfits','favorite places','favorite phrases','current obsessions',
    'things I want to buy'
  ];

  const wrap = document.getElementById('collectionsWrap');
  const newInput = document.getElementById('newCollectionInput');
  const addBtn = document.getElementById('addCollectionBtn');

  function getCollections(){
    let list = World.get(World.KEYS.collections, null);
    if(!list){
      list = STARTER_NAMES.map(name => ({ id: World.uid('col'), name, items: [] }));
      World.set(World.KEYS.collections, list);
    }
    return list;
  }
  function saveCollections(list){ World.set(World.KEYS.collections, list); }

  addBtn.addEventListener('click', () => {
    const name = newInput.value.trim();
    if(!name) return;
    const list = getCollections();
    list.push({ id: World.uid('col'), name, items: [] });
    saveCollections(list);
    newInput.value = '';
    render();
    toast('new shelf created ♡');
  });
  newInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') addBtn.click(); });

  function render(){
    const list = getCollections();
    wrap.innerHTML = '';
    list.forEach(col => {
      const card = document.createElement('div');
      card.className = 'paper-card';
      card.style.marginBottom = '1.2rem';
      card.innerHTML = `
        <div class="section-title-row" style="margin-bottom:.6rem;">
          <h3 style="margin:0;">${escapeHTML(col.name)}</h3>
          <button class="btn btn-sm btn-icon" data-act="delete-col" aria-label="Delete collection">✕</button>
        </div>
        <div class="grid grid-3" data-items></div>
        <div class="quick-actions" style="margin-top:.6rem;">
          <input type="text" data-new-item placeholder="add to this collection…" style="max-width:240px;">
          <button class="btn btn-sm btn-outline" data-act="add-item">add</button>
        </div>
      `;
      const itemsWrap = card.querySelector('[data-items]');
      col.items.forEach(item => {
        const chip = document.createElement('div');
        chip.className = 'mini-card';
        chip.innerHTML = `<span>${escapeHTML(item.text)}</span>`;
        const del = document.createElement('button');
        del.className = 'btn btn-sm btn-icon';
        del.textContent = '✕';
        del.addEventListener('click', () => {
          col.items = col.items.filter(i => i.id !== item.id);
          saveCollections(list);
          render();
        });
        chip.appendChild(del);
        itemsWrap.appendChild(chip);
      });

      card.querySelector('[data-act="delete-col"]').addEventListener('click', () => {
        if(confirm(`Delete the "${col.name}" collection and everything in it?`)){
          saveCollections(list.filter(c => c.id !== col.id));
          render();
        }
      });
      const newItemInput = card.querySelector('[data-new-item]');
      card.querySelector('[data-act="add-item"]').addEventListener('click', () => {
        const text = newItemInput.value.trim();
        if(!text) return;
        col.items.push({ id: World.uid('citem'), text });
        saveCollections(list);
        newItemInput.value = '';
        render();
      });
      newItemInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') card.querySelector('[data-act="add-item"]').click(); });

      wrap.appendChild(card);
    });
  }

  document.addEventListener('DOMContentLoaded', render);
})();
