// Preferences must not prevent the portfolio loading when storage is blocked.
export function readPreference(key) {
    try { return localStorage.getItem(key); }
    catch { return null; }
}
export function writePreference(key, value) {
    try { localStorage.setItem(key, String(value)); }
    catch { /* Browsing continues without persisted preferences. */ }
}
