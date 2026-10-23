#!/usr/bin/env python3
"""Assemble src/ + assets/ into one self-contained HTML (dist/forest-duel.html).

The web build stays a single file so it can be published as-is (Claude page, Cloudflare).
Sources stay split so each module maps to one C# class in Unity, and assets stay real files.
Usage: python3 build.py            -> dist/forest-duel.html
"""
import base64, json, os, glob

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC, ASSETS, DIST = (os.path.join(ROOT, p) for p in ("src", "assets", "dist"))


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def js_list(group):
    # files are concatenated in manifest order: classic scripts, shared global scope
    order = json.load(open(os.path.join(SRC, "js", "manifest.json")))[group]
    return "".join(read(os.path.join(SRC, "js", p)) for p in order)


def sprites_json():
    order = json.load(open(os.path.join(ASSETS, "sprites", "_order.json")))
    out = {}
    for key, ext in order:
        data = open(os.path.join(ASSETS, "sprites", f"{key}.{ext}"), "rb").read()
        mime = "png" if ext == "png" else "jpeg"
        out[key] = f"data:image/{mime};base64," + base64.b64encode(data).decode()
    return json.dumps(out)


def data_json():
    # every src/data/*.json under its file name: DATA.balance, DATA.texts, ...
    out = {}
    for p in sorted(glob.glob(os.path.join(SRC, "data", "*.json"))):
        out[os.path.splitext(os.path.basename(p))[0]] = json.load(open(p, encoding="utf-8"))
    return json.dumps(out, ensure_ascii=False, separators=(",", ":"))


def build():
    html = read(os.path.join(SRC, "index.html"))
    css = "".join(read(os.path.join(SRC, "css", n)) for n in ("game.css", "menu.css", "hud.css"))
    game = js_list("game").replace("__SPRITES__", sprites_json()).replace("__DATA__", data_json())
    html = html.replace("/*@CSS*/", css).replace("/*@GAME*/", game).replace("/*@MENU*/", js_list("menu"))
    os.makedirs(DIST, exist_ok=True)
    out = os.path.join(DIST, "forest-duel.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    # the published page: Cloudflare serves index.html from the repo root
    with open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8") as f:
        f.write(html)
    return out


if __name__ == "__main__":
    p = build()
    print(p, os.path.getsize(p) // 1024, "KB")
