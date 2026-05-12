var scene, camera, renderer, controls, raycaster, mouse;
var outletMeshGroups = [];
var outletClickTargets = [];
var roadVehicles = [];
var dollarSprites = [];
var interiorMode = false;
var interiorGroup = null;
var interiorParticles = [];
var interiorClickTargets = [];
var exteriorSavedState = null;

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
      var level = os.level || 1;
      var buildingH = 6 + level * 2;
      var buildingW = 8 + level * 1.5;
      var buildingD = 6 + level * 1;

      var foundation = new THREE.Mesh(new THREE.BoxGeometry(buildingW + 4, 0.6, buildingD + 4), new THREE.MeshStandardMaterial({ color: 0x555555 }));
      foundation.position.y = 0.3; foundation.receiveShadow = true; group.add(foundation);

      var body = new THREE.Mesh(new THREE.BoxGeometry(buildingW, buildingH, buildingD), new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.4, metalness: 0.3 }));
      body.position.y = 0.6 + buildingH / 2; body.castShadow = true; body.receiveShadow = true;
      body.userData.outletId = cfg.id;
      group.add(body);
      outletClickTargets.push(body);

      var roofColor = level >= 5 ? 0xc0c0c0 : level >= 4 ? 0x444466 : level >= 3 ? 0x333355 : 0x222222;
      var roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: level >= 5 ? 0.1 : 0.7, metalness: level >= 5 ? 0.8 : 0.1 });
      var roof = new THREE.Mesh(new THREE.BoxGeometry(buildingW + 2, 0.6, buildingD + 2), roofMat);
      roof.position.y = 0.6 + buildingH + 0.3; roof.castShadow = true; group.add(roof);

      if (level >= 2) {
        var deco = new THREE.Mesh(new THREE.BoxGeometry(buildingW + 0.5, 0.4, buildingD + 0.5), new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.5 }));
        deco.position.y = 0.6 + buildingH * 0.6; group.add(deco);
      }
      if (level >= 3) {
        var signBoard = new THREE.Mesh(new THREE.BoxGeometry(buildingW * 0.8, 1.5, 0.3), new THREE.MeshStandardMaterial({ color: 0xff6b35, emissive: 0xff4400, emissiveIntensity: 0.3 }));
        signBoard.position.set(0, 0.6 + buildingH + 1.5, buildingD / 2 + 0.2); group.add(signBoard);
      }
      if (level >= 4) {
        var glowColors = [0x00ffff, 0xff00ff, 0xffff00, 0x00ff00];
        for (var gi = 0; gi < 4; gi++) {
          var glow = new THREE.Mesh(new THREE.BoxGeometry(buildingW + 2.5, 0.2, 0.2), new THREE.MeshStandardMaterial({ color: glowColors[gi], emissive: glowColors[gi], emissiveIntensity: 0.6 }));
          glow.position.set(0, 0.6 + buildingH * (0.3 + gi * 0.15), buildingD / 2 + 0.15); group.add(glow);
        }
      }
      if (level >= 5) {
        var glassMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, roughness: 0.05, metalness: 0.9, transparent: true, opacity: 0.6 });
        var glassPanel = new THREE.Mesh(new THREE.BoxGeometry(buildingW + 0.3, buildingH * 0.8, 0.15), glassMat);
        glassPanel.position.set(0, 0.6 + buildingH * 0.4, buildingD / 2 + 0.1); group.add(glassPanel);
      }

      var winMat = new THREE.MeshStandardMaterial({ color: 0xffffcc, emissive: 0xffffaa, emissiveIntensity: 0.4 });
      var winRows = Math.min(level, 4);
      var winCols = Math.min(level + 1, 5);
      for (var row = 0; row < winRows; row++) {
        for (var col = 0; col < winCols; col++) {
          var win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), winMat);
          win.position.set(-(winCols - 1) * 1.3 / 2 + col * 1.3, 2 + row * 2.5, buildingD / 2 + 0.01);
          group.add(win);
        }
      }

      var entrance = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3.5, 0.3), new THREE.MeshStandardMaterial({ color: 0x5a3a1a }));
      entrance.position.set(0, 2.35, buildingD / 2 + 0.15); group.add(entrance);

      if (os.facilities && os.facilities.length > 0) {
        var facilityIcon = createTextSprite(os.facilities.length + '设施', '#4ade80');
        facilityIcon.position.set(buildingW / 2 + 3, 5, 0);
        facilityIcon.scale.set(8, 4, 1);
        group.add(facilityIcon);
      }

      var sign = createTextSprite(cfg.name + ' Lv.' + level, '#ffffff');
      sign.position.set(0, 0.6 + buildingH + 4, 0); sign.scale.set(16, 8, 1); group.add(sign);
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
  if (interiorMode) {
    var intIntersects = raycaster.intersectObjects(interiorClickTargets);
    if (intIntersects.length > 0) {
      var data = intIntersects[0].object.userData;
      if (data.facilityId && typeof openFacilityModal === 'function') {
        openFacilityModal(0);
      }
    }
    return;
  }
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
    if (interiorMode) return;
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

