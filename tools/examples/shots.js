// example for tools/shots.cjs — m10a 「수도」 phase 4 (index 11, PH=4): ride along 국회대로
const at = (s) => `G.phaseI === 4 && P.ride && (window.__t0 ??= G.time) && G.time > window.__t0 + ${s}`;
module.exports = [
  { name: 'ride', when: at(5), cam: null },
  { name: 'bend', when: at(60), cam: `[230, 120, -2160, 60, 0, -2420]`, fov: 70 },
];
