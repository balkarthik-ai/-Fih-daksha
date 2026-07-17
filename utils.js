function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getScoreDelta(color) {
  if (color === 'green') return 2;
  if (color === 'red') return -2;
  return 0;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    clamp,
    getScoreDelta,
  };
}
