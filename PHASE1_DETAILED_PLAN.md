# Phase 1: Code Refactoring - Detailed Implementation Plan

## Overview
Transform the monolithic `main.ts` (~800 lines) into a modular, reusable npm package structure. This phase focuses on code organization, separation of concerns, and removing coupling to the current HTML structure.

## Current State Analysis
- **main.ts**: ~800 lines containing all logic (config, state, DOM refs, handlers, core functions)
- **Hardcoded dependencies**: `.stage` selector, `#cards` selector, direct image imports
- **Global state**: 20+ global variables scattered throughout
- **Mixed concerns**: Event handlers, utilities, transforms, animation all in one file
- **Debug statements**: Console.log statements throughout the code
- **Empty structure**: `carousel/`, `utils/`, `styles/` folders exist but are empty

## Implementation Plan

---

### Step 1: Create TypeScript Type Definitions
**File**: `src/types.ts`

Create centralized type definitions based on existing interfaces and new requirements.

**Actions**:
1. Extract existing interfaces from main.ts:
   - `CarouselItem` → `GalleryCard`
   - `VisibleCard` → `VisibleCard`
   - `DebouncedFunction` → `DebouncedFunction`

2. Create new configuration interfaces:
   ```typescript
   export interface GalleryConfig {
     containerId: string;
     images: string[];
     options?: Partial<GalleryOptions>;
   }

   export interface GalleryOptions {
     // Physics
     friction: number;
     wheelSensitivity: number;
     wheelMaxDelta: number;
     wheelMinDelta: number;
     dragSensitivity: number;
     minVelocityThreshold: number;
     frictionDecayBase: number;
     
     // Visuals
     maxRotation: number;
     maxDepth: number;
     minScale: number;
     scaleRange: number;
     gap: number;
     
     // Blur
     maxBlur: number;
     blurExponent: number;
     
     // Entry Animation
     entryAnimation: {
       enabled: boolean;
       duration: number;
       stagger: number;
       ease: string;
       startScale: number;
       startY: number;
     };
     
     // Performance
     viewportThreshold: number;
     resizeDebounce: number;
     compositingStepFactor: number;
     compositingPaintInterval: number;
     
     // Optional: CSS Variables
     cssVariables?: Record<string, string>;
   }
   ```

3. Create state interface:
   ```typescript
   export interface GalleryState {
     currentIndex: number;
     scrollPosition: number;
     isAnimating: boolean;
     isDragging: boolean;
     velocity: number;
   }
   ```

4. Create event types:
   ```typescript
   export type GalleryEvent = 
     | 'ready' 
     | 'cardChange' 
     | 'scrollStart' 
     | 'scrollEnd'
     | 'destroy';

   export type GalleryEventListener = (data?: any) => void;
   ```

5. Create internal state interface (private to the class):
   ```typescript
   export interface InternalState {
     items: GalleryCard[];
     positions: number[];
     isEntering: boolean;
     cardWidth: number;
     cardHeight: number;
     step: number;
     track: number;
     scrollX: number;
     vwHalf: number;
     velocity: number;
     dragging: boolean;
     lastX: number;
     lastT: number;
     lastDelta: number;
   }
   ```

**Estimated Time**: 1-2 hours

---

### Step 2: Create Default Configuration
**File**: `src/config.ts`

Extract and restructure the CONFIG object.

**Actions**:
1. Move CONFIG object from main.ts to config.ts
2. Split into nested objects matching GalleryOptions interface
3. Rename properties to match new interface:
   - `blur.exponent` → `blurExponent`
   - `entry` → `entryAnimation`
4. Add default CSS variables:
   ```typescript
   const DEFAULT_CSS_VARS = {
     '--ig-perspective': '1800px',
     '--ig-card-width': '360px',
     '--ig-card-aspect-ratio': '4/5',
     '--ig-ease': 'cubic-bezier(0.22, 1, 0.36, 1)',
     '--ig-bg': '#f0f0f0',
     '--ig-fg': '#0b0b0b',
   };
   ```
5. Export default configuration:
   ```typescript
   export const DEFAULT_CONFIG: GalleryOptions = {
     physics: { ... },
     visuals: { ... },
     blur: { ... },
     entryAnimation: { ... },
     performance: { ... },
   };
   ```

