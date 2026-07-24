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

## Color Palette

Use CSS custom properties defined in `:root`. Never hardcode hex values in components.

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

  /* ── Accent (Brand) ── */
  --color-accent-primary:   #6C5CE7;  /* Wishing purple — buttons, links, focus rings */
  --color-accent-glow:      #A78BFA;  /* Lighter purple for glows and highlights */
  --color-accent-gradient:  linear-gradient(135deg, #6C5CE7 0%, #A78BFA 50%, #C4B5FD 100%);

  /* ── Semantic ── */
  --color-success:   #00D68F;  /* Wish fulfilled, tx confirmed */
  --color-warning:   #FFAA00;  /* Pending, monitoring active */
  --color-danger:    #FF4757;  /* Rug alert, error, shield triggered */
  --color-info:      #3B82F6;  /* Informational badges */

  /* ── Borders & Dividers ── */
  --color-border:        rgba(255, 255, 255, 0.06);
  --color-border-active: rgba(108, 92, 231, 0.4);

  /* ── Glass Effect ── */
  --glass-bg:       rgba(18, 20, 28, 0.72);
  --glass-blur:     16px;
  --glass-border:   1px solid rgba(255, 255, 255, 0.08);
}
```

## Typography

Use **Inter** from Google Fonts. It's the industry standard for fintech and Web3 dashboards.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --font-family:   'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  /* ── Scale ── */
  --text-xs:    0.75rem;   /* 12px — Badges, captions */
  --text-sm:    0.875rem;  /* 14px — Secondary labels */
  --text-base:  1rem;      /* 16px — Body text */
  --text-lg:    1.125rem;  /* 18px — Subheadings */
  --text-xl:    1.5rem;    /* 24px — Section titles */
  --text-2xl:   2rem;      /* 32px — Hero heading */
  --text-3xl:   2.5rem;    /* 40px — Landing page headline */

  /* ── Weights ── */
  --font-normal:    400;
  --font-medium:    500;
  --font-semibold:  600;
  --font-bold:      700;
}

body {
  font-family: var(--font-family);
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
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
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */

  --radius-sm:  6px;
  --radius-md:  12px;
  --radius-lg:  16px;
  --radius-xl:  24px;
  --radius-full: 9999px;

  --max-width-app: 480px;  /* Mobile-first chat interface */
}
```

## Core Component Patterns

### 1. Glass Card (Primary Container)

All cards, panels, and elevated surfaces use glassmorphism.

```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.glass-card:hover {
  border-color: var(--color-border-active);
  box-shadow: 0 0 20px rgba(108, 92, 231, 0.08);
}
```

### 2. Primary Button (CTA)

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  background: var(--color-accent-gradient);
  color: white;
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.15s ease;
  box-shadow: 0 2px 12px rgba(108, 92, 231, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(108, 92, 231, 0.45);
}

.btn-primary:active {
  transform: translateY(0);
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
```

### 3. Chat Bubble (Wish Input/Output)

The core UX is a chat-like interface where the user types their wish and the Agent responds.

```css
.bubble-user {
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  max-width: 85%;
  align-self: flex-end;
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  line-height: 1.5;
}

.bubble-agent {
  background: rgba(108, 92, 231, 0.1);
  border: 1px solid rgba(108, 92, 231, 0.15);
  border-radius: var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm);
  padding: var(--space-3) var(--space-4);
  max-width: 85%;
  align-self: flex-start;
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  line-height: 1.5;
}
```

### 4. Status Badge (Wish State Indicator)

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  letter-spacing: 0.02em;
}

.badge--monitoring {
  background: rgba(255, 170, 0, 0.12);
  color: var(--color-warning);
}

.badge--triggered {
  background: rgba(255, 71, 87, 0.12);
  color: var(--color-danger);
  animation: pulse-danger 2s ease-in-out infinite;
}

.badge--fulfilled {
  background: rgba(0, 214, 143, 0.12);
  color: var(--color-success);
}

@keyframes pulse-danger {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

## Micro-Animations

### Agent "Thinking" Indicator

When the AI is processing a wish, show a breathing dot animation:

```css
.agent-thinking {
  display: flex;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4);
}

.agent-thinking .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent-primary);
  animation: thinking-bounce 1.4s ease-in-out infinite;
}

.agent-thinking .dot:nth-child(2) { animation-delay: 0.2s; }
.agent-thinking .dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes thinking-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}
```

### Shield Activation Flash

When a Rug Pull Shield triggers, a dramatic red border flash on the wish card:

```css
@keyframes shield-flash {
  0%   { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.6); }
  50%  { box-shadow: 0 0 30px 4px rgba(255, 71, 87, 0.3); }
  100% { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0); }
}

.wish-card--alert {
  animation: shield-flash 1s ease-out;
  border-color: var(--color-danger);
}
```

### Page Transition (Fade + Slide Up)

```css
@keyframes fade-slide-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-enter {
  animation: fade-slide-up 0.35s ease-out;
}
```

## Page Layout Structure

The WISHERS app has 3 main views. All views are mobile-first (max-width: 480px centered on desktop).

### View 1: Gate (World ID Verification)
- Full-screen centered layout
- WISHERS logo + tagline
- Single CTA: "Verify with World ID" button
- Subtle background gradient animation

### View 2: Dashboard (Wish List)
- Top bar: WISHERS logo (left), World ID verified badge (right)
- Scrollable list of active wishes with status badges
- Each wish card shows: condition summary, status (monitoring/triggered/fulfilled), token pair
- Floating "Make a Wish" button at bottom center

### View 3: Chat (Wish Creation)
- Chat-like interface with message bubbles
- User types wish in natural language at the bottom input
- Agent parses and displays structured wish card for confirmation
- "Confirm Wish" button to activate monitoring

## Key Design Rules

1. **NEVER use pure white (`#FFFFFF`) text** — Use `--color-text-primary` (`#F0F2F5`) for softer contrast.
2. **NEVER use sharp box shadows** — All shadows use the accent color with low opacity for a premium glow effect.
3. **NEVER use browser default form elements** — All inputs, buttons, and selects must be custom-styled.
4. **ALL interactive elements must have hover + active states** — No "dead" buttons.
5. **ALL state changes must be animated** — Use `transition` for simple properties, `@keyframes` for complex sequences. Never allow jarring instant-state changes.
6. **Text hierarchy is sacred** — Every page must have exactly one visual focal point (largest text or brightest element). Do not compete for attention.
7. **Mobile-first, always** — Design for 375px width first. Demo will likely be shown on a laptop, but a phone-like layout centered on screen looks much more impressive than a stretched desktop layout at a hackathon.
