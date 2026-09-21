const SAVE_KEY = 'hearthwatch.v1';
const el = (t, c, txt) => { const n = document.createElement(t); if(c) n.className = c; if(txt != null) n.textContent = txt; return n; };
const zoneById = id => HOUSE.zones.find(z => z.id === id);

let S, tab = 'home', busy = false;

/* Away Mode is checked, not played. A night cannot be set again until a real
   window has passed, and Maya answers in real minutes rather than instantly.
   ?dev=1 collapses both so the whole arc can be walked in a few minutes. */
const DEV = /[?&]dev=1/.test(location.search);
const MINUTE = DEV ? 700 : 60000;
const NIGHT_COOLDOWN = DEV ? 12000 : 4 * 60 * 60 * 1000;

function nameFill(text){ return (text || '').replace(/\{name\}/g, S && S.name ? S.name : 'you'); }

function untilText(ms){
  const m = Math.max(0, Math.ceil(ms / 60000));
  if(m < 60) return m + (m === 1 ? ' minute' : ' minutes');
  const h = Math.floor(m / 60), r = m % 60;
  return h + 'h' + (r ? ' ' + r + 'm' : '');
}

function fresh(){
  return { night:1, name:'', armed:[], locks:{front:false,back:false,garage:false}, log:[], flags:{},
           lastSummary:null, camIndex:0, camSwitches:0, nextNightAt:0 };
}
function save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(S)); }catch(e){} }
function load(){
  try{ const raw = localStorage.getItem(SAVE_KEY); S = raw ? JSON.parse(raw) : fresh(); }
  catch(e){ S = fresh(); }
  if(!S || !S.locks) S = fresh();
}

/* ---------- floor plan ---------- */

function planSvg(which){
  const def = ROOMS[which];
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  const showGhost = which === 'ground' && S.flags.extraRoom;
  svg.setAttribute('viewBox', showGhost && def.vbGhost ? def.vbGhost : def.vb);
  svg.setAttribute('class', 'plan');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', which === 'ground' ? 'Ground floor plan' : 'Upper floor plan');

  for(const r of def.items){
    if(r.ghost && !S.flags.extraRoom) continue;
    const armed = S.armed.includes(r.zone);
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', r.x); rect.setAttribute('y', r.y);
    rect.setAttribute('width', r.w); rect.setAttribute('height', r.h);
    rect.setAttribute('rx', 2);
    rect.setAttribute('class', 'rm' + (r.out ? ' out' : '') + (r.ghost ? ' ghost' : '') + (armed ? ' armed' : ''));
    svg.appendChild(rect);

    if(r.label){
      const t = document.createElementNS(ns, 'text');
      t.setAttribute('x', r.x + 6); t.setAttribute('y', r.y + 14);
      t.setAttribute('class', 'rl' + (armed ? ' armed' : ''));
      t.textContent = r.label;
      svg.appendChild(t);
    }
    if(armed){
      const c = document.createElementNS(ns, 'circle');
      c.setAttribute('cx', r.x + r.w - 8); c.setAttribute('cy', r.y + 9);
      c.setAttribute('r', 3); c.setAttribute('class', 'pin');
      svg.appendChild(c);
    }
  }
  return svg;
}

function floorLabel(text){
  const d = el('div', 'floorlab', text);
  return d;
}

/* ---------- camera feed tile ---------- */

function feedTile(still, stamp, zoneLabel){
  const box = el('div', 'feed');
  const ns = el('div', 'ns', 'no signal');
  box.appendChild(ns);
  if(still){
    const img = new Image();
    img.alt = zoneLabel ? zoneLabel + ' capture' : 'camera capture';
    img.addEventListener('load', () => { ns.remove(); box.insertBefore(img, box.firstChild); });
    img.src = 'assets/feeds/' + still + '.jpg';
  }
  if(zoneLabel) box.appendChild(el('div', 'zone', zoneLabel));
  if(stamp) box.appendChild(el('div', 'stamp', stamp));
  return box;
}

/* ---------- screens ---------- */

