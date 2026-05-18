---
name: Technical Precision
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#ebbbb4'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#b18780'
  outline-variant: '#603e39'
  surface-tint: '#ffb4a8'
  primary: '#ffb4a8'
  on-primary: '#690100'
  primary-container: '#ff5540'
  on-primary-container: '#5c0000'
  inverse-primary: '#c00100'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#c8c6c6'
  on-tertiary: '#303030'
  tertiary-container: '#929090'
  on-tertiary-container: '#2a2a2a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a8'
  on-primary-fixed: '#410000'
  on-primary-fixed-variant: '#930100'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e4e2e1'
  tertiary-fixed-dim: '#c8c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474747'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding-desktop: 32px
  container-padding-mobile: 16px
  gutter: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
This design system is built for high-stakes connectivity and professional efficiency. It adopts a **High-Tech / Minimalist** aesthetic that prioritizes speed of recognition and data clarity. The brand personality is precise, authoritative, and energetic, evoking the feeling of a sophisticated command center rather than a generic utility.

The visual language balances deep obsidian surfaces with surgical red accents. It utilizes high-contrast boundaries and subtle luminescent effects to guide the user's eye toward primary actions and status indicators. The result is a UI that feels "live" and responsive, suitable for power users who manage complex networks.

## Colors
The palette is centered on "Signal Red," used sparingly but powerfully against a monochromatic background.

- **Primary:** `#FF0000` is reserved for critical actions, active states, and focus indicators.
- **Surface (Dark Mode):** The base is `#0A0A0A`, with containers using `#1A1A1A` and `#262626` to create depth.
- **Surface (Light Mode):** The base is `#FFFFFF`, with containers using `#F5F5F5` and `#EDEDED`.
- **Accents:** A custom glow token (`accent_glow_hex`) is used for "active" or "hover" states to provide a high-tech aura without sacrificing legibility.

## Typography
The system uses **Inter** for all primary communication to ensure maximum readability across various screen densities. Its neutral, systematic nature supports the high-tech aesthetic. 

For technical metadata, IDs, and secondary labels, **JetBrains Mono** is introduced to reinforce the "command center" feel. Tight letter-spacing is applied to headlines to maintain a modern, "locked-in" appearance, while body text uses standard spacing for accessibility.

## Layout & Spacing
The design system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile. The layout philosophy is "Structured Density"—content is organized in clear modules that utilize vertical stacking to present a high volume of contact information without feeling cluttered.

- **Desktop:** 24px gutters with 32px outer margins.
- **Mobile:** 16px gutters and margins.
- **Rhythm:** All spacing follows a 4px base unit. Components typically use 16px (stack-md) internal padding to maintain a spacious, professional feel.

## Elevation & Depth
Depth is expressed through **Tonal Layering** and **Luminescent Outlines** rather than traditional soft shadows.

1.  **Level 0 (Floor):** The darkest neutral (`#0A0A0A`), used for the background.
2.  **Level 1 (Card/Section):** A slightly lighter gray (`#1A1A1A`) with a subtle 1px border (`#333333`).
3.  **Level 2 (Active/Hover):** Surfaces remain Level 1, but gain a **1px Primary Red outline** and a 4px spread red glow (opacity 15%).
4.  **Popovers/Modals:** High-contrast elevation with a solid 1px gray border and a more pronounced backdrop blur (12px) to focus the user on the interaction.

## Shapes
The shape language is **Soft-Geometric**. A base radius of 4px (`roundedness: 1`) is applied to buttons, input fields, and small cards. This creates a sharp, professional look that feels precise but avoids the harshness of 0px corners.

- **Buttons:** 4px radius.
- **Cards:** 8px radius (`rounded-lg`).
- **Avatars:** Circular (Full round) to provide a soft counterpoint to the rigid grid and make individual contacts feel more human.

## Components

### Buttons
- **Primary:** Solid Red (`#FF0000`) background with White text. No shadow in rest state; subtle red glow on hover.
- **Secondary:** Transparent background with a 1px Red outline. On hover, the background fills with a 10% red tint.
- **Ghost:** Gray text, no border. Used for tertiary actions.

### Input Fields
Inputs use a deep dark background (`#141414`) and a 1px border (`#333333`). Upon focus, the border transitions to Primary Red, accompanied by a subtle red inner-glow. Labels use the `label-caps` typography style.

### Contact Cards
Cards feature a Level 1 surface. On hover, the entire card gains a thin red outline. The contact's name uses `body-lg` (Semi-bold), and secondary metadata (email/phone) uses `body-sm` in a muted gray.

### Chips/Tags
Small, rectangular tags with a 2px radius. Inactive tags are dark gray with light gray text. Active or "Priority" tags use a black background with a 1px red outline and red text.

### Selection Controls
Checkboxes and Radio buttons are square and circular respectively, using 1px gray borders. When checked, they fill with Primary Red and use a white checkmark/dot icon.