from pathlib import Path


def _project_row(data: dict, sdir: Path, pfile: Path,
                  active: bool, live: dict | None) -> dict:
    clips = data.get("clips") or []
    intake = data.get("intake") or {}
    src = data.get("source") or {}
    try:
        mtime = pfile.stat().st_mtime
    except OSError:
        mtime = 0.0
    import datetime
    return {
        "name": data.get("name", sdir.name),
        "display_name": data.get("display_name") or data.get("name", sdir.name),
        "mode": intake.get("mode", "long_video"),
        "status": Session.derive_status(data, live),
        "created": data.get("created"),
        "modified": datetime.datetime.fromtimestamp(mtime, datetime.UTC)
        .isoformat().replace("+00:00", "Z") if mtime else None,
        "duration": src.get("duration"),
        "clips": _clip_counts(clips),
        "best_score": max((int(c.get("score") or 0) for c in clips), default=0),
        "folder": data.get("folder") or "",
        "source": intake.get("source") or "",
        "youtube_url": intake.get("youtube_url") or "",
        "thumb": f"/api/projects/{sdir.name}/thumb",
        "active": active,
        "error": intake.get("error"),
        "_mtime": mtime,
    }
