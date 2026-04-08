import { gsap } from "gsap";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CarouselItem {
  el: HTMLElement;
  x: number;
}

export interface VisibleCard {
  item: CarouselItem;
  screenX: number;
  index: number;
}

export interface GalleryOptions {
  friction?: number;
  wheelSensitivity?: number;
  wheelMaxDelta?: number;
  wheelMinDelta?: number;
  wheelMultiplier?: number;
  dragSensitivity?: number;
  minVelocityThreshold?: number;
  frictionDecayBase?: number;
  maxRotation?: number;
  maxDepth?: number;
  minScale?: number;
  scaleRange?: number;
  gap?: number;
  maxBlur?: number;
  exponent?: number;
  startScale?: number;
  startY?: number;
  duration?: number;
  stagger?: number;
  ease?: string;
  viewportThreshold?: number;
  resizeDebounce?: number;
  compositingStepFactor?: number;
  compositingPaintInterval?: number;
  cardWidth?: string;
  cardAspectRatio?: string;
  cardBorderRadius?: string;
  cardTransformOrigin?: string;
  stageHeight?: string;
  autoScrollEnabled?: boolean;
  autoScrollSpeed?: number;
}

export interface GalleryConfig {
  containerId: string;
  images: string[];
  options?: GalleryOptions;
}

export interface GalleryState {
  currentIndex: number;
  scrollX: number;
  velocity: number;
  isDragging: boolean;
  isAnimating: boolean;
}

export type GalleryEvent =
  | "ready"
  | "cardChange"
  | "scrollStart"
  | "scrollEnd"
  | "destroy";

interface DebouncedFunction extends Function {
  _t?: ReturnType<typeof setTimeout>;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULTS = {
  friction: 0.9,
  wheelSensitivity: 0.6,
  wheelMaxDelta: 50,
  wheelMinDelta: 1,
  wheelMultiplier: 20,
  dragSensitivity: 1.0,
  minVelocityThreshold: 0.02,
  frictionDecayBase: 60,
  maxRotation: 28,
  maxDepth: 140,
  minScale: 0.92,
  scaleRange: 0.1,
  gap: 28,
  maxBlur: 2,
  exponent: 1.1,
  startScale: 0.92,
  startY: 40,
  duration: 0.6,
  stagger: 0.05,
  ease: "power3.out",
  viewportThreshold: 0.6,
  resizeDebounce: 80,
  compositingStepFactor: 0.5,
  compositingPaintInterval: 3,
  cardWidth: "min(26vw, 360px)",
  cardAspectRatio: "1/1",
  cardBorderRadius: "15px",
  cardTransformOrigin: "90% center",
  stageHeight: "100vh",
  autoScrollEnabled: false,
  autoScrollSpeed: 20,
};

// ============================================================================
// MAIN CLASS
// ============================================================================

export class InfiniteGallery {
  private config: Required<GalleryConfig>;
  private options: typeof DEFAULTS;

  // DOM references
  private cardsRoot: HTMLElement | null = null;
  private stage: HTMLElement | null = null;

  // State
  private items: CarouselItem[] = [];
  private positions: Float32Array | number[] = [];
  private isEntering: boolean = true;
  private dragging: boolean = false;
  private scrolling: boolean = false;
  private activeIndex: number = 0;
  private userInteracted: boolean = false;
  private autoScrollResumeTimer: number | null = null;

  // Layout measurements
  private CARD_W: number = 300;
  // @ts-ignore - Reserved for future use
  private _CARD_H: number = 400;
  private STEP: number = 328;
  private TRACK: number = 0;
  private SCROLL_X: number = 0;
  private VW_HALF: number = 0;

  // Physics
  private vX: number = 0;
  private lastX: number = 0;
  private lastT: number = 0;
  private lastDelta: number = 0;

  // Animation frame
  private rafId: number | null = null;
  private lastTime: number = 0;

  // Event callbacks
  private events: Record<string, Function[]> = {};

  // Bound event handlers
  private handleWheelBound: (e: WheelEvent) => void;
  private handleDragStartBound: (e: Event) => void;
  private handlePointerDownBound: (e: PointerEvent) => void;
  private handlePointerMoveBound: (e: PointerEvent) => void;
  private handlePointerUpBound: (e: PointerEvent) => void;
  private handleResizeBound: () => void;
  private handleVisibilityChangeBound: () => void;

