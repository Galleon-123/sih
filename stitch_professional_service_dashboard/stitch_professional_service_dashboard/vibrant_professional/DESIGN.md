---
name: Vibrant Professional
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434655'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#784b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#996100'
  on-tertiary-container: '#ffeedd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

The brand personality is energetic, trustworthy, and inclusive. This design system bridges the generational gap by combining the structural reliability of a professional tool with the expressive vitality of modern consumer apps. It targets a broad demographic ranging from young entrepreneurs to retirees managing their finances.

The design style is **Corporate Modern with a Vibrant Twist**. It utilizes a clean, off-white foundation to ensure maximum readability and reduced eye strain, while injecting personality through saturated accent colors and friendly, rounded geometry. The emotional goal is to make the user feel empowered and optimistic, turning potentially dry data into an engaging visual narrative. High contrast and generous white space are prioritized to maintain clarity and professional rigor.

## Colors

This design system employs a strategic multi-color palette to categorize information and drive user behavior:

- **Primary (High-Energy Blue):** Used for core interactions, primary buttons, and navigational focus. It represents stability and action.
- **Success (Green):** Specifically reserved for earnings, positive growth, and completed states. 
- **Warning/Status (Amber):** Used for pending items or alerts that require attention without immediate alarm.
- **Accent/Information (Violet):** Used for secondary data visualizations or to distinguish specific categories of content.
- **Background:** A soft off-white (`#F8FAFC`) is used instead of pure white to reduce glare and improve the reading experience for users with visual sensitivities.
- **Text:** High-contrast slate shades are used for body text and headers to ensure accessibility compliance (WCAG AA/AAA).

## Typography

Typography is used as a primary tool for hierarchy. **Plus Jakarta Sans** provides a friendly, rounded aesthetic for headings that appeals to a younger audience. **Work Sans** is used for body copy and labels because of its exceptional legibility and professional, grounded character, which assists elder users in processing information efficiently.

- **Scale:** Large headings use heavy weights and tight letter spacing for a "bold" look.
- **Readability:** Body text is never smaller than 16px to ensure accessibility.
- **Labels:** Use a slightly heavier weight to distinguish interactive hints from static content.

## Layout & Spacing

The layout follows a **Fluid Grid** model with strict adherence to an 8px spacing rhythm to maintain professional alignment. 

- **Desktop:** 12-column grid with a maximum content width of 1280px. 24px gutters provide ample breathing room between functional blocks.
- **Tablet:** 8-column grid with 24px margins.
- **Mobile:** 4-column grid with 16px margins. 

Vertical spacing is intentionally generous to prevent the UI from feeling cluttered, which helps users with cognitive load management. Sections should be separated by `lg` (40px) or `xl` (64px) units to clearly demarcate different content areas.

## Elevation & Depth

Depth is conveyed through **Tonal Layers** and **Ambient Shadows**. Instead of heavy borders, the design system uses subtle shifts in background color and soft shadows to create a sense of verticality.

- **Surface Level 0 (Base):** The off-white background (`#F8FAFC`).
- **Surface Level 1 (Cards):** Pure white surfaces with a very soft, diffused shadow (15% opacity, 12px blur) to make them appear lifted and interactive.
- **Surface Level 2 (Modals/Popovers):** Higher elevation with a larger shadow spread and a semi-transparent backdrop overlay to focus the user's attention.
- **Interactive State:** Elements should "lift" slightly on hover by increasing shadow depth and saturation of the accent color.

## Shapes

The shape language is consistently **Rounded**. This choice softens the "corporate" feel and makes the interface more approachable and modern.

- **Small Components:** Checkboxes and small tags use a 4px radius.
- **Standard Components:** Buttons, input fields, and cards use an 8px (`rounded-md`) to 16px (`rounded-lg`) radius.
- **Large Components:** Hero sections and feature containers may use up to 24px (`rounded-xl`) to create a distinctive, friendly frame for content.

## Components

- **Buttons:** Primary buttons are high-energy blue with white text. Success actions (e.g., "Withdraw") use the vibrant green. All buttons feature high-contrast labels and a 0.5rem corner radius.
- **Chips/Tags:** Used for status. They should utilize a "soft-fill" approach: a light tint of the status color as the background with a high-saturation version for the text (e.g., light green background with dark green text for "Positive").
- **Input Fields:** Use a white background with a subtle 1px border. On focus, the border thickens to 2px and takes the primary blue color with a soft glow.
- **Cards:** The workhorse of the design. White background, 1rem corner radius, and subtle shadows. High-energy colors are used as top-border accents or icons within the card to categorize content.
- **Data Visualizations:** Graphs and charts should use the full multi-color palette to differentiate data streams, ensuring each color meets a 3:1 contrast ratio against the card surface.
- **Lists:** High-density information lists should use horizontal dividers in a very light slate, with generous 16px vertical padding for touch-target friendliness.