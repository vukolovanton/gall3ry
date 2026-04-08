// Main entry point for the gall3ry npm package
// Exports the InfiniteGallery class and all necessary types

// ============================================================================
// CSS Injection
// ============================================================================
// Automatically inject CSS when the package is imported
(function injectStyles() {
  if (typeof document === "undefined") return; // Skip in non-browser environments

  const css = `:root{--gall3ry-perspective:1800px;--gall3ry-ease:cubic-bezier(.22,1,.36,1);--gall3ry-stage-height:100vh;--gall3ry-card-width:min(26vw,360px);--gall3ry-card-aspect-ratio:1/1;--gall3ry-card-border-radius:15px;--gall3ry-card-transform-origin:90% center}.gall3ry-stage{position:relative;width:100%;height:var(--gall3ry-stage-height);overflow:hidden;perspective:var(--gall3ry-perspective);overscroll-behavior:none;-webkit-user-select:none;user-select:none}.gall3ry-stage.carousel-mode{touch-action:none;cursor:grab}.gall3ry-stage.carousel-mode.dragging{cursor:grabbing}.gall3ry-cards{position:absolute;inset:0;z-index:10;transform-style:preserve-3d}.gall3ry-card{position:absolute;top:50%;left:50%;width:var(--gall3ry-card-width);aspect-ratio:var(--gall3ry-card-aspect-ratio);isolation:isolate;transform-style:preserve-3d;backface-visibility:hidden;will-change:transform,filter;transform-origin:var(--gall3ry-card-transform-origin);contain:layout paint}.gall3ry-card__img{border-radius:var(--gall3ry-card-border-radius);opacity:1;width:100%;height:100%;object-fit:cover;display:block;transform:translateZ(0);pointer-events:none;-webkit-user-drag:none;-webkit-user-select:none;user-select:none}@media (prefers-reduced-motion:reduce){.gall3ry-card{transition:none!important;animation:none!important}}`;

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
