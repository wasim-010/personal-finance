# Wasim Personal Finance System

This document is the product source of truth for the app.

## Core Rule

Protected money is not spendable money.

```text
Spendable = Total physical money - Protected fund balance
```

## Money Locations

- Bank
- Wallet / Cash in Hand
- Cash Envelope
- bKash
- Nagad

Wallet and Cash Envelope are separate. Wallet is daily loose cash. Cash Envelope is planned cash.

## Funds

- Baby Delivery Fund
- Baby Starter Fund
- Emergency Fund
- Fuel Fund
- Engine Oil Fund
- Parking Fund
- Bike Maintenance Fund
- Household Maintenance Fund
- Credit Card Payment Fund

## Bike System

Bike tracking should use ODO readings, not only fixed KM cost.

Bike entry subtypes:

- ODO Update
- Fuel Fill-Up
- Engine Oil Change
- Parking
- Maintenance / Parts
- Bike KM Cost

Rules:

- Current ODO must be greater than or equal to previous ODO.
- Previous ODO is detected from the latest bike entry.
- KM run = current ODO - previous ODO.
- Old entries keep their historical fuel/oil price.
- Future estimates use current settings.

## Bike Defaults

Fuel:

- Fuel price per liter: 140 BDT
- Full tank: 10 liters
- Full tank cost: 1,400 BDT
- Minimum distance: 500 km
- Mileage: 50 km/liter
- Fuel cost per KM: 2.80 BDT/km

Engine oil:

- Engine oil price: 1,400 BDT
- Oil life: 3,000 km
- Engine oil cost per KM: 0.47 BDT/km
- Engine Oil Fund target: 400 BDT/month

True cost:

- True long-term bike cost: 6 BDT/km
- Pure maintenance reserve per KM = true cost - fuel cost - oil cost
- Bike Maintenance Fund target: 500 minimum, 900 ideal
- Parking Fund target: 500 BDT/month

## Bike Parts

Maintain an editable parts price list:

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

Each part stores estimated price, replacement interval, last replacement date/ODO, and reminder enabled.

## Water Filter

Water filter is household maintenance, not bike maintenance.

Defaults:

- Price: 1,200 BDT
- Replacement interval: 6 months
- Monthly reserve: 200 BDT

Warning:

```text
Water filter replacement coming soon.
```

## Warnings

- No ODO this cycle: “Update current ODO to calculate real bike cost.”
- Oil change within 300 km: “Engine oil change coming soon.”
- Oil fund short: “Engine oil fund is short.”
- Maintenance fund under target: “Bike maintenance fund is underfunded.”
- Water filter within 30 days: “Water filter replacement coming soon.”
- Unknown Adjustment over 500 BDT: “Too much money is untracked. Record expenses immediately.”