function enterInterior(outletId) {
  if (interiorMode) return;
  var os = getOutletState(outletId);
  if (!os || !os.owned) return;
  interiorMode = true;
  interiorClickTargets = [];
  interiorParticles = [];

  exteriorSavedState = {
    cameraPos: camera.position.clone(),
    cameraTarget: controls.target.clone()
  };

  outletMeshGroups.forEach(function(og){ og.group.visible = false; });
  roadVehicles.forEach(function(rv){ rv.mesh.visible = false; });
  dollarSprites.forEach(function(ds){ ds.sprite.visible = false; });

  scene.fog = new THREE.Fog(0x0a0a14, 60, 120);
  scene.background = new THREE.Color(0x0a0a14);

  interiorGroup = new THREE.Group();
  createInteriorRoom(outletId, os);
  createInteriorLighting(os);
  createReceptionDesk();
  createVehicleDisplayArea(outletId);
  createInteriorFacilities(outletId, os);
  createInteriorDecorations(os);
  scene.add(interiorGroup);

  camera.position.set(0, 12, 18);
  camera.lookAt(0, 1, 0);
  controls.target.set(0, 1, 0);
  controls.minDistance = 5;
  controls.maxDistance = 35;
  controls.maxPolarAngle = Math.PI / 2.1;
  controls.update();

  var btn = document.getElementById('exitInteriorBtn');
  if (btn) btn.style.display = 'flex';
}

function exitInterior() {
  if (!interiorMode) return;
  interiorMode = false;

  if (interiorGroup) {
    scene.remove(interiorGroup);
    interiorGroup = null;
  }
  interiorClickTargets = [];
  interiorParticles = [];

  outletMeshGroups.forEach(function(og){ og.group.visible = true; });
  roadVehicles.forEach(function(rv){ rv.mesh.visible = true; });
  dollarSprites.forEach(function(ds){ ds.sprite.visible = true; });

  scene.fog = new THREE.Fog(0x1a2a1a, 120, 250);
  scene.background = new THREE.Color(0x1a2a1a);

  if (exteriorSavedState) {
    camera.position.copy(exteriorSavedState.cameraPos);
    controls.target.copy(exteriorSavedState.cameraTarget);
  }
  controls.minDistance = 40;
  controls.maxDistance = 250;
  controls.maxPolarAngle = Math.PI / 2.5;
  controls.update();

  var btn = document.getElementById('exitInteriorBtn');
  if (btn) btn.style.display = 'none';
}

function createInteriorRoom(outletId, os) {
  var level = os.level || 1;
  var roomW = 24 + level * 4;
  var roomD = 18 + level * 3;
  var roomH = 4 + level * 0.5;

  var floorMat = new THREE.MeshStandardMaterial({ color: 0x3a3530, roughness: 0.6, metalness: 0.1 });
  if (level >= 4) floorMat = new THREE.MeshStandardMaterial({ color: 0x2a2520, roughness: 0.3, metalness: 0.2 });
  if (level >= 5) floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1510, roughness: 0.15, metalness: 0.4 });
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomD), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  interiorGroup.add(floor);

  for (var ti = 0; ti < roomW; ti += 2) {
    for (var tj = 0; tj < roomD; tj += 2) {
      var tileBorder = new THREE.Mesh(
        new THREE.PlaneGeometry(1.95, 1.95),
        new THREE.MeshStandardMaterial({ color: ((ti + tj) % 4 === 0) ? 0x4a4540 : 0x3a3530, roughness: 0.5 })
      );
      tileBorder.rotation.x = -Math.PI / 2;
      tileBorder.position.set(-roomW / 2 + 1 + ti, 0.005, -roomD / 2 + 1 + tj);
      interiorGroup.add(tileBorder);
    }
  }

  var wallColor = level >= 5 ? 0x2a2a3a : level >= 4 ? 0x2a2a30 : level >= 3 ? 0x2a2a2a : 0x252525;
  var wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.7, metalness: 0.05 });

  var backWall = new THREE.Mesh(new THREE.BoxGeometry(roomW, roomH, 0.3), wallMat);
  backWall.position.set(0, roomH / 2, -roomD / 2);
  interiorGroup.add(backWall);

  var leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, roomH, roomD), wallMat);
  leftWall.position.set(-roomW / 2, roomH / 2, 0);
  interiorGroup.add(leftWall);

  var rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, roomH, roomD), wallMat);
  rightWall.position.set(roomW / 2, roomH / 2, 0);
  interiorGroup.add(rightWall);

  var frontLeft = new THREE.Mesh(new THREE.BoxGeometry(roomW / 2 - 3, roomH, 0.3), wallMat);
  frontLeft.position.set(-roomW / 4 - 1.5, roomH / 2, roomD / 2);
  interiorGroup.add(frontLeft);

  var frontRight = new THREE.Mesh(new THREE.BoxGeometry(roomW / 2 - 3, roomH, 0.3), wallMat);
  frontRight.position.set(roomW / 4 + 1.5, roomH / 2, roomD / 2);
  interiorGroup.add(frontRight);

  var doorTop = new THREE.Mesh(new THREE.BoxGeometry(6, roomH - 3.5, 0.3), wallMat);
  doorTop.position.set(0, roomH - (roomH - 3.5) / 2, roomD / 2);
  interiorGroup.add(doorTop);

  var ceilingMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
  var ceiling = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomD), ceilingMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = roomH;
  interiorGroup.add(ceiling);

  var baseMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.6 });
  var baseH = 0.15;
  [
    { w: roomW, d: 0.1, x: 0, z: -roomD / 2 + 0.05 },
    { w: roomW, d: 0.1, x: 0, z: roomD / 2 - 0.05 },
    { w: 0.1, d: roomD, x: -roomW / 2 + 0.05, z: 0 },
    { w: 0.1, d: roomD, x: roomW / 2 - 0.05, z: 0 }
  ].forEach(function(b) {
    var base = new THREE.Mesh(new THREE.BoxGeometry(b.w, baseH, b.d), baseMat);
    base.position.set(b.x, baseH / 2, b.z);
    interiorGroup.add(base);
  });

  if (level >= 3) {
    var pillarMat = new THREE.MeshStandardMaterial({ color: 0x3a3a4a, roughness: 0.4, metalness: 0.3 });
    var pillarPositions = [
      { x: -roomW / 4, z: -roomD / 4 },
      { x: roomW / 4, z: -roomD / 4 },
      { x: -roomW / 4, z: roomD / 4 },
      { x: roomW / 4, z: roomD / 4 }
    ];
    pillarPositions.forEach(function(p) {
      var pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, roomH, 8), pillarMat);
      pillar.position.set(p.x, roomH / 2, p.z);
      pillar.castShadow = true;
      interiorGroup.add(pillar);
    });
  }

  if (level >= 5) {
    var stripColors = [0x00ffff, 0xff00ff, 0xffff00];
    for (var si = 0; si < 3; si++) {
      var strip = new THREE.Mesh(
        new THREE.BoxGeometry(roomW - 1, 0.05, 0.05),
        new THREE.MeshStandardMaterial({ color: stripColors[si], emissive: stripColors[si], emissiveIntensity: 0.8 })
      );
      strip.position.set(0, roomH - 0.1 - si * 0.15, -roomD / 2 + 0.2);
      interiorGroup.add(strip);
    }
  }

  var outletCfg = OUTLET_CONFIGS.find(function(c){ return c.id === outletId; });
  var nameSign = createTextSprite(outletCfg.name + ' Lv.' + level, '#ffffff');
  nameSign.position.set(0, roomH - 0.5, -roomD / 2 + 0.5);
  nameSign.scale.set(8, 4, 1);
  interiorGroup.add(nameSign);
}

