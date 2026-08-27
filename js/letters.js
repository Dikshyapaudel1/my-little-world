/* ============================================================
   MY LITTLE WORLD — LETTERS TO MYSELF LOGIC
   ============================================================ */
(function(){
  const els = {
    newBtn: document.getElementById('newLetterBtn'),
    grid: document.getElementById('envelopeGrid'),
    empty: document.getElementById('letterEmpty'),
    modalBackdrop: document.getElementById('letterModalBackdrop'),
    closeModal: document.getElementById('closeLetterModal'),
    formView: document.getElementById('letterFormView'),
    readView: document.getElementById('letterReadView'),
    category: document.getElementById('letterCategory'),
    title: document.getElementById('letterTitle'),
    recipient: document.getElementById('letterRecipient'),
    body: document.getElementById('letterBody'),
    imageInput: document.getElementById('letterImageInput'),
    saveBtn: document.getElementById('saveLetterBtn'),
    readCategory: document.getElementById('readCategory'),
    readTitle: document.getElementById('readTitle'),
    readMeta: document.getElementById('readMeta'),
    readImageWrap: document.getElementById('readImageWrap'),
    readBody: document.getElementById('readBody'),
    deleteBtn: document.getElementById('deleteLetterBtn')
  };

  let openReadId = null;

  function getLetters(){ return World.get(World.KEYS.letters, []); }
  function saveLetters(list){ World.set(World.KEYS.letters, list); }

  function openCompose(){
    els.formView.style.display = 'block';
    els.readView.style.display = 'none';
    els.title.value = ''; els.body.value = ''; els.recipient.value = 'me';
    els.imageInput.value = '';
    els.modalBackdrop.classList.remove('hidden');
  }
  els.newBtn.addEventListener('click', openCompose);
  els.closeModal.addEventListener('click', () => els.modalBackdrop.classList.add('hidden'));
  els.modalBackdrop.addEventListener('click', (e) => { if(e.target === els.modalBackdrop) els.modalBackdrop.classList.add('hidden'); });

  els.saveBtn.addEventListener('click', async () => {
    if(!els.body.value.trim()){ toast('write a little something first ♡'); return; }
    let imageMediaId = null;
    if(els.imageInput.files[0]){
      const dataUrl = await World.fileToDataURL(els.imageInput.files[0]);
      imageMediaId = await World.saveMedia(dataUrl);
    }
    const list = getLetters();
    list.push({
      id: World.uid('letter'),
      category: els.category.value,
      title: els.title.value.trim() || 'a letter to me',
      recipient: els.recipient.value.trim() || 'me',
      body: els.body.value.trim(),
      imageMediaId,
      opened: false,
      date: World.todayISO()
    });
    saveLetters(list);
    els.modalBackdrop.classList.add('hidden');
    render();
    toast('sealed and saved 💌');
  });

  async function openLetter(id){
    const list = getLetters();
    const letter = list.find(l => l.id === id);
    if(!letter) return;
    if(!letter.opened){ letter.opened = true; saveLetters(list); }
    openReadId = id;
    els.formView.style.display = 'none';
    els.readView.style.display = 'block';
    els.readCategory.textContent = letter.category;
    els.readTitle.textContent = letter.title;
    els.readMeta.textContent = `to ${letter.recipient} · written ${World.formatDate(letter.date)}`;
    els.readBody.textContent = letter.body;
    els.readImageWrap.innerHTML = '';
    if(letter.imageMediaId){
      const dataUrl = await World.getMedia(letter.imageMediaId);
      if(dataUrl) els.readImageWrap.innerHTML = `<img src="${dataUrl}" class="entry-image-preview" alt="letter photo">`;
    }
    els.modalBackdrop.classList.remove('hidden');
    render();
  }

  els.deleteBtn.addEventListener('click', () => {
    if(!confirm('Delete this letter permanently?')) return;
    saveLetters(getLetters().filter(l => l.id !== openReadId));
    els.modalBackdrop.classList.add('hidden');
    render();
    toast('letter deleted');
  });

  function render(){
    const list = getLetters();
    els.grid.innerHTML = '';
    els.empty.style.display = list.length ? 'none' : 'block';
    list.slice().reverse().forEach(l => {
      const env = document.createElement('button');
      env.type = 'button';
      env.className = 'envelope' + (l.opened ? ' opened' : '');
      env.innerHTML = `<span>${escapeHTML(l.title)}</span>`;
      env.title = l.category;
      env.addEventListener('click', () => openLetter(l.id));
      els.grid.appendChild(env);
    });
  }

  document.addEventListener('DOMContentLoaded', render);
})();
