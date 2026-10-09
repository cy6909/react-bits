import fs from 'node:fs';
import path from 'node:path';
import { componentMetadata } from '../src/constants/Information.js';
import { prompts, provenance } from '../src/personal/prompts.js';
import { createHash } from 'node:crypto';

const output = path.resolve('public/personal-registry');
fs.mkdirSync(output, { recursive: true });
const hash = text => createHash('sha256').update(text).digest('hex');
const items = Object.values(componentMetadata).map(item => {
  const variants = item.variants || ['JS-CSS', 'JS-TW', 'TS-CSS', 'TS-TW'];
  const sources = variants.map(variant => {
    const file = `public/r/${item.name}-${variant}.json`;
    const raw = fs.readFileSync(file, 'utf8');
    const registry = JSON.parse(raw);
    if (!registry.files?.length || registry.files.some(f => typeof f.content !== 'string'))
      throw new Error(`Incomplete source: ${file}`);
    return {
      variant,
      url: `/r/${item.name}-${variant}.json`,
      sha256: hash(raw),
      dependencies: registry.dependencies || []
    };
  });
  const spec = prompts[item.name];
  const entry = {
    schemaVersion: 1,
    id: `${item.category}/${item.name}`,
    name: item.name,
    category: item.category,
    description: item.description,
    path: new URL(item.docsUrl).pathname,
    upstreamUrl: item.docsUrl,
    upstreamCommit: '7b69ba117ca7876dc9ca5ff3c09cf514de4b2d62',
    license: '/LICENSE.md',
    sources,
    prompts: spec
      ? Object.fromEntries(
          Object.entries(spec).map(([lang, content]) => [
            lang,
            { content, sha256: hash(content), status: 'unverified' }
          ])
        )
      : {},
    generation: provenance
  };
  fs.writeFileSync(path.join(output, `${item.name}.json`), JSON.stringify(entry, null, 2) + '\n');
  return {
    id: entry.id,
    name: item.name,
    category: item.category,
    path: entry.path,
    hasRecreationSpec: Boolean(spec),
    url: `/personal-registry/${item.name}.json`
  };
});
fs.writeFileSync(path.join(output, 'index.json'), JSON.stringify({ schemaVersion: 1, items }, null, 2) + '\n');
fs.copyFileSync('LICENSE.md', 'public/LICENSE.md');
fs.writeFileSync(
  'public/llms.txt',
  `# UI / Bits — Personal React Bits library\n\nRead /personal-registry/index.json to discover ${items.length} components. Follow each item URL for variant-specific source bundles, dependencies, SHA-256 checksums, license and provenance. Resolve relative URLs against the serving origin.\n\nRecreation prompts are authored candidates, not validated generation outcomes. Upstream demos are not generated from these prompts. Unknown model, agent and reasoning fields are null. Source-assisted integration and prompt-only recreation are different workflows.\n\nUpstream: https://github.com/DavidHDev/react-bits\nPersonal fork: https://github.com/cy6909/react-bits\nLicense: /LICENSE.md\n`
);
console.log(`Exported ${items.length} entries; ${Object.keys(prompts).length} unverified recreation specs.`);
