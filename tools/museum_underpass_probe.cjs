// Run on a GPU machine only. Injects a temporary truck path into the in-memory replay.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const out = process.env.SHOTS_DIR || '/tmp/opencode/bodo-underpass';
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: [
    '--no-sandbox', '--headless=new', '--use-gl=angle', '--use-angle=gl-egl', '--ignore-gpu-blocklist',
  ] });
  try {
    const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.argv[2] || 'http://localhost:8138/?view=3d');
    await page.waitForFunction(() => window.groceryView?.world3d?.cityDone && groceryView.panels, null, { timeout: 180000 });
    const info = await page.evaluate(async () => {
      const g = groceryView, w = g.world3d;
      g.play.paused = true;
      g.play.following = false;
      g.panels.closeShop?.();
      const { museumUnderpass } = await import('./src/museum-underpass.js?v=31');
      const pass = museumUnderpass(x => g.toWorld(x, 0)[0], y => g.toWorld(0, y)[1]);
      const base = g.toWorld(0, 0), sx = g.toWorld(1, 0)[0] - base[0];
      window.testMuseum = { pass, raw: (x, z) => [(x - base[0]) / sx, base[1] - z] };
      const y = w.surfaceAt(pass.cx, pass.cz).road;
      w.look(14.41378, 67.27598, 120, .9, 0);
      const [x, z] = pass.at(-80 / 1.113, 45 / 1.113);
      w.controls.target.set(pass.cx, y + 5, pass.cz);
      w.camera.position.set(x, y + 45 / 1.113, z);
      w.camera.lookAt(w.controls.target);
      return { ...w.landmarkStats.museumUnderpass, surface: w.surfaceAt(pass.cx, pass.cz) };
    });
    assert(info.surface.ground - info.surface.road > 2);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(out, 'museum-overpass-aerial.png') });
    let minimumClearance = Infinity;
    for (let s = -55; s <= 55; s += 5) {
      await page.evaluate(s => {
        const g = groceryView, { pass, raw } = testMuseum;
        const a = raw(...pass.at(s / 1.113, 0)), b = raw(...pass.at((s + .5) / 1.113, 0));
        g.game.frames[230].p[0][4].splice(0, 3, ...a, 5);
        g.game.frames[231].p[0][4].splice(0, 3, ...b, 5);
        g.play.head = 230.5;
      }, s);
      await page.waitForTimeout(100);
      if (Math.abs(s) <= 5) {
        const top = await page.evaluate(async () => {
          const THREE = await import('three'), box = new THREE.Box3();
          const matrix = new THREE.Matrix4();
          for (const mesh of groceryView.world3d.scene.children.filter(o => o.userData.fleetSeat === 0)) {
            if (!mesh.count) continue;
            mesh.geometry.computeBoundingBox();
            mesh.getMatrixAt(0, matrix);
            matrix.premultiply(mesh.matrixWorld);
            box.union(mesh.geometry.boundingBox.clone().applyMatrix4(matrix));
          }
          return box.max.y;
        });
        assert(Number.isFinite(top), 'Actual truck geometry must be available');
        minimumClearance = Math.min(minimumClearance, info.soffit - top);
        assert(top + .5 < info.soffit, `Truck roof ${top.toFixed(2)} must clear gallery underside ${info.soffit.toFixed(2)} (road ${info.surface.road.toFixed(2)})`);
      }
      if ([-40, 0, 40].includes(s))
        await page.screenshot({ path: path.join(out, `truck-${s + 40}.png`) });
    }
    await page.evaluate(() => {
      const w = groceryView.world3d, pass = testMuseum.pass;
      const y = w.surfaceAt(pass.cx, pass.cz).road, [x, z] = pass.at(-70 / 1.113, 8 / 1.113);
      w.controls.target.set(pass.cx, y + 3, pass.cz);
      w.camera.position.set(x, y + 8, z); w.camera.lookAt(w.controls.target);
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(out, 'museum-road-opening.png') });
    // Check every player's different truck body/roof, including the exaggerated
    // overview zoom. Temporary route edits are restored after each look.
    for (const distance of [120, 5000]) for (let seat = 0; seat < 5; seat++) {
      await page.evaluate(({ distance, seat }) => {
        const g = groceryView, { pass, raw } = testMuseum;
        testMuseum.saved = [g.game.frames[230].p[seat][4].slice(), g.game.frames[231].p[seat][4].slice()];
        g.game.frames[230].p[seat][4].splice(0, 3, ...raw(...pass.at(0, 0)), 5);
        g.game.frames[231].p[seat][4].splice(0, 3, ...raw(...pass.at(.5, 0)), 5);
        g.play.head = 230.5;
        g.world3d.look(14.41378, 67.27598, distance, .9, 0);
      }, { distance, seat });
      await page.waitForTimeout(150);
      const top = await page.evaluate(async seat => {
        const THREE = await import('three'), box = new THREE.Box3(), matrix = new THREE.Matrix4();
        for (const mesh of groceryView.world3d.scene.children.filter(o => o.userData.fleetSeat === seat)) {
          if (!mesh.count) continue;
          mesh.geometry.computeBoundingBox(); mesh.getMatrixAt(0, matrix);
          matrix.premultiply(mesh.matrixWorld);
          box.union(mesh.geometry.boundingBox.clone().applyMatrix4(matrix));
        }
        return box.max.y;
      }, seat);
      assert(Number.isFinite(top) && top + .5 < info.soffit, `Seat ${seat} must clear museum at camera distance ${distance}`);
      minimumClearance = Math.min(minimumClearance, info.soffit - top);
      await page.evaluate(seat => {
        groceryView.game.frames[230].p[seat][4] = testMuseum.saved[0];
        groceryView.game.frames[231].p[seat][4] = testMuseum.saved[1];
      }, seat);
    }
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ result: 'PASS', depthMetres: (info.surface.ground - info.surface.road) * 1.113,
      minimumTruckClearanceMetres: minimumClearance * 1.113, truckLooks: 5, cameraDistances: [120, 5000], errors }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
