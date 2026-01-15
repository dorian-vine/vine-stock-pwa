function getLocal(key, fallback = null) {
  try {
    const v = localStorage.getItem(key);
    if (v === null || v === undefined) return fallback;
    // essaye JSON, sinon texte brut
    try { return JSON.parse(v); } catch { return v; }
  } catch {
    return fallback;
  }
}

function setLocal(key, value) {
  try {
    const v = (typeof value === "string") ? value : JSON.stringify(value);
    localStorage.setItem(key, v);
  } catch {}
}
