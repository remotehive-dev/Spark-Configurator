# Pricing and Tenure Rules

## LPP Model (per 1× unit)
- Learn: 12 classes
- Practice: 24 classes
- Performance: 24 classes
- Total per unit: 60 classes

## Tenure Selection
- Tenure slider represents `X` units (1× = one LPP unit)
- Slider moves in `2×` increments only (2×, 4×, 6×, ...)
- Class frequency options: `3` or `5` classes/week (UI only)

## Pricing Calculation
- Internal base = `LearnClasses × 1500`
- SAP Discount (15%) applies to internal base when enabled
- Coupon discount = `20%` of subtotal after SAP Discount
- Final Price = `internalBase - SAPDiscount - Coupon`

## Fee Display (User-facing)
- Base Fee shown = `3500 × tenureCount`
- Teacher Discount Code replaces Counsellor Discount Code
- Tenure Discount label replaced with SAP Discount (15%)

## Validation
- Tenure slider clamps to even values within `[2, 24]`
- Real-time updates across calculator and proposal receipt

## Tests (recommendation)
- Unit tests should cover:
  - Tenure → class counts mapping (Learn/Practice/Perform)
  - Internal base and discounts composition
  - Coupon application order
  - Display base fee (3500 × tenure)

