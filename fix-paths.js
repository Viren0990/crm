const fs = require('fs');
const filePath = 'src/app/actions/leadActions.ts';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/revalidateTag\([^)]+\)\s*revalidatePath\('\/'\)/g, "revalidatePath('/leads')");
content = content.replace(/revalidatePath\('\/'\)/g, "revalidatePath('/leads')");

fs.writeFileSync(filePath, content);
console.log('Fixed paths');
