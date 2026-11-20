import * as THREE from "three";

// إعداد المشهد
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x77716a);
scene.fog = new THREE.Fog(0x77716a, 8, 22);

// الكاميرا
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.set(0, 1.65, 3.5);

// محرك الرسم
const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;

document.getElementById("game").prepend(renderer.domElement);

// الإضاءة
const ambientLight = new THREE.HemisphereLight(
  0xffffff,
  0x554433,
  2
);

scene.add(ambientLight);

const mainLight = new THREE.PointLight(
  0xffdfb0,
  45,
  15
);

mainLight.position.set(0, 3.3, 0);
mainLight.castShadow = true;

scene.add(mainLight);

// إنشاء الخامات
function material(color) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85
  });
}

// إنشاء صندوق
function createBox(name, width, height, depth, x, y, z, color) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const mesh = new THREE.Mesh(geometry, material(color));

  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  scene.add(mesh);

  return mesh;
}

// الأرضية
createBox(
  "floor",
  10, 0.2, 10,
  0, -0.1, 0,
  0x746052
);

// السقف
createBox(
  "ceiling",
  10, 0.2, 10,
  0, 3.4, 0,
  0xaaa096
);

// الحوائط
createBox("backWall", 10, 3.4, 0.2, 0, 1.6, -5, 0xb8a99a);

createBox("frontWall", 10, 3.4, 0.2, 0, 1.6, 5, 0x9c8978);

createBox("leftWall", 0.2, 3.4, 10, -5, 1.6, 0, 0xb8a99a);

createBox("rightWall", 0.2, 3.4, 10, 5, 1.6, 0, 0xb8a99a);

// السرير
createBox(
  "bedBase",
  2.2, 0.35, 2.5,
  -2.8, 0.25, -2,
  0x49352e
);

createBox(
  "mattress",
  2.1, 0.2, 2.35,
  -2.8, 0.52, -2,
  0xd6c8b9
);

createBox(
  "pillow",
  1.1, 0.18, 0.5,
  -2.8, 0.7, -2.8,
  0xe8e0d5
);

// المكتب
createBox(
  "desk",
  2.2, 0.15, 1,
  1.5, 0.9, -2.7,
  0x53392c
);

// أرجل المكتب
createBox("deskLeg1", 0.12, 0.9, 0.12, 0.55, 0.45, -2.3, 0x38251e);
createBox("deskLeg2", 0.12, 0.9, 0.12, 2.45, 0.45, -2.3, 0x38251e);
createBox("deskLeg3", 0.12, 0.9, 0.12, 0.55, 0.45, -3.1, 0x38251e);
createBox("deskLeg4", 0.12, 0.9, 0.12, 2.45, 0.45, -3.1, 0x38251e);

// الكرسي
createBox(
  "chair",
  0.9, 0.15, 0.9,
  1.5, 0.5, -1.7,
  0x46332b
);

// ورقة المهام
const paper = createBox(
  "taskPaper",
  0.65, 0.015, 0.8,
  1.2, 0.99, -2.7,
  0xf3eadb
);

paper.userData.interactive = true;
paper.userData.message = "دي ورقة المهام اللي أم عادل سابتها له.";

// باب الشقة
createBox(
  "door",
  1.5, 2.6, 0.12,
  0, 1.3, -4.85,
  0x513526
);

// مقبض الباب
createBox(
  "doorHandle",
  0.08, 0.08, 0.08,
  0.55, 1.3, -4.75,
  0xd4b16c
);

// نافذة
createBox(
  "window",
  2, 1.3, 0.08,
  -2.5, 2, -4.82,
  0x7895a3
);

// ستارة
createBox(
  "curtain",
  2.3, 1.6, 0.1,
  -2.5, 2, -4.7,
  0x69504a
);

// إعداد الحركة
const movement = {
  x: 0,
  y: 0
};

let yaw = 0;
let pitch = 0;

const keys = {};

let looking = false;
let lastPointerX = 0;
let lastPointerY = 0;

