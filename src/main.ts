/*
  Infinite Gradient 3D Carousel
  A smooth, infinite-scrolling 3D carousel with dynamic gradient backgrounds
  that change based on the active card's colors.
*/

// ============================================================================
// CONFIGURATION
// ============================================================================

import { gsap } from "gsap";
import img01 from "./assets/img01.webp";
import img02 from "./assets/img02.webp";
import img03 from "./assets/img03.webp";
import img04 from "./assets/img04.webp";
import img05 from "./assets/img05.webp";
import img06 from "./assets/img06.webp";
import img07 from "./assets/img07.webp";
import img08 from "./assets/img08.webp";
import img09 from "./assets/img09.webp";
import img10 from "./assets/img10.webp";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface CarouselItem {
  el: HTMLElement;
  x: number;
}

interface VisibleCard {
  item: CarouselItem;
  screenX: number;
  index: number;
}

// Extend Function interface for debounce property
interface DebouncedFunction extends Function {
  _t?: ReturnType<typeof setTimeout>;
}

const CONFIG = {
  // Image sources
  images: [
    img01,
    img02,
    img03,
    img04,
    img05,
    img06,
    img07,
    img08,
    img09,
    img10,
  ],

  // DOM element selectors
  selectors: {
    stage: ".stage",
    cards: "cards",
  },

  // Physics parameters
  physics: {
    friction: 0.9, // Velocity decay (0-1, lower = more friction)
    wheelSensitivity: 0.6, // Mouse wheel sensitivity
    dragSensitivity: 1.0, // Drag sensitivity
    minVelocityThreshold: 0.02, // Minimum velocity before stopping
    frictionDecayBase: 60, // Base for friction decay calculation
  },

  // Visual/3D parameters
  visuals: {
    maxRotation: 28, // Maximum card rotation in degrees
    maxDepth: 140, // Maximum Z-axis depth in pixels
    minScale: 0.92, // Minimum card scale
    scaleRange: 0.1, // Scale variation range
    gap: 28, // Gap between cards in pixels
  },

  // Blur effect parameters
  blur: {
    maxBlur: 2, // Maximum blur amount in pixels
    exponent: 1.1, // Blur curve exponent
  },

  // Entry animation parameters
  entry: {
    startScale: 0.92, // Starting scale for entry animation
    startY: 40, // Starting Y offset in pixels
    duration: 0.6, // Animation duration in seconds
    stagger: 0.05, // Delay between card animations in seconds
    ease: "power3.out", // GSAP easing function
  },

  // Performance parameters
  performance: {
    viewportThreshold: 0.6, // Portion of viewport width to consider cards visible
    resizeDebounce: 80, // Resize debounce delay in milliseconds
    compositingStepFactor: 0.5, // Step size factor for GPU warmup (0-1)
    compositingPaintInterval: 3, // Paint every N steps during warmup
  },
};

// ============================================================================
// DOM REFERENCES
// ============================================================================

const stage = document.querySelector(".stage");
const cardsRoot = document.getElementById("cards");

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

// Carousel state
let items: CarouselItem[] = []; // Array of {el: HTMLElement, x: number}
let positions: Float32Array | number[] = []; // Float32Array for wrapped positions
let isEntering = true; // Prevents interaction during entry animation

// Layout measurements
let CARD_W = 300; // Card width (measured dynamically)
let CARD_H = 400; // Card height (measured dynamically)
let STEP = CARD_W + CONFIG.visuals.gap; // Distance between card centers
let TRACK = 0; // Total carousel track length
let SCROLL_X = 0; // Current scroll position
let VW_HALF = window.innerWidth * 0.5;

// Physics state
let vX = 0; // Velocity in X direction

// Animation frame IDs
let rafId: number | null = null; // Carousel animation frame
let lastTime = 0; // Last frame timestamp

// Background gradient state

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safe modulo operation that handles negative numbers correctly
 * @param {number} n - The dividend
 * @param {number} m - The divisor
 * @returns {number} The positive remainder
 */
