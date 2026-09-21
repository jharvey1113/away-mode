/* The owner thread.

   Lives INSIDE Hearthwatch as a property-contact thread. It never impersonates
   the phone's own Messages app.

   Maya is never frightened and never dramatic. Everything she says is mundane
   and factual. The contradictions do the work. */

const CONTACT = { name: 'Maya R.', sub: 'Property owner' };

/* A choice carries its own reply, so what she says back actually follows from
   what you said. Beats in `say` run before the script continues. */
const MSG = {
  1: [
    { from:'maya', mins:1, t:'20:56', text:'Hi {name} — thanks again for watching the place this week. Me and Daniel land Sunday night.' },
    { from:'maya', mins:1, t:'20:57', text:'Daniel’s my husband. He set the cameras up and then immediately stopped checking them, so.' },
    { from:'maya', mins:2, t:'21:12', text:'App says motion out front. Can you look?' },
    { choices:[
      { text:'A package on the step.', say:[
        { from:'maya', mins:2, t:'21:14', text:'Oh good. Daniel ordered something and wouldn’t tell me what. Leave it, it’s fine out there.' }]},
      { text:'Nothing there.', say:[
        { from:'maya', mins:2, t:'21:14', text:'Huh. It does that with the neighbour’s cat sometimes. Ignore it.' },
        { from:'maya', mins:3, t:'21:18', text:'Although Daniel says he ordered something, so maybe look again tomorrow.' }]},
      { text:'I haven’t looked yet.', say:[
        { from:'maya', mins:2, t:'21:15', text:'No rush. Whenever you get a sec.' }]}
    ]},
    { from:'maya', mins:9, t:'21:24', text:'Sorry, last thing — the kitchen one went off too. This system was such a good investment lol' }
  ],

  2: [
    { from:'maya', mins:4, t:'08:02', text:'Anything overnight?' },
    { choices:[
      { text:'A few motion alerts.', say:[
        { from:'maya', mins:3, t:'08:06', text:'Yeah it does that when the heat kicks on. Daniel keeps saying he’ll turn the sensitivity down.' }]},
      { text:'Quiet.', say:[
        { from:'maya', mins:3, t:'08:05', text:'Good. Thank you for checking.' }]}
    ]}
  ],

  3: [
    { choices:[
      { text:'Is anyone stopping by the house?', say:[
        { from:'maya', mins:9, t:'22:31', text:'No. Why?', wait:2600 }]},
      { text:'Everything looks normal.', say:[
        { from:'maya', mins:4, t:'22:26', text:'Perfect. Sorry to make you do this every night.' }]}
    ]}
  ],

  4: [
    { from:'maya', mins:5, t:'23:41', text:'Daniel wants to know if the garage door has been shut the whole time. He can’t remember closing it.' },
    { choices:[
      { text:'It’s been shut.', say:[
        { from:'maya', mins:3, t:'23:45', text:'Told him. Thanks.' }]},
      { text:'What’s through the door in the utility room?', say:[
        { from:'maya', mins:6, t:'23:48', text:'The garage.', wait:1800 },
        { from:'maya', mins:2, t:'23:48', text:'Wait which door?', wait:2200 },
        { from:'maya', mins:14, text:'', wait:5200, stutter:true },
        { from:'maya', mins:1, t:'23:51', text:'There isn’t a door there.' }]}
    ]}
  ]
};

/* What Maya says when you report a camera from the morning review. */
const REPORTS = {
  porch:   [{ from:'maya', mins:3, text:'That’s the package. Daniel finally admitted it’s a birdfeeder.' }],
  entry:   [{ from:'maya', mins:5, text:'The coats? We left in a hurry, that’s probably us.' },
            { from:'maya', mins:4, text:'Although the closet was shut when we locked up. I’m fairly sure.' }],
  kitchen: [{ from:'maya', mins:4, text:'Which cabinet? Daniel leaves the one over the kettle open constantly.' },
            { from:'maya', mins:6, text:'He says he didn’t this time, but he said that last time too.' }],
  living:  [{ from:'maya', mins:7, text:'Nothing should be on the floor in there. We had it cleaned before we left.' }],
  utility: [{ from:'maya', mins:8, text:'That room should be completely empty. What are you seeing?' }],
  hall_up: [{ from:'maya', mins:6, text:'All of those doors were shut. I did them myself.' }]
};

/* ---------- state ---------- */

let msgBusy = false;
let msgTimer = null;

function msgState(){
  if(!S.msg) S.msg = { night:0, idx:0, log:[], dueAt:0, queue:[] };
  if(!S.msg.queue) S.msg.queue = [];
  return S.msg;
}

