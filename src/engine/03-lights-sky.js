/* lights (constant count to avoid shader recompiles) */
const hemi = new THREE.HemisphereLight(0xbfd0e0, 0x404040, 0.6);
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 400 });
sun.shadow.bias = -0.0005;
sun.shadow.normalBias = 0.04;
scene.add(hemi, sun, sun.target);
const PLIGHTS = [];
for (let i = 0; i < 6; i++) { const l = new THREE.PointLight(0xffaa55, 0, 30, 2); l.userData = { t: 0, life: 0, peak: 0 }; scene.add(l); PLIGHTS.push(l); }
let plightI = 0;
const lampLight = new THREE.PointLight(0xffb870, 0, 10, 1.6); scene.add(lampLight);
const flashlight = new THREE.SpotLight(0xfff0d8, 0, 38, 0.42, 0.55, 1.4);
flashlight.position.set(0.25, -0.2, 0); flashlight.target.position.set(0, -0.3, -6);
camera.add(flashlight); camera.add(flashlight.target);
function flashLight(pos, color, peak, range, life) {
  let l = PLIGHTS[plightI++ % PLIGHTS.length]; for (let i = 0; i < PLIGHTS.length && l.userData.held; i++) l = PLIGHTS[plightI++ % PLIGHTS.length]; if (l.userData.held) return;
  l.position.copy(pos); l.color.set(color); l.distance = range;
  l.userData.t = 0; l.userData.life = life; l.userData.peak = peak; l.intensity = peak;
}
/* a long-burning light (an illumination flare) takes one pool light for itself; at most two at a time so explosions still have four */
function holdLight() { if (PLIGHTS.filter((l) => l.userData.held).length >= 2) return null; const l = PLIGHTS.find((x) => !x.userData.held && x.userData.life <= 0) || PLIGHTS.find((x) => !x.userData.held); if (!l) return null; l.userData.held = true; l.userData.life = 0; return l; }
function releaseLight(l) { if (!l) return; l.intensity = 0; l.decay = 2; l.userData.held = false; }
function updateLights(dt) {
  for (const l of PLIGHTS) { const u = l.userData; if (u.held || u.life <= 0) continue; u.t += dt; const k = 1 - u.t / u.life; l.intensity = k > 0 ? u.peak * k * k : 0; if (k <= 0) u.life = 0; }
}

/* sky */
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { top: { value: new THREE.Color(0x101820) }, mid: { value: new THREE.Color(0x303840) }, bot: { value: new THREE.Color(0x404850) }, glowDir: { value: v3(0, 0.1, -1).normalize() }, glowCol: { value: new THREE.Color(0x000000) } },
  vertexShader: `varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top,mid,bot,glowDir,glowCol; varying vec3 vP;
    void main(){ float h=vP.y; vec3 c = h>0.0 ? mix(mid,top,smoothstep(0.0,0.55,h)) : mix(mid,bot,smoothstep(0.0,-0.2,h));
      float g=max(dot(vP,glowDir),0.0); c+=glowCol*pow(g,6.0)*1.2 + glowCol*pow(g,40.0);
      gl_FragColor=vec4(c,1.); }`,
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(1800, 32, 16), skyMat);
sky.renderOrder = -10;
scene.add(sky);
const starGeo = new THREE.BufferGeometry();
{ const a = []; for (let i = 0; i < 1500; i++) { const t = rand(0, TAU), p = Math.acos(rand(0.05, 1)); a.push(Math.cos(t) * Math.sin(p) * 1600, Math.cos(p) * 1600, Math.sin(t) * Math.sin(p) * 1600); } starGeo.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); }
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.4, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 }));
scene.add(stars);