function createInteriorLighting(os) {
  var level = os.level || 1;
  var roomW = 24 + level * 4;
  var roomD = 18 + level * 3;
  var roomH = 4 + level * 0.5;

  var ceilingLightMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffee, emissiveIntensity: level >= 4 ? 1.2 : 0.8 });
  var lightRows = Math.min(level + 1, 4);
  var lightCols = Math.min(level + 1, 5);
  for (var lr = 0; lr < lightRows; lr++) {
    for (var lc = 0; lc < lightCols; lc++) {
      var lightPanel = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.8), ceilingLightMat);
      lightPanel.rotation.x = Math.PI / 2;
      var lx = -(lightCols - 1) * (roomW / (lightCols + 1)) / 2 + lc * (roomW / (lightCols + 1));
      var lz = -(lightRows - 1) * (roomD / (lightRows + 1)) / 2 + lr * (roomD / (lightRows + 1));
      lightPanel.position.set(lx, roomH - 0.02, lz);
      interiorGroup.add(lightPanel);
    }
  }

  var pl1 = new THREE.PointLight(0xffffee, 0.6, 30);
  pl1.position.set(0, roomH - 0.5, 0);
  interiorGroup.add(pl1);

  var pl2 = new THREE.PointLight(0xffeecc, 0.4, 25);
  pl2.position.set(-roomW / 4, roomH - 0.5, -roomD / 4);
  interiorGroup.add(pl2);

  var pl3 = new THREE.PointLight(0xffeecc, 0.4, 25);
  pl3.position.set(roomW / 4, roomH - 0.5, -roomD / 4);
  interiorGroup.add(pl3);

  var pl4 = new THREE.PointLight(0xffeecc, 0.3, 20);
  pl4.position.set(0, roomH - 0.5, roomD / 4);
  interiorGroup.add(pl4);
}

function createReceptionDesk() {
  var deskMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.4, metalness: 0.1 });
  var deskTop = new THREE.Mesh(new THREE.BoxGeometry(5, 0.15, 1.5), deskMat);
  deskTop.position.set(-5, 1.1, 5);
  deskTop.castShadow = true;
  interiorGroup.add(deskTop);

  var deskFront = new THREE.Mesh(new THREE.BoxGeometry(5, 1.1, 0.15), deskMat);
  deskFront.position.set(-5, 0.55, 5.7);
  interiorGroup.add(deskFront);

  var deskSide1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.1, 1.5), deskMat);
  deskSide1.position.set(-7.5, 0.55, 5);
  interiorGroup.add(deskSide1);

  var deskSide2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.1, 1.5), deskMat);
  deskSide2.position.set(-2.5, 0.55, 5);
  interiorGroup.add(deskSide2);

  var monitorMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.8 });
  var screen = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.05), monitorMat);
  screen.position.set(-5.5, 1.7, 5.3);
  screen.rotation.x = -0.15;
  interiorGroup.add(screen);

  var screenGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x3498db, emissive: 0x3498db, emissiveIntensity: 0.5 })
  );
  screenGlow.position.set(-5.5, 1.7, 5.27);
  screenGlow.rotation.x = -0.15;
  interiorGroup.add(screenGlow);

  var monitor2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.05), monitorMat);
  monitor2.position.set(-4.5, 1.7, 5.3);
  monitor2.rotation.x = -0.15;
  interiorGroup.add(monitor2);

  var screenGlow2 = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x27ae60, emissive: 0x27ae60, emissiveIntensity: 0.5 })
  );
  screenGlow2.position.set(-4.5, 1.7, 5.27);
  screenGlow2.rotation.x = -0.15;
  interiorGroup.add(screenGlow2);

  var chairMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6 });
  var chair = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.6, 8), chairMat);
  chair.position.set(-5, 0.5, 4.2);
  interiorGroup.add(chair);

  var chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.1), chairMat);
  chairBack.position.set(-5, 1.0, 3.95);
  interiorGroup.add(chairBack);

  var welcomeSign = createTextSprite('欢迎光临', '#fbbf24');
  welcomeSign.position.set(-5, 3.5, 5.5);
  welcomeSign.scale.set(5, 2.5, 1);
  interiorGroup.add(welcomeSign);
}

