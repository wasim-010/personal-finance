# Personal Expense Manager - Bangladesh Family Budget

Mobile-first personal finance app for Wasim in Dhaka, Bangladesh. The app is designed around salary-cycle budgeting, protected family funds, baby delivery preparation, bike costs, and credit-card debt control.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` or `http://127.0.0.1:3000`.

Verification:

```bash
npm run lint
npm run build
```

## Personalized Model

- Currency is BDT and displays with South Asian grouping, for example `৳1,20,000`.
- Budget cycle is salary-date based, not calendar-month based. Default salary date is day 7, so the cycle runs from the 7th to the 6th.
- Spendable balance is the main number: total location money minus protected fund money.
- Physical locations are Bank, Wallet / Cash in Hand, Cash Envelope, bKash, and Nagad.
- Protected funds are Baby Delivery, Baby Starter, Emergency, Fuel, Engine Oil, Bike Maintenance, and Credit Card Payment.
- Budget modes are Normal Month, Qurbani Beef Period, Saidpur Separation, and After Baby Birth.

## Key Pages

- Dashboard: cycle summary, total physical money, protected fund balance, spendable balance, Unknown Adjustment, Saidpur Support, location balances, fund progress, debt, warnings, category chart, and need/want/waste chart.
- Add Entry: one universal form that changes fields by entry type.
- Transactions: searchable and filterable transaction list with delete confirmation.
- Budget: current-mode budget targets compared with cycle spending.
- Funds: protected money bucket progress.
- Cash Flow: salary-cycle allocation plan.
- Baby Fund: baby delivery and baby starter progress.
- Debt: credit-card payoff tracking.
- Bike Tracker: ODO, fuel fill-ups, engine oil changes, parking, maintenance parts, future reserve, and oil reminders.
- Settings: salary date, budget mode, bike fuel/oil/parts settings, water filter settings, income targets, fund targets, debt, import/export.

## Entry Types

- Opening Balance: starting money in a physical location.
- Income: money entering Bank, Wallet / Cash in Hand, Cash Envelope, bKash, or Nagad.
- Expense: money leaving a location with category and need/want/waste classification.
- Fund Deposit: marks existing money as protected. It does not move physical money.
- Fund Withdrawal: releases protected money back to spendable.
- Fund Transfer: moves protected money between fund buckets.
- Debt Payment: pays credit-card debt from a location and reduces the credit-card payment fund.
- Bike Entry: records ODO updates, fuel fill-ups, engine oil changes, parking, maintenance/parts, and bike KM cost.
- Household Maintenance Entry: records water filter replacement, home repair, and other household maintenance.
- Bike KM: legacy quick bike cost entry.
- Transfer: moves money between physical locations.

## Calculations

Location balance changes only when physical money moves:

```text
opening_balance, income: +amount to location
expense, bike_km, bike_entry, household_maintenance, debt_payment: -amount from location
transfer: -amount from one location, +amount to another
fund operations: no physical location change
```

Protected balance changes only through fund operations:

```text
fund_deposit: +amount to fund
fund_withdrawal: -amount from fund
fund_transfer: -amount from source fund, +amount to destination fund
debt_payment: -amount from credit_card_payment fund
```

Spendable money:

```text
spendable = sum(locationBalances) - sum(fundBalances)
```

The app blocks new entries that would make spendable balance negative.

## Real Budget Categories

The budget uses Wasim's actual family categories, not generic buckets:

- House Rent + Water, Gas, Electricity, Internet, Mobile Recharge
- Regular Groceries, Beef, Chicken, Fish, Milk
- Wife Medical, Maid, Charity, Personal Expense, Eating Out
- Fuel Fund, Parking, Engine Oil Fund, Bike Maintenance Fund
- Baby Delivery Fund, Baby Starter Fund, Emergency Fund, Credit Card Payment
- Saidpur Support, Unknown Adjustment
- After-baby categories: Diaper, Baby Medicine, Baby Doctor, Baby Milk, Baby Clothes, Mother Nutrition, Baby Monthly Care Fund

Unknown Adjustment is shown on the dashboard. If it exceeds `৳500` in the current cycle, the app warns: “Too much money is untracked. Record expenses immediately.”

## Cash Flow Calendar

The Cash Flow page uses exact real allocation numbers:

- Salary `৳44,000`, 7-10: rent/water, utilities, internet, maid, charity, first baby transfer, first credit-card payment, food first half, bike fuel/parking, personal/eating out, and buffer.
- Mother-in-law support `৳10,000`, 20-25: remaining baby delivery fund, wife medical, emergency fund, and food second half.
- Rental income `৳5,000`, 25-27: extra credit-card payment, engine oil fund, bike maintenance fund, baby starter fund, and month-end cushion.

## Bike Cost

Bike tracking is ODO based. The user enters the current ODO, the app auto-detects the previous ODO from the latest bike entry, and KM run is calculated from the difference.

Bike entry subtypes:

- ODO Update
- Fuel Fill-Up
- Engine Oil Change
- Parking
- Maintenance / Parts
- Bike KM Cost

Fuel defaults:

- Fuel price: `৳140` per liter
- Mileage: `50 km/liter`
- Fuel cost per KM: `৳2.80`
- Full tank: `10 liters`, `৳1,400`, about `500 km`

Engine oil defaults:

- Engine oil price: `৳1,400`
- Oil interval: `3,000 km`
- Oil cost per KM: about `৳0.47`
- Engine Oil Fund target: `৳400/month`

Maintenance reserve:

- True bike cost: `৳6/km`
- Pure maintenance reserve = true cost - fuel cost - oil cost
- For 300 km/month, maintenance reserve is around `৳819`
- Bike Maintenance Fund target: minimum `৳500`, ideal `৳900`

Historical bike entries are not recalculated when settings change.

## Bike Parts And Reminders

Settings include an editable parts price list:

- Tire
- Brake pad/shoe
- Chain set
- Suspension service
- Air filter
- Spark plug
- Battery
- Clutch cable
- Brake cable
- General servicing
- Other parts

Each part can store estimated price, replacement interval, last replaced date/ODO, and reminder status.

## Water Filter And Household Maintenance

Water Filter is household maintenance, not bike maintenance.

Defaults:

- Water filter price: `৳1,200`
- Replacement interval: 6 months
- Monthly reserve: `৳200`

The app includes Household Maintenance Fund for water filter, small home repairs, appliance repairs, and predictable home maintenance.

## Data Safety

Data is stored in browser LocalStorage under `bd-family-budget-v1`.

The storage layer is migration-safe:

- Existing records are backed up before migration.
- Old label-based transaction types are migrated to snake_case types.
- Missing IDs and timestamps are added.
- Existing user settings are preserved; only missing keys receive defaults.
- Import validates and migrates in memory before replacing current data.

Use Settings -> Export JSON before clearing browser data or changing browsers.

## Future Improvements

- Google Sheets sync
- Supabase login/database
- Receipt image scanning
- Voice expense entry
- AI spending coach
- Monthly PDF report
- Family shared access
- SMS/bKash transaction parsing
