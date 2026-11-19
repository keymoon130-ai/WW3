/* ---------------- renderer ---------------- */
const canvas = $('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: SET.quality === 'high', powerPreference: 'high-performance' });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.autoClear = false;
renderer.shadowMap.enabled = SET.quality !== 'low';
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
function applyQuality() {
  renderer.setPixelRatio(Math.min(devicePixelRatio, SET.quality === 'low' ? 1 : SET.quality === 'ultra' ? 1.25 : 1.5));
  renderer.shadowMap.enabled = SET.quality !== 'low';
}
applyQuality();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(SET.fov, innerWidth / innerHeight, 0.05, 3000);
camera.rotation.order = 'YXZ';
scene.add(camera);
const vmScene = new THREE.Scene();
const vmCam = new THREE.PerspectiveCamera(54, innerWidth / innerHeight, 0.01, 20);
const vmHemi = new THREE.HemisphereLight(0xffffff, 0x333333, 1.4);
const vmDir = new THREE.DirectionalLight(0xffffff, 1.6);
vmDir.position.set(1.5, 2, 1);
const vmFlash = new THREE.PointLight(0xffb060, 0, 3, 2);
vmFlash.position.set(0.1, -0.05, -0.9);
vmScene.add(vmHemi, vmDir, vmFlash);

/* ---------------- post-processing ('ultra' quality): ambient occlusion, bloom, filmic grade, vignette, grain, FXAA ---------------- */
const GradeShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uVig: { value: 0.38 }, uGrain: { value: 0.035 }, uSat: { value: 0.96 }, uCon: { value: 1.12 }, uTint: { value: new THREE.Vector3(1.0, 0.99, 0.96) }, uLift: { value: new THREE.Vector3(0.0, 0.004, 0.01) }, uCA: { value: 0.0016 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime, uVig, uGrain, uSat, uCon, uCA; uniform vec2 uRes; uniform vec3 uTint, uLift; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec2 d = vUv - 0.5; float r2 = dot(d, d);
      vec3 c; c.r = texture2D(tDiffuse, vUv - d * uCA * r2 * 8.0).r; c.g = texture2D(tDiffuse, vUv).g; c.b = texture2D(tDiffuse, vUv + d * uCA * r2 * 8.0).b;
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(vec3(l), c, uSat);                          // a little less saturated: dust and smoke
      c = (c - 0.5) * uCon + 0.5;                         // a touch more contrast
      c = c * uTint + uLift * (1.0 - l);                  // warm highlights, cool lifted shadows
      c *= 1.0 - uVig * smoothstep(0.12, 0.62, r2 * 1.6);  // vignette
      c += (h(vUv * uRes + fract(uTime * 13.0) * 91.7) - 0.5) * uGrain; // film grain
      gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
    }`,
};
const POST = { comp: null, on: false };
function postOn() { return SET.quality === 'ultra'; }
function buildPost() {
  const w = innerWidth, h = innerHeight, pr = renderer.getPixelRatio();
  const rt = new THREE.WebGLRenderTarget(w * pr, h * pr, { type: THREE.HalfFloatType, samples: 0 });
  const comp = new EffectComposer(renderer, rt);
  const rp = new RenderPass(scene, camera); comp.addPass(rp);
  const ao = new GTAOPass(scene, camera, w, h); ao.output = GTAOPass.OUTPUT.Default; ao.blendIntensity = 1.0;
  ao.updateGtaoMaterial({ radius: 2.5, distanceExponent: 2, thickness: 3, scale: 1.6, samples: 16, distanceFallOff: 1, screenSpaceRadius: false });
  ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
  comp.addPass(ao);
  // the AO pass sees a short camera (0.2 .. 380 m): good depth precision up close, and nothing far away gets darkened
  { const r0 = ao.render.bind(ao); ao.render = (...args) => { const hid = (G.noAO || []).filter((o) => o.visible); for (const o of hid) o.visible = false; const n = camera.near, f = camera.far; camera.near = 0.2; camera.far = 380; camera.updateProjectionMatrix();
      try { ao.gtaoMaterial.uniforms.cameraNear.value = 0.2; ao.gtaoMaterial.uniforms.cameraFar.value = 380; ao.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(camera.projectionMatrix); ao.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(camera.projectionMatrixInverse); r0(...args); }
      finally { camera.near = n; camera.far = f; camera.updateProjectionMatrix(); for (const o of hid) o.visible = true; } }; }
  // half-float overflow (stacked additive flashes right at the lens) and NaNs would be smeared over the whole screen by the bloom: clamp them here
  const clean = new ShaderPass({ uniforms: { tDiffuse: { value: null } }, vertexShader: GradeShader.vertexShader,
    fragmentShader: 'uniform sampler2D tDiffuse; varying vec2 vUv; void main(){ vec4 c = texture2D(tDiffuse, vUv); bool bad = !(c.r == c.r) || !(c.g == c.g) || !(c.b == c.b); gl_FragColor = bad ? vec4(0.0, 0.0, 0.0, 1.0) : vec4(clamp(c.rgb, 0.0, 48.0), 1.0); }' });
  comp.addPass(clean);
  const vp = new RenderPass(vmScene, vmCam); vp.clear = false; vp.clearDepth = true; comp.addPass(vp);
  const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.22, 0.4, 1.25); comp.addPass(bloom);
  comp.addPass(new OutputPass());
  const fx = new ShaderPass(FXAAShader); fx.material.uniforms.resolution.value.set(1 / (w * pr), 1 / (h * pr)); comp.addPass(fx);
  const gr = new ShaderPass(GradeShader); gr.uniforms.uRes.value.set(w, h); comp.addPass(gr);
  Object.assign(POST, { comp, rp, ao, vp, bloom, fx, gr, on: true });
}
function renderFrame(withVM) {
  if (postOn()) {
    if (!POST.comp) buildPost();
    POST.vp.enabled = !!withVM; POST.gr.uniforms.uTime.value = performance.now() / 1000;
    POST.ao.enabled = !(G && G.cut && G.cut.noAO);
    POST.comp.render();
    return;
  }
  renderer.clear(); renderer.render(scene, camera);
  if (withVM) { renderer.clearDepth(); renderer.render(vmScene, vmCam); }
}
function resizePost() {
  if (!POST.comp) return; const w = innerWidth, h = innerHeight, pr = renderer.getPixelRatio();
  POST.comp.setPixelRatio(pr); POST.comp.setSize(w, h); POST.fx.material.uniforms.resolution.value.set(1 / (w * pr), 1 / (h * pr)); POST.gr.uniforms.uRes.value.set(w, h);
}

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = vmCam.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix(); vmCam.updateProjectionMatrix();
  updateParticleScale(); resizePost();
}
