/* ============================================================
   MY LITTLE WORLD — STORAGE UTILITY
   ------------------------------------------------------------
   Everything in "My Little World" is saved locally, in YOUR
   browser, on THIS device. Nothing is uploaded anywhere.

   IMPORTANT PRIVACY NOTE:
   localStorage/IndexedDB are NOT secure private vaults — they are
   just a storage box that lives inside this browser, on this
   device. Anyone with access to this browser/profile could open
   dev tools and read this data. Clearing browser data, using a
   different browser, or switching devices means your entries
   will not follow you. Use "Export My World" regularly to keep a
   backup file safe somewhere you trust.
   ============================================================ */

const World = (() => {

  // ---- keys used in localStorage, one per "collection" ----
  const KEYS = {
    journal:        'mlw_journal_entries',
    music:          'mlw_music',
    challenge:      'mlw_challenge',
    affirmations:   'mlw_affirmations',
    letters:        'mlw_letters',
    memories:       'mlw_memories',
    bouquets:       'mlw_bouquets',
    joys:           'mlw_joys',
    monthlyReset:   'mlw_monthly_reset',
    collections:    'mlw_collections',
    highestSelf:    'mlw_highest_self',
    moodLog:        'mlw_mood_log',
    stickersCustom: 'mlw_custom_stickers', // metadata only; blobs live in IndexedDB
    settings:       'mlw_settings'
  };

  /** Read a JSON collection from localStorage. Returns fallback if missing/corrupt. */
  function get(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      if(raw === null) return fallback;
      return JSON.parse(raw);
    }catch(e){
      console.warn('World.get failed for', key, e);
      return fallback;
    }
  }

  /** Save a JSON-serializable value to localStorage under key. */
  function set(key, value){
    try{
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    }catch(e){
      console.error('World.set failed (storage may be full) for', key, e);
      return false;
    }
  }

  function uid(prefix){
    return (prefix || 'id') + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,8);
  }

  function todayISO(){
    const d = new Date();
    return d.toISOString().slice(0,10);
  }

  function formatDate(iso){
    if(!iso) return '';
    const d = new Date(iso + (iso.length <= 10 ? 'T00:00:00' : ''));
    if(isNaN(d)) return iso;
    return d.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
  }

  // ============================================================
  // INDEXEDDB — used for image/blob storage (photos, stickers)
  // localStorage has a small size limit (~5MB) and stores only
  // text, so large images are kept in IndexedDB instead as
  // base64 data URLs, keyed by a generated id.
  // ============================================================
  const DB_NAME = 'mlw_media_db';
  const DB_VERSION = 1;
  const STORE = 'media';
  let dbPromise = null;

  function openDB(){
    if(dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if(!('indexedDB' in window)){
        reject(new Error('IndexedDB not supported in this browser'));
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if(!db.objectStoreNames.contains(STORE)){
          db.createObjectStore(STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  /** Save a data URL (image) to IndexedDB. Returns the generated media id. */
  async function saveMedia(dataUrl){
    const id = uid('media');
    try{
      const db = await openDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put({ id, dataUrl });
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      return id;
    }catch(e){
      console.warn('IndexedDB unavailable, media not persisted:', e);
      return null;
    }
  }

  /** Retrieve a stored data URL by media id. */
  async function getMedia(id){
    if(!id) return null;
    try{
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).get(id);
        req.onsuccess = () => resolve(req.result ? req.result.dataUrl : null);
        req.onerror = () => reject(req.error);
      });
    }catch(e){
      console.warn('IndexedDB read failed:', e);
      return null;
    }
  }

  async function deleteMedia(id){
    if(!id) return;
    try{
      const db = await openDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(id);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    }catch(e){ /* non-fatal */ }
  }

  /** Read a File input as a data URL (used before saving to IndexedDB). */
  function fileToDataURL(file){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /** Get every media record from IndexedDB (used for full export). */
  async function getAllMedia(){
    try{
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    }catch(e){
      return [];
    }
  }

  async function putAllMedia(records){
    if(!records || !records.length) return;
    try{
      const db = await openDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        const store = tx.objectStore(STORE);
        records.forEach(r => store.put(r));
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    }catch(e){ console.warn('Could not restore media', e); }
  }

  // ============================================================
  // EXPORT / IMPORT — "Export My World" / "Import My World"
  // ============================================================

  function downloadJSON(obj, filename){
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  /** Export every collection + all stored media as one JSON file. */
  async function exportWorld(){
    const data = {};
    Object.entries(KEYS).forEach(([name, key]) => { data[name] = get(key, null); });
    const media = await getAllMedia();
    const payload = {
      app: 'My Little World',
      exportedAt: new Date().toISOString(),
      version: 1,
      data,
      media
    };
    downloadJSON(payload, `my-little-world-backup-${todayISO()}.json`);
  }

  /** Export just the journal collection. */
  function exportJournal(){
    const entries = get(KEYS.journal, []);
    downloadJSON({ app:'My Little World', type:'journal-only', exportedAt: new Date().toISOString(), entries },
      `my-little-world-journal-${todayISO()}.json`);
  }

  /** Import a previously exported world file (merges/overwrites collections). */
  async function importWorld(file){
    const text = await file.text();
    const payload = JSON.parse(text);
    if(!payload || !payload.data) throw new Error('This file does not look like a My Little World backup.');
    Object.entries(KEYS).forEach(([name, key]) => {
      if(payload.data[name] !== undefined && payload.data[name] !== null){
        set(key, payload.data[name]);
      }
    });
    if(payload.media && payload.media.length){
      await putAllMedia(payload.media);
    }
    return true;
  }

  return {
    KEYS, get, set, uid, todayISO, formatDate,
    saveMedia, getMedia, deleteMedia, fileToDataURL,
    exportWorld, exportJournal, importWorld
  };
})();
