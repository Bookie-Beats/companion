import type { FeeDisplayMode } from "../../../lib/settings.js";

export type DisplayMode = "american" | "price" | "both";

let extensionEnabled = true;
let currentDisplayMode: DisplayMode = "both";
let chartsHidden = true;
let feeDisplayMode: FeeDisplayMode = "taker";
let customFeeRate: number = 0.07;

export async function loadSettings(): Promise<void> {
  try {
    const browserModule = await import("../../../lib/browser.js");
    const browser = browserModule.default;

    const result = await browser.storage.local.get([
      "kalshi.extensionEnabled",
      "kalshi.oddsDisplayMode",
      "kalshi.hideCharts",
      "kalshi.feeDisplayMode",
      "kalshi.customFeeRate",
    ]);
    extensionEnabled = result["kalshi.extensionEnabled"] !== false;
    currentDisplayMode = result["kalshi.oddsDisplayMode"] || "american";
    chartsHidden = result["kalshi.hideCharts"] !== false;
    feeDisplayMode = result["kalshi.feeDisplayMode"] || "taker";
    customFeeRate = result["kalshi.customFeeRate"] ?? 0.07;
  } catch (error) {
    console.warn("[BBC] Could not load settings:", error);
    extensionEnabled = true;
    currentDisplayMode = "american";
    chartsHidden = true;
    feeDisplayMode = "taker";
    customFeeRate = 0.07;
  }
}

export function getExtensionEnabled(): boolean {
  return extensionEnabled;
}

export function getCurrentDisplayMode(): DisplayMode {
  return currentDisplayMode;
}

export function getChartsHidden(): boolean {
  return chartsHidden;
}

export function setDisplayMode(mode: DisplayMode): void {
  currentDisplayMode = mode;
}

export function setChartsHidden(hidden: boolean): void {
  chartsHidden = hidden;
}

export function getFeeDisplayMode(): FeeDisplayMode {
  return feeDisplayMode;
}

export function getEffectiveFeeRate(): number {
  switch (feeDisplayMode) {
    case "taker":
      return 0.07; // Standard 7% settlement fee display
    case "raw":
      return 0.0; // No fee cushion (raw market probability)
    case "custom":
      return Math.max(0, Math.min(0.1, customFeeRate)); // Clamped custom rate
  }
}

export function setFeeDisplayMode(mode: FeeDisplayMode): void {
  feeDisplayMode = mode;
}

export function setCustomFeeRate(rate: number): void {
  customFeeRate = Math.max(0, Math.min(0.1, rate));
}
