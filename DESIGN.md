---
name: My Living Drawing
description: An animator's light-table where a child's drawing becomes a movable, conversational paper world.
colors:
  graphite: "#2f3232"
  drafting-paper: "#ece7da"
  tracing-paper: "#f6f2e8"
  clean-white: "#ffffff"
  warm-white: "#faf8f1"
  blue-pencil: "#4d7b97"
  blue-pencil-pale: "#dfe8e8"
  colored-pencil-green: "#71846f"
  colored-pencil-red: "#c65343"
  colored-pencil-red-dark: "#90392f"
  focus-gold: "#ffd34f"
  night-graphite: "#343a40"
typography:
  display:
    fontFamily: "KaiTi, STKaiti, Microsoft YaHei, sans-serif"
    fontSize: "clamp(3.5rem, 7vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.96
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "KaiTi, STKaiti, Microsoft YaHei, sans-serif"
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
  paper: "6px"
  field: "9px"
  control: "7px"
  surface: "12px"
  stage-mobile: "6px"
  stage: "8px"
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
    backgroundColor: "{colors.colored-pencil-red}"
    textColor: "{colors.clean-white}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 22px"
    height: "58px"
  button-primary-hover:
    backgroundColor: "{colors.colored-pencil-red-dark}"
    textColor: "{colors.clean-white}"
    rounded: "{rounded.control}"
    padding: "0 22px"
    height: "58px"
  button-quick-action:
    backgroundColor: "{colors.tracing-paper}"
    textColor: "{colors.graphite}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "52px"
  input-command:
    backgroundColor: "{colors.warm-white}"
    textColor: "{colors.graphite}"
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
    backgroundColor: "{colors.colored-pencil-red}"
    textColor: "{colors.clean-white}"
    typography: "{typography.label}"
    rounded: "10px"
    padding: "0 17px"
    height: "46px"
  avatar-card-selected:
    backgroundColor: "{colors.blue-pencil-pale}"
    textColor: "{colors.graphite}"
    typography: "{typography.label}"
    rounded: "{rounded.surface}"
    padding: "10px 10px 14px"
  joint-toggle-active:
    backgroundColor: "{colors.colored-pencil-red}"
    textColor: "{colors.clean-white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 11px"
    height: "34px"
  chat-assistant-bubble:
    backgroundColor: "#eef1ed"
    textColor: "{colors.graphite}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  chat-user-bubble:
    backgroundColor: "#a55246"
    textColor: "{colors.clean-white}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  chip-quick-topic:
    backgroundColor: "{colors.tracing-paper}"
    textColor: "{colors.graphite}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "34px"
---

# Design System: My Living Drawing

## Overview

**Creative North Star: "The Animator's Light Table"**

My Living Drawing is a quiet animator's workbench: warm drafting paper supports a translucent tracing-paper stage, graphite defines structure, blue-pencil guides reveal construction, and restrained colored-pencil fills make characters and props feel touched by hand. The interface should resemble a working animation lightbox rather than a polished AI dashboard or a bright children's game template.

The same identity survives from character choice to motion. Product-provided companions retain recognizable sprite artwork, softened to low-saturation colored pencil. Houses, sun, tree, apple, clouds, stars, and ground use simple hand-drawn geometry. Scene objects are direct-manipulation pieces: pointer and touch dragging moves them inside measured stage bounds, while the scene editor provides labeled range controls as the keyboard-accessible alternative.

**Key Characteristics:**

