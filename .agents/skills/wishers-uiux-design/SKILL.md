---
name: wishers-uiux-design
description: UI/UX design system and visual guidelines for the WISHERS ETHGlobal Lisbon 2026 project. Use this skill when building any frontend component, page layout, or interactive element. All React components MUST follow these design tokens, color palettes, typography, spacing, and animation standards.
---

# WISHERS — UI/UX Design System & Visual Guidelines

## Design Philosophy

WISHERS is a **premium DeFi product**, not a developer tool. The UI must feel like a luxury fintech app — think Revolut meets a sci-fi command center. Every pixel should communicate trust, intelligence, and elegance.

**Three Pillars:**
1. **Calm Authority** — Dark theme with strategic accent colors. Users are trusting us with money; the UI must feel stable and confident, not flashy or chaotic.
2. **Intelligent Simplicity** — Complex DeFi logic hidden behind a conversational chat interface. No jargon-heavy forms.
3. **Living Feedback** — Micro-animations and state transitions that make the app feel alive and responsive. The Agent should feel like it's "breathing."

## Color Palette — Silver & Ice Blue

Use CSS custom properties defined in `:root`. Never hardcode hex values in components.

The palette is inspired by **moonlight on frost** — silver highlights with ice-blue accents against a deep-space dark background. This creates a feeling of precision, trust, and futurism.

```css
:root {
  /* ── Base (Dark Theme) ── */
  --color-bg-primary:    #0A0B0F;     /* Deep space black */
  --color-bg-secondary:  #12141C;     /* Card backgrounds */
  --color-bg-tertiary:   #1A1D2B;     /* Elevated surfaces (modals, dropdowns) */
  --color-bg-hover:      #222639;     /* Hover states on cards */

  /* ── Text ── */
  --color-text-primary:   #F0F2F5;    /* Primary body text */
  --color-text-secondary: #8B8FA3;    /* Labels, placeholders, muted text */
  --color-text-tertiary:  #5A5E73;    /* Disabled text */

  /* ── Accent (Silver & Ice Blue) ── */
  --color-accent-primary:   #38BDF8;  /* Ice Blue — buttons, active badges, focus rings */
  --color-accent-glow:      #E0E7FF;  /* Silver white — glows, star sparkles, premium highlights */
  --color-accent-gradient:  linear-gradient(135deg, #E0E7FF 0%, #38BDF8 50%, #0284C7 100%);

  /* ── Semantic ── */
  --color-success:   #00D68F;  /* Wish fulfilled, tx confirmed */
  --color-warning:   #FFAA00;  /* Pending, monitoring active */
  --color-danger:    #FF4757;  /* Rug alert, error, shield triggered */
  --color-info:      #38BDF8;  /* Informational badges */

  /* ── Borders & Dividers ── */
  --color-border:        rgba(255, 255, 255, 0.08);
  --color-border-active: rgba(56, 189, 248, 0.4); /* Ice blue glow on focus/hover */

  /* ── Glass Effect ── */
  --glass-bg:       rgba(18, 20, 28, 0.72);
  --glass-blur:     16px;
}
```

### Accent Usage Guide

| Accent Token | Hex | Usage |
|---|---|---|
| `--color-accent-primary` | `#38BDF8` | CTA buttons, focused borders, breathing dots, interactive highlights |
| `--color-accent-glow` | `#E0E7FF` | Star sparkle effects, light glows on hands, premium silvery highlights |
| `--color-accent-gradient` | Silver → Ice Blue → Deep Blue | Button fills, brand text gradient fill, header logo text |

> **CRITICAL:** The old purple palette (`#6C5CE7`, `#A78BFA`, `#C4B5FD`) is **DEPRECATED**. All components MUST use Silver & Ice Blue tokens exclusively.

## Typography