**Estimated Time**: 30 minutes

---

### Step 3: Extract Utility Functions
**File**: `src/utils/mod.ts`

Create utility module for pure functions.

**Actions**:
1. Extract `mod(n, m)` function from main.ts (line 248-250)
2. Add JSDoc documentation:
   ```typescript
   /**
    * Mathematical modulo operation that handles negative numbers correctly.
    * @param n - The number to modulo
    * @param m - The modulus
    * @returns The positive remainder of n divided by m
    */
   export function mod(n: number, m: number): number
   ```

**Estimated Time**: 15 minutes

---

### Step 4: Extract Transform Utilities
**File**: `src/utils/transforms.ts`

Create module for 3D transform calculations.

**Actions**:
1. Extract `computeTransformComponents()` function (line 374-384)
2. Extract `transformForScreenX()` function (line 391-401)
3. Add proper TypeScript types and JSDoc:
   ```typescript
   export interface TransformComponents {
     ry: number;      // Rotation Y
     tz: number;      // Translation Z
     scale: number;   // Scale factor
   }

   export interface TransformResult {
     transform: string;
     z: number;
   }

   /**
    * Computes 3D transform components based on screen position.
    * @param screenX - Horizontal position in screen coordinates
    * @param cardWidth - Width of a card
    * @param step - Distance between card centers
    * @returns Transform components
    */
   export function computeTransformComponents(
     screenX: number,
     cardWidth: number,
     step: number,
     options: GalleryOptions
   ): TransformComponents

   /**
    * Generates CSS transform string for a card.
    * @param screenX - Horizontal position in screen coordinates
    * @returns Transform result with CSS string and Z index
    */
   export function transformForScreenX(
     screenX: number,
     config: {
       cardWidth: number;
       step: number;
       options: GalleryOptions;
     }
   ): TransformResult
   ```

**Estimated Time**: 1 hour

---

### Step 5: Extract Event Handling Utilities
**File**: `src/utils/events.ts`

Create module for event-related utilities.

**Actions**:
1. Create debounce utility function (extract logic from handleResize)
2. Create event emitter utility:
   ```typescript
   export interface EventEmitter {
     on(event: string, callback: Function): void;
     off(event: string, callback: Function): void;
     emit(event: string, data?: any): void;
     removeAllListeners(event?: string): void;
   }

   export class SimpleEventEmitter implements EventEmitter {
     private listeners: Map<string, Set<Function>>;

     constructor() {
       this.listeners = new Map();
     }

     on(event: string, callback: Function): void { }
     off(event: string, callback: Function): void { }
     emit(event: string, data?: any): void { }
     removeAllListeners(event?: string): void { }
   }
   ```

**Estimated Time**: 1 hour

---

### Step 6: Create Card Creation Module
**File**: `src/carousel/createCards.ts`

Extract card creation logic.

**Actions**:
1. Extract `createCards()` function from main.ts (line 320-347)
2. Make it accept container element as parameter
3. Remove hardcoded HTML structure - make it configurable:
   ```typescript
   export interface CardCreationOptions {
     container: HTMLElement;
     images: string[];
     cardWidth?: number;
     cardHeight?: number;
     gap?: number;
   }

   export interface CreatedCard {
     element: HTMLElement;
     x: number;
   }

   /**
    * Creates carousel cards from image URLs.
    * @param options - Card creation configuration
    * @returns Array of created cards with their positions
    */
   export function createCards(options: CardCreationOptions): CreatedCard[] {
     // Implementation from main.ts, adapted
   }
   ```
4. Add CSS class prefixing (`.ig-card`, `.ig-card-image`)
5. Support custom card templates (optional feature)

**Estimated Time**: 2 hours

---

### Step 7: Create Transform Update Module
**File**: `src/carousel/transforms.ts`

Extract carousel transform update logic.

