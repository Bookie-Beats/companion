import { onUrlChange } from "../../lib/utils.js";
import { DEBOUNCE_DELAY, MUTATION_OBSERVER_DELAY } from "./config/constants.js";
import {
  loadSettings,
  getExtensionEnabled,
  getChartsHidden,
} from "./core/settings.js";
import { setupMessageListener } from "./core/messaging.js";
import { convertAllPrices } from "./features/price-display.js";
import {
  processSpreadDisplay,
  processIndividualSpreadDisplay,
  clearProcessedSpreads,
} from "./features/spread-display.js";
import { hideChartsAndOptimizeLayout } from "./features/chart-hiding.js";
import { clearAllAnnotations } from "./utils/dom-utils.js";
import { clearTeamNameCache } from "./utils/team-detection.js";

let conversionTimeout: number | undefined;

export function debouncedConvert(): void {
  if (conversionTimeout) {
    clearTimeout(conversionTimeout);
  }
  conversionTimeout = window.setTimeout(refreshAnnotations, DEBOUNCE_DELAY);
}

function convertAllCents(): void {
  if (!getExtensionEnabled()) return;

  convertAllPrices();
  processSpreadDisplay();
  processIndividualSpreadDisplay();
}

function refreshAnnotations(): void {
  clearAllAnnotations();
  clearProcessedSpreads();
  if (getExtensionEnabled()) {
    convertAllCents();
  }
}

function setupMutationObserver(): void {
  const observer = new MutationObserver(() => {
    clearTimeout((window as any).kalshiConvertTimeout);
    (window as any).kalshiConvertTimeout = setTimeout(() => {
      refreshAnnotations();
      if (getChartsHidden()) {
        hideChartsAndOptimizeLayout();
      }
    }, MUTATION_OBSERVER_DELAY);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

function boot(): void {
  loadSettings().then(() => {
    // Apply fee settings on initial load
    convertAllPrices();

    if (getChartsHidden()) {
      hideChartsAndOptimizeLayout();
    }

    convertAllCents();
    refreshAnnotations();
    setupMessageListener(debouncedConvert);

    onUrlChange(() => {
      clearTeamNameCache();
      debouncedConvert();
      if (getChartsHidden()) {
        hideChartsAndOptimizeLayout();
      }
    });

    setupMutationObserver();
  });
}

try {
  if (/(^|\.)kalshi\.com$/i.test(location.hostname)) {
    boot();
  }
} catch (error) {
  console.error("[BBC] Content script initialization error:", error);
}
