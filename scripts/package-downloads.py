#!/usr/bin/env python3
"""Create one safe, self-contained Chrome extension ZIP per approved catalog entry."""
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parent.parent
CATALOG = json.loads((ROOT / "docs/catalog.json").read_text(encoding="utf-8"))
DEST = ROOT / "docs/downloads"
DEST.mkdir(parents=True, exist_ok=True)
for old in DEST.glob("*.zip"):
    old.unlink()
for project in CATALOG["projects"]:
    folder = (ROOT / project["folder"]).resolve()
    if not folder.is_relative_to(ROOT) or not (folder / "manifest.json").is_file():
        raise ValueError("Unsafe or missing extension folder: " + project["folder"])
    archive = DEST / (project["id"] + ".zip")
    count = 0
    with ZipFile(archive, "w", compression=ZIP_DEFLATED, compresslevel=6) as z:
        for file in sorted(folder.rglob("*")):
            if file.is_symlink():
                raise ValueError("Symlinks are not permitted in extension ZIPs: " + str(file))
            if not file.is_file() or any(part.startswith(".") for part in file.relative_to(folder).parts):
                continue
            if file.stat().st_size > 25 * 1024 * 1024:
                raise ValueError("File exceeds packaging limit: " + str(file))
            z.write(file, (Path(folder.name) / file.relative_to(folder)).as_posix())
            count += 1
    if count == 0:
        raise ValueError("Empty extension ZIP: " + project["id"])
    print(f"Packaged {project['id']} ({count} files)")
