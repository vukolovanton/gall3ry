// Main entry point for the gall3ry npm package
// Exports the InfiniteGallery class and all necessary types

// ============================================================================
// CSS Injection
// ============================================================================
// Automatically inject CSS when the package is imported
(function injectStyles() {
  if (typeof document === "undefined") return; // Skip in non-browser environments

  const styleId = "gall3ry-styles";

  // Check if styles are already injected
  if (document.getElementById(styleId)) {
    return;
  }

  // Create and inject style element
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = css;
  document.head.appendChild(style);
})();

// Core Gallery Class
export { InfiniteGallery } from "./gallery.ts";

// Type Definitions
export type {
  CarouselItem,
  VisibleCard,
  GalleryOptions,
  GalleryConfig,
  GalleryState,
  GalleryEvent,
} from "./gallery.ts";

// Default configuration constants
export { DEFAULTS } from "./gallery.ts";