function createVehicleDisplayArea(outletId) {
  var vehicles = getAvailableVehiclesAtOutlet(outletId);
  var displayCount = Math.min(vehicles.length, 4);
  var startX = 2;
  var spacing = 3.5;

  for (var vi = 0; vi < displayCount; vi++) {
    var v = vehicles[vi];
    var vColor = 0x3498db;
    if (v.type === 'SUV') vColor = 0x2ecc71;
    else if (v.type === '豪华车') vColor = 0xf1c40f;
    else if (v.type === 'MPV') vColor = 0xe67e22;
    else if (v.type === '跑车' || v.type === '超跑') vColor = 0xe74c3c;
    else if (v.type === '紧凑型') vColor = 0x9b59b6;

    var carGroup = new THREE.Group();
    carGroup.position.set(startX + vi * spacing, 0, 5);

    var carBody = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.8, 1.2),
      new THREE.MeshStandardMaterial({ color: vColor, roughness: 0.3, metalness: 0.5 })
    );
    carBody.position.y = 0.7;
    carBody.castShadow = true;
    carGroup.add(carBody);

    var carTop = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.6, 1.1),
      new THREE.MeshStandardMaterial({ color: vColor, roughness: 0.3, metalness: 0.5 })
    );
    carTop.position.set(-0.1, 1.3, 0);
    carGroup.add(carTop);

    var glassMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.5, roughness: 0.1, metalness: 0.9 });
    var windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.5), glassMat);
    windshield.position.set(0.5, 1.3, 0);
    windshield.rotation.y = Math.PI / 2;
    carGroup.add(windshield);

    var wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    var wheelPositions = [
      { x: 0.7, z: 0.65 }, { x: 0.7, z: -0.65 },
      { x: -0.7, z: 0.65 }, { x: -0.7, z: -0.65 }
    ];
    wheelPositions.forEach(function(wp) {
      var wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.15, 8), wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(wp.x, 0.25, wp.z);
      carGroup.add(wheel);
    });

    var plateSprite = createTextSprite(v.licensePlate || '', '#60a5fa');
    plateSprite.position.set(0, 0.3, 0.7);
    plateSprite.scale.set(2.5, 1.2, 1);
    carGroup.add(plateSprite);

    var nameSprite = createTextSprite(v.brand + ' ' + v.model, '#ffffff');
    nameSprite.position.set(0, 2.2, 0);
    nameSprite.scale.set(3.5, 1.8, 1);
    carGroup.add(nameSprite);

    interiorGroup.add(carGroup);
  }

  if (displayCount === 0) {
    var emptySign = createTextSprite('暂无可用车辆', 'rgba(255,255,255,0.3)');
    emptySign.position.set(5, 1.5, 5);
    emptySign.scale.set(5, 2.5, 1);
    interiorGroup.add(emptySign);
  }

  var areaLabel = createTextSprite('🚗 车辆展示区', '#60a5fa');
  areaLabel.position.set(startX + (displayCount - 1) * spacing / 2, 3.5, 5);
  areaLabel.scale.set(5, 2.5, 1);
  interiorGroup.add(areaLabel);
}

function createInteriorFacilities(outletId, os) {
  var level = os.level || 1;
  var roomW = 24 + level * 4;
  var roomD = 18 + level * 3;
  var facilities = (os.facilities || []);
  var disabledFacs = os.disabledFacilities || [];
  var brokenFacs = os.brokenFacilities || {};

  var facPositions = [
    { x: -roomW / 2 + 3, z: -roomD / 2 + 3 },
    { x: -roomW / 2 + 3, z: -roomD / 2 + 7 },
    { x: -roomW / 2 + 3, z: -roomD / 2 + 11 },
    { x: roomW / 2 - 3, z: -roomD / 2 + 3 },
    { x: roomW / 2 - 3, z: -roomD / 2 + 7 },
    { x: roomW / 2 - 3, z: -roomD / 2 + 11 },
    { x: 0, z: -roomD / 2 + 3 },
    { x: 0, z: -roomD / 2 + 7 }
  ];

  facilities.forEach(function(fid, idx) {
    if (idx >= facPositions.length) return;
    var pos = facPositions[idx];
    var cfg = getFacilityConfig(fid);
    if (!cfg) return;
    var isDisabled = disabledFacs.indexOf(fid) !== -1;
    var isBroken = brokenFacs[fid] && brokenFacs[fid] > gameState.currentDay;

    createSingleFacility(fid, cfg, pos.x, pos.z, isDisabled, isBroken);
  });

  var emptySlots = facPositions.slice(facilities.length);
  emptySlots.forEach(function(pos) {
    var placeholder = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.05, 3),
      new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9, transparent: true, opacity: 0.3 })
    );
    placeholder.position.set(pos.x, 0.03, pos.z);
    interiorGroup.add(placeholder);

    var addSign = createTextSprite('+ 设施位', 'rgba(255,255,255,0.2)');
    addSign.position.set(pos.x, 1, pos.z);
    addSign.scale.set(3, 1.5, 1);
    interiorGroup.add(addSign);
  });
}

