import * as THREE from 'three';
import './style.css';

const root = document.querySelector<HTMLDivElement>('#game')!;
const moneyEl = document.querySelector<HTMLElement>('#money')!;
const messageEl = document.querySelector<HTMLElement>('#message')!;
const menu = document.querySelector<HTMLDivElement>('#menu')!;
const startButton = document.querySelector<HTMLButtonElement>('#start')!;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fc9df);
scene.fog = new THREE.Fog(0x9fc9df, 90, 320);

const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 7, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
root.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xeaf7ff, 0x4e5a55, 2.0));
const sun = new THREE.DirectionalLight(0xfff4df, 3.0);
sun.position.set(70, 100, 35);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(320, 320),
  new THREE.MeshStandardMaterial({ color: 0x6e9566, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

function box(x: number, y: number, z: number, w: number, h: number, d: number, color: number) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.82 })
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function road(x: number, z: number, w: number, d: number) {
  box(x, 0.03, z, w, 0.08, d, 0x303338);
  // Sidewalks give the street a denser city-RP look.
  if (w > d) {
    box(x, 0.06, z - d / 2 - 1.3, w, 0.12, 2.6, 0x8a8d8b);
    box(x, 0.06, z + d / 2 + 1.3, w, 0.12, 2.6, 0x8a8d8b);
  } else {
    box(x - w / 2 - 1.3, 0.06, z, 2.6, 0.12, d, 0x8a8d8b);
    box(x + w / 2 + 1.3, 0.06, z, 2.6, 0.12, d, 0x8a8d8b);
  }
}

function roadMark(x: number, z: number, horizontal = true) {
  const length = 5;
  if (horizontal) box(x, 0.085, z, length, 0.025, 0.18, 0xe8e1c9);
  else box(x, 0.085, z, 0.18, 0.025, length, 0xe8e1c9);
}

// Original Uzbek-city map with a denser RP-style street layout.
road(0, 0, 280, 12);
road(0, 0, 12, 280);
road(-68, -46, 125, 9);
road(68, 52, 125, 9);
road(-70, 66, 9, 125);
road(70, -58, 9, 125);

for (let x = -135; x <= 135; x += 12) {
  if (Math.abs(x) > 18) roadMark(x, 0, true);
}
for (let z = -135; z <= 135; z += 12) {
  if (Math.abs(z) > 18) roadMark(0, z, false);
}

const buildingColors = [0xb7a488, 0xc9b48f, 0xaeb9ba, 0xd6c6a5, 0x9ea9a8];
for (let x = -120; x <= 120; x += 24) {
  for (let z = -120; z <= 120; z += 24) {
    if (Math.abs(x) < 20 || Math.abs(z) < 20) continue;
    const h = 6 + (Math.abs(x * 7 + z * 3) % 12);
    const building = box(x, h / 2, z, 15, h, 15, buildingColors[Math.abs(x + z) % buildingColors.length]);

    // Dark window bands make the buildings read more like city blocks.
    for (let row = 0; row < Math.floor(h / 3); row++) {
      const windowY = 1.8 + row * 3;
      const front = new THREE.Mesh(
        new THREE.BoxGeometry(7, 1.15, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x425764, roughness: 0.35, metalness: 0.1 })
      );
      front.position.set(x, windowY, z - 7.55);
      scene.add(front);
      const side = front.clone();
      side.rotation.y = Math.PI / 2;
      side.position.set(x - 7.55, windowY, z);
      scene.add(side);
    }

    // Small shop-like ground floor on some blocks.
    if ((x + z) % 48 === 0) {
      box(x, 1.15, z - 7.7, 8, 2.1, 0.25, 0x2c4f61);
      box(x, 2.3, z - 7.85, 9, 0.18, 0.35, 0xf0d34d);
    }
    void building;
  }
}

// Central plaza and Uzbek-inspired landmark colors.
box(0, 0.12, 0, 38, 0.2, 38, 0xb5b19f);
box(0, 3, 0, 3, 6, 3, 0xffffff);
box(0, 6.8, 0, 8, 0.15, 5, 0x1f9d55);
box(0, 7.1, 0, 8, 0.15, 5, 0xffffff);
box(0, 7.4, 0, 8, 0.15, 5, 0xce2b37);