- Warm drafting paper, translucent tracing paper, graphite marks, blue-pencil guides, and low-saturation colored-pencil fills form one unmistakable workbench.
- One framed stage is the interaction anchor; supporting controls stay compact and tactile.
- AI-authored character identities remain recognizable across dedicated motion frames.
- CSS scenery and illustrated props use graphite construction and quiet fill rather than glossy clip art.
- All quick actions use one graphite inline-SVG stroke family.
- The living world and its white paper conversation card read as one responsive two-column play surface.
- Conversation stays continuous and lightweight through pale tracing-paper assistant bubbles, muted red-pencil user bubbles, typing dots, quick-topic pills, and one composer.
- Uploaded drawings pass through an explicit paper-board calibration workspace; draggable red-pencil joints preserve the child’s artwork while making the local template model understandable.
- Before joint placement, the calibration workspace offers four ordinary-sized artwork treatments—原图, 轻度, 中度, and 重度—while permanently retaining 原图 as the non-destructive source.
- Joint calibration nodes are direct-manipulation buttons that preserve the exact grab offset, use the rig canvas content box, match pointer capture through completion, and stay fully inside measured half-size bounds.
- Story tasks, scene tools, export, and parent safety behave as compact layers around the stage rather than competing destinations.
- The world header uses normal-sized, novice-friendly plain-text tools; concise verbs explain the result without oversized or infantilized controls.
- A 60-item, seven-category material library and a 120-preset house decoration studio extend the paper world with code-native hand-drawn previews.
- A second companion may join the same world; the transcript names and switches speakers without duplicating the conversation surface.
- Scene objects advertise direct manipulation with `grab`, change to `grabbing` with a blue-pencil dashed selection frame, and remain bounded inside the stage.
- Motion is short, readable, object-specific, and fully reduced when requested.
- The world-and-chat pair stacks at `1050px`; other desktop layouts collapse at `820px`, and compact mobile treatment begins at `560px` with a two-row header and touch-safe controls.

## Colors

The palette behaves like an animator's desk viewed through a warm lightbox. Most contrast comes from graphite on pale paper; color appears as imperfect, low-saturation pencil rather than digital candy.

### Primary

- **Graphite:** Text, structural outlines, SVG action icons, roof geometry, and interactive definition.
- **Colored-Pencil Red:** The sole strong action voice for primary buttons, active segments, joint-inspector state, and small emphasis marks.

### Secondary

- **Blue Pencil:** Construction lines, drag guidance, positional affordances, and quiet secondary information.
- **Blue-Pencil Pale:** Cool tracing-paper variation and selected surface tint.

### Tertiary

- **Colored-Pencil Green:** Ground wash, foliage, positive status, and local-demo reassurance.
- **Focus Gold:** The shared high-visibility keyboard focus ring.

### Neutral

- **Drafting Paper:** The lined page canvas and warm negative space.
- **Tracing Paper:** The dominant stage and control surface.
- **Clean White:** Limited use for crisp utility faces.
- **Warm White:** Cards, overlays, bubbles, and inset fields.
- **Night Graphite:** The charcoal surface for night and space scenes.

### Named Rules

**The One Red-Pencil Voice Rule.** Colored-pencil red signals action or deliberate emphasis; never scatter it as general decoration.

**The Graphite Structure Rule.** Interactive shapes, authored props, and action icons share graphite definition so they remain legible over layered paper.

**The Blue Pencil Rule.** Blue pencil explains construction, position, and movement; it never competes with red action emphasis.

## Typography

**Display Font:** KaiTi, STKaiti, Microsoft YaHei, and sans-serif fallbacks
**Body Font:** the same resilient rounded system stack  
**Label Font:** the same stack at heavier weights

**Character:** Brush-like Chinese display headings establish the animator's notebook voice, while the resilient rounded system stack keeps controls and longer instructions legible and offline-safe. Scale, weight, and tight display tracking provide hierarchy without ornamental typography.

### Hierarchy

- **Display** (KaiTi, 700, fluid `3.5rem`–`6rem`, `0.96` line-height): Welcoming promises and creator questions, split into short balanced lines.
- **Headline** (KaiTi, 700, fluid `1.7rem`–`2.25rem`, `1.2` line-height): Upload, editor, gallery, and modal headings.
- **Title** (900, `1.45rem`, `1.2` line-height): Compact utility headings such as quick actions.
- **Body** (700, `1rem`, `1.55` line-height): Short explanatory copy; avoid long reading blocks.
- **Label** (900, `0.9rem`, `1.2` line-height): Buttons, pills, fields, and action names.

### Named Rules

**The Friendly Weight Rule.** Use strong weight, compact line length, and scale for hierarchy; do not introduce thin editorial typography.

