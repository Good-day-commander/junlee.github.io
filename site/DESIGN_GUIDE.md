# Design Guide: "The Modern Scholar"

## Design Philosophy
A sophisticated, elegant academic portfolio that bridges **Fluid Dynamics** and **AI** through refined visual storytelling. The design emphasizes precision, innovation, and impact while maintaining scholarly credibility.

---

## Color Palette (OKLCH Format)

| Role | Color | OKLCH | Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | Deep Teal | `oklch(0.45 0.15 200)` | Headings, CTAs, accents |
| **Secondary** | Slate Gray | `oklch(0.25 0.02 260)` | Dark text, backgrounds |
| **Accent** | Clinical Teal | `oklch(0.55 0.18 190)` | Highlights, hover states |
| **Background** | Off-White | `oklch(0.98 0.001 0)` | Main background |
| **Card** | Soft White | `oklch(0.96 0.002 0)` | Card backgrounds |
| **Text** | Dark Slate | `oklch(0.20 0.02 260)` | Body text |
| **Muted** | Light Gray | `oklch(0.85 0.01 260)` | Secondary text, borders |

---

## Typography System

### Font Stack
- **Headings**: *Instrument Serif* (Google Fonts) — Professional, scholarly elegance
- **Body**: *Inter* (system default) — Clean, modern readability
- **Monospace**: *Fira Code* — Code snippets, technical content

### Hierarchy
| Level | Font | Size | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | Instrument Serif | 48px–64px | 600 | Page titles, hero headlines |
| **H1** | Instrument Serif | 36px–42px | 600 | Section titles |
| **H2** | Instrument Serif | 28px–32px | 600 | Subsection titles |
| **H3** | Inter | 20px–24px | 600 | Card titles |
| **Body** | Inter | 16px | 400 | Main text |
| **Small** | Inter | 14px | 400 | Metadata, captions |

---

## Layout Principles

### Hero Section
- **Full-width** with subtle animated background (fluid simulation patterns)
- Profile image on **left** (circular, 200px diameter)
- **Mission headline** on right (large serif typography)
- **Bento Grid cards** below (3 cards: Publications, Projects, Awards)

### Bento Grid (Main Content)
- **Asymmetric 3-column grid** with varied card sizes
- Cards have **subtle shadows** and **hover lift effects**
- Responsive: 1 column on mobile, 2 on tablet, 3 on desktop

### Project Cards
- **Image + overlay** on hover (show key metrics)
- **Title + description** below
- **Interactive hover**: slight scale, shadow increase

---

## Visual Elements

### Spacing
- **Base unit**: 8px
- **Padding**: 16px, 24px, 32px, 48px
- **Margin**: 24px, 32px, 48px, 64px

### Shadows
- **Subtle**: `0 2px 8px rgba(0,0,0,0.08)`
- **Medium**: `0 4px 16px rgba(0,0,0,0.12)`
- **Elevated**: `0 8px 32px rgba(0,0,0,0.16)`

### Border Radius
- **Small**: 4px (buttons, inputs)
- **Medium**: 8px (cards)
- **Large**: 12px (containers)

### Animations
- **Transition**: 300ms ease-in-out (default)
- **Hover**: Scale 1.02, shadow increase
- **Scroll**: Fade-in on viewport entry
- **Micro-interactions**: Smooth color transitions

---

## Component Guidelines

### Buttons
- **Primary**: Deep Teal background, white text, rounded 8px
- **Secondary**: Outline style, teal border, transparent background
- **Hover**: Slight scale (1.02), shadow increase

### Cards
- **Background**: Soft white with subtle border
- **Padding**: 24px
- **Border**: 1px solid `oklch(0.90 0.01 260)`
- **Hover**: Lift effect (shadow increase), slight scale

### Navigation
- **Sticky header** with logo + nav links
- **Links**: Underline on hover, smooth transition
- **Mobile**: Hamburger menu (collapsible)

---

## Responsive Design

| Breakpoint | Width | Layout |
| :--- | :--- | :--- |
| **Mobile** | < 640px | 1-column, full-width cards |
| **Tablet** | 640px–1024px | 2-column grid, adjusted spacing |
| **Desktop** | > 1024px | 3-column grid, full layout |

---

## Key Design Decisions

1. **Serif + Sans-serif Combination**: Serif headings convey scholarly authority; sans-serif body ensures modern readability.
2. **Teal Accent Color**: Reflects the "fluid dynamics" theme (water-like, flowing).
3. **Asymmetric Grid**: Breaks away from rigid layouts, feels more contemporary.
4. **Minimal Animations**: Subtle, purposeful motion enhances UX without distraction.
5. **High Contrast Text**: Ensures accessibility and readability.

---

## Implementation Notes

- Use **Tailwind CSS** for rapid styling with design tokens
- Leverage **shadcn/ui** components for consistency
- Apply **Framer Motion** for smooth animations
- Ensure **dark mode support** (optional, but prepared)
- Test on **mobile, tablet, desktop** viewports
