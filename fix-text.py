import re

with open(r'C:\Users\caure\Desktop\Paginas\Cuentas\script.js', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    (r'lines\.push\(`<b>\$\{person\.name\}: \$\{formatCurrency\(person\.total\)\}<\)/b>`\);', 'lines.push(`*${person.name}*: ${formatCurrency(person.total)}`);'),
    (r'lines\.push\(`<b>- \$\{item\.label\}\$\{partDetail\}: \$\{formatCurrency\(item\.value\)\}<\)/b>`\);', 'lines.push(`*- ${item.label}${partDetail}*: ${formatCurrency(item.value)}`);'),
    (r'lines\.push\(`<b>Subtotal: \$\{formatCurrency\(person\.subtotal\)\}<\)/b>`\);', 'lines.push(`*Subtotal*: ${formatCurrency(person.subtotal)}`);'),
    (r'lines\.push\(`<b>Propina: \$\{formatCurrency\(person\.tip\)\}<\)/b>`\);', 'lines.push(`*Propina*: ${formatCurrency(person.tip)}`);'),
    (r'lines\.push\(`<b>Subtotal general: \$\{formatCurrency\(summary\.subtotal\)\}<\)/b>`\);', 'lines.push(`*Subtotal general*: ${formatCurrency(summary.subtotal)}`);'),
    (r'lines\.push\(`<b>Propina general: \$\{formatCurrency\(summary\.tipAmount\)\}<\)/b>`\);', 'lines.push(`*Propina general*: ${formatCurrency(summary.tipAmount)}`);'),
    (r'lines\.push\(`<b>Total general: \$\{formatCurrency\(summary\.grandTotal\)\}<\)/b>`\);', 'lines.push(`*Total general*: ${formatCurrency(summary.grandTotal)}`);'),
]

for pattern, repl in replacements:
    content = re.sub(pattern, repl, content)

with open(r'C:\Users\caure\Desktop\Paginas\Cuentas\script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')