function createSingleFacility(fid, cfg, x, z, isDisabled, isBroken) {
  var facGroup = new THREE.Group();
  facGroup.position.set(x, 0, z);

  var baseOpacity = isDisabled ? 0.4 : isBroken ? 0.5 : 1.0;
  var tint = isBroken ? 0xff3333 : isDisabled ? 0x666666 : 0xffffff;

  var platformMat = new THREE.MeshStandardMaterial({
    color: isBroken ? 0x3a1a1a : isDisabled ? 0x2a2a2a : 0x2a2a3a,
    roughness: 0.5, metalness: 0.2, transparent: true, opacity: baseOpacity
  });
  var platform = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.1, 3.5), platformMat);
  platform.position.y = 0.05;
  facGroup.add(platform);

  switch(fid) {
    case 'waiting_room':
      createWaitingRoom(facGroup, baseOpacity, tint);
      break;
    case 'premium_lounge':
      createPremiumLounge(facGroup, baseOpacity, tint);
      break;
    case 'shower':
      createShower(facGroup, baseOpacity, tint);
      break;
    case 'spa':
      createSpa(facGroup, baseOpacity, tint);
      break;
    case 'kids_zone':
      createKidsZone(facGroup, baseOpacity, tint);
      break;
    case 'business_center':
      createBusinessCenter(facGroup, baseOpacity, tint);
      break;
    case 'coffee_bar':
      createCoffeeBar(facGroup, baseOpacity, tint);
      break;
    case 'vip_lounge':
      createVipLounge(facGroup, baseOpacity, tint);
      break;
  }

  var statusText = isBroken ? '⚠故障' : isDisabled ? '⏸停用' : '';
  var statusColor = isBroken ? '#f87171' : isDisabled ? '#666666' : '#4ade80';
  var label = cfg.icon + ' ' + cfg.name + (statusText ? ' ' + statusText : '');
  var nameLabel = createTextSprite(label, statusColor);
  nameLabel.position.set(0, 3.2, 0);
  nameLabel.scale.set(4, 2, 1);
  facGroup.add(nameLabel);

  var infoLabel = createTextSprite('满意度+' + cfg.satisfactionBonus + ' 收入+' + cfg.incomeBonusPercent + '%', 'rgba(255,255,255,0.5)');
  infoLabel.position.set(0, 2.6, 0);
  infoLabel.scale.set(3.5, 1.5, 1);
  facGroup.add(infoLabel);

  if (!isDisabled && !isBroken) {
    platform.userData.facilityId = fid;
    interiorClickTargets.push(platform);
  }

  interiorGroup.add(facGroup);
}

function createWaitingRoom(g, opacity, tint) {
  var sofaMat = new THREE.MeshStandardMaterial({ color: 0x3a5a8a, roughness: 0.6, transparent: true, opacity: opacity });
  var sofa1 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.5, 0.8), sofaMat);
  sofa1.position.set(0, 0.5, -0.8);
  g.add(sofa1);
  var sofa1Back = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.6, 0.15), sofaMat);
  sofa1Back.position.set(0, 0.8, -1.15);
  g.add(sofa1Back);

  var sofa2 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.5, 0.8), sofaMat);
  sofa2.position.set(0, 0.5, 0.8);
  g.add(sofa2);
  var sofa2Back = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.6, 0.15), sofaMat);
  sofa2Back.position.set(0, 0.8, 1.15);
  g.add(sofa2Back);

  var tableMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.4, transparent: true, opacity: opacity });
  var table = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 8), tableMat);
  table.position.set(0, 0.45, 0);
  g.add(table);

  var magMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.8, transparent: true, opacity: opacity });
  var mag = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.4), magMat);
  mag.position.set(0.1, 0.66, 0);
  g.add(mag);

  var plantMat = new THREE.MeshStandardMaterial({ color: 0x27ae60, roughness: 0.8, transparent: true, opacity: opacity });
  var pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.3, 8), new THREE.MeshStandardMaterial({ color: 0x8B4513, transparent: true, opacity: opacity }));
  pot.position.set(-1.2, 0.25, 0);
  g.add(pot);
  var leaves = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), plantMat);
  leaves.position.set(-1.2, 0.7, 0);
  g.add(leaves);
}

function createPremiumLounge(g, opacity, tint) {
  var sofaMat = new THREE.MeshStandardMaterial({ color: 0x6a3a5a, roughness: 0.4, transparent: true, opacity: opacity });
  var lShape1 = new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 0.8), sofaMat);
  lShape1.position.set(-0.5, 0.5, -0.8);
  g.add(lShape1);
  var lShape1Back = new THREE.Mesh(new THREE.BoxGeometry(2, 0.7, 0.15), sofaMat);
  lShape1Back.position.set(-0.5, 0.85, -1.15);
  g.add(lShape1Back);
  var lShape2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 1.5), sofaMat);
  lShape2.position.set(-1.3, 0.5, -0.1);
  g.add(lShape2);
  var lShape2Back = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.7, 1.5), sofaMat);
  lShape2Back.position.set(-1.65, 0.85, -0.1);
  g.add(lShape2Back);

  var cushionMat = new THREE.MeshStandardMaterial({ color: 0x8a5a7a, roughness: 0.5, transparent: true, opacity: opacity });
  var cushion1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.5), cushionMat);
  cushion1.position.set(-0.5, 0.8, -0.8);
  g.add(cushion1);
  var cushion2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.5), cushionMat);
  cushion2.position.set(0.2, 0.8, -0.8);
  g.add(cushion2);

  var tvMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.8, transparent: true, opacity: opacity });
  var tv = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 0.05), tvMat);
  tv.position.set(0.5, 2, 0);
  g.add(tv);
  var tvScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x3498db, emissive: 0x3498db, emissiveIntensity: 0.4, transparent: true, opacity: opacity })
  );
  tvScreen.position.set(0.5, 2, -0.03);
  g.add(tvScreen);

  var tableMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.3, transparent: true, opacity: opacity });
  var coffeeTable = new THREE.Mesh(new THREE.BoxGeometry(1, 0.05, 0.6), tableMat);
  coffeeTable.position.set(-0.2, 0.5, 0);
  g.add(coffeeTable);
  var tableLeg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6), tableMat);
  tableLeg1.position.set(-0.55, 0.25, -0.2);
  g.add(tableLeg1);
  var tableLeg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6), tableMat);
  tableLeg2.position.set(0.15, 0.25, -0.2);
  g.add(tableLeg2);
  var tableLeg3 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6), tableMat);
  tableLeg3.position.set(-0.55, 0.25, 0.2);
  g.add(tableLeg3);
  var tableLeg4 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6), tableMat);
  tableLeg4.position.set(0.15, 0.25, 0.2);
  g.add(tableLeg4);
}

