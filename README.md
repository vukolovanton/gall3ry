# Infinite 3D Gallery - NPM Package Plan

## 🎯 Package Concept

Transform the current infinite gradient 3D carousel into a reusable, installable npm package that developers can easily integrate into their projects.

**Package Name:** `@gall3ry/infinite-carousel` (suggested)

---

## 📦 Planned Public API

### Installation
```bash
npm install @gall3ry/infinite-carousel
# or
yarn add @gall3ry/infinite-carousel
# or
pnpm add @gall3ry/infinite-carousel
```

### Usage
```typescript
import { InfiniteGallery } from '@gall3ry/infinite-carousel';

// Initialize the gallery
const gallery = new InfiniteGallery({
  containerId: 'my-gallery-container',
  images: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    // ... more images
  ],
  options: {
    // Optional configuration
    friction: 0.9,
    wheelSensitivity: 0.6,
    // ... other config options
  }
});
```

### API Methods
```typescript
// Start/stop the carousel
gallery.start();
gallery.stop();

// Scroll to specific card
gallery.scrollTo(index: number);

// Get current state
gallery.getState(): { currentIndex: number, scrollPosition: number };

// Destroy and cleanup
gallery.destroy();
```

---

## 🏗️ Architecture Plan

### 1. Package Structure
```
@gall3ry/infinite-carousel/
├── src/
│   ├── index.ts              # Main entry point, exports public API
│   ├── InfiniteGallery.ts    # Main class with gallery logic
│   ├── types.ts              # TypeScript type definitions
│   ├── config.ts             # Default configuration
│   ├── utils/
│   │   ├── mod.ts           # Utility functions
│   │   ├── transforms.ts    # 3D transform calculations
│   │   └── events.ts        # Event handling
│   ├── carousel/
│   │   ├── createCards.ts   # Card creation logic
│   │   ├── transforms.ts    # Transform updates
│   │   └── animation.ts     # Animation loop
│   └── styles/
│       └── index.css        # Package styles (bundled)
├── dist/                     # Build output (gitignored)
├── examples/
│   ├── basic/
│   │   ├── index.html
│   │   └── main.ts
│   └── advanced/
│       ├── index.html
│       └── main.ts
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### 2. Core Classes

#### `InfiniteGallery` Class
```typescript
class InfiniteGallery {
  constructor(config: GalleryConfig);
  
  // Lifecycle
  initialize(): Promise<void>;
  destroy(): void;
  
  // Control
  start(): void;
  stop(): void;
  scrollTo(index: number, animate?: boolean): void;
  
  // State
  getState(): GalleryState;
  
  // Events
  on(event: GalleryEvent, callback: Function): void;
  off(event: GalleryEvent, callback: Function): void;
}
```

### 3. Type Definitions
```typescript
// types.ts
export interface GalleryConfig {
  containerId: string;
  images: string[];
  options?: Partial<GalleryOptions>;
}

export interface GalleryOptions {
  // Physics
  friction: number;
  wheelSensitivity: number;
  dragSensitivity: number;
  
  // Visuals
  maxRotation: number;
  maxDepth: number;
  minScale: number;
  scaleRange: number;
  gap: number;
  
  // Blur
  maxBlur: number;
  blurExponent: number;
  
  // Animation
  entryAnimation: {
    enabled: boolean;
    duration: number;
    stagger: number;
    ease: string;
  };
  
  // Performance
  viewportThreshold: number;
  resizeDebounce: number;
}

export interface GalleryState {
  currentIndex: number;
  scrollPosition: number;
  isAnimating: boolean;
  isDragging: boolean;
}

export type GalleryEvent = 
  | 'ready' 
  | 'cardChange' 
  | 'scrollStart' 
  | 'scrollEnd'
  | 'destroy';
