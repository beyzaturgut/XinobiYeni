import { test, expect } from '@playwright/test';
import { transferPreviewPlacements, type PreviewGeometry } from '../../src/features/product-personalization/preview-placement-transfer';

const source: PreviewGeometry = { width: 1000, height: 1600, bodies: [
  { id: 'upper-body', left: 200, top: 300, width: 500, height: 300 },
  { id: 'lower-body', left: 150, top: 750, width: 600, height: 500 },
] };
const target: PreviewGeometry = { width: 1200, height: 1800, bodies: [
  { id: 'upper-body', left: 240, top: 350, width: 550, height: 330 },
  { id: 'lower-body', left: 180, top: 840, width: 680, height: 530 },
] };
for (const lower of [false, true]) test(`single artwork maps and returns on ${lower ? 'lower' : 'upper'} body`, () => {
  const state = { pattern: { x: 520, y: 1060, scale: 1.2, rotation: 25 },
    artwork: { x: 500, y: lower ? 1590 : 1040, scale: 1, rotation: 30 } };
  const mapped = transferPreviewPlacements(source, target, state, { width: 400, height: 300 });
  expect(mapped.artwork.rotation).toBe(30);
  expect(mapped.pattern.scale).toBe(1.2);
  expect(mapped.pattern.rotation).toBe(25);
  expect(mapped.bodyAdjustments?.['lower-body']).toBeTruthy();
  const back = transferPreviewPlacements(target, source, mapped, { width: 400, height: 300 });
  expect(back).toEqual({ ...state, bodyAdjustments: undefined });
});
test('rejects seam and outside artwork centres without mutating state', () => {
  for (const y of [1265, 0]) {
    const state = { pattern: { x: 500, y: 1040, scale: 1.2, rotation: 0 }, artwork: { x: 500, y, scale: 1, rotation: 0 } };
    const before = JSON.stringify(state);
    expect(() => transferPreviewPlacements(source, target, state, { width: 400, height: 300 })).toThrow();
    expect(JSON.stringify(state)).toBe(before);
  }
});
test('rejects missing named surfaces and unsupported scale', () => {
  const state = { pattern: { x: 500, y: 1040, scale: 1.2, rotation: 0 }, artwork: { x: 500, y: 1040, scale: 4, rotation: 0 } };
  expect(() => transferPreviewPlacements(source, { ...target, bodies: target.bodies.slice(0, 1) }, state)).toThrow();
  expect(() => transferPreviewPlacements(source, target, state, { width: 400, height: 300 })).toThrow();
});
test('pattern alone keeps independent body phases and round trips', () => {
  const state = { pattern: { x: 530, y: 1080, scale: 1.4, rotation: 10 }, artwork: { x: 500, y: 1040, scale: 1, rotation: 0 } };
  const mapped = transferPreviewPlacements(source, target, state);
  expect(transferPreviewPlacements(target, source, mapped)).toEqual({ ...state, bodyAdjustments: undefined });
});
