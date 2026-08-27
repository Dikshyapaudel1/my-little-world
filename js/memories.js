/* ============================================================
   MY LITTLE WORLD — MEMORY WALL LOGIC
   ============================================================ */
(function(){
  const els = {
    image: document.getElementById('memImage'),
    title: document.getElementById('memTitle'),
    date: document.getElementById('memDate'),
    caption: document.getElementById('memCaption'),
    people: document.getElementById('memPeople'),
    location: document.getElementById('memLocation'),
    tags: document.getElementById('memTags'),
    addBtn: document.getElementById('addMemoryBtn'),
    wall: document.getElementById('memoryWall'),
    empty: document.getElementById('memoryEmpty'),
    search: document.getElementById('memSearch')
  };

  function getMemories(){ return World.get(World.KEYS.memories, []); }
  function saveMemories(list){ World.set(World.KEYS.memories, list); }

  els.addBtn.addEventListener('click', async () => {
    if(!els.title.value.trim() && !els.caption.value.trim() && !els.image.files[0]){
      toast('add at least a photo or a title ♡');
      return;
    }
    let imageMediaId = null;
    if(els.image.files[0]){
      const dataUrl = await World.fileToDataURL(els.image.files[0]);
      imageMediaId = await World.saveMedia(dataUrl);
    }
    const list = getMemories();
    list.push({
      id: World.uid('mem'),
      imageMediaId,
      title: els.title.value.trim() || 'untitled moment',
      date: els.date.value || World.todayISO(),
      caption: els.caption.value.trim(),
      people: els.people.value.trim(),
      location: els.location.value.trim(),
      tags: els.tags.value.split(',').map(t=>t.trim()).filter(Boolean),
      rotation: (Math.random()*8-4).toFixed(1)
    });
    saveMemories(list);
    ['title','caption','people','location','tags'].forEach(k => els[k].value = '');
    els.image.value = ''; els.date.value = '';
    render();
    toast('memory pinned to your wall 📌');
  });

  async function render(){
    const q = els.search.value.trim().toLowerCase();
    const list = getMemories().slice().reverse().filter(m => {
      if(!q) return true;
      return `${m.title} ${m.caption} ${(m.tags||[]).join(' ')} ${m.people} ${m.location}`.toLowerCase().includes(q);
    });
    els.wall.innerHTML = '';
    els.empty.style.display = list.length ? 'none' : 'block';

    for(const m of list){
      const card = document.createElement('div');
      card.className = 'polaroid';
      card.style.transform = `rotate(${m.rotation || 0}deg)`;
      let imgHtml = `<div class="img-placeholder" role="img" aria-label="${escapeHTML(m.title)}"></div>`;
      if(m.imageMediaId){
        const dataUrl = await World.getMedia(m.imageMediaId);
        if(dataUrl) imgHtml = `<img src="${dataUrl}" alt="${escapeHTML(m.title)}">`;
      }
      card.innerHTML = `
        ${imgHtml}
        <figcaption>${escapeHTML(m.title)}</figcaption>
        <p style="font-size:.8rem;color:var(--plum-soft);text-align:center;margin:.2rem 0 0;">${World.formatDate(m.date)}</p>
        ${m.caption ? `<p style="font-size:.82rem;text-align:center;margin:.3rem 0 0;">${escapeHTML(m.caption)}</p>` : ''}
        ${(m.people||m.location) ? `<p style="font-size:.72rem;color:var(--plum-soft);text-align:center;margin:.2rem 0 0;">${escapeHTML([m.people,m.location].filter(Boolean).join(' · '))}</p>` : ''}
        <div style="text-align:center;margin-top:.3rem;">${(m.tags||[]).map(t=>`<span class="tag">#${escapeHTML(t)}</span>`).join('')}</div>
        <div style="text-align:center;margin-top:.5rem;">
          <button class="btn btn-sm btn-danger" data-id="${m.id}">delete</button>
        </div>
      `;
      card.querySelector('.btn-danger').addEventListener('click', () => {
        if(confirm('Remove this memory from your wall?')){
          saveMemories(getMemories().filter(x => x.id !== m.id));
          render();
        }
      });
      els.wall.appendChild(card);
    }
  }

  els.search.addEventListener('input', render);
  document.addEventListener('DOMContentLoaded', render);
})();
