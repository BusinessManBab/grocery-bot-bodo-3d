import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createFrame, createDecks, M } from '../src/world-build.js';
import { museumUnderpass } from '../src/museum-underpass.js';

const terrain = JSON.parse(fs.readFileSync(new URL('../data/terrain.json', import.meta.url)));
terrain.bounds = JSON.parse(fs.readFileSync(new URL('../data/game-map.json', import.meta.url))).bounds;
const bytes = fs.readFileSync(new URL('../data/terrain.bin', import.meta.url));
terrain.heights = new Uint16Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
const frame = createFrame(terrain), pass = museumUnderpass(frame.wx, frame.wy);
const { roadY } = createDecks([], frame.heightAt);
const centreDrop = frame.groundHeightAt(pass.cx, pass.cz) - roadY(pass.cx, pass.cz);
assert(centreDrop > 2.5 * M && centreDrop <= 3.01 * M, 'Road should dip about three metres');
assert(pass.truckGrow(1.25, pass.cx, pass.cz) <= .160001, 'Overview trucks must fit the physical opening');
let previous = null, maximumRamp = 0;
for (let s = -130; s <= 130; s += 2) {
  const [x, z] = pass.at(s * M, 0);
  const drop = frame.groundHeightAt(x, z) - frame.heightAt(x, z);
  assert(drop >= -.001 && drop <= 3.01 * M);
  assert.equal(roadY(x, z), frame.heightAt(x, z), 'Truck road and terrain must use the same surface');
  if (previous !== null) maximumRamp = Math.max(maximumRamp, Math.abs(drop - previous) / (2 * M));
  previous = drop;
}
assert(maximumRamp < .12, 'No abrupt steps in the approach ramps');
for (const s of [-150, 150]) {
  const [x, z] = pass.at(s * M, 0);
  assert(Math.abs(frame.groundHeightAt(x, z) - frame.heightAt(x, z)) < .001);
}
console.log(`PASS: museum road dips ${(centreDrop / M).toFixed(2)} m, smooth ramps, shared terrain/truck surface`);