```

---

## 📋 Development Roadmap

### Phase 1: Code Refactoring (Week 1-2)
- [ ] Extract `InfiniteGallery` class from current `main.ts`
- [ ] Separate concerns into modules (carousel, utils, events)
- [ ] Create proper TypeScript interfaces
- [ ] Remove HTML coupling (container should be provided, not hardcoded)
- [ ] Make styles injectable or bundled
- [ ] Remove hardcoded selectors
- [ ] Remove debug console.log statements

### Phase 2: Package Setup (Week 2-3)
- [ ] Update `package.json` for npm package
- [ ] Configure build process (Vite/ Rollup)
- [ ] Set up TypeScript configuration for library mode
- [ ] Configure CSS bundling
- [ ] Set up proper exports (ESM, CJS, UMD)
- [ ] Create package entry points

### Phase 3: Build System (Week 3)
- [ ] Configure Vite for library build
- [ ] Generate type definitions (.d.ts)
- [ ] Bundle CSS (option to include or exclude)
- [ ] Set up source maps
- [ ] Configure tree-shaking for optimal bundle size
- [ ] Test build output

### Phase 4: Documentation & Examples (Week 3-4)
- [ ] Write comprehensive README
- [ ] Create basic usage example
- [ ] Create advanced usage example
- [ ] Add JSDoc comments to all public APIs
- [ ] Create interactive demo (Storybook or similar)
- [ ] Add API reference documentation

### Phase 5: Testing (Week 4)
- [ ] Set up testing framework (Vitest)
- [ ] Write unit tests for core functions
- [ ] Write integration tests for gallery lifecycle
- [ ] Test in different browsers
- [ ] Test bundle size
- [ ] Performance testing

### Phase 6: Publishing (Week 5)
- [ ] Choose package name and register on npm
- [ ] Configure CI/CD (GitHub Actions)
- [ ] Automated testing on PRs
- [ ] Automated publishing on version tags
- [ ] Create CHANGELOG.md
- [ ] Set up semantic versioning
- [ ] Publish version 1.0.0

---

## 🛠️ Technical Decisions

### Build Tool
**Choice: Vite**
- Fast, modern build tool
- Already used in the project
- Excellent library mode support
- Built-in TypeScript support
- Good CSS handling

### Module Formats
**Support: ESM (primary), CJS (secondary)**
- ESM for modern bundlers and browsers
- CJS for Node.js compatibility
- Tree-shaking support for optimal bundle size

### Dependencies Management
**GSAP as peer dependency**
```json
{
  "peerDependencies": {
    "gsap": "^3.14.0"
  },
  "devDependencies": {
    "gsap": "^3.14.0"
  }
}
```

**Reasoning:** 
- Keeps package size smaller
- Allows users to control GSAP version
- Prevents duplicate GSAP instances

### CSS Strategy
**Two options:**

**Option A: Bundled CSS (Recommended)**
- CSS bundled with JS
- Automatically injected on initialization
- Simplest for users
- Can opt-out with configuration

**Option B: Separate CSS file**
- User must import CSS separately
- More control for advanced users
- Smaller JS bundle
- Requires additional import

**Decision:** Option A (bundled) with opt-out capability

### TypeScript Support
- Full type definitions included
- Exported as `.d.ts` files
- Strict type checking enabled
- Public APIs fully typed

---

## 📝 Package.json Configuration

```json
{
  "name": "@gall3ry/infinite-carousel",
  "version": "1.0.0",
  "description": "A smooth, infinite-scrolling 3D carousel with dynamic gradient backgrounds",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./style.css": "./dist/style.css"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "keywords": [
    "carousel",
    "gallery",
    "3d",
    "infinite-scroll",
    "gsap",
    "animation",
    "typescript"
  ],
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/gall3ry.git"
  },
  "peerDependencies": {
    "gsap": "^3.14.0"
  },
  "devDependencies": {
    "typescript": "~6.0.2",
    "vite": "^8.0.4",
    "gsap": "^3.14.2",
    "vitest": "^2.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build && tsc --emitDeclarationOnly",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "preview": "vite preview",
    "lint": "eslint src",
    "format": "prettier --write src"
  }
}
```

---

## 🎨 Styling Strategy

### CSS Scoping
- Use BEM-like naming: `.ig-card`, `.ig-stage`, etc.
- Prefix with `ig-` (Infinite Gallery) to avoid conflicts
- Make styles customizable via CSS variables

### CSS Variables
```css
:root {
  --ig-perspective: 1800px;
  --ig-card-width: 360px;
  --ig-card-aspect-ratio: 4/5;
  --ig-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --ig-bg: #f0f0f0;
  --ig-fg: #0b0b0b;
}
```

### Customization
```typescript
const gallery = new InfiniteGallery({
  containerId: 'gallery',
  images: [...],
  options: {
    cssVariables: {
      '--ig-card-width': '400px',
      '--ig-bg': '#000000'
    }
  }
});
```

---

## 🧪 Testing Strategy

### Unit Tests
- Utility functions (mod, transforms)
- Configuration validation
- State management
- Event handling

### Integration Tests
- Gallery initialization
- Card creation and rendering
- Scroll behavior
- Animation lifecycle
- Cleanup/destruction

### Visual Regression Tests
- Snapshot testing with Playwright
- Compare renders across browsers
- Test responsive behavior

### Performance Tests
- Bundle size monitoring
- FPS during scrolling
- Memory usage
- Load time

---

## 📊 Bundle Size Targets

- **Minified JS:** < 15 KB (gzip)
- **CSS:** < 5 KB (gzip)
- **Total:** < 20 KB (gzip, excluding GSAP)

---

## 🚀 Future Enhancements

### Version 2.0 Ideas
- [ ] Support for different card types (video, HTML content)
- [ ] Custom transitions/effects
- [ ] Touch gestures (swipe, pinch)
- [ ] Keyboard navigation
- [ ] Accessibility improvements (ARIA, keyboard, screen reader)
- [ ] React/Vue/Angular wrapper components
- [ ] Plugin system for extensions
- [ ] Theme presets
- [ ] Lazy loading for large image sets
- [ ] Virtual scrolling for 100+ images

---

## 🤝 Contributing

Once published, contribution guidelines:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support

- GitHub Issues: [Report bugs or request features]
- Documentation: [Link to documentation site]
- Examples: [Link to examples directory]

---

## ✅ Migration from Current Project

### Steps to Convert
1. Create new branch: `feature/npm-package`
2. Restructure code as per architecture plan
3. Implement `InfiniteGallery` class
4. Add TypeScript types
5. Configure build system
6. Write tests
7. Create examples
8. Document API
9. Publish to npm

### Breaking Changes for Users
- Replace manual script inclusion with npm install
- Update initialization code to use new API
- Import styles if not bundling

---

## 🎯 Success Metrics

- Package downloads (> 1000/month in first year)
- GitHub stars (> 100)
- Active issues/PRs
- Bundle size meets targets
- Test coverage > 80%
- Positive user feedback

---

*Last Updated: 2025-01-18*