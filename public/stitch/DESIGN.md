# Design System Strategy: The Architectural Pulse

## 1. Overview & Creative North Star
The visual identity of this design system is defined by a "Creative North Star" we call **The Architectural Pulse**. 

While the consumer-facing source is energetic and retail-focused, this B2B portal must pivot toward authority, efficiency, and structured depth. We move away from "flat" web design and into a "High-End Editorial" experience. We achieve this by treating the interface not as a collection of boxes, but as a series of physical, layered surfaces. By utilizing intentional asymmetry—such as oversized display typography paired with surgically precise data grids—we create a portal that feels like a premium business tool rather than a generic dashboard.

**The signature shift:** We break the "template" look by eliminating traditional structural lines and borders, relying instead on tonal layering and sophisticated white space to guide the eye.

---

## 2. Colors & Surface Philosophy
Our palette is rooted in a high-contrast foundation of `primary` (#bb0011) and a nuanced range of warm neutrals.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off content. 
Boundaries must be defined solely through background color shifts. For example, a dashboard sidebar should use `surface_container_low`, while the main content area sits on `surface`. This creates a sophisticated, "app-like" feel that avoids the visual clutter of "boxed-in" designs.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the `surface_container` tiers to create depth:
- **Level 0 (Base):** `surface` (#fcf9f8)
- **Level 1 (Sections):** `surface_container_low` (#f6f3f2)
- **Level 2 (Cards/Modules):** `surface_container_lowest` (#ffffff)
- **Level 3 (Active/Pop-over):** `surface_container_high` (#eae7e7)

### The "Glass & Gradient" Rule
To elevate the B2B experience:
- **Glassmorphism:** Use `surface_container_lowest` at 80% opacity with a `20px` backdrop-blur for floating navigation or header elements. This allows the brand colors to bleed through subtly.
- **Signature Textures:** For primary CTAs and high-level Hero stats, use a subtle linear gradient (135°) transitioning from `primary` (#bb0011) to `primary_container` (#e61920). This adds "soul" and a tactile quality that flat red cannot achieve.

---

## 3. Typography: Editorial Authority
We utilize a dual-font strategy to balance character with readability.

- **Display & Headlines (Manrope):** This is our "Editorial" voice. Use `display-lg` and `headline-md` for page titles and major section headers. The geometric nature of Manrope provides an architectural stability.
- **Body & Labels (Inter):** For the "Pulse" of the data. Inter is used for all functional text. It is high-utility and remains legible at the smallest `label-sm` sizes.

**Hierarchy Tip:** Use `primary` red sparingly in typography—only for high-priority alerts or active navigation states. For everything else, rely on the contrast between `on_surface` (#1b1c1c) and `secondary` (#5f5e5e).

---

## 4. Elevation & Depth
In this design system, depth is a functional tool, not a decoration.

### The Layering Principle
Achieve hierarchy by "stacking" tones. A `surface_container_lowest` card placed on a `surface_container_low` background creates a natural lift. This "tonal layering" is our primary method of containment.

### Ambient Shadows
When a component must float (e.g., a Modal or a Toast):
- **Blur:** 24px to 40px.
- **Opacity:** 4%–8%.
- **Color:** Use a tinted version of `on_surface` (a deep, warm charcoal) rather than pure black to mimic natural light.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., Input fields), use a **Ghost Border**: the `outline_variant` token at **20% opacity**. Never use 100% opaque, high-contrast lines.

---

## 5. Components

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`), `on_primary` text, `xl` (0.75rem) roundedness.
- **Secondary:** `surface_container_highest` background with `on_surface` text. No border.
- **Tertiary:** Pure text using `label-md` bold, in `primary` red, with a subtle `4px` bottom margin shift on hover.

### Cards & Lists
**Card Rule:** Forbid divider lines. Separate content using `spacing-6` (1.5rem) or by nesting a `surface_container_low` area inside a `surface_container_lowest` card.
- **Lists:** Use `surface_container_lowest` for list items, adding a `px` height shift or a 2% darken on hover to indicate interactivity.

### Input Fields
- **Styling:** Use `surface_container_low` as the field background. 
- **States:** On focus, transition the background to `surface_container_lowest` and apply a `2pt` Ghost Border using the `primary` color at 40% opacity.

### B2B Specific: The Data Sheet
Since this is a portal, data density is key. Use "Zebra Striping" using `surface` and `surface_container_low` instead of table borders. Use `label-sm` for table headers to keep the UI feeling "light" even with heavy data.

---

## 6. Do's and Don'ts

### Do
- **Do** use asymmetrical margins (e.g., a wider left margin for page titles) to create an editorial feel.
- **Do** use `spacing-12` and `spacing-16` to create "breathing room" between major portal modules.
- **Do** ensure all interactive elements have a clear `surface_variant` hover state.

### Don't
- **Don't** use 1px solid black or grey borders. This immediately makes the system look like a "generic" bootstrap template.
- **Don't** use pure black (#000000). Use `on_surface` (#1b1c1c) for better visual comfort and a premium feel.
- **Don't** overcrowd the dashboard. If a page feels cluttered, increase the background tonal contrast instead of adding lines.

### Accessibility Note
While we prioritize a "No-Line" aesthetic, ensure that the contrast between `surface` and `on_surface` always meets WCAG AA standards. When in doubt, use the `outline` token at low opacity to define boundaries for users with visual impairments.