function screenHome(){
  const wrap = document.createDocumentFragment();

  const st = el('div', 'card');
  const head = el('div', 'card-head');
  head.appendChild(el('h2', null, 'Property'));
  head.appendChild(el('span', 'chip', S.armed.length + ' of ' + HOUSE.slots + ' sensors'));
  st.appendChild(head);
  const body = el('div', 'card-pad');
  const row = el('div', 'status');
  row.appendChild(el('span', 'dot ' + (S.armed.length ? 'on' : 'warn')));
  row.appendChild(el('span', null, S.armed.length ? 'Monitoring active' : 'No sensors selected'));
  body.appendChild(row);
  body.appendChild(el('div', 'muted', HOUSE.address));
  st.appendChild(body);
  st.appendChild(floorLabel('Ground floor'));
  st.appendChild(planSvg('ground'));
  st.appendChild(floorLabel('Upper floor'));
  st.appendChild(planSvg('upper'));
  wrap.appendChild(st);

  const locks = el('div', 'card');
  const lh = el('div', 'card-head'); lh.appendChild(el('h2', null, 'Doors')); locks.appendChild(lh);
  const lr = el('div', 'rows');
  for(const L of HOUSE.locks){
    const r = el('div', 'row');
    const g = el('div', 'grow');
    g.appendChild(el('div', 'lab', L.label));
    g.appendChild(el('div', 'sub', S.locks[L.id] ? 'Locked' : 'Unlocked'));
    r.appendChild(g);
    const sw = el('div', 'sw');
    sw.setAttribute('role', 'switch');
    sw.setAttribute('tabindex', '0');
    sw.setAttribute('aria-label', L.label);
    sw.setAttribute('aria-checked', S.locks[L.id] ? 'true' : 'false');
    sw.addEventListener('click', () => { S.locks[L.id] = !S.locks[L.id]; save(); render(); });
    r.appendChild(sw);
    lr.appendChild(r);
  }
  locks.appendChild(lr);
  wrap.appendChild(locks);

  const sens = el('div', 'card');
  const sh = el('div', 'card-head');
  sh.appendChild(el('h2', null, 'Sensors'));
  sh.appendChild(el('span', 'chip', (HOUSE.slots - S.armed.length) + ' slots free'));
  sens.appendChild(sh);
  const sr = el('div', 'rows');
  for(const z of HOUSE.zones){
    const on = S.armed.includes(z.id);
    const full = S.armed.length >= HOUSE.slots && !on;
    const r = el('div', 'row');
    const g = el('div', 'grow');
    g.appendChild(el('div', 'lab', z.label));
    g.appendChild(el('div', 'sub', (z.kind === 'camera' ? 'Camera' : 'Motion sensor') + (full ? ' · no slots free' : '')));
    if(full) g.style.opacity = '.45';
    r.appendChild(g);
    const sw = el('div', 'sw');
    sw.setAttribute('role', 'switch');
    sw.setAttribute('tabindex', '0');
    sw.setAttribute('aria-label', z.label);
    sw.setAttribute('aria-checked', on ? 'true' : 'false');
    if(full) sw.style.opacity = '.4';
    sw.addEventListener('click', () => {
      if(on) S.armed = S.armed.filter(x => x !== z.id);
      else if(S.armed.length < HOUSE.slots) S.armed.push(z.id);
      save(); render();
    });
    r.appendChild(sw);
    sr.appendChild(r);
  }
  sens.appendChild(sr);
  wrap.appendChild(sens);

  const done = S.night > NIGHTS.length;
  const waiting = !done && Date.now() < (S.nextNightAt || 0);
  const go = el('button', 'btn primary',
    done ? 'No further nights scheduled'
         : waiting ? 'Next window opens in ' + untilText(S.nextNightAt - Date.now())
                   : 'Set away mode');
  go.disabled = done || waiting;
  go.addEventListener('click', confirmAway);
  wrap.appendChild(go);

  const hint = el('div', 'dim');
  hint.style.fontSize = '12px';
  hint.style.textAlign = 'center';
  hint.textContent = waiting
    ? 'Away mode runs overnight. The next monitoring window opens this evening.'
    : 'Away mode disables live view until you return.';
  wrap.appendChild(hint);
  return wrap;
}

