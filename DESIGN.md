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

No warning, no alert. The player should notice on their own. A new entry
appears:

```
CAM 07 — UNKNOWN
```

It corresponds to nothing on the floor plan. Opening it shows `room_a`: bare
walls, plain flooring, no windows, no furniture, one doorway, same ceiling-corner
perspective and grade as every other camera.

Nothing supernatural. The room existing at all is the event. The player stops
asking who is in the house and starts asking where this camera is.

## Phase 4 — camera 07 evolves

Discrete states, spaced out across normal play. Never back to back.

| State | Change |
|---|---|
| 1 | Bare room, doorway visible, nothing unusual. |
| 2 | Identical composition. The doorway is now completely dark. Nothing else changes. |
| 3 | A barely visible human silhouette deep inside the doorway. No face, no eyes, no monster features. |
| 4 | The figure is gone. Room empty again. |
| 5 | A desk and chair now exist in the room. They were never there. |
| 6 | A monitor on the desk, displaying a six-camera security interface that visibly resembles the player's own. **First major reveal.** |
| 7 | The desk chair is pulled away from the desk. |
| 8 | A person is sitting in it, facing the monitors, back to camera 07. Not identifiable. No face. |

## Phase 5 — mirrored behaviour

Camera 07 responds to the player, in discrete stills rather than animation.
Switching feeds may shift the seated figure's hand near the mouse. Going idle
leaves them motionless. Selecting another camera may reposition them slightly
toward the monitor.

Never state that the figure is copying the player. Let them land on it.

## Phase 6 — motion alerts

```
MOTION DETECTED — CAM 07
```

The desk and monitors are still there. The chair is empty. Then, with pauses:

```
MOTION DETECTED — HALL      nothing there
MOTION DETECTED — LIVING    nothing there
MOTION DETECTED — ENTRY     nothing there
MOTION DETECTED — PORCH     nothing there
```

Something is crossing the house toward somewhere. Never show it moving between
cameras. The absence carries it.

## Phase 7 — the eighth camera

```
8 cameras online
CAM 08 — LOCAL
```

Selecting it holds on black for 1.5–3 seconds before the image loads.

The frame shows an in-universe monitoring station: desk, computer, chair, a dim
room, the security interface visible on the monitor, a person seated, camera
mounted behind or above them. The player should recognise the person at the
desk as themselves.

**This is fictional and must stay fictional.** It never depicts, claims, or
implies access to the player's real surroundings, camera, or device. The horror
is perspective, not intrusion.

Behind the seated person stands the shadow figure. Clearest appearance in the
game, same visual language throughout: human silhouette, no face, no glowing
eyes, no exaggerated anatomy, no weapon, no gore, no attack pose. Standing.
Watching the person.

No sting, no zoom, no rush toward camera. Hold the feed long enough that a
player scanning the frame eventually finds it.

## Camera failure

After enough time on CAM 08, disconnect the feeds one at a time with deliberate
pauses:

```
CAM 08 — OFFLINE
CAM 07 — OFFLINE
HALL — OFFLINE
UTILITY — OFFLINE
LIVING — OFFLINE
KITCHEN — OFFLINE
ENTRY — OFFLINE
PORCH — OFFLINE
```

The interface empties out. Then:

```
NO CAMERAS ONLINE
```

Hold several seconds. No music, minimal ambient system noise. Then:

```
AWAY MODE DISABLED
Reason: Home detected.
```

Hold. Fade. Title card: `AWAY MODE`. Pause. Credits.

## Prohibited

Jumpscares. Screaming faces. Monsters charging the camera. Glowing eyes. Gore.
Blood messages. Loud stingers. Any explanation of the entity, camera 07, camera
08, or the final message.

## Readings to preserve

The player should finish with all of these available and none confirmed:

- Something entered the house.
- Something was already inside it.
- Camera 07 shows a room that cannot exist.
- The monitoring station is itself part of the house.
- The figure was watching the player, not the owners.
- The player was never where they believed they were.
- "Away mode" does not only refer to the owners.

---

## Open questions

Three places where this design and the current engine need a decision.

**1. Slot limits versus phases 2, 3 and 7.** The night loop only lets the player
arm 3 of 10 zones, so they may never see a full clean sweep — which is exactly
what phase 2 depends on. Proposed fix: cameras 07 and 08 sit outside the slot
system entirely (you cannot arm what isn't yours, and they report whether you
asked or not), and phase 2 arrives as a `system integrity check` event that
captures all six at once. That also makes the seventh camera's arrival land
harder, because it shows up in a list the player was just told was complete.

**2. Phase 5 pacing.** Key the mirrored states to camera-switch *count* rather
than elapsed time. Time-based feels like animation; count-based feels like
being answered.

**3. Where phase 1 sits.** The current nights 1–5 end at the unmapped-room
reveal on the floor plan. Phase 1 as written is an aftermath set, so it needs
the figure to have appeared two or three times first — which means the `_d`
frames land around nights 4–6 and phase 1 becomes night 7 or 8.
