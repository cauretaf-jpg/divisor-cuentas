const fs = require('fs');
let content = fs.readFileSync('C:\Users\caure\Desktop\Paginas\Cuentas\script.js', 'utf8');

const replacements = [
  [new RegExp('lines\\.push\\(`<b>\\$\\{person\\.name\\}: \\$\\{formatCurrency\\(person\\.total\\)\\}<\\)/b>\\`\\);', 'g'), 'lines.push(`*${person.name}*: ${formatCurrency(person.total)}`);'],
  [new RegExp('lines\\.push\\(`<b>- \\$\\{item\\.label\\}\\\\}\\$\\{partDetail\\}: \\$\\{formatCurrency\\(item\\.value\\)\\}<\\)/b>\\`\\);', 'g'), 'lines.push(`*- ${item.label}${partDetail}*: ${formatCurrency(item.value)}`);'],
  [new RegExp('lines\\.push\\(`<b>Subtotal: \\$\\{formatCurrency\\(person\\.subtotal\\)\\}<\\)/b>\\`\\);', 'g'), 'lines.push(`*Subtotal*: ${formatCurrency(person.subtotal)}`);'],
  [new RegExp('lines\\.push\\(`<b>Propina: \\$\\{formatCurrency\\(person\\.tip\\)\\}<\\)/b>\\`\\);', 'g'), 'lines.push(`*Propina*: ${formatCurrency(person.tip)}`);'],
  [new RegExp('lines\\.push\\(`<b>Subtotal general: \\$\\{formatCurrency\\(summary\\.subtotal\\)\\}<\\)/b>\\`\\);', 'g'), 'lines.push(`*Subtotal general*: ${formatCurrency(summary.subtotal)}`);'],
  [new RegExp('lines\\.push\\(`<b>Propina general: \\$\\{formatCurrency\\(summary\\.tipAmount\\)\\}<\\)/b>\\`\\);', 'g'), 'lines.push(`*Propina general*: ${formatCurrency(summary.tipAmount)}`);'],
  [new RegExp('lines\\.push\\(`<b>Total general: \\$\\{formatCurrency\\(summary\\.grandTotal\\)\\}<\\)/b>\\`\\);', 'g'), 'lines.push(`*Total general*: ${formatCurrency(summary.grandTotal)}`);'],
];

replacements.forEach(([pattern, repl]) => {
  content = content.replace(pattern, repl);
});

fs.writeFileSync('C:\Users\caure\Desktop\Paginas\Cuentas\script.js', content, 'utf8');
console.log('Done');