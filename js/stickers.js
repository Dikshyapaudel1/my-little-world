/* ============================================================
   MY LITTLE WORLD — CANVAS / STICKER ENGINE
   A small reusable drag + resize + rotate + duplicate + delete
   engine built on Pointer Events, so it works with mouse, pen,
   and touch alike. Used by the Journal sticker system and the
   Digital Bouquet Studio.
   ------------------------------------------------------------
   Item shape:
   { id, kind:'emoji'|'image', content, x, y, size, rotation, z }
   x/y = center position in px relative to canvas top-left.
   ============================================================ */

const STICKER_LIBRARY = [
  { content:'🎀', label:'bow' }, { content:'💗', label:'heart' },
  { content:'⭐', label:'star' }, { content:'🌸', label:'flower' },
  { content:'🦋', label:'butterfly' }, { content:'🍒', label:'cherries' },
  { content:'☁️', label:'cloud' }, { content:'🌙', label:'moon' },
  { content:'✨', label:'sparkles' }, { content:'🎗️', label:'ribbon' },
  { content:'🧸', label:'teddy bear' }, { content:'🐱', label:'cat' },
  { content:'☕', label:'coffee' }, { content:'💌', label:'envelope' },
  { content:'🙂', label:'smiley' }, { content:'🪴', label:'plant' },
  { content:'🌟', label:'sparkle star' }, { content:'📎', label:'doodle' },
  { content:'🌷', label:'tulip' }, { content:'🍓', label:'strawberry' },
  { content:'🕊️', label:'dove' }, { content:'🧺', label:'basket' }
];

function createCanvasBoard(canvasEl, opts){
  opts = opts || {};
  let items = opts.items ? JSON.parse(JSON.stringify(opts.items)) : [];
  let nextZ = items.reduce((m,i)=>Math.max(m,i.z||1),1) + 1;
  let selectedId = null;

  function notify(){ if(opts.onChange) opts.onChange(serialize()); }
  function serialize(){ return JSON.parse(JSON.stringify(items)); }

  function addItem(partial){
    const rect = canvasEl.getBoundingClientRect();
    const item = Object.assign({
      id: World.uid('stk'),
      kind: 'emoji',
      content: '✦',
      x: rect.width/2 + (Math.random()*40-20),
      y: rect.height/2 + (Math.random()*40-20),
      size: 56,
      rotation: 0,
      z: nextZ++
    }, partial);
    items.push(item);
    selectedId = item.id;
    render();
    notify();
    return item;
  }

  function removeItem(id){
    items = items.filter(i => i.id !== id);
    if(selectedId === id) selectedId = null;
    render();
    notify();
  }

  function duplicateItem(id){
    const it = items.find(i => i.id === id);
    if(!it) return;
    addItem(Object.assign({}, it, { id: undefined, x: it.x + 18, y: it.y + 18, z: nextZ++ }));
  }

  function bringToFront(id){
    const it = items.find(i => i.id === id);
    if(!it) return;
    it.z = nextZ++;
    render();
    notify();
  }

  function render(){
    canvasEl.querySelectorAll('.canvas-item').forEach(el => el.remove());
    items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'canvas-item' + (item.id === selectedId ? ' selected' : '');
      el.style.left = item.x + 'px';
      el.style.top = item.y + 'px';
      el.style.zIndex = item.z;
      el.style.transform = `translate(-50%,-50%) rotate(${item.rotation}deg)`;
      el.dataset.id = item.id;

      if(item.kind === 'image'){
        el.innerHTML = `<img src="${item.content}" alt="sticker" style="width:${item.size}px;height:${item.size}px;object-fit:contain;">`;
      }else{
        el.innerHTML = `<span class="canvas-emoji" style="font-size:${item.size}px;">${item.content}</span>`;
      }

      el.innerHTML += `
        <div class="item-toolbar">
          <button type="button" data-act="rotL" title="rotate left" aria-label="Rotate left">⟲</button>
          <button type="button" data-act="rotR" title="rotate right" aria-label="Rotate right">⟳</button>
          <button type="button" data-act="dup" title="duplicate" aria-label="Duplicate">⧉</button>
          <button type="button" data-act="del" title="delete" aria-label="Delete">✕</button>
        </div>
        <div class="resize-handle" title="drag to resize" aria-hidden="true"></div>
      `;
      canvasEl.appendChild(el);
      wireItem(el, item);
    });
  }

  function wireItem(el, item){
    el.addEventListener('pointerdown', (e) => {
      if(e.target.closest('.item-toolbar') || e.target.closest('.resize-handle')) return;
      selectedId = item.id;
      bringToFront(item.id);
      el.classList.add('dragging');
      el.setPointerCapture(e.pointerId);
      const startX = e.clientX, startY = e.clientY;
      const origX = item.x, origY = item.y;

      function move(ev){
        item.x = origX + (ev.clientX - startX);
        item.y = origY + (ev.clientY - startY);
        el.style.left = item.x + 'px';
        el.style.top = item.y + 'px';
      }
      function up(){
        el.classList.remove('dragging');
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        render();
        notify();
      }
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
    });

    el.querySelectorAll('.item-toolbar button').forEach(btn => {
      btn.addEventListener('pointerdown', e => e.stopPropagation());
      btn.addEventListener('click', () => {
        if(btn.dataset.act === 'rotL'){ item.rotation -= 15; render(); notify(); }
        if(btn.dataset.act === 'rotR'){ item.rotation += 15; render(); notify(); }
        if(btn.dataset.act === 'dup'){ duplicateItem(item.id); }
        if(btn.dataset.act === 'del'){ removeItem(item.id); }
      });
    });

    const handle = el.querySelector('.resize-handle');
    handle.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      handle.setPointerCapture(e.pointerId);
      const startY = e.clientY;
      const origSize = item.size;
      function move(ev){
        const delta = ev.clientY - startY;
        item.size = Math.max(20, Math.min(260, origSize + delta));
        render();
      }
      function up(){
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', up);
        notify();
      }
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
    });
  }

  // clicking empty canvas deselects
  canvasEl.addEventListener('pointerdown', (e) => {
    if(e.target === canvasEl){ selectedId = null; render(); }
  });

  render();

  return { addItem, removeItem, duplicateItem, serialize, render, get items(){ return items; } };
}