  constructor(config: GalleryConfig) {
    this.config = {
      containerId: config.containerId,
      images: config.images,
      options: config.options || {},
    };

    this.options = { ...DEFAULTS, ...config.options };

    this.handleWheelBound = this.handleWheel.bind(this);
    this.handleDragStartBound = this.handleDragStart.bind(this);
    this.handlePointerDownBound = this.handlePointerDown.bind(this);
    this.handlePointerMoveBound = this.handlePointerMove.bind(this);
    this.handlePointerUpBound = this.handlePointerUp.bind(this);
    this.handleResizeBound = this.handleResize.bind(this);
    this.handleVisibilityChangeBound = this.handleVisibilityChange.bind(this);
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  public async initialize(): Promise<void> {
    // Look for the specific container ID provided in config
    const userContainer = document.getElementById(this.config.containerId);
    if (!userContainer) {
      throw new Error(
        `InfiniteGallery: Container with ID "${this.config.containerId}" not found.`,
      );
    }

    // Preserve any existing attributes from user's container (e.g., aria-live)
    const ariaLive = userContainer.getAttribute("aria-live");

    // Create stage wrapper
    this.stage = document.createElement("div");
    this.stage.className = "gall3ry-stage";

    // Apply CSS custom properties from options (overrides CSS defaults)
    if (this.options.cardWidth) {
      this.stage.style.setProperty(
        "--gall3ry-card-width",
        this.options.cardWidth,
      );
    }
    if (this.options.gap) {
      this.stage.style.setProperty("--gall3ry-gap", this.options.gap + "px");
    }
    if (this.options.cardAspectRatio) {
      this.stage.style.setProperty(
        "--gall3ry-card-aspect-ratio",
        this.options.cardAspectRatio,
      );
    }
    if (this.options.cardBorderRadius) {
      this.stage.style.setProperty(
        "--gall3ry-card-border-radius",
        this.options.cardBorderRadius,
      );
    }
    if (this.options.cardTransformOrigin) {
      this.stage.style.setProperty(
        "--gall3ry-card-transform-origin",
        this.options.cardTransformOrigin,
      );
    }
    if (this.options.stageHeight) {
      this.stage.style.setProperty(
        "--gall3ry-stage-height",
        this.options.stageHeight,
      );
    }

    // Create cards container
    this.cardsRoot = document.createElement("section");
    this.cardsRoot.className = "gall3ry-cards";
    this.cardsRoot.setAttribute("aria-label", "Infinite carousel of images");

    // Clear user container and rebuild structure
    userContainer.innerHTML = "";

    // Add the stage wrapper to user container
    userContainer.appendChild(this.stage);

    // Add cards container to stage
    this.stage.appendChild(this.cardsRoot);

    // Restore aria-live attribute to the user container if it existed
    if (ariaLive) {
      userContainer.setAttribute("aria-live", ariaLive);
    }

    this.VW_HALF = window.innerWidth * 0.5;

    this.preloadImageLinks(this.config.images);
    this.createCards();
    this.measure();
    this.updateCarouselTransforms();

    this.stage.classList.add("carousel-mode");

    await this.waitForImages();
    await this.decodeAllImages();

    this.items.forEach((it) => {
      const img = it.el.querySelector("img");
      if (img) void img.offsetHeight;
    });

    await this.warmupCompositing();

    if ("requestIdleCallback" in window) {
      await new Promise((r) => requestIdleCallback(r, { timeout: 100 }));
    }

    const visibleCards = this.getVisibleCards();
    await this.animateEntry(visibleCards);

    this.items.forEach((it) => (it.el.style.opacity = "1"));
    this.isEntering = false;

    this.setupEventListeners();
    this.start();

    this.emit("ready");
  }

  public destroy(): void {
    this.stop();

    clearTimeout((this.handleResizeBound as DebouncedFunction)._t);

    if (this.autoScrollResumeTimer !== null) {
      clearTimeout(this.autoScrollResumeTimer);
      this.autoScrollResumeTimer = null;
    }

    if (this.stage) {
      this.stage.removeEventListener("wheel", this.handleWheelBound as any);
      this.stage.removeEventListener("dragstart", this.handleDragStartBound);
      this.stage.removeEventListener(
        "pointerdown",
        this.handlePointerDownBound as any,
      );
      this.stage.removeEventListener(
        "pointermove",
        this.handlePointerMoveBound as any,
      );
      this.stage.removeEventListener(
        "pointerup",
        this.handlePointerUpBound as any,
      );
      this.stage.classList.remove("carousel-mode", "dragging");
    }

    window.removeEventListener("resize", this.handleResizeBound);
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChangeBound,
    );

    if (this.cardsRoot) this.cardsRoot.innerHTML = "";

    this.items = [];
    this.positions = [];
    this.isEntering = true;
    this.dragging = false;
    this.scrolling = false;
    this.vX = 0;
    this.SCROLL_X = 0;
    this.userInteracted = false;

    this.emit("destroy");
    this.events = {};
  }

