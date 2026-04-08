/**
 * Type definitions for the Infinite Gallery package
 * Defines all interfaces, types, and type aliases used throughout the library
 */

/**
 * Main configuration interface for initializing the InfiniteGallery
 */
export interface GalleryConfig {
  /** The ID of the container element where the gallery will be mounted */
  containerId: string;
  /** Array of image URLs to display in the gallery */
  images: string[];
  /** Optional configuration to override default settings */
  options?: Partial<GalleryOptions>;
}

/**
 * Configuration options for gallery behavior and appearance
 */
export interface GalleryOptions {
  /** Physics settings for scroll interactions and momentum */
  physics: {
    /** Friction coefficient (0-1), higher values mean more momentum */
    friction: number;
    /** Sensitivity multiplier for mouse wheel scrolling */
    wheelSensitivity: number;
    /** Maximum scroll velocity cap */
    maxVelocity: number;
  };
  /** Visual settings controlling gallery appearance */
  visuals: {
    /** Width of each card in pixels */
    cardWidth: number;
    /** Spacing between cards in pixels */
    cardGap: number;
    /** 3D perspective depth in pixels */
    perspective: number;
    /** Aspect ratio of cards (width/height) */
    aspectRatio: number;
  };
  /** Blur effect configuration for non-active cards */
  blur: {
    /** Whether to enable blur effect on inactive cards */
    enabled: boolean;
    /** Blur intensity in pixels */
    amount: number;
  };
  /** Entry animation settings when gallery initializes */
  entryAnimation: {
    /** Whether to animate cards when gallery loads */
    enabled: boolean;
    /** Duration of entry animation in seconds */
    duration: number;
  };
  /** Performance optimization settings */
  performance: {
    /** Delay before pausing animation loop when idle (ms) */
    idleDelay: number;
  };
}

/**
 * Public state of the gallery, accessible via getState()
 */
export interface GalleryState {
  /** Current active card index */
  currentIndex: number;
  /** Whether scrolling is currently active */
  isScrolling: boolean;
  /** Current scroll direction */
  scrollDirection: "left" | "right" | "none";
  /** Current scroll velocity */
  scrollVelocity: number;
  /** Total number of images in the gallery */
  totalImages: number;
}

/**
 * Event names that can be emitted by the gallery
 */
export type GalleryEvent =
  | "ready" // Emitted when gallery is fully initialized
  | "cardChange" // Emitted when active card changes
  | "scrollStart" // Emitted when user starts scrolling
  | "scrollEnd" // Emitted when scrolling stops
  | "destroy"; // Emitted when gallery is destroyed

/**
 * Event listener callback function type
 */
export type GalleryEventListener = (data?: unknown) => void;

/**
 * Internal state managed by the InfiniteGallery class
 * Not exposed to public API
 */
export interface InternalState {
  /** Current active card index */
  currentIndex: number;
  /** Current scroll velocity */
  scrollVelocity: number;
  /** Last recorded scroll position */
  lastScrollPosition: number;
  /** Whether user is currently dragging */
  isDragging: boolean;
  /** X position where drag started */
  dragStartX: number;
  /** Current X position during drag */
  dragCurrentX: number;
  /** Pointer ID for touch/mouse tracking */
  pointerId: number | null;
  /** Target index for scroll animation */
  scrollTargetIndex: number | null;
  /** Whether all images are loaded */
  imagesLoaded: boolean;
  /** Whether animation loop is active */
  isAnimating: boolean;
  /** Current direction of animation */
  animationDirection: "left" | "right" | "none";
}
