---
system: Lettuce-Meat Design System
version: "2026.11"
register: Swiss Industrial Brutalism (CROX-readable variant)
reference: https://crox.framer.website/process — light canvas, orange rules, motion on enter
tokens:
  color:
    bg_primary: "#EDEDE9"        # Warm industrial concrete gray (dominant surface)
    bg_light: "#F4F4F0"          # Lighter panel surface
    bg_pure_white: "#FFFFFF"     # Cards, grid headers, inputs
    ink_black: "#000000"         # 1px borders & primary type (not full-bleed fills)
    ink_dark: "#111111"          # Accents, brush active AVAILABLE, small badges
    ink_secondary: "#262626"     # Body emphasis
    ink_mono_label: "#525252"    # Technical labels
    ink_muted: "#737373"         # Helper copy
    border_subtle: "rgba(0, 0, 0, 0.12)"
    brand_orange: "#FF3E00"      # Signal orange — CTAs, preferred, peak, accent rules
    brand_orange_dark: "#E03600" # Hover on orange controls
  typography:
    font_sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    font_mono: "'JetBrains Mono', monospace"
    weights:
      regular: 400
      medium: 500
      semibold: 600
      bold: 700
      black: 900
  borders:
    technical: "1px solid #000000"
    thick_box: "3px solid #000000"
  motion:
    enter: "fade-up 0.45s cubic-bezier(0.16, 1, 0.3, 1)"
    bench: "bench-expand 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
    ticker: "marquee 28s linear infinite"
    reduced: "respect prefers-reduced-motion — disable marquee & shorten fades"
  patterns:
    diagonal_hatch: "repeating-linear-gradient(-45deg, transparent, transparent 9px, #111111 9px, #111111 10px)"
    technical_grid: "40px x 40px 1px rgba(0,0,0,0.08) structural grid"
    technical_grid_dense: "20px x 20px 1px rgba(255,255,255,0.25) over #FF3E00"
  layout:
    breakpoints:
      sm: "640px — stack nav cells, full-width forms"
      md: "768px — two-column spec strips"
      lg: "1024px — grid 8/4 bench + sidebar"
    mobile_grid: "horizontal scroll on availability matrix; sticky time column; touch paint"
---

# Lettuce-Meat — Design System & Interface Specification (`DESIGN.md`)

**2026.11 revision:** Keep identity (concrete, orange, mono labels, heatmap) but **reduce black volume** like CROX Process — light surfaces first, black as structure (borders/type), orange as accent rules and CTAs. Readability beats maximum contrast blocks.

---

## 1. Core Visual Foundations

1. **Structure without black slabs**
   - Prefer `#FFFFFF` / `#F4F4F0` / `#EDEDE9` for headers, footers, spec strips, and grid column heads.
   - Use `#000000` for **1px borders** (`border-technical`) and body type — not full-width `#111111` bars except small badges and AVAILABLE brush active state.
2. **Orange accent rules (CROX-style)**
   - Under section titles or spec strips: `2px` `#FF3E00` on `#000000` baseline (see Home hero rule).
   - Peak day column in grid: `#FF3E00` fill; non-peak day headers: white + black type.
3. **Color blocking (unchanged semantics)**
   - **Signal Orange:** primary CTAs, `:)` PREFERRED brush, peak quorum, ticker highlight.
   - **Charcoal `#111111`:** only brush `:|` AVAILABLE active, small pills — not entire sidebars.
   - **Heatmap:** still `rgba(255, 62, 0, a)` by voter ratio; empty cells `#FFFFFF` + `.diagonal-hatch-subtle`.
4. **Typography**
   - **Display:** `Inter 900` uppercase for hero wordmarks only (MEETING, PAINT AVAILABILITY).
   - **Instructions:** `Inter 500/600`, **sentence case**, `text-base`, `#262626` — one line above grid (“Click or drag… then save”).
   - **Labels:** `JetBrains Mono`, uppercase, `11px–12px`, `#525252`.

---

## 2. Layout, Responsive & Motion

### 2.1 Breakpoints
- **&lt; lg:** single column — availability grid **above** sidebar; grid **scroll-x**; hint “Scroll grid horizontally →”.
- **≥ lg:** `grid-cols-12` — grid `col-span-8`, sidebar `col-span-4`.
- **Mobile save affordance:** sidebar “Gate 01” (name + save) **sticky bottom** on viewports &lt; lg so save is always reachable without reskinning tokens.

### 2.2 Motion (Framer-like, CSS-only)
- Page sections: `.animate-bench` or `.animate-fade-up` on enter.
- Optional **process ticker** on meeting bench: mono uppercase string, `.animate-ticker`, orange slash separators — pauses under `prefers-reduced-motion`.
- Nav/button hovers: color transition to orange or white — **avoid** full black hover fills on large nav cells (use `bg-brand-bgLight` + orange text).

### 2.3 Top Navigation (`Navbar.tsx`)
- Sticky `bg-brand-bg`, `border-b-[2px] border-black`.
- Active nav: white bg + orange text + inset orange rule (unchanged).
- Inactive hover: `bg-brand-bgLight text-brand-orange` (not black fill).

### 2.4 Spec strip (replaces “static black strip”)
- Light strip: `bg-brand-bgLight border-b border-technical font-mono text-xs uppercase text-ink_secondary`.
- Optional meta row on home: “Scheduling manual / phases” like CROX meta line.

---

## 3. Availability Grid & Brush

### 3.1 Brush box (unchanged interaction)
- Thick box `border-[3px] shadow-[5px_5px_0_#111111]`; toggle-on-click deselect per active brush.
- `:|` AVAILABLE active → `#111111`; `:)` PREFERRED active → `#FF3E00`.

### 3.2 Grid chrome (readability)
- **Column header row:** white background, black text; peak day → orange column.
- **Time gutter:** `#F4F4F0`, sticky left on horizontal scroll.
- **Touch:** same paint/remove as mouse; `touch-action: pan-x` on scroller.

### 3.3 Heatmap & badges
- Unchanged alpha formula; `:)` / `:|` badges in cells as before.

---

## 4. Welcome Intro Modal

- Keep brutalist frame (`border-2`, offset shadow) but surround on **technical-grid** canvas.
- Preview mini-grid may use thin black grid lines; avoid large black footer blocks inside modal.

---

## 5. Telemetry Sidebar (readability)

- **Gate 01:** concrete/white panel — labels `Your name`, buttons `Save availability` / `Remove my slots` (mono uppercase optional on button face).
- **Gate 02:** **white panel** with black type (not full dark block) — slot inspector list unchanged.
- **Gate 03:** orange quorum block retained; black used only on small badge chips.

---

## 6. Footer

- `bg-brand-bgLight`, muted mono legend — **not** `neutral-900` full bleed.

---

## 7. Implementation checklist (frontend)

- [ ] `index.css` — fade-up, reduced-motion, optional ticker utilities
- [ ] Light spec strips + instruction copy on `MeetingPage`
- [ ] Grid header row light; mobile scroll + sticky save panel
- [ ] Navbar/Footer/TelemetrySidebar token alignment
- [ ] Home spec strip + marquee/ticker only if it aids orientation (meeting bench)
