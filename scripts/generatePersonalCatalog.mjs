import fs from 'node:fs';
import path from 'node:path';
import { componentMetadata } from '../src/constants/Information.js';
import { createHash } from 'node:crypto';

const output = path.resolve('public/personal-registry');
fs.mkdirSync(output, { recursive: true });
const hash = text => createHash('sha256').update(text).digest('hex');
const template = fs.readFileSync('src/personal/upstreamPrompt.js', 'utf8');
fs.writeFileSync(path.join(output, 'upstreamPrompt.js'), template);
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
  const entry = {
    schemaVersion: 2,
    id: `${item.category}/${item.name}`,
    name: item.name,
    category: item.category,
    description: item.description,
    path: new URL(item.docsUrl).pathname,
    upstreamUrl: item.docsUrl,
    upstreamCommit: '7b69ba117ca7876dc9ca5ff3c09cf514de4b2d62',
    license: '/LICENSE.md',
    sources,
    prompt: {
      kind: 'upstream-source-assisted-integration',
      languages: ['en', 'zh'],
      english: 'Original React Bits Copy prompt template; unchanged English instructions.',
      chinese:
        'Translation of upstream instructions; source, dependency strings and property descriptions stay verbatim.',
      templateUrl: '/personal-registry/upstreamPrompt.js',
      templateSha256: hash(template),
      usage:
        'The live demo supplies configured usage, props, source and selected code variant to the template. Open Original prompt in the component detail or Copy for AI in the preview.',
      originalSource:
        'https://github.com/DavidHDev/react-bits/blob/7b69ba117ca7876dc9ca5ff3c09cf514de4b2d62/src/components/common/TabsLayout.jsx'
    }
  };
  fs.writeFileSync(path.join(output, `${item.name}.json`), JSON.stringify(entry, null, 2) + '\n');
  return {
    id: entry.id,
    name: item.name,
    category: item.category,
    path: entry.path,
    url: `/personal-registry/${item.name}.json`
  };
});
fs.writeFileSync(path.join(output, 'index.json'), JSON.stringify({ schemaVersion: 2, items }, null, 2) + '\n');
fs.copyFileSync('LICENSE.md', 'public/LICENSE.md');
fs.writeFileSync(
  'public/llms.txt',
  `# UI / Bits — Personal React Bits library\n\nRead /personal-registry/index.json to discover ${items.length} components. Follow each item URL for source variants, dependencies, SHA-256 checksums and license. Resolve relative URLs against this origin.\n\nPrompts use the original React Bits Copy prompt. English is unchanged. Chinese translates its instructions while preserving source code, dependency names, API values and property descriptions. These prompts integrate supplied source; no invented standalone recreation specifications or model-generation claims are included. The live UI builds the prompt from the selected demo configuration; the reusable template is /personal-registry/upstreamPrompt.js.\n\nUpstream: https://github.com/DavidHDev/react-bits\nPersonal fork: https://github.com/cy6909/react-bits\nLicense: /LICENSE.md\n`
);
console.log(`Exported ${items.length} entries using upstream bilingual prompt templates.`);