  public start(): void {
    this.stop();
    this.lastTime = 0;
    const tick = (t: number) => {
      const dt = this.lastTime ? (t - this.lastTime) / 1000 : 0;
      this.lastTime = t;

      this.SCROLL_X = this.mod(this.SCROLL_X + this.vX * dt, this.TRACK);

      const decay = Math.pow(
        this.options.friction,
        dt * this.options.frictionDecayBase,
      );
      this.vX *= decay;

      if (Math.abs(this.vX) < this.options.minVelocityThreshold) {
        this.vX = 0;
        if (this.scrolling && !this.dragging) {
          this.scrolling = false;
          this.emit("scrollEnd");
        }
      }

      // Apply auto-scroll if enabled and user hasn't interacted recently
      if (
        this.options.autoScrollEnabled &&
        !this.userInteracted &&
        !this.dragging &&
        Math.abs(this.vX) < this.options.minVelocityThreshold
      ) {
        this.vX = this.options.autoScrollSpeed;
        if (!this.scrolling) {
          this.scrolling = true;
          this.emit("scrollStart");
        }
      }

      this.updateCarouselTransforms();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  public stop(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  public scrollTo(index: number, animate: boolean = true): void {
    if (index < 0 || index >= this.items.length) return;

    const targetX = index * this.STEP;
    const half = this.TRACK / 2;

    let diff = targetX - (this.SCROLL_X % this.TRACK);
    if (diff < -half) diff += this.TRACK;
    if (diff > half) diff -= this.TRACK;

    const finalTarget = this.SCROLL_X + diff;

    if (!animate) {
      this.SCROLL_X = this.mod(finalTarget, this.TRACK);
      this.updateCarouselTransforms();
      return;
    }

    this.scrolling = true;
    this.emit("scrollStart");

    gsap.to(this, {
      SCROLL_X: finalTarget,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: () => {
        this.SCROLL_X = this.mod(this.SCROLL_X, this.TRACK);
        this.updateCarouselTransforms();
      },
      onComplete: () => {
        this.scrolling = false;
        this.emit("scrollEnd");
      },
    });
  }

  public getState(): GalleryState {
    return {
      currentIndex: this.activeIndex,
      scrollX: this.SCROLL_X,
      velocity: this.vX,
      isDragging: this.dragging,
      isAnimating:
        Math.abs(this.vX) > this.options.minVelocityThreshold || this.scrolling,
    };
  }

  public on(event: GalleryEvent, callback: Function): void {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }

  public off(event: GalleryEvent, callback: Function): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }

  // ============================================================================
  // INTERNAL HELPERS & LOGIC
  // ============================================================================

  private emit(event: string, data?: any): void {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback(data));
    }
  }

  private mod(n: number, m: number): number {
    return ((n % m) + m) % m;
  }

  private createCards(): void {
    if (!this.cardsRoot) return;

    this.cardsRoot.innerHTML = "";
    this.items = [];

    const fragment = document.createDocumentFragment();
    this.config.images.forEach((src, i) => {
      const card = document.createElement("article");
      card.className = "gall3ry-card";
      card.style.opacity = "0";

      const img = new Image();
      img.className = "gall3ry-card__img";
      img.decoding = "async";
      img.loading = "eager";
      img.fetchPriority = "high";
      img.draggable = false;
      img.src = src;

      card.appendChild(img);
      fragment.appendChild(card);
      this.items.push({ el: card, x: i * this.STEP });
    });

    this.cardsRoot.appendChild(fragment);
  }

  private measure(): void {
    const sample = this.items[0]?.el;
    if (!sample) return;

    const r = sample.getBoundingClientRect();
    this.CARD_W = r.width || 300;
    this._CARD_H = r.height || 400;

    // Dynamically read gap from CSS with fallback to options
    const cssGap = getComputedStyle(this.stage!)
      .getPropertyValue("--gall3ry-gap")
      .trim();
    const actualGap = cssGap ? parseFloat(cssGap) : this.options.gap || 28;
    this.STEP = this.CARD_W + actualGap;

    this.TRACK = this.items.length * this.STEP;

    this.items.forEach((it, i) => {
      it.x = i * this.STEP;
    });

    this.positions = new Float32Array(this.items.length);
  }

