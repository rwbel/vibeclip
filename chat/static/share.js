/* Share-to-social modal (Phase 1).
   Opened from the deliver cluster's ↗ SHARE button (wired in app.js playClip).
   Flow: pick connected account(s) → choose post type → caption → PUBLISH, which
   POSTs /api/social/share and watches the share rows until each destination
   lands. Publishing only ever happens from the explicit Publish click. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);

  // Every platform the Zernio account can connect (verified live). X/Twitter is
  // intentionally absent — the provider can't connect it. The free plan limits
  // the *number of connected accounts* (2), NOT which platforms are available.
  const PLATFORMS = [
    "instagram", "youtube", "tiktok", "linkedin",
    "facebook", "threads", "pinterest", "bluesky",
  ];
  const PLATFORM_LABEL = {
    instagram: "Instagram", linkedin: "LinkedIn", facebook: "Facebook",
    tiktok: "TikTok", youtube: "YouTube", threads: "Threads",
    pinterest: "Pinterest", bluesky: "Bluesky", x: "X",
  };
  // Brand accent (drives hover glow + placeholder-avatar background).
  const BRAND = {
    instagram: "#E1306C", youtube: "#FF0000", tiktok: "#25F4EE",
    linkedin: "#0A66C2", facebook: "#1877F2", threads: "#ffffff",
    pinterest: "#E60023", bluesky: "#0085FF", x: "#1d1d1f",
  };
  // Brand glyphs as self-contained 24×24 SVG tiles (white mark on brand fill).
  const ICONS = {
    instagram: `<svg viewBox="0 0 24 24"><defs><linearGradient id="smIg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#feda75"/><stop offset=".45" stop-color="#d62976"/><stop offset="1" stop-color="#405de6"/></linearGradient></defs><rect x="1" y="1" width="22" height="22" rx="7" fill="url(#smIg)"/><circle cx="12" cy="12" r="5.2" fill="none" stroke="#fff" stroke-width="1.7"/><circle cx="17.4" cy="6.55" r="1.4" fill="#fff"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="5" fill="#FF0000"/><path d="M10 8.3l6 3.7-6 3.7z" fill="#fff"/></svg>`,
    tiktok: `<svg viewBox="0 0 24 24"><rect x="1" y="1" width="22" height="22" rx="6.5" fill="#010101"/><path d="M14.2 5c.2 1.9 1.4 3.1 3.3 3.3v2.3c-1.1 0-2.2-.3-3.1-.9v4.6a4.1 4.1 0 1 1-4.1-4.1c.3 0 .6 0 .9.1v2.4a1.7 1.7 0 1 0 1.5 1.7V5z" fill="#fff"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24"><rect x="1" y="1" width="22" height="22" rx="5" fill="#0A66C2"/><circle cx="6.4" cy="6.6" r="1.6" fill="#fff"/><rect x="5.1" y="9.4" width="2.6" height="8.5" rx="1.1" fill="#fff"/><rect x="9.9" y="9.4" width="2.7" height="8.5" rx="1.1" fill="#fff"/><path d="M14.1 9.4h2.7v1.1h.1c.4-.8 1.4-1.6 2.9-1.6 3.1 0 3.6 2 3.6 4.7v4.3h-2.9v-4c0-1-.1-2.2-1.4-2.2-1.4 0-1.6 1.1-1.6 2.2v4h-2.9V9.4z" fill="#fff"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24"><rect x="1" y="1" width="22" height="22" rx="6.5" fill="#1877F2"/><path d="M14.3 22v-7.3h2.4l.4-2.9h-2.8v-1.8c0-.8.3-1.4 1.5-1.4h1.4V5.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2v2.1H8.4v2.9h2.8V22h2.9z" fill="#fff"/></svg>`,
    threads: `<svg viewBox="0 0 24 24"><rect x="1" y="1" width="22" height="22" rx="6.5" fill="#010101"/><path d="M16.3 11.5c-.1 0-.15-.05-.25-.06-.18-3.3-2-5.2-5-5.2-1.85 0-3.4.78-4.34 2.2l1.55 1.1c.7-.98 1.8-1.47 3.04-1.47 1.8 0 2.9 1.04 3.12 2.8-.52-.21-1.1-.3-1.76-.3-2.8 0-4.33 1.5-4.33 3.67 0 2.2 1.62 3.76 4.08 3.76 2.06 0 3.45-1.06 4.03-2.85l-1.64-.7c-.39.86-1.2 1.45-2.1 1.45-1.3 0-2.2-.9-2.2-2.12 0-1.38 1.02-2.18 2.4-2.18.75 0 1.42.17 1.93.52.29.2.54.46.72.82.19.38.32.82.38 1.3h1.85c-.04-.7-.28-1.42-.7-2.12-.37-.62-.9-1.12-1.57-1.48z" fill="#fff"/></svg>`,
    pinterest: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#E60023"/><path d="M12.4 5.5c-3.7 0-5.6 2.4-5.6 4.7 0 1.4.6 2.6 1.7 3 .2.1.4 0 .4-.2l.15-.6c.05-.2.03-.27-.12-.45-.32-.42-.53-.98-.53-1.75 0-2.24 1.67-4.2 4.36-4.2 2.1 0 3.4 1.26 3.4 3.04 0 2.28-1.02 4.2-2.56 4.2-.8 0-1.4-.67-1.2-1.5l.44-1.8c.15-.65.45-1.32.45-1.84 0-.44-.24-.8-.73-.8-.58 0-1.04.6-1.04 1.38 0 .5.17 1.06.25 1.54l.3 1.13c.16.73.02 1.67-.6 2.24-.74.68-1.68.97-2.7.97-1.75 0-3.1-1.38-3.1-3.4 0-2.54 1.89-5.3 5.58-5.3 3.12 0 5.12 2.25 5.12 4.68 0 3.22-1.8 5.28-4.01 5.28-.84 0-1.61-.46-1.87-1l-.65 2.48c-.2.76-.72 1.63-1.17 2.18.82.23 1.7.35 2.57.35 5.2 0 8.52-3.77 8.52-8.66 0-4.66-3.67-8.24-8.42-8.24z" fill="#fff"/></svg>`,
    bluesky: `<svg viewBox="0 0 24 24"><rect x="1" y="1" width="22" height="22" rx="6.5" fill="#0085FF"/><path d="M12 11.1C10.9 9 8.1 6.6 6.7 6.9c-1 .25-.7 2.1-.4 3.4.3 1.3 1.3 4 4 4.3-2.6.45-3.2 1.9-3.2 3.2 0 2 1.7 2.9 3.8 2.9 2.3 0 3.6-1.2 4.1-2.9.6 1.7 1.8 2.9 4.1 2.9 2.1 0 3.8-.9 3.8-2.9 0-1.3-.7-2.7-3.2-3.2 2.7-.3 3.7-3 4-4.3.3-1.3.6-3.1-.4-3.4-1.4-.3-4.2 2.1-5.3 4.2z" fill="#fff"/></svg>`,
  };
  // Soft per-platform caption guidance (counter turns amber past it).
  const CAPTION_SOFT = { instagram: 2200, linkedin: 3000, tiktok: 2200,
    youtube: 5000, threads: 500, pinterest: 500, bluesky: 300, facebook: 5000 };

  let CFG = null;                 // /api/social/status payload
  let ACCOUNTS = [];              // connected accounts
  const picked = new Set();       // selected account ids
  let kind = "post";
  let clip = null;                // {id, title, url, export_url}
  let polling = false;

  async function openShareModal(clipId, c) {
    clip = c || { id: clipId };
    picked.clear();
    kind = "post";
    $("smIssues").innerHTML = "";
    $("smStatus").innerHTML = "";
    $("smCaption").value = "";
    const dlg = $("shareModal");
    if (!dlg.open) dlg.showModal();
    // preview: prefer the full-res export, fall back to the proxy preview
    const src = (clip.export_url || clip.url || `/media/${clip.id}`) +
      "?t=" + Date.now();
    const v = $("smPreview"); v.src = src; v.play().catch(() => {});
    $("smClip").textContent = "#" + clip.id + " — " + (clip.title || "");
    await refresh();
  }
  window.openShareModal = openShareModal;

  async function refresh() {
    try {
      const s = await (await fetch("/api/social/status")).json();
      CFG = s;
    } catch (e) { CFG = { enabled: false }; }
    if (!CFG.enabled) { renderDisabled(); return; }
    await loadAccounts();
    renderAccounts();
    renderConnect();
    renderKinds();
    bindCaption();
    updatePublish();
    const hint = $("smPlanHint");
    if (hint) hint.textContent = ACCOUNTS.length
      ? `${ACCOUNTS.length} connected` : "8 platforms";
  }

  function renderDisabled() {
    $("smAccounts").innerHTML =
      `<div class="sm-empty">Sharing isn't configured yet. Add ` +
      `<code>ZERNIO_API_KEY</code> to <code>.env</code> ` +
      `(free key at zernio.com), then restart the studio.</div>`;
    $("smConnect").innerHTML = "";
    $("smKinds").innerHTML = "";
    $("smPublish").disabled = true;
  }

  async function loadAccounts() {
    try {
      const d = await (await fetch("/api/social/accounts")).json();
      ACCOUNTS = d.accounts || [];
      if (d.warning) setStatus(d.warning, "warn");
    } catch (e) { ACCOUNTS = []; }
  }

  function avatar(a) {
    if (a.avatar_url)
      return `<img class="sm-av" src="${a.avatar_url}" alt="" ` +
        `onerror="this.style.display='none'">`;
    const ch = (a.display_name || PLATFORM_LABEL[a.platform] || "?")[0]
      .toUpperCase();
    const bg = BRAND[a.platform] || "var(--accent-dim)";
    return `<span class="sm-av sm-av-ph" style="background:${bg}">${ch}</span>`;
  }

  function renderAccounts() {
    const box = $("smAccounts");
    if (!ACCOUNTS.length) {
      box.innerHTML = `<div class="sm-empty">No accounts connected yet — ` +
        `pick a platform below to connect one.</div>`;
      return;
    }
    box.innerHTML = ACCOUNTS.map(a => {
      const on = picked.has(a.id) ? " on" : "";
      const lbl = a.display_name || PLATFORM_LABEL[a.platform] || a.platform;
      return `<button class="sm-acct${on}" data-id="${a.id}">` +
        `${avatar(a)}<span class="sm-acct-meta">` +
        `<span class="sm-acct-nm">${lbl}</span>` +
        `<span class="sm-acct-pl">${PLATFORM_LABEL[a.platform] ||
          a.platform}</span></span>` +
        `<span class="sm-acct-x" data-x="${a.id}" title="Disconnect">✕` +
        `</span></button>`;
    }).join("");
    box.querySelectorAll(".sm-acct").forEach(el => {
      el.onclick = (e) => {
        if (e.target.dataset.x) return;        // the ✕ handles itself
        const id = +el.dataset.id;
        if (picked.has(id)) picked.delete(id); else picked.add(id);
        renderAccounts(); renderKinds(); updatePublish();
      };
    });
    box.querySelectorAll(".sm-acct-x").forEach(x => {
      x.onclick = async (e) => {
        e.stopPropagation();
        const id = +x.dataset.x;
        await fetch(`/api/social/accounts/${id}`, { method: "DELETE" });
        picked.delete(id);
        await loadAccounts(); renderAccounts(); renderKinds(); updatePublish();
      };
    });
  }

  function renderConnect() {
    // show a connect tile for every platform not already connected
    const have = new Set(ACCOUNTS.map(a => a.platform));
    const todo = PLATFORMS.filter(p => !have.has(p));
    $("smConnect").innerHTML = todo.map(p =>
      `<button class="sm-link" data-pl="${p}" style="--brand:${BRAND[p]}">` +
      `${ICONS[p] || ""}<span>${PLATFORM_LABEL[p]}</span></button>`).join("");
    $("smConnect").querySelectorAll(".sm-link").forEach(b => {
      b.onclick = () => connect(b.dataset.pl);
    });
  }

  async function connect(platform) {
    setStatus("Opening " + (PLATFORM_LABEL[platform] || platform) +
      " connect…", "");
    try {
      const r = await fetch("/api/social/connect", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      const d = await r.json();
      if (d.error) { setStatus(d.error, "err"); return; }
      window.open(d.url, "_blank", "noopener");
      setStatus("Authorize in the new tab, then come back — " +
        "we'll detect it.", "");
      // re-sync when the user returns to the studio tab
      const onFocus = async () => {
        window.removeEventListener("focus", onFocus);
        await loadAccounts(); renderAccounts(); renderKinds(); updatePublish();
        if (ACCOUNTS.length) setStatus("", "");
      };
      window.addEventListener("focus", onFocus);
    } catch (e) { setStatus("Network error.", "err"); }
  }

  // kinds available across the selected accounts (intersection of each
  // platform's supported kinds); default to the first.
  function allowedKinds() {
    const sel = ACCOUNTS.filter(a => picked.has(a.id));
    if (!sel.length || !CFG || !CFG.kinds) return ["post"];
    let inter = null;
    sel.forEach(a => {
      const ks = CFG.kinds[a.platform] || ["post"];
      inter = inter === null ? ks.slice() : inter.filter(k => ks.includes(k));
    });
    return (inter && inter.length) ? inter : ["post"];
  }

  function renderKinds() {
    const ks = allowedKinds();
    if (!ks.includes(kind)) kind = ks[0];
    $("smKinds").innerHTML = ks.map(k =>
      `<button class="sm-kind${k === kind ? " on" : ""}" data-k="${k}">` +
      `${k.toUpperCase()}</button>`).join("");
    $("smKinds").querySelectorAll(".sm-kind").forEach(b => {
      b.onclick = () => { kind = b.dataset.k; renderKinds(); };
    });
  }

  function bindCaption() {
    const t = $("smCaption");
    t.oninput = () => {
      const sel = ACCOUNTS.filter(a => picked.has(a.id));
      const soft = Math.min(...(sel.length
        ? sel.map(a => CAPTION_SOFT[a.platform] || 2200) : [2200]));
      const n = t.value.length;
      const c = $("smCount");
      c.textContent = n + (soft ? " / " + soft : "");
      c.classList.toggle("over", soft && n > soft);
    };
    t.oninput();
  }

  function updatePublish() {
    const n = picked.size;
    const btn = $("smPublish");
    btn.disabled = n === 0 || polling;
    btn.textContent = n > 1 ? `PUBLISH TO ${n} ACCOUNTS` : "PUBLISH";
  }

  function setStatus(msg, cls) {
    const el = $("smStatus");
    el.className = "sm-status" + (cls ? " sm-" + cls : "");
    el.textContent = msg || "";
  }

  async function publish() {
    if (!picked.size || polling) return;

    try {
      const st = await fetch("/api/state");
      if (st.status === 409) {
        setStatus("No hay ningún proyecto activo. Abre un proyecto antes de compartir.", "err");
        return;
      }
    } catch (e) {
      setStatus("No se pudo comprobar el proyecto activo.", "err");
      return;
    }

    $("smIssues").innerHTML = "";
    polling = true; updatePublish();
    setStatus("Publishing…", "");
    let r, d;
    try {
      const project = new URLSearchParams(window.location.search).get("project") || "";
      r = await fetch("/api/social/share", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project,
          clip_id: clip.id, account_ids: [...picked], kind,
          caption: $("smCaption").value,
        }),
      });
      d = await r.json();
    } catch (e) { polling = false; updatePublish();
      setStatus("Network error.", "err"); return; }

    if (r.status === 422 && d.issues) {     // destinations rejected pre-flight
      $("smIssues").innerHTML = `<div class="sm-issue-h">Can't publish:</div>` +
        Object.entries(d.issues).map(([name, list]) =>
          `<div class="sm-issue"><b>${name}</b>: ${list.join(" ")}</div>`
        ).join("");
      polling = false; updatePublish(); setStatus("", ""); return;
    }
    if (d.error) { polling = false; updatePublish();
      setStatus(d.error, "err"); return; }

    setStatus("Uploading & posting… (this exports full-res first)", "");
    await watchShares(d.share_ids || []);
    polling = false; updatePublish();
  }

  // Poll the share rows until every destination leaves the publishing state.
  async function watchShares(ids) {
    const want = new Set(ids);
    for (let i = 0; i < 120 && want.size; i++) {           // ~3 min budget
      await new Promise(res => setTimeout(res, 1500));
      let rows;
      try {
        const d = await (await fetch(
          "/api/social/shares?clip_id=" + clip.id)).json();
        rows = d.shares || [];
      } catch (e) { continue; }
      const mine = rows.filter(x => want.has(x.id));
      renderResults(mine);
      mine.forEach(x => {
        if (x.status !== "publishing") want.delete(x.id);
      });
    }
    if (!want.size) setStatus("Done.", "ok");
  }

  function renderResults(rows) {
    if (!rows.length) return;
    $("smStatus").innerHTML = "";
    const el = $("smIssues");
    el.innerHTML = `<div class="sm-issue-h">Results</div>` + rows.map(x => {
      const name = x.account_name || x.platform;
      if (x.status === "published" || x.status === "scheduled") {
        const link = x.post_url
          ? ` <a href="${x.post_url}" target="_blank">view ↗</a>` : "";
        return `<div class="sm-res ok">✓ <b>${name}</b> — ${x.status}${link}` +
          `</div>`;
      }
      if (x.status === "failed")
        return `<div class="sm-res err">✕ <b>${name}</b> — ${x.error ||
          "failed"}</div>`;
      return `<div class="sm-res">… <b>${name}</b> — ${x.status}</div>`;
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const x = $("smClose");
    if (x) x.onclick = () => { const v = $("smPreview"); v.pause(); v.src = "";
      $("shareModal").close(); };
    const p = $("smPublish");
    if (p) p.onclick = publish;
    const dlg = $("shareModal");
    if (dlg) dlg.addEventListener("click", (e) => {   // click backdrop = close
      if (e.target === dlg) { const v = $("smPreview"); v.pause(); v.src = "";
        dlg.close(); }
    });
  });
})();