function createShower(g, opacity, tint) {
  var stallMat = new THREE.MeshStandardMaterial({ color: 0x88cccc, roughness: 0.1, metalness: 0.3, transparent: true, opacity: opacity * 0.5 });
  for (var si = 0; si < 2; si++) {
    var sz = si * 1.5 - 0.75;
    var stallL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.5, 1.3), stallMat);
    stallL.position.set(-0.7, 1.25, sz);
    g.add(stallL);
    var stallR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.5, 1.3), stallMat);
    stallR.position.set(0.7, 1.25, sz);
    g.add(stallR);
    var stallB = new THREE.Mesh(new THREE.BoxGeometry(1.45, 2.5, 0.05), stallMat);
    stallB.position.set(0, 1.25, sz - 0.65);
    g.add(stallB);

    var showerHead = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.05, 8),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, transparent: true, opacity: opacity })
    );
    showerHead.position.set(0, 2.4, sz);
    g.add(showerHead);

    var drainMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.5, transparent: true, opacity: opacity });
    var drain = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 8), drainMat);
    drain.position.set(0, 0.11, sz);
    g.add(drain);
  }

  var towelMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, transparent: true, opacity: opacity });
  var towel1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.05), towelMat);
  towel1.position.set(1.2, 1.5, -0.5);
  g.add(towel1);
  var towel2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.05), towelMat);
  towel2.position.set(1.2, 1.5, 0.5);
  g.add(towel2);

  var sign = createTextSprite('🚿', '#60a5fa');
  sign.position.set(0, 2.8, 0);
  sign.scale.set(2, 1, 1);
  g.add(sign);
}

function createSpa(g, opacity, tint) {
  var bedMat = new THREE.MeshStandardMaterial({ color: 0xf5e6d3, roughness: 0.5, transparent: true, opacity: opacity });
  var bed1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 2), bedMat);
  bed1.position.set(-0.8, 0.35, 0);
  g.add(bed1);
  var bed1Leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 6), new THREE.MeshStandardMaterial({ color: 0x8B4513, transparent: true, opacity: opacity }));
  bed1Leg1.position.set(-1.1, 0.05, -0.8);
  g.add(bed1Leg1);
  var bed1Leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 6), new THREE.MeshStandardMaterial({ color: 0x8B4513, transparent: true, opacity: opacity }));
  bed1Leg2.position.set(-0.5, 0.05, -0.8);
  g.add(bed1Leg2);

  var towel = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.4), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, transparent: true, opacity: opacity }));
  towel.position.set(-0.8, 0.62, 0.3);
  g.add(towel);

  var candleMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xff6600, emissiveIntensity: 0.8, transparent: true, opacity: opacity });
  var candle1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.15, 6), candleMat);
  candle1.position.set(-0.3, 0.68, -0.5);
  g.add(candle1);
  var candle2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.15, 6), candleMat);
  candle2.position.set(-0.3, 0.68, 0.5);
  g.add(candle2);

  var ambientLight = new THREE.PointLight(0xff8844, 0.5, 5);
  ambientLight.position.set(-0.8, 1.5, 0);
  g.add(ambientLight);

  var bowlMat = new THREE.MeshStandardMaterial({ color: 0x5a8a5a, roughness: 0.4, transparent: true, opacity: opacity });
  var bowl = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), bowlMat);
  bowl.position.set(0.8, 0.1, 0);
  g.add(bowl);

  var oilMat = new THREE.MeshStandardMaterial({ color: 0xaa8844, roughness: 0.3, transparent: true, opacity: opacity });
  var oilBottle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.25, 6), oilMat);
  oilBottle.position.set(0.8, 0.25, 0.4);
  g.add(oilBottle);
}

function createKidsZone(g, opacity, tint) {
  var colors = [0xe74c3c, 0x3498db, 0xf1c40f, 0x2ecc71, 0x9b59b6];

  var slideMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.4, transparent: true, opacity: opacity });
  var slideBase = new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 2), slideMat);
  slideBase.position.set(-0.5, 0.8, 0);
  slideBase.rotation.x = 0.2;
  g.add(slideBase);
  var slideSide1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 2), slideMat);
  slideSide1.position.set(-1, 0.9, 0);
  slideSide1.rotation.x = 0.2;
  g.add(slideSide1);
  var slideSide2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 2), slideMat);
  slideSide2.position.set(0, 0.9, 0);
  slideSide2.rotation.x = 0.2;
  g.add(slideSide2);

  var blockMat1 = new THREE.MeshStandardMaterial({ color: 0x3498db, roughness: 0.6, transparent: true, opacity: opacity });
  var block1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), blockMat1);
  block1.position.set(0.8, 0.35, -0.5);
  block1.rotation.y = 0.3;
  g.add(block1);

  var blockMat2 = new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.6, transparent: true, opacity: opacity });
  var block2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), blockMat2);
  block2.position.set(0.9, 0.8, -0.3);
  block2.rotation.y = -0.5;
  g.add(block2);

  var ballMat = new THREE.MeshStandardMaterial({ color: 0x2ecc71, roughness: 0.3, transparent: true, opacity: opacity });
  var ball = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), ballMat);
  ball.position.set(0.7, 0.2, 0.5);
  g.add(ball);

  var ballMat2 = new THREE.MeshStandardMaterial({ color: 0x9b59b6, roughness: 0.3, transparent: true, opacity: opacity });
  var ball2 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), ballMat2);
  ball2.position.set(0.5, 0.15, 0.7);
  g.add(ball2);

  var carpetMat = new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.9, transparent: true, opacity: opacity * 0.7 });
  var carpet = new THREE.Mesh(new THREE.CircleGeometry(1.2, 16), carpetMat);
  carpet.rotation.x = -Math.PI / 2;
  carpet.position.set(0.5, 0.02, 0.2);
  g.add(carpet);
}

