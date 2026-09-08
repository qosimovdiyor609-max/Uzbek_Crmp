import * as THREE from 'three';
import './style.css';

const root = document.querySelector<HTMLDivElement>('#game')!;
const moneyEl = document.querySelector<HTMLElement>('#money')!;
const messageEl = document.querySelector<HTMLElement>('#message')!;
const menu = document.querySelector<HTMLDivElement>('#menu')!;
const startButton = document.querySelector<HTMLButtonElement>('#start')!;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8ecdf0);
scene.fog = new THREE.Fog(0x8ecdf0, 120, 330);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 32, 28);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
root.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xdff5ff, 0x6b705c, 2.2));
const sun = new THREE.DirectionalLight(0xffffff, 3.2);
sun.position.set(60, 90, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(300, 300),
  new THREE.MeshStandardMaterial({ color: 0x6fa36b, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

function box(x: number, y: number, z: number, w: number, h: number, d: number, color: number) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color }));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function road(x: number, z: number, w: number, d: number) {
  box(x, 0.03, z, w, 0.08, d, 0x34373a);
}

// O'zbekiston ruhidagi original shahar xaritasi.
road(0, 0, 280, 10);
road(0, 0, 10, 280);
road(-65, -45, 120, 8);
road(65, 55, 120, 8);
road(-70, 65, 8, 120);
road(70, -55, 8, 120);

for (let x = -120; x <= 120; x += 24) {
  for (let z = -120; z <= 120; z += 24) {
    if (Math.abs(x) < 18 || Math.abs(z) < 18) continue;
    const h = 5 + (Math.abs(x * 7 + z * 3) % 13);
    const colors = [0xd6b48a, 0xc7d3d8, 0xe0c28f, 0xb9c6b0];
    box(x, h / 2, z, 13, h, 13, colors[Math.abs(x + z) % colors.length]);
  }
}

// Markaziy maydon va O'zbekiston ranglaridagi shahar belgisi.
box(0, 0.12, 0, 34, 0.2, 34, 0xb8b39a);
box(0, 3, 0, 3, 6, 3, 0xffffff);
box(0, 6.8, 0, 8, 0.15, 5, 0x1f9d55);
box(0, 7.1, 0, 8, 0.15, 5, 0xffffff);
box(0, 7.4, 0, 8, 0.15, 5, 0xce2b37);

// Daraxtlar.
for (let i = 0; i < 70; i++) {
  const x = ((i * 37) % 250) - 125;
  const z = ((i * 61) % 250) - 125;
  if (Math.abs(x) < 14 || Math.abs(z) < 14) continue;
  box(x, 1.3, z, 0.7, 2.6, 0.7, 0x6b4326);
  const crown = new THREE.Mesh(new THREE.SphereGeometry(2.2, 10, 8), new THREE.MeshStandardMaterial({ color: 0x287a3f }));
  crown.position.set(x, 3.4, z);
  crown.castShadow = true;
  scene.add(crown);
}

// O'yinchi.
const player = new THREE.Group();
const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.65, 1.1, 6, 12), new THREE.MeshStandardMaterial({ color: 0x1f4d8f }));
body.position.y = 1.35;
body.castShadow = true;
player.add(body);
const head = new THREE.Mesh(new THREE.SphereGeometry(0.48, 16, 12), new THREE.MeshStandardMaterial({ color: 0xc98f68 }));
head.position.y = 2.55;
head.castShadow = true;
player.add(head);
player.position.set(0, 0, 12);
scene.add(player);

// Oddiy mashina prototipi.
const car = new THREE.Group();
const carBody = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 7), new THREE.MeshStandardMaterial({ color: 0xc73535 }));
carBody.position.y = 1;
car.add(carBody);
const cabin = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.2, 3), new THREE.MeshStandardMaterial({ color: 0x9dd7ee }));
cabin.position.set(0, 1.9, -0.2);
car.add(cabin);
for (const x of [-1.9, 1.9]) for (const z of [-2.3, 2.3]) {
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.5, 16), new THREE.MeshStandardMaterial({ color: 0x181818 }));
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(x, 0.65, z);
  car.add(wheel);
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
  const speed = (keys.has('shift') ? 10 : 5) * dt;
  const target = driving ? car : player;
  if (keys.has('w')) target.position.z -= speed;
  if (keys.has('s')) target.position.z += speed;
  if (keys.has('a')) target.position.x -= speed;
  if (keys.has('d')) target.position.x += speed;
  target.position.x = THREE.MathUtils.clamp(target.position.x, -140, 140);
  target.position.z = THREE.MathUtils.clamp(target.position.z, -140, 140);
  if (driving) player.position.copy(car.position);

  const follow = new THREE.Vector3(target.position.x, target.position.y + 27, target.position.z + 25);
  camera.position.lerp(follow, 1 - Math.pow(0.001, dt));
  camera.lookAt(target.position.x, 0, target.position.z);
  moneyEl.textContent = cash.toLocaleString('uz-UZ');
  renderer.render(scene, camera);
}
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
