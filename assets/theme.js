// Runs before first paint so a stored theme never flashes. Kept as its own
// file rather than an inline block so the CSP can stay at script-src 'self'
// with no hash that a whitespace edit would silently invalidate.
try {
  var storedTheme = localStorage.getItem("conduit.theme");
  if (storedTheme) {
    document.documentElement.setAttribute("data-theme", storedTheme);
  }
} catch (error) {}
