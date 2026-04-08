// Main entry point for the gall3ry npm package
// Exports the InfiniteGallery class and all necessary types

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

// CSS styles (will be bundled)
import "./style.css";