**Actions**:
1. Extract `updateCarouselTransforms()` function from main.ts (line 406-450)
2. Adapt to use internal state and options:
   ```typescript
   export interface TransformUpdateOptions {
     items: GalleryCard[];
     scrollX: number;
     track: number;
     cardWidth: number;
     step: number;
     options: GalleryOptions;
     stage: HTMLElement;
   }

   export interface TransformUpdateResult {
     currentIndex: number;
     visibleCards: VisibleCard[];
   }

   /**
    * Updates all card transforms based on current scroll position.
    * @param options - Transform update parameters
    * @returns Current index and visible cards
    */
   export function updateCarouselTransforms(
     options: TransformUpdateOptions
   ): TransformUpdateResult
   ```
3. Separate blur calculation into utility function
4. Make closest card detection a separate function

**Estimated Time**: 2 hours

---

### Step 8: Create Animation Module
**File**: `src/carousel/animation.ts`

Extract animation loop and entry animation.

**Actions**:
1. Extract `tick()` function (line 460-477)
2. Extract `startCarousel()` and `cancelCarousel()` (line 482-497)
3. Extract `animateEntry()` function (line 556-609)
4. Extract `warmupCompositing()` function (line 614-635)
5. Create animation controller class:
   ```typescript
   export interface AnimationControllerOptions {
     onTick: (dt: number) => void;
     friction: number;
     minVelocityThreshold: number;
     frictionDecayBase: number;
   }

   export class AnimationController {
     private rafId: number | null = null;
     private lastTime: number = 0;
     private velocity: number = 0;
     
     constructor(private options: AnimationControllerOptions) {}

     start(): void { }
     stop(): void { }
     setVelocity(v: number): void { }
     getVelocity(): number { }
   }
   ```
6. Add JSDoc documentation for all animation functions

**Estimated Time**: 2.5 hours

---

### Step 9: Create Image Loading Module
**File**: `src/carousel/images.ts`

Extract image loading and decoding logic.

**Actions**:
1. Extract `preloadImageLinks()` function (line 260-271)
2. Extract `waitForImages()` function (line 277-290)
3. Extract `decodeAllImages()` function (line 296-311)
4. Create unified image loader:
   ```typescript
   export interface ImageLoaderOptions {
     cards: GalleryCard[];
     timeout?: number;
   }

   export class ImageLoader {
     /**
      * Preloads images by creating link elements.
      * @param imageUrls - Array of image URLs
      */
     static preloadLinks(imageUrls: string[]): void

     /**
      * Waits for all images in cards to load.
      * @param options - Loader options
      * @returns Promise that resolves when all images are loaded
      */
     static waitForLoad(options: ImageLoaderOptions): Promise<void>

     /**
      * Decodes all images to prevent jank during scrolling.
      * @param cards - Array of cards with images
      * @returns Promise that resolves when all images are decoded
      */
     static async decodeAll(cards: GalleryCard[]): Promise<void>
   }
   ```

**Estimated Time**: 1.5 hours

---

### Step 10: Create Measurement Module
**File**: `src/carousel/measure.ts`

Extract measurement and layout logic.

**Actions**:
1. Extract `measure()` function from main.ts (line 352-368)
2. Create layout calculator:
   ```typescript
   export interface LayoutMeasurements {
     cardWidth: number;
     cardHeight: number;
     step: number;
     track: number;
     vwHalf: number;
   }

   export interface MeasureOptions {
     items: GalleryCard[];
     options: GalleryOptions;
     viewportWidth: number;
   }

   /**
    * Measures card dimensions and calculates layout parameters.
    * @param options - Measurement options
    * @returns Layout measurements
    */
   export function measure(options: MeasureOptions): LayoutMeasurements
   ```

**Estimated Time**: 1 hour

---

### Step 11: Create Main InfiniteGallery Class
**File**: `src/InfiniteGallery.ts`

The core class that ties everything together.

