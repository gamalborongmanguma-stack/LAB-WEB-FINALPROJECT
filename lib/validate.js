export const str = (fd, k) => String(fd.get(k) ?? '').trim();
export const int = (fd, k) => { const v = Number(fd.get(k)); return Number.isInteger(v) ? v : NaN; };
export const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
export const goto = (path, type, msg) => `${path}?${type}=${encodeURIComponent(msg)}`;
