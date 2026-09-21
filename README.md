# Away Mode

A horror game that is a smart-home app.

You monitor a house you are not inside. The whole game is the app: a floor plan,
six cameras, motion and contact sensors, three door locks, and an activity log.
You never see a person. Nobody speaks. You interact by toggling things.

Working title in-fiction: **Hearthwatch**.

## The loop

Each night you:

1. **Review** the log from last night, and whatever the cameras caught.
2. **Arm 3 sensors out of 10.** This is the game. You cannot watch the whole
   house, so every arrangement is a bet, and what you don't arm produces no log
   entry at all. Silence is not evidence of nothing.
3. **Lock or unlock** the front, back and garage doors.
4. **Set away mode.** Time passes. Events resolve against what you armed.

The four door contacts are hardware and always report, so you always learn
*that* a door opened — just never what was on the other side of it unless you
spent a slot there.

The locks are the part that bites. You decide every night whether the thing is
in or out, on evidence that is always one sensor short, and you can't take a
decision back. That's the intended feeling: not fear of a monster, complicity in
a choice.

## Running it

No build step. Any static server:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080` — on a phone if you can, it's designed
mobile-first at 480px.

State persists in `localStorage`. Settings → Reset monitoring history wipes it.

### Pacing

Away Mode is checked, not played. It deliberately cannot be finished in one
sitting:

- A night cannot be set again until a real **4 hour** window has passed. The
  button shows the countdown and the app explains it in product language
  ("away mode runs overnight").
- Maya answers in real minutes, not instantly — anywhere from 1 to 14 depending
  on the beat. Her replies land whether the app is open or not, and the
  Messages tab carries a dot when something is waiting.

Add `?dev=1` to the URL to collapse both (a "minute" becomes 0.7s and the night
cooldown becomes 12s) so the whole arc can be walked in a few minutes while
building.

### First launch

The player enters a name. It fills the `Account holder` row in Settings, is
substituted into `{name}` tokens in the owner thread, and never leaves
`localStorage`.

## Layout

```
index.html        app shell: title bar, screen container, tab bar
css/app.css       the whole look. Product-neutral on purpose
js/data.js        the house, the floor plan geometry, the nights
js/app.js         state, rendering, night resolution
tools/degrade.py  turns photos into cheap-camera stills
assets/feeds/     the stills (see IMAGES.md)
IMAGES.md         shot list — what to photograph and how
```

### Adding a night

Append to `NIGHTS` in `js/data.js`:

```js
{ day:6, date:'Sun 9 Nov', events:[
    { t:'02:14', zone:'kitchen', text:'Motion detected — kitchen', still:'kitchen_c' },
    { t:'02:15', contact:true,  text:'Back door opened' },
    { t:'03:01', zone:'stairs',  text:'Motion detected — stairs', always:true }
]}
```

- `zone` — only appears in the log if that sensor was armed.
- `contact:true` — always appears. Door hardware.
- `always:true` — always appears and renders as an alert. Use sparingly.
- `still` — filename stem in `assets/feeds/`. Missing file shows "no signal".
- `effect(s)` / `onResolve(s)` — mutate state for branching and escalation.

`MORNINGS[day]` is the line appended to the morning summary sheet.

## Design rules

- **The app never acts like a game.** No score, no jump scares, no horror
  typography. It's a mediocre consumer product doing its job correctly. Every
  frightening thing on screen is phrased the way a real app would phrase it.
- **Never confirm anything.** The log reports events, not causes. No entry ever
  explains itself.
- **Absence over presence.** A missing entry, a deleted clip, a zone that went
  quiet — all stronger than showing something in frame. Nothing with a face has
  to appear in this game, ever.
- **No fake system UI.** Nothing impersonates the phone's OS, no fake crashes,
  no fake permission prompts. The fiction stays inside the app's own frame.

## Status

Playable vertical slice: five nights, full arm/lock/resolve loop, floor plan
with the act-three room reveal, camera grid, persistent state.

Not built yet:
- Notifications (opt-in, local, daytime-only; the hook is deliberately absent
  until the consent copy is written)
- Nights 6+ and the owner thread past night 4
- Camera 07 state machine
- The install manifest in Settings (the camera 06 reveal)
- The ending

No voice acting, ever. Synthetic speech would break the one thing this game has
going for it. The typing indicator carries what a voice would.