**Actions**:
1. Create class structure:
   ```typescript
   import { EventEmitter } from './utils/events';
   import { GalleryConfig, GalleryState, GalleryOptions, InternalState, GalleryEvent } from './types';
   import { DEFAULT_CONFIG } from './config';
   import { createCards } from './carousel/createCards';
   import { measure, type LayoutMeasurements } from './carousel/measure';
   import { updateCarouselTransforms } from './carousel/transforms';
   import { AnimationController } from './carousel/animation';
   import { ImageLoader } from './carousel/images';
   import { mod } from './utils/mod';
   import { transformForScreenX } from './utils/transforms';

   export class InfiniteGallery {
     // Private properties
     private config: GalleryOptions;
     private state: InternalState;
     private emitter: EventEmitter;
     private animationController: AnimationController;
     private container: HTMLElement;
     private stage: HTMLElement;
     private cardsContainer: HTMLElement;
     private rafId: number | null = null;
     
     // Public API
     constructor(public readonly galleryConfig: GalleryConfig) { }
     
     async initialize(): Promise<void> { }
     destroy(): void { }
     start(): void { }
     stop(): void { }
     scrollTo(index: number, animate?: boolean): void { }
     getState(): GalleryState { }
     on(event: GalleryEvent, callback: Function): void { }
     off(event: GalleryEvent, callback: Function): void { }
     
     // Private methods
     private setupContainer(): void { }
     private setupEventListeners(): void { }
     private removeEventListeners(): void { }
     private handleWheel(e: WheelEvent): void { }
     private handlePointerDown(e: PointerEvent): void { }
     private handlePointerMove(e: PointerEvent): void { }
     private handlePointerUp(): void { }
     private handleResize(): void { }
     private handleVisibilityChange(): void { }
     private tick(dt: number): void { }
   }
   ```

2. Move initialization logic from `init()` to `initialize()` method
3. Move cleanup logic from `destroy()` to `destroy()` method
4. Convert all global variables to class properties
5. Convert all event handlers to class methods
6. Remove all `console.log` debug statements
7. Add error handling with proper error messages
8. Add event emissions at key lifecycle points

**Key Changes from main.ts**:
- Container is provided via `config.containerId` instead of hardcoded `.stage`
- Images are provided via `config.images` instead of imported directly
- Options are merged with defaults
- State is encapsulated in class
- All references to `stage` and `cardsRoot` become instance variables

**Estimated Time**: 4-5 hours

---

### Step 12: Create Main Entry Point
**File**: `src/index.ts`

Export the public API.

**Actions**:
1. Create clean exports:
   ```typescript
   export { InfiniteGallery } from './InfiniteGallery';
   export type {
     GalleryConfig,
     GalleryOptions,
     GalleryState,
     GalleryEvent,
     GalleryCard,
     VisibleCard
   } from './types';
   export { DEFAULT_CONFIG } from './config';
   ```

2. Add JSDoc for main class at top level
3. Ensure only public API is exported (no internal types)

**Estimated Time**: 30 minutes

---

### Step 13: Refactor Styles
**File**: `src/styles/index.css`

Extract and namespace CSS.

**Actions**:
1. Extract CSS from `src/style.css`
2. Add BEM-like naming with `ig-` prefix:
   - `.stage` → `.ig-stage`
   - `.card` → `.ig-card`
   - `.card img` → `.ig-card img`
3. Add CSS variables with `ig-` prefix:
   ```css
   .ig-stage {
     --ig-perspective: 1800px;
     --ig-card-width: 360px;
     --ig-card-aspect-ratio: 4/5;
     /* ... */
   }
   ```
4. Remove any hardcoded values that should be configurable
5. Add comments for customization

**Estimated Time**: 1 hour

---

### Step 14: Create Style Injection Utility
**File**: `src/styles/injector.ts`

Create utility to inject styles into DOM.

**Actions**:
1. Create style injector:
   ```typescript
   const INJECTED_STYLES_ID = 'ig-infinite-carousel-styles';

   export function injectStyles(css: string, force = false): void {
     if (!force && document.getElementById(INJECTED_STYLES_ID)) {
       return; // Already injected
     }
     
     const style = document.createElement('style');
     style.id = INJECTED_STYLES_ID;
     style.textContent = css;
     document.head.appendChild(style);
   }

   export function removeStyles(): void {
     const style = document.getElementById(INJECTED_STYLES_ID);
     if (style) {
       style.remove();
     }
   }
   ```

2. Integrate into InfiniteGallery class initialization

**Estimated Time**: 45 minutes

---