  private setupEventListeners(): void {
    if (this.stage) {
      this.stage.addEventListener("wheel", this.handleWheelBound as any, {
        passive: false,
      });
      this.stage.addEventListener("dragstart", this.handleDragStartBound);
      this.stage.addEventListener(
        "pointerdown",
        this.handlePointerDownBound as any,
      );
      this.stage.addEventListener(
        "pointermove",
        this.handlePointerMoveBound as any,
      );
      this.stage.addEventListener(
        "pointerup",
        this.handlePointerUpBound as any,
      );
    }
    window.addEventListener("resize", this.handleResizeBound);
    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChangeBound,
    );
  }

  private handleWheel(e: WheelEvent): void {
    if (this.isEntering) return;
    e.preventDefault();

    let delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const absDelta = Math.abs(delta);

    if (absDelta < this.options.wheelMinDelta) return;

    const sign = Math.sign(delta);
    delta = sign * Math.min(absDelta, this.options.wheelMaxDelta);

    if (!this.scrolling) {
      this.scrolling = true;
      this.emit("scrollStart");
    }

    this.vX +=
      delta * this.options.wheelSensitivity * this.options.wheelMultiplier;

    // User has interacted, pause auto-scroll
    this.userInteracted = true;
    this.resetAutoScrollResumeTimer();
  }

  private handleDragStart(e: Event): void {
    e.preventDefault();
  }

  private handlePointerDown(e: PointerEvent): void {
    if (this.isEntering) return;
    const target = e.target as HTMLElement;
    if (target.closest(".frame")) return;

    this.dragging = true;
    this.scrolling = true;
    this.emit("scrollStart");

    this.lastX = e.clientX;
    this.lastT = performance.now();
    this.lastDelta = 0;

    if (this.stage) {
      this.stage.setPointerCapture(e.pointerId);
      this.stage.classList.add("dragging");
    }

    // User has interacted, pause auto-scroll
    this.userInteracted = true;
    this.resetAutoScrollResumeTimer();
  }

