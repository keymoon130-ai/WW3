import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

/* =========================================================
   WW3 — core: utils, renderer, audio, particles, world
   ========================================================= */
const TAU = Math.PI * 2;
const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const v3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
const smooth = (t) => t * t * (3 - 2 * t);
const $ = (id) => document.getElementById(id);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};
class Abort extends Error { constructor() { super('abort'); } }

const SET = Object.assign({ sens: 1, vol: 0.8, music: 0.5, quality: 'high', fov: 75, diff: 1, adsToggle: true, xhair: 0.5, xdot: true, rdot: 0.3, sparks: true, bright: 1 }, store.get('tumen_set', {}));
const DIFF = [
  { name: '신병', dmg: 0.45, acc: 0.6 },
  { name: '정규군', dmg: 1, acc: 1 },
  { name: '역전용사', dmg: 1.7, acc: 1.35 },
];