**The Plain-Language Tool Rule.** Header utilities stay at normal control scale and use short concrete verbs. Child-friendly means immediately understandable, not oversized, babyish, or visually loud.

## Layout

The welcome screen is centered within `1120px`, using a `1.08fr / .92fr` story-and-card split with an `8vw` gap. The creator hub is centered within `1220px`; its studio uses a `1.5fr / .65fr` library-and-preview split with a `24px` gutter and a four-column character grid. The direct upload view is capped at `1180px` with a `0.9fr / 1.1fr` split. Its follow-on rig editor stays within `1220px`, pairing a `1.35fr / .65fr` image canvas and control column; the canvas remains dominant and the node inventory never becomes a separate dashboard. The living experience is centered within `1360px` as a `minmax(0, 1fr) / 370px` world-and-chat grid with an `18px` gutter; the quick-action rail remains capped at `1260px` beneath it.

The stage and desktop conversation card are fluid from `560px` to `760px` tall. The story task is a compact `270px` paper card inside the stage’s upper-left safe area, with a progress line and one obvious next action. Every movable object stores its center as stage-relative percentages. Its measured half-width and half-height define per-object minimum and maximum coordinates, so the whole illustration remains inside the lightbox at every viewport size. A drag threshold separates taps from moves and preserves object actions after ordinary clicks.

At `1050px`, the world-and-chat grid stacks and the conversation card becomes a compact `430px`-high follow-on surface. At `820px`, the remaining two-column surfaces become one column, including the calibration workspace; the avatar grid becomes two columns and quick actions become a horizontally scrollable rail. At `560px`, page inset contracts to `12px`, the stage becomes a tall `600px` minimum viewport with a `6px` paper corner, and the conversation card becomes `420px` high. The header becomes two rows: a centered wordmark first, then a horizontally scrollable utility rail. Mobile topics, dialog actions, editor confirmations, joint/story toggles, and other primary controls keep a `44px` minimum touch target. Composer text yields to its arrow on the narrow send button, and horizontal action rails scroll internally without increasing page width.

The calibration artwork-treatment selector uses four equal columns on desktop, two columns on narrow desktop, returns to four compact columns on mobile, and collapses to two columns at `430px` and below. Every treatment remains an ordinary control rather than a hero card and preserves at least a `44px` touch height.

The application must maintain zero horizontal page overflow at the `320px` minimum viewport. Use `min-width: 0` on grid children, contain horizontal rails inside their parent, and reserve scroll behavior for explicitly labeled carousels and utility rails; `body` remains `overflow-x: hidden` as a final guard, not as a substitute for correct sizing.

The material library and house decoration studio are centered desktop dialogs with contained scrolling. Below `700px`, each docks to the viewport bottom as a sheet capped at `92dvh`; category and motif tabs scroll within their own rail, item grids reduce to two columns, every tab and utility action preserves a `44px` target, and no dialog content may widen the page.

Scene editing is a `420px` right drawer on desktop and a bottom sheet capped at `78dvh` on mobile. Export and parent safety use centered, scroll-safe dialogs with `24px` outer insets and a dark graphite scrim; the break reminder uses the same modal plane. Only one such modal layer may be open at once, and destructive local-data actions stay visually separated from ordinary settings.

Spacing follows the observed rhythm of `8px`, `12px`, `16px`, `24px`, `34px`, and `48px`. Preserve generous air around the stage and keep control internals dense and consistent.

**The One Stage Rule.** Each step has one dominant framed task surface; secondary controls orbit it instead of creating competing dashboards.

## Elevation & Depth

Depth comes from translucent sheets laid on a workbench. Fine graphite borders define paper edges; restrained warm-gray ambient shadows separate major sheets without plastic button bases. Sprite characters and scene props use low, soft drop shadows only when needed to remain legible over the tracing grid. Dragging temporarily increases lift to show that a piece has left the paper plane.

### Shadow Vocabulary

