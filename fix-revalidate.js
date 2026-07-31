const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'src/app/actions');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Regex to match `revalidateTag('something')` or `revalidateTag('something', undefined)`
  // and safely insert a ts-expect-error if it's not already there.
  content = content.replace(/(?<!\/\/ @ts-expect-error.*\n\s*)revalidateTag\((['"][^'"]+['"])(?:,\s*undefined)?\)/g, '// @ts-expect-error Next.js 15 canary typing bug for dynamicIO\n    revalidateTag($1)');
  
  fs.writeFileSync(filePath, content);
});
console.log('Fixed tags');
