/* ============================================================
   MY LITTLE WORLD — HIGHEST SELF LOGIC
   ============================================================ */
(function(){
  function getData(){
    return World.get(World.KEYS.highestSelf, {
      becoming:'', values:[], learn:[], bucket:[], habits:[], proud:[], vision:[], promises:[]
    });
  }
  function saveData(d){ World.set(World.KEYS.highestSelf, d); }

  // ---- free write ----
  const becomingText = document.getElementById('becomingText');
  document.getElementById('saveBecomingBtn').addEventListener('click', () => {
    const d = getData();
    d.becoming = becomingText.value;
    saveData(d);
    toast('saved ♡');
  });

  /**
   * Wires a simple add/list/delete widget for an array field.
   * renderCard(item, index) must return an HTMLElement.
   */
  function setupList(field, listElId, inputId, addBtnId, renderCard){
    const listEl = document.getElementById(listElId);
    const input = document.getElementById(inputId);
    const addBtn = document.getElementById(addBtnId);

    function render(){
      const d = getData();
      listEl.innerHTML = '';
      (d[field] || []).forEach((item, idx) => {
        const el = renderCard(item, idx);
        listEl.appendChild(el);
      });
    }

    addBtn.addEventListener('click', () => {
      const text = input.value.trim();
      if(!text) return;
      const d = getData();
      d[field] = d[field] || [];
      d[field].push({ id: World.uid('hs'), text, done:false });
      saveData(d);
      input.value = '';
      render();
    });
    input.addEventListener('keydown', (e) => { if(e.key === 'Enter') addBtn.click(); });

    function remove(id){
      const d = getData();
      d[field] = (d[field]||[]).filter(x => x.id !== id);
      saveData(d);
      render();
    }
    function toggle(id){
      const d = getData();
      const it = (d[field]||[]).find(x => x.id === id);
      if(it){ it.done = !it.done; saveData(d); render(); }
    }

    render();
    return { render, remove, toggle };
  }

  function simpleTagCard(item, controller){
    const el = document.createElement('div');
    el.className = 'mini-card';
    el.innerHTML = `<span>${escapeHTML(item.text)}</span>`;
    const del = document.createElement('button');
    del.className = 'btn btn-sm btn-icon';
    del.textContent = '✕';
    del.addEventListener('click', () => controller.remove(item.id));
    el.appendChild(del);
    return el;
  }

  function checklistCard(item, controller){
    const el = document.createElement('div');
    el.className = 'mini-card';
    const label = document.createElement('label');
    label.style.display = 'flex'; label.style.gap = '.5rem'; label.style.alignItems = 'center'; label.style.margin = '0';
    label.innerHTML = `<input type="checkbox" ${item.done ? 'checked':''} style="width:auto;margin:0;"> <span style="${item.done ? 'text-decoration:line-through;color:var(--plum-soft);':''}">${escapeHTML(item.text)}</span>`;
    label.querySelector('input').addEventListener('change', () => controller.toggle(item.id));
    el.appendChild(label);
    const del = document.createElement('button');
    del.className = 'btn btn-sm btn-icon';
    del.textContent = '✕';
    del.addEventListener('click', () => controller.remove(item.id));
    el.appendChild(del);
    return el;
  }

  let valuesCtrl, learnCtrl, bucketCtrl, habitsCtrl, proudCtrl, visionCtrl, promisesCtrl;

  document.addEventListener('DOMContentLoaded', () => {
    valuesCtrl = setupList('values','valuesList','valueInput','addValueBtn', (item) => simpleTagCard(item, valuesCtrl));
    learnCtrl = setupList('learn','learnList','learnInput','addLearnBtn', (item) => checklistCard(item, learnCtrl));
    bucketCtrl = setupList('bucket','bucketList','bucketInput','addBucketBtn', (item) => checklistCard(item, bucketCtrl));
    habitsCtrl = setupList('habits','habitsList','habitInput','addHabitBtn', (item) => simpleTagCard(item, habitsCtrl));
    proudCtrl = setupList('proud','proudList','proudInput','addProudBtn', (item) => simpleTagCard(item, proudCtrl));
    promisesCtrl = setupList('promises','promisesList','promiseInput','addPromiseBtn', (item) => simpleTagCard(item, promisesCtrl));
    visionCtrl = setupList('vision','visionBoard','visionInput','addVisionBtn', (item) => {
      const el = document.createElement('div');
      el.className = 'paper-card';
      el.innerHTML = `<p style="font-family:var(--font-hand);font-size:1.15rem;margin:0;">${escapeHTML(item.text)}</p>`;
      const del = document.createElement('button');
      del.className = 'btn btn-sm btn-icon';
      del.textContent = '✕';
      del.style.marginTop = '.5rem';
      del.addEventListener('click', () => visionCtrl.remove(item.id));
      el.appendChild(del);
      return el;
    });

    becomingText.value = getData().becoming || '';
  });
})();
