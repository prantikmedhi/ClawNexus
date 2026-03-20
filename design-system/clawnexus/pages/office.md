# Office Page Overrides

> **PROJECT:** ClawNexus
> **Generated:** 2026-03-20 18:24:47
> **Page Type:** Dashboard / Data View

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Layout Overrides

- **Max Width:** 1200px (standard)
- **Layout:** Full-width sections, centered content
- **Sections:** 1. Hero (date/location/countdown), 2. Speakers grid, 3. Agenda/schedule, 4. Sponsors, 5. Register CTA

### Spacing Overrides

- No overrides — use Master spacing

### Typography Overrides

- No overrides — use Master typography

### Color Overrides

- **Strategy:** Urgency colors (countdown). Event branding. Speaker cards professional. Sponsor logos neutral.

### Component Overrides

- Avoid: No indication of progress

---

## Page-Specific Components

- No unique components for this page

---

## Recommendations

- Effects: Backdrop blur (10-20px), subtle border (1px solid rgba white 0.2), light reflection, Z-depth
- Feedback: Step indicators or progress bar
- CTA Placement: Register CTA sticky + After speakers + Bottom

## Advanced Page Direction

- Treat the Office page as a control surface first and a showcase second; operational clarity must survive visual richness.
- Prioritize live system state, fast agent recognition, and interruption-safe actions above ornamental motion.
- Use highlight colors sparingly so warnings, speaking states, and CTA surfaces remain meaningful.

## Interaction Priorities

- The first screen should answer who is active, what is failing, and what needs operator attention.
- Animations should communicate state transition, queue flow, or collaboration rather than generic movement.
- Dense panels should support progressive disclosure so expert users can drill down without overwhelming first-time visitors.

## Validation Checklist

- Confirm strong readability for streaming text, charts, and badges across large and compact layouts.
- Verify fallback behavior when 3D is unavailable, data is partial, or remote latency spikes.
- Keep action affordances discoverable with keyboard, touch, and mouse input.
