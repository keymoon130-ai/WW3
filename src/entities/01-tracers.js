/* =========================================================
   entities: soldiers, vehicles, projectiles, explosions, tracers
   ========================================================= */

/* ---------------- tracers ---------------- */
const TRMAX = 160;
const trGeo = new THREE.BufferGeometry();
const trPos = new Float32Array(TRMAX * 6), trCol = new Float32Array(TRMAX * 6);
trGeo.setAttribute('position', new THREE.BufferAttribute(trPos, 3).setUsage(THREE.DynamicDrawUsage));
trGeo.setAttribute('color', new THREE.BufferAttribute(trCol, 3).setUsage(THREE.DynamicDrawUsage));
trGeo.userData.keep = true;
const tracers = new THREE.LineSegments(trGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
tracers.frustumCulled = false; scene.add(tracers);
const TR = []; let trHead = 0;
for (let i = 0; i < TRMAX; i++) TR.push({ a: v3(), b: v3(), t: 0, len: 0, life: 0, col: [1, 0.8, 0.5] });
function tracer(a, b, col = [1, 0.75, 0.4], speed = 380) {
  const T = TR[trHead]; trHead = (trHead + 1) % TRMAX;
  T.a.copy(a); T.b.copy(b); T.len = a.distanceTo(b); T.t = 0; T.life = T.len / speed; T.col = col; T.speed = speed;
}
const _ta = v3(), _tb = v3();
function updateTracers(dt) {
  for (let i = 0; i < TRMAX; i++) {
    const T = TR[i];
    if (T.life <= 0 || T.t > T.life) { for (let k = 0; k < 6; k++) trCol[i * 6 + k] = 0; continue; }
    T.t += dt; const k1 = clamp(T.t / T.life, 0, 1), k0 = clamp((T.t * T.speed - 4) / T.len, 0, 1);
    _ta.lerpVectors(T.a, T.b, k0); _tb.lerpVectors(T.a, T.b, k1);
    trPos.set([_ta.x, _ta.y, _ta.z, _tb.x, _tb.y, _tb.z], i * 6);
    trCol.set([T.col[0] * 0.2, T.col[1] * 0.2, T.col[2] * 0.2, T.col[0], T.col[1], T.col[2]], i * 6);
  }
  trGeo.attributes.position.needsUpdate = true; trGeo.attributes.color.needsUpdate = true;
}