function createBusinessCenter(g, opacity, tint) {
  var deskMat = new THREE.MeshStandardMaterial({ color: 0x4a4a5a, roughness: 0.3, metalness: 0.2, transparent: true, opacity: opacity });
  for (var bi = 0; bi < 2; bi++) {
    var bz = bi * 1.8 - 0.9;
    var desk = new THREE.Mesh(new THREE.BoxGeometry(2, 0.08, 0.8), deskMat);
    desk.position.set(0, 0.75, bz);
    g.add(desk);
    var deskLeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.75, 0.05), deskMat);
    deskLeg1.position.set(-0.9, 0.375, bz - 0.35);
    g.add(deskLeg1);
    var deskLeg2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.75, 0.05), deskMat);
    deskLeg2.position.set(0.9, 0.375, bz - 0.35);
    g.add(deskLeg2);
    var deskLeg3 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.75, 0.05), deskMat);
    deskLeg3.position.set(-0.9, 0.375, bz + 0.35);
    g.add(deskLeg3);
    var deskLeg4 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.75, 0.05), deskMat);
    deskLeg4.position.set(0.9, 0.375, bz + 0.35);
    g.add(deskLeg4);

    var monMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.8, transparent: true, opacity: opacity });
    var monitor = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.03), monMat);
    monitor.position.set(0, 1.1, bz - 0.2);
    g.add(monitor);
    var screenGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.55, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x3498db, emissive: 0x3498db, emissiveIntensity: 0.4, transparent: true, opacity: opacity })
    );
    screenGlow.position.set(0, 1.1, bz - 0.22);
    g.add(screenGlow);

    var chairMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6, transparent: true, opacity: opacity });
    var chair = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 0.4, 8), chairMat);
    chair.position.set(0, 0.5, bz + 0.5);
    g.add(chair);
  }

  var printerMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.5, transparent: true, opacity: opacity });
  var printer = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.4), printerMat);
  printer.position.set(1.2, 0.95, 0);
  g.add(printer);

  var wifiSign = createTextSprite('📶', '#4ade80');
  wifiSign.position.set(-1.2, 2.5, 0);
  wifiSign.scale.set(1.5, 0.8, 1);
  g.add(wifiSign);
}

function createCoffeeBar(g, opacity, tint) {
  var counterMat = new THREE.MeshStandardMaterial({ color: 0x5a3a2a, roughness: 0.4, transparent: true, opacity: opacity });
  var counter = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1, 0.7), counterMat);
  counter.position.set(0, 0.55, -0.5);
  g.add(counter);

  var counterTop = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.06, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.2, metalness: 0.3, transparent: true, opacity: opacity }));
  counterTop.position.set(0, 1.08, -0.5);
  g.add(counterTop);

  var machineMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.3, metalness: 0.7, transparent: true, opacity: opacity });
  var coffeeMachine = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.35), machineMat);
  coffeeMachine.position.set(-0.5, 1.4, -0.5);
  g.add(coffeeMachine);

  var cupMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, transparent: true, opacity: opacity });
  for (var ci = 0; ci < 3; ci++) {
    var cup = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.12, 8), cupMat);
    cup.position.set(0.2 + ci * 0.2, 1.2, -0.5);
    g.add(cup);
  }

  var menuMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.6, transparent: true, opacity: opacity });
  var menuBoard = new THREE.Mesh(new THREE.BoxGeometry(1, 0.8, 0.05), menuMat);
  menuBoard.position.set(0, 2, -0.8);
  g.add(menuBoard);
  var menuText = createTextSprite('☕ MENU', '#fbbf24');
  menuText.position.set(0, 2, -0.75);
  menuText.scale.set(2, 1, 1);
  g.add(menuText);

  var stoolMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.5, transparent: true, opacity: opacity });
  for (var sti = 0; sti < 2; sti++) {
    var stool = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.6, 8), stoolMat);
    stool.position.set(-0.5 + sti * 1, 0.35, 0.3);
    g.add(stool);
  }

  addSteamParticles(g, -0.5, 1.8, -0.5);
}

function createVipLounge(g, opacity, tint) {
  var goldMat = new THREE.MeshStandardMaterial({ color: 0xdaa520, roughness: 0.2, metalness: 0.8, transparent: true, opacity: opacity });
  var sofaMat = new THREE.MeshStandardMaterial({ color: 0x8B0000, roughness: 0.3, transparent: true, opacity: opacity });

  var sofa = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.5, 1), sofaMat);
  sofa.position.set(0, 0.5, -0.8);
  g.add(sofa);
  var sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.8, 0.15), sofaMat);
  sofaBack.position.set(0, 0.9, -1.25);
  g.add(sofaBack);
  var sofaArmL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 1), sofaMat);
  sofaArmL.position.set(-1.25, 0.7, -0.8);
  g.add(sofaArmL);
  var sofaArmR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 1), sofaMat);
  sofaArmR.position.set(1.25, 0.7, -0.8);
  g.add(sofaArmR);

  var trim = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.05, 0.05), goldMat);
  trim.position.set(0, 0.75, -1.2);
  g.add(trim);

  var tableMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.1, metalness: 0.5, transparent: true, opacity: opacity });
  var table = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.6), tableMat);
  table.position.set(0, 0.5, 0);
  g.add(table);
  var tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6), goldMat);
  tableLeg.position.set(0, 0.25, 0);
  g.add(tableLeg);

  var champMat = new THREE.MeshStandardMaterial({ color: 0x2a5a2a, roughness: 0.3, transparent: true, opacity: opacity });
  var bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.35, 8), champMat);
  bottle.position.set(-0.3, 0.72, 0);
  g.add(bottle);

  var glassMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, metalness: 0.3, transparent: true, opacity: opacity * 0.6 });
  var glass = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.15, 8), glassMat);
  glass.position.set(0.1, 0.6, 0);
  g.add(glass);

  var vipLight = new THREE.PointLight(0xdaa520, 0.6, 5);
  vipLight.position.set(0, 2.5, -0.5);
  g.add(vipLight);

  var crownSign = createTextSprite('👑', '#daa520');
  crownSign.position.set(0, 2.8, -0.5);
  crownSign.scale.set(2, 1, 1);
  g.add(crownSign);
}

