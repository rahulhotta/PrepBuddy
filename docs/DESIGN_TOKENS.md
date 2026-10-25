# Design tokens: "Blueprint in colour"

Source of truth: `reference/blueprint-prototype.html`. Implemented in `src/styles/tokens.css` and `src/styles/global.css`.

## Colours

| Token | CSS var | Value | Use |
|---|---|---|---|
| Background | `--bg` | `#0a3b7f` | Page background under the grid |
| Panel | `--pn` | `rgba(6,36,84,.5)` | Cards, panels, notes |
| Line | `--ln` | `#e8f0ff` | All outlines, diagram strokes |
| Text | `--tx` | `#f2f7ff` | Body text |
| Muted | `--mu` | `#c4d6f5` | Labels, secondary text |
| On accent | `--on` | `#0b2f66` | Text on accent fills |
| Card front | — | `#072a63` | Flashcard front face |
| Q&A item bg | — | `rgba(6,36,84,.4)` | `details`, case-study steps |
| Accent (current) | `--a` | per topic | Set on a wrapper; every component reads `--a` |

Topic accents: yellow `#ffd23f` (Low Level Design), coral `#ff8f70`, mint `#5eead4`, lilac `#c4a7ff`.
Diagram box fills cycle: yellow, mint, lilac, coral.

Rules: square corners everywhere, no gradients (except the grid), no emoji, no shadows except the offset hover shadow.

## Background and frame

- Grid: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px)` and the same at `90deg`, `background-size: 32px 32px`.
- Frame: `margin: 28px; border: 2px solid var(--ln); padding: 28px 40px 20px;` flex column, footer pushed down with `margin-top:auto`.
- ≤640px: frame `margin:10px; padding:18px`, panel `padding:16px`, sheet mini icon hidden.

## Typography

| Role | Font | Spec |
|---|---|---|
| Headings `h1–h3` | Barlow Condensed 700 | uppercase, line-height 1.02 |
| Home h1 | | `clamp(2.6rem,7vw,4.75rem)`, max-width 740px |
| Topic h1 | | `clamp(2.6rem,7vw,4.5rem)` |
| Subject h2 | | `clamp(2.4rem,6vw,4rem)` |
| Sheet name | Barlow Condensed 600 | 34px/1 |
| Drawing name | Barlow Condensed 600 | 30px/1.05 |
| Labels `.l` | Space Mono 400 | 12px, letter-spacing .06em, muted |
| Buttons, tabs, tags | Space Mono 700 | 12px, letter-spacing .04–.08em |
| Body | Barlow 400 | 18px/1.55 |

Google Fonts: `Barlow:wght@400;500;600`, `Barlow+Condensed:wght@500;600;700`, `Space+Mono:wght@400;700`.

## Components

- **Highlight** (`.hl`): accent background, on-accent text, `padding:0 10px`. Home headline highlights "build systems".
- **Note** (Question of the day): `2px dashed` yellow border, panel bg, max-width 340px, 16px text; label in Space Mono 12px yellow; answer separated by 1px muted top border.
- **Button** (`.btn`): 36px tall, `padding:0 16px`, 1.5px accent border, accent fill, on-accent text. Outline variant: transparent with line border and text colour. Hover: `translate(-2px,-2px)` and `3px 3px 0 var(--ln)` shadow. Disabled: opacity .7, no hover.
- **Sheet card** (`.s`): 1.5px line outline, `6px` accent top border, `padding:36px 22px 20px`, panel bg. Tag overhangs at `left:-1.5px; top:-6px`. Line-art icon top-right (70×46, stroke accent 1.8). Subject list rows with 8×8 accent square bullets, 16px, line-height 1.9. Hover: `translateY(-4px)` plus `0 0 0 1.5px accent, 6px 6px 0 accent`.
- **Drawing card** (`.dw`): same frame as sheet; label `DWG 01-1` in accent, name, muted tag, material chips (Space Mono 11px, 1.5px line border).
- **Progress ticks** (`.k`): 10 segments, 14×8px, 1.5px line border, gap 4px; filled = accent. Caption Space Mono 11px muted: "N of M items covered".
- **Breadcrumb**: Space Mono label style; links underlined (offset 3px). Format `INDEX / LOW LEVEL DESIGN / OBSERVER`.
- **Tabs**: `padding:9px 16px`, 1.5px line border, transparent; hover `rgba(255,255,255,.1)`; selected = accent fill + on-accent text.
- **Panel**: 1.5px line border, 6px accent top border, panel bg, `padding:28px`, min-height 280px.
- **Q&A item**: `details` with 1.5px border; summary 20px 600, 28×28 accent badge "Q" that becomes "A" when open; answer indented 58px.
- **Flashcard**: scene perspective 1200px, max-width 520px, height 260px. Flip `rotateY(180deg)` over .6s `cubic-bezier(.3,1.2,.5,1)`. Front `#072a63` with accent top border, "QUESTION" label, question in Barlow Condensed 32px uppercase. Back accent fill, on-accent text, "ANSWER" label.
- **Case-study step**: full-width button, 1.5px border, 42×42 accent number; hover `translateX(6px)`; done = accent fill, number inverted, "COVERED" label top right.
- **Inline code**: Space Mono .85em, yellow background, on-accent text.
- **Diagram**: node stroke line 2px; edges line 2px `stroke-dasharray:6 5` animated `stroke-dashoffset` to -22 over 1s; node text Space Mono 700 13px on-accent; edge labels line colour 12px. Wrapper scrolls horizontally; min-width 440px.
- **Footer**: label style, colour swatches 10×10, "SCALE 1:1, REV B" plus sources line.

## Interaction and accessibility

- Focus ring: `3px solid` yellow, `outline-offset:3px` on links, buttons and summaries.
- `prefers-reduced-motion: reduce` disables all animations and transitions.
- Navigation uses real links; actions use real buttons.
