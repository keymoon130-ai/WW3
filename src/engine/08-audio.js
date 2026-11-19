/* ======================= AUDIO ======================= */
const AU = { ctx: null };
function initAudio() {
  if (AU.ctx) { if (AU.ctx.state !== 'running') AU.ctx.resume(); return; }
  const c = new (window.AudioContext || window.webkitAudioContext)(); AU.ctx = c;
  AU.master = c.createGain(); AU.master.gain.value = SET.vol; AU.master.connect(c.destination);
  const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 6; comp.connect(AU.master);
  AU.out = comp;
  AU.sfx = c.createGain(); AU.sfx.connect(comp);
  AU.music = c.createGain(); AU.music.gain.value = SET.music * 0.5; AU.music.connect(AU.master);
  // reverb
  const len = c.sampleRate * 2.2, ir = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
  AU.rev = c.createConvolver(); AU.rev.buffer = ir; AU.revIn = c.createGain(); AU.revIn.gain.value = 0.35; AU.revIn.connect(AU.rev); AU.rev.connect(comp);
  // noise
  const nb = c.createBuffer(1, c.sampleRate * 2, c.sampleRate); const nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1; AU.noise = nb;
  const bb = c.createBuffer(1, c.sampleRate * 2, c.sampleRate); const bd = bb.getChannelData(0); let last = 0; for (let i = 0; i < bd.length; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; bd[i] = last * 3.5; } AU.brown = bb;
  AU.voices = 0;
  startAmbience();
}
function setVolumes() { if (!AU.ctx) return; AU.master.gain.value = SET.vol; AU.music.gain.value = SET.music * 0.5; }
const _ad = v3();
/* spatial params from world pos */
function spatial(pos, ref = 18) {
  if (!pos) return { g: 1, pan: 0, lp: 20000, d: 0 };
  _ad.subVectors(pos, camera.position); const d = _ad.length();
  const yaw = camera.rotation.y; const rx = Math.cos(yaw), rz = -Math.sin(yaw);
  const pan = d > 0.5 ? clamp((_ad.x * rx + _ad.z * rz) / d, -1, 1) * 0.85 : 0;
  return { g: 1 / (1 + Math.pow(d / ref, 1.4)), pan, lp: clamp(18000 / (1 + d / 40), 500, 18000), d };
}
function voiceOut(g, pan, wet = 0.3, dest) {
  const c = AU.ctx; const p = c.createStereoPanner ? c.createStereoPanner() : null;
  if (p) { p.pan.value = pan; g.connect(p); p.connect(dest || AU.sfx); if (wet > 0) { const w = c.createGain(); w.gain.value = wet; p.connect(w); w.connect(AU.revIn); } }
  else { g.connect(dest || AU.sfx); }
}
function noiseBurst({ t = 0, dur = 0.2, f = 1000, f2 = null, type = 'lowpass', q = 0.7, gain = 1, att = 0.002, pan = 0, wet = 0.3, brown = false, rate = 1 }) {
  const c = AU.ctx; if (!c || AU.voices > 48) return; const t0 = c.currentTime + t;
  const s = c.createBufferSource(); s.buffer = brown ? AU.brown : AU.noise; s.playbackRate.value = rate;
  const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t0); fl.Q.value = q; if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t0 + att); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(fl); fl.connect(g); voiceOut(g, pan, wet);
  s.start(t0, rand(0, 1)); s.stop(t0 + dur + 0.05); AU.voices++; s.onended = () => AU.voices--;
}
function tone({ t = 0, dur = 0.2, f = 440, f2 = null, type = 'sine', gain = 0.3, att = 0.003, pan = 0, wet = 0.15, dest }) {
  const c = AU.ctx; if (!c || AU.voices > 48) return; const t0 = c.currentTime + t;
  const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t0 + att); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); voiceOut(g, pan, wet, dest); o.start(t0); o.stop(t0 + dur + 0.05); AU.voices++; o.onended = () => AU.voices--;
}
/* a sweep whose loudness grows towards the end (incoming shells): osc or noise, frequency glide, swelling gain, cut off at the end */
function swell({ t = 0, dur = 1.5, f = 1200, f2 = 300, type = 'sine', noise = false, q = 4, g0 = 0.005, g1 = 0.3, pan = 0, wet = 0.2 }) {
  const c = AU.ctx; if (!c || AU.voices > 48) return; const t0 = c.currentTime + t;
  let src; if (noise) { src = c.createBufferSource(); src.buffer = AU.noise; src.loop = true; } else { src = c.createOscillator(); src.type = type; src.frequency.setValueAtTime(f, t0); src.frequency.exponentialRampToValueAtTime(f2, t0 + dur); }
  let node = src; if (noise) { const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = q; bp.frequency.setValueAtTime(f, t0); bp.frequency.exponentialRampToValueAtTime(f2, t0 + dur); src.connect(bp); node = bp; }
  const g = c.createGain(); g.gain.setValueAtTime(g0, t0); g.gain.exponentialRampToValueAtTime(g1, t0 + dur * 0.97); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + 0.04);
  node.connect(g); voiceOut(g, pan, wet); src.start(t0); src.stop(t0 + dur + 0.08); AU.voices++; src.onended = () => AU.voices--;
}
/* a jet going over: one roaring voice that follows the aircraft — doppler pitch, distance filter, and the tearing hiss right overhead */
function jetVoice() {
  const c = AU.ctx; if (!c) return null;
  const mk = (buf, type, f, q) => { const s = c.createBufferSource(); s.buffer = buf; s.loop = true; const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const g = c.createGain(); g.gain.value = 0; s.connect(fl); fl.connect(g); s.start(0, rand(0, 1.5)); return { s, fl, g }; };
  const roar = mk(AU.brown || AU.noise, 'lowpass', 500, 0.7), tear = mk(AU.noise, 'bandpass', 2600, 0.9), whine = c.createOscillator(); whine.type = 'sawtooth'; const wg = c.createGain(); wg.gain.value = 0; const wf = c.createBiquadFilter(); wf.type = 'bandpass'; wf.Q.value = 6; whine.connect(wf); wf.connect(wg); whine.start();
  const mix = c.createGain(); mix.gain.value = 1; roar.g.connect(mix); tear.g.connect(mix); wg.connect(mix);
  const pn = c.createStereoPanner ? c.createStereoPanner() : null; if (pn) { mix.connect(pn); pn.connect(AU.sfx); } else mix.connect(AU.sfx); const w = c.createGain(); w.gain.value = 0.4; mix.connect(w); w.connect(AU.revIn);
  let lastD = null;
  const voice = {
    update(pos, dt) { const sp = spatial(pos, 120); const d = sp.d; const vr = lastD === null ? 0 : (d - lastD) / Math.max(dt, 1e-3); lastD = d; // + receding, - approaching
      const dop = clamp(340 / (340 + vr), 0.55, 1.8); const near = 1 / (1 + Math.pow(d / 90, 1.6)); const t = c.currentTime;
      roar.s.playbackRate.setTargetAtTime(dop, t, 0.05); roar.fl.frequency.setTargetAtTime(clamp(250 + 900 * near * dop, 150, 2200), t, 0.05); roar.g.gain.setTargetAtTime(Math.min(1.6, 1.9 * near + 0.05), t, 0.05);
      tear.s.playbackRate.setTargetAtTime(dop, t, 0.05); tear.fl.frequency.setTargetAtTime(clamp(1800 * dop * (0.6 + near), 600, 7000), t, 0.05); tear.g.gain.setTargetAtTime(Math.min(1.2, 1.6 * near * near + (vr < 0 ? 0.04 : 0)), t, 0.04);
      whine.frequency.setTargetAtTime(2600 * dop, t, 0.05); wf.frequency.setTargetAtTime(2600 * dop, t, 0.05); wg.gain.setTargetAtTime(0.05 * near * (vr < 0 ? 1.4 : 0.5), t, 0.05);
      if (pn) pn.pan.setTargetAtTime(sp.pan, t, 0.05); if (d < 70) G.shake = Math.max(G.shake, 0.25 * (1 - d / 70)); },
    stop() { if (voice.dead) return; voice.dead = true; const t = c.currentTime; for (const n of [roar.g, tear.g, wg]) n.gain.setTargetAtTime(0, t, 0.6); setTimeout(() => { try { roar.s.stop(); tear.s.stop(); whine.stop(); } catch (e) {} }, 3000); },
  };
  (AU.jets = AU.jets || []).push(voice); AU.jets = AU.jets.filter((v) => !v.dead);
  return voice;
}
const SFX = {
  shot(kind, pos) {
    if (!AU.ctx) return; const sp = spatial(pos, 25); const delay = pos ? sp.d / 340 : 0; const g = sp.g;
    if (g < 0.01) return;
    if (kind === 'rifle') { noiseBurst({ t: delay, dur: 0.16, f: Math.min(5200, sp.lp), type: 'lowpass', gain: 0.9 * g, pan: sp.pan, wet: pos ? 0.5 : 0.35 }); tone({ t: delay, dur: 0.12, f: 140, f2: 45, type: 'sine', gain: 0.8 * g, pan: sp.pan }); noiseBurst({ t: delay, dur: 0.45, f: 700, type: 'lowpass', gain: 0.25 * g, pan: sp.pan, att: 0.01, wet: 0.6 }); }
    else if (kind === 'enemy') { noiseBurst({ t: delay, dur: 0.14, f: Math.min(3200, sp.lp), type: 'lowpass', gain: 0.75 * g, pan: sp.pan, wet: 0.55 }); tone({ t: delay, dur: 0.1, f: 120, f2: 50, gain: 0.45 * g, pan: sp.pan }); }
    else if (kind === 'sniper') { noiseBurst({ t: delay, dur: 0.3, f: Math.min(4200, sp.lp), gain: 1.0 * g, pan: sp.pan, wet: 0.7 }); tone({ t: delay, dur: 0.25, f: 110, f2: 35, gain: 0.95 * g, pan: sp.pan }); noiseBurst({ t: delay + 0.05, dur: 1.4, f: 500, gain: 0.3 * g, att: 0.02, wet: 0.9 }); }
    else if (kind === 'gl') { noiseBurst({ t: delay, dur: 0.1, f: 900, type: 'lowpass', gain: 0.8 * g, pan: sp.pan, wet: 0.3 }); tone({ t: delay, dur: 0.12, f: 90, f2: 40, type: 'sine', gain: 0.8 * g, pan: sp.pan }); }
    else if (kind === 'pistol') { noiseBurst({ t: delay, dur: 0.12, f: 4200, gain: 0.7 * g, pan: sp.pan }); tone({ t: delay, dur: 0.08, f: 200, f2: 60, gain: 0.5 * g }); }
    else if (kind === 'sd') { noiseBurst({ t: delay, dur: 0.07, f: 1800, type: 'bandpass', q: 1.2, gain: 0.35 * g, pan: sp.pan, wet: 0.05 }); tone({ t: delay, dur: 0.05, f: 90, f2: 40, gain: 0.25 * g }); }
    else if (kind === 'mg') { noiseBurst({ t: delay, dur: 0.12, f: Math.min(2400, sp.lp), gain: 0.85 * g, pan: sp.pan, wet: 0.6 }); tone({ t: delay, dur: 0.1, f: 90, f2: 40, gain: 0.6 * g, pan: sp.pan }); }
    else if (kind === 'rpg') { noiseBurst({ t: delay, dur: 0.9, f: 1800, f2: 300, gain: 0.9 * g, pan: sp.pan, att: 0.01, wet: 0.5 }); tone({ t: delay, dur: 0.25, f: 80, f2: 30, gain: 0.7 * g }); }
    else if (kind === 'cannon') { noiseBurst({ t: delay, dur: 1.2, f: Math.min(1400, sp.lp), f2: 120, gain: 1.2 * g, pan: sp.pan, att: 0.004, wet: 0.7, brown: false }); tone({ t: delay, dur: 0.5, f: 60, f2: 25, gain: 1 * g, pan: sp.pan });
      const far = spatial(pos, 150); if (sp.d > 60) { noiseBurst({ t: delay, dur: 2.4, f: 240, f2: 70, type: 'lowpass', gain: 0.75 * far.g, pan: far.pan, att: 0.02, wet: 0.85 }); tone({ t: delay, dur: 1.3, f: 44, f2: 22, type: 'sine', gain: 0.65 * far.g, pan: far.pan }); } }
    else if (kind === 'rocket') { noiseBurst({ t: delay, dur: 0.95, f: 2600, f2: 520, type: 'bandpass', q: 0.9, gain: 0.85 * g, pan: sp.pan, att: 0.008, wet: 0.45 }); tone({ t: delay, dur: 0.16, f: 190, f2: 60, gain: 0.55 * g, pan: sp.pan }); noiseBurst({ t: delay + 0.05, dur: 0.6, f: 900, f2: 300, type: 'lowpass', gain: 0.4 * g, pan: sp.pan, wet: 0.3 }); }
    else if (kind === 'flak') { noiseBurst({ t: delay, dur: 0.1, f: 3000, gain: 0.7 * g, pan: sp.pan }); tone({ t: delay, dur: 0.09, f: 110, f2: 45, gain: 0.7 * g }); }
  },
  explosion(pos, big = 1, delayed = true) {
    if (!AU.ctx) return; const sp = spatial(pos, 60 * big); const delay = delayed ? sp.d / 340 : 0; const g = Math.min(1.6, sp.g * big);
    if (g < 0.01) return;
    noiseBurst({ t: delay, dur: 1.6 + big * 0.6, f: Math.min(2600, sp.lp), f2: 90, gain: 1.2 * g, pan: sp.pan, att: 0.005, wet: 0.7, brown: false });
    noiseBurst({ t: delay, dur: 2.4, f: 260, type: 'lowpass', gain: 1.1 * g, pan: sp.pan, att: 0.01, brown: true, wet: 0.5 });
    tone({ t: delay, dur: 0.8, f: 55, f2: 22, gain: 1.2 * g, pan: sp.pan });
    noiseBurst({ t: delay, dur: 0.09, f: 2500, type: 'highpass', gain: 0.9 * g, pan: sp.pan, att: 0.001, wet: 0.2 });             // the crack
    tone({ t: delay, dur: 1.6 + big * 0.4, f: 42, f2: 16, gain: 1.3 * g, pan: sp.pan, att: 0.004, wet: 0.2 });                   // pressure
    noiseBurst({ t: delay + 0.05, dur: 3.2 + big, f: 140, type: 'lowpass', gain: 0.7 * g, att: 0.08, brown: true, wet: 0.95 }); // rolling echo
    if (sp.d < 45) for (let i = 0; i < 10; i++) noiseBurst({ t: delay + 0.5 + rand(0, 1.4), dur: 0.05, f: rand(1500, 3500), type: 'bandpass', q: 2, gain: 0.12 * g, pan: rand(-0.7, 0.7), wet: 0.1 }); // debris rain
    if (sp.d < 30) noiseBurst({ t: delay + 0.2, dur: 1.4, f: 5000, type: 'highpass', gain: 0.08 * g, pan: rand(-0.5, 0.5), att: 0.3, wet: 0.1 });
  },
  scream(pos) { if (!AU.ctx) return; const sp = spatial(pos, 30); if (sp.g < 0.05) return; tone({ dur: 1.1, f: rand(420, 560), f2: rand(260, 330), type: 'sawtooth', gain: 0.05 * sp.g, att: 0.05, pan: sp.pan, wet: 0.4 }); noiseBurst({ dur: 1.0, f: 1400, type: 'bandpass', q: 3, gain: 0.08 * sp.g, att: 0.05, pan: sp.pan, wet: 0.4 }); },
  shout(pos) { if (!AU.ctx) return; const sp = spatial(pos, 35); if (sp.g < 0.05) return; const f = rand(150, 220); tone({ dur: 0.35, f, f2: f * 0.8, type: 'sawtooth', gain: 0.035 * sp.g, att: 0.02, pan: sp.pan, wet: 0.35 }); noiseBurst({ dur: 0.3, f: rand(700, 1100), type: 'bandpass', q: 4, gain: 0.06 * sp.g, att: 0.02, pan: sp.pan, wet: 0.35 }); },
  boomFar(pos) { if (!AU.ctx) return; const sp = spatial(pos, 200); noiseBurst({ t: sp.d / 340, dur: 2.6, f: 220, gain: 0.8 * Math.max(0.12, sp.g), brown: true, pan: sp.pan, att: 0.04, wet: 0.9 }); },
  whiz(pan) { noiseBurst({ dur: 0.12, f: 3000, f2: 1200, type: 'bandpass', q: 3, gain: 0.35, pan, wet: 0 }); },
  crack(pan) { noiseBurst({ dur: 0.04, f: 6000, type: 'highpass', gain: 0.4, pan, wet: 0 }); },
  // hand-held illumination rocket: the thump of the launch, the hiss of the motor climbing; then the pop of the candle and parachute up high
  flareLaunch(pos) { const sp = spatial(pos, 25); if (sp.g < 0.03) return; noiseBurst({ dur: 0.09, f: 700, type: 'bandpass', q: 1, gain: 0.7 * sp.g, pan: sp.pan, wet: 0.2 }); noiseBurst({ t: 0.05, dur: 1.8, f: 3200, f2: 1100, type: 'bandpass', q: 0.8, gain: 0.22 * sp.g, pan: sp.pan, wet: 0.3 }); },
  flarePop(pos) { const sp = spatial(pos, 70); if (sp.g < 0.03) return; noiseBurst({ dur: 0.14, f: 420, type: 'lowpass', gain: 0.55 * sp.g, pan: sp.pan, wet: 0.5 }); },
  // a crowd breaking into cheers: many voices as overlapping vowel-band noise, swelling and falling over a few seconds
  cheer(pos, dur = 4) { const sp = spatial(pos, 30); if (sp.g < 0.03) return; for (let i = 0; i < 26; i++) { const t = rand(0, dur * 0.7), f = rand(500, 1400); noiseBurst({ t, dur: rand(0.5, 1.4), f, f2: f * rand(0.85, 1.2), type: 'bandpass', q: rand(3, 7), gain: 0.22 * sp.g, att: 0.08, pan: sp.pan + rand(-0.3, 0.3), wet: 0.6 }); } },
  impact(pos) { const sp = spatial(pos, 8); if (sp.g < 0.05) return; noiseBurst({ dur: 0.06, f: 2400, type: 'bandpass', q: 1.5, gain: 0.35 * sp.g, pan: sp.pan, wet: 0.1 }); },
  metal(pos) { const sp = spatial(pos, 10); tone({ dur: 0.18, f: rand(1400, 2400), type: 'triangle', gain: 0.2 * sp.g, pan: sp.pan }); },
  hit() { tone({ dur: 0.06, f: 1800, type: 'square', gain: 0.07, wet: 0 }); noiseBurst({ dur: 0.04, f: 4000, type: 'highpass', gain: 0.12, wet: 0 }); },
  head() { tone({ dur: 0.09, f: 2600, type: 'square', gain: 0.08, wet: 0 }); tone({ t: 0.03, dur: 0.12, f: 900, type: 'sine', gain: 0.15, wet: 0 }); },
  hurt() { noiseBurst({ dur: 0.2, f: 400, gain: 0.5, wet: 0 }); tone({ dur: 0.25, f: 70, f2: 40, gain: 0.5, wet: 0 }); },
  click() { tone({ dur: 0.03, f: 2400, type: 'square', gain: 0.08, wet: 0 }); },
  reload(w) {
    const seq = w === 'pistol' ? [[0.2, 1600], [0.9, 1200], [1.2, 2200]] : w === 'rpg' || w === 'atgm' ? [[0.5, 800], [1.6, 600], [2.4, 1500]] : [[0.25, 1700], [0.8, 1100], [1.4, 1500], [1.8, 2300]];
    for (const [t, f] of seq) { noiseBurst({ t, dur: 0.05, f, type: 'bandpass', q: 3, gain: 0.35, wet: 0.05 }); tone({ t, dur: 0.04, f: f * 0.5, type: 'square', gain: 0.03, wet: 0 }); }
  },
  step(snowy) { noiseBurst({ dur: 0.09, f: snowy ? 1400 : 900, type: 'bandpass', q: 0.8, gain: 0.12, wet: 0.05, pan: rand(-0.1, 0.1) }); },
  pin() { tone({ dur: 0.05, f: 3200, type: 'triangle', gain: 0.12 }); tone({ t: 0.1, dur: 0.05, f: 2800, type: 'triangle', gain: 0.1 }); },
  radio() { tone({ dur: 0.06, f: 1300, type: 'square', gain: 0.05, wet: 0 }); noiseBurst({ dur: 0.18, f: 2500, type: 'bandpass', q: 0.6, gain: 0.08, wet: 0 }); },
  ui() { tone({ dur: 0.05, f: 720, type: 'triangle', gain: 0.08, wet: 0 }); },
  uiOk() { tone({ dur: 0.08, f: 520, type: 'triangle', gain: 0.1, wet: 0 }); tone({ t: 0.07, dur: 0.12, f: 780, type: 'triangle', gain: 0.1, wet: 0 }); },
  type() { noiseBurst({ dur: 0.02, f: 3000, type: 'bandpass', q: 2, gain: 0.06, wet: 0 }); },
  objective() { tone({ dur: 0.15, f: 660, type: 'sine', gain: 0.12 }); tone({ t: 0.12, dur: 0.25, f: 990, type: 'sine', gain: 0.12 }); },
  heartbeat() { tone({ dur: 0.12, f: 55, f2: 40, gain: 0.5, wet: 0 }); tone({ t: 0.22, dur: 0.12, f: 50, f2: 38, gain: 0.35, wet: 0 }); },
  whistle(pos) { SFX.incoming(pos, 0.9); },
  crackle(pos) { const sp = spatial(pos, 80); for (let i = 0; i < 12; i++) noiseBurst({ t: sp.d / 340 + rand(0, 0.8), dur: 0.03, f: 3500, type: 'highpass', gain: 0.25 * Math.max(0.15, sp.g), pan: sp.pan + rand(-0.2, 0.2), wet: 0.4 }); },
  incoming(pos, dur = 1.7) { if (!AU.ctx) return; const sp = spatial(pos, 45); const g = Math.max(0.25, sp.g); swell({ dur, f: 1500, f2: 420, type: 'sine', g0: 0.004, g1: 0.22 * g, pan: sp.pan, wet: 0.25 }); swell({ dur, f: 2800, f2: 900, noise: true, q: 3, g0: 0.002, g1: 0.5 * g, pan: sp.pan, wet: 0.3 }); swell({ t: dur * 0.55, dur: dur * 0.45, f: 300, f2: 120, noise: true, q: 1, g0: 0.01, g1: 0.6 * g, pan: sp.pan, wet: 0.2 }); },
  ring(dur = 6) { tone({ dur, f: 3800, type: 'sine', gain: 0.06, att: 0.05, wet: 0 }); },
  melee() { noiseBurst({ dur: 0.15, f: 700, gain: 0.5, wet: 0 }); },
};
/* loops (engine, rotor, wind) */
function makeLoop(kind) {
  if (!AU.ctx) return { set() {}, stop() {} };
  const c = AU.ctx; const out = c.createGain(); out.gain.value = 0; const pan = c.createStereoPanner ? c.createStereoPanner() : null;
  let nodes = [];
  if (kind === 'wind') { const s = c.createBufferSource(); s.buffer = AU.brown; s.loop = true; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 500; f.Q.value = 0.5; const l = c.createOscillator(); l.frequency.value = 0.13; const lg = c.createGain(); lg.gain.value = 250; l.connect(lg); lg.connect(f.frequency); s.connect(f); f.connect(out); s.start(); l.start(); nodes = [s, l]; }
  else if (kind === 'engine') { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 38; const s = c.createBufferSource(); s.buffer = AU.brown; s.loop = true; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260; const g2 = c.createGain(); g2.gain.value = 0.4; o.connect(g2); g2.connect(f); s.connect(f); f.connect(out); o.start(); s.start(); nodes = [o, s]; out._o = o; }
  else if (kind === 'tilt') { // tiltrotor: slow heavy proprotor beat, a deep hum under it, turbine whine on top
    const s = c.createBufferSource(); s.buffer = AU.brown; s.loop = true; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260; const am = c.createGain(); am.gain.value = 0.55; const l = c.createOscillator(); l.type = 'sine'; l.frequency.value = 8.5; const lg = c.createGain(); lg.gain.value = 0.45; l.connect(lg); lg.connect(am.gain); s.connect(f); f.connect(am); am.connect(out);
    const h = c.createOscillator(); h.type = 'sawtooth'; h.frequency.value = 47; const hf = c.createBiquadFilter(); hf.type = 'lowpass'; hf.frequency.value = 140; const hg = c.createGain(); hg.gain.value = 0.35; h.connect(hf); hf.connect(hg); hg.connect(out);
    const w = c.createOscillator(); w.type = 'sine'; w.frequency.value = 1180; const wg = c.createGain(); wg.gain.value = 0.025; w.connect(wg); wg.connect(out);
    s.start(); l.start(); h.start(); w.start(); nodes = [s, l, h, w]; }
  else if (kind === 'rotor') { const s = c.createBufferSource(); s.buffer = AU.brown; s.loop = true; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 380; const am = c.createGain(); am.gain.value = 0.5; const l = c.createOscillator(); l.type = 'square'; l.frequency.value = 13; const lg = c.createGain(); lg.gain.value = 0.5; l.connect(lg); lg.connect(am.gain); s.connect(f); f.connect(am); am.connect(out); s.start(); l.start(); nodes = [s, l]; }
  else if (kind === 'sea') { const s = c.createBufferSource(); s.buffer = AU.noise; s.loop = true; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700; const l = c.createOscillator(); l.frequency.value = 0.12; const lg = c.createGain(); lg.gain.value = 0.5; const am = c.createGain(); am.gain.value = 0.6; l.connect(lg); lg.connect(am.gain); s.connect(f); f.connect(am); am.connect(out); s.start(); l.start(); nodes = [s, l]; }
  else if (kind === 'fire') { const s = c.createBufferSource(); s.buffer = AU.noise; s.loop = true; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1200; f.Q.value = 0.4; s.connect(f); f.connect(out); s.start(); nodes = [s]; }
  else if (kind === 'hum') { const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = 110; o.connect(out); o.start(); nodes = [o]; }
  if (pan) { out.connect(pan); pan.connect(AU.sfx); } else out.connect(AU.sfx);
  const L = {
    vol: 0,
    set(v, p = 0, pitch) { const t = c.currentTime; out.gain.setTargetAtTime(v, t, 0.1); if (pan) pan.pan.setTargetAtTime(p, t, 0.1); if (pitch && out._o) out._o.frequency.setTargetAtTime(pitch, t, 0.2); },
    at(pos, ref, base = 1, pitch) { const sp = spatial(pos, ref); this.set(sp.g * base, sp.pan, pitch); },
    stop() { try { out.gain.setTargetAtTime(0, c.currentTime, 0.1); setTimeout(() => { nodes.forEach((n) => { try { n.stop(); } catch (e) {} }); out.disconnect(); }, 600); } catch (e) {} },
  };
  return L;
}
function startAmbience() { AU.wind = makeLoop('wind'); }
const MUSIC = { nodes: [], playing: null };
function playMusic(kind) {
  if (!AU.ctx) return; dmStop(); if (MUSIC.playing === kind) return; stopMusic(); MUSIC.playing = kind;
  const c = AU.ctx; const out = c.createGain(); out.gain.value = 0; out.gain.setTargetAtTime(1, c.currentTime, 1.5); out.connect(AU.music);
  const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = kind === 'sad' ? 900 : 1200; f.connect(out);
  const rv = c.createGain(); rv.gain.value = 0.6; f.connect(rv); rv.connect(AU.revIn);
  const chords = kind === 'sad' ? [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]] : [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 58], [40, 47, 52, 56]];
  const oscs = []; for (let i = 0; i < 4; i++) for (let dtn of [-6, 6]) { const o = c.createOscillator(); o.type = 'sawtooth'; o.detune.value = dtn; const g = c.createGain(); g.gain.value = 0.035; o.connect(g); g.connect(f); o.start(); oscs.push({ o, i }); }
  const sub = c.createOscillator(); sub.type = 'sine'; const sg = c.createGain(); sg.gain.value = 0.12; sub.connect(sg); sg.connect(out); sub.start();
  let k = 0; const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const step = () => { const ch = chords[k++ % chords.length]; const t = c.currentTime; for (const { o, i } of oscs) o.frequency.setTargetAtTime(mtof(ch[i % ch.length] + (i === 3 && ch.length < 4 ? 12 : 0)), t, 0.4); sub.frequency.setTargetAtTime(mtof(ch[0] - 12), t, 0.3);
    // sparse bell
    if (Math.random() < 0.8) tone({ t: rand(0.5, 2.5), dur: 3, f: mtof(ch[randi(0, ch.length - 1)] + 12), type: 'sine', gain: 0.05, att: 0.02, wet: 0.8, dest: AU.music }); };
  step(); const iv = setInterval(step, kind === 'sad' ? 5200 : 4400);
  MUSIC.nodes = [out, iv, sub, oscs];
}
/* ---- dynamic combat score: one 4-bar D-minor loop, five layers faded by battle intensity ---- */
const DM = { on: false, voices: 0, bpm: 112, step: 0, next: 0, iv: null, lv: { pad: 0, pulse: 0, drums: 0, brass: 0, boss: 0 } };
const DM_CH = [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]]; // Dm  Bb  Gm  A
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
function dmVoice(t, { f, f2, type = 'sawtooth', dur = 0.2, gain = 0.1, att = 0.004, lp, lp2, q = 0.8, dest, noise, hp }) {
  const c = AU.ctx; if (!c || DM.voices > 70) return; DM.voices++;
  let src; if (noise) { src = c.createBufferSource(); src.buffer = AU.noise; } else { src = c.createOscillator(); src.type = type; src.frequency.setValueAtTime(f, t); if (f2) src.frequency.exponentialRampToValueAtTime(f2, t + dur); }
  let node = src;
  if (lp || hp) { const fl = c.createBiquadFilter(); fl.type = hp ? 'highpass' : 'lowpass'; fl.frequency.setValueAtTime(hp || lp, t); fl.Q.value = q; if (lp2) fl.frequency.exponentialRampToValueAtTime(lp2, t + dur * 0.8); node.connect(fl); node = fl; }
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  node.connect(g); g.connect(dest || DM.out); src.start(t, noise ? Math.random() : 0); src.stop(t + dur + 0.05); src.onended = () => { DM.voices--; };
}
function dmStart() {
  if (!AU.ctx || DM.on) return; const c = AU.ctx; DM.on = true;
  const out = c.createGain(); out.gain.value = 0; out.gain.setTargetAtTime(1, c.currentTime, 1.2); out.connect(AU.music); DM.out = out;
  const rv = c.createGain(); rv.gain.value = 0.3; rv.connect(AU.revIn); DM.rv = rv;
  DM.L = {}; for (const k of ['pad', 'pulse', 'drums', 'brass', 'boss']) { const g = c.createGain(); g.gain.value = 0; g.connect(out); if (k === 'pad' || k === 'brass' || k === 'boss') g.connect(rv); DM.L[k] = g; DM.lv[k] = 0; }
  const pf = c.createBiquadFilter(); pf.type = 'lowpass'; pf.frequency.value = 650; pf.Q.value = 0.6; pf.connect(DM.L.pad);
  const lfo = c.createOscillator(); lfo.frequency.value = 0.07; const lg = c.createGain(); lg.gain.value = 250; lfo.connect(lg); lg.connect(pf.frequency); lfo.start();
  DM.pad = [lfo]; DM.padO = [];
  for (let i = 0; i < 3; i++) for (const d of [-8, 8]) { const o = c.createOscillator(); o.type = 'sawtooth'; o.detune.value = d; const g = c.createGain(); g.gain.value = 0.028; o.connect(g); g.connect(pf); o.start(); DM.padO.push({ o, i }); DM.pad.push(o); }
  const sub = c.createOscillator(); sub.type = 'sine'; const sg = c.createGain(); sg.gain.value = 0.07; sub.connect(sg); sg.connect(DM.L.pad); sub.start(); DM.pad.push(sub); DM.sub = sub;
  DM.step = 0; DM.next = c.currentTime + 0.12; DM.iv = setInterval(dmSched, 40);
}
function dmStop() {
  if (!DM.on) return; DM.on = false; clearInterval(DM.iv); const c = AU.ctx; const out = DM.out, pad = DM.pad, rv = DM.rv;
  try { out.gain.setTargetAtTime(0, c.currentTime, 0.8); setTimeout(() => { try { pad.forEach((o) => o.stop()); out.disconnect(); rv.disconnect(); } catch (e) {} }, 4000); } catch (e) {}
}
function dmSet(intensity, boss) {
  if (!DM.on) return; const c = AU.ctx, t = c.currentTime, I = intensity;
  const lv = { pad: 0.95 - I * 0.35, pulse: clamp((I - 0.12) * 3, 0, 1), drums: clamp((I - 0.35) * 2.6, 0, 1), brass: clamp((I - 0.62) * 3, 0, 1), boss: boss ? 1 : 0 };
  if (boss) { lv.pulse = Math.max(lv.pulse, 0.8); lv.drums = Math.max(lv.drums, 0.7); }
  for (const k in lv) { DM.lv[k] = lv[k]; DM.L[k].gain.setTargetAtTime(lv[k], t, lv[k] > DM.L[k].gain.value ? 0.6 : 2.2); }
}
function dmStinger(kind) {
  if (!DM.on) return; const t = AU.ctx.currentTime + 0.02, ch = DM_CH[Math.floor(DM.step / 16) % 4];
  // crash
  dmVoice(t, { noise: true, hp: 5000, dur: 2.2, gain: 0.22, att: 0.003 });
  if (kind === 'boss') {
    for (let i = 0; i < 6; i++) dmVoice(t + i * 0.11, { f: 80, f2: 38, type: 'sine', dur: 0.5, gain: 0.5 });
    for (const n of [ch[0] - 24, ch[0] - 12, ch[0] - 5]) dmVoice(t, { f: mtof(n) * 0.97, f2: mtof(n), dur: 3.2, gain: 0.09, att: 0.6, lp: 300, lp2: 1400 });
  } else {
    dmVoice(t, { f: 110, f2: 40, type: 'sine', dur: 0.6, gain: 0.55 });
    for (const n of ch) for (const o of [0, 12]) dmVoice(t, { f: mtof(n + o), dur: 1.4, gain: 0.07, att: 0.01, lp: 3000, lp2: 600 });
  }
}
function dmSched() {
  const c = AU.ctx; if (!c || !DM.on) return; if (G.paused) { DM.next = c.currentTime + 0.1; return; } const sixteenth = 60 / DM.bpm / 4;
  while (DM.next < c.currentTime + 0.18) { dmPlay(DM.step, DM.next); DM.next += sixteenth; DM.step++; }
}
function dmPlay(step, t) {
  const bar = Math.floor(step / 16) % 4, s = step % 16, ch = DM_CH[bar], root = ch[0], L = DM.L, lv = DM.lv;
  if (s === 0) { for (const { o, i } of DM.padO) o.frequency.setTargetAtTime(mtof(ch[i] + (i === 0 ? 0 : 0)), t, 0.35); DM.sub.frequency.setTargetAtTime(mtof(root - 24), t, 0.3); }
  if (lv.pulse > 0.02) { // driving 16th ostinato with octave pops
    const acc = s % 4 === 0, pop = s === 6 || s === 14;
    dmVoice(t, { f: mtof(root - 12 + (pop ? 12 : 0)), dur: acc ? 0.2 : 0.12, gain: acc ? 0.13 : 0.075, lp: acc ? 900 : 600, lp2: 220, dest: L.pulse });
  }
  if (lv.drums > 0.02) {
    const fill = bar === 3 && s >= 12;
    if (s === 0 || s === 7 || s === 8 || (s === 10 && lv.drums > 0.6)) dmVoice(t, { f: 125, f2: 42, type: 'sine', dur: 0.32, gain: 0.6, dest: L.drums });
    if ((s === 4 || s === 12) && !fill) { dmVoice(t, { noise: true, lp: 2600, dur: 0.2, gain: 0.32, dest: L.drums }); dmVoice(t, { f: 200, f2: 150, type: 'triangle', dur: 0.1, gain: 0.18, dest: L.drums }); }
    if (s % 2 === 0 && !fill) dmVoice(t, { noise: true, hp: 7500, dur: s === 14 ? 0.18 : 0.04, gain: s % 4 === 2 ? 0.09 : 0.05, dest: L.drums });
    if (fill) dmVoice(t, { f: [160, 130, 105, 85][s - 12], f2: 60, type: 'sine', dur: 0.25, gain: 0.45, dest: L.drums });
  }
  if (lv.brass > 0.02) {
    if (s === 0 && (bar === 0 || bar === 2)) for (const n of ch) for (const d of [0.996, 1.004]) dmVoice(t, { f: mtof(n + 12) * d, dur: 1.6, gain: 0.045, att: 0.05, lp: 500, lp2: 2400, dest: L.brass });
    const motif = bar === 1 ? { 0: [62, 5], 6: [65, 2], 8: [64, 4], 12: [62, 4] } : bar === 3 ? { 0: [57, 4], 4: [58, 4], 8: [61, 4], 12: [57, 4] } : null;
    if (motif && motif[s]) { const [n, len] = motif[s]; for (const d of [0.997, 1.003]) dmVoice(t, { f: mtof(n) * d, dur: len * 60 / DM.bpm / 4 + 0.15, gain: 0.06, att: 0.04, lp: 800, lp2: 2000, dest: L.brass }); }
  }
  if (lv.boss > 0.02) {
    if ([0, 3, 6, 10, 12].includes(s)) { dmVoice(t, { f: 72, f2: 36, type: 'sine', dur: 0.55, gain: 0.55, dest: L.boss }); dmVoice(t, { noise: true, lp: 400, dur: 0.25, gain: 0.25, dest: L.boss }); }
    if (s === 0) dmVoice(t, { f: mtof(root - 24), dur: 2.0, gain: 0.12, att: 0.2, lp: 260, lp2: 700, q: 4, dest: L.boss });
    dmVoice(t, { f: mtof(ch[s % 3] + 12), type: 'triangle', dur: 0.1, gain: 0.03, dest: L.boss });
  }
}
function stopMusic() {
  dmStop();
  if (!MUSIC.nodes.length) { MUSIC.playing = null; return; }
  const [out, iv, sub, oscs] = MUSIC.nodes; clearInterval(iv);
  try { out.gain.setTargetAtTime(0, AU.ctx.currentTime, 0.6); setTimeout(() => { try { sub.stop(); oscs.forEach((x) => x.o.stop()); out.disconnect(); } catch (e) {} }, 3000); } catch (e) {}
  MUSIC.nodes = []; MUSIC.playing = null;
}