### Step 15: Update Example to Use New API
**File**: `examples/basic/main.ts` (create if doesn't exist)

Create example usage of the new API.

**Actions**:
1. Remove old main.ts from root
2. Create basic example:
   ```typescript
   import { InfiniteGallery } from '@gall3ry/infinite-carousel';

   const gallery = new InfiniteGallery({
     containerId: 'gallery',
     images: [
       '/path/to/image1.jpg',
       '/path/to/image2.jpg',
       // ...
     ],
     options: {
       friction: 0.9,
       wheelSensitivity: 0.6,
       // Custom options
     }
   });

   // Initialize
   gallery.initialize().then(() => {
     console.log('Gallery ready!');
     
     // Listen to events
     gallery.on('cardChange', (data) => {
       console.log('Card changed:', data);
     });
   });

   // Cleanup on page unload (if needed)
   window.addEventListener('beforeunload', () => {
     gallery.destroy();
   });
   ```

3. Update example HTML to use correct container ID
4. Create advanced example with more options

**Estimated Time**: 1.5 hours

---

### Step 16: Create Migration Guide
**File**: `MIGRATION.md` (in root)

Document how to migrate from old implementation.

**Actions**:
1. Document breaking changes
2. Provide before/after examples
3. List removed features (if any)
4. Provide troubleshooting tips

**Estimated Time**: 1 hour

---

## Implementation Order

### Week 1: Foundation (Days 1-3)
1. **Day 1**: Steps 1-3 (Types, Config, Basic Utils)
2. **Day 2**: Steps 4-6 (Transforms, Events, Card Creation)
3. **Day 3**: Steps 7-9 (Transforms, Animation, Images)

### Week 1: Core Class (Days 4-5)
4. **Day 4**: Steps 10-11 (Measurement, Main Class)
5. **Day 5**: Step 12 (Entry Point) + Testing

### Week 2: Polish (Days 6-7)
6. **Day 6**: Steps 13-14 (Styles, Injector)
7. **Day 7**: Steps 15-16 (Examples, Documentation)

---

## Testing Strategy During Refactoring

### Unit Testing (as you go)
- Test each utility function in isolation
- Test transform calculations with known values
- Test event emission

### Integration Testing (after Step 11)
- Test full initialization cycle
- Test scrolling and transforms
- Test event handling
- Test cleanup/destroy

### Manual Testing
- Run example in browser
- Test all interactions (wheel, drag, resize)
- Test error scenarios (invalid container, missing images)

---

## Common Pitfalls & Solutions

### Pitfall 1: State Loss During Refactoring
**Problem**: Global variables converted to class properties lose state during method calls.
**Solution**: Use `this` consistently; consider using arrow functions for callbacks.

### Pitfall 2: Event Listener Memory Leaks
**Problem**: Event listeners not properly removed.
**Solution**: Keep track of all listeners; remove all in destroy() method.

### Pitfall 3: CSS Selector Conflicts
**Problem**: Hardcoded selectors in styles don't match new class names.
**Solution**: Use consistent `ig-` prefix; update all selectors.

### Pitfall 4: GSAP Animation Context
**Problem**: GSAP animations might lose context after refactoring.
**Solution**: Ensure GSAP targets are properly scoped; kill all tweens in destroy().

### Pitfall 5: Image Loading Race Conditions
**Problem**: Images might not load in expected order.
**Solution**: Use Promise.all with timeout; handle load errors gracefully.

---

## Validation Checklist

After completing Phase 1, verify:

- [ ] All code is in TypeScript (no .js files)
- [ ] All console.log statements removed
- [ ] No hardcoded DOM selectors (all configurable)
- [ ] No hardcoded image imports (all via config)
- [ ] All functions have JSDoc comments
- [ ] All types are exported from types.ts
- [ ] Default config matches original CONFIG
- [ ] CSS is namespaced with `ig-` prefix
- [ ] Styles can be injected programmatically
- [ ] InfiniteGallery class implements full public API
- [ ] Event system works correctly
- [ ] Gallery can be initialized and destroyed
- [ ] Example works in browser
- [ ] No TypeScript errors
- [ ] No ESLint errors (if configured)

---

## Estimated Total Time: 20-24 hours

## Next Phase Preview
After completing Phase 1, you'll have:
- Clean, modular code structure
- Well-typed, documented public API
- Separation of concerns
- No coupling to specific HTML structure
- Ready for Phase 2: Package Setup

---

*Created: 2025-01-18*
*Status: Ready for Implementation*