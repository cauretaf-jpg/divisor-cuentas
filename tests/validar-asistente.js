// Validaciones sin dependencias externas — ejecutar con: node tests/validar-asistente.js
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const source = readFileSync('script.js', 'utf8');
const appHtml = readFileSync('app.html', 'utf8');
const css = readFileSync('styles.css', 'utf8');
const sw = readFileSync('service-worker.js', 'utf8');

assert.doesNotThrow(() => new Function(source), 'script.js debe ser JavaScript válido');
const start = source.indexOf('function calculateBill(bill');
const end = source.indexOf('\n}\n\n', start) + 2;
assert.ok(start >= 0 && end > start, 'Debe existir calculateBill');
const calculate = new Function('getActiveBill', 'CATEGORIES', source.slice(start, end) + '; return calculateBill;')(
  () => null, ['Comida', 'Otros', 'Bebestibles', 'Tragos']
);
const people = ['a', 'b', 'c'].map((id) => ({ id, name: id, previousDebt: 0, paid: false }));
const product = (cost = 19990) => ({
  id: 'p', name: 'Consumo', category: 'Comida', unitPrice: cost, quantity: 1,
  consumers: [{ personId: 'a', share: 2 }, { personId: 'b', share: 1 }],
});
const bill = (fields = {}) => ({
  mode: 'detailed', people, products: [product()], tipPercent: 10,
  tipSplitMode: 'proportional', tipExemptIds: [], tipCustomAmounts: {}, ...fields,
});
let result = calculate(bill());
assert.equal(result.tipAmount, 1999);
assert.equal(people.reduce((sum, p) => sum + result.personDetails[p.id].tip, 0), 1999);
result = calculate(bill({ tipSplitMode: 'equal' }));
assert.deepEqual(people.map((p) => result.personDetails[p.id].tip), [667, 666, 666]);
result = calculate(bill({ tipExemptIds: ['b', 'c'] }));
assert.equal(result.personDetails.a.tip, 1999);
assert.equal(result.personDetails.b.tip, 0);
result = calculate(bill({ tipSplitMode: 'custom', tipCustomAmounts: { a: 1000, b: 999 } }));
assert.equal(result.personDetails.a.tip, 1000);
assert.equal(result.personDetails.b.tip, 999);
result = calculate(bill({ mode: 'quick', quickTotal: 50000, products: [] }));
assert.equal(result.grandTotal, 55000);
result = calculate(bill({ people: people.map((p) => ({ ...p, previousDebt: p.id === 'a' ? 5000 : 0 })) }));
assert.equal(result.tipAmount, 1999);
for (const label of ['Bar', 'Cafetería', 'Juntada o evento']) {
  assert.ok(source.includes("label: '" + label + "'"), 'Falta ' + label);
}
for (const name of ['Mojito', 'Papas fritas', 'Empanadas', 'Queso', 'Capuchino']) {
  assert.ok(source.includes("name: '" + name + "'"), 'Falta sugerencia ' + name);
}
assert.ok(appHtml.includes('script.js?v=13.22.0'));
assert.ok(css.includes('.account-wizard-suggestion-list'));
assert.ok(sw.includes("cuenta-clara-v13.22.0"));
console.log('Validaciones de asistente v13.22.0: OK (10 grupos de pruebas).');
