/* The owner thread.

   This lives INSIDE Hearthwatch as a property-contact thread. It never
   impersonates the phone's own Messages app - that breaks the moment anyone
   opens it on the wrong platform, and it violates the no-fake-system-UI rule.
   An in-app chat is plausible on every device and has nothing to fake.

   Maya is never frightened and never dramatic. Everything she says is mundane
   and factual. The contradictions do the work; if she gets scared, the game
   stops being about the player being alone. */

const CONTACT = { name: 'Maya R.', sub: 'Property owner' };

const MSG = {
  1: [
    { from:'maya', t:'21:12', text:'Sorry to bug you again. Camera says motion out front. Can you check?' },
    { choices:['Package.', 'Nothing there.'] },
    { from:'maya', t:'21:13', text:'👍 Thanks. That’s probably Daniel’s.' },
    { from:'maya', t:'21:24', text:'Kitchen one went off now.' },
    { from:'maya', t:'21:24', text:'This system was such a good investment lol' },
    { choices:['ok', 'I’ll keep an eye on it'] }
  ],

  2: [
    { from:'maya', t:'08:02', text:'Anything overnight?' },
    { choices:['A couple of motion alerts.', 'Nothing.'] },
    { from:'maya', t:'08:05', text:'Yeah it does that when the heat kicks on. Sorry.' }
  ],

  3: [
    { choices:['Is someone checking the house tonight?'] },
    { from:'maya', t:'22:31', text:'No. Why?', wait:2600 },
    { choices:['The kitchen cabinet was open.', 'Nothing. Forget it.'] },
    { from:'maya', t:'22:34', text:'Daniel probably left it. He does that.' }
  ],

  4: [
    { choices:['What’s through the door in the utility room?'] },
    { from:'maya', t:'23:48', text:'The garage.', wait:1800 },
    { from:'maya', t:'23:48', text:'Wait which door?', wait:2200 },
    { choices:['[Send photo — utility 03:12]'] },
    { from:'maya', text:'', wait:5200, stutter:true },
    { from:'maya', t:'23:51', text:'There isn’t a door there.' }
  ]
};

/* ---------- rendering ---------- */

let msgBusy = false;

function msgState(){
  if(!S.msg) S.msg = { night:0, idx:0, log:[] };
  return S.msg;
}

function bubble(m){
  const row = el('div', 'mrow ' + (m.from === 'you' ? 'me' : 'them'));
  const b = el('div', 'bub', m.text);
  row.appendChild(b);
  if(m.t){
    const t = el('div', 'mtime', m.t);
    row.appendChild(t);
  }
  return row;
}

function typingRow(){
  const row = el('div', 'mrow them');
  const b = el('div', 'bub typing');
  for(let i = 0; i < 3; i++) b.appendChild(el('span', 'dot' + i));
  row.appendChild(b);
  return row;
}

function screenMessages(){
  const wrap = document.createDocumentFragment();
  const m = msgState();

  const head = el('div', 'mhead');
  const av = el('div', 'avatar', CONTACT.name.charAt(0));
  head.appendChild(av);
  const hn = el('div', 'grow');
  hn.appendChild(el('div', 'lab', CONTACT.name));
  hn.appendChild(el('div', 'sub', CONTACT.sub));
  head.appendChild(hn);
  wrap.appendChild(head);

  const thread = el('div', 'thread');
  thread.id = 'thread';
  for(const line of m.log) thread.appendChild(bubble(line));
  wrap.appendChild(thread);

  const comp = el('div', 'composer');
  comp.id = 'composer';
  wrap.appendChild(comp);
  return wrap;
}

function paintComposer(){
  const comp = document.getElementById('composer');
  if(!comp) return;
  comp.innerHTML = '';
  const m = msgState();
  const beat = (MSG[m.night] || [])[m.idx];

  if(beat && beat.choices && !msgBusy){
    const sug = el('div', 'suggest');
    for(const c of beat.choices){
      const b = el('button', 'sugbtn', c);
      b.addEventListener('click', () => sendReply(c));
      sug.appendChild(b);
    }
    comp.appendChild(sug);
  }
  const bar = el('div', 'inputbar');
  bar.appendChild(el('div', 'fakeinput', 'Message'));
  bar.appendChild(el('div', 'sendico', '↑'));
  comp.appendChild(bar);
}

function scrollThread(){
  const t = document.getElementById('thread');
  if(t) t.scrollTop = t.scrollHeight;
  window.scrollTo(0, document.body.scrollHeight);
}

function sendReply(text){
  const m = msgState();
  m.log.push({ from:'you', text:text, t:clockNow() });
  m.idx++;
  save();
  const t = document.getElementById('thread');
  if(t) t.appendChild(bubble(m.log[m.log.length - 1]));
  paintComposer();
  scrollThread();
  runMessages();
}

function clockNow(){
  const d = new Date();
  const h = d.getHours() % 12 || 12;
  return h + ':' + String(d.getMinutes()).padStart(2, '0');
}

/* Deliver beats until we hit a choice or the end of the night's script. */
function runMessages(){
  if(msgBusy) return;
  const m = msgState();
  const script = MSG[m.night] || [];
  const beat = script[m.idx];
  if(!beat || beat.choices){ paintComposer(); return; }

  msgBusy = true;
  paintComposer();
  const t = document.getElementById('thread');
  const typing = typingRow();
  if(t){ t.appendChild(typing); scrollThread(); }

  const hold = beat.wait || (900 + beat.text.length * 22);

  /* A stutter beat is the typing indicator starting, stopping, and starting
     again with nothing delivered. It carries more than any line would. */
  if(beat.stutter){
    setTimeout(() => { typing.style.visibility = 'hidden'; }, hold * 0.45);
    setTimeout(() => { typing.style.visibility = 'visible'; }, hold * 0.72);
  }

  setTimeout(() => {
    typing.remove();
    msgBusy = false;
    if(beat.text){
      m.log.push({ from:'maya', text:beat.text, t:beat.t });
      save();
      if(t) t.appendChild(bubble(m.log[m.log.length - 1]));
      scrollThread();
    }
    m.idx++;
    save();
    runMessages();
  }, hold);
}

/* Called when the player opens the tab, and when a night resolves. */
function openMessages(){
  const m = msgState();
  if(m.night < 1){ m.night = 1; m.idx = 0; save(); }
  paintComposer();
  scrollThread();
  runMessages();
}

function advanceMessageNight(night){
  const m = msgState();
  if(MSG[night] && m.night !== night){
    m.night = night;
    m.idx = 0;
    save();
  }
}

function unreadMessages(){
  const m = msgState();
  const script = MSG[m.night] || [];
  const beat = script[m.idx];
  return !!beat;
}