function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

// ============================================================================
// IMAGE PRELOADING
// ============================================================================

/**
 * Preload images using link tags for browser optimization
 * @param {string[]} srcs - Array of image URLs
 */
function preloadImageLinks(srcs: string[]): void {
  if (!document.head) return;

  srcs.forEach((href: string) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = href;
    link.fetchPriority = "high";
    document.head.appendChild(link);
  });
}

/**
 * Wait for all card images to finish loading
 * @returns {Promise<void>}
 */
function waitForImages(): Promise<void[]> {
  const promises = items.map((it: CarouselItem) => {
    const img = it.el.querySelector("img") as HTMLImageElement | null;
    if (!img || img.complete) return Promise.resolve();

    return new Promise<void>((resolve) => {
      const done = () => resolve();
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    });
  });

  return Promise.all(promises);
}

/**
 * Decode all images to prevent jank during first interaction
 * @returns {Promise<void>}
 */
async function decodeAllImages(): Promise<void> {
  const tasks = items.map(async (it: CarouselItem) => {
    const img = it.el.querySelector("img") as HTMLImageElement | null;
    if (!img) return;

    if (typeof img.decode === "function") {
      try {
        await img.decode();
      } catch {
        // Ignore decode errors
      }
    }
  });

  await Promise.allSettled(tasks);
}

// ============================================================================
// CAROUSEL SETUP
// ============================================================================

/**
 * Create card DOM elements from image array
 */
function createCards(): void {
  if (!cardsRoot) return;
  cardsRoot.innerHTML = "";
  items = [];

  const fragment = document.createDocumentFragment();

  CONFIG.images.forEach((src, i) => {
    const card = document.createElement("article");
    card.className = "card";
    card.style.willChange = "transform"; // Force GPU compositing
    card.style.opacity = "0"; // Hide cards initially to prevent jump before entry animation

    const img = new Image();
    img.className = "card__img";
    img.decoding = "async";
    img.loading = "eager";
    img.fetchPriority = "high";
    img.draggable = false;
    img.src = src;

    card.appendChild(img);
    fragment.appendChild(card);
    items.push({ el: card, x: i * STEP });
  });

  cardsRoot.appendChild(fragment);
}

/**
 * Measure card dimensions and calculate layout
 */
function measure(): void {
  const sample = items[0]?.el;
  if (!sample) return;

  const r = sample.getBoundingClientRect();
  CARD_W = r.width || CARD_W;
  CARD_H = r.height || CARD_H;
  STEP = CARD_W + CONFIG.visuals.gap;
  TRACK = items.length * STEP;

  // Set initial positions
  items.forEach((it: CarouselItem, i: number) => {
    it.x = i * STEP;
  });

  positions = new Float32Array(items.length);
}

// ============================================================================
// TRANSFORM CALCULATIONS
// ============================================================================

function computeTransformComponents(screenX: number) {
  const norm = Math.max(-1, Math.min(1, screenX / VW_HALF));
  const absNorm = Math.abs(norm);
  const invNorm = 1 - absNorm;

  const ry = -norm * CONFIG.visuals.maxRotation;
  const tz = invNorm * CONFIG.visuals.maxDepth;
  const scale = CONFIG.visuals.minScale + invNorm * CONFIG.visuals.scaleRange;

  return { norm, absNorm, invNorm, ry, tz, scale };
}

/**
 * Calculate 3D transform for a card based on its screen position
 * @param {number} screenX - Card's X position relative to viewport center
 * @returns {{transform: string, z: number}} Transform string and Z-depth
 */
function transformForScreenX(screenX: number): {
  transform: string;
  z: number;
} {
  const { ry, tz, scale } = computeTransformComponents(screenX);

  return {
    transform: `translate3d(${screenX}px,-50%,${tz}px) rotateY(${ry}deg) scale(${scale})`,
    z: tz,
  };
}