/** Renders the drawer of default stickers + an upload button into `drawerEl`. */
function renderStickerDrawer(drawerEl, board){
  const shelf = drawerEl.querySelector('.sticker-shelf');
  const customKey = World.KEYS.stickersCustom;

  function paintShelf(){
    const custom = World.get(customKey, []);
    shelf.innerHTML = '';
    STICKER_LIBRARY.forEach(s => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.title = s.label;
      btn.setAttribute('aria-label', 'Add ' + s.label + ' sticker');
      btn.textContent = s.content;
      btn.addEventListener('click', () => board.addItem({ kind:'emoji', content: s.content }));
      shelf.appendChild(btn);
    });
    custom.forEach(c => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.title = 'my sticker';
      btn.innerHTML = `<img src="${c.thumb}" alt="custom sticker">`;
      btn.addEventListener('click', async () => {
        const dataUrl = await World.getMedia(c.mediaId);
        if(dataUrl) board.addItem({ kind:'image', content: dataUrl });
      });
      shelf.appendChild(btn);
    });
  }

  const uploadInput = drawerEl.querySelector('.sticker-upload-input');
  if(uploadInput){
    uploadInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if(!file) return;
      const dataUrl = await World.fileToDataURL(file);
      const mediaId = await World.saveMedia(dataUrl);
      const custom = World.get(customKey, []);
      custom.push({ id: World.uid('cstk'), mediaId, thumb: dataUrl });
      World.set(customKey, custom);
      paintShelf();
      toast('sticker added to your drawer ♡');
      e.target.value = '';
    });
  }

  paintShelf();
}
