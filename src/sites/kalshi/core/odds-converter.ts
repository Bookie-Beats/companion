import { EDGE_CASE_ODDS } from "../config/constants.js";
import { getEffectiveFeeRate } from "./settings.js";

export function convertToOdds(
  value: number,
  includeFees: boolean = true
): string {
  let probability = value / 100;

  if (includeFees) {
    const feeRate = getEffectiveFeeRate();
    const feePerContract = feeRate * probability * (1 - probability);
    probability = probability + feePerContract;
  }

  if (probability <= 0 || probability >= 1) {
    return EDGE_CASE_ODDS;
  } else if (probability >= 0.5) {
    const odds = Math.round((probability / (1 - probability)) * 100);
    return `-${odds}`;
  } else {
    const odds = Math.round(((1 - probability) / probability) * 100);
    return `+${odds}`;
  }
}
