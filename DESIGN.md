# Away Mode — design

Authoritative design document. The engine in `js/` serves this; where they
disagree, this wins.

## The arc

The game asks four questions in order, and only ever answers the first one.

1. What changed in the house?
2. Is someone in the house?
3. Where is camera 07?
4. Who is actually being watched?

The player begins believing they are remotely monitoring a property through six
fixed cameras while the owners are away. The ending changes that reading
without confirming a replacement. The horror is realisation, not attack.

## Escalation rule

**Escalate implication, never visibility.** If each set makes the figure
clearer, the player learns the pattern is "find the creepy guy" and starts
scanning for a silhouette. Once the figure has appeared a few times, pull it
back out and let the *consequences* escalate instead: objects that moved,
impressions left behind, evidence of presence with no presence in frame.

Relief is a mechanic. A set that is genuinely, verifiably normal makes the next
anomaly land harder, and makes the player distrust their own reading of the
clean frames.

## Visual continuity — non-negotiable

Every altered still derives from its baseline. The camera never moves. Identical
lens, crop, furniture, room dimensions, architecture, major light sources, and
grade. Only the intended anomaly changes.

Unintended drift between two frames of the same camera breaks the core
mechanic, because the player is comparing pixel to pixel and will see the room
move before they see the anomaly.

---

## Phase 1 — the house quiets down

Six established cameras. After the figure has appeared intermittently, reduce
activity. This set should read as almost normal.

| Camera | State |
|---|---|
| Porch | Empty. Baseline. Give the player relief — this one matters. |
| Entry | Normal, except a house key now sits on the console table. Not present in the baseline. Not highlighted. The question is whose. |
| Kitchen | Normal at a glance. One chair has been moved into the doorway out of the kitchen, deliberately positioned rather than knocked over — as though someone set it there to watch the room. |
| Living | No figure. One sofa cushion has a fresh depression, as though someone just stood up. Subtler than a silhouette. |
| Utility | Back-wall door still open. Figure gone. Wet or dirty footprints lead **out** of the black doorway and stop halfway across the floor. They do not continue to any exit. |
| Hall | The only figure in the set, and the hardest anomaly in the game to find: part of a shoulder or the side of a head protruding from the *nearest* doorway, at the extreme edge of frame. A player scanning the centre should be able to miss it entirely. |

## Phase 2 — everything returns to normal

Restore all six cameras to baseline, one beat at a time. Doors close. The
cabinet closes. The chair goes back. The lamp goes off. The key is gone. The
footprints are gone.

This must not read as reassurance. Total normalisation is itself the anomaly —
nothing in this house has ever tidied up after itself before.

Hold long enough that the player confirms all six are clean.

## Phase 3 — the seventh camera

The status line has always read `6 cameras online`. Without comment it becomes
`7 cameras online`.

No warning, no alert. A new entry appears:

```
CAM 07
```

The interface never interprets. No caption reads "unknown room", "view: kitchen?"
or "second camera detected" — those existed for us while designing and must be
cropped out of the shipped frames. The feed shows the camera name and a
timestamp, nothing else. The player gets to have the realisation themselves.

## Phase 4 — camera 07

Seven states of one fixed camera position. Ordinary room, one doorway.

| File | State |
|---|---|
| `room_a` | Door closed. Aggressively ordinary. |
| `room_b` | Door open onto complete darkness. |
| `room_c` | Door open onto the living room. |
| `room_d` | Door open onto the kitchen. |
| `room_e` | Door open onto the upstairs hallway. |
| `room_f` | Door closed. A second camera is now mounted in the corner, pointed back at this one. A shadow falls across the wall with nothing present to cast it. |

`room_c` → `room_d` → `room_e` is where the player learns the rule without being
told it: the doorway does not lead anywhere fixed. Three data points is enough.

`room_f` is never explained. Not in the log, not in settings, not in the ending.

### Pacing

Never run the states in order. Camera 07 should often be unchanged across several
checks, and it should revert:

```
a  a  b  b  a  c  c  d  a  e  f
```

If something new happens every time the player opens it, they learn that opening
it is what causes the change, and it becomes a slot machine. Unpredictability —
including long stretches of nothing — is what keeps them checking.

### No further cameras

Camera 07 is the impossible camera. There is no attic, no basement, no camera 09.
The only addition after this is camera 08, which exists solely for the ending.