/**
 * Update all card transforms based on current scroll position
 */
function updateCarouselTransforms() {
  const half = TRACK / 2;
  let closestIdx = -1;
  let closestDist = Infinity;

  // Calculate wrapped positions for infinite scroll
  for (let i = 0; i < items.length; i++) {
    let pos = items[i].x - SCROLL_X;

    // Wrap position to nearest equivalent position
    if (pos < -half) pos += TRACK;
    if (pos > half) pos -= TRACK;

    positions[i] = pos;

    // Track closest card to center
    const dist = Math.abs(pos);
    if (dist < closestDist) {
      closestDist = dist;
      closestIdx = i;
    }
  }

  // Get adjacent cards for selective blur
  const prevIdx = (closestIdx - 1 + items.length) % items.length;
  const nextIdx = (closestIdx + 1) % items.length;

  // Apply transforms to all cards
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const pos = positions[i];
    const norm = Math.max(-1, Math.min(1, pos / VW_HALF));
    const { transform, z } = transformForScreenX(pos);

    it.el.style.transform = transform;
    it.el.style.zIndex = String(1000 + Math.round(z)); // Higher z-index for cards in front

    // Apply subtle blur to non-core cards
    const isCore = i === closestIdx || i === prevIdx || i === nextIdx;
    const blur = isCore
      ? 0
      : CONFIG.blur.maxBlur * Math.pow(Math.abs(norm), CONFIG.blur.exponent);
    it.el.style.filter = `blur(${blur.toFixed(2)}px)`;
  }
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================

/**
 * Main animation loop for carousel movement
 * @param {number} t - Current timestamp
 */
function tick(t: number): void {
  const dt = lastTime ? (t - lastTime) / 1000 : 0;
  lastTime = t;

  // Apply velocity to scroll position
  SCROLL_X = mod(SCROLL_X + vX * dt, TRACK);

  // Apply friction to velocity
  const decay = Math.pow(
    CONFIG.physics.friction,
    dt * CONFIG.physics.frictionDecayBase,
  );
  vX *= decay;
  if (Math.abs(vX) < CONFIG.physics.minVelocityThreshold) vX = 0;

  updateCarouselTransforms();
  rafId = requestAnimationFrame(tick);
}

/**
 * Start the carousel animation loop
 */
function startCarousel() {
  cancelCarousel();
  lastTime = 0;
  rafId = requestAnimationFrame((t) => {
    updateCarouselTransforms();
    tick(t);
  });
}

/**
 * Stop the carousel animation loop
 */
function cancelCarousel(): void {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
}

/**
 * Handle window resize
 */
function onResize(): void {
  const prevStep = STEP || 1;
  const ratio = SCROLL_X / (items.length * prevStep);
  measure();
  VW_HALF = window.innerWidth * 0.5;
  SCROLL_X = mod(ratio * TRACK, TRACK);
  updateCarouselTransforms();
}

// Extend the onResize function with debounce property
(onResize as DebouncedFunction)._t = undefined;

// Mouse wheel scrolling
if (stage) {
  stage.addEventListener(
    "wheel",
    (e) => {
      if (isEntering) return;
      e.preventDefault();

      const wheelEvent = e as WheelEvent;
      const delta =
        Math.abs(wheelEvent.deltaX) > Math.abs(wheelEvent.deltaY)
          ? wheelEvent.deltaX
          : wheelEvent.deltaY;
      vX += delta * CONFIG.physics.wheelSensitivity * 20;
    },
    { passive: false },
  );

  // Prevent default drag behavior
  stage.addEventListener("dragstart", (e) => e.preventDefault());
}

// Drag state
let dragging = false;
let lastX = 0;
let lastT = 0;
let lastDelta = 0;

