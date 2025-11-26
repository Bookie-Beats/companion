import {
  SELECTORS,
  REGEX_PATTERNS,
  DATA_ATTRIBUTES,
} from "../config/constants.js";
import {
  getExtensionEnabled,
  getCurrentDisplayMode,
} from "../core/settings.js";
import { convertToOdds } from "../core/odds-converter.js";
import { findAndReplaceTextNode, createOddsSpan } from "../utils/dom-utils.js";

export function processElement(element: Element): void {
  if (
    !getExtensionEnabled() ||
    element.querySelector(".bb-odds") ||
    (element as HTMLElement).dataset[DATA_ATTRIBUTES.PROCESSED.toLowerCase()]
  ) {
    return;
  }

  const text = element.textContent?.trim() || "";
  const centMatch = text.match(REGEX_PATTERNS.CENTS);
  const percentMatch = text.match(REGEX_PATTERNS.PERCENTAGE);

  if ((!centMatch && !percentMatch) || text.length >= 30) return;

  const htmlElement = element as HTMLElement;
  let odds: string;

  // Check if this is an average price element (fees already included)
  const isAveragePrice =
    htmlElement.closest("div")?.textContent?.includes("Average price") || false;

  if (centMatch) {
    const cents = parseFloat(centMatch[1]);
    odds = convertToOdds(cents, !isAveragePrice); // Don't include fees if it's average price
  } else if (percentMatch) {
    const percentage = parseFloat(percentMatch[1]);
    odds = convertToOdds(percentage, !isAveragePrice); // Don't include fees if it's average price
  } else {
    return;
  }

  const currentDisplayMode = getCurrentDisplayMode();

  switch (currentDisplayMode) {
    case "american":
      findAndReplaceTextNode(element, (textNode, originalText) => {
        htmlElement.dataset[DATA_ATTRIBUTES.ORIGINAL_TEXT.toLowerCase()] =
          originalText;
        if (centMatch) {
          textNode.textContent = originalText.replace(
            /\d{1,2}(?:\.\d+)?¢/,
            odds
          );
        } else if (percentMatch) {
          textNode.textContent = originalText.replace(
            /\d{1,2}(?:\.\d+)?% chance/,
            odds
          );
        }
        htmlElement.dataset[DATA_ATTRIBUTES.PROCESSED.toLowerCase()] = "true";
      });
      break;

    case "price":
      htmlElement.dataset[DATA_ATTRIBUTES.PROCESSED.toLowerCase()] = "true";
      break;

    case "both":
      findAndReplaceTextNode(element, (textNode) => {
        createOddsSpan(odds, textNode);
        htmlElement.dataset[DATA_ATTRIBUTES.PROCESSED.toLowerCase()] = "true";
      });
      break;
  }
}

export function updateElementDisplay(
  element: HTMLElement,
  originalText: string
): void {
  const centMatch = originalText.match(REGEX_PATTERNS.CENTS);
  const percentMatch = originalText.match(REGEX_PATTERNS.PERCENTAGE);

  if (!centMatch && !percentMatch) return;

  // Check if this is an average price element (fees already included)
  const isAveragePrice =
    element.closest("div")?.textContent?.includes("Average price") || false;

  let odds: string;
  if (centMatch) {
    const cents = parseFloat(centMatch[1]);
    odds = convertToOdds(cents, !isAveragePrice); // Don't include fees if it's average price
  } else if (percentMatch) {
    const percentage = parseFloat(percentMatch[1]);
    odds = convertToOdds(percentage, !isAveragePrice); // Don't include fees if it's average price
  } else {
    return;
  }

  const textNode = element.firstChild;

  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;

  const currentDisplayMode = getCurrentDisplayMode();

  switch (currentDisplayMode) {
    case "american":
      if (centMatch) {
        textNode.textContent = originalText.replace(/\d{1,2}(?:\.\d+)?¢/, odds);
      } else if (percentMatch) {
        textNode.textContent = originalText.replace(
          /\d{1,2}(?:\.\d+)?% chance/,
          odds
        );
      }
      break;

    case "price":
      textNode.textContent = originalText;
      break;

    case "both":
      textNode.textContent = originalText;

      const existingOdds = element.querySelector(".bb-odds");
      existingOdds?.remove();

      const oddsSpan = document.createElement("span");
      oddsSpan.className = "bb-odds";
      oddsSpan.style.marginLeft = "4px";
      oddsSpan.textContent = `(${odds})`;
      element.appendChild(oddsSpan);
      break;
  }
}

export function checkAndUpdateElement(element: HTMLElement): boolean {
  const originalText =
    element.dataset[DATA_ATTRIBUTES.ORIGINAL_TEXT.toLowerCase()];
  const currentText = element.textContent?.trim() || "";

  if (!originalText) return false;

  const expectedCents = originalText.match(REGEX_PATTERNS.CENTS);
  const currentCents = currentText.match(REGEX_PATTERNS.CENTS);
  const expectedPercent = originalText.match(REGEX_PATTERNS.PERCENTAGE);
  const currentPercent = currentText.match(REGEX_PATTERNS.PERCENTAGE);

  if (
    (currentCents && expectedCents && currentCents[1] !== expectedCents[1]) ||
    (currentPercent &&
      expectedPercent &&
      currentPercent[1] !== expectedPercent[1])
  ) {
    element.dataset[DATA_ATTRIBUTES.ORIGINAL_TEXT.toLowerCase()] = currentText;
    delete element.dataset[DATA_ATTRIBUTES.PROCESSED.toLowerCase()];
    return true;
  }

  return false;
}

export function convertAllPrices(forceUpdate: boolean = false): void {
  if (!getExtensionEnabled()) return;

  const elements = document.querySelectorAll(SELECTORS.PRICE_ELEMENTS);

  elements.forEach((element) => {
    const htmlElement = element as HTMLElement;

    if (htmlElement.dataset[DATA_ATTRIBUTES.ORIGINAL_TEXT.toLowerCase()]) {
      const wasUpdated = checkAndUpdateElement(htmlElement);
      const originalText =
        htmlElement.dataset[DATA_ATTRIBUTES.ORIGINAL_TEXT.toLowerCase()];

      // Force update when fee settings change
      if (
        forceUpdate ||
        wasUpdated ||
        !htmlElement.dataset[DATA_ATTRIBUTES.PROCESSED.toLowerCase()]
      ) {
        updateElementDisplay(htmlElement, originalText!);
      }
    } else {
      const isLeafOrSimple =
        element.children.length === 0 ||
        (element.children.length === 1 &&
          (element.textContent?.includes("¢") ||
            element.textContent?.includes("% chance")));

      if (isLeafOrSimple) {
        processElement(element);
      }
    }
  });
}