function tree(x: number, z: number) {
  box(x, 1.4, z, 0.7, 2.8, 0.7, 0x684128);
  const crown = new THREE.Mesh(
    new THREE.SphereGeometry(2.25, 12, 9),
    new THREE.MeshStandardMaterial({ color: 0x286d3a, roughness: 1 })
  );
  crown.position.set(x, 3.6, z);
  crown.castShadow = true;
  scene.add(crown);
}

for (let i = 0; i < 58; i++) {
  const x = ((i * 37) % 250) - 125;
  const z = ((i * 61) % 250) - 125;
  if (Math.abs(x) < 17 || Math.abs(z) < 17) continue;
  tree(x, z);
}

function streetLamp(x: number, z: number, horizontal = true) {
  box(x, 2.7, z, 0.18, 5.4, 0.18, 0x30343a);
  if (horizontal) {
    box(x + 1.0, 5.3, z, 2.0, 0.16, 0.16, 0x30343a);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff0b0 }));
    lamp.position.set(x + 1.85, 5.25, z);
    scene.add(lamp);
  } else {
    box(x, 5.3, z + 1.0, 0.16, 0.16, 2.0, 0x30343a);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff0b0 }));
    lamp.position.set(x, 5.25, z + 1.85);
    scene.add(lamp);
  }
}

for (let p = -120; p <= 120; p += 30) {
  streetLamp(p, 8, true);
  streetLamp(8, p, false);
  streetLamp(p, -8, true);
  streetLamp(-8, p, false);
}

// Player.
const player = new THREE.Group();
const body = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.65, 1.1, 6, 12),
  new THREE.MeshStandardMaterial({ color: 0x245b9e })
);
body.position.y = 1.35;
body.castShadow = true;
player.add(body);
const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.48, 16, 12),
  new THREE.MeshStandardMaterial({ color: 0xc98f68 })
);
head.position.y = 2.55;
head.castShadow = true;
player.add(head);
player.position.set(0, 0, 12);
scene.add(player);

// Simple original sedan.
const car = new THREE.Group();
const carBody = new THREE.Mesh(
  new THREE.BoxGeometry(4.2, 1, 7.2),
  new THREE.MeshStandardMaterial({ color: 0xb52f35, roughness: 0.65 })
);
carBody.position.y = 1;
car.add(carBody);
const cabin = new THREE.Mesh(
  new THREE.BoxGeometry(3.3, 1.25, 3.2),
  new THREE.MeshStandardMaterial({ color: 0x4d6875, roughness: 0.25, metalness: 0.2 })
);
cabin.position.set(0, 1.9, -0.25);
car.add(cabin);
for (const x of [-2.0, 2.0]) {
  for (const z of [-2.35, 2.35]) {
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.67, 0.67, 0.5, 16),
      new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 1 })
    );
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.67, z);
    car.add(wheel);
  }
}
car.position.set(7, 0, 12);
car.traverse(o => { if (o instanceof THREE.Mesh) o.castShadow = true; });
scene.add(car);

const keys = new Set<string>();
let driving = false;
const cash = 5000;

addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  keys.add(key);
  if (key === 'e') toggleCar();
});
addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));

function toggleCar() {
  if (player.position.distanceTo(car.position) > 5) {
    showMessage('🚗 Mashina yoniga boring.');
    return;
  }
  driving = !driving;
  showMessage(driving ? '🚗 Mashinaga kirdingiz.' : '🚶 Mashinadan tushdingiz.');
}

function showMessage(text: string) {
  messageEl.textContent = text;
  window.setTimeout(() => { messageEl.textContent = ''; }, 2200);
}

startButton.addEventListener('click', () => menu.classList.add('hidden'));

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const speed = (keys.has('shift') ? 11 : 5.5) * dt;
  const target = driving ? car : player;

  if (keys.has('w')) target.position.z -= speed;
  if (keys.has('s')) target.position.z += speed;
  if (keys.has('a')) target.position.x -= speed;
  if (keys.has('d')) target.position.x += speed;

  target.position.x = THREE.MathUtils.clamp(target.position.x, -140, 140);
  target.position.z = THREE.MathUtils.clamp(target.position.z, -140, 140);
  if (driving) player.position.copy(car.position);

  // Low third-person chase camera instead of the old top-down view.
  const follow = new THREE.Vector3(target.position.x, target.position.y + 6.2, target.position.z + 9.5);
  camera.position.lerp(follow, 1 - Math.pow(0.0005, dt));
  camera.lookAt(target.position.x, 1.4, target.position.z - 1.5);

  moneyEl.textContent = cash.toLocaleString('uz-UZ');
  renderer.render(scene, camera);
}
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
