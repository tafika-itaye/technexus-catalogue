#!/usr/bin/env python3
"""Image optimizer for technexus-catalogue.

For every JPEG/PNG > 200 KB in the repo (excluding _backup_images and .git):
  1. Copy original to _backup_images/<same-relative-path>
  2. Resize to 1600 px on the longest edge (only if larger)
  3. Re-encode JPEG at Q=82 (progressive, stripped EXIF), PNG unchanged dimensions
  4. Emit sibling WebP variants: <name>-1200.webp, <name>-800.webp, <name>-400.webp (Q=80)

Idempotent: skips files whose backup already exists.
"""
from __future__ import annotations
import os
import sys
import shutil
from pathlib import Path
from PIL import Image, ImageOps

REPO = Path(__file__).resolve().parent.parent
BACKUP = REPO / "_backup_images"
MIN_BYTES = 200 * 1024            # 200 KB
MAX_LONG_EDGE = 1600
JPEG_QUALITY = 82
WEBP_QUALITY = 80
WEBP_WIDTHS = (1200, 800, 400)
EXCLUDE_DIRS = {"_backup_images", ".git", "node_modules"}
EXT_JPEG = {".jpg", ".jpeg"}
EXT_PNG = {".png"}

def iter_images():
    for root, dirs, files in os.walk(REPO):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            p = Path(root) / f
            ext = p.suffix.lower()
            if ext not in EXT_JPEG | EXT_PNG:
                continue
            if p.stat().st_size < MIN_BYTES:
                continue
            yield p

def backup(src: Path) -> Path:
    rel = src.relative_to(REPO)
    dst = BACKUP / rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    if not dst.exists():
        shutil.copy2(src, dst)
    return dst

def shrink_jpeg(src: Path):
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        if im.mode not in ("RGB", "L"):
            im = im.convert("RGB")
        w, h = im.size
        long_edge = max(w, h)
        if long_edge > MAX_LONG_EDGE:
            scale = MAX_LONG_EDGE / long_edge
            im = im.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
        im.save(src, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
        return im

def shrink_png(src: Path):
    with Image.open(src) as im:
        w, h = im.size
        long_edge = max(w, h)
        changed = False
        if long_edge > MAX_LONG_EDGE:
            scale = MAX_LONG_EDGE / long_edge
            im = im.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
            changed = True
        if changed:
            im.save(src, "PNG", optimize=True)
        return im

def emit_webp(src: Path):
    """Write -1200/-800/-400 WebP siblings next to src."""
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        if im.mode not in ("RGB", "RGBA"):
            im = im.convert("RGBA" if "A" in im.getbands() else "RGB")
        stem = src.stem
        parent = src.parent
        w, h = im.size
        for width in WEBP_WIDTHS:
            if width > max(w, h):
                continue  # don't upscale
            scale = width / max(w, h)
            new = im.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
            out = parent / f"{stem}-{width}.webp"
            new.save(out, "WEBP", quality=WEBP_QUALITY, method=6)

def human(n):
    for unit in ("B", "KB", "MB"):
        if n < 1024:
            return f"{n:.0f}{unit}"
        n /= 1024
    return f"{n:.1f}GB"

def main():
    total_before = total_after = 0
    count = 0
    for src in iter_images():
        before = src.stat().st_size
        backup(src)
        try:
            if src.suffix.lower() in EXT_JPEG:
                shrink_jpeg(src)
            else:
                shrink_png(src)
            emit_webp(src)
        except Exception as e:
            print(f"ERR {src.relative_to(REPO)}: {e}", file=sys.stderr)
            continue
        after = src.stat().st_size
        total_before += before
        total_after += after
        count += 1
        print(f"  {src.relative_to(REPO)}  {human(before)} -> {human(after)}")
    saved = total_before - total_after
    pct = (saved / total_before * 100) if total_before else 0
    print(f"\n{count} images processed. {human(total_before)} -> {human(total_after)} (saved {human(saved)}, {pct:.1f}%)")

if __name__ == "__main__":
    main()
