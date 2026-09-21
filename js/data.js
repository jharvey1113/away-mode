const HOUSE = {
  address: '14 Pell Lane',
  slots: 3,
  lockSlots: 2,
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

/* THE GAME
   Maya and Daniel land Sunday. Six nights.

   Two decisions a night, both constrained:
     - 3 of 10 sensors, which buys the motion LOG around the evidence
     - 2 of 3 locks, because the plan only holds two deadbolts at once

   Every night it tests one door. Lock that door and it is held outside, and in
   the morning you see the outside of that door. Leave it and it gets further
   in, and REACH goes up. Reach never comes back down.

   Which door it will try is never stated. It is inferable from the previous
   night's evidence, which is the entire reason to study the frames. */

const REACH = [
  { id:0, label:'Perimeter',    note:'Nothing has come past the property line.' },
  { id:1, label:'Front porch',  note:'Something has been at the door.' },
  { id:2, label:'Entry',        note:'Something has been inside the entry.' },
  { id:3, label:'Ground floor', note:'It has moved through the ground floor.' },
  { id:4, label:'Upper floor',  note:'It has been upstairs.' },
  { id:5, label:'Unmapped',     note:'It is somewhere the floor plan does not show.' }
];

const REACH_ZONES = [[], ['porch'], ['entry'], ['kitchen','living','dining','stairs'],
                     ['hall_up','bed_back'], ['ghost']];

/* Feed names that are clips rather than stills. An animated .webp or .gif just
   works in the normal img slot; list a name here to render it as <video>. */
const VIDEO_FEEDS = [];

const NIGHTS = [
  { day:1, date:'Tue 4 Nov', allZones:true, probe:null,
    captures:{ porch:'porch_b', entry:'entry_a', kitchen:'kitchen_a', living:'living_a', utility:'utility_a', hall_up:'hall_a' },
    anomaly:'porch',
    events:[
      { t:'21:23', zone:'kitchen', text:'Motion detected — kitchen' },
      { t:'21:41', zone:'yard',    text:'Motion detected — side yard' },
      { t:'23:08', zone:'porch',   text:'Motion detected — front porch' },
      { t:'05:14', zone:'stairs',  text:'Motion detected — stairs' }
    ]},

  { day:2, date:'Wed 5 Nov', probe:'front',
    blocked:{
      captures:{ porch:'porch_a', entry:'entry_a', kitchen:'kitchen_a', living:'living_a', utility:'utility_a', hall_up:'hall_a' },
      anomaly:null,
      events:[
        { t:'02:11', contact:true, text:'Front door handle turned', meta:'Deadbolt engaged — no entry' },
        { t:'02:11', zone:'porch', text:'Motion detected — front porch' },
        { t:'02:38', zone:'yard',  text:'Motion detected — side yard' } ]},
    open:{
      captures:{ porch:'porch_c', entry:'entry_b', kitchen:'kitchen_a', living:'living_a', utility:'utility_a', hall_up:'hall_a' },
      anomaly:'entry',
      events:[
        { t:'02:11', contact:true, text:'Front door opened', meta:'No forced entry detected' },
        { t:'02:12', zone:'entry', text:'Motion detected — entry' },
        { t:'02:14', contact:true, text:'Front door closed' } ]}
  },

  { day:3, date:'Thu 6 Nov', probe:'back',
    blocked:{
      captures:{ porch:'porch_a', entry:'entry_a', kitchen:'kitchen_a', living:'living_a', utility:'utility_a', hall_up:'hall_a' },
      anomaly:null,
      events:[
        { t:'01:52', contact:true, text:'Back door handle turned', meta:'Deadbolt engaged — no entry' },
        { t:'02:40', zone:'yard',  text:'Motion detected — side yard' } ]},
    open:{
      captures:{ porch:'porch_a', entry:'entry_a', kitchen:'kitchen_b', living:'living_b', utility:'utility_a', hall_up:'hall_a' },
      anomaly:'kitchen',
      events:[
        { t:'01:52', contact:true, text:'Back door opened' },
        { t:'01:55', zone:'kitchen', text:'Motion detected — kitchen' },
        { t:'02:31', zone:'living',  text:'Motion detected — living room' } ]}
  },

  { day:4, date:'Fri 7 Nov', probe:'garage',
    blocked:{
      captures:{ porch:'porch_a', entry:'entry_a', kitchen:'kitchen_a', living:'living_a', utility:'utility_b', hall_up:'hall_a' },
      anomaly:'utility',
      events:[
        { t:'03:12', contact:true, text:'Garage door handle turned', meta:'Deadbolt engaged — no entry' },
        { t:'03:12', contact:true, text:'Utility door opened', meta:'Interior contact — always monitored' },
        { t:'03:19', zone:'utility', text:'Motion detected — utility' } ]},
    open:{
      captures:{ porch:'porch_a', entry:'entry_a', kitchen:'kitchen_c', living:'living_c', utility:'utility_b', hall_up:'hall_b' },
      anomaly:'hall_up',
      events:[
        { t:'03:12', contact:true, text:'Garage door opened' },
        { t:'03:14', zone:'utility', text:'Motion detected — utility' },
        { t:'03:48', zone:'stairs',  text:'Motion detected — stairs' } ]}
  },

  /* From here the locks stop being the whole answer. It is already using a way
     in the plan does not account for, and the player watches that happen. */
  { day:5, date:'Sat 8 Nov', probe:'none',
    onResolve: s => { s.flags.extraRoom = true; },
    blocked:{
      captures:{ porch:'porch_a', entry:'entry_a', kitchen:'kitchen_a', living:'living_a', utility:'utility_c', hall_up:'hall_c' },
      anomaly:'hall_up',
      events:[
        { t:'02:58', zone:'__unmapped', text:'Motion detected — unmapped zone', always:true,
          meta:'Sensor ID 0011 — not present in floor plan' },
        { t:'03:04', contact:true, text:'Utility door opened', meta:'All exterior doors remained secure' },
        { t:'03:40', zone:'hall_up', text:'Motion detected — upstairs hall' } ]},
    open:{
      captures:{ porch:'porch_a', entry:'entry_c', kitchen:'kitchen_a', living:'living_a', utility:'utility_c', hall_up:'hall_c' },
      anomaly:'hall_up',
      events:[
        { t:'02:58', zone:'__unmapped', text:'Motion detected — unmapped zone', always:true,
          meta:'Sensor ID 0011 — not present in floor plan' },
        { t:'03:40', zone:'hall_up', text:'Motion detected — upstairs hall' } ]}
  },

  { day:6, date:'Sun 9 Nov', probe:'none', last:true,
    blocked:{
      captures:{ porch:'porch_a', entry:'entry_a', kitchen:'kitchen_a', living:'living_a', utility:'utility_a', hall_up:'hall_a' },
      anomaly:null,
      events:[
        { t:'23:58', contact:true, text:'Away mode disabled', meta:'Reason: home detected', always:true } ]},
    open:{
      captures:{ porch:'porch_a', entry:'entry_a', kitchen:'kitchen_a', living:'living_a', utility:'utility_a', hall_up:'hall_a' },
      anomaly:null,
      events:[
        { t:'23:58', contact:true, text:'Away mode disabled', meta:'Reason: home detected', always:true } ]}
  }
];

/* The frame each camera showed on night one, for the compare-to-baseline hold. */
const BASELINE = { porch:'porch_a', entry:'entry_a', kitchen:'kitchen_a',
                   living:'living_a', utility:'utility_a', hall_up:'hall_a' };

const MORNINGS = {
  1:'Your trial period has ended. Your plan now covers 3 sensors and 2 locks.',
  2:'',
  3:'',
  4:'',
  5:'Your floor plan has been updated to match detected devices.',
  6:''
};
