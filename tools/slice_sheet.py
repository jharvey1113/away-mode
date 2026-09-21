"""Slice a contact sheet of camera stills into individual files.

The generator returns six frames on one 3x2 sheet separated by black gutters.
This finds the gutters by brightness and cuts the tiles out, so it survives
small changes in sheet layout.

Usage:
    python tools/slice_sheet.py raw_sheets/3.webp raw/ --names porch_a,entry_a,kitchen_a,living_a,utility_a,hall_a
    python tools/slice_sheet.py raw_sheets/3.webp raw/ --names ... --probe

--probe prints the detected band edges and writes nothing.

Requires: pip install pillow
"""

import argparse
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required:  pip install pillow")

DARK = 22          # a line this dim counts as gutter
MIN_BAND = 60      # ignore bands thinner than this many pixels


def bands(values, size):
    """Return (start, end) runs of lines brighter than DARK."""
    out, start = [], None
    for i in range(size):
        lit = values[i] > DARK
        if lit and start is None:
            start = i
        elif not lit and start is not None:
            if i - start >= MIN_BAND:
                out.append((start, i))
            start = None
    if start is not None and size - start >= MIN_BAND:
        out.append((start, size))
    return out


def line_brightness(im, axis):
    """High-percentile brightness per column (axis=0) or row (axis=1)."""
    g = im.convert("L")
    w, h = g.size
    px = g.load()
    step = 3
    out = []
    if axis == 0:
        for x in range(w):
            vals = sorted(px[x, y] for y in range(0, h, step))
            out.append(vals[int(len(vals) * 0.97)])
    else:
        for y in range(h):
            vals = sorted(px[x, y] for x in range(0, w, step))
            out.append(vals[int(len(vals) * 0.97)])
    return out


def main():
    p = argparse.ArgumentParser(description="Slice a 3x2 contact sheet into six stills.")
    p.add_argument("sheet")
    p.add_argument("dst")
    p.add_argument("--names", required=True, help="six comma-separated output names, left to right, top to bottom")
    p.add_argument("--cols", type=int, default=3)
    p.add_argument("--rows", type=int, default=2)
    p.add_argument("--probe", action="store_true", help="report detected bands and exit")
    args = p.parse_args()

    names = [n.strip() for n in args.names.split(",") if n.strip()]
    im = Image.open(args.sheet).convert("RGB")
    w, h = im.size

    cols = bands(line_brightness(im, 0), w)
    rows = bands(line_brightness(im, 1), h)

    # the footer strip is darker than the tiles but can still register; keep the tallest rows
    rows = sorted(sorted(rows, key=lambda r: r[1] - r[0], reverse=True)[:args.rows])
    cols = sorted(sorted(cols, key=lambda c: c[1] - c[0], reverse=True)[:args.cols])

    print(os.path.basename(args.sheet), "%dx%d" % (w, h))
    print("  columns:", cols)
    print("  rows:   ", rows)

    if len(cols) != args.cols or len(rows) != args.rows:
        sys.exit("  detected %d cols / %d rows, expected %d / %d" % (len(cols), len(rows), args.cols, args.rows))
    if args.probe:
        return
    if len(names) != args.cols * args.rows:
        sys.exit("  need %d names, got %d" % (args.cols * args.rows, len(names)))

    os.makedirs(args.dst, exist_ok=True)
    i = 0
    for (y0, y1) in rows:
        for (x0, x1) in cols:
            out = os.path.join(args.dst, names[i] + ".png")
            im.crop((x0, y0, x1, y1)).save(out)
            print("  %-12s %dx%d  ->  %s" % (names[i], x1 - x0, y1 - y0, out))
            i += 1


if __name__ == "__main__":
    main()
