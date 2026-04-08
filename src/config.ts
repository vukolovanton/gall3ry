/**
 * Default configuration constants for the Infinite Gallery package
 * Provides sensible defaults that can be overridden by users
 */

import type { GalleryOptions } from './types';

/**
 * Default CSS variable names and their default values
 * These variables can be overridden by users via custom CSS
 */
export const DEFAULT_CSS_VARS = {
  /** 3D perspective depth in pixels */
  '--ig-perspective': '1800px',
  /** Width of each card in pixels */
  '--ig-card-width': '360px',
  /** Aspect ratio of cards (width/height) */
  '--ig-card-aspect-ratio': '4/5',
  /** Easing function for animations */
  '--ig-ease': 'cubic-bezier(0.22, 1, 0.36, 1)',
  /** Background color */
  '--ig-bg': '#f0f0f0',
  /** Foreground color (text, etc.) */
  '--ig-fg': '#0b0b0b',
} as const;

/**
 * Default configuration options for the gallery
 * Users can provide a partial configuration to override specific values
 */
export const DEFAULT_CONFIG: GalleryOptions = {
  /** Physics settings for scroll interactions */
  physics: {
    /** Friction coefficient (0-1), higher values mean more momentum */
    friction: 0.9,
    /** Sensitivity multiplier for mouse wheel scrolling */
    wheelSensitivity: 0.6,
    /** Maximum scroll velocity cap to prevent physics issues */
    maxVelocity: 50,
  },
  /** Visual settings controlling gallery appearance */
  visuals: {
    /** Width of each card in pixels */
    cardWidth: 360,
    /** Spacing between cards in pixels */
    cardGap: 40,
    /** 3D perspective depth in pixels */
    perspective: 1800,
    /** Aspect ratio of cards (width/height) */
    aspectRatio: 4 / 5,
  },
  /** Blur effect configuration for non-active cards */
  blur: {
    /** Whether to enable blur effect on inactive cards */
    enabled: true,
    /** Blur intensity in pixels */
    amount: 8,
  },
  /** Entry animation settings when gallery initializes */
  entryAnimation: {
    /** Whether to animate cards when gallery loads */
    enabled: true,
    /** Duration of entry animation in seconds */
    duration: 1.5,
  },
  /** Performance optimization settings */
  performance: {
    /** Delay before pausing animation loop when idle (ms) */
    idleDelay: 2000,
  },
} as const;

/**
 * Merge user-provided options with default configuration
 * User options take precedence over defaults
 */
export function mergeConfig(
  userOptions?: Partial<GalleryOptions>
): GalleryOptions {
  if (!userOptions) {
    return DEFAULT_CONFIG;
  }

  return {
    physics: { ...DEFAULT_CONFIG.physics, ...userOptions.physics },
    visuals: { ...DEFAULT_CONFIG.visuals, ...userOptions.visuals },
    blur: { ...DEFAULT_CONFIG.blur, ...userOptions.blur },
    entryAnimation: {
      ...DEFAULT_CONFIG.entryAnimation,
      ...userOptions.entryAnimation,
    },
    performance: {
      ...DEFAULT_CONFIG.performance,
      ...userOptions.performance,
    },
  };
}
