var scene, camera, renderer, controls, raycaster, mouse;
var outletMeshGroups = [];
var outletClickTargets = [];
var roadVehicles = [];
var dollarSprites = [];

function init3D() {
  var container = document.getElementById('canvas-container');
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a2a1a);
  scene.fog = new THREE.Fog(0x1a2a1a, 120, 250);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(80, 100, 80);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 40;
  controls.maxDistance = 250;
  controls.maxPolarAngle = Math.PI / 2.5;
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  createLighting();
  createGround();
  createRoads();
  createOutletBuildings();
  createRoadVehicles();

  renderer.domElement.addEventListener('click', onCanvasClick);
  renderer.domElement.addEventListener('touchend', onCanvasTouchEnd);
  window.addEventListener('resize', onWindowResize);
  setTimeout(function(){ document.getElementById('loading-screen').classList.add('hidden'); }, 800);
  animate();
}

function createLighting() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  var dl = new THREE.DirectionalLight(0xffffff, 0.8);
  dl.position.set(50, 100, 50);
  dl.castShadow = true;
  dl.shadow.mapSize.width = 1024;
  dl.shadow.mapSize.height = 1024;
  dl.shadow.camera.near = 0.5;
  dl.shadow.camera.far = 500;
  dl.shadow.camera.left = -100;
  dl.shadow.camera.right = 100;
  dl.shadow.camera.top = 100;
  dl.shadow.camera.bottom = -100;
  scene.add(dl);
  var dl2 = new THREE.DirectionalLight(0x4a90e2, 0.3);
  dl2.position.set(-30, 50, -30);
  scene.add(dl2);
}

function createGround() {
  var g = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300),
    new THREE.MeshStandardMaterial({ color: 0x2d5a1e, roughness: 0.9, metalness: 0.1 })
  );
  g.rotation.x = -Math.PI / 2;
  g.position.y = -0.1;
  g.receiveShadow = true;
  scene.add(g);
}

function createRoads() {
  var roadMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8, metalness: 0.1 });
  var lineMat = new THREE.MeshBasicMaterial({ color: 0xcccc00 });
  var whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  var roads = [
    { x:0, z:0, w:200, h:10, rot:0 },
    { x:0, z:0, w:200, h:10, rot:Math.PI/2 },
    { x:27.5, z:55, w:55, h:8, rot:0 },
    { x:-27.5, z:-55, w:55, h:8, rot:0 },
    { x:55, z:27.5, w:55, h:8, rot:Math.PI/2 },
    { x:-55, z:-27.5, w:55, h:8, rot:Math.PI/2 }
  ];

  roads.forEach(function(r){
    var road = new THREE.Mesh(new THREE.PlaneGeometry(r.w, r.h), roadMat);
    road.rotation.x = -Math.PI / 2;
    road.rotation.z = r.rot;
    road.position.set(r.x, 0.02, r.z);
    road.receiveShadow = true;
    scene.add(road);

    var dashCount = Math.floor(r.w / 6);
    for (var i = 0; i < dashCount; i++) {
      var dash = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.3), r.h > 9 ? lineMat : whiteMat);
      dash.rotation.x = -Math.PI / 2;
      dash.rotation.z = r.rot;
      var offset = -r.w / 2 + 3 + i * 6;
      if (r.rot === 0) dash.position.set(r.x + offset, 0.03, r.z);
      else dash.position.set(r.x, 0.03, r.z + offset);
      scene.add(dash);
    }
  });
}

function createOutletBuildings() {
  outletMeshGroups.forEach(function(og){ scene.remove(og.group); });
  outletMeshGroups = [];
  outletClickTargets = [];

  OUTLET_CONFIGS.forEach(function(cfg){
    var os = getOutletState(cfg.id);
    var isOwned = os && os.owned;
    var group = new THREE.Group();
    group.position.set(cfg.position.x, 0, cfg.position.z);

    if (isOwned) {
      var bodyColor = [0x3498db, 0xe74c3c, 0x2ecc71, 0xf39c12, 0x9b59b6][cfg.id];
      var foundation = new THREE.Mesh(new THREE.BoxGeometry(14, 0.6, 12), new THREE.MeshStandardMaterial({ color: 0x555555 }));
      foundation.position.y = 0.3; foundation.receiveShadow = true; group.add(foundation);

      var body = new THREE.Mesh(new THREE.BoxGeometry(10, 8, 8), new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.4, metalness: 0.3 }));
      body.position.y = 4.6; body.castShadow = true; body.receiveShadow = true;
      body.userData.outletId = cfg.id;
      group.add(body);
      outletClickTargets.push(body);

      var roof = new THREE.Mesh(new THREE.BoxGeometry(12, 0.6, 10), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 }));
      roof.position.y = 8.9; roof.castShadow = true; group.add(roof);

      var winMat = new THREE.MeshStandardMaterial({ color: 0xffffcc, emissive: 0xffffaa, emissiveIntensity: 0.4 });
      for (var row = 0; row < 2; row++) {
        for (var col = 0; col < 3; col++) {
          var win = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), winMat);
          win.position.set(-3 + col * 3, 3 + row * 3, 4.01);
          group.add(win);
        }
      }

      var entrance = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3.5, 0.3), new THREE.MeshStandardMaterial({ color: 0x5a3a1a }));
      entrance.position.set(0, 2.35, 4.15); group.add(entrance);

      var sign = createTextSprite(cfg.name, '#ffffff');
      sign.position.set(0, 11, 0); sign.scale.set(16, 8, 1); group.add(sign);
    } else {
      var lot = new THREE.Mesh(new THREE.BoxGeometry(14, 0.3, 12), new THREE.MeshStandardMaterial({ color: 0x3a3a3a }));
      lot.position.y = 0.15; lot.receiveShadow = true;
      lot.userData.outletId = cfg.id;
      group.add(lot);
      outletClickTargets.push(lot);

      var sign = createTextSprite('🔒 ' + cfg.name, '#ff6b35');
      sign.position.set(0, 4, 0); sign.scale.set(14, 7, 1); group.add(sign);

      var priceSign = createTextSprite(formatCurrency(cfg.unlockCost), '#fbbf24');
      priceSign.position.set(0, 7, 0); priceSign.scale.set(12, 6, 1); group.add(priceSign);
    }

    scene.add(group);
    outletMeshGroups.push({ group: group, config: cfg });
  });
}

