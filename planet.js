import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js";

const container = document.getElementById("planetCanvas");
const stage = document.getElementById("planetStage");

if (container && stage && "WebGLRenderingContext" in window) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.15, 6.1);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  container.appendChild(renderer.domElement);

  const world = new THREE.Group();
  scene.add(world);

  /* Procedural texture keeps the planet detailed without external image requests. */
  function makePlanetTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#d6a4ff");
    gradient.addColorStop(0.24, "#9961ed");
    gradient.addColorStop(0.55, "#6a39b8");
    gradient.addColorStop(0.8, "#3d216d");
    gradient.addColorStop(1, "#1b102d");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* Broad atmospheric bands. */
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 20; i++) {
      const y = (i / 20) * canvas.height + Math.sin(i * 1.7) * 12;
      const h = 6 + Math.random() * 18;
      const band = ctx.createLinearGradient(0, y, canvas.width, y + h);
      band.addColorStop(0, `rgba(255,176,105,${0.015 + Math.random() * 0.025})`);
      band.addColorStop(0.5, `rgba(221,177,255,${0.025 + Math.random() * 0.04})`);
      band.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = band;
      ctx.fillRect(0, y, canvas.width, h);
    }

    /* Soft storm structures. */
    ctx.globalCompositeOperation = "overlay";
    for (let i = 0; i < 75; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const rx = 18 + Math.random() * 90;
      const ry = 4 + Math.random() * 24;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, Math.random() * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = Math.random() > 0.5
        ? `rgba(255,155,90,${0.02 + Math.random() * 0.05})`
        : `rgba(88,35,150,${0.04 + Math.random() * 0.08})`;
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  }

  const planetTexture = makePlanetTexture();
  const planetGeometry = new THREE.SphereGeometry(1.45, 96, 64);
  const planetMaterial = new THREE.MeshPhysicalMaterial({
    map: planetTexture,
    color: 0xffffff,
    roughness: 0.72,
    metalness: 0.03,
    clearcoat: 0.32,
    clearcoatRoughness: 0.6
  });

  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  planet.rotation.z = -0.09;
  world.add(planet);

  /* Rim atmosphere. */
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.52, 72, 48),
    new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        glowColor: { value: new THREE.Color(0xb77cff) }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPositionNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        varying vec3 vPositionNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, -vPositionNormal), 2.4);
          gl_FragColor = vec4(glowColor, intensity * 0.62);
        }
      `
    })
  );
  world.add(atmosphere);

  /* Two elegant orbital tracks. */
  function makeOrbit(color, radius, tiltX, tiltY, opacity) {
    const mesh = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.009, 10, 220),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    mesh.rotation.x = tiltX;
    mesh.rotation.y = tiltY;
    return mesh;
  }

  const orbitOrange = makeOrbit(0xffa45d, 2.06, 1.18, 0.23, 0.82);
  const orbitPurple = makeOrbit(0xb57aff, 1.88, 1.78, -0.48, 0.72);
  world.add(orbitOrange, orbitPurple);

  /* Orbital particles. */
  const moteCount = 180;
  const motePositions = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i++) {
    const radius = 2.2 + Math.random() * 1.4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    motePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    motePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.72;
    motePositions[i * 3 + 2] = radius * Math.cos(phi);
  }

  const moteGeometry = new THREE.BufferGeometry();
  moteGeometry.setAttribute("position", new THREE.BufferAttribute(motePositions, 3));
  const motes = new THREE.Points(
    moteGeometry,
    new THREE.PointsMaterial({
      color: 0xd9b5ff,
      size: 0.018,
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    })
  );
  world.add(motes);

  scene.add(new THREE.HemisphereLight(0xe9d8ff, 0x190d27, 1.3));

  const keyLight = new THREE.DirectionalLight(0xffd5b5, 3.4);
  keyLight.position.set(-3.4, 2.8, 4.2);
  scene.add(keyLight);

  const purpleLight = new THREE.PointLight(0x8f4dff, 4.2, 12);
  purpleLight.position.set(3.4, 1.1, 3.2);
  scene.add(purpleLight);

  const warmLight = new THREE.PointLight(0xff7f42, 2.4, 10);
  warmLight.position.set(-2.8, -1.7, 2.1);
  scene.add(warmLight);

  let targetX = 0;
  let targetY = 0;
  let pointerInside = false;
  let visible = true;

  function setPointerTarget(event) {
    const rect = stage.getBoundingClientRect();
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    targetY = nx * 0.34;
    targetX = ny * 0.18;
  }

  stage.addEventListener("pointerenter", () => { pointerInside = true; });
  stage.addEventListener("pointermove", setPointerTarget, { passive: true });
  stage.addEventListener("pointerleave", () => {
    pointerInside = false;
    targetX = 0;
    targetY = 0;
  });

  function resize() {
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  const visibilityObserver = new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting ?? true;
  }, { threshold: 0.02 });
  visibilityObserver.observe(stage);

  document.addEventListener("visibilitychange", () => {
    visible = !document.hidden && (visibilityObserver ? visible : true);
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    if (!visible || document.hidden) return;

    const dt = Math.min(clock.getDelta(), 0.04);
    const idleSpeed = reducedMotion ? 0 : 0.11;

    planet.rotation.y += dt * idleSpeed;
    atmosphere.rotation.y -= dt * idleSpeed * 0.24;
    orbitOrange.rotation.z += dt * (reducedMotion ? 0 : 0.08);
    orbitPurple.rotation.z -= dt * (reducedMotion ? 0 : 0.055);
    motes.rotation.y += dt * (reducedMotion ? 0 : 0.025);

    world.rotation.x += (targetX - world.rotation.x) * 0.045;
    world.rotation.y += (targetY - world.rotation.y) * 0.045;

    if (!pointerInside && !reducedMotion) {
      world.rotation.z = Math.sin(performance.now() * 0.00035) * 0.018;
    }

    renderer.render(scene, camera);
  }

  container.classList.add("ready");
  animate();
}
