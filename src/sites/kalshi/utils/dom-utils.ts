import { CSS_CLASSES, DATA_ATTRIBUTES } from "../config/constants.js";

export function findAndReplaceTextNode(
  element: Element,
  callback: (textNode: Text, originalText: string) => void
): void {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      return node.textContent?.includes("¢") ||
        node.textContent?.includes("% chance")
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP;
    },
  });

  const textNode = walker.nextNode() as Text;
  if (textNode) {
    const originalText = textNode.textContent || "";
    callback(textNode, originalText);
  }
}

export function createOddsSpan(odds: string, textNode: Text): void {
  if (!textNode.parentNode) return;

  const oddsSpan = document.createElement("span");
  oddsSpan.className = CSS_CLASSES.ODDS_SPAN;
  oddsSpan.style.marginLeft = "4px";
  oddsSpan.style.pointerEvents = "none";
  oddsSpan.textContent = `(${odds})`;

  textNode.parentNode.insertBefore(oddsSpan, textNode.nextSibling);
}

export function createSpreadOverlay(
  button: HTMLElement,
  spreadText: string,
  isYes: boolean
): void {
  const existingOverlay = button.querySelector(
    `.${CSS_CLASSES.SPREAD_OVERLAY}`
  );
  if (existingOverlay) {
    existingOverlay.remove();
  }

  const overlay = document.createElement("div");
  overlay.className = CSS_CLASSES.SPREAD_OVERLAY;

  const overlayColor = isYes ? "var(--blue-x10)" : "var(--purple-x10)";

  overlay.style.cssText = `
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    pointer-events: none;
    color: ${overlayColor};
  `;
  overlay.textContent = spreadText;

  const buttonStyle = window.getComputedStyle(button);
  if (buttonStyle.position === "static") {
    button.style.position = "relative";
  }

  button.appendChild(overlay);
  button.dataset[DATA_ATTRIBUTES.SPREAD_PROCESSED] = "true";
}

export function clearAllAnnotations(): void {
  document
    .querySelectorAll(`.${CSS_CLASSES.ODDS_SPAN}`)
    .forEach((span) => span.remove());

  document
    .querySelectorAll(`.${CSS_CLASSES.SPREAD_OVERLAY}`)
    .forEach((overlay) => overlay.remove());

  document
    .querySelectorAll(`[data-${DATA_ATTRIBUTES.PROCESSED.toLowerCase()}]`)
    .forEach((el) => {
      const htmlEl = el as HTMLElement;

      const originalText =
        htmlEl.dataset[DATA_ATTRIBUTES.ORIGINAL_TEXT.toLowerCase()];
      if (originalText) {
        const textNode = htmlEl.firstChild;
        if (textNode?.nodeType === Node.TEXT_NODE) {
          textNode.textContent = originalText;
        }
        delete htmlEl.dataset[DATA_ATTRIBUTES.ORIGINAL_TEXT.toLowerCase()];
      }

      delete htmlEl.dataset[DATA_ATTRIBUTES.PROCESSED.toLowerCase()];
      htmlEl.style.color = "";
      htmlEl.style.fontWeight = "";
    });

  document
    .querySelectorAll(
      `[data-${DATA_ATTRIBUTES.SPREAD_PROCESSED.toLowerCase()}]`
    )
    .forEach((el) => {
      const htmlEl = el as HTMLElement;
      delete htmlEl.dataset[DATA_ATTRIBUTES.SPREAD_PROCESSED.toLowerCase()];
    });
}
