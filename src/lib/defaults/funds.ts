import { FUND_LABELS, type FundKey } from "@/types/finance";

export const FUND_KEYS = Object.keys(FUND_LABELS) as FundKey[];

export const fundDescriptions: Record<FundKey, string> = {
  baby_delivery: "Hospital and delivery cost protection",
  baby_starter: "Diaper, baby medicine, doctor, clothes, milk",
  emergency: "Urgent family and medical reserve",
  fuel: "Monthly bike fuel money, target 900 BDT",
  engine_oil: "Engine oil reserve, target 400 BDT per month",
  parking: "Monthly parking reserve, target 500 BDT",
  bike_maintenance: "Tyre, brake, chain, suspension, servicing",
  household_maintenance: "Water filter, small repairs, and predictable home maintenance",
  credit_card_payment: "Protected money for next credit card payment",
};
