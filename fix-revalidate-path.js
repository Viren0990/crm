const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'src/app/actions');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes("import { revalidatePath")) {
      content = content.replace("import { revalidateTag", "import { revalidatePath, revalidateTag");
  }
  
  content = content.replace(/revalidateTag\('([^']+)', 'max'\)/g, "revalidateTag('$1', 'max')\n    revalidatePath('/')");
  
  fs.writeFileSync(filePath, content);
});
console.log('Added revalidatePath');
