# M.ai.K.R Design System
## Derived from Avant Garde Institute brand assets

### Color Palette

#### Primary Colors
- **Void Black**: `#0A0A0F` — Main background (deep black with blue undertone)
- **Gunmetal**: `#1A1A2E` — Card/panel backgrounds
- **Steel**: `#2D2D44` — Secondary surfaces, borders

#### Accent Colors
- **Signal Amber**: `#C0A060` — Primary accent (warm gold from logos)
- **Copper**: `#804020` — Secondary accent (from card_plaque, dividers)
- **Electric Blue**: `#0040A0` — Interactive elements, links, CTAs
- **Plasma Cyan**: `#00C0FF` — Hover states, highlights, glow effects

#### Neutral Colors
- **Silver**: `#C0C0C0` — Body text
- **White**: `#F0F0F0` — Headings, important text
- **Smoke**: `#808080` — Muted text, placeholders
- **Charcoal**: `#303030` — Dividers, subtle borders

#### Semantic Colors
- **Success**: `#2ECC71` — Green for success states
- **Warning**: `#F39C12` — Amber for warnings
- **Error**: `#E74C3C` — Red for errors
- **Info**: `#3498DB` — Blue for info

#### Gradients
- **Hero Gradient**: `linear-gradient(135deg, #0A0A0F 0%, #1A1A2E 50%, #000020 100%)`
- **Card Gradient**: `linear-gradient(180deg, #1A1A2E 0%, #0A0A0F 100%)`
- **Accent Gradient**: `linear-gradient(90deg, #C0A060, #804020)` — Gold to copper
- **Glow Gradient**: `radial-gradient(ellipse at center, rgba(0,64,160,0.15) 0%, transparent 70%)`
- **CTA Gradient**: `linear-gradient(135deg, #0040A0 0%, #0060D0 100%)`

### Typography

#### Font Stack
- **Headings**: `'Inter', 'SF Pro Display', -apple-system, sans-serif` — Modern, geometric
- **Body**: `'Inter', 'SF Pro Text', -apple-system, sans-serif` — Clean, readable
- **Monospace**: `'JetBrains Mono', 'Fira Code', monospace` — Code, technical data
- **Accent**: `'Orbitron', 'Inter', sans-serif` — Logo, special headings (tech feel)

#### Scale
- **Display**: 48px / 3rem — Hero headlines
- **H1**: 36px / 2.25rem — Page titles
- **H2**: 28px / 1.75rem — Section titles
- **H3**: 22px / 1.375rem — Card titles
- **H4**: 18px / 1.125rem — Subsections
- **Body**: 16px / 1rem — Default text
- **Small**: 14px / 0.875rem — Captions, labels
- **XS**: 12px / 0.75rem — Fine print

#### Font Weights
- **Bold**: 700 — Headings, CTAs
- **Semibold**: 600 — Subheadings, important text
- **Medium**: 500 — Labels, navigation
- **Regular**: 400 — Body text

### Spacing System (8px base)
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px
- **3xl**: 64px
- **4xl**: 96px

### Border Radius
- **Small**: 4px — Tags, badges
- **Medium**: 8px — Buttons, inputs
- **Large**: 12px — Cards
- **XL**: 16px — Modals, panels
- **Full**: 9999px — Avatars, pills

### Shadows & Effects
- **Card Shadow**: `0 4px 24px rgba(0, 0, 0, 0.4)`
- **Elevated Shadow**: `0 8px 32px rgba(0, 0, 0, 0.6)`
- **Glow Blue**: `0 0 20px rgba(0, 64, 160, 0.3)`
- **Glow Amber**: `0 0 20px rgba(192, 160, 96, 0.2)`
- **Inner Glow**: `inset 0 1px 0 rgba(255, 255, 255, 0.05)`
- **Text Shadow**: `0 2px 4px rgba(0, 0, 0, 0.5)`

### Component Styles

#### Buttons
**Primary CTA:**
- Background: `linear-gradient(135deg, #0040A0 0%, #0060D0 100%)`
- Text: `#F0F0F0`, weight 600
- Padding: 12px 24px
- Border-radius: 8px
- Hover: `brightness(1.1)`, `box-shadow: 0 0 20px rgba(0, 64, 160, 0.4)`
- Active: `brightness(0.95)`

**Secondary:**
- Background: `rgba(192, 160, 96, 0.1)`
- Border: `1px solid #C0A060`
- Text: `#C0A060`
- Hover: `rgba(192, 160, 96, 0.2)`

**Ghost:**
- Background: transparent
- Border: `1px solid #2D2D44`
- Text: `#C0C0C0`
- Hover: `rgba(255, 255, 255, 0.05)`, border-color: `#0040A0`

#### Cards
- Background: `linear-gradient(180deg, #1A1A2E 0%, #0A0A0F 100%)`
- Border: `1px solid #2D2D44`
- Border-radius: 12px
- Padding: 24px
- Hover: border-color `#0040A0`, `box-shadow: 0 0 20px rgba(0, 64, 160, 0.15)`

#### Inputs
- Background: `#0A0A0F`
- Border: `1px solid #2D2D44`
- Border-radius: 8px
- Padding: 12px 16px
- Text: `#F0F0F0`
- Placeholder: `#808080`
- Focus: border-color `#0040A0`, `box-shadow: 0 0 0 3px rgba(0, 64, 160, 0.2)`

#### Navigation
- Background: `rgba(10, 10, 15, 0.95)` with `backdrop-filter: blur(12px)`
- Border-bottom: `1px solid #2D2D44`
- Active link: `#C0A060` with `box-shadow: 0 -2px 0 #C0A060` (bottom border accent)

### Design Language Summary

**Mood**: Premium, cutting-edge, military-grade precision meets AI sophistication. Dark and serious but not cold — the warm amber/gold accents add luxury and approachability.

**Key Differentiators vs Competitors:**
1. **Dark premium aesthetic** — Most AI SaaS sites use light/white themes. We go dark and premium.
2. **Warm metallics** — Gold/copper accents signal luxury and trust, unlike the typical blue-purple AI palette.
3. **Subtle glow effects** — Blue and amber glows on interactive elements create a "living" interface.
4. **Military-tech precision** — Sharp edges, structured layouts, data-dense dashboards feel like mission control.
5. **Generous whitespace** — Despite the dark theme, we use ample spacing to avoid feeling cramped.

**Visual Hierarchy:**
- Large display headings in white with subtle text-shadow
- Section headings in amber/gold for warmth
- Body text in silver for readability
- CTAs in electric blue with glow effects
- Data/monospace in cyan for technical credibility

**Animation Principles:**
- Subtle: 200-300ms transitions
- Glow on hover for interactive elements
- Fade-in for page sections
- Smooth scroll
- Pulse animation for live/active states
