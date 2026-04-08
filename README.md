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

HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Gallery</title>
</head>
<body>
  <section id="my-gallery"></section>
  
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

---

## 🎨 Styling

The gallery includes built-in styles that are automatically injected. The CSS is scoped with specific class names to avoid conflicts.

### CSS Classes

- `.ig-stage` - Main gallery container
- `.ig-cards` - Cards container
- `.ig-card` - Individual card element
- `.ig-card__img` - Card image element

You can customize the appearance by overriding these classes in your CSS.

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