Use **Inter** from Google Fonts. It's the industry standard for fintech and Web3 dashboards.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root {
  --font-family:   'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  /* ── Scale ── */
  --text-xs:    0.6875rem; /* 11px — Badges, captions, muted labels */
  --text-sm:    0.8125rem; /* 13px — Secondary labels, card body text */
  --text-base:  0.9375rem; /* 15px — Body text, section titles */
  --text-lg:    1.125rem;  /* 18px — Header brand name, subheadings */
  --text-xl:    1.25rem;   /* 20px — Primary heading */

  /* ── Weights ── */
  --font-normal:    400;
  --font-medium:    500;
  --font-semibold:  600;
  --font-bold:      700;
  --font-extrabold: 800;
}

body {
  font-family: var(--font-family);
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  overflow-x: hidden;
}
```

## Spacing & Layout

```css
:root {
  --space-1:  0.25rem;  /* 4px */
  --space-2:  0.5rem;   /* 8px */
  --space-3:  0.75rem;  /* 12px */
  --space-4:  1rem;     /* 16px */
  --space-5:  1.25rem;  /* 20px */
  --space-6:  1.5rem;   /* 24px */
  --space-8:  2rem;     /* 32px */
  --space-10: 2.5rem;   /* 40px */

  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   20px;
  --radius-full: 9999px;
}
```

### Layout Widths

| Zone | Max-Width | Purpose |
|---|---|---|
| **Header Banner** | `100%` (viewport width) | Sticky top bar with logo + agent status, full-bleed glassmorphism |
| **Auth Cards** | `540px` centered | Wallet Connect + World ID cards |
| **Praying Hands** | `800px` centered | Full width for hand images + central Wish Chat portal |
| **Post-Wish Content** | `540px` centered | WishingWell confirmation, Active Wish cards |

## Core Component Patterns

### 1. Header Banner (Sticky, Full-Width)

The top-level brand bar. Full viewport width, `position: sticky`, glassmorphic.

```css
header {
  width: 100%;
  padding: 16px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(10, 11, 15, 0.6);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}
```

- Left: `logo.png` (40×40, `border-radius: 10px`, ice-blue `box-shadow`) + "WISHERS" gradient text + tagline
- Right: Agent breathing dot badge with backend status

### 2. Glass Card (Primary Container)

All cards, panels, and elevated surfaces use glassmorphism.

```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--color-border);
  border-radius: 16px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  border-color: var(--color-border-active);
}
```

### 3. Primary Button (CTA)

Button text is **dark** (`#0A0B0F`) on the silver-to-blue gradient background for maximum contrast.

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--color-accent-gradient);
  color: #0A0B0F;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(56, 189, 248, 0.25);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(56, 189, 248, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

### 4. Praying Hands (Interactive Visual)

Two static PNG images (silver left hand, ice-blue right hand) positioned with CSS absolute positioning. Animation via `left`/`right` property transitions.

- **Clasped state** (locked): Both hands centered, palms touching
- **Open state** (unlocked): Left hand slides to far left, right hand slides to far right, Wish Chat portal appears in the central gap

```css
/* Hand transition curve — slightly bouncy for organic feel */
transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
```

### 5. Wish Chat (Large Textarea Dialog)

Multi-line textarea for wish input, styled as a premium chat dialog box.

- `minHeight: 230px` for substantial visual presence
- Send button positioned at bottom-right inside the textarea
- `Enter` to send, `Shift+Enter` for newline
- Smart Preset chips rendered **below** the dialog box (not inside it)

### 6. Status Pill Badge

Single inline pill badge that dynamically reflects auth state.

```css
/* Locked state */
color: var(--color-accent-primary);
background: rgba(56, 189, 248, 0.1);
border: 1px solid rgba(56, 189, 248, 0.3);

/* Unlocked state */
color: var(--color-success);
background: rgba(0, 214, 143, 0.1);
border: 1px solid rgba(0, 214, 143, 0.3);
```

## Micro-Animations

### Agent "Breathing" Dot

The online-status indicator pulses gently to show the agent is alive.

```css
@keyframes breathing {
  0%   { transform: scale(1);   opacity: 0.6; }
  50%  { transform: scale(1.2); opacity: 1;   }
  100% { transform: scale(1);   opacity: 0.6; }
}

.agent-breathing-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--color-accent-primary);
  box-shadow: 0 0 12px var(--color-accent-primary);
  animation: breathing 2.5s infinite ease-in-out;
}
```

