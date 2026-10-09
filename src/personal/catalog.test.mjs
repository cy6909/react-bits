import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalog, filterCatalog, titlesZh } from './catalog.js';
import { prompts, provenance } from './prompts.js';

test('all imported entries have unique routes, stable IDs and Chinese names', () => {
  assert.equal(new Set(catalog.map(x => x.id)).size, catalog.length);
  assert.equal(new Set(catalog.map(x => x.path)).size, catalog.length);
  for (const item of catalog) {
    assert.ok(titlesZh[item.name], item.name);
    assert.ok(item.path.startsWith('/'));
  }
});
test('Chinese and English search compose with category, saved and prompt filters', () => {
  assert.equal(filterCatalog(catalog, { query: '纵深 轮播' })[0].name, 'DepthCarousel');
  assert.equal(filterCatalog(catalog, { query: 'DEPTHCAROUSEL' })[0].titleZh, '纵深轮播');
  assert.equal(filterCatalog(catalog, { query: '纵深', category: 'Backgrounds' }).length, 0);
  assert.equal(filterCatalog(catalog, { savedOnly: true, saved: [] }).length, 0);
  assert.equal(filterCatalog(catalog, { promptOnly: true, promptNames: Object.keys(prompts) }).length, 3);
  assert.equal(filterCatalog(catalog, { query: 'no-such-component-zyx' }).length, 0);
});
test('imported demos cannot masquerade as completed prompt-only runs', () => {
  assert.equal(provenance.origin, 'upstream');
  assert.equal(provenance.reproductionStatus, 'unverified');
  for (const field of ['agent', 'model', 'reasoningEffort', 'skillsLoaded', 'attempts'])
    assert.equal(provenance[field], null);
  for (const name of Object.keys(prompts)) {
    assert.ok(catalog.some(x => x.name === name));
    assert.ok(prompts[name].zh.length > 400);
    assert.ok(prompts[name].en.length > 400);
  }
});
