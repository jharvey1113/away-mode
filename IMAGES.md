# Image shot list

Everything the game needs. 19 stills, six camera positions plus one room that
shouldn't exist.

Drop originals into a `raw/` folder using the filenames below (extension doesn't
matter), then run:

```
python tools/degrade.py raw/ assets/feeds/
```

The app loads `assets/feeds/<name>.jpg`. Any slot with no file shows a
"no signal" frame, so partial batches are fine — it always runs.

---

## The three rules

1. **Every variant of a camera is shot from the identical spot.** Mark your feet
   with tape, or brace the phone against the same corner. If the framing drifts
   between `kitchen_a` and `kitchen_b`, the whole effect dies — the player is
   comparing two frames pixel by pixel, and they'll see the room move before
   they see the open cabinet.

2. **Camera height, not eye height.** Real security cameras are mounted high in a
   ceiling corner, wide, angled down. Get the phone up against the ceiling
   corner and point it down into the room. Shooting from standing height is the
   single fastest way to break the illusion.

3. **Lights off, no flash.** Dark and noisy is correct. Don't try to make these
   look good — `degrade.py` is going to crush them to 640px, wash them green,
   blow the highlights and add grain. Bad originals survive that fine; pretty
   ones just get thrown away.

Shoot landscape. Higher resolution is better — downsampling is what erases
artifacts. A few seconds of video per angle also works; I can pull frames.

**Keep out of frame:** faces, mail, family photos, anything with a name or
address on it. Assume every frame ships.

---

## Batch 1 — baselines (6)

One clear, empty, nothing-wrong frame per camera. These populate the Cameras
tab and they're the reference the player learns.

| File | Position | Contents |
|---|---|---|
| `porch_a` | Doorbell cam: above the front door, looking down at the step and walkway | Empty. Door closed. |
| `entry_a` | Ceiling corner inside the front door, looking back at the door and down the hall | Empty. Door closed, coats hung. |
| `kitchen_a` | Ceiling corner, wide enough to get the whole room | Empty. All cabinets and the fridge shut. |
| `living_a` | Ceiling corner, sofa and at least one doorway in frame | Empty. Lamps off. |
| `utility_a` | Ceiling corner of the laundry/utility/garage space. The ugly room — concrete, water heater, shelving | Empty. Back wall clearly visible. |
| `hall_a` | Upstairs hallway, shot down its length so you see doors on both sides | Empty. Every door closed. |

## Batch 2 — the altered frames (8)

Same position, one thing different. Restraint wins here — the smaller the
change, the longer it takes to find, and the worse it feels when you do.

| File | Change from baseline |
|---|---|
| `porch_c` | The front door is now open. Interior black. Nothing visible inside. |
| `entry_b` | Coats disturbed — one on the floor, or the closet door standing open. |
| `entry_c` | Front door open, seen from inside. Everything else identical. |
| `kitchen_b` | One upper cabinet standing open. Just one. |
| `living_b` | Something small on the floor mid-room that wasn't there — a cup, a shoe, a book. |
| `utility_b` | **The important one.** A door in the back wall, open onto black. If you have no door there, open a cupboard or panel and shoot it dark — or generate this frame. |
| `hall_b` | One door open. |
| `hall_c` | Every door open. |

## Batch 3 — escalation and the room (5)

| File | Contents |
|---|---|
| `porch_b` | Something left on the step. A package, a folded chair, a bag. |
| `kitchen_c` | A chair pulled out from the table, turned to face the camera. |
| `living_c` | A lamp on that was off in `living_a`. Same frame otherwise. |
| `room_a` | The room that isn't on the floor plan. Small, bare walls, one doorway, no furniture, no window. |
| `room_b` | Same frame. The doorway is now dark or closed. |

**`room_a` and `room_b` are the two I'd generate rather than photograph.** They
should feel subtly wrong — geometry that doesn't quite close, a doorway that
can't lead anywhere the plan allows. That's the standard failure mode of an
image generator, and here it's exactly the effect you want. The one room made by
something that has never been inside a house is the room that shouldn't be in
the house.

---

## If you generate instead of shoot

Don't prompt a room twice hoping for a match — you'll get two different houses
and the pair is dead. Generate the baseline once, then **inpaint** the change
with everything outside the mask held identical. That's cleaner than a re-shoot,
which always drifts a few millimetres.

Prompt against staging, not against realism. Generators default to magazine
interiors — tidy, warm, styled, nobody lives there. Too nice reads as fake in
horror faster than bad geometry does. Push for cluttered, lived-in, cheap,
mismatched, dishes in the sink. Always: *security camera mounted in ceiling
corner, wide angle, looking down, lights off, night, no people.*

Generate as large as the tool allows and let `degrade.py` do the rest.