### Sacred Portal Expand (Wish Chat Emergence)

When the portal opens, the Wish Chat fades in with a subtle scale + blur transition.

```css
@keyframes portal-expand {
  0%   { opacity: 0; transform: scale(0.96) translateY(-10px); filter: blur(6px); }
  100% { opacity: 1; transform: scale(1) translateY(0);        filter: blur(0);   }
}

.sacred-portal-expanded {
  animation: portal-expand 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

### Shield Activation Flash

When a Rug Pull Shield triggers, a dramatic red ripple radiates from the wish card.

```css
@keyframes alert-ripple {
  0%   { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.6);  }
  70%  { box-shadow: 0 0 0 18px rgba(255, 71, 87, 0);  }
  100% { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0);     }
}

.shield-alert-active {
  border-color: var(--color-danger) !important;
  animation: alert-ripple 1.5s infinite;
}
```

### 3D Coin Toss (Wish Confirmation)

When confirming a wish, a golden coin arcs upward, spins, and drops into the wishing well.

```css
@keyframes coin-toss-arc {
  0%   { transform: translateY(0) scale(1) rotateY(0deg);     filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8)); }
  50%  { transform: translateY(-110px) scale(1.4) rotateY(540deg);  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 1));  }
  100% { transform: translateY(40px) scale(0.2) rotateY(1080deg);   filter: drop-shadow(0 0 30px rgba(56, 189, 248, 1)); }
}
```

## Page Layout Structure

The WISHERS app uses a **single-page progressive reveal** architecture:

### Layout Flow (Top to Bottom)

1. **Header Banner** — Full-width sticky bar with WISHERS logo + agent breathing status
2. **Auth Cards** — WalletConnect + WorldIDGate (540px centered)
3. **Status Pill** — Single badge showing portal lock/unlock state
4. **Praying Hands + Wish Chat** — Two hand images flank the central wish input portal (800px container)
5. **WishingWell** — Post-wish confirmation with coin-toss animation (540px centered)
6. **Active Wish Cards** — Monitoring status cards with shield alerts (540px centered)

### Interaction Flow

```
[Locked]  Hands clasped together → Status: 🙏 Complete Wallet & World ID
     ↓ (Connect Wallet + Verify World ID)
[Unlocked]  Hands slide open → Wish Chat portal appears between hands
     ↓ (User types/selects wish)
[Parsed]  WishingWell coin-toss confirmation modal
     ↓ (Confirm)
[Active]  Wish card with live monitoring badge + shield trigger capability
```

## Key Design Rules

1. **NEVER use pure white (`#FFFFFF`) text** — Use `--color-text-primary` (`#F0F2F5`) for softer contrast.
2. **NEVER use the old purple palette** — `#6C5CE7`, `#A78BFA`, `#C4B5FD` are all deprecated. Use Ice Blue (`#38BDF8`) and Silver (`#E0E7FF`) exclusively.
3. **NEVER use sharp box shadows** — All shadows use the Ice Blue accent color with low opacity for a premium glow effect (`rgba(56, 189, 248, 0.25)`).
4. **NEVER use browser default form elements** — All inputs, buttons, textareas, and selects must be custom-styled with dark backgrounds and ice-blue focus states.
5. **ALL interactive elements must have hover + active states** — No "dead" buttons.
6. **ALL state changes must be animated** — Use `transition` for simple properties, `@keyframes` for complex sequences. Never allow jarring instant-state changes.
7. **Text hierarchy is sacred** — Every section must have exactly one visual focal point (largest text or brightest element). Do not compete for attention.
8. **Button text on gradient backgrounds must be DARK** — Use `#0A0B0F` for text on `--color-accent-gradient` buttons for contrast and readability.
9. **Glassmorphism is the primary surface treatment** — Cards use `rgba(18, 20, 28, 0.72)` with `backdrop-filter: blur(16px)`. The header banner uses `rgba(10, 11, 15, 0.6)` with `blur(12px)`.
10. **Icon color convention** — Use `var(--color-accent-primary)` for neutral icons. Use semantic colors (`--color-success`, `--color-danger`, `--color-warning`) for state-specific icons.