function screenActivity(){
  const wrap = document.createDocumentFragment();
  if(!S.log.length){
    const c = el('div', 'card');
    const p = el('div', 'card-pad');
    p.appendChild(el('div', 'muted', 'No activity recorded yet.'));
    c.appendChild(p);
    wrap.appendChild(c);
    return wrap;
  }
  for(const grp of S.log){
    const c = el('div', 'card');
    const h = el('div', 'card-head');
    h.appendChild(el('h2', null, grp.date));
    h.appendChild(el('span', 'chip', grp.entries.length + (grp.entries.length === 1 ? ' event' : ' events')));
    c.appendChild(h);
    if(!grp.entries.length){
      const p = el('div', 'card-pad');
      p.appendChild(el('div', 'muted', 'No activity recorded.'));
      c.appendChild(p);
    }
    for(const e of grp.entries){
      const it = el('div', 'logitem' + (e.alert ? ' alert' : ''));
      it.appendChild(el('div', 't mono', e.t));
      const tx = el('div', 'txt');
      tx.appendChild(el('div', null, e.text));
      if(e.meta) tx.appendChild(el('div', 'meta', e.meta));
      if(e.still){
        const f = feedTile(e.still, grp.date + '  ' + e.t, e.zoneLabel);
        f.style.marginTop = '8px';
        tx.appendChild(f);
      }
      it.appendChild(tx);
      c.appendChild(it);
    }
    if(grp.unmonitored){
      const p = el('div', 'card-pad');
      p.style.fontSize = '12px';
      p.appendChild(el('div', 'dim', grp.unmonitored + ' zones were not monitored during this period.'));
      c.appendChild(p);
    }
    wrap.appendChild(c);
  }
  return wrap;
}

function lastStillFor(zoneId){
  for(const g of S.log){
    for(const e of g.entries){
      if(e.zone === zoneId && e.still) return { still:e.still, t:e.t, date:g.date };
    }
  }
  return null;
}

/* The camera list is not the same thing as the sensor list. Cameras 07 and 08
   are not the player's and never consume an arming slot - they report whether
   they were asked to or not. */
function feedList(){
  const out = HOUSE.zones.filter(z => z.kind === 'camera')
    .map(z => ({ id:z.id, label:z.label, code:null }));
  if(S.flags.cam07) out.push({ id:'cam07', label:'Unknown', code:'CAM 07', still:S.flags.cam07State || 'room_a' });
  if(S.flags.cam08) out.push({ id:'cam08', label:'Local',   code:'CAM 08', still:S.flags.cam08State || 'local_a' });
  return out;
}

function selectCam(i){
  const feeds = feedList();
  S.camIndex = (i + feeds.length) % feeds.length;
  S.camSwitches++;
  save();
  render();
}

function screenCameras(){
  const wrap = document.createDocumentFragment();
  const feeds = feedList();
  if(S.camIndex >= feeds.length) S.camIndex = 0;
  const cam = feeds[S.camIndex];
  const last = cam.still ? null : lastStillFor(cam.id);
  const still = cam.still || (last && last.still);

  const card = el('div', 'card');
  const big = feedTile(still, last ? last.date + '  ' + last.t : '', cam.code || cam.label);
  big.style.borderRadius = '0';
  card.appendChild(big);

  const nav = el('div', 'camnav');
  const prev = el('button', 'navbtn', '‹');
  prev.setAttribute('aria-label', 'Previous camera');
  prev.addEventListener('click', () => selectCam(S.camIndex - 1));
  const mid = el('div', 'grow');
  mid.appendChild(el('div', 'lab', cam.code ? cam.code + ' — ' + cam.label.toLowerCase() : cam.label));
  mid.appendChild(el('div', 'sub', still ? (last ? 'Last capture ' + last.date : 'Last capture') : 'No captures'));
  mid.style.textAlign = 'center';
  const next = el('button', 'navbtn', '›');
  next.setAttribute('aria-label', 'Next camera');
  next.addEventListener('click', () => selectCam(S.camIndex + 1));
  nav.appendChild(prev); nav.appendChild(mid); nav.appendChild(next);
  card.appendChild(nav);
  wrap.appendChild(card);

  const chips = el('div', 'camchips');
  feeds.forEach((f, i) => {
    const c = el('button', 'chip' + (i === S.camIndex ? ' sel' : ''), f.code || f.label);
    c.addEventListener('click', () => selectCam(i));
    chips.appendChild(c);
  });
  wrap.appendChild(chips);

  const note = el('div', 'dim');
  note.style.fontSize = '12px';
  note.style.textAlign = 'center';
  note.textContent = 'Live view is unavailable in away mode. Showing last capture.';
  wrap.appendChild(note);
  return wrap;
}

