import { d as detectCurrentSite, n as notifyContentScripts, S as SettingsManager } from "./settings.js";
import "./browser.js";
const toggle = document.getElementById("toggle-anno");
const displayMode = document.getElementById(
  "display-mode"
);
const hideCharts = document.getElementById("hide-charts");
const feeModeSelect = document.getElementById(
  "fee-mode-select"
);
const kalshiOptions = document.getElementById(
  "kalshi-options"
);
const siteInfo = document.getElementById("site-info");
let settingsManager;
async function updateUIForSite() {
  const site = await detectCurrentSite();
  if (site === "kalshi") {
    kalshiOptions.style.display = "block";
    siteInfo.textContent = "Kalshi detected - showing site-specific options";
  } else {
    kalshiOptions.style.display = "none";
    siteInfo.textContent = "No supported site detected";
  }
}
function setupEventListeners() {
  toggle.addEventListener("change", async () => {
    await settingsManager.saveSetting("extensionEnabled", toggle.checked);
  });
  displayMode.addEventListener("change", async () => {
    await settingsManager.saveSetting("oddsDisplayMode", displayMode.value);
    await notifyContentScripts({
      type: "displayModeChanged",
      mode: displayMode.value
    });
  });
  hideCharts.addEventListener("change", async () => {
    await settingsManager.saveSetting("hideCharts", hideCharts.checked);
    await notifyContentScripts({
      type: "hideChartsChanged",
      hide: hideCharts.checked
    });
  });
  feeModeSelect.addEventListener("change", async () => {
    await settingsManager.saveSetting("feeDisplayMode", feeModeSelect.value);
    await notifyContentScripts({
      type: "feeSettingsChanged",
      mode: feeModeSelect.value
    });
  });
}
async function initialize() {
  settingsManager = new SettingsManager();
  await settingsManager.init();
  await updateUIForSite();
  const settings = await settingsManager.loadSettings();
  const site = settingsManager.getCurrentSite();
  const enabledKey = site ? `${site}.extensionEnabled` : "global.extensionEnabled";
  const modeKey = site ? `${site}.oddsDisplayMode` : "global.oddsDisplayMode";
  const chartsKey = site ? `${site}.hideCharts` : "global.hideCharts";
  toggle.checked = settings[enabledKey] !== false;
  displayMode.value = settings[modeKey] || "american";
  hideCharts.checked = settings[chartsKey] !== false;
  const feeKey = site ? `${site}.feeDisplayMode` : "global.feeDisplayMode";
  const currentMode = settings[feeKey] || "taker";
  if (currentMode === "custom") {
    feeModeSelect.value = "taker";
    feeModeSelect.disabled = true;
  } else {
    feeModeSelect.value = currentMode;
    feeModeSelect.disabled = false;
  }
  setupEventListeners();
}
initialize().catch(console.error);
//# sourceMappingURL=popup.js.map