  private handlePointerMove(e: PointerEvent): void {
    if (!this.dragging) return;

    const now = performance.now();
    const dx = e.clientX - this.lastX;
    const dt = Math.max(1, now - this.lastT) / 1000;

    this.SCROLL_X = this.mod(
      this.SCROLL_X - dx * this.options.dragSensitivity,
      this.TRACK,
    );

    const MAX_VELOCITY = 5000;
    this.lastDelta = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, dx / dt));
    this.lastX = e.clientX;
    this.lastT = now;
  }

  private handlePointerUp(e: PointerEvent): void {
    if (!this.dragging) return;
    this.dragging = false;

    if (this.stage) {
      this.stage.releasePointerCapture(e.pointerId);
      this.stage.classList.remove("dragging");
    }

    this.vX = -this.lastDelta * this.options.dragSensitivity;
  }

  private resetAutoScrollResumeTimer(): void {
    if (this.autoScrollResumeTimer !== null) {
      clearTimeout(this.autoScrollResumeTimer);
    }
    // Resume auto-scroll after 3 seconds of inactivity
    this.autoScrollResumeTimer = window.setTimeout(() => {
      this.userInteracted = false;
      this.autoScrollResumeTimer = null;
    }, 3000);
  }

  private handleResize(): void {
    const debounced = this.handleResizeBound as DebouncedFunction;
    clearTimeout(debounced._t);
    debounced._t = setTimeout(() => {
      const prevStep = this.STEP || 1;
      const ratio = this.SCROLL_X / (this.items.length * prevStep);
      this.measure();
      this.VW_HALF = window.innerWidth * 0.5;
      this.SCROLL_X = this.mod(ratio * this.TRACK, this.TRACK);
      this.updateCarouselTransforms();
    }, this.options.resizeDebounce);
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.stop();
    } else {
      this.start();
    }
  }

  private computeTransformComponents(screenX: number) {
    const norm = Math.max(-1, Math.min(1, screenX / this.VW_HALF));
    const absNorm = Math.abs(norm);
    const invNorm = 1 - absNorm;

    const ry = -norm * this.options.maxRotation;
    const tz = invNorm * this.options.maxDepth;
    const scale = this.options.minScale + invNorm * this.options.scaleRange;

    return { norm, absNorm, invNorm, ry, tz, scale };
  }

  private transformForScreenX(screenX: number): {
    transform: string;
    z: number;
  } {
    const { ry, tz, scale } = this.computeTransformComponents(screenX);
    return {
      transform: `translate3d(${screenX}px,-50%,${tz}px) rotateY(${ry}deg) scale(${scale})`,
      z: tz,
    };
  }

  private updateCarouselTransforms() {
    const half = this.TRACK / 2;
    let closestIdx = -1;
    let closestDist = Infinity;

    for (let i = 0; i < this.items.length; i++) {
      let pos = this.items[i].x - this.SCROLL_X;
      if (pos < -half) pos += this.TRACK;
      if (pos > half) pos -= this.TRACK;

      this.positions[i] = pos;

      const dist = Math.abs(pos);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }

    if (closestIdx !== this.activeIndex) {
      const direction = closestIdx > this.activeIndex ? "next" : "prev";
      this.activeIndex = closestIdx;
      this.emit("cardChange", { index: this.activeIndex, direction });
    }

    const prevIdx = (closestIdx - 1 + this.items.length) % this.items.length;
    const nextIdx = (closestIdx + 1) % this.items.length;

    for (let i = 0; i < this.items.length; i++) {
      const it = this.items[i];
      const pos = this.positions[i];
      const norm = Math.max(-1, Math.min(1, pos / this.VW_HALF));
      const { transform, z } = this.transformForScreenX(pos);

      it.el.style.transform = transform;
      it.el.style.zIndex = String(1000 + Math.round(z));

      const isCore = i === closestIdx || i === prevIdx || i === nextIdx;
      const blur = isCore
        ? 0
        : this.options.maxBlur *
          Math.pow(Math.abs(norm), this.options.exponent);
      it.el.style.filter = `blur(${blur.toFixed(2)}px)`;
    }
  }

  private preloadImageLinks(srcs: string[]): void {
    if (!document.head) return;
    srcs.forEach((href) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = href;
      link.fetchPriority = "high";
      document.head.appendChild(link);
    });
  }

  private waitForImages(): Promise<void[]> {
    const promises = this.items.map((it) => {
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

  private async decodeAllImages(): Promise<void> {
    const tasks = this.items.map(async (it) => {
      const img = it.el.querySelector("img") as HTMLImageElement | null;
      if (!img) return;
      if (typeof img.decode === "function") {
        try {
          await img.decode();
        } catch {}
      }
    });
    await Promise.allSettled(tasks);
  }

  private async warmupCompositing(): Promise<void> {
    const originalScrollX = this.SCROLL_X;
    const stepSize = this.STEP * this.options.compositingStepFactor;
    const numSteps = Math.ceil(this.TRACK / stepSize);

    for (let i = 0; i < numSteps; i++) {
      this.SCROLL_X = this.mod(originalScrollX + i * stepSize, this.TRACK);
      this.updateCarouselTransforms();

      if (i % this.options.compositingPaintInterval === 0) {
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
      }
    }

    this.SCROLL_X = originalScrollX;
    this.updateCarouselTransforms();
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
  }

  private getVisibleCards(): VisibleCard[] {
    const viewportWidth = window.innerWidth;
    const visibleCards: VisibleCard[] = [];
    const half = this.TRACK / 2;

    for (let i = 0; i < this.items.length; i++) {
      let pos = this.items[i].x - this.SCROLL_X;
      if (pos < -half) pos += this.TRACK;
      if (pos > half) pos -= this.TRACK;

      if (Math.abs(pos) < viewportWidth * this.options.viewportThreshold) {
        visibleCards.push({ item: this.items[i], screenX: pos, index: i });
      }
    }
    return visibleCards.sort((a, b) => a.screenX - b.screenX);
  }

  private async animateEntry(visibleCards: VisibleCard[]): Promise<void> {
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    const tl = gsap.timeline();

    visibleCards.forEach(({ item, screenX }, idx) => {
      const state = { p: 0 };
      const {
        ry,
        tz,
        scale: baseScale,
      } = this.computeTransformComponents(screenX);

      const START_SCALE = this.options.startScale;
      const START_Y = this.options.startY;

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
          duration: this.options.duration,
          ease: this.options.ease,
          onUpdate: () => {
            const t = state.p;
            const currentScale = START_SCALE + (baseScale - START_SCALE) * t;
            const currentY = START_Y * (1 - t);
            item.el.style.opacity = t.toFixed(3);

            if (t >= 0.999) {
              const { transform } = this.transformForScreenX(screenX);
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
        idx * this.options.stagger,
      );
    });

    await new Promise((resolve) => {
      tl.eventCallback("onComplete", resolve);
    });
  }
}