function screenSettings(){
  const wrap = document.createDocumentFragment();
  const mk = (lab, sub) => {
    const r = el('div', 'row');
    const g = el('div', 'grow');
    g.appendChild(el('div', 'lab', lab));
    g.appendChild(el('div', 'sub', sub));
    r.appendChild(g);
    return r;
  };

  const c = el('div', 'card');
  const h = el('div', 'card-head'); h.appendChild(el('h2', null, 'Account')); c.appendChild(h);
  const rows = el('div', 'rows');
  rows.appendChild(mk('Property', HOUSE.address));
  rows.appendChild(mk('Plan', 'Hearthwatch Basic · 3 active sensors'));
  rows.appendChild(mk('Devices paired', String(HOUSE.zones.length + (S.flags.extraRoom ? 1 : 0))));
  rows.appendChild(mk('Account holder', S.name || '—'));
  c.appendChild(rows);
  wrap.appendChild(c);

  const d = el('div', 'card');
  const dh = el('div', 'card-head'); dh.appendChild(el('h2', null, 'Data')); d.appendChild(dh);
  const dp = el('div', 'card-pad');
  const b = el('button', 'btn ghost', 'Reset monitoring history');
  b.addEventListener('click', () => {
    openSheet('Reset history?', 'This clears all recorded activity and returns the account to its first night.', [
      { label:'Reset', cls:'btn', act:() => { S = fresh(); save(); closeSheet(); tab = 'home'; render(); } },
      { label:'Cancel', cls:'btn ghost', act:closeSheet }
    ]);
  });
  dp.appendChild(b);
  d.appendChild(dp);
  wrap.appendChild(d);
  return wrap;
}

/* ---------- first launch ---------- */

function screenSetup(){
  const wrap = document.createDocumentFragment();
  const c = el('div', 'card');
  const p = el('div', 'card-pad');
  p.appendChild(el('div', 'setup-h', 'Finish setting up'));
  p.appendChild(el('div', 'muted', 'This name appears on the account and on alerts sent from the property.'));

  const inp = document.createElement('input');
  inp.type = 'text';
  inp.id = 'nameInput';
  inp.className = 'field';
  inp.maxLength = 24;
  inp.autocomplete = 'off';
  inp.placeholder = 'Account holder';
  inp.setAttribute('aria-label', 'Account holder name');
  p.appendChild(inp);

  const err = el('div', 'fielderr');
  err.id = 'nameErr';
  err.hidden = true;
  p.appendChild(err);

  const go = el('button', 'btn primary', 'Continue');
  go.style.marginTop = '14px';
  go.addEventListener('click', () => {
    const v = inp.value.trim();
    if(!v){
      err.textContent = 'Enter a name to continue.';
      err.hidden = false;
      inp.focus();
      return;
    }
    S.name = v;
    save();
    render();
  });
  inp.addEventListener('input', () => { err.hidden = true; });
  inp.addEventListener('keydown', e => { if(e.key === 'Enter') go.click(); });
  p.appendChild(go);

  const note = el('div', 'dim');
  note.style.fontSize = '12px';
  note.style.marginTop = '12px';
  note.textContent = 'Stored on this device only.';
  p.appendChild(note);

  c.appendChild(p);
  wrap.appendChild(c);
  return wrap;
}

/* ---------- night resolution ---------- */

function confirmAway(){
  if(S.night > NIGHTS.length) return;
  const unlocked = HOUSE.locks.filter(l => !S.locks[l.id]).map(l => l.label.toLowerCase());
  const warn = unlocked.length ? 'Unlocked: ' + unlocked.join(', ') + '. ' : '';
  openSheet('Set away mode',
    warn + S.armed.length + ' of ' + HOUSE.zones.length + ' zones will be monitored until morning. This cannot be changed once away mode begins.',
    [ { label:'Set away mode', cls:'btn primary', act:() => { closeSheet(); runNight(); } },
      { label:'Not yet', cls:'btn ghost', act:closeSheet } ]);
}

function runNight(){
  if(busy) return;
  busy = true;
  const n = NIGHTS[S.night - 1];
  const scr = document.getElementById('screen');
  scr.innerHTML = '';
  const panel = el('div', 'night');
  const big = el('div', 'big', 'Away mode active');
  const sm = el('div', 'sm', n.date + ' · monitoring ' + S.armed.length + ' zones');
  panel.appendChild(big);
  panel.appendChild(sm);
  scr.appendChild(panel);

  setTimeout(() => { big.textContent = 'Monitoring'; sm.textContent = '00:00 — 06:00'; }, 1400);
  setTimeout(() => { resolveNight(); busy = false; tab = 'activity'; render(); showMorning(); }, 3000);
}