/* How long Maya takes to answer, in real minutes. She is a person with a life,
   not a chatbot, and the wait is most of what sells her. */
function beatDelay(beat){
  const mins = beat.mins != null ? beat.mins : 5;
  return mins * MINUTE;
}

function nextBeat(){
  const m = msgState();
  if(m.queue.length) return m.queue[0];
  return (MSG[m.night] || [])[m.idx];
}

function consumeBeat(){
  const m = msgState();
  if(m.queue.length) m.queue.shift();
  else m.idx++;
  m.dueAt = 0;
  save();
}

/* ---------- rendering ---------- */

function bubble(m){
  const row = el('div', 'mrow ' + (m.from === 'you' ? 'me' : 'them'));
  row.appendChild(el('div', 'bub', nameFill(m.text)));
  if(m.t) row.appendChild(el('div', 'mtime', m.t));
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
  head.appendChild(el('div', 'avatar', CONTACT.name.charAt(0)));
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
  const beat = nextBeat();

  if(beat && beat.choices && !msgBusy){
    const sug = el('div', 'suggest');
    for(const c of beat.choices){
      const label = typeof c === 'string' ? c : c.text;
      const b = el('button', 'sugbtn', label);
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

function clockNow(){
  const d = new Date();
  const h = d.getHours() % 12 || 12;
  return h + ':' + String(d.getMinutes()).padStart(2, '0');
}

function pushMine(text){
  const m = msgState();
  m.log.push({ from:'you', text:text, t:clockNow() });
  save();
  const t = document.getElementById('thread');
  if(t) t.appendChild(bubble(m.log[m.log.length - 1]));
  scrollThread();
}

function sendReply(choice){
  const m = msgState();
  const text = typeof choice === 'string' ? choice : choice.text;
  pushMine(text);
  const say = (typeof choice === 'object' && choice.say) ? choice.say : [];
  consumeBeat();
  m.queue = say.concat(m.queue);
  save();
  paintComposer();
  runMessages();
}

/* Called from the morning review when the player reports a camera. */
function queueReport(cam, grp){
  const m = msgState();
  pushMine('[Photo — ' + cam.label.toLowerCase() + ', ' + grp.date + '] Something’s different here.');
  m.queue = m.queue.concat(REPORTS[cam.id] || [
    { from:'maya', mins:5, text:'Thanks for flagging. I’ll ask Daniel.' }
  ]);
  save();
  runMessages();
}

/* Deliver beats until we hit a choice or run dry. */
function runMessages(){
  if(msgBusy) return;
  const m = msgState();
  const beat = nextBeat();
  if(!beat || beat.choices){ paintComposer(); return; }

  if(!m.dueAt){ m.dueAt = Date.now() + beatDelay(beat); save(); }
  if(Date.now() < m.dueAt){ paintComposer(); return; }

  msgBusy = true;
  paintComposer();
  const t = document.getElementById('thread');
  const typing = typingRow();
  if(t){ t.appendChild(typing); scrollThread(); }

  const hold = beat.wait || (900 + (beat.text || '').length * 22);

  /* A stutter beat is the indicator starting, stopping and restarting with
     nothing delivered. It carries more than any line would. */
  if(beat.stutter){
    setTimeout(() => { typing.style.visibility = 'hidden'; }, hold * 0.45);
    setTimeout(() => { typing.style.visibility = 'visible'; }, hold * 0.72);
  }

  setTimeout(() => {
    typing.remove();
    msgBusy = false;
    if(beat.text){
      m.log.push({ from:'maya', text:beat.text, t:beat.t });
      const box = document.getElementById('thread');
      if(box) box.appendChild(bubble(m.log[m.log.length - 1]));
      scrollThread();
    }
    consumeBeat();
    runMessages();
  }, hold);
}

function openMessages(){
  const m = msgState();
  if(m.night < 1){ m.night = 1; m.idx = 0; m.dueAt = 0; save(); }
  paintComposer();
  scrollThread();
  runMessages();
  clearInterval(msgTimer);
  msgTimer = setInterval(() => {
    if(tab !== 'messages'){ clearInterval(msgTimer); msgTimer = null; return; }
    runMessages();
  }, 1500);
}

function advanceMessageNight(night){
  const m = msgState();
  if(MSG[night] && m.night !== night){
    m.night = night;
    m.idx = 0;
    m.dueAt = 0;
    save();
  }
}

function unreadMessages(){
  const m = msgState();
  const beat = nextBeat();
  if(!beat) return false;
  if(beat.choices) return true;
  return !!m.dueAt && Date.now() >= m.dueAt;
}
