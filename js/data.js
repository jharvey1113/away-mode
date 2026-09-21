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

const NIGHTS = [
  { day:1, date:'Tue 4 Nov', brief:'First night on the account. Everything nominal.',
    events:[
      { t:'21:41', zone:'yard',    text:'Motion detected \u2014 side yard' },
      { t:'21:42', zone:'yard',    text:'Motion cleared \u2014 side yard' },
      { t:'23:08', zone:'porch',   text:'Motion detected \u2014 front porch', still:'porch_a' }
    ]},

  { day:2, date:'Wed 5 Nov', brief:'',
    events:[
      { t:'01:40', zone:'kitchen', text:'Motion detected \u2014 kitchen', still:'kitchen_b' },
      { t:'01:44', zone:'hall_up', text:'Motion detected \u2014 upstairs hall', still:'hall_b' },
      { t:'06:12', zone:'yard',    text:'Motion detected \u2014 side yard' }
    ]},

  { day:3, date:'Thu 6 Nov', brief:'',
    events:[
      { t:'02:21', zone:'hall_up', text:'Motion detected \u2014 upstairs hall', still:'hall_c',
        note:'No prior zone triggered.' },
      { t:'03:12', contact:true,   text:'Utility door opened', meta:'Interior contact \u2014 always monitored' },
      { t:'03:12', zone:'utility', text:'Motion detected \u2014 utility', still:'utility_b' },
      { t:'03:19', contact:true,   text:'Utility door closed' }
    ]},

  { day:4, date:'Fri 7 Nov', brief:'',
    events:[
      { t:'04:02', contact:true,   text:'Front door opened', meta:'No forced entry detected',
        effect:s => { s.flags.frontOpened = true; s.flags.wasLocked = !!s.locks.front; } },
      { t:'04:02', zone:'porch',   text:'Motion detected \u2014 front porch', still:'porch_c' },
      { t:'04:03', contact:true,   text:'Front door closed' },
      { t:'04:40', zone:'stairs',  text:'Motion detected \u2014 stairs' },
      { t:'04:41', zone:'entry',   text:'Motion detected \u2014 entry', still:'entry_b' }
    ]},

  { day:5, date:'Sat 8 Nov', brief:'',
    onResolve: s => { s.flags.extraRoom = true; },
    events:[
      { t:'02:58', zone:'__unmapped', text:'Motion detected \u2014 unmapped zone', always:true,
        meta:'Sensor ID 0011 \u2014 not present in floor plan' },
      { t:'03:04', zone:'entry',   text:'Motion detected \u2014 entry', still:'entry_c' },
      { t:'03:40', zone:'living',  text:'Motion detected \u2014 living room', still:'living_b' },
      { t:'05:55', contact:true,   text:'Front door opened' }
    ]}
];

const MORNINGS = {
  1:'No action required.',
  2:'',
  3:'Sensor 0011 reported for the first time. Contact support if this device is unfamiliar.',
  4:'',
  5:'Your floor plan has been updated to match detected devices.'
};
