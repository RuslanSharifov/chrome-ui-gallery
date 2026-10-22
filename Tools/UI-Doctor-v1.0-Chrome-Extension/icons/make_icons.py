#!/usr/bin/env python3
"""Generates the UI Doctor PNG icons (16, 32, 48, 128 px) with the Python standard library only.

Design: a dark rounded tile, a violet inspection frame and a cyan crosshair with a centre marker.
Run:  python3 make_icons.py   (writes icon16.png ... icon128.png next to this script)
"""
import os
import struct
import zlib

BG = (11, 16, 32)        # #0B1020
VIOLET = (139, 92, 246)  # #8B5CF6
CYAN = (34, 211, 238)    # #22D3EE


def in_rounded_square(x, y, r=0.22):
    if not (0 <= x <= 1 and 0 <= y <= 1):
        return False
    cx = min(max(x, r), 1 - r)
    cy = min(max(y, r), 1 - r)
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r


def sample(x, y):
    """Return the RGB colour at a normalised point, or None if outside the tile."""
    if not in_rounded_square(x, y):
        return None
    colour = BG
    t = 0.075  # frame thickness
    if 0.2 <= x <= 0.8 and 0.2 <= y <= 0.8 and not (0.2 + t < x < 0.8 - t and 0.2 + t < y < 0.8 - t):
        colour = VIOLET
    t2 = 0.055  # crosshair arm thickness
    if abs(y - 0.5) <= t2 / 2 and (0.3 <= x <= 0.43 or 0.57 <= x <= 0.7):
        colour = CYAN
    if abs(x - 0.5) <= t2 / 2 and (0.3 <= y <= 0.43 or 0.57 <= y <= 0.7):
        colour = CYAN
    if (x - 0.5) ** 2 + (y - 0.5) ** 2 <= 0.075 ** 2:
        colour = CYAN
    return colour


def render(size, supersample=4):
    rows = []
    n = supersample * supersample
    for j in range(size):
        row = bytearray([0])  # PNG filter type: none
        for i in range(size):
            r = g = b = a = 0.0
            for sy in range(supersample):
                for sx in range(supersample):
                    x = (i + (sx + 0.5) / supersample) / size
                    y = (j + (sy + 0.5) / supersample) / size
                    c = sample(x, y)
                    if c:
                        r += c[0]; g += c[1]; b += c[2]; a += 1
            if a:
                row += bytes([round(r / a), round(g / a), round(b / a), round(255 * a / n)])
            else:
                row += b"\x00\x00\x00\x00"
        rows.append(bytes(row))
    return b"".join(rows)


def chunk(tag, data):
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)


def write_png(path, size):
    raw = render(size)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )
    with open(path, "wb") as fh:
        fh.write(png)


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    for s in (16, 32, 48, 128):
        write_png(os.path.join(here, f"icon{s}.png"), s)
        print(f"wrote icon{s}.png")