## The ending

Short, because camera 07 already delivered the supernatural payload. The house's
layout stopped making sense; the ending does not need to explain that. It needs
to turn the attention toward the player.

**Quiet.** All six house cameras return to their original `_a` frames — byte for
byte the same files, so the player cannot find a difference even if they look
for one. Camera 07 is gone.

```
6 cameras online
```

Let them sit with it.

**Alerts.** After a long pause, motion alerts arrive one at a time, each feed
empty when opened:

```
MOTION DETECTED — ENTRY     nothing
MOTION DETECTED — LIVING    nothing
MOTION DETECTED — HALL      nothing
MOTION DETECTED — PORCH     nothing
```

The route must not be walkable. A player who traces it on the floor plan should
find it impossible, not merely unlucky.

Vary the reliability rather than the content, so four empty feeds are not four
identical beats: the first loads instantly, the second takes a moment, the third
sits on `reconnecting` for two seconds, the fourth is instant again. The system
degrades and recovers without ever commenting on it.

The floor plan carries this sequence. Watching a pin cross a map the player
knows by heart, while every camera shows nothing, is worse than the feeds.

**The porch.** Empty. The front door is closed. Whatever the system tracked
across the house toward the door never left.

**Eight.**

```
7 cameras online
CAM 08
```

Camera 07 does not come back. The numbering is wrong and nothing acknowledges it.

**The last image.** Two seconds of black, then `local_a`: a dim room, a desk, a
monitor showing the Away Mode interface with the six house cameras, a person
seated with their back to us. Behind them, standing, the shadow figure.

In-universe and fictional. It never depicts, claims, or implies access to the
player's real surroundings, camera, or device. The horror is perspective, not
intrusion.

No sting, no zoom, no movement. Hold long enough that a player studying the
monitor eventually notices what is behind the chair. Ten seconds of nothing
happening.

**Signal loss.** Then, with pauses:

```
CAM 08 SIGNAL LOST
HALL — OFFLINE
UTILITY — OFFLINE
LIVING — OFFLINE
KITCHEN — OFFLINE
ENTRY — OFFLINE
PORCH — OFFLINE
NO CAMERAS ONLINE
```

Black. Hold longer than is comfortable. Then the app's own friendly chime — the
same pleasant sound it has used for every routine notification all game — and:

```
AWAY MODE DISABLED
Reason: Home detected.
```

Black. `AWAY MODE`. Pause. Credits.

No epilogue. The owners never come back. Nothing is explained — not the figure,
not camera 07, not why the impossible room connected to the other rooms, and
above all not what "home detected" means.

## Prohibited

Jumpscares. Screaming faces. Monsters charging the camera. Glowing eyes. Gore.
Blood messages. Loud stingers. Captions that interpret an image for the player.
Any explanation of the entity, camera 07, camera 08, or the final message.

## Readings to preserve

All available, none confirmed:

- Something entered the house.
- Something was already inside it.
- Camera 07 shows a room that cannot exist.
- The monitoring station is itself part of the house.
- The figure was watching the player, not the owners.
- The player was never where they believed they were.
- "Away mode" does not only refer to the owners.

---

## Open questions

**1. Slot limits versus the quiet phase.** Arming 3 of 10 means the player may
never see all six clean at once, which is what that beat depends on. Cameras 07
and 08 are already exempt from the slot system in code — they are not the
player's and report whether asked or not. The quiet phase still needs a
`system integrity check` event that captures all six at once. That also sharpens
the seventh camera's arrival, because it appears in a list the app just called
complete.

**2. One last decision.** The game's spine is commitment — arming, locking,
living with it. Proposal: after the porch alert resolves with the door closed,
the app offers the front door lock one final time. Whether the player throws it
changes nothing mechanically and the game never comments. But if they do, the
last thing they did was seal the house, and `Reason: Home detected` lands on
them rather than at them.

**3. Where the quiet phase sits.** It is an aftermath beat, so the figure needs
two or three appearances first. That puts the `_d` frames around nights 4–6 and
the quiet at night 7 or 8.

---

# The owner thread

A second information channel, carried by `js/messages.js`. Text can state
contradictions that no camera frame can, and the second act of this game is
entirely contradiction.

## Where it lives