function resolveNight(){
  const n = NIGHTS[S.night - 1];
  const entries = [];
  for(const ev of n.events){
    if(ev.effect) ev.effect(S);
    const visible = ev.contact || ev.always || S.armed.includes(ev.zone);
    if(!visible) continue;
    const z = zoneById(ev.zone);
    entries.push({ t:ev.t, text:ev.text, meta:ev.meta || ev.note || null, still:ev.still || null,
                   zone:ev.zone || null, zoneLabel:z ? z.label : null, alert:!!ev.always });
  }
  if(n.onResolve) n.onResolve(S);
  advanceMessageNight(n.day);
  const unmonitored = HOUSE.zones.length - S.armed.length;
  S.log.unshift({ date:n.date, day:n.day, entries, unmonitored });
  S.lastSummary = { date:n.date, count:entries.length, unmonitored, note:MORNINGS[n.day] || '' };
  S.night++;
  S.armed = [];
  S.nextNightAt = Date.now() + NIGHT_COOLDOWN;
  save();
}

function showMorning(){
  const m = S.lastSummary;
  if(!m) return;
  const body = m.count === 0
    ? 'No activity was recorded overnight. ' + m.unmonitored + ' zones were not monitored.'
    : m.count + ' event' + (m.count === 1 ? '' : 's') + ' recorded overnight. ' + m.unmonitored + ' zones were not monitored.';
  openSheet('Good morning', body + (m.note ? ' ' + m.note : ''),
    [{ label:'View activity', cls:'btn primary', act:closeSheet }]);
}

/* ---------- sheet ---------- */

function openSheet(title, body, actions){
  const card = document.getElementById('sheetCard');
  card.innerHTML = '';
  card.appendChild(el('h3', null, title));
  card.appendChild(el('p', null, body));
  const box = el('div', 'sheet-actions');
  for(const a of actions){
    const b = el('button', a.cls || 'btn', a.label);
    b.addEventListener('click', a.act);
    box.appendChild(b);
  }
  card.appendChild(box);
  document.getElementById('sheet').hidden = false;
}
function closeSheet(){ document.getElementById('sheet').hidden = true; }

/* ---------- shell ---------- */

const TITLES = { home:'Home', activity:'Activity', cameras:'Cameras', messages:'Messages', settings:'Settings' };

function render(){
  const setup = !S.name;
  document.getElementById('tabs').hidden = setup;
  if(setup){
    document.getElementById('barTitle').textContent = 'Hearthwatch';
    document.getElementById('barSub').textContent = HOUSE.address;
    const scr0 = document.getElementById('screen');
    scr0.innerHTML = '';
    scr0.appendChild(screenSetup());
    const f = document.getElementById('nameInput');
    if(f) f.focus();
    return;
  }
  document.getElementById('barTitle').textContent = TITLES[tab];
  const sub = document.getElementById('barSub');
  if(tab === 'home') sub.textContent = S.night > NIGHTS.length ? HOUSE.address : 'Night ' + S.night + ' · ' + NIGHTS[S.night - 1].date;
  else if(tab === 'activity') sub.textContent = S.log.length ? 'Last 7 days' : '';
  else if(tab === 'cameras') sub.textContent = feedList().length + ' cameras online';
  else if(tab === 'messages') sub.textContent = CONTACT.name;
  else sub.textContent = '';

  const scr = document.getElementById('screen');
  scr.innerHTML = '';
  scr.appendChild(
    tab === 'home' ? screenHome() :
    tab === 'activity' ? screenActivity() :
    tab === 'cameras' ? screenCameras() :
    tab === 'messages' ? screenMessages() : screenSettings()
  );
  for(const b of document.querySelectorAll('.tab')) b.classList.toggle('sel', b.dataset.tab === tab);
  const selChip = document.querySelector('.camchips .sel');
  if(selChip) selChip.scrollIntoView({ block:'nearest', inline:'center' });
  const badge = document.getElementById('msgBadge');
  if(badge) badge.hidden = !(tab !== 'messages' && unreadMessages());
  if(tab === 'messages') openMessages();
  window.scrollTo(0, 0);
}

document.addEventListener('DOMContentLoaded', () => {
  load();
  for(const b of document.querySelectorAll('.tab')){
    b.addEventListener('click', () => { if(busy) return; tab = b.dataset.tab; render(); });
  }
  document.getElementById('sheet').addEventListener('click', e => { if(e.target.id === 'sheet') closeSheet(); });
  render();
});
