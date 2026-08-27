/* ============================================================
   MY LITTLE WORLD — SHARED APP LOGIC
   Navigation, toasts, floating decorations, affirmations,
   mood selector, and the Home dashboard.
   ============================================================ */

const NAV_ITEMS = [
  { href: 'index.html',          icon: '🏠', label: 'Home' },
  { href: 'journal.html',        icon: '📖', label: 'Journal' },
  { href: 'music.html',          icon: '🎵', label: 'Soundtrack' },
  { href: 'challenge.html',      icon: '🌱', label: '100 Days' },
  { href: 'affirmations.html',   icon: '🌷', label: 'Affirmations' },
  { href: 'bouquets.html',       icon: '💐', label: 'Bouquets' },
  { href: 'letters.html',        icon: '💌', label: 'Letters' },
  { href: 'memories.html',       icon: '📸', label: 'Memories' },
  { href: 'highest-self.html',   icon: '✨', label: 'Highest Self' },
  { href: 'joys.html',           icon: '🫙', label: 'Little Joys' },
  { href: 'monthly-reset.html',  icon: '🌙', label: 'Monthly Reset' },
  { href: 'collections.html',    icon: '🎀', label: 'Collections' }
];

const DEFAULT_AFFIRMATIONS = [
  "I am allowed to grow slowly.",
  "I can build a life that feels like mine.",
  "I don't need to become someone else to become better.",
  "I am doing better than I give myself credit for.",
  "Rest is part of the process, not a break from it.",
  "I get to define what a good life looks like for me.",
  "I am allowed to outgrow things that no longer fit.",
  "Small steps still count as moving forward.",
  "I trust myself a little more each day.",
  "My pace is not a problem to fix.",
  "I am becoming someone I'm proud of.",
  "It's okay to take up space in my own life."
];

const ROTATING_MESSAGES = [
  "you don't have to have everything figured out today.",
  "this page is still yours, even on the messy days.",
  "small, soft progress still counts.",
  "you are allowed to rest here for a moment.",
  "today is just one page in a very long book.",
  "you are exactly where you need to be right now."
];

/* ---------------- helpers ---------------- */

function escapeHTML(str){
  if(str === null || str === undefined) return '';
  return String(str)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#39;');
}

function currentPage(){
  const p = window.location.pathname.split('/').pop();
  return p === '' ? 'index.html' : p;
}

function toast(message){
  let el = document.getElementById('mlwToast');
  if(!el){
    el = document.createElement('div');
    el.id = 'mlwToast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2200);
}

function pickRandom(arr){
  if(!arr || !arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ---------------- navigation ---------------- */

function renderNav(){
  const page = currentPage();
  const sidebarList = document.getElementById('sidebarNavList');
  const bottomList = document.getElementById('bottomNavList');

  if(sidebarList){
    sidebarList.innerHTML = NAV_ITEMS.map(item => `
      <li><a href="${item.href}" class="${item.href === page ? 'active' : ''}">
        <span class="ico">${item.icon}</span> ${item.label}
      </a></li>
    `).join('');
  }
  if(bottomList){
    bottomList.innerHTML = NAV_ITEMS.map(item => `
      <a href="${item.href}" class="${item.href === page ? 'active' : ''}">
        <span class="ico">${item.icon}</span>${item.label}
      </a>
    `).join('');
  }

  const hamburger = document.getElementById('hamburgerBtn');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('navOverlay');
  if(hamburger && sidebar && overlay){
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('hidden');
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.add('hidden');
    });
  }
}

/* ---------------- floating ambient decorations ---------------- */

function initFloaties(count = 8){
  const wrap = document.getElementById('floaties');
  if(!wrap) return;
  const glyphs = ['♡','✦','☁︎','✿','♪','☆'];
  for(let i=0;i<count;i++){
    const span = document.createElement('span');
    span.className = 'floaty';
    span.textContent = pickRandom(glyphs);
    span.style.left = Math.random()*100 + 'vw';
    span.style.animationDuration = (18 + Math.random()*14) + 's';
    span.style.animationDelay = (Math.random()*-20) + 's';
    span.style.fontSize = (1 + Math.random()*1.2) + 'rem';
    wrap.appendChild(span);
  }
}

/* small sparkle burst on click, used for delightful confirmations */
function sparkleAt(el){
  if(!el) return;
  const rect = el.getBoundingClientRect();
  for(let i=0;i<6;i++){
    const s = document.createElement('span');
    s.className = 'sparkle';
    s.textContent = '✦';
    s.style.left = (rect.left + rect.width/2 + (Math.random()*40-20)) + 'px';
    s.style.top = (rect.top + (Math.random()*10)) + 'px';
    s.style.position = 'fixed';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 650);
  }
}

/* ---------------- affirmations ---------------- */

