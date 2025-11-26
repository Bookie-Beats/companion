import {
  SettingsManager,
  detectCurrentSite,
  notifyContentScripts,
} from "../lib/settings.js";

const toggle = document.getElementById("toggle-anno") as HTMLInputElement;
const displayMode = document.getElementById(
  "display-mode"
) as HTMLSelectElement;
const hideCharts = document.getElementById("hide-charts") as HTMLInputElement;
const feeModeSelect = document.getElementById(
  "fee-mode-select"
) as HTMLSelectElement;
const kalshiOptions = document.getElementById(
  "kalshi-options"
) as HTMLDivElement;
const siteInfo = document.getElementById("site-info") as HTMLDivElement;

let settingsManager: SettingsManager;

// Update UI based on detected site
async function updateUIForSite(): Promise<void> {
  const site = await detectCurrentSite();

  if (site === "kalshi") {
    kalshiOptions.style.display = "block";
    siteInfo.textContent = "Kalshi detected - showing site-specific options";
  } else {
    kalshiOptions.style.display = "none";
    siteInfo.textContent = "No supported site detected";
  }
}

// Setup event listeners
function setupEventListeners(): void {
  toggle.addEventListener("change", async () => {
    await settingsManager.saveSetting("extensionEnabled", toggle.checked);
  });

  displayMode.addEventListener("change", async () => {
    await settingsManager.saveSetting("oddsDisplayMode", displayMode.value);
    await notifyContentScripts({
      type: "displayModeChanged",
      mode: displayMode.value,
    });
  });

  hideCharts.addEventListener("change", async () => {
    await settingsManager.saveSetting("hideCharts", hideCharts.checked);
    await notifyContentScripts({
      type: "hideChartsChanged",
      hide: hideCharts.checked,
    });
  });

  feeModeSelect.addEventListener("change", async () => {
    await settingsManager.saveSetting("feeDisplayMode", feeModeSelect.value);
    await notifyContentScripts({
      type: "feeSettingsChanged",
      mode: feeModeSelect.value,
    });
  });
}

// Initialize popup
async function initialize(): Promise<void> {
  // Initialize settings manager with current site
  settingsManager = new SettingsManager();
  await settingsManager.init();

  // Update UI based on current site
  await updateUIForSite();

  // Load and apply settings
  const settings = await settingsManager.loadSettings();
  const site = settingsManager.getCurrentSite();

  const enabledKey = site
    ? `${site}.extensionEnabled`
    : "global.extensionEnabled";
  const modeKey = site ? `${site}.oddsDisplayMode` : "global.oddsDisplayMode";
  const chartsKey = site ? `${site}.hideCharts` : "global.hideCharts";

  toggle.checked = settings[enabledKey] !== false;
  displayMode.value = settings[modeKey] || "american";
  hideCharts.checked = settings[chartsKey] !== false;

  // Fee settings
  const feeKey = site ? `${site}.feeDisplayMode` : "global.feeDisplayMode";
  const currentMode = settings[feeKey] || "taker";

  // Set dropdown value, default to taker if custom mode
  if (currentMode === "custom") {
    feeModeSelect.value = "taker"; // Default to taker for custom mode
    feeModeSelect.disabled = true; // Disable dropdown when custom mode active
  } else {
    feeModeSelect.value = currentMode;
    feeModeSelect.disabled = false;
  }

  // Setup event listeners
  setupEventListeners();
}

// Start initialization
initialize().catch(console.error);