// الكيبورد للكمبيوتر
window.addEventListener("keydown", (event) => {
  keys[event.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
});

// عصا التحكم
const joystick = document.getElementById("joystick");
const knob = document.getElementById("joystick-knob");

let joystickPointer = null;

joystick.addEventListener("pointerdown", (event) => {
  joystickPointer = event.pointerId;
  joystick.setPointerCapture(event.pointerId);
  updateJoystick(event);
});

joystick.addEventListener("pointermove", (event) => {
  if (event.pointerId === joystickPointer) {
    updateJoystick(event);
  }
});

function updateJoystick(event) {
  const rect = joystick.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  let dx = event.clientX - centerX;
  let dy = event.clientY - centerY;

  const maxDistance = 32;
  const distance = Math.hypot(dx, dy);

  if (distance > maxDistance) {
    dx = (dx / distance) * maxDistance;
    dy = (dy / distance) * maxDistance;
  }

  movement.x = dx / maxDistance;
  movement.y = -dy / maxDistance;

  knob.style.left = `calc(50% + ${dx}px)`;
  knob.style.top = `calc(50% + ${dy}px)`;
}

function resetJoystick() {
  joystickPointer = null;

  movement.x = 0;
  movement.y = 0;

  knob.style.left = "50%";
  knob.style.top = "50%";
}

joystick.addEventListener("pointerup", resetJoystick);
joystick.addEventListener("pointercancel", resetJoystick);

// تحريك الكاميرا باللمس
renderer.domElement.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse" && event.button !== 0) return;

  if (event.clientX < window.innerWidth * 0.4) return;

  looking = true;

  lastPointerX = event.clientX;
  lastPointerY = event.clientY;

  renderer.domElement.setPointerCapture(event.pointerId);
});

renderer.domElement.addEventListener("pointermove", (event) => {
  if (!looking) return;

  const dx = event.clientX - lastPointerX;
  const dy = event.clientY - lastPointerY;

  lastPointerX = event.clientX;
  lastPointerY = event.clientY;

  yaw -= dx * 0.004;
  pitch -= dy * 0.004;

  pitch = THREE.MathUtils.clamp(
    pitch,
    -1.2,
    1.2
  );
});

renderer.domElement.addEventListener("pointerup", () => {
  looking = false;
});

renderer.domElement.addEventListener("pointercancel", () => {
  looking = false;
});

// عرض الرسائل
const message = document.getElementById("message");

let messageTimer;

function showMessage(text) {
  message.textContent = text;
  message.classList.add("show");

  clearTimeout(messageTimer);

  messageTimer = setTimeout(() => {
    message.classList.remove("show");
  }, 3000);
}

// التفاعل مع الأشياء
const raycaster = new THREE.Raycaster();

document.getElementById("interactButton").addEventListener("click", () => {
  raycaster.setFromCamera(
    new THREE.Vector2(0, 0),
    camera
  );

  const hits = raycaster.intersectObjects(scene.children, false);

  const target = hits.find((hit) => hit.object.userData.interactive);

  if (!target || target.distance > 3) {
    showMessage("مفيش حاجة تقدر تتفاعل معاها دلوقتي.");
    return;
  }

  showMessage(target.object.userData.message);
});

// الحركة
function updateMovement() {
  let forward = movement.y;
  let sideways = movement.x;

  if (keys["w"] || keys["arrowup"]) forward = 1;
  if (keys["s"] || keys["arrowdown"]) forward = -1;
  if (keys["a"] || keys["arrowleft"]) sideways = -1;
  if (keys["d"] || keys["arrowright"]) sideways = 1;

  const speed = 0.055;

  const direction = new THREE.Vector3(
    -Math.sin(yaw),
    0,
    -Math.cos(yaw)
  );

  const right = new THREE.Vector3(
    Math.cos(yaw),
    0,
    -Math.sin(yaw)
  );

  const nextX =
    camera.position.x +
    (direction.x * forward + right.x * sideways) * speed;

  const nextZ =
    camera.position.z +
    (direction.z * forward + right.z * sideways) * speed;

  camera.position.x = THREE.MathUtils.clamp(nextX, -4.3, 4.3);
  camera.position.z = THREE.MathUtils.clamp(nextZ, -4.3, 4.3);

  camera.rotation.order = "YXZ";
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
}

// الرجوع للقائمة
document.getElementById("backButton").addEventListener("click", () => {
  window.location.href = "index.html";
});

// تغيير حجم الشاشة
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
});

// تشغيل اللعبة
function animate() {
  requestAnimationFrame(animate);

  updateMovement();

  renderer.render(scene, camera);
}

animate();

// إخفاء شاشة التحميل
document.getElementById("loading").classList.add("hidden");

showMessage("أهلاً بيك في شقة عادل.");