function getAffirmationPool(){
  const custom = World.get(World.KEYS.affirmations, []);
  const customTexts = custom.map(a => a.text);
  return customTexts.length ? customTexts.concat(DEFAULT_AFFIRMATIONS) : DEFAULT_AFFIRMATIONS;
}

function randomAffirmation(){
  return pickRandom(getAffirmationPool());
}

function randomRotatingMessage(){
  return pickRandom(ROTATING_MESSAGES);
}

/* ---------------- mood selector (shared widget) ---------------- */

const MOODS = ['🥰','😊','😌','😐','😔','😢','😤','🥱','🤍'];

function renderMoodPicker(container, selected, onSelect){
  container.innerHTML = MOODS.map(m => `
    <button type="button" class="mood-btn ${m === selected ? 'selected':''}" data-mood="${m}" aria-pressed="${m===selected}">${m}</button>
  `).join('');
  container.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.mood-btn').forEach(b => { b.classList.remove('selected'); b.setAttribute('aria-pressed','false'); });
      btn.classList.add('selected');
      btn.setAttribute('aria-pressed','true');
      onSelect(btn.dataset.mood);
    });
  });
}

/* ============================================================
   HOME DASHBOARD
   ============================================================ */

function initHomeDashboard(){
  const root = document.getElementById('homeDashboard');
  if(!root) return;

  // date
  const dateEl = document.getElementById('todayDate');
  if(dateEl){
    dateEl.textContent = new Date().toLocaleDateString(undefined, { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  }

  // rotating tiny message
  const msgEl = document.getElementById('rotatingMessage');
  if(msgEl) msgEl.textContent = randomRotatingMessage();

  // affirmation of the moment
  const affEl = document.getElementById('homeAffirmation');
  function showAffirmation(){ if(affEl) affEl.textContent = '“' + randomAffirmation() + '”'; }
  showAffirmation();
  const anotherBtn = document.getElementById('anotherAffirmationBtn');
  if(anotherBtn) anotherBtn.addEventListener('click', () => { showAffirmation(); sparkleAt(anotherBtn); });

  // challenge progress
  const challenge = World.get(World.KEYS.challenge, null);
  const challengeStat = document.getElementById('stat-challenge');
  if(challengeStat){
    if(challenge && challenge.days){
      const done = challenge.days.filter(Boolean).length;
      challengeStat.textContent = `Day ${done} / ${challenge.days.length}`;
    }else{
      challengeStat.textContent = 'Not started yet';
    }
  }

  // journal stats
  const entries = World.get(World.KEYS.journal, []);
  const countEl = document.getElementById('stat-journal-count');
  if(countEl) countEl.textContent = entries.length;

  const latestEl = document.getElementById('stat-journal-latest');
  if(latestEl){
    if(entries.length){
      const latest = entries[entries.length - 1];
      latestEl.innerHTML = `<strong>${escapeHTML(latest.title || 'untitled')}</strong><br><span class="entry-snippet">${escapeHTML((latest.text||'').slice(0,90))}${(latest.text||'').length>90?'…':''}</span>`;
    }else{
      latestEl.innerHTML = `<span class="entry-snippet">no entries yet — your book is waiting.</span>`;
    }
  }

  // favorite/current song
  const songs = World.get(World.KEYS.music, []);
  const songEl = document.getElementById('stat-song');
  if(songEl){
    const current = songs.find(s => s.category === 'current obsession') || songs[songs.length-1];
    songEl.textContent = current ? `${current.title} — ${current.artist}` : 'nothing added yet';
  }

  // mood selector
  const moodContainer = document.getElementById('homeMoodPicker');
  if(moodContainer){
    const log = World.get(World.KEYS.moodLog, {});
    const today = World.todayISO();
    renderMoodPicker(moodContainer, log[today], (mood) => {
      const l = World.get(World.KEYS.moodLog, {});
      l[today] = mood;
      World.set(World.KEYS.moodLog, l);
      toast('mood saved for today ♡');
    });
  }
}

/* ---------------- boot ---------------- */

document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  initFloaties();
  initHomeDashboard();

  // wire up "quick action" buttons that just navigate
  document.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => { window.location.href = btn.dataset.goto; });
  });

  // generic export/import buttons (present in sidebar footer on every page)
  const exportBtn = document.getElementById('exportWorldBtn');
  if(exportBtn) exportBtn.addEventListener('click', () => { World.exportWorld(); toast('your world is downloading ♡'); });

  const importInput = document.getElementById('importWorldInput');
  if(importInput) importInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    try{
      await World.importWorld(file);
      toast('your world has been restored — refreshing…');
      setTimeout(() => window.location.reload(), 1200);
    }catch(err){
      alert('Hmm, that file could not be read: ' + err.message);
    }
    importInput.value = '';
  });
});