// Pointer down - start dragging
if (stage) {
  stage.addEventListener("pointerdown", (e) => {
    if (isEntering) return;
    const target = e.target as HTMLElement;
    if (target.closest(".frame")) return;

    dragging = true;
    lastX = (e as PointerEvent).clientX;
    lastT = performance.now();
    lastDelta = 0;
    stage.setPointerCapture((e as PointerEvent).pointerId);
    stage.classList.add("dragging");
  });
}

// Pointer move - update scroll position
if (stage) {
  stage.addEventListener("pointermove", (e) => {
    if (!dragging) return;

    const now = performance.now();
    const pointerEvent = e as PointerEvent;
    const dx = pointerEvent.clientX - lastX;
    const dt = Math.max(1, now - lastT) / 1000;

    SCROLL_X = mod(SCROLL_X - dx * CONFIG.physics.dragSensitivity, TRACK);
    lastDelta = dx / dt; // Track velocity for momentum
    lastX = pointerEvent.clientX;
    lastT = now;
  });
}

// Pointer up - apply momentum
if (stage) {
  stage.addEventListener("pointerup", (e) => {
    if (!dragging) return;
    dragging = false;
    stage.releasePointerCapture((e as PointerEvent).pointerId);
    vX = -lastDelta * CONFIG.physics.dragSensitivity; // Apply final velocity
    stage.classList.remove("dragging");
  });
}

// Debounced resize handler
window.addEventListener("resize", () => {
  clearTimeout((onResize as DebouncedFunction)._t);
  (onResize as DebouncedFunction)._t = setTimeout(
    onResize,
    CONFIG.performance.resizeDebounce,
  );
});

// Pause animations when tab is hidden
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelCarousel();
  } else {
    startCarousel();
  }
});

// ============================================================================
// INITIALIZATION & ENTRY ANIMATION
// ============================================================================

/**
 * Animate visible cards entering the scene
 * @param {Array} visibleCards - Cards to animate
 */
async function animateEntry(visibleCards: VisibleCard[]): Promise<void> {
  await new Promise<void>((r) => requestAnimationFrame(() => r()));

  const tl = gsap.timeline();

  visibleCards.forEach(({ item, screenX }: VisibleCard, idx: number) => {
    const state = { p: 0 }; // 0 -> 1
    const { ry, tz, scale: baseScale } = computeTransformComponents(screenX);

    const START_SCALE = CONFIG.entry.startScale;
    const START_Y = CONFIG.entry.startY;

    item.el.style.opacity = "0";
    item.el.style.transform =
      `translate3d(${screenX}px,-50%,${tz}px) ` +
      `rotateY(${ry}deg) ` +
      `scale(${START_SCALE}) ` +
      `translateY(${START_Y}px)`;

    tl.to(
      state,
      {
        p: 1,
        duration: CONFIG.entry.duration,
        ease: CONFIG.entry.ease,
        onUpdate: () => {
          const t: number = state.p;

          const currentScale = START_SCALE + (baseScale - START_SCALE) * t;
          const currentY = START_Y * (1 - t);
          const opacity = t;

          item.el.style.opacity = opacity.toFixed(3);

          if (t >= 0.999) {
            const { transform } = transformForScreenX(screenX);
            item.el.style.transform = transform;
          } else {
            item.el.style.transform =
              `translate3d(${screenX}px,-50%,${tz}px) ` +
              `rotateY(${ry}deg) ` +
              `scale(${currentScale}) ` +
              `translateY(${currentY}px)`;
          }
        },
      },
      idx * CONFIG.entry.stagger,
    );
  });

  await new Promise((resolve) => {
    tl.eventCallback("onComplete", resolve);
  });
}

/**
 * Pre-composite all card positions to prevent first-interaction jank
 */
