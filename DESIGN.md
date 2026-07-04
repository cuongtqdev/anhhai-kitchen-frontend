---
name: AnhHaiKitchen
colors:
  primary: "#F59E0B"
  secondary: "#0F172A"
  tertiary: "#475569"
  neutral: "#FAFAF9"
  success: "#10B981"
  danger: "#EF4444"
  muted: "#94A3B8"
typography:
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 3.5rem
    fontWeight: 800
    letterSpacing: -0.04em
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 2rem
    fontWeight: 700
    letterSpacing: -0.02em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: 400
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: 600
    letterSpacing: 0.08em
rounded:
  sm: 6px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  section: 96px
---

## Overview

A warm, modern, premium-feeling web experience for "Com Ga Anh Hai Lua" chicken rice restaurant. Light Mode foundation with warm off-white background, deep slate text, and a single Golden Amber accent color carried consistently across the entire interface.

## Colors

- **Primary (#F59E0B):** Golden Amber. The sole accent color. Used for CTAs, active states, and brand highlights. Never mixed with other accent colors.
- **Secondary (#0F172A):** Deep Slate. Primary text and headings. Provides sharp contrast against the warm background.
- **Tertiary (#475569):** Slate Gray. Secondary text, metadata, and subtle borders.
- **Neutral (#FAFAF9):** Warm off-white. The page background. Softer and warmer than pure white.
- **Muted (#94A3B8):** Light slate. Placeholder text, disabled states, decorative elements.
- **Success (#10B981):** Emerald. Order completion, availability indicators.
- **Danger (#EF4444):** Red. Error states, out-of-stock badges, cancellation.

## Typography

**Plus Jakarta Sans** for all text. A geometric sans-serif that reads as contemporary and friendly without being generic. Bold weights (700-800) for headlines create strong visual anchors. Regular weight (400) for body ensures comfortable reading at length.

## Layout and Spacing

Section padding is generous: `py-24` minimum at desktop. Content is contained within `max-w-7xl mx-auto`. The layout breathes. Cards and containers have ample internal padding (`p-6` to `p-8`). Never use `h-screen`, always use `min-h-[100dvh]` for full-height sections.

## Elevation and Depth

Shadows are subtle and warm-tinted. No heavy black drop shadows. Use `shadow-sm` or custom warm shadows (`shadow-[0_4px_24px_rgba(0,0,0,0.06)]`). Prefer spacing and borders over shadows for separation.

## Shapes

Corner radius follows a consistent scale: buttons use `rounded-full` (pill shape), cards use `rounded-2xl` (24px), inputs use `rounded-xl` (16px). No mixing of sharp and rounded in the same context.

## Do's and Don'ts

- Do use the Amber accent sparingly and with intent.
- Do keep section backgrounds consistent (no theme flipping mid-page).
- Don't use generic AI-purple gradients or mesh backgrounds.
- Don't use Inter, Roboto, or Arial as defaults.
- Don't use heavy black shadows or 1px solid gray borders.
