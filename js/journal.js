/* ============================================================
   MY LITTLE WORLD — JOURNAL LOGIC
   ============================================================ */

(function(){
  const els = {
    id: document.getElementById('editingEntryId'),
    title: document.getElementById('entryTitle'),
    date: document.getElementById('entryDate'),
    text: document.getElementById('entryText'),
    tags: document.getElementById('entryTags'),
    moodPicker: document.getElementById('entryMoodPicker'),
    imageInput: document.getElementById('entryImageInput'),
    imagePreviewWrap: document.getElementById('entryImagePreviewWrap'),
    removeImageBtn: document.getElementById('removeEntryImageBtn'),
    saveBtn: document.getElementById('saveEntryBtn'),
    cancelBtn: document.getElementById('cancelEditBtn'),
    canvas: document.getElementById('journalCanvas'),
    archive: document.getElementById('entryArchive'),
    emptyState: document.getElementById('archiveEmptyState'),
    search: document.getElementById('searchEntries'),
    filterMood: document.getElementById('filterMood'),
    filterTag: document.getElementById('filterTag'),
    filterDate: document.getElementById('filterDate'),
    clearFilters: document.getElementById('clearFiltersBtn'),
    exportJournalBtn: document.getElementById('exportJournalBtn')
  };

  let selectedMood = null;
  let pendingImageMediaId = null; // media id once uploaded
  let pendingImageRemoved = false;
  let board = createCanvasBoard(els.canvas, { items: [], onChange: () => {} });

  function getEntries(){ return World.get(World.KEYS.journal, []); }
  function saveEntries(list){ World.set(World.KEYS.journal, list); }

  function resetEditor(){
    els.id.value = '';
    els.title.value = '';
    els.date.value = World.todayISO();
    els.text.value = '';
    els.tags.value = '';
    selectedMood = null;
    pendingImageMediaId = null;
    pendingImageRemoved = false;
    els.imagePreviewWrap.innerHTML = '';
    els.removeImageBtn.style.display = 'none';
    els.cancelBtn.style.display = 'none';
    board = createCanvasBoard(els.canvas, { items: [], onChange: () => {} });
    renderMoodPicker(els.moodPicker, null, (m) => { selectedMood = m; });
  }

  async function loadEntryIntoEditor(entry){
    els.id.value = entry.id;
    els.title.value = entry.title || '';
    els.date.value = entry.date || World.todayISO();
    els.text.value = entry.text || '';
    els.tags.value = (entry.tags || []).join(', ');
    selectedMood = entry.mood || null;
    renderMoodPicker(els.moodPicker, selectedMood, (m) => { selectedMood = m; });

    pendingImageMediaId = entry.imageMediaId || null;
    pendingImageRemoved = false;
    els.imagePreviewWrap.innerHTML = '';
    if(entry.imageMediaId){
      const dataUrl = await World.getMedia(entry.imageMediaId);
      if(dataUrl){
        els.imagePreviewWrap.innerHTML = `<img src="${dataUrl}" class="entry-image-preview" alt="journal photo">`;
        els.removeImageBtn.style.display = 'inline-flex';
      }
    }else{
      els.removeImageBtn.style.display = 'none';
    }

    board = createCanvasBoard(els.canvas, { items: entry.stickers || [], onChange: () => {} });
    els.cancelBtn.style.display = 'inline-flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  els.imageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const dataUrl = await World.fileToDataURL(file);
    pendingImageMediaId = await World.saveMedia(dataUrl);
    pendingImageRemoved = false;
    els.imagePreviewWrap.innerHTML = `<img src="${dataUrl}" class="entry-image-preview" alt="journal photo">`;
    els.removeImageBtn.style.display = 'inline-flex';
    e.target.value = '';
  });

  els.removeImageBtn.addEventListener('click', () => {
    pendingImageMediaId = null;
    pendingImageRemoved = true;
    els.imagePreviewWrap.innerHTML = '';
    els.removeImageBtn.style.display = 'none';
  });

  els.cancelBtn.addEventListener('click', resetEditor);

  els.saveBtn.addEventListener('click', () => {
    const text = els.text.value.trim();
    const title = els.title.value.trim();
    if(!text && !title){
      toast('write a little something first ♡');
      return;
    }
    const entries = getEntries();
    const editingId = els.id.value;
    const tags = els.tags.value.split(',').map(t => t.trim()).filter(Boolean);

    const entryData = {
      id: editingId || World.uid('entry'),
      date: els.date.value || World.todayISO(),
      title: title || 'untitled dump',
      mood: selectedMood,
      text,
      tags,
      imageMediaId: pendingImageRemoved ? null : pendingImageMediaId,
      stickers: board.serialize(),
      updatedAt: new Date().toISOString()
    };

    if(editingId){
      const idx = entries.findIndex(e => e.id === editingId);
      if(idx > -1) entries[idx] = entryData; else entries.push(entryData);
    }else{
      entries.push(entryData);
    }
    saveEntries(entries);
    toast('entry saved to your book ♡');
    sparkleAt(els.saveBtn);
    resetEditor();
    renderArchive();
    populateMoodFilter();
  });

  function populateMoodFilter(){
    const used = new Set(getEntries().map(e => e.mood).filter(Boolean));
    els.filterMood.innerHTML = '<option value="">any</option>' + Array.from(used).map(m => `<option value="${m}">${m}</option>`).join('');
  }

  function matchesFilters(entry){
    const q = els.search.value.trim().toLowerCase();
    if(q && !(`${entry.title} ${entry.text}`.toLowerCase().includes(q))) return false;
    if(els.filterMood.value && entry.mood !== els.filterMood.value) return false;
    if(els.filterTag.value.trim()){
      const t = els.filterTag.value.trim().toLowerCase();
      if(!(entry.tags||[]).some(tag => tag.toLowerCase().includes(t))) return false;
    }
    if(els.filterDate.value && entry.date !== els.filterDate.value) return false;
    return true;
  }

  function renderArchive(){
    const entries = getEntries().slice().sort((a,b) => (b.date||'').localeCompare(a.date||'') || (b.updatedAt||'').localeCompare(a.updatedAt||''));
    const filtered = entries.filter(matchesFilters);
    els.archive.innerHTML = '';
    els.emptyState.style.display = filtered.length ? 'none' : 'block';

    filtered.forEach(entry => {
      const card = document.createElement('article');
      card.className = 'entry-card';
      card.innerHTML = `
        <div class="entry-date">${World.formatDate(entry.date)} ${entry.mood ? '· ' + entry.mood : ''}</div>
        <h3>${escapeHTML(entry.title)}</h3>
        <div class="entry-snippet">${escapeHTML((entry.text||'').slice(0,140))}</div>
        <div>${(entry.tags||[]).map(t => `<span class="tag">#${escapeHTML(t)}</span>`).join('')}</div>
        <div class="entry-actions">
          <button class="btn btn-sm btn-outline" data-act="edit">edit</button>
          <button class="btn btn-sm btn-danger" data-act="delete">delete</button>
        </div>
      `;
      card.querySelector('[data-act="edit"]').addEventListener('click', (ev) => {
        ev.stopPropagation();
        loadEntryIntoEditor(entry);
      });
      card.querySelector('[data-act="delete"]').addEventListener('click', (ev) => {
        ev.stopPropagation();
        if(confirm('Delete this journal entry? This cannot be undone.')){
          const remaining = getEntries().filter(e => e.id !== entry.id);
          saveEntries(remaining);
          renderArchive();
          populateMoodFilter();
          toast('entry deleted');
        }
      });
      card.addEventListener('click', () => loadEntryIntoEditor(entry));
      els.archive.appendChild(card);
    });
  }

  [els.search, els.filterMood, els.filterTag, els.filterDate].forEach(el => {
    el.addEventListener('input', renderArchive);
    el.addEventListener('change', renderArchive);
  });
  els.clearFilters.addEventListener('click', () => {
    els.search.value=''; els.filterMood.value=''; els.filterTag.value=''; els.filterDate.value='';
    renderArchive();
  });

  els.exportJournalBtn.addEventListener('click', () => { World.exportJournal(); toast('journal exported ♡'); });

  document.addEventListener('DOMContentLoaded', () => {
    resetEditor();
    renderArchive();
    populateMoodFilter();
    const drawer = document.querySelector('.sticker-drawer');
    if(drawer) renderStickerDrawer(drawer, { addItem: (p) => board.addItem(p) });
  });
})();
