/* ============================================================
   MY LITTLE WORLD — 100 DAY CHALLENGE LOGIC
   ============================================================ */
(function(){
  const MILESTONES = [10,25,50,75,100];
  const TOTAL_DAYS = 100;

  const els = {
    name: document.getElementById('challengeName'),
    nameInput: document.getElementById('challengeNameInput'),
    renameBtn: document.getElementById('renameBtn'),
    resetBtn: document.getElementById('resetChallengeBtn'),
    progressLabel: document.getElementById('progressLabel'),
    daysLeft: document.getElementById('daysLeftLabel'),
    fill: document.getElementById('progressFill'),
    grid: document.getElementById('dayGrid'),
    modalBackdrop: document.getElementById('dayModalBackdrop'),
    modalTitle: document.getElementById('dayModalTitle'),
    dayHabit: document.getElementById('dayHabit'),
    dayNote: document.getElementById('dayNote'),
    dayMood: document.getElementById('dayModalMood'),
    closeModal: document.getElementById('closeDayModal'),
    saveDayBtn: document.getElementById('saveDayBtn'),
    toggleDoneBtn: document.getElementById('toggleDoneBtn')
  };

  let openDayIndex = null;
  let currentMood = null;

  function freshChallenge(name){
    return {
      name: name || 'My 100 Day Challenge',
      startDate: World.todayISO(),
      days: Array.from({length: TOTAL_DAYS}, () => ({ done:false, habit:'', note:'', mood:null }))
    };
  }

  function getChallenge(){
    let c = World.get(World.KEYS.challenge, null);
    if(!c || !c.days || c.days.length !== TOTAL_DAYS){
      c = freshChallenge('100 Days of Becoming Me');
      World.set(World.KEYS.challenge, c);
    }
    return c;
  }
  function saveChallenge(c){ World.set(World.KEYS.challenge, c); }

  function render(){
    const c = getChallenge();
    els.name.textContent = c.name;
    els.nameInput.value = '';
    els.nameInput.placeholder = 'rename your challenge…';

    const doneCount = c.days.filter(d => d.done).length;
    els.progressLabel.textContent = `Day ${doneCount} / ${TOTAL_DAYS}`;
    els.daysLeft.textContent = `${TOTAL_DAYS - doneCount} days left`;
    els.fill.style.width = (doneCount/TOTAL_DAYS*100) + '%';

    els.grid.innerHTML = '';
    c.days.forEach((day, i) => {
      const num = i+1;
      const circle = document.createElement('button');
      circle.type = 'button';
      circle.className = 'day-circle' + (day.done ? ' done' : '') + (MILESTONES.includes(num) ? ' milestone' : '');
      circle.textContent = num;
      circle.title = day.habit ? `Day ${num}: ${day.habit}` : `Day ${num}`;
      circle.addEventListener('click', () => openDay(i));
      els.grid.appendChild(circle);
    });
  }

  function openDay(i){
    const c = getChallenge();
    const day = c.days[i];
    openDayIndex = i;
    els.modalTitle.textContent = `Day ${i+1}${MILESTONES.includes(i+1) ? ' ✦ milestone' : ''}`;
    els.dayHabit.value = day.habit || '';
    els.dayNote.value = day.note || '';
    currentMood = day.mood || null;
    renderMoodPicker(els.dayMood, currentMood, (m) => { currentMood = m; });
    els.toggleDoneBtn.textContent = day.done ? 'mark not done' : 'mark complete';
    els.modalBackdrop.classList.remove('hidden');
  }

  function closeDay(){
    els.modalBackdrop.classList.add('hidden');
    openDayIndex = null;
  }

  els.closeModal.addEventListener('click', closeDay);
  els.modalBackdrop.addEventListener('click', (e) => { if(e.target === els.modalBackdrop) closeDay(); });

  els.saveDayBtn.addEventListener('click', () => {
    if(openDayIndex === null) return;
    const c = getChallenge();
    c.days[openDayIndex].habit = els.dayHabit.value.trim();
    c.days[openDayIndex].note = els.dayNote.value.trim();
    c.days[openDayIndex].mood = currentMood;
    saveChallenge(c);
    toast('day saved ♡');
    render();
  });

  els.toggleDoneBtn.addEventListener('click', () => {
    if(openDayIndex === null) return;
    const c = getChallenge();
    const wasDone = c.days[openDayIndex].done;
    c.days[openDayIndex].done = !wasDone;
    saveChallenge(c);
    render();
    closeDay();
    if(!wasDone){
      toast(`day ${openDayIndex+1} complete ♡`);
      if(MILESTONES.includes(openDayIndex+1)){
        setTimeout(() => toast(`✦ milestone reached — day ${openDayIndex+1} ✦`), 800);
      }
    }
  });

  els.renameBtn.addEventListener('click', () => {
    const newName = els.nameInput.value.trim();
    if(!newName) return;
    const c = getChallenge();
    c.name = newName;
    saveChallenge(c);
    render();
    toast('challenge renamed ♡');
  });

  els.resetBtn.addEventListener('click', () => {
    if(confirm('Restart this challenge from Day 1? Your notes and progress will be cleared.')){
      const c = getChallenge();
      saveChallenge(freshChallenge(c.name));
      render();
      toast('challenge restarted — fresh start ♡');
    }
  });

  document.addEventListener('DOMContentLoaded', render);
})();
