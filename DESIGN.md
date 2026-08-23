---
name: My Living Drawing
description: A warm paper-cut story board where a child's drawing becomes a commandable animated world.
colors:
  ink-navy: "#17324d"
  paper-cream: "#fffaf0"
  clean-white: "#ffffff"
  warm-white: "#fffdf8"
  story-sky: "#79d8f2"
  story-sky-deep: "#38b9df"
  story-ground: "#91cc69"
  friendly-green: "#55a85c"
  action-coral: "#e84133"
  action-coral-dark: "#b92720"
  focus-gold: "#ffd34f"
  night-sky: "#172a59"
typography:
  display:
    fontFamily: "ui-rounded, Arial Rounded MT Bold, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "clamp(3.5rem, 7vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.96
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "ui-rounded, Arial Rounded MT Bold, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "clamp(1.7rem, 3vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  title:
    fontFamily: "ui-rounded, Arial Rounded MT Bold, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "1.45rem"
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  body:
    fontFamily: "ui-rounded, Arial Rounded MT Bold, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.55
  label:
    fontFamily: "ui-rounded, Arial Rounded MT Bold, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 900
    lineHeight: 1.2
rounded:
  paper: "8px"
  field: "11px"
  control: "14px"
  surface: "16px"
  stage-mobile: "20px"
  stage: "28px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "34px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.action-coral}"
    textColor: "{colors.clean-white}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 22px"
    height: "58px"
  button-primary-hover:
    backgroundColor: "#d93328"
    textColor: "{colors.clean-white}"
    rounded: "{rounded.control}"
    padding: "0 22px"
    height: "58px"
  button-quick-action:
    backgroundColor: "{colors.clean-white}"
    textColor: "{colors.ink-navy}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "52px"
  input-command:
    backgroundColor: "{colors.warm-white}"
    textColor: "{colors.ink-navy}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "0 15px"
    height: "50px"
  chip-status:
    backgroundColor: "#e4f5df"
    textColor: "#32643c"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  mode-switch-active:
    backgroundColor: "{colors.action-coral}"
    textColor: "{colors.clean-white}"
    typography: "{typography.label}"
    rounded: "10px"
    padding: "0 17px"
    height: "46px"
  avatar-card-selected:
    backgroundColor: "#dff4fa"
    textColor: "{colors.ink-navy}"
    typography: "{typography.label}"
    rounded: "{rounded.surface}"
    padding: "10px 10px 14px"
  joint-toggle-active:
    backgroundColor: "{colors.action-coral}"
    textColor: "{colors.clean-white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 11px"
    height: "34px"
---

# Design System: My Living Drawing

## Overview

**Creative North Star: "The Living Paper Theater"**

My Living Drawing is a warm, low-density paper-cut theater: cream paper surrounds a framed cyan sky and green ground, while thick navy ink holds every silhouette together. Coral is the single action voice. Rounded cards, taped-paper cues, physical shadow bases, and deliberately authored scenery make the experience feel handmade and immediately playable rather than like an AI dashboard.

The same identity must survive from character choice to motion. Product-provided companions use authored selection art and dedicated, identity-consistent 2×2 motion sprite sheets for idle, wave, jump, and eat states; the dog has its own matching motion sheet. Houses, sun, tree, apple, clouds, stars, and ground are authored in CSS as paper-cut scenery. Optional joint overlays sit on top of the motion artwork for inspection without replacing or permanently technicalizing it.

**Key Characteristics:**

- Warm cream paper, cyan sky, green ground, coral actions, and navy outlines form one unmistakable world.
- One framed stage is the interaction anchor; supporting controls stay compact and tactile.
- AI-authored character identities remain recognizable across dedicated motion frames.
- CSS scenery and paper-cut props replace decorative emoji in the living world.
- All quick actions use one navy inline-SVG stroke family.
- Motion is short, readable, object-specific, and fully reduced when requested.
- Desktop layouts collapse deliberately at `820px`; compact mobile treatment begins at `560px`.

## Colors

The palette behaves like bright craft paper drawn with a dark felt-tip pen.

### Primary

- **Action Coral:** The sole strong action voice for primary buttons, active segments, joint-inspector state, and small emphasis marks.
- **Ink Navy:** Text, structural outlines, SVG action icons, roof geometry, and interactive definition.

### Secondary

- **Story Sky:** The dominant stage, rig-preview, and upload-board field.
- **Deep Story Sky:** Supporting blue depth and active drag-state character.

### Tertiary

- **Story Ground:** The broad green hill that anchors the living stage.
- **Friendly Green:** Positive status, local-demo reassurance, foliage, and success cues.
- **Focus Gold:** The shared high-visibility keyboard focus ring.

### Neutral

- **Paper Cream:** Page canvas and warm negative space.
- **Clean White:** Cards, overlays, bubbles, and action faces.
- **Warm White:** Inputs and paper-like inset fields.
- **Night Sky:** The deep-blue starting point for the sunset state.

### Named Rules

**The One Coral Voice Rule.** Coral signals action or deliberate emphasis; never scatter it as general decoration.

**The Navy Ink Rule.** Interactive shapes, authored props, and action icons share navy definition so they remain legible over cream, cyan, and green.

## Typography

**Display Font:** ui-rounded, with Arial Rounded MT Bold, Microsoft YaHei, system-ui, and sans-serif fallbacks  
**Body Font:** the same resilient rounded system stack  
**Label Font:** the same stack at heavier weights

**Character:** A single rounded stack keeps the voice chunky, friendly, offline-safe, and legible in Chinese. Scale, weight, and tight display tracking provide hierarchy without introducing a second font dependency.

### Hierarchy

- **Display** (700, fluid `3.5rem`–`6rem`, `0.96` line-height): Welcoming promises and creator questions, split into short balanced lines.
- **Headline** (700, fluid `1.7rem`–`2.25rem`, `1.2` line-height): Upload and primary section headings.
- **Title** (900, `1.45rem`, `1.2` line-height): Compact utility headings such as quick actions.
- **Body** (700, `1rem`, `1.55` line-height): Short explanatory copy; avoid long reading blocks.
- **Label** (900, `0.9rem`, `1.2` line-height): Buttons, pills, fields, and action names.

### Named Rules

**The Friendly Weight Rule.** Use strong weight, compact line length, and scale for hierarchy; do not introduce thin editorial typography.

## Layout

The welcome screen is centered within `1120px`, using a `1.08fr / .92fr` story-and-card split with an `8vw` gap. The creator hub is centered within `1220px`; its studio uses a `1.5fr / .65fr` library-and-preview split with a `24px` gutter and a four-column character grid. The direct upload view is capped at `1180px` with a `0.9fr / 1.1fr` split. The living world and quick-action rail share a `1260px` maximum width.

The stage is fluid from `560px` to `760px` tall on desktop. At `820px`, two-column surfaces become one column, the header simplifies, the avatar grid becomes two columns, and quick actions become a horizontally scrollable rail. At `560px`, page inset contracts to `12px`, large radii tighten to `20px`, the stage becomes a tall `600px` minimum viewport, the composer anchors `10px` above its bottom edge, labels compact, and horizontal actions remain touch-scrollable.

Spacing follows the observed rhythm of `8px`, `12px`, `16px`, `24px`, `34px`, and `48px`. Preserve generous air around the stage and keep control internals dense and consistent.

**The One Stage Rule.** Each step has one dominant framed task surface; secondary controls orbit it instead of creating competing dashboards.

## Elevation & Depth

Depth combines hard physical offsets with soft ambient lift. Touchable cards and magnets receive short opaque bases; the stage and floating composer use diffuse navy-blue shadows. Sprite characters and authored props use restrained drop shadows to separate their cut-paper edges from the sky.

### Shadow Vocabulary

- **Stage Ambient** (`0 18px 46px rgba(37, 91, 113, 0.18)`): Separation beneath the living stage.
- **Board Backing** (`14px 16px 0 #cbeef3`): Physical backing for desktop login and upload boards; compress to `8px 9px` on compact screens.
- **Primary Press Base** (`0 6px 0 #b92720`): Coral button depth.
- **Quick Action Base** (`0 5px 0 #dce8ea`): Pale base beneath white action magnets.
- **Overlay Ambient** (`0 10px 30px rgba(23,50,77,.18)`): Command composer separation.
- **Sprite Lift** (`drop-shadow(0 12px 7px rgba(23,50,77,.18))`): Gentle cutout separation for the chosen companion.

**The Physical-Then-Ambient Rule.** Use hard offsets for touchable magnets and diffuse lift for frames, overlays, sprites, and scenery.

## Shapes

The form language combines chunky rounded rectangles with `2px` or `3px` navy outlines. Controls use `10px`–`16px` corners, major boards use `28px`, compact mobile boards use `20px`, paper previews use `8px`, and status or joint controls are pills. Paper-cut scenery mixes simple circles, capsules, rounded organic foliage, a triangular roof, an arched hill, and visibly inked edges. Avoid generic icon tiles and unoutlined clip-art.

## Components

### Buttons

- **Primary:** Coral face, white heavy label, `58px` minimum height, `22px` horizontal padding, `14px` corners, `2px` navy border, and dark-coral press base.
- **Quick Action:** White face, navy inline SVG plus label, `52px` minimum height, `14px` corners, muted border, and pale-blue base.
- **Hover / Focus / Active:** Hover deepens or lifts; focus uses a `4px` gold ring with `3px` offset; active shifts down `1px` and scales to `0.985`.

### Chips

Status chips are compact green-on-pale-green pills. They report recognition or local-demo state and never resemble selectable filters.

### Cards / Containers

Major cards have `3px` navy borders and `28px` corners. The living stage uses cyan sky over a green hill; white cards and overlays remain warm and opaque enough to read. Selected avatar cards add a pale-sky face and a `5px` pale-blue base, reinforced by `aria-pressed`.

### Inputs / Fields

Fields use Warm White, a `2px` muted blue-gray border, `11px`–`12px` corners, `50px`–`56px` height, and heavy rounded text. Focus uses the shared gold ring; disabled command submission becomes muted blue-gray and visibly unavailable.

### Navigation

Headers stay transparent and low-density so the stage retains authority. The wordmark uses a small coral spark; utility actions are navy text with minimal decoration. The centered status disappears where the active surface already repeats it.

### Motion Sprite Characters

Each product-provided character has a dedicated 2×2 motion sheet. CSS changes `background-position` to select identity-consistent idle, wave, jump, and eat frames, then applies a short whole-cutout motion accent. The dog follows the same approach for idle, move, jump, and sit. Never substitute an unrelated figure or rebuild the chosen character as generic geometry.

### Paper-Cut World Props

Sun, tree, apple, house, door, clouds, stars, and ground are authored with CSS geometry, flat fills, navy outlines, and small physical shadows. Their action states are semantic: the door rotates in perspective, the sun descends into a darkened world, the tree shakes, and the apple travels toward the character.

### Joint Inspector

The joint toggle is a small white pill at rest and coral when active. It reveals labeled coral-and-navy nodes positioned over the preserved sprite artwork plus a compact rig summary. During motion, nodes fade to reduce visual clutter; the overlay remains optional and diagnostic.

### Command Composer & Feedback

The composer is a white, navy-framed overlay attached to the stage bottom. It pairs a warm input with a coral send action and explicit offline reassurance. Speech feedback appears near the stage top as a white tailed bubble with a coral spark and short enter/exit motion.

### Action Icon Family

Quick-action icons are unified `24px` inline SVGs with no fill, navy `1.9px` strokes, rounded caps, and rounded joins. Hand, jump arrow, door, sun, tree, dog, and apple all follow this one visual grammar.

## Do's and Don'ts

### Do:

- **Do** keep cream paper, cyan sky, green ground, coral actions, and navy outlines consistent across every surface.
- **Do** preserve each AI companion's identity across its dedicated motion frames.
- **Do** author scene props as simple paper-cut CSS forms with navy edges and restrained shadows.
- **Do** use the same navy inline-SVG stroke style for every quick action.
- **Do** keep the joint overlay optional, labeled by anatomy, and visually secondary during motion.
- **Do** preserve the `820px` and `560px` responsive behaviors, shared gold focus ring, and reduced-motion override.
- **Do** keep Chinese copy concise, warm, honest about local Demo behavior, and immediately actionable.

### Don't:

- **Don't** turn the experience into a generic AI upload dashboard or dense control console.
- **Don't** replace a selected character with a generic DOM puppet or unrelated animation asset.
- **Don't** use emoji as the primary living-world art for sun, tree, apple, house, or dog when authored assets and CSS props exist.
- **Don't** mix icon libraries, filled glyphs, or emoji into the unified quick-action SVG family.
- **Don't** add gradients as ornamental UI styling, glass effects, or low-contrast decoration; the stage's day/night sky transition is functional scenery.
- **Don't** show joint nodes permanently or force animal anatomy into human shoulder-and-hip terminology.
- **Don't** imply live AI capability or saved personal data when the shipped experience is local and replaceable.
