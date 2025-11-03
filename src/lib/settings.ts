import browser from "./browser.js";

// Default settings for all supported sites
export const DEFAULT_SETTINGS = {
  "global.extensionEnabled": true,
  "kalshi.extensionEnabled": true,
  "kalshi.oddsDisplayMode": "american",
  "kalshi.hideCharts": true,
  "kalshi.feeDisplayMode": "taker",
  "kalshi.customFeeRate": 0.07,
  "debug.enabled": false,
} as const;

// Settings keys organized by site
export const SITE_SETTINGS = {
  global: ["global.extensionEnabled", "debug.enabled"],
  kalshi: [
    "kalshi.extensionEnabled",
    "kalshi.oddsDisplayMode",
    "kalshi.hideCharts",
    "kalshi.feeDisplayMode",
    "kalshi.customFeeRate",
  ],
} as const;

// Supported sites for URL detection
export const SUPPORTED_SITES = {
  kalshi: /(^|\.)kalshi\.com$/i,
} as const;

export type SiteName = keyof typeof SUPPORTED_SITES;
export type DisplayMode = "american" | "price" | "both";
export type FeeDisplayMode = "taker" | "maker" | "raw" | "custom";

/**
 * Detect which supported site the current tab is on
 */
export async function detectCurrentSite(): Promise<SiteName | null> {
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const currentTab = tabs[0];

    if (currentTab?.url) {
      const url = new URL(currentTab.url);

      for (const [siteName, pattern] of Object.entries(SUPPORTED_SITES)) {
        if (pattern.test(url.hostname)) {
          return siteName as SiteName;
        }
      }
    }
  } catch (error) {
    console.warn("Could not detect current site:", error);
  }

  return null;
}

/**
 * Load settings for a specific site or global settings
 */
export async function loadSiteSettings(
  site: SiteName | null = null
): Promise<Record<string, any>> {
  try {
    const keys = site
      ? SITE_SETTINGS[site]
      : Object.values(SITE_SETTINGS).flat();
    const settings = await browser.storage.local.get(keys);

    // Apply defaults for missing values
    for (const key of keys) {
      if (settings[key] === undefined && key in DEFAULT_SETTINGS) {
        settings[key] = DEFAULT_SETTINGS[key as keyof typeof DEFAULT_SETTINGS];
      }
    }

    return settings;
  } catch (error) {
    console.error("Failed to load settings:", error);
    return {};
  }
}

/**
 * Load all settings from storage
 */
export async function loadAllSettings(): Promise<Record<string, any>> {
  try {
    const allKeys = Object.values(SITE_SETTINGS).flat();
    const settings = await browser.storage.local.get(allKeys);

    // Apply defaults for missing values
    for (const [key, defaultValue] of Object.entries(DEFAULT_SETTINGS)) {
      if (settings[key] === undefined) {
        settings[key] = defaultValue;
      }
    }

    return settings;
  } catch (error) {
    console.error("Failed to load all settings:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save a single setting
 */
export async function saveSetting(key: string, value: any): Promise<void> {
  try {
    await browser.storage.local.set({ [key]: value });
    // Only log in debug mode
    const settings = await browser.storage.local.get(["debug.enabled"]);
    if (settings["debug.enabled"]) {
      console.log(`Saved setting: ${key} = ${value}`);
    }
  } catch (error) {
    console.error(`Failed to save setting ${key}:`, error);
    throw error;
  }
}

/**
 * Save multiple settings at once
 */
export async function saveSettings(
  settings: Record<string, any>
): Promise<void> {
  try {
    await browser.storage.local.set(settings);
    // Only log in debug mode
    const debugSettings = await browser.storage.local.get(["debug.enabled"]);
    if (debugSettings["debug.enabled"]) {
      console.log("Saved settings:", settings);
    }
  } catch (error) {
    console.error("Failed to save settings:", error);
    throw error;
  }
}

/**
 * Reset all settings to defaults
 */
export async function resetAllSettings(): Promise<void> {
  try {
    await browser.storage.local.clear();
    await browser.storage.local.set(DEFAULT_SETTINGS);
    // Only log in debug mode
    const debugSettings = await browser.storage.local.get(["debug.enabled"]);
    if (debugSettings["debug.enabled"]) {
      console.log("Reset all settings to defaults");
    }
  } catch (error) {
    console.error("Failed to reset settings:", error);
    throw error;
  }
}

/**
 * Get setting key for a specific site and setting type
 */
export function getSettingKey(
  site: SiteName | null,
  settingType: string
): string {
  return site ? `${site}.${settingType}` : `global.${settingType}`;
}

/**
 * Notify content scripts about setting changes
 */
export async function notifyContentScripts(message: any): Promise<void> {
  try {
    const tabs = await browser.tabs.query({});

    for (const tab of tabs) {
      if (tab.id && tab.url) {
        const url = new URL(tab.url);

        // Check if this tab is on a supported site
        for (const [siteName, pattern] of Object.entries(SUPPORTED_SITES)) {
          if (pattern.test(url.hostname)) {
            try {
              await browser.tabs.sendMessage(tab.id, message);
              break; // Only send once per tab
            } catch (error) {
              // Tab might not have content script loaded, ignore
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed to notify content scripts:", error);
  }
}

/**
 * Create a settings manager for a specific context (popup or options page)
 */
export class SettingsManager {
  private site: SiteName | null = null;

  constructor(site: SiteName | null = null) {
    this.site = site;
  }

  async init(): Promise<void> {
    if (this.site === null) {
      this.site = await detectCurrentSite();
    }
  }

  getCurrentSite(): SiteName | null {
    return this.site;
  }

  async loadSettings(): Promise<Record<string, any>> {
    return this.site ? loadSiteSettings(this.site) : loadAllSettings();
  }

  async saveSetting(settingType: string, value: any): Promise<void> {
    const key = getSettingKey(this.site, settingType);
    await saveSetting(key, value);
  }

  async notifyChange(message: any): Promise<void> {
    await notifyContentScripts(message);
  }
}
