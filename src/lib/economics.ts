import { clamp, round2 } from "./format";
import type { Product, RiskKey, SimParams, Supplier } from "./types";

export const DEFAULT_PARAMS: SimParams = {
  referralRate: 0.15,
  returnRate: 0.08,
  refundLossRate: 0.55,
  returnHandling: 1.5,
  adRate: 0.12,
  opsPerUnit: 0.7,
  capitalAnnual: 0.08,
  opportunityRate: 0.02,
  coverDays: 45,
  riskWeights: {
    quality: 0.25,
    delivery: 0.2,
    compliance: 0.25,
    capital: 0.15,
    logistics: 0.15,
  },
};

export type UnitEconomics = {
  listPrice: number;
  netRevenue: number;
  referral: number;
  procurement: number;
  ads: number;
  labor: number;
  operating: number;
  fba: number;
  inbound: number;
  logistics: number;
  returns: number;
  capital: number;
  opportunity: number;
  trueProfit: number;
  trueMargin: number;
  grossUnit: number;
  grossMargin: number;
};

/** True profit follows course 2.2: net revenue already excludes referral fees. */
export function unitEconomics(product: Product, params: SimParams, unitCost = product.unitCost): UnitEconomics {
  const listPrice = product.price;
  const referral = listPrice * params.referralRate;
  const netRevenue = listPrice - referral;
  const procurement = unitCost;
  const ads = listPrice * params.adRate;
  const labor = params.opsPerUnit;
  const operating = ads + labor;
  const fba = product.fbaFee;
  const inbound = product.inbound;
  const logistics = fba + inbound;
  const returns = params.returnRate * (netRevenue * params.refundLossRate + params.returnHandling);
  const days = product.leadDays + params.coverDays;
  const capital = procurement * (days / 365) * params.capitalAnnual;
  const opportunity = procurement * params.opportunityRate;
  const trueProfit = netRevenue - procurement - operating - logistics - returns - capital - opportunity;
  const grossUnit = listPrice - procurement - referral - fba;
  return {
    listPrice,
    netRevenue: round2(netRevenue),
    referral: round2(referral),
    procurement: round2(procurement),
    ads: round2(ads),
    labor: round2(labor),
    operating: round2(operating),
    fba: round2(fba),
    inbound: round2(inbound),
    logistics: round2(logistics),
    returns: round2(returns),
    capital: round2(capital),
    opportunity: round2(opportunity),
    trueProfit: round2(trueProfit),
    trueMargin: listPrice === 0 ? 0 : trueProfit / listPrice,
    grossUnit: round2(grossUnit),
    grossMargin: listPrice === 0 ? 0 : grossUnit / listPrice,
  };
}

export function compositeRisk(supplier: Supplier, weights: Record<RiskKey, number>) {
  const keys: RiskKey[] = ["quality", "delivery", "compliance", "capital", "logistics"];
  const sum = keys.reduce((total, key) => total + weights[key], 0) || 1;
  const score = keys.reduce((total, key) => total + supplier.risks[key] * weights[key], 0) / sum;
  return Math.round(score);
}

export function riskTone(score: number): "low" | "mid" | "high" {
  if (score < 35) return "low";
  if (score < 60) return "mid";
  return "high";
}

export function clampParams(input: SimParams): SimParams {
  const w = input.riskWeights;
  return {
    referralRate: clamp(input.referralRate, 0, 0.45),
    returnRate: clamp(input.returnRate, 0, 0.4),
    refundLossRate: clamp(input.refundLossRate, 0, 1),
    returnHandling: clamp(input.returnHandling, 0, 20),
    adRate: clamp(input.adRate, 0, 0.6),
    opsPerUnit: clamp(input.opsPerUnit, 0, 20),
    capitalAnnual: clamp(input.capitalAnnual, 0, 0.4),
    opportunityRate: clamp(input.opportunityRate, 0, 0.3),
    coverDays: clamp(Math.round(input.coverDays), 7, 180),
    riskWeights: {
      quality: clamp(w.quality, 0, 1),
      delivery: clamp(w.delivery, 0, 1),
      compliance: clamp(w.compliance, 0, 1),
      capital: clamp(w.capital, 0, 1),
      logistics: clamp(w.logistics, 0, 1),
    },
  };
}
