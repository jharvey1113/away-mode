const HOUSE = {
  address: '14 Pell Lane',
  slots: 3,
  zones: [
    { id:'porch',    label:'Front porch',   kind:'camera', plan:'ground' },
    { id:'entry',    label:'Entry',         kind:'camera', plan:'ground' },
    { id:'kitchen',  label:'Kitchen',       kind:'camera', plan:'ground' },
    { id:'living',   label:'Living room',   kind:'camera', plan:'ground' },
    { id:'utility',  label:'Utility',       kind:'camera', plan:'ground' },
    { id:'hall_up',  label:'Upstairs hall', kind:'camera', plan:'upper'  },
    { id:'stairs',   label:'Stairs',        kind:'motion', plan:'ground' },
    { id:'dining',   label:'Dining',        kind:'motion', plan:'ground' },
    { id:'yard',     label:'Side yard',     kind:'motion', plan:'ground' },
    { id:'bed_back', label:'Back bedroom',  kind:'motion', plan:'upper'  }
  ],
  locks: [
    { id:'front',  label:'Front door'  },
    { id:'back',   label:'Back door'   },
    { id:'garage', label:'Garage door' }
  ]
};

const ROOMS = {
  ground: { vb:'0 40 300 266', vbGhost:'0 0 300 306', items:[
    { zone:'ghost',   x:94,  y:14,  w:56,  h:34, label:'',             ghost:true },
    { zone:'garage',  x:10,  y:54,  w:76,  h:82, label:'Garage' },
    { zone:'utility', x:94,  y:54,  w:56,  h:52, label:'Utility' },
    { zone:'kitchen', x:158, y:54,  w:130, h:82, label:'Kitchen' },
    { zone:'living',  x:10,  y:144, w:108, h:72, label:'Living' },
    { zone:'stairs',  x:126, y:144, w:32,  h:72, label:'Stairs' },
    { zone:'dining',  x:166, y:144, w:122, h:72, label:'Dining' },
    { zone:'yard',    x:10,  y:224, w:108, h:42, label:'Side yard', out:true },
    { zone:'entry',   x:126, y:224, w:162, h:42, label:'Entry' },
    { zone:'porch',   x:180, y:274, w:108, h:24, label:'Porch', out:true }
  ]},
  upper: { vb:'0 0 300 140', items:[
    { zone:'bed_back', x:10,  y:14, w:128, h:58, label:'Back bedroom' },
    { zone:'bath',     x:146, y:14, w:58,  h:58, label:'Bath' },
    { zone:'bed_front',x:212, y:14, w:76,  h:98, label:'Front bedroom' },
    { zone:'hall_up',  x:10,  y:80, w:194, h:32, label:'Upstairs hall' }
  ]}
};

/* Every camera captures every night. The stills ARE the game - gating them was
   the mistake. What the 3 slots buy you is the motion LOG: the timeline of when
   something moved and where. You always see the evidence, you choose how much
   of the story around it you get. */
const NIGHTS = [
  { day:1, date:'Tue 4 Nov',
    captures:{ porch:'porch_b', entry:'entry_a', kitchen:'kitchen_a', living:'living_a', utility:'utility_a', hall_up:'hall_a' },
    anomaly:'porch',
    events:[
      { t:'21:41', zone:'yard',    text:'Motion detected — side yard' },
      { t:'23:08', zone:'porch',   text:'Motion detected — front porch' },
      { t:'23:09', zone:'porch',   text:'Motion cleared — front porch' }
    ]},

  { day:2, date:'Wed 5 Nov',
    captures:{ porch:'porch_a', entry:'entry_a', kitchen:'kitchen_b', living:'living_a', utility:'utility_a', hall_up:'hall_a' },
    anomaly:'kitchen',
    events:[
      { t:'01:40', zone:'kitchen', text:'Motion detected — kitchen' },
      { t:'01:44', zone:'hall_up', text:'Motion detected — upstairs hall' },
      { t:'06:12', zone:'yard',    text:'Motion detected — side yard' }
    ]},

  { day:3, date:'Thu 6 Nov',
    captures:{ porch:'porch_a', entry:'entry_a', kitchen:'kitchen_a', living:'living_b', utility:'utility_a', hall_up:'hall_b' },
    anomaly:'hall_up',
    events:[
      { t:'02:21', zone:'hall_up', text:'Motion detected — upstairs hall', meta:'No prior zone triggered.' },
      { t:'03:02', zone:'stairs',  text:'Motion detected — stairs' },
      { t:'03:40', zone:'living',  text:'Motion detected — living room' }
    ]},

  { day:4, date:'Fri 7 Nov',
    captures:{ porch:'porch_a', entry:'entry_b', kitchen:'kitchen_c', living:'living_c', utility:'utility_b', hall_up:'hall_a' },
    anomaly:'utility',
    events:[
      { t:'03:12', contact:true,   text:'Utility door opened', meta:'Interior contact — always monitored' },
      { t:'03:12', zone:'utility', text:'Motion detected — utility' },
      { t:'03:19', contact:true,   text:'Utility door closed' },
      { t:'04:40', zone:'stairs',  text:'Motion detected — stairs' }
    ]},

  { day:5, date:'Sat 8 Nov',
    captures:{ porch:'porch_c', entry:'entry_c', kitchen:'kitchen_a', living:'living_a', utility:'utility_c', hall_up:'hall_c' },
    anomaly:'entry',
    onResolve: s => { s.flags.extraRoom = true; },
    events:[
      { t:'02:58', zone:'__unmapped', text:'Motion detected — unmapped zone', always:true,
        meta:'Sensor ID 0011 — not present in floor plan' },
      { t:'04:02', contact:true,   text:'Front door opened', meta:'No forced entry detected',
        effect:s => { s.flags.wasLocked = !!s.locks.front; } },
      { t:'04:03', contact:true,   text:'Front door closed' },
      { t:'04:41', zone:'entry',   text:'Motion detected — entry' }
    ]}
];

/* The frame each camera showed on night one, for the compare-to-baseline hold. */
const BASELINE = { porch:'porch_a', entry:'entry_a', kitchen:'kitchen_a',
                   living:'living_a', utility:'utility_a', hall_up:'hall_a' };

const MORNINGS = {
  1:'No action required.',
  2:'',
  3:'Sensor 0011 reported for the first time. Contact support if this device is unfamiliar.',
  4:'',
  5:'Your floor plan has been updated to match detected devices.'
};