function createRoadVehicles() {
  var colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6, 0xffffff, 0x1abc9c, 0xe67e22];
  var paths = [
    { axis:'x', z:2.5, dir:1, range:[-90,90] },
    { axis:'x', z:-2.5, dir:-1, range:[-90,90] },
    { axis:'z', x:2.5, dir:1, range:[-90,90] },
    { axis:'z', x:-2.5, dir:-1, range:[-90,90] }
  ];
  for (var i = 0; i < 12; i++) {
    var path = paths[i % paths.length];
    var color = colors[Math.floor(Math.random() * colors.length)];
    var v = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 1.2, 1.5),
      new THREE.MeshStandardMaterial({ color: color, roughness: 0.5, metalness: 0.3 })
    );
    v.castShadow = true;
    var speed = 0.15 + Math.random() * 0.2;
    var startPos = path.range[0] + Math.random() * (path.range[1] - path.range[0]);
    if (path.axis === 'x') { v.position.set(startPos, 0.7, path.z); v.rotation.y = path.dir > 0 ? 0 : Math.PI; }
    else { v.position.set(path.x, 0.7, startPos); v.rotation.y = path.dir > 0 ? Math.PI / 2 : -Math.PI / 2; }
    scene.add(v);
    roadVehicles.push({ mesh: v, path: path, speed: speed, dir: path.dir });
  }
}

function showDollarSign(outletId) {
  var cfg = OUTLET_CONFIGS.find(function(c){ return c.id === outletId; });
  if (!cfg) return;
  var sprite = createTextSprite('$', '#4ade80');
  sprite.position.set(cfg.position.x, 14, cfg.position.z);
  sprite.scale.set(8, 8, 1);
  scene.add(sprite);
  dollarSprites.push({ sprite: sprite, startTime: Date.now(), duration: 2000 });
}

function createTextSprite(text, color) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  canvas.width = 512; canvas.height = 256;
  ctx.fillStyle = color || 'transparent';
  ctx.font = 'bold 72px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  var tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
}

function onCanvasClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(outletClickTargets);
  if (intersects.length > 0) {
    var outletId = intersects[0].object.userData.outletId;
    if (outletId !== undefined) showOutletPopup(outletId, event.clientX, event.clientY);
  } else { hideOutletPopup(); }
}

function onCanvasTouchEnd(event) {
  if (event.changedTouches && event.changedTouches.length > 0) {
    var touch = event.changedTouches[0];
    mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(outletClickTargets);
    if (intersects.length > 0) {
      var outletId = intersects[0].object.userData.outletId;
      if (outletId !== undefined) showOutletPopup(outletId, touch.clientX, touch.clientY);
    }
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  roadVehicles.forEach(function(rv){
    var range = rv.path.range;
    if (rv.path.axis === 'x') {
      rv.mesh.position.x += rv.speed * rv.dir;
      if (rv.mesh.position.x > range[1]) rv.mesh.position.x = range[0];
      if (rv.mesh.position.x < range[0]) rv.mesh.position.x = range[1];
    } else {
      rv.mesh.position.z += rv.speed * rv.dir;
      if (rv.mesh.position.z > range[1]) rv.mesh.position.z = range[0];
      if (rv.mesh.position.z < range[0]) rv.mesh.position.z = range[1];
    }
  });

  var now = Date.now();
  for (var i = dollarSprites.length - 1; i >= 0; i--) {
    var ds = dollarSprites[i];
    var elapsed = now - ds.startTime;
    if (elapsed > ds.duration) {
      scene.remove(ds.sprite);
      ds.sprite.material.map.dispose();
      ds.sprite.material.dispose();
      dollarSprites.splice(i, 1);
    } else {
      ds.sprite.material.opacity = 0.5 + 0.5 * Math.sin(elapsed / 150 * Math.PI);
    }
  }

  renderer.render(scene, camera);
}
