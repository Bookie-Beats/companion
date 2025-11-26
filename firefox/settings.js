import { b as browser } from "./browser.js";
const DEFAULT_SETTINGS = {
  "global.extensionEnabled": true,
  "kalshi.extensionEnabled": true,
  "kalshi.oddsDisplayMode": "american",
  "kalshi.hideCharts": true,
  "kalshi.feeDisplayMode": "taker",
  "kalshi.customFeeRate": 0.07,
  "debug.enabled": false
};
const SITE_SETTINGS = {
  global: ["global.extensionEnabled", "debug.enabled"],
  kalshi: [
    "kalshi.extensionEnabled",
    "kalshi.oddsDisplayMode",
    "kalshi.hideCharts",
    "kalshi.feeDisplayMode",
    "kalshi.customFeeRate"
  ]
};
const SUPPORTED_SITES = {
  kalshi: /(^|\.)kalshi\.com$/i
};
async function detectCurrentSite() {
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true
    });
    const currentTab = tabs[0];
    if (currentTab?.url) {
      const url = new URL(currentTab.url);
      for (const [siteName, pattern] of Object.entries(SUPPORTED_SITES)) {
        if (pattern.test(url.hostname)) {
          return siteName;
        }
      }
    }
  } catch (error) {
    console.warn("Could not detect current site:", error);
  }
  return null;
}
async function loadSiteSettings(site = null) {
  try {
    const keys = site ? SITE_SETTINGS[site] : Object.values(SITE_SETTINGS).flat();
    const settings = await browser.storage.local.get(keys);
    for (const key of keys) {
      if (settings[key] === void 0 && key in DEFAULT_SETTINGS) {
        settings[key] = DEFAULT_SETTINGS[key];
      }
    }
    return settings;
  } catch (error) {
    console.error("Failed to load settings:", error);
    return {};
  }
}
async function loadAllSettings() {
  try {
    const allKeys = Object.values(SITE_SETTINGS).flat();
    const settings = await browser.storage.local.get(allKeys);
    for (const [key, defaultValue] of Object.entries(DEFAULT_SETTINGS)) {
      if (settings[key] === void 0) {
        settings[key] = defaultValue;
      }
    }
    return settings;
  } catch (error) {
    console.error("Failed to load all settings:", error);
    return DEFAULT_SETTINGS;
  }
}
async function saveSetting(key, value) {
  try {
    await browser.storage.local.set({ [key]: value });
    const settings = await browser.storage.local.get(["debug.enabled"]);
    if (settings["debug.enabled"]) {
      console.log(`Saved setting: ${key} = ${value}`);
    }
  } catch (error) {
    console.error(`Failed to save setting ${key}:`, error);
    throw error;
  }
}
async function resetAllSettings() {
  try {
    await browser.storage.local.clear();
    await browser.storage.local.set(DEFAULT_SETTINGS);
    const debugSettings = await browser.storage.local.get(["debug.enabled"]);
    if (debugSettings["debug.enabled"]) {
      console.log("Reset all settings to defaults");
    }
  } catch (error) {
    console.error("Failed to reset settings:", error);
    throw error;
  }
}
function getSettingKey(site, settingType) {
  return site ? `${site}.${settingType}` : `global.${settingType}`;
}
async function notifyContentScripts(message) {
  try {
    const tabs = await browser.tabs.query({});
    for (const tab of tabs) {
      if (tab.id && tab.url) {
        const url = new URL(tab.url);
        for (const [siteName, pattern] of Object.entries(SUPPORTED_SITES)) {
          if (pattern.test(url.hostname)) {
            try {
              await browser.tabs.sendMessage(tab.id, message);
              break;
            } catch (error) {
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed to notify content scripts:", error);
  }
}
class SettingsManager {
  constructor(site = null) {
    this.site = null;
    this.site = site;
  }
  async init() {
    if (this.site === null) {
      this.site = await detectCurrentSite();
    }
  }
  getCurrentSite() {
    return this.site;
  }
  async loadSettings() {
    return this.site ? loadSiteSettings(this.site) : loadAllSettings();
  }
  async saveSetting(settingType, value) {
    const key = getSettingKey(this.site, settingType);
    await saveSetting(key, value);
  }
  async notifyChange(message) {
    await notifyContentScripts(message);
  }
}
export {
  SettingsManager as S,
  detectCurrentSite as d,
  loadAllSettings as l,
  notifyContentScripts as n,
  resetAllSettings as r,
  saveSetting as s
};
//# sourceMappingURL=settings.js.map
