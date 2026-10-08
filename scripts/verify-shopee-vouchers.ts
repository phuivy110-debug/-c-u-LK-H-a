import assert from 'node:assert/strict';
import { formatVnd, getActiveShopeeVouchers, SHOPEE_VOUCHERS } from '../src/data/shopeeVouchers';

const codesAt = (iso: string) => getActiveShopeeVouchers(new Date(iso)).map((voucher) => voucher.code).sort();
const monthly = ['AFF10OC', 'AFFKOO', 'AFFOCTT', 'AFFVISA'];
const tenTen = ['AFFOGIO', 'AFFOMUA', 'AFFYQM'];

assert.equal(new Set(SHOPEE_VOUCHERS.map((voucher) => voucher.code)).size, SHOPEE_VOUCHERS.length, 'duplicate voucher code');
for (const voucher of SHOPEE_VOUCHERS) {
  assert.ok(Date.parse(voucher.startsAt) < Date.parse(voucher.endsAt), `${voucher.code} has invalid range`);
  assert.ok(voucher.discount > 0 && voucher.minSpend > voucher.discount, `${voucher.code} has invalid amounts`);
}

assert.deepEqual(codesAt('2026-10-01T00:00:00+07:00'), ['AFF10OC', 'AFFATVN', 'AFFKOO', 'AFFNXNX', 'AFFOCTT', 'AFFVISA']);
assert.deepEqual(codesAt('2026-10-02T23:59:59+07:00'), ['AFF10OC', 'AFFATVN', 'AFFKOO', 'AFFNXNX', 'AFFOCTT', 'AFFVISA']);
assert.deepEqual(codesAt('2026-10-08T12:00:00+07:00'), monthly);
assert.deepEqual(codesAt('2026-10-09T23:59:59+07:00'), monthly);
assert.deepEqual(codesAt('2026-10-10T00:00:00+07:00'), [...monthly, ...tenTen].sort());
assert.deepEqual(codesAt('2026-10-09T17:00:00Z'), [...monthly, ...tenTen].sort(), 'midnight 10.10 in UTC+7');
assert.deepEqual(codesAt('2026-10-11T00:00:00+07:00'), monthly);
assert.deepEqual(codesAt('2026-10-31T23:59:59+07:00'), monthly);
assert.deepEqual(codesAt('2026-11-01T00:00:00+07:00'), []);
assert.deepEqual(codesAt('2026-09-30T23:59:59+07:00'), []);

assert.equal(formatVnd(100000), '100K');
assert.equal(formatVnd(49000), '49K');

console.log(`Shopee voucher checks passed (${SHOPEE_VOUCHERS.length} vouchers).`);
