# gall3ry

<div align="center">

![gall3ry](https://img.shields.io/npm/v/gall3ry)
![License](https://img.shields.io/npm/l/gall3ry)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Size](https://img.shields.io/bundlephobia/minzip/gall3ry)

*A smooth, infinite-scrolling 3D carousel gallery with beautiful animations*

[Demo](#demo) • [Installation](#installation) • [Usage](#usage) • [API](#api) • [Options](#options)

</div>

---

## ✨ Features

- 🎨 **Stunning 3D Transforms** - Smooth perspective-based card rotations and depth effects
- ♾️ **Infinite Scrolling** - Seamlessly loop through images with physics-based momentum
- ⚡ **Performance Optimized** - Efficient rendering with viewport-based card visibility
- 🎯 **Touch & Mouse Support** - Smooth dragging and wheel scrolling
- 📱 **Responsive Design** - Adapts to any screen size
- 🎭 **Blur Effects** - Dynamic blur for out-of-focus cards
- ⚙️ **Highly Customizable** - Extensive configuration options
- 📦 **TypeScript Support** - Full type definitions included
- 🌙 **Lightweight** - ~13KB minified (3.5KB gzipped)

---

## 🙏 Acknowledgments

This project is based on the excellent work by **[Clément Grellier](https://github.com/clementgrellier)** and his [GradientSlider](https://github.com/clementgrellier/gradientslider) project. Thank you for the inspiration and foundation!

---

## 📦 Installation

```bash
# npm
npm install gall3ry

# yarn
yarn add gall3ry

# pnpm
pnpm add gall3ry
```

**Required Peer Dependency:**

gall3ry requires **GSAP** as a peer dependency. Install it separately:

```bash
npm install gsap
```

---

## 🚀 Quick Start

```typescript
import { InfiniteGallery } from 'gall3ry';

const gallery = new InfiniteGallery({
  containerId: 'my-gallery',
  images: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg',
  ],
  options: {
    friction: 0.9,
    maxRotation: 28,
    gap: 28,
  },
});

// Initialize the gallery
await gallery.initialize();
```

HTML (the only thing you need!):

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Gallery</title>
</head>
<body>
  <!-- Just provide a div with an ID - the library handles the rest -->
  <div id="my-gallery"></div>
  
  <script type="module">
    import { InfiniteGallery } from 'gall3ry';
    
    const gallery = new InfiniteGallery({
      containerId: 'my-gallery',
      images: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
    });
    
    await gallery.initialize();
  </script>
</body>
</html>
```

**That's it!** The library automatically creates all necessary internal structure (stage wrapper, cards container, etc.) inside your div. You don't need to worry about the internal HTML structure - just provide a container element with an ID.

---

## 💻 Usage Examples

### Basic Example

```typescript
import { InfiniteGallery } from 'gall3ry';

const gallery = new InfiniteGallery({
  containerId: 'gallery',
  images: [
    '/images/photo1.jpg',
    '/images/photo2.jpg',
    '/images/photo3.jpg',
  ],
});

await gallery.initialize();
```

### With Event Listeners

```typescript
const gallery = new InfiniteGallery({
  containerId: 'gallery',
  images: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
});

// Listen for when the gallery is ready
gallery.on('ready', () => {
  console.log('Gallery is ready!');
});

// Listen for card changes
gallery.on('cardChange', (data) => {
  console.log(`Active card: ${data.index}, Direction: ${data.direction}`);
});

// Listen for user interactions
gallery.on('scrollStart', () => {
  console.log('User started scrolling');
});

gallery.on('scrollEnd', () => {
  console.log('User stopped scrolling');
});

await gallery.initialize();
```

### Programmatic Control

```typescript
const gallery = new InfiniteGallery({
  containerId: 'gallery',
  images: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
});

await gallery.initialize();

// Scroll to a specific card (0-indexed)
gallery.scrollTo(2, true); // true = animate

// Get current state
const state = gallery.getState();
console.log('Current index:', state.currentIndex);
console.log('Scroll position:', state.scrollX);
console.log('Velocity:', state.velocity);
console.log('Is dragging:', state.isDragging);

// Stop/start the gallery
gallery.stop();
// ... do something ...
gallery.start();

// Cleanup when done
gallery.destroy();
```

### With Custom Options

```typescript
const gallery = new InfiniteGallery({
  containerId: 'gallery',
  images: ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg'],
  options: {
    // Physics
    friction: 0.95,              // How quickly momentum decays (0-1)
    wheelSensitivity: 0.5,       // Mouse wheel sensitivity
    dragSensitivity: 1.0,        // Touch/drag sensitivity
    minVelocityThreshold: 0.02,  // Minimum velocity to keep scrolling
    
    // Visuals
    maxRotation: 35,             // Maximum card rotation in degrees
    maxDepth: 150,               // Maximum z-axis depth
    minScale: 0.9,               // Minimum scale for distant cards
    scaleRange: 0.15,            // Scale variation range
    gap: 40,                     // Gap between cards in pixels
    
    // Blur
    maxBlur: 3,                  // Maximum blur for distant cards
    exponent: 1.2,               // Blur curve exponent
    
    // Animation
    duration: 0.8,               // Entry animation duration
    stagger: 0.08,               // Stagger between cards
    ease: 'power3.out',          // Easing function
    
    // Performance
    viewportThreshold: 0.6,      // Cards outside viewport are hidden
    resizeDebounce: 100,         // Debounce resize events (ms)
  },
});

await gallery.initialize();
```

### With Auto-Scroll

Enable automatic slow scrolling that pauses when the user interacts:

```typescript
const gallery = new InfiniteGallery({
  containerId: 'gallery',
  images: ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg'],
  options: {
    // Enable auto-scroll
    autoScrollEnabled: true,     // Enable automatic scrolling
    autoScrollSpeed: 20,         // Speed in pixels/second (slow)
    
    // Other options
    friction: 0.9,
    gap: 28,
  },
});

await gallery.initialize();

// Auto-scroll behavior:
// - Gallery scrolls slowly to the right continuously
// - Pauses when user scrolls with wheel or drags
// - Resumes after 3 seconds of inactivity
// - Works seamlessly with manual navigation
```

---

## 📖 API Reference

### Constructor

```typescript
new InfiniteGallery(config: GalleryConfig)
```

**Parameters:**

- `config.containerId` (`string`) - ID of the HTML element to contain the gallery
- `config.images` (`string[]`) - Array of image URLs
- `config.options?` (`Partial<GalleryOptions>`) - Optional configuration options

### Methods

#### `initialize()`

Initialize and start the gallery with entry animation.

```typescript
await gallery.initialize(): Promise<void>
```

#### `destroy()`

Clean up and remove the gallery from the DOM.

```typescript
gallery.destroy(): void
```

#### `start()`

Resume animation and physics.

```typescript
gallery.start(): void
```

#### `stop()`

Pause animation and physics.

```typescript
gallery.stop(): void
```

#### `scrollTo(index, animate?)`

Scroll to a specific card.

```typescript
gallery.scrollTo(index: number, animate: boolean = true): void
```

**Parameters:**

- `index` - Card index (0-based)
- `animate` - Whether to animate the scroll (default: `true`)

#### `getState()`

Get the current state of the gallery.

```typescript
gallery.getState(): GalleryState
```

**Returns:**

```typescript
{
  currentIndex: number,    // Currently active card index
  scrollX: number,         // Current scroll position
  velocity: number,        // Current velocity
  isDragging: boolean,     // Whether user is dragging
  isAnimating: boolean,    // Whether gallery is animating
}
```

#### `on(event, callback)`

Add an event listener.

```typescript
gallery.on(event: GalleryEvent, callback: Function): void
```

**Events:**

- `'ready'` - Gallery is fully initialized and animated in
- `'cardChange'` - Active card changed
- `'scrollStart'` - User started interacting
- `'destroy'` - Gallery was destroyed

#### `off(event, callback)`

Remove an event listener.

```typescript
gallery.off(event: GalleryEvent, callback: Function): void
```

---

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| **Physics** | | | |
| `friction` | `number` | `0.9` | How quickly momentum decays (0-1) |
| `wheelSensitivity` | `number` | `0.6` | Mouse wheel scroll sensitivity |
| `wheelMaxDelta` | `number` | `50` | Maximum wheel delta per event |
| `wheelMinDelta` | `number` | `1` | Minimum wheel delta to trigger scroll |
| `dragSensitivity` | `number` | `1.0` | Touch/drag sensitivity |
| `minVelocityThreshold` | `number` | `0.02` | Minimum velocity to keep scrolling |
| `frictionDecayBase` | `number` | `60` | Base for friction decay calculation |
| **Visuals** | | | |
| `maxRotation` | `number` | `28` | Maximum card rotation in degrees |
| `maxDepth` | `number` | `140` | Maximum z-axis depth for cards |
| `minScale` | `number` | `0.92` | Minimum scale for distant cards |
| `scaleRange` | `number` | `0.1` | Scale variation range |
| `gap` | `number` | `28` | Gap between cards in pixels |
| **Blur** | | | |
| `maxBlur` | `number` | `2` | Maximum blur for distant cards (px) |
| `exponent` | `number` | `1.1` | Blur curve exponent |
| **Animation** | | | |
| `startScale` | `number` | `0.92` | Starting scale for entry animation |
| `startY` | `number` | `40` | Starting Y position for entry animation |
| `duration` | `number` | `0.6` | Entry animation duration (seconds) |
| `stagger` | `number` | `0.05` | Stagger between cards during entry |
| `ease` | `string` | `'power3.out'` | GSAP easing function |
| **Performance** | | | |
| `viewportThreshold` | `number` | `0.6` | Cards outside viewport are hidden (0-1) |
| `resizeDebounce` | `number` | `80` | Debounce resize events (ms) |
| `compositingStepFactor` | `number` | `0.5` | Factor for compositing warmup |
| `compositingPaintInterval` | `number` | `3` | Paint interval for compositing warmup |
| **Auto-Scroll** | | | |
| `autoScrollEnabled` | `boolean` | `false` | Enable automatic slow scrolling |
| `autoScrollSpeed` | `number` | `20` | Auto-scroll speed in pixels/second |

---

## 🎨 Styling

The library includes built-in styles that are **automatically injected** when you import the package. You don't need to include any separate CSS file - the styles are bundled with the JavaScript.

The CSS uses specific class names and CSS custom properties that you can override for customization.

**Important**: The library does NOT include global resets (like `* { box-sizing: border-box; }`). These styles are scoped to the gallery only and won't affect your page.

### HTML Structure Created by Library

When you initialize the gallery, the library automatically creates this structure inside your container:

```html
<!-- Your container (you provide this) -->
<div id="my-gallery">
  <!-- Library creates this structure automatically -->
  <div class="stage carousel-mode">
    <section class="gall3ry-cards" aria-label="Infinite carousel of images">
      <!-- Cards created by the library -->
      <article class="gall3ry-card">
        <img class="gall3ry-card__img" src="..." alt="" />
      </article>
      <article class="gall3ry-card">
        <img class="gall3ry-card__img" src="..." alt="" />
      </article>
      <!-- ... more cards ... -->
    </section>
  </div>
</div>
```

### CSS Classes Created by Library

- `.stage` - Stage wrapper (auto-created)
- `.carousel-mode` - Added to stage when gallery is active
- `.gall3ry-cards` - Cards container (auto-created)
- `.gall3ry-card` - Individual card element
- `.gall3ry-card__img` - Card image element

You can customize the appearance by overriding these classes and the CSS custom properties in your CSS.
### CSS Custom Properties

You can customize the gallery appearance by overriding these CSS custom properties:

```css
:root {
    /* 3D perspective and animation settings */
    --gall3ry-perspective: 1800px;
    --gall3ry-ease: cubic-bezier(0.22, 1, 0.36, 1);

    /* Stage settings */
    --gall3ry-stage-height: 100vh;

    /* Card settings */
    --gall3ry-card-width: min(26vw, 360px);
    --gall3ry-card-aspect-ratio: 1/1;
    --gall3ry-card-transform-origin: 90% center;
}
```

### Customization Methods

#### Method 1: CSS Custom Properties (Recommended)

Override CSS variables in your stylesheet:

```css
/* Change card dimensions */
:root {
    --gall3ry-card-width: min(30vw, 400px);
    --gall3ry-card-aspect-ratio: 4/5;  /* Portrait cards */
    --gall3ry-card-border-radius: 20px;
    --gall3ry-stage-height: 80vh;
}

/* Or target a specific gallery */
#my-gallery {
    --gall3ry-card-width: 300px;
    --gall3ry-card-aspect-ratio: 16/9;  /* Landscape cards */
}
```

#### Method 2: JavaScript Configuration

Set styling options when creating the gallery:

```typescript
const gallery = new InfiniteGallery({
  containerId: 'my-gallery',
  images: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
  options: {
    // Card styling
    cardWidth: '300px',
    cardAspectRatio: '4/5',
    cardBorderRadius: '20px',
    cardTransformOrigin: '50% center',
    
    // Stage styling
    stageHeight: '80vh',
    
    // Physics (existing options)
    friction: 0.9,
    maxRotation: 28,
    gap: 28,
  },
});
```

#### Method 3: Override CSS Classes

For more advanced customization, override the CSS classes:

```css
/* Override card styles */
.gall3ry-card {
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.gall3ry-card__img {
    border: 2px solid white;
    filter: brightness(1.1);
}

/* Override stage styles */
.gall3ry-stage {
    background: #1a1a2e;
}
```

### Available Styling Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| **CSS Variables** | | | |
| `--gall3ry-card-width` | CSS | `min(26vw, 360px)` | Card width |
| `--gall3ry-card-aspect-ratio` | CSS | `1/1` | Card aspect ratio (width/height) |
| `--gall3ry-card-transform-origin` | CSS | `90% center` | Transform origin point |
| `--gall3ry-stage-height` | CSS | `100vh` | Stage container height |
| `--gall3ry-perspective` | CSS | `1800px` | 3D perspective depth |
| `--gall3ry-ease` | CSS | `cubic-bezier(0.22, 1, 0.36, 1)` | Animation easing |
| **JS Options** | | | |
| `cardWidth` | String | `"min(26vw, 360px)"` | Card width |
| `cardAspectRatio` | String | `"1/1"` | Card aspect ratio |
| `cardBorderRadius` | String | `"15px"` | Card border radius |
| `cardTransformOrigin` | String | `"90% center"` | Transform origin |
| `stageHeight` | String | `"100vh"` | Stage height |

---

## 🔧 Development

```bash
# Install dependencies
npm install

# Run the demo
npm run dev

# Build the library
npm run build

# Build only TypeScript declarations
npm run build:types

# Preview the demo build
npm run preview
```

---

## 📝 License

MIT © [Your Name]

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](../../issues).

---

## 🙏 Credits

This project is based on the excellent [GradientSlider](https://github.com/clementgrellier/gradientslider) by [Clément Grellier](https://github.com/clementgrellier). Thank you for the amazing work and inspiration!

---

## 📄 Package Details

- **Package:** `gall3ry`
- **Version:** 0.0.0
- **License:** MIT
- **TypeScript:** Full support
- **Bundle Size:** ~13KB minified (3.5KB gzipped)
- **Dependencies:** GSAP (peer dependency)

---