function addSteamParticles(g, x, y, z) {
  var steamMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, transparent: true, opacity: 0.3, roughness: 1
  });
  for (var pi = 0; pi < 5; pi++) {
    var particle = new THREE.Mesh(new THREE.SphereGeometry(0.05 + Math.random() * 0.05, 4, 4), steamMat.clone());
    particle.position.set(
      x + (Math.random() - 0.5) * 0.2,
      y + Math.random() * 0.5,
      z + (Math.random() - 0.5) * 0.2
    );
    particle.userData.steamData = {
      baseX: x, baseY: y, baseZ: z,
      speed: 0.005 + Math.random() * 0.01,
      offset: Math.random() * Math.PI * 2
    };
    g.add(particle);
    interiorParticles.push(particle);
  }
}

function createInteriorDecorations(os) {
  var level = os.level || 1;
  var roomW = 24 + level * 4;
  var roomD = 18 + level * 3;

  var plantPositions = [
    { x: -roomW / 2 + 1, z: roomD / 2 - 1 },
    { x: roomW / 2 - 1, z: roomD / 2 - 1 },
    { x: -roomW / 2 + 1, z: -roomD / 2 + 1 },
    { x: roomW / 2 - 1, z: -roomD / 2 + 1 }
  ];
  plantPositions.forEach(function(p) {
    var potMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.7 });
    var pot = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.2, 0.4, 8), potMat);
    pot.position.set(p.x, 0.2, p.z);
    interiorGroup.add(pot);
    var leafMat = new THREE.MeshStandardMaterial({ color: 0x27ae60, roughness: 0.8 });
    var leaves = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 6), leafMat);
    leaves.position.set(p.x, 0.8, p.z);
    interiorGroup.add(leaves);
  });

  if (level >= 2) {
    var artMat = new THREE.MeshStandardMaterial({ color: 0x2a3a5a, roughness: 0.5 });
    var art1 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, 0.05), artMat);
    art1.position.set(-roomW / 2 + 0.2, 2.5, 0);
    art1.rotation.y = Math.PI / 2;
    interiorGroup.add(art1);
    var artFrame1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 0.03), new THREE.MeshStandardMaterial({ color: 0xdaa520, metalness: 0.5 }));
    artFrame1.position.set(-roomW / 2 + 0.18, 2.5, 0);
    artFrame1.rotation.y = Math.PI / 2;
    interiorGroup.add(artFrame1);
  }

  if (level >= 3) {
    var art2 = new THREE.Mesh(new THREE.BoxGeometry(2, 1.2, 0.05), new THREE.MeshStandardMaterial({ color: 0x5a2a3a, roughness: 0.5 }));
    art2.position.set(0, 2.5, -roomD / 2 + 0.2);
    interiorGroup.add(art2);
    var artFrame2 = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.3, 0.03), new THREE.MeshStandardMaterial({ color: 0xdaa520, metalness: 0.5 }));
    artFrame2.position.set(0, 2.5, -roomD / 2 + 0.18);
    interiorGroup.add(artFrame2);
  }

  if (level >= 4) {
    var stripMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.5 });
    var strip1 = new THREE.Mesh(new THREE.BoxGeometry(roomW - 2, 0.03, 0.03), stripMat);
    strip1.position.set(0, 3.5, -roomD / 2 + 0.2);
    interiorGroup.add(strip1);
    var strip2 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, roomD - 2), stripMat);
    strip2.position.set(-roomW / 2 + 0.2, 3.5, 0);
    interiorGroup.add(strip2);
  }

  if (level >= 5) {
    var chandelierMat = new THREE.MeshStandardMaterial({ color: 0xdaa520, metalness: 0.9, roughness: 0.1 });
    var chandelier = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 8), chandelierMat);
    chandelier.position.set(0, 4, 0);
    interiorGroup.add(chandelier);
    var chandelierLight = new THREE.PointLight(0xffeedd, 0.8, 15);
    chandelierLight.position.set(0, 3.8, 0);
    interiorGroup.add(chandelierLight);

    var glassWallMat = new THREE.MeshStandardMaterial({
      color: 0x88ccff, roughness: 0.05, metalness: 0.9, transparent: true, opacity: 0.3
    });
    var glassWall = new THREE.Mesh(new THREE.BoxGeometry(roomW - 2, 2, 0.05), glassWallMat);
    glassWall.position.set(0, 1.5, -roomD / 2 + 0.5);
    interiorGroup.add(glassWall);
  }
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  if (!interiorMode) {
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
  }

  if (interiorMode) {
    var time = Date.now() * 0.001;
    interiorParticles.forEach(function(p) {
      var sd = p.userData.steamData;
      if (!sd) return;
      p.position.y += sd.speed;
      p.position.x = sd.baseX + Math.sin(time * 2 + sd.offset) * 0.1;
      p.position.z = sd.baseZ + Math.cos(time * 2 + sd.offset) * 0.1;
      if (p.position.y > sd.baseY + 1) {
        p.position.y = sd.baseY;
        p.material.opacity = 0.3;
      } else {
        p.material.opacity = Math.max(0, 0.3 - (p.position.y - sd.baseY) * 0.3);
      }
    });
  }

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