async function warmupCompositing(): Promise<void> {
  const originalScrollX = SCROLL_X;
  const stepSize = STEP * CONFIG.performance.compositingStepFactor;
  const numSteps = Math.ceil(TRACK / stepSize);

  // Scroll through entire carousel to force GPU compositing
  for (let i = 0; i < numSteps; i++) {
    SCROLL_X = mod(originalScrollX + i * stepSize, TRACK);
    updateCarouselTransforms();

    // Force paint every few steps (optimization)
    if (i % CONFIG.performance.compositingPaintInterval === 0) {
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
    }
  }

  // Return to original position
  SCROLL_X = originalScrollX;
  updateCarouselTransforms();
  await new Promise<void>((r) => requestAnimationFrame(() => r()));
  await new Promise<void>((r) => requestAnimationFrame(() => r()));
}

/**
 * Initialize the carousel application
 */
async function init() {
  try {
    console.log("DEBUG: init() started");

    // Preload images for faster loading
    preloadImageLinks(CONFIG.images);
    console.log("DEBUG: images preloaded");

    // Create DOM elements
    createCards();
    console.log("DEBUG: cards created, items.length =", items.length);

    measure();
    console.log(
      "DEBUG: measure() called, CARD_W =",
      CARD_W,
      "CARD_H =",
      CARD_H,
      "STEP =",
      STEP,
      "TRACK =",
      TRACK,
    );

    updateCarouselTransforms();
    stage?.classList.add("carousel-mode");

    // Wait for all images to load
    console.log("DEBUG: waiting for images to load...");
    await waitForImages();
    console.log("DEBUG: all images loaded");

    // Decode images to prevent jank
    console.log("DEBUG: decoding images...");
    await decodeAllImages();
    console.log("DEBUG: images decoded");

    // Force browser to paint images
    items.forEach((it) => {
      const img = it.el.querySelector("img");
      if (img) void img.offsetHeight;
    });

    // Find and set initial centered card
    const half = TRACK / 2;
    let closestIdx = 0;
    let closestDist = Infinity;

    for (let i = 0; i < items.length; i++) {
      let pos = items[i].x - SCROLL_X;
      if (pos < -half) pos += TRACK;
      if (pos > half) pos -= TRACK;
      const d = Math.abs(pos);
      if (d < closestDist) {
        closestDist = d;
        closestIdx = i;
      }
    }
    console.log("DEBUG: closest card index =", closestIdx);

    // Warmup GPU compositing
    console.log("DEBUG: starting GPU warmup...");
    await warmupCompositing();
    console.log("DEBUG: GPU warmup complete");

    // Wait for browser idle time
    if ("requestIdleCallback" in window) {
      await new Promise((r) => requestIdleCallback(r, { timeout: 100 }));
    }

    // Prepare entry animation for visible cards
    const viewportWidth = window.innerWidth;
    const visibleCards = [];

    for (let i = 0; i < items.length; i++) {
      let pos = items[i].x - SCROLL_X;
      if (pos < -half) pos += TRACK;
      if (pos > half) pos -= TRACK;

      const screenX = pos;
      if (
        Math.abs(screenX) <
        viewportWidth * CONFIG.performance.viewportThreshold
      ) {
        visibleCards.push({ item: items[i], screenX, index: i });
      }
    }
    console.log("DEBUG: visible cards =", visibleCards.length);

    // Sort cards left to right
    visibleCards.sort((a, b) => a.screenX - b.screenX);

    // Animate cards entering
    console.log("DEBUG: starting entry animation...");
    await animateEntry(visibleCards);
    console.log("DEBUG: entry animation complete");

    // Ensure all cards are visible for infinite scrolling
    items.forEach((it) => {
      it.el.style.opacity = "1";
    });

    // Enable user interaction
    isEntering = false;

    // Start main carousel loop
    console.log("DEBUG: starting carousel loop");
    startCarousel();
    console.log("DEBUG: init() complete");
  } catch (error) {
    console.error("ERROR in init():", error);
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }
  }
}

// ============================================================================
// START APPLICATION
// ============================================================================

init().catch((error) => {
  console.error("ERROR: init() promise rejected:", error);
  console.error("Stack trace:", error.stack);
});
