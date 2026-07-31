const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'src/app/actions');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove the ts-expect-error comments we added earlier
  content = content.replace(/\/\/ @ts-expect-error Next\.js 15 canary typing bug(?: for dynamicIO)?\n\s*/g, '');
  
  // Replace revalidateTag('tag') or revalidateTag('tag', undefined) with revalidateTag('tag', 'max')
  content = content.replace(/revalidateTag\((['"][^'"]+['"])(?:,\s*undefined)?\)/g, "revalidateTag($1, 'max')");
  
  fs.writeFileSync(filePath, content);
});
console.log('Fixed tags to use max');
