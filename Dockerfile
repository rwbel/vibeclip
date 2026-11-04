# VibeClip — chat-driven AI short-form video editor
FROM python:3.12-slim

# System deps: ffmpeg (pipeline), fonts for Pillow caption overlay, libglib for opencv-headless
RUN apt-get update && apt-get install -y --no-install-recommends \
        ffmpeg \
        fonts-dejavu-core \
        libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps (mirror of pyproject [project].dependencies) before copying
# the code so this layer is cached across code-only changes.
RUN pip install --no-cache-dir \
        "av==17.1.0" \
        "cryptography>=42" \
        "fastapi>=0.136.3" \
        "faster-whisper>=1.2.1" \
        "httpx>=0.28.1" \
        "mcp[cli]>=1.2.0" \
        "numpy>=2.4.6" \
        "openai>=2.41.0" \
        "opencv-contrib-python-headless>=4.13.0.92" \
        "pillow>=12.2.0" \
        "python-dotenv>=1.2.2" \
        "rich>=13" \
        "uvicorn>=0.49.0" \
        "yt-dlp>=2025.1.15"

COPY . .

# Ensure the Haar cascade exists at the app-local path used by pipeline/tracking.py.
RUN python -c 'from pathlib import Path; import urllib.request; p=Path("/app/assets/haarcascades/haarcascade_frontalface_default.xml"); p.parent.mkdir(parents=True, exist_ok=True); p.exists() or urllib.request.urlretrieve("https://raw.githubusercontent.com/opencv/opencv/4.x/data/haarcascades/haarcascade_frontalface_default.xml", p)'

# Bind all interfaces inside the container; the compose port mapping
# (VIBECLIP_BIND, default 127.0.0.1) controls how it's exposed on the host.
ENV HOST=0.0.0.0 \
    PORT=8765 \
    VIDEO_ENCODER=libx264

EXPOSE 8765

CMD ["python", "-m", "chat.app"]
