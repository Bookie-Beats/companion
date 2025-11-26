import { l as loadAllSettings, s as saveSetting, n as notifyContentScripts, r as resetAllSettings } from "./settings.js";
import "./browser.js";
const globalEnabled = document.getElementById(
  "global-enabled"
);
const kalshiEnabled = document.getElementById(
  "kalshi-enabled"
);
const kalshiDisplayMode = document.getElementById(
  "kalshi-display-mode"
);
const kalshiHideCharts = document.getElementById(
  "kalshi-hide-charts"
);
const kalshiFeeMode = document.getElementById(
  "kalshi-fee-mode"
);
const kalshiCustomFee = document.getElementById(
  "kalshi-custom-fee"
);
const customFeeGroup = document.getElementById(
  "custom-fee-group"
);
const debugMode = document.getElementById("debug-mode");
const resetButton = document.getElementById(
  "reset-settings"
);
async function loadSettings() {
  try {
    const settings = await loadAllSettings();
    globalEnabled.checked = settings["global.extensionEnabled"] !== false;
    debugMode.checked = settings["debug.enabled"] === true;
    kalshiEnabled.checked = settings["kalshi.extensionEnabled"] !== false;
    kalshiDisplayMode.value = settings["kalshi.oddsDisplayMode"] || "american";
    kalshiHideCharts.checked = settings["kalshi.hideCharts"] !== false;
    kalshiFeeMode.value = settings["kalshi.feeDisplayMode"] || "taker";
    kalshiCustomFee.value = String(settings["kalshi.customFeeRate"] ?? 0.07);
    customFeeGroup.style.display = kalshiFeeMode.value === "custom" ? "block" : "none";
    console.log("Settings loaded:", settings);
  } catch (error) {
    console.error("Failed to load settings:", error);
  }
}
async function handleResetSettings() {
  const confirmed = confirm(
    "Are you sure you want to reset all settings to their defaults? This cannot be undone."
  );
  if (!confirmed) return;
  try {
    await resetAllSettings();
    await loadSettings();
    await notifyContentScripts({ type: "settingsReset" });
    alert("All settings have been reset to defaults.");
  } catch (error) {
    console.error("Failed to reset settings:", error);
    alert("Failed to reset settings. Please try again.");
  }
}
function setupEventListeners() {
  globalEnabled.addEventListener("change", async () => {
    await saveSetting("global.extensionEnabled", globalEnabled.checked);
  });
  debugMode.addEventListener("change", async () => {
    await saveSetting("debug.enabled", debugMode.checked);
  });
  kalshiEnabled.addEventListener("change", async () => {
    await saveSetting("kalshi.extensionEnabled", kalshiEnabled.checked);
  });
  kalshiDisplayMode.addEventListener("change", async () => {
    await saveSetting("kalshi.oddsDisplayMode", kalshiDisplayMode.value);
    await notifyContentScripts({
      type: "displayModeChanged",
      mode: kalshiDisplayMode.value
    });
  });
  kalshiHideCharts.addEventListener("change", async () => {
    await saveSetting("kalshi.hideCharts", kalshiHideCharts.checked);
    await notifyContentScripts({
      type: "hideChartsChanged",
      hide: kalshiHideCharts.checked
    });
  });
  kalshiFeeMode.addEventListener("change", async () => {
    await saveSetting("kalshi.feeDisplayMode", kalshiFeeMode.value);
    customFeeGroup.style.display = kalshiFeeMode.value === "custom" ? "block" : "none";
    await notifyContentScripts({
      type: "feeSettingsChanged",
      mode: kalshiFeeMode.value,
      customRate: parseFloat(kalshiCustomFee.value)
    });
  });
  kalshiCustomFee.addEventListener("change", async () => {
    const rate = Math.max(
      0,
      Math.min(0.1, parseFloat(kalshiCustomFee.value) || 0.07)
    );
    kalshiCustomFee.value = rate.toFixed(2);
    await saveSetting("kalshi.customFeeRate", rate);
    if (kalshiFeeMode.value === "custom") {
      await notifyContentScripts({
        type: "feeSettingsChanged",
        mode: "custom",
        customRate: rate
      });
    }
  });
  resetButton.addEventListener("click", handleResetSettings);
}
async function initialize() {
  console.log("Initializing options page...");
  try {
    await loadSettings();
    setupEventListeners();
    console.log("Options page ready.");
  } catch (error) {
    console.error("Failed to initialize options page:", error);
  }
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
//# sourceMappingURL=options.js.map
