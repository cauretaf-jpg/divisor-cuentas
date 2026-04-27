var fs = require('fs');
var data = fs.readFileSync('C:\\Users\\caure\\Desktop\\Paginas\\Cuentas\\script.js', 'utf8');

var replacements = [
  ['<b>\\${person.name}: \\${formatCurrency(person.total)}<\\/b>', '*\\${person.name}*: \\${formatCurrency(person.total)}'],
  ['<b>- \\${item.label}\\${partDetail}: \\${formatCurrency(item.value)}<\\/b>', '*- \\${item.label}\\${partDetail}: \\${formatCurrency(item.value)}'],
  ['<b>Subtotal: \\${formatCurrency(person.subtotal)}<\\/b>', '*Subtotal*: \\${formatCurrency(person.subtotal)}'],
  ['<b>Propina: \\${formatCurrency(person.tip)}<\\/b>', '*Propina*: \\${formatCurrency(person.tip)}'],
  ['<b>Subtotal general: \\${formatCurrency(summary.subtotal)}<\\/b>', '*Subtotal general*: \\${formatCurrency(summary.subtotal)}'],
  ['<b>Propina general: \\${formatCurrency(summary.tipAmount)}<\\/b>', '*Propina general*: \\${formatCurrency(summary.tipAmount)}'],
  ['<b>Total general: \\${formatCurrency(summary.grandTotal)}<\\/b>', '*Total general*: \\${formatCurrency(summary.grandTotal)}']
];

replacements.forEach(function(pair) {
  var re = new RegExp(pair[0], 'g');
  data = data.replace(re, pair[1]);
});

fs.writeFileSync('C:\\Users\\caure\\Desktop\\Paginas\\Cuentas\\script.js', data);
console.log('Done');