- **Stage Lightbox** (`0 18px 40px rgba(58,54,45,.15)`): Warm separation beneath the tracing-paper world.
- **Paper Sheet** (`0 14px 34px rgba(58,54,45,.12)`): Shared lift for login, library, conversation, editor, export, and safety sheets.
- **Overlay Ambient** (`0 10px 30px rgba(47,50,50,.14)`): Command composer and compact stage overlay separation.
- **Sprite Lift** (`drop-shadow(0 8px 6px rgba(54,48,39,.14))`): Quiet cutout separation after low-saturation treatment.
- **Drag Lift** (`drop-shadow(0 15px 13px rgba(54,48,39,.20))`): Temporary depth while a scene object is held.

**The Layered Paper Rule.** Use thin graphite borders and warm ambient shadows to describe sheet order; reserve stronger lift for the actively dragged object.

## Shapes

The form language uses lightly worn paper rectangles with `1px`–`1.5px` graphite outlines. Controls use `7px`–`9px` corners, major sheets use `12px`, the stage uses `8px` on desktop and `6px` on mobile, and small status or mode controls may remain pills when their meaning benefits from compact grouping. Hand-drawn scenery mixes simple circles, capsules, rounded foliage, a triangular roof, an arched ground wash, and visibly constructed edges. Avoid glossy cards, oversized bubble corners, generic icon tiles, and unoutlined clip art.

## Components

### Buttons

- **Primary:** Muted red-pencil face, white heavy label, `58px` minimum height, `22px` horizontal padding, `7px` corners, and a fine graphite border without a hard press base.
- **Quick Action:** Tracing-paper face, graphite inline SVG plus label, `52px` minimum height, `7px` corners, and a `1.5px` graphite border.
- **Hover / Focus / Active:** Hover increases contrast or adds a slight warm lift; focus uses a `4px` gold ring with `3px` offset; active shifts down `1px` and scales to `0.985`.

### Chips

Status chips are compact green-on-pale-green pills. They report recognition or local-demo state and never resemble selectable filters.

### Cards / Containers

Major cards are warm near-opaque paper sheets with `1.5px` graphite borders, `12px` corners, and one shared ambient shadow. The living stage is a tracing-paper grid with blue-pencil construction marks and a quiet colored-pencil ground wash. Selected avatar cards use a pale blue-pencil tint and `aria-pressed`, never a glossy glow.

Calibration, story, and modal surfaces reuse the same graphite-and-paper family. The scene drawer keeps a square desktop edge against the viewport and changes to a softly rounded top edge when docked to the mobile bottom.

### Inputs / Fields

Fields use Warm White, a fine blue-gray border, `9px`–`12px` corners, `50px`–`56px` height, and heavy rounded text. Range inputs use the red-pencil accent, explicit horizontal/vertical labels, and bounds derived from the actual object size. Focus uses the shared gold ring; disabled command submission becomes muted graphite-gray and visibly unavailable.

### Navigation

Headers stay transparent and low-density so the stage retains authority. The wordmark uses a small red-pencil spark; utility actions are normal-sized plain-text controls with minimal decoration. The first-line tools are `加东西`, `装房子`, `自己画`, `保存`, and `更多`; the overflow menu continues with concrete task language such as `移动东西`. The centered status disappears where the active surface already repeats it.

Do not expose implementation language such as “图层” to children. Object arrangement uses `移动东西`, `放前面`, `放后面`, and `拿走`, while creation uses `加东西` and `装房子`. These labels describe what happens in the world rather than the data model behind it.

### Material Library

The library contains exactly 60 unique materials across seven plain-language categories: 伙伴, 衣服, 头发, 鞋子, 背景, 自然, and 摆件. Every choice has a code-native CSS preview assembled from simple outlined shapes, category-specific silhouettes, small hand-drawn variations, and low-saturation pencil colors; do not depend on emoji, stock thumbnails, or network imagery.

Selecting a non-background material adds a named, saved scene object and closes the library. The object enters at a staggered stage position, can be dragged with the same bounded direct-manipulation behavior as built-in pieces, participates in `移动东西`, `放前面`, `放后面`, and `拿走`, and persists with the saved world. Selecting a background applies it directly to the stage sky, ground, and sun treatment as a replacement instead of creating a draggable object. Cards say `放进去` or `换背景` so the consequence is explicit before activation.

### House Decoration Studio

The house studio contains exactly 120 unique presets: six pencil palettes × five motif families × four window accents. Its five tabs are 圆点, 条纹, 方格, 花朵, and 星星. Every preset button shows a complete miniature house—not a color chip—with roof, patterned wall, door, and two windows, plus its preset and accent names.

A large live house preview updates immediately when a preset is clicked, and the selected treatment applies to the real house without a separate commit step. The stage house itself opens the same studio on click, while its door state remains separately legible in the artwork. The full-width `装好啦` action simply closes the studio after exploration.

### Motion Sprite Characters

Each product-provided character has a dedicated 2×2 motion sheet. CSS changes `background-position` to select identity-consistent idle, wave, jump, and eat frames, then applies a short whole-cutout motion accent. The dog follows the same approach for idle, move, jump, and sit. Apply restrained saturation and contrast so authored art sits naturally on tracing paper. Never substitute an unrelated figure or rebuild the chosen character as generic geometry.

### Hand-Drawn World Props

Sun, tree, apple, house, door, clouds, stars, and ground are authored with CSS geometry, low-saturation pencil fills, graphite outlines, and minimal warm shadows. Their action states are semantic: the door rotates in perspective, the sun descends into a charcoal world, the tree shakes, and the apple travels toward the character.

### Direct-Manipulation Scene Objects

Every visible `.scene-object` is a native button that supports click actions plus pointer-based dragging on mouse, pen, and touch. At rest it uses `cursor: grab`, `touch-action: none`, and `user-select: none`. Dragging begins only after a `5px` movement threshold, captures the pointer, raises the object above overlays, changes to `grabbing`, adds Drag Lift, and draws a blue-pencil `1px` dashed frame `8px` outside the object (`5px` on mobile). Releasing or cancelling always clears the drag state; a completed drag suppresses the accidental click that would otherwise fire the object's action.

Movement is calculated from the object's center plus the initial pointer offset. Clamp the resulting stage-relative percentages using the rendered object's half-width and half-height, with a small safety inset, so no artwork can be dragged outside the stage. Recompute bounds when the scene or viewport changes.

### Joint Inspector

The joint toggle is a small tracing-paper control at rest and red-pencil when active. It reveals labeled red-pencil-and-graphite nodes positioned over the preserved sprite artwork plus a compact rig summary. During motion, nodes fade to reduce visual clutter; the overlay remains optional and diagnostic.

### Joint Calibration Editor

The upload follow-on is a two-step calibration workspace, not a simulated recognition result. The uploaded drawing fills a white, graphite-framed canvas with contained image scaling. Draggable `20px` red-pencil nodes are native direct-manipulation buttons with a white inner border, graphite outer ring, grab cursor, and adjacent graphite label. They are excluded from global button press transforms so pressing a node cannot shift its calibrated center. Human, dog, and rabbit templates appear as stacked `56px` controls; the active template flips to red pencil and updates its anatomy-aware node list. On compact screens, the canvas stacks above the controls, remains at least `460px` tall, and follows the compact paper radius.

Artwork treatment happens locally in the browser through `canvas` before joint placement. 原图 is retained permanently and can always be restored; 轻度 brightens the paper, 中度 cleans the gray cast, and 重度 strengthens the drawn lines. Cache completed results by source image and treatment, and guard asynchronous work with a request identity so a slower obsolete render can never replace the latest selection.

The four treatment controls expose selection with `aria-pressed`; a nearby `role="status"` region announces processing, completion, and failure without stealing focus. While processing, disable all treatment choices and the final confirmation, show a concise busy state, and on error restore 原图 with a retryable message. Small descriptions and status copy must meet WCAG AA contrast against their paper surface.

**The Exact Joint Grab Rule.** On `pointerdown`, preserve the exact pointer-to-node-center grab offset and capture that pointer. Resolve movement against the rig canvas padding/content box—not its border box—using `clientWidth` / `clientHeight` and the origin at `rect.left + clientLeft`, `rect.top + clientTop`. Clamp with the measured rendered node half-width and half-height so the complete node remains inside the content box. On matching `pointerup` or `pointercancel`, release capture and clear the drag state; ignore completion from any other pointer. The automated precision check records `0px` displacement at pointer-down, a requested delta of `93px / -47px`, an actual delta of `93.046875px / -47.015625px`, and passing bounds.

### Command Composer & Feedback

The composer is a warm paper, graphite-framed overlay attached to the stage bottom. It pairs a warm input with a red-pencil send action and explicit offline reassurance. Speech feedback appears near the stage top as a pale tailed note with a red-pencil spark and short enter/exit motion.

### Conversation Panel

The conversation is a `370px` desktop companion to the world, presented as one warm paper sheet with a `1.5px` graphite frame, `12px` corners, and quiet ambient lift. A compact character header leads into one continuous, vertically scrolling transcript; messages do not become separate cards or interrupt the reading flow with extra chrome.

Assistant replies use pale tracing-paper bubbles with a graphite outline and a lower-left tail corner; user messages align right in muted red-pencil bubbles with the inverse lower-right corner. A three-dot typing bubble keeps the assistant voice visible while waiting. Below the transcript, up to three pill-shaped quick topics scroll horizontally, followed by a warm-white composer and red-pencil send action. Suggested and freeform replies share the same send path, and action-linked assistant replies visibly trigger the matching world object so conversation and play remain one system. On mobile, each quick-topic pill keeps at least a `44px` touch target.

When two companions are present, a compact speaker switch sits between the chat header and transcript. It uses `aria-pressed` buttons, changes the named assistant without clearing history, and keeps each assistant message attributed to its actual speaker. Never split companions into parallel chat columns.

### Story Task Card

Story mode is an optional stage overlay opened by a small control. Its warm-paper card pairs a red-pencil task label, count, green-pencil progress line, short title, one-sentence instruction, and a full-width action. Branching endings offer at most two vertically stacked choices; the secondary path may use gold, but the next step remains unmistakable. On mobile, the card stays within `10px` stage insets and suppresses overlapping speech feedback while open.

### Scene, Export & Safety Layers

Scene editing is the keyboard-accessible alternative to free dragging: a directional drawer with theme controls, one object card per piece, and labeled horizontal/vertical range inputs using the same measured bounds as the stage. This is not a second positioning model; both interfaces update the same coordinates. Its child-facing arrangement controls say `移动东西`, `放前面`, `放后面`, and `拿走`, never “图层”. Export is a centered paper dialog with a pale tracing-paper preview and large stacked choices for SVG, JSON, and copyable text. Parent safety reuses the dialog shell but gates settings behind a simple PIN form; settings are roomy bordered rows, while privacy guidance is calm and the clear-data action is isolated and explicitly destructive. The break reminder is shorter and centered, with two equally sized `48px` actions.

Every modal dialog has a labeled close control, scroll-safe height, keyboard focus visibility, and a single unambiguous primary exit. Opening moves focus to its first enabled control; `Tab` and `Shift+Tab` remain contained within the active dialog; `Escape` closes it; closing restores focus to the element that launched it. Material and house dialogs additionally allow a backdrop click to close, without treating clicks inside the sheet as dismissal.

### Mobile Utility Navigation

Below `560px`, the world header is two rows: the centered wordmark occupies the first row and the utility actions form a horizontally scrollable pill rail on the second. Preserve the `44px` row and touch-safe target envelope, never wrap action labels, hide the scrollbar, and keep every function reachable without compressing the stage width.

### Action Icon Family

Quick-action icons are unified `24px` inline SVGs with no fill, graphite `1.9px` strokes, rounded caps, and rounded joins. Hand, jump arrow, door, sun, tree, dog, and apple all follow this one visual grammar.

## Do's and Don'ts

### Do:

- **Do** keep drafting paper, tracing paper, graphite structure, blue-pencil guides, and low-saturation colored-pencil fills consistent across every surface.
- **Do** preserve each AI companion's identity across its dedicated motion frames.
- **Do** author scene props as simple hand-drawn CSS forms with graphite edges and restrained warm shadows.
- **Do** use the same graphite inline-SVG stroke style for every quick action.
- **Do** keep the joint overlay optional, labeled by anatomy, and visually secondary during motion.
- **Do** keep chat as one continuous transcript with pale tracing-paper assistant bubbles, muted red-pencil user bubbles, visible typing feedback, and action-linked replies.
- **Do** keep human and animal calibration templates anatomy-aware, draggable, and honest about local processing.
- **Do** keep 原图 permanently available, process 轻度 / 中度 / 重度 treatments locally in browser `canvas`, cache completed results, and ignore stale asynchronous completions.
- **Do** disable treatment selection and final confirmation while processing, announce state through `aria-pressed` and a live status region, restore 原图 on failure, and keep small text at AA contrast.
- **Do** preserve the exact joint grab offset, use the rig canvas content-box origin and dimensions, clear only the matching captured pointer on up or cancel, and clamp by measured node half-size.
- **Do** keep story tasks short, progressive, and visibly subordinate to the world they control.
- **Do** preserve speaker attribution when switching between two companions in one transcript.
- **Do** keep pointer and touch dragging direct, bounded, and visibly acknowledged with grab/grabbing cursors, blue-pencil dashed selection, and temporary lift.
- **Do** keep the scene editor's labeled range controls synchronized as the keyboard-accessible positioning alternative.
- **Do** reuse the same scrim-and-paper layer system for scene editing, export, parent safety, and rest reminders while preserving their distinct risk levels.
- **Do** preserve the `1050px`, `820px`, and `560px` responsive behaviors, two-row mobile navigation, `44px` touch-safe targets, shared gold focus ring, and reduced-motion override.
- **Do** verify zero horizontal page overflow down to the `320px` minimum viewport.
- **Do** keep Chinese copy concise, warm, honest about local Demo behavior, and immediately actionable.
- **Do** use normal-sized plain-text header tools and concrete child-facing verbs: `加东西`, `装房子`, `移动东西`, `放前面`, `放后面`, and `拿走`.
- **Do** keep all 60 library items and 120 house presets visually previewable with code-native hand-drawn forms before selection.
- **Do** give every modal initial focus, `Escape` dismissal, contained tab order, and focus restoration to its launcher.

### Don't:

- **Don't** turn the experience into a generic AI upload dashboard or dense control console.
- **Don't** replace a selected character with a generic DOM puppet or unrelated animation asset.
- **Don't** use emoji as the primary living-world art for sun, tree, apple, house, or dog when authored assets and CSS props exist.
- **Don't** mix icon libraries, filled glyphs, or emoji into the unified quick-action SVG family.
- **Don't** add gradients as ornamental UI styling, glass effects, or low-contrast decoration; the stage's day/night sky transition is functional scenery.
- **Don't** show joint nodes permanently or force animal anatomy into human shoulder-and-hip terminology.
- **Don't** fragment the conversation into a stack of heavy cards or detach it visually and behaviorally from the living world.
- **Don't** open story, editing, export, or safety layers as competing dashboards or allow multiple modal planes to stack.
- **Don't** hide the active speaker, reset chat when switching companions, or render duplicate conversation panels.
- **Don't** let any scene object cross the measured stage boundary or allow drag completion to trigger its click action.
- **Don't** apply global button press transforms to rig nodes or calculate their drag coordinates from the rig canvas border box.
- **Don't** destructively replace the uploaded original, allow a stale treatment request to win, or leave enhancement and confirmation controls active while processing.
- **Don't** make drag the only way to position an object; keep labeled range controls available to keyboard users.
- **Don't** shrink mobile actions below the touch-safe envelope merely to fit every utility label on one line.
- **Don't** imply live AI capability or saved personal data when the shipped experience is local and replaceable.
- **Don't** use “图层” in child-facing UI or substitute oversized, infantilized controls for clear novice-friendly wording.
- **Don't** render material choices as generic chips or house presets as partial color swatches; show the whole object being chosen.
