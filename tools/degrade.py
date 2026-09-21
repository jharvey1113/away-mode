"""Turn ordinary photos into cheap-security-camera stills.

Usage:
    python tools/degrade.py raw/ assets/feeds/
    python tools/degrade.py raw/ assets/feeds/ --mode ir --crop-top 26

Drop originals into raw/ with the filenames from IMAGES.md, run this, and the
app picks them up automatically.

Modes:
    lowlight  desaturated colour, cool shift. What a modern cam gives you in a
              room where the lights are on. This is the default.
    ir        green night-vision wash. Only right for genuinely dark rooms.
    mono      flat greyscale.
    color     leave the colour alone, just degrade.

Requires: pip install pillow
"""

import argparse
import os
import random
import sys

try:
    from PIL import Image, ImageEnhance, ImageFilter
except ImportError:
    sys.exit("Pillow is required:  pip install pillow")

EXTS = (".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff")


def crop_aspect(im, ratio):
    w, h = im.size
    if w / h > ratio:
        new_w = int(h * ratio)
        left = (w - new_w) // 2
        return im.crop((left, 0, left + new_w, h))
    new_h = int(w / ratio)
    top = (h - new_h) // 2
    return im.crop((0, top, w, top + new_h))


def vignette(im, strength):
    """Darken the corners, lift the middle - how a cheap emitter actually lights a room."""
    w, h = im.size
    mask = Image.new("L", (w, h), 0)
    px = mask.load()
    cx, cy = w / 2, h / 2
    maxd = (cx ** 2 + cy ** 2) ** 0.5
    step = 2
    for y in range(0, h, step):
        for x in range(0, w, step):
            d = (((x - cx) ** 2 + (y - cy) ** 2) ** 0.5) / maxd
            v = int(max(0, 255 * (1 - d * strength)))
            for yy in range(y, min(y + step, h)):
                for xx in range(x, min(x + step, w)):
                    px[xx, yy] = v
    mask = mask.filter(ImageFilter.GaussianBlur(w / 24))
    black = Image.new("RGB", (w, h), (0, 0, 0))
    return Image.composite(im, black, mask)


def add_noise(im, amount):
    w, h = im.size
    px = im.load()
    rnd = random.Random(1234)
    for y in range(h):
        for x in range(w):
            n = int(rnd.gauss(0, amount))
            r, g, b = px[x, y]
            px[x, y] = (
                min(255, max(0, r + n)),
                min(255, max(0, g + n)),
                min(255, max(0, b + n)),
            )
    return im


def tint(im, mode):
    if mode == "color":
        return im
    if mode == "mono":
        return im.convert("L").convert("RGB")
    if mode == "lowlight":
        im = ImageEnhance.Color(im).enhance(0.32)
        w, h = im.size
        px = im.load()
        for y in range(h):
            for x in range(w):
                r, g, b = px[x, y]
                px[x, y] = (int(r * 0.94), int(g * 0.98), min(255, int(b * 1.06)))
        return im
    g = im.convert("L")
    w, h = im.size
    out = Image.new("RGB", (w, h))
    src, dst = g.load(), out.load()
    for y in range(h):
        for x in range(w):
            v = src[x, y]
            dst[x, y] = (int(v * 0.72), int(min(255, v * 1.02)), int(v * 0.78))
    return out


def process(path, out_path, args):
    im = Image.open(path).convert("RGB")

    if args.crop_top or args.crop_bottom:
        w, h = im.size
        im = im.crop((0, args.crop_top, w, h - args.crop_bottom))

    im = crop_aspect(im, args.aspect)
    im = im.resize((args.width, int(args.width / args.aspect)), Image.LANCZOS)

    im = tint(im, args.mode)
    im = ImageEnhance.Contrast(im).enhance(args.contrast)
    im = ImageEnhance.Brightness(im).enhance(args.brightness)
    im = vignette(im, args.vignette)
    im = im.filter(ImageFilter.GaussianBlur(args.blur))
    if args.noise:
        im = add_noise(im, args.noise)

    im.save(out_path, "JPEG", quality=args.quality, subsampling=2)
    return out_path


def main():
    p = argparse.ArgumentParser(description="Degrade photos into security-camera stills.")
    p.add_argument("src", help="folder of original photos")
    p.add_argument("dst", help="output folder (usually assets/feeds)")
    p.add_argument("--mode", choices=["lowlight", "ir", "mono", "color"], default="lowlight")
    p.add_argument("--aspect", type=float, default=4 / 3, help="output aspect ratio, default 4:3")
    p.add_argument("--width", type=int, default=640)
    p.add_argument("--quality", type=int, default=34, help="JPEG quality, lower is cheaper-looking")
    p.add_argument("--noise", type=float, default=13.0, help="0 to disable")
    p.add_argument("--blur", type=float, default=0.7)
    p.add_argument("--contrast", type=float, default=1.18)
    p.add_argument("--brightness", type=float, default=0.66)
    p.add_argument("--vignette", type=float, default=0.95, help="higher = darker corners")
    p.add_argument("--crop-top", type=int, default=0, dest="crop_top",
                   help="pixels to strip off the top, e.g. a burned-in label bar")
    p.add_argument("--crop-bottom", type=int, default=0, dest="crop_bottom")
    args = p.parse_args()

    if not os.path.isdir(args.src):
        sys.exit("No such folder: " + args.src)
    os.makedirs(args.dst, exist_ok=True)

    names = sorted(n for n in os.listdir(args.src) if n.lower().endswith(EXTS))
    if not names:
        sys.exit("No images found in " + args.src)

    for n in names:
        stem = os.path.splitext(n)[0]
        out = os.path.join(args.dst, stem + ".jpg")
        process(os.path.join(args.src, n), out, args)
        print("  " + n + "  ->  " + out)

    print("\n%d image(s) written to %s" % (len(names), args.dst))


if __name__ == "__main__":
    main()
