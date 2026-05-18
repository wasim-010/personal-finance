# Personal Expense Manager - Agent Instructions

Maintain **Personal Expense Manager - Bangladesh Family Budget Web App** for Wasim in Dhaka.

This is not a generic expense tracker. It is a personal salary-cycle finance control center for baby delivery saving, credit-card debt control, bike costs, cash envelopes, and protected family funds.

## Non-Negotiable Rules

- Never rebuild from scratch when existing code/data exists.
- Never reset or overwrite LocalStorage without explicit user confirmation.
- Read existing files before editing.
- Stored data changes require migration logic in `src/lib/storage.ts`.
- Keep transactions as the source of truth. Cached balances must be recomputed from transactions.
- Keep UI mobile-first and simple enough to add an entry in under 20 seconds.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Recharts
- LocalStorage persistence only
- No backend or authentication in Version 1

## Current Architecture

- Types: `src/types/finance.ts`
- Storage and migration: `src/lib/storage.ts`
- State reducer/context: `src/lib/state/`
- Calculations: `src/lib/calculations/`
- Defaults: `src/lib/defaults/`
- Universal entry form: `src/components/forms/AddEntryForm.tsx`
- Entry sub-forms: `src/components/forms/entry-types/`
- Currency UI: `src/components/ui/BDTAmount.tsx`

## Financial Model

Physical money locations:

- `bank`
- `wallet`
- `cash_envelope`
- `bkash`
- `nagad`

Protected fund buckets:

- `baby_delivery`
- `baby_starter`
- `emergency`
- `fuel`
- `engine_oil`
- `parking`
- `bike_maintenance`
- `household_maintenance`
- `credit_card_payment`

Spendable money is:

```text
sum(locationBalances) - sum(fundBalances)
```

Fund operations do not move physical money. They only protect or release money already present in a location.

Real budget categories must stay personalized: House Rent + Water, Gas, Electricity, Internet, Mobile Recharge, Regular Groceries, Beef, Chicken, Fish, Milk, Wife Medical, Maid, Charity, Personal Expense, Eating Out, Fuel Fund, Parking, Engine Oil Fund, Bike Maintenance Fund, Baby Delivery Fund, Baby Starter Fund, Emergency Fund, Credit Card Payment, Saidpur Support, Unknown Adjustment, and the after-baby categories.

Dashboard must show total physical money, protected fund balance, spendable balance, Saidpur Support, and Unknown Adjustment. If Unknown Adjustment exceeds 500 BDT in the current cycle, show: “Too much money is untracked. Record expenses immediately.”

Bike tracking is ODO based. Preserve legacy `bike_km`, but prefer `bike_entry` with subtypes: ODO Update, Fuel Fill-Up, Engine Oil Change, Parking, Maintenance / Parts, and Bike KM Cost. Fuel, oil, parking, and maintenance costs must stay separated. Water Filter belongs to household maintenance, not bike maintenance.

## Transaction Types

Use snake_case transaction types:

- `opening_balance`
- `income`
- `expense`
- `fund_deposit`
- `fund_transfer`
- `fund_withdrawal`
- `debt_payment`
- `bike_km`
- `transfer`

Old label strings must be migrated safely, not dropped.

## Budget Modes

- `normal`
- `qurbani`
- `saidpur`
- `after_baby`

Switching mode changes targets, warnings, and recommendations only. It must not rewrite historical transactions.

## UX Tone

Clean, calm, practical, and personal. Use simple English with short Bangla helpers where useful:

- “আগে future money আলাদা, তারপর spending.”
- “Baby fund touch করবেন না.”
- “আজকের খরচ লিখেছেন?”
- “Salary money is not available money.”
- “Qurbani beef saving free money না.”
- “Saidpur mode active — baby fund first.”
- “Past data unknown. From today, every taka has a record.”

## Future Ideas Only

Mention but do not build unless explicitly requested:

- Google Sheets sync
- Supabase login/database
- Receipt image scanning
- Voice expense entry
- AI spending coach
- Monthly PDF report
- Family shared access
- SMS/bKash transaction parsing
