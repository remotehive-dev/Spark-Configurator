import { computeLPPCounts, computeInternalBase, computePricing } from "../client/src/lib/pricingRules";

function assert(name: string, cond: boolean) {
  if (!cond) {
    console.error(`FAIL: ${name}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${name}`);
  }
}

const { learn, practice, perform, total } = computeLPPCounts(2);
assert("counts-total", total === 120);
assert("counts-learn", learn === 24);
assert("counts-practice", practice === 48);
assert("counts-perform", perform === 48);

const base = computeInternalBase(learn);
assert("internal-base", base === 24 * 1500);

const p1 = computePricing({ tenureCount: 4, sapEnabled: true, couponApplied: true });
// learn = 48, base=72000, sap 15%=10800, subtotal=61200, coupon 20%=12240, final=48960
assert("pricing-final", p1.final === 48960);

console.log("Summary:", p1);
