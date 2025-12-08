export function computeLPPCounts(tenureCount: number) {
  const learn = 12 * tenureCount;
  const practice = 24 * tenureCount;
  const perform = 24 * tenureCount;
  const total = learn + practice + perform;
  return { learn, practice, perform, total };
}

export function computeInternalBase(learnClasses: number) {
  return learnClasses * 1500;
}

export function computePricing({ tenureCount, sapEnabled, couponApplied }: { tenureCount: number; sapEnabled: boolean; couponApplied: boolean }) {
  const counts = computeLPPCounts(tenureCount);
  const internalBase = computeInternalBase(counts.learn);
  const sapDiscount = sapEnabled ? internalBase * 0.15 : 0;
  const subtotal = internalBase - sapDiscount;
  const couponDiscount = couponApplied ? subtotal * 0.20 : 0;
  const final = internalBase - sapDiscount - couponDiscount;
  return { counts, internalBase, sapDiscount, couponDiscount, final };
}

