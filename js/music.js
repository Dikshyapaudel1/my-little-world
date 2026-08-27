/* ============================================================
   MY LITTLE WORLD — SOUNDTRACK LOGIC
   ============================================================ */
(function(){
  const CATEGORIES = [
    'songs that feel like me','current obsession','comfort songs','main character songs',
    'songs attached to memories','songs for crying','songs for getting my life together','songs for romanticizing life'
  ];

  const els = {
    title: document.getElementById('songTitle'),
    artist: document.getElementById('songArtist'),
    category: document.getElementById('songCategory'),
    note: document.getElementById('songNote'),
    spotify: document.getElementById('songSpotify'),
    youtube: document.getElementById('songYoutube'),
    addBtn: document.getElementById('addSongBtn'),
    list: document.getElementById('musicList'),
    empty: document.getElementById('musicEmptyState'),
    search: document.getElementById('songSearch'),
    categoryFilter: document.getElementById('songCategoryFilter')
  };

  function getSongs(){ return World.get(World.KEYS.music, []); }
  function saveSongs(list){ World.set(World.KEYS.music, list); }

  els.addBtn.addEventListener('click', () => {
    if(!els.title.value.trim() || !els.artist.value.trim()){
      toast('add at least a title and artist ♡');
      return;
    }
    const songs = getSongs();
    songs.push({
      id: World.uid('song'),
      title: els.title.value.trim(),
      artist: els.artist.value.trim(),
      category: els.category.value,
      note: els.note.value.trim(),
      spotify: els.spotify.value.trim(),
      youtube: els.youtube.value.trim(),
      createdAt: new Date().toISOString()
    });
    saveSongs(songs);
    ['title','artist','note','spotify','youtube'].forEach(k => els[k].value = '');
    renderList();
    toast('added to your soundtrack 🎵');
  });

  function renderList(){
    const q = els.search.value.trim().toLowerCase();
    const cat = els.categoryFilter.value;
    const songs = getSongs().slice().reverse().filter(s => {
      if(cat && s.category !== cat) return false;
      if(q && !(`${s.title} ${s.artist} ${s.note}`.toLowerCase().includes(q))) return false;
      return true;
    });
    els.list.innerHTML = '';
    els.empty.style.display = songs.length ? 'none' : 'block';
    songs.forEach(s => {
      const card = document.createElement('div');
      card.className = 'paper-card tilt-' + ((Math.abs(hash(s.id)) % 3) + 1);
      const link = s.spotify || s.youtube;
      card.innerHTML = `
        <span class="washi pink" style="left:16px;"></span>
        <div style="font-size:2rem;text-align:center;">🎵</div>
        <h3 style="text-align:center;margin-bottom:.1rem;">${escapeHTML(s.title)}</h3>
        <p style="text-align:center;color:var(--plum-soft);margin-bottom:.5rem;">${escapeHTML(s.artist)}</p>
        <span class="tag">${escapeHTML(s.category)}</span>
        ${s.note ? `<p style="font-family:var(--font-hand);font-size:1.1rem;margin-top:.6rem;">"${escapeHTML(s.note)}"</p>` : ''}
        <div class="quick-actions" style="margin-top:.8rem;">
          ${link ? `<a class="btn btn-sm btn-primary" href="${escapeHTML(link)}" target="_blank" rel="noopener">▶ play / visit</a>` : ''}
          <button class="btn btn-sm btn-danger" data-id="${s.id}">delete</button>
        </div>
      `;
      card.querySelector('.btn-danger').addEventListener('click', () => {
        if(confirm('Remove this song from your soundtrack?')){
          saveSongs(getSongs().filter(x => x.id !== s.id));
          renderList();
        }
      });
      els.list.appendChild(card);
    });
  }

  function hash(str){ let h=0; for(let i=0;i<str.length;i++){ h = (h*31 + str.charCodeAt(i))|0; } return h; }

  els.search.addEventListener('input', renderList);
  els.categoryFilter.addEventListener('change', renderList);

  document.addEventListener('DOMContentLoaded', () => {
    els.categoryFilter.innerHTML = '<option value="">all categories</option>' + CATEGORIES.map(c => `<option>${c}</option>`).join('');
    renderList();
  });
})();