Inside Hearthwatch, as a property-contact thread. **Never a fake iOS or Android
Messages app.** A cloned OS chat breaks the instant someone opens it on the
wrong platform, and it violates the no-fake-system-UI rule. An in-app thread is
plausible everywhere and has nothing to fake — it is a real chat interface built
with the same HTML and CSS a real one would use.

## The rule that makes Maya work

**Maya is never frightened and never dramatic.** She never says "oh my god",
never panics, never tells the player to get out. Everything she produces is
mundane and factual, and that is exactly what makes it land:

> There isn't a door there.
> We only have six.
> We're still about 20 minutes away.

If she gets scared, the game becomes about her and the player stops being alone.
Being alone is the asset. She is the most normal person in the game.

## The player's voice

The player's verbs so far are arm, lock, commit. Dialogue must not introduce a
different grammar. Two or three options, always terse — `Package.` `ok` `No.` —
so the player character stays someone who types as little as possible. The
moment the choices get eloquent this becomes a visual novel.

**Send photo is a verb, not a menu item.** It should only be reachable from a
camera feed, so sharing evidence means going to Cameras, choosing the frame and
sending it. Three times in the whole game at most. It is the only action that
puts the player's evidence in someone else's hands, and it triggers the two best
beats.

## Arc

**Boring first.** Motion out front, it's a package, probably Daniel's. "This
system was such a good investment lol". Nothing creepy comes from her for the
first act. That normality is what buys the horror later.

**The first crack.** `Is someone checking the house tonight?` / `No. Why?` She
does not react. Daniel probably left the cabinet open; he does that.

**The utility door.** `What's through the door in the utility room?` / `The
garage.` / `Wait which door?` The player sends the photo. Long typing. It stops.
It starts again. `There isn't a door there.`

The player has been looking at that door for four nights.

**Camera 07.** The player tells her. `We only have six.` Sends the image.
`Where is that?` Then:

> James don't open that door.

The player never mentioned a door. Nothing acknowledges this. No music, no
highlight, no log entry.

A new reply appears: `How did you know about the door?` Choosing it produces a
typing indicator that runs and then stops, and Maya goes offline.

**If the player does not choose it, it stays.** The unsent reply sits in the
composer for the rest of the game, every time they open the thread.

**The old threads.** With Maya gone the player digs. A conversation with Daniel:

> Maya: Did you check the cameras?
> Daniel: They're fine.
> Maya: Including upstairs?
> Daniel: We don't have one upstairs.

**The install manifest.** Settings lists the paired devices, as it has since the
first launch:

```
PORCH   ENTRY   KITCHEN   LIVING   UTILITY   GARAGE
```

There is no HALL camera. There never was. Camera 07 is not the first impossible
camera — camera 06 was, and the player has been watching it since night one.

This needs no new art and no found object. It lives in a Settings row the player
has scrolled past a dozen times. Note also that the manifest says GARAGE where
the app labels the feed UTILITY: a discrepancy nobody notices until it matters.

**She comes back.**

> Sorry. Lost signal.
> Did someone message you from my account?

Choices: `You did.` / `What are you talking about?` / `You told me not to open
the door.`

The last one gets `I didn't send that.` — and when the player scrolls up, the
message is gone.

**The log stops being trustworthy.**

```
23:41  Motion detected — hall
23:43  Motion detected — entry
23:46  Motion detected — porch
23:47  User arrived home
23:48  Front door unlocked
23:49  Away mode disabled
```

The player tries to re-enable it:

> Unable to enable Away Mode while home is occupied.

This is the same system voice that closes the game. `Reason: Home detected` is
foreshadowed, hours earlier, by an error string.

**Last exchange.** Before camera 08:

> We're still about 20 minutes away.
> Who's in the house?

Everything is empty. Then:

> I'm not talking about my house.

## The player's name

Settings has always had an `Account holder` row, currently blank. If the player
is asked for a name at first launch, it fills that row, stays in `localStorage`,
and never leaves the device — and Maya can use it exactly once, at the worst
moment.

Later, the Account holder row changes on its own. Nothing comments.

## Open question

This breaks the original rule that nobody in this game ever speaks. It is worth
breaking, because contradiction is what the second act runs on and images cannot
carry it. But Maya is the only voice the game ever gets, and the never-
frightened rule is what keeps the change from costing the isolation.
