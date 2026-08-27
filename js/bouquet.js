/* ============================================================
   MY LITTLE WORLD — BOUQUET STUDIO LOGIC
   ============================================================ */
(function(){
  const FLOWERS = [
    { content:'🌹', label:'rose' }, { content:'🌼', label:'daisy' },
    { content:'🌷', label:'tulip' }, { content:'🪻', label:'lavender' },
    { content:'✿', label:"baby's breath" }, { content:'🌻', label:'sunflower' },
    { content:'🌸', label:'wildflower' }
  ];
  const DECOR = [
    { content:'🎀', label:'ribbon' }, { content:'🍃', label:'leaves' },
    { content:'✨', label:'sparkles' }, { content:'💗', label:'hearts' },
    { content:'🎁', label:'wrapping' }, { content:'🧵', label:'bow' }
  ];

  const canvasWrap = document.getElementById('bouquetCanvasWrap');
  const wrappingSelect = document.getElementById('wrappingSelect');
  const clearBtn = document.getElementById('clearCanvasBtn');
  const exportBtn = document.getElementById('exportImageBtn');
  const note = document.getElementById('bouquetNote');
  const letter = document.getElementById('bouquetLetter');
  const saveBtn = document.getElementById('saveBouquetBtn');
  const gallery = document.getElementById('bouquetGallery');
  const emptyState = document.getElementById('bouquetEmpty');

  let board = createCanvasBoard(canvasWrap, { items: [] });

  function paintPalette(container, list){
    container.innerHTML = '';
    list.forEach(f => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.title = f.label;
      btn.textContent = f.content;
      btn.addEventListener('click', () => board.addItem({ kind:'emoji', content: f.content }));
      container.appendChild(btn);
    });
  }

  function applyWrapping(){
    canvasWrap.style.background = wrappingSelect.value;
  }
  wrappingSelect.addEventListener('change', applyWrapping);

  clearBtn.addEventListener('click', () => {
    if(confirm('Clear everything from the canvas?')){
      board = createCanvasBoard(canvasWrap, { items: [] });
    }
  });

  function getBouquets(){ return World.get(World.KEYS.bouquets, []); }
  function saveBouquets(list){ World.set(World.KEYS.bouquets, list); }

  saveBtn.addEventListener('click', () => {
    const items = board.serialize();
    if(!items.length && !note.value.trim() && !letter.value.trim()){
      toast('add some flowers first ♡');
      return;
    }
    const list = getBouquets();
    list.push({
      id: World.uid('bouq'),
      wrapping: wrappingSelect.value,
      items,
      note: note.value.trim(),
      letter: letter.value.trim(),
      createdAt: new Date().toISOString()
    });
    saveBouquets(list);
    toast('bouquet saved 💐');
    sparkleAt(saveBtn);
    note.value = ''; letter.value = '';
    board = createCanvasBoard(canvasWrap, { items: [] });
    renderGallery();
  });

  function renderMini(container, bouquet){
    container.style.position = 'relative';
    container.style.height = '160px';
    container.style.borderRadius = '14px';
    container.style.overflow = 'hidden';
    container.style.background = bouquet.wrapping || 'var(--blush)';
    const rect = { w: 320, h: 480 }; // approximate original canvas proportions
    bouquet.items.forEach(it => {
      const span = document.createElement('span');
      const scaleX = 100 / rect.w, scaleY = 160 / rect.h;
      span.style.position = 'absolute';
      span.style.left = (it.x * scaleX) + '%';
      span.style.top = Math.min(95, (it.y / rect.h * 100)) + '%';
      span.style.transform = `translate(-50%,-50%) rotate(${it.rotation}deg)`;
      span.style.fontSize = Math.max(10, it.size * 0.35) + 'px';
      if(it.kind === 'image'){
        span.innerHTML = `<img src="${it.content}" style="width:${it.size*0.35}px;height:${it.size*0.35}px;object-fit:contain;">`;
      }else{
        span.textContent = it.content;
      }
      container.appendChild(span);
    });
  }

  function renderGallery(){
    const list = getBouquets().slice().reverse();
    gallery.innerHTML = '';
    emptyState.style.display = list.length ? 'none' : 'block';
    list.forEach(b => {
      const card = document.createElement('div');
      card.className = 'paper-card';
      const preview = document.createElement('div');
      renderMini(preview, b);
      card.appendChild(preview);
      if(b.note){
        const p = document.createElement('p');
        p.style.fontFamily = 'var(--font-hand)';
        p.style.fontSize = '1.1rem';
        p.style.margin = '.6rem 0 0';
        p.textContent = '"' + b.note + '"';
        card.appendChild(p);
      }
      const actions = document.createElement('div');
      actions.className = 'quick-actions';
      actions.style.marginTop = '.6rem';
      if(b.letter){
        const readBtn = document.createElement('button');
        readBtn.className = 'btn btn-sm btn-outline';
        readBtn.textContent = 'read letter';
        readBtn.addEventListener('click', () => alert(b.letter));
        actions.appendChild(readBtn);
      }
      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-sm btn-danger';
      delBtn.textContent = 'delete';
      delBtn.addEventListener('click', () => {
        if(confirm('Delete this bouquet?')){
          saveBouquets(getBouquets().filter(x => x.id !== b.id));
          renderGallery();
        }
      });
      actions.appendChild(delBtn);
      card.appendChild(actions);
      gallery.appendChild(card);
    });
  }

  /** Renders the current canvas to a PNG using the 2D Canvas API and downloads it. */
  async function exportBouquetImage(){
    const rect = canvasWrap.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d');

    // background: try to approximate the CSS gradient with a plain fill
    ctx.fillStyle = '#f8dbe2';
    ctx.fillRect(0,0,canvas.width, canvas.height);

    const items = board.serialize().slice().sort((a,b) => a.z - b.z);
    for(const item of items){
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rotation * Math.PI/180);
      if(item.kind === 'image'){
        try{
          const img = await loadImage(item.content);
          ctx.drawImage(img, -item.size/2, -item.size/2, item.size, item.size);
        }catch(e){ /* skip broken image */ }
      }else{
        ctx.font = `${item.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.content, 0, 0);
      }
      ctx.restore();
    }

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-bouquet-${World.todayISO()}.png`;
    a.click();
  }

  function loadImage(src){
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  exportBtn.addEventListener('click', () => { exportBouquetImage(); toast('exporting your bouquet ♡'); });

  document.addEventListener('DOMContentLoaded', () => {
    paintPalette(document.getElementById('flowerPalette'), FLOWERS);
    paintPalette(document.getElementById('decorPalette'), DECOR);
    applyWrapping();
    renderGallery();
  });
})();
