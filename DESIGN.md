---
system: Let-Us-Meat Design System
version: "2026.10"
register: High-Contrast Swiss Industrial Brutalism
tokens:
  color:
    bg_primary: "#EDEDE9"        # Warm industrial concrete gray
    bg_light: "#F4F4F0"          # Lighter panel surface
    bg_pure_white: "#FFFFFF"     # High-contrast active / hover row surface
    ink_black: "#000000"         # Pure black structural borders & display type
    ink_dark: "#111111"          # Primary body & charcoal blocks
    ink_secondary: "#262626"     # Crisp dark secondary copy (never washed-out gray)
    ink_mono_label: "#525252"    # Technical labels
    brand_orange: "#FF3E00"      # International Signal Orange (Preferred / Primary CTA)
    brand_orange_dark: "#E03600" # Hover state for signal orange
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
  patterns:
    diagonal_hatch: "repeating-linear-gradient(-45deg, transparent, transparent 9px, #111111 9px, #111111 10px)"
    technical_grid: "40px x 40px 1px rgba(0,0,0,0.08) structural grid"
    technical_grid_dense: "20px x 20px 1px rgba(255,255,255,0.25) over #FF3E00"
---

# Let-Us-Meat — Design System & Interface Specification (`DESIGN.md`)

This document codifies the visual language and component architecture of **Let-Us-Meat**: `#EDEDE9` concrete canvas, `#000000` structural borders, `#FF3E00` signal orange blocks, `#111111` solid carbon blocks, `Inter 900` uppercase display typography, `.diagonal-hatch` cells, and proportional `rgba(255, 62, 0, a)` heatmap density.

---

## 1. Core Visual Foundations

1. **Pure Black Structural Lines (`border: 1px solid #000000`):**
   - Every section, navbar cell, metric box, and availability grid cell is separated by a sharp `#000000` border (`border-technical`).
2. **High-Contrast Color Blocking:**
   - **Concrete (`#EDEDE9`):** Default page background with `.technical-grid` vertical/horizontal rules.
   - **Signal Orange (`#FF3E00` with `#FFFFFF` text):** Primary CTAs, peak quorum blocks, and `:) PREFERRED` time slots.
   - **Solid Black (`#111111` with `#FFFFFF` text):** Specification strips, dark telemetry blocks, and `:| AVAILABLE` time slots.
   - **Crisp White (`#FFFFFF` with `#111111` text):** Active input wells, high-contrast metric boxes, and hover rows.
   - **Diagonal Hatch (`.diagonal-hatch`):** Used for zero-overlap cells and structural spacer blocks.
3. **Typography with Extreme Scale Contrast:**
   - **Display Banners:** `Inter` `font-weight: 900` (`font-black`), `uppercase`, `tracking-tighter`, `leading-[0.78]`, edge-to-edge `14vw–16.5vw` (`QUORUM`).
   - **Section Headers:** `Inter` `font-weight: 900`, `uppercase`, `tracking-tight`, `#000000`.
   - **Technical Specs & Leader Rows:** `JetBrains Mono`, `uppercase`, `11px–12px`, `tracking-wider`.

---

## 2. Layout & Navigation Components

### 2.1 Top Navigation Bar (`Navbar.tsx`)
- Full-width sticky bar (`border-b-[3px] border-black bg-[#EDEDE9] min-h-[68px]`).
- Left cell: `LET-US-MEAT` in `text-2xl md:text-3xl font-black tracking-tighter text-black uppercase` with `border-r-[2.5px] border-black`.
- Right navigation cells: each item separated by `border-r-[2px] border-black`, `font-mono text-xs md:text-sm uppercase tracking-wider font-black text-black`, active item highlighted with `bg-white text-[#FF3E00] shadow-[inset_0_-4px_0_#FF3E00]`, inactive `hover:bg-black hover:text-white`.
- Far-right primary CTA cell: `bg-[#FF3E00] text-white font-black px-7 py-4 hover:bg-black`.

### 2.2 Static Black Specification Strip
- Full-width static `bg-black text-white border-b border-technical py-3.5 px-6 md:px-12 font-mono text-xs uppercase tracking-widest flex items-center justify-between`.

---

## 3. Availability Grid, Thick Brush Box & `rgba()` Density Heatmap

### 3.1 Thick Two-State Signal Selector (`:| AVAILABLE` vs `:) PREFERRED`)
- **No Eraser button.**
- The mode selector is a **thick brutalist box**:
  `border-[3px] border-black shadow-[5px_5px_0px_#111111]` with large `px-7 py-4 font-mono text-sm font-black uppercase` buttons divided by `border-r-[3px] border-black`.
- **Mode 1 — `:| AVAILABLE` (API `"canDo"`):** Ascii emoticon `:|` + `AVAILABLE`, solid `#111111` black active fill with `#FFFFFF` text.
- **Mode 2 — `:) PREFERRED` (API `"preferred"`):** Ascii emoticon `:)` + `PREFERRED`, solid `#FF3E00` orange active fill with `#FFFFFF` text.
- **Toggle-on-Click / Drag:** Clicking or dragging over a cell that already has the active brush state **deselects it immediately**.

### 3.2 `rgba(255, 62, 0, a)` Proportional Group Heatmap on the Grid
Every cell's background color on the grid is driven directly by **`rgba(255, 62, 0, a)`**, where `a` (alpha) increases proportionally with the number of available users (`count / totalVoters`):
- **`count === 0` (`a = 0`):** `#FFFFFF` with `.diagonal-hatch-subtle` and `#737373` text.
- **`count > 0` (`a = 0.15 + (count / totalVoters) * 0.85`):**
  - Low overlap → soft translucent orange (`rgba(255, 62, 0, 0.25)`) with `#111111` text.
  - Medium overlap → mid orange (`rgba(255, 62, 0, 0.55)`).
  - Full overlap (`N/N`) → solid `rgba(255, 62, 0, 1.0)` with `#FFFFFF` text and `MAX` badge.
- **Your Own Selection Badge inside the Cell:**
  - If you marked `PREFERRED`: high-contrast `:) PREF` badge (`bg-black text-white`).
  - If you marked `AVAILABLE`: high-contrast `:| AVAIL` badge (`bg-white text-black border border-black`).

---

## 4. Welcome Intro Modal (`WelcomeGateModal.tsx`)

- Placed over the `.technical-grid` canvas with a bold `#FF3E00` + `#111111` brutalist frame (`border-2 border-black shadow-[12px_12px_0px_#111111]`).
- Left column: `#E8E8E4` preview frame showing live `rgba(255, 62, 0, a)` meeting heatmap density and `BENCH_PREVIEW.STP` badge.
- Right column: `WELCOME TO MEETING`, respondent pills (`ALREADY CHOSE`), crisp white nickname input with `#000000` border, and `OPEN MEETING GRID →` button that opens the full availability workbench.
