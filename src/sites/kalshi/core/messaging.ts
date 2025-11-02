import {
  setDisplayMode,
  setChartsHidden,
  setFeeDisplayMode,
  setCustomFeeRate,
} from "./settings.js";
import {
  hideChartsAndOptimizeLayout,
  showChartsAndRestoreLayout,
} from "../features/chart-hiding";

export async function setupMessageListener(
  debouncedConvert: () => void
): Promise<void> {
  try {
    const { default: browser } = await import("../../../lib/browser.js");

    browser.runtime.onMessage.addListener((message: any) => {
      if (message.type === "displayModeChanged") {
        setDisplayMode(message.mode);
        debouncedConvert();
      } else if (message.type === "hideChartsChanged") {
        setChartsHidden(message.hide);
        if (message.hide) {
          hideChartsAndOptimizeLayout();
        } else {
          showChartsAndRestoreLayout();
        }
      } else if (message.type === "feeSettingsChanged") {
        setFeeDisplayMode(message.mode);
        if (message.mode === "custom" && message.customRate !== undefined) {
          setCustomFeeRate(message.customRate);
        }
        debouncedConvert(); // Refresh all odds displays
      }
    });
  } catch (error) {
    console.warn("[BBC] Could not set up message listener:", error);
  }
}
