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
assert.ok(appHtml.includes('script.js?v=13.23.0'));
assert.ok(css.includes('.account-wizard-suggestion-list'));
assert.ok(sw.includes("cuenta-clara-v13.23.0"));
// Comprobaciones de conciliación sin navegador ni conexión a Supabase.
const reviewStart = source.indexOf('function getAccountWizardReviewChecks(bill');
const reviewEnd = source.indexOf('\n}\n\n', reviewStart) + 2;
assert.ok(reviewStart >= 0 && reviewEnd > reviewStart, 'Debe existir la revisión del asistente');
const checksFor = new Function('getAccountWizardBill', 'getBillGrandTotal', 'calculateBill', 'formatCurrency',
  source.slice(reviewStart, reviewEnd) + '; return getAccountWizardReviewChecks;')(
  () => null, (b) => calculate(b).grandTotal, calculate, (amount) => String(Math.round(amount))
);
const baseForReview = bill({
  name: 'Cena de prueba', payerId: 'a',
  receiptExpectedSubtotal: 19990,
  tipSplitMode: 'custom',
  tipCustomAmounts: { a: 1000, b: 999, c: 0 },
});
let checks = checksFor(baseForReview);
assert.equal(checks.find((c) => c.label === 'Conciliación de boleta')?.status, 'ok');
assert.equal(checks.find((c) => c.label === 'Reparto personalizado')?.status, 'ok');
checks = checksFor({ ...baseForReview, receiptExpectedSubtotal: 21000 });
assert.equal(checks.find((c) => c.label === 'Conciliación de boleta')?.status, 'error');
checks = checksFor({ ...baseForReview, tipCustomAmounts: { a: 1000, b: 0, c: 0 } });
assert.equal(checks.find((c) => c.label === 'Reparto personalizado')?.status, 'error');
const doubled = calculate(bill({ products: [{ ...product(), quantity: 2 }] }));
assert.equal(doubled.subtotal, 39980, 'Se debe multiplicar cantidad por precio unitario');
assert.ok(source.includes("id=\"accountWizardProductQuantity\""), 'Falta el campo de cantidad');
assert.ok(source.includes("id=\"accountWizardReceiptSubtotal\""), 'Falta el subtotal de boleta');
assert.ok(source.includes('account-wizard-person-results'), 'Falta desglose por persona');
const inviteSql = readFileSync('sql/08-pending-invite-privacy-2026-10.sql', 'utf8');
assert.ok(inviteSql.includes("m.status = 'accepted'"), 'El acceso completo debe exigir aceptación');
assert.ok(inviteSql.includes("m.status = 'pending'"), 'Las invitaciones pendientes deben seguir consultables');
assert.ok(inviteSql.includes('select m.account_id, a.title'), 'La invitación solo debe devolver ID y título');
assert.ok(source.includes(".filter((item) => item.status === 'accepted')"), 'Solo cargar JSON de cuentas aceptadas');
assert.ok(source.includes(".rpc('list_my_pending_shared_invites')"), 'El título debe venir de una RPC limitada');
console.log('Validaciones de asistente v13.23.0: OK (cálculo, conciliación y seguridad de invitaciones).');
