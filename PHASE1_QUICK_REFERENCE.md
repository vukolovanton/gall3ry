# Phase 1: Code Refactoring - Quick Reference

## 🎯 Objective
Transform monolithic `main.ts` (~800 lines) into modular, reusable npm package structure.

---

## 📁 New File Structure
```
src/
├── index.ts                  # Main entry point, exports public API
├── InfiniteGallery.ts        # Core class (NEW)
├── types.ts                  # TypeScript interfaces (NEW)
├── config.ts                 # Default configuration (NEW)
├── utils/
│   ├── mod.ts               # Math utilities (NEW)
│   ├── transforms.ts        # 3D transform calculations (NEW)
│   └── events.ts            # Event handling utilities (NEW)
├── carousel/
│   ├── createCards.ts       # Card creation logic (NEW)
│   ├── transforms.ts        # Transform updates (NEW)
│   ├── animation.ts         # Animation loop (NEW)
│   ├── images.ts            # Image loading (NEW)
│   └── measure.ts           # Layout measurements (NEW)
└── styles/
    ├── index.css            # Namespaced styles (REFACTOR)
    └── injector.ts          # Style injection utility (NEW)
```

---

## ⚡ 16 Implementation Steps

| # | Step | File | Time | Priority |
|---|------|------|------|----------|
| 1 | Create TypeScript Type Definitions | `types.ts` | 1-2h | 🔴 Critical |
| 2 | Create Default Configuration | `config.ts` | 30m | 🔴 Critical |
| 3 | Extract Utility Functions | `utils/mod.ts` | 15m | 🟡 High |
| 4 | Extract Transform Utilities | `utils/transforms.ts` | 1h | 🔴 Critical |
| 5 | Extract Event Handling | `utils/events.ts` | 1h | 🟡 High |
| 6 | Create Card Creation Module | `carousel/createCards.ts` | 2h | 🔴 Critical |
| 7 | Create Transform Update Module | `carousel/transforms.ts` | 2h | 🔴 Critical |
| 8 | Create Animation Module | `carousel/animation.ts` | 2.5h | 🔴 Critical |
| 9 | Create Image Loading Module | `carousel/images.ts` | 1.5h | 🟡 High |
| 10 | Create Measurement Module | `carousel/measure.ts` | 1h | 🔴 Critical |
| 11 | Create Main InfiniteGallery Class | `InfiniteGallery.ts` | 4-5h | 🔴 Critical |
| 12 | Create Main Entry Point | `index.ts` | 30m | 🟡 High |
| 13 | Refactor Styles | `styles/index.css` | 1h | 🟡 High |
| 14 | Create Style Injection Utility | `styles/injector.ts` | 45m | 🟡 High |
| 15 | Update Example | `examples/basic/main.ts` | 1.5h | 🟢 Medium |
| 16 | Create Migration Guide | `MIGRATION.md` | 1h | 🟢 Medium |

**Total Time**: 20-24 hours

---

## 🔄 API Changes

### Before (Current)
```typescript
// Hardcoded in main.ts
import img01 from "./assets/img01.webp";
// ... more imports

const CONFIG = {
  images: [img01, img02, ...],
  selectors: {
    stage: ".stage",
    cards: "cards",
  },
  // ... config
};

// Initialize automatically
init();

// Global functions
destroy();
```

### After (New Package)
```typescript
import { InfiniteGallery } from '@gall3ry/infinite-carousel';

// Configuration is provided
const gallery = new InfiniteGallery({
  containerId: 'my-gallery',  // Any ID you want
  images: [                    // Any URLs you want
    'https://example.com/img1.jpg',
    'https://example.com/img2.jpg',
  ],
  options: {
    friction: 0.9,
    wheelSensitivity: 0.6,
    // ... custom options
  }
});

// Explicit initialization
await gallery.initialize();

// Event listeners
gallery.on('cardChange', (data) => {
  console.log('Current card:', data);
});

// Cleanup
gallery.destroy();
```

---

## 📦 Public API

### Constructor
```typescript
new InfiniteGallery(config: GalleryConfig)
```

### Methods
| Method | Returns | Description |
|--------|---------|-------------|
| `initialize()` | `Promise<void>` | Initialize gallery and load images |
| `destroy()` | `void` | Clean up and remove event listeners |
| `start()` | `void` | Start animation loop |
| `stop()` | `void` | Stop animation loop |
| `scrollTo(index, animate?)` | `void` | Scroll to specific card |
| `getState()` | `GalleryState` | Get current gallery state |
| `on(event, callback)` | `void` | Add event listener |
| `off(event, callback)` | `void` | Remove event listener |

### Events
| Event | Payload | Fired When |
|-------|---------|------------|
| `ready` | - | Gallery is fully initialized |
| `cardChange` | `{ index, direction }` | Active card changes |
| `scrollStart` | - | User starts scrolling |
| `scrollEnd` | - | Scrolling stops |
| `destroy` | - | Gallery is destroyed |

---

## 🎨 CSS Namespace Changes

| Old Class | New Class |
|-----------|-----------|
| `.stage` | `.ig-stage` |
| `.cards` | `.ig-cards` |
| `.card` | `.ig-card` |
| `.card img` | `.ig-card img` |

### CSS Variables
```css
--ig-perspective: 1800px;
--ig-card-width: 360px;
--ig-card-aspect-ratio: 4/5;
--ig-ease: cubic-bezier(0.22, 1, 0.36, 1);
--ig-bg: #f0f0f0;
--ig-fg: #0b0b0b;
```

---

## ✅ Validation Checklist

- [ ] All code is TypeScript
- [ ] No `console.log` statements
- [ ] No hardcoded selectors
- [ ] No hardcoded image imports
- [ ] All functions have JSDoc
- [ ] CSS uses `ig-` prefix
- [ ] Styles can be injected
- [ ] Full public API implemented
- [ ] Event system works
- [ ] Can initialize/destroy
- [ ] Example works in browser
- [ ] No TypeScript errors

---

## 🚨 Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| State loss with `this` | Use arrow functions for callbacks |
| Memory leaks | Remove all listeners in `destroy()` |
| CSS selector conflicts | Use consistent `ig-` prefix |
| GSAP animation issues | Kill all tweens in `destroy()` |
| Image loading races | Use Promise.all with timeout |

---

## 📅 Week 1-2 Schedule

**Week 1 (Days 1-3): Foundation**
- Day 1: Steps 1-3 (Types, Config, Utils)
- Day 2: Steps 4-6 (Transforms, Events, Cards)
- Day 3: Steps 7-9 (Transforms, Animation, Images)

**Week 1 (Days 4-5): Core Class**
- Day 4: Steps 10-11 (Measurement, Main Class)
- Day 5: Step 12 + Testing

**Week 2 (Days 6-7): Polish**
- Day 6: Steps 13-14 (Styles, Injector)
- Day 7: Steps 15-16 (Examples, Docs)

---

## 🎯 Success Criteria

1. **Modularity**: Each file has single responsibility
2. **Reusability**: No coupling to specific HTML
3. **Type Safety**: Full TypeScript coverage
4. **Documentation**: All public APIs documented
5. **API Compatibility**: Matches planned public API
6. **No Debug Code**: All console.log removed
7. **Working Example**: Demo runs successfully

---

## 📚 Related Files

- `PHASE1_DETAILED_PLAN.md` - Comprehensive implementation guide
- `README.md` - Original package plan
- `src/main.ts` - Current monolithic implementation

---

*Quick Reference created: 2025-01-18*
*Status: Ready for Implementation*