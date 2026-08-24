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

My Living Drawing is a quiet storybook workbench: warm drafting paper supports a clean pale-sky stage, graphite defines structure, and restrained colored-pencil fills make characters and props feel touched by hand. Construction guides belong only in editing and calibration tools; the finished living world stays free of grids, fold lines, ghost drawings, and wireframe clouds.

The same identity survives from character choice to motion. Product-provided companions retain recognizable sprite artwork, softened to low-saturation colored pencil. Houses, trees, backgrounds, sun, apple, stars, and ground use layered hand-drawn geometry with warm texture and coherent outlines. Scene objects are direct-manipulation pieces: pointer and touch dragging moves them inside measured stage bounds, while the scene editor provides labeled range controls as the keyboard-accessible alternative.

**Key Characteristics:**

- Warm drafting paper, translucent tracing paper, graphite marks, blue-pencil guides, and low-saturation colored-pencil fills form one unmistakable workbench.
- One framed stage is the interaction anchor; supporting controls stay compact and tactile.
- The living world has two real stages, `outdoor` and `room`; only objects belonging to the active scene are rendered or edited.
- AI-authored character identities remain recognizable across dedicated motion frames.
- CSS scenery and illustrated props use graphite construction and quiet fill rather than glossy clip art.
- All quick actions use one graphite inline-SVG stroke family.
- Quick actions stay collapsed behind one ordinary-sized `打开互动` control; expansion reveals every action plus a short reminder that the artwork itself can be clicked.
- The living world and its white paper conversation card read as one responsive two-column play surface.
- Conversation stays continuous and lightweight through pale tracing-paper assistant bubbles, muted red-pencil user bubbles, typing dots, quick-topic pills, and one composer.
- Uploaded drawings pass through an explicit paper-board calibration workspace; draggable red-pencil joints preserve the child’s artwork while making the local template model understandable.
- Before joint placement, the calibration workspace offers 原图 plus three Volcengine Ark Seedream image-to-image redraws—轻度保留画风, 中度绘本卡通, and 重度角色重绘—while permanently retaining 原图 as the non-destructive source.
- Joint calibration nodes are direct-manipulation buttons that preserve the exact grab offset, use the rig canvas content box, match pointer capture through completion, and stay fully inside measured half-size bounds.
- Story tasks, scene tools, export, and parent safety behave as compact layers around the stage rather than competing destinations.
- The world header uses normal-sized, novice-friendly plain-text tools; concise verbs explain the result without oversized or infantilized controls.
- Companion growth is calm and cumulative: meaningful learning, story, creation, outfit, and save milestones award one-time local experience; the compact `Lv.` entry and the full `我的形象` progress card show the same five-level path without rankings or punitive streaks.
- A focused material library uses six plain-language categories—伙伴, 背景, 互动, 自然, 摆件, and 狗窝—plus a 120-preset house decoration studio. Scene thumbnails depict recognizable illustrated places rather than abstract color swatches.
- A new world begins with only the background, one house, the primary person, and the dog. Sun, tree, food, toys, basket, and doghouse remain optional, fully interactive additions instead of forced defaults; saved projects retain everything their creator added.
- A second companion may join the same world; the transcript names and switches speakers without duplicating the conversation surface.
- Scene objects advertise direct manipulation with `grab`, change to `grabbing` with a blue-pencil dashed selection frame, and remain bounded inside the stage.
- The companion music control is a precisely draggable floating button whose position survives reloads and is re-clamped after resize or mobile layout changes.
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

The stage and desktop conversation card are fluid from `560px` to `760px` tall. The story task is a compact `270px` paper card inside the stage’s upper-left safe area, with a progress line and one obvious next action. Quick interaction occupies one ordinary control when closed instead of a large permanent region; when opened it reveals the complete action set and the hint `也可以直接点击画面里的角色和物件`. Every movable object stores its center as stage-relative percentages. Its measured half-width and half-height define per-object minimum and maximum coordinates, so the whole illustration remains inside the lightbox at every viewport size. A `5px` drag threshold separates taps from moves and preserves object actions after ordinary clicks.

At `1050px`, the world-and-chat grid stacks and the conversation card becomes a compact `430px`-high follow-on surface. At `820px`, the remaining two-column surfaces become one column, including the calibration workspace; the avatar grid becomes two columns and quick actions become a horizontally scrollable rail. At `560px`, page inset contracts to `12px`, the stage becomes a tall `600px` minimum viewport with a `6px` paper corner, and the conversation card becomes `420px` high. The header becomes two rows: a centered wordmark first, then a horizontally scrollable utility rail. Mobile topics, dialog actions, editor confirmations, joint/story toggles, and other primary controls keep a `44px` minimum touch target. Composer text yields to its arrow on the narrow send button, and horizontal action rails scroll internally without increasing page width.

The calibration artwork-treatment selector uses four equal columns on desktop, two columns on narrow desktop, returns to four compact columns on mobile, and collapses to two columns at `430px` and below. Every treatment remains an ordinary control rather than a hero card and preserves at least a `44px` touch height.

The application must maintain zero horizontal page overflow at the `320px` minimum viewport, including the implemented `390px` mobile layout. Use `min-width: 0` on grid children, contain horizontal rails inside their parent, and reserve scroll behavior for explicitly labeled carousels and utility rails; `body` remains `overflow-x: hidden` as a final guard, not as a substitute for correct sizing. At `390px`, scene navigation and editor controls retain `44px` touch targets.

The floating companion music button stores a viewport-safe position rather than participating in page flow. Clamp it by its measured half-size on every move, persist the final position locally, and re-clamp it whenever the viewport resizes or the mobile layout breakpoint changes. Neither the button nor its open panel may create desktop or mobile page overflow.

The material library and house decoration studio are centered desktop dialogs with contained scrolling. Below `700px`, each docks to the viewport bottom as a sheet capped at `92dvh`; category and motif tabs scroll within their own rail, item grids reduce to two columns, every tab and utility action preserves a `44px` target, and no dialog content may widen the page.

Scene editing is a `420px` right drawer on desktop and a bottom sheet capped at `78dvh` on mobile. Export and parent safety use centered, scroll-safe dialogs with `24px` outer insets and a dark graphite scrim; the break reminder uses the same modal plane. Only one such modal layer may be open at once, and destructive local-data actions stay visually separated from ordinary settings.

Spacing follows the observed rhythm of `8px`, `12px`, `16px`, `24px`, `34px`, and `48px`. Preserve generous air around the stage and keep control internals dense and consistent.

**The One Stage Rule.** Each step has one dominant framed task surface; secondary controls orbit it instead of creating competing dashboards.

## Elevation & Depth

Depth comes from translucent sheets laid on a workbench. Fine graphite borders define paper edges; restrained warm-gray ambient shadows separate major sheets without plastic button bases. Sprite characters and scene props use low, soft drop shadows only when needed to remain legible over the clean sky and ground. Dragging temporarily increases lift to show that a piece has left the paper plane.

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
- **Quick Interaction Toggle:** One ordinary-sized `打开互动` / `收起互动` button with `aria-expanded`; it replaces the formerly large always-visible quick-action block without removing any action.
- **Hover / Focus / Active:** Hover increases contrast or adds a slight warm lift; focus uses a `4px` gold ring with `3px` offset; active shifts down `1px` and scales to `0.985`.

### Chips

Status chips are compact green-on-pale-green pills. They report recognition or local-demo state and never resemble selectable filters.

### Cards / Containers

Major cards are warm near-opaque paper sheets with `1.5px` graphite borders, `12px` corners, and one shared ambient shadow. The living stage is a clean pale-sky field with a quiet colored-pencil ground wash; it never displays graph paper, construction folds, ghost characters, or outline clouds. Selected avatar cards use a pale blue-pencil tint and `aria-pressed`, never a glossy glow.

The avatar growth card lives inside `我的形象`, below the active companion rather than as a separate dashboard. It pairs a red-pencil level stamp, green linear experience track, explicit `再获得 N 经验` copy, the next reward, and five plain-language milestones. The compact world-header entry shows only `Lv.` and the current title; below `620px`, only the level remains so the existing tool rail keeps its space. Experience persists locally across projects, repeated event IDs never farm points, and clearing local data removes growth with the rest of the user's work.

Calibration, story, and modal surfaces reuse the same graphite-and-paper family. The scene drawer keeps a square desktop edge against the viewport and changes to a softly rounded top edge when docked to the mobile bottom.

### Inputs / Fields

Fields use Warm White, a fine blue-gray border, `9px`–`12px` corners, `50px`–`56px` height, and heavy rounded text. Range inputs use the red-pencil accent, explicit horizontal/vertical labels, and bounds derived from the actual object size. Focus uses the shared gold ring; disabled command submission becomes muted graphite-gray and visibly unavailable.

### Navigation

Headers stay transparent and low-density so the stage retains authority. The wordmark uses a small red-pencil spark; utility actions are normal-sized plain-text controls with minimal decoration. The first-line tools are `加东西`, `装房子`, `自己画`, `保存`, and `更多`; the overflow menu continues with concrete task language such as `移动东西`. The centered status disappears where the active surface already repeats it.

Do not expose implementation language such as “图层” to children. Object arrangement uses `移动东西`, `放前面`, `放后面`, and `拿走`, while creation uses `加东西` and `装房子`. These labels describe what happens in the world rather than the data model behind it.

### Material Library

The library is organized into six plain-language categories: 伙伴, 背景, 互动, 自然, 摆件, and 狗窝. Every choice has a code-native CSS preview assembled from recognizable category-specific silhouettes, small hand-drawn variations, and low-saturation pencil colors; do not depend on generic color blocks, stock thumbnails, or network imagery. The ten background previews show their actual place—meadow, forest path, beach, night camp, rainbow, autumn park, snow cottage, flower garden, sunrise valley, or moonlit lake.

Selecting a non-background material adds a named, saved scene object and closes the library. Interactive additions use real world IDs and actions, so adding the tree immediately exposes `摇摇树`, adding food enables feeding, and adding dog toys or the doghouse enables their related actions. The object can be dragged, resized, duplicated, undone, redone, or removed and persists with the saved world. Selecting a background applies it directly to the stage sky, ground, and light treatment instead of creating a draggable object. Cards say `放进去` or `换背景` so the consequence is explicit before activation.

### House Decoration Studio

The house studio contains exactly 120 unique presets: six pencil palettes × five motif families × four window accents. Its five tabs are 圆点, 条纹, 方格, 花朵, and 星星. Every preset button shows a complete miniature house—not a color chip—with roof, patterned wall, door, and two windows, plus its preset and accent names.

A large live house preview updates immediately when a preset is clicked, and the selected treatment applies to the real house without a separate commit step. The studio opens only from the explicit header tool `装房子`; the house inside the world follows normal object behavior instead of duplicating that entry point. A single click selects it for move, resize, copy, undo, or removal, while a double click opens or closes its door. The full-width `装好啦` action simply closes the studio after exploration.

### Motion Sprite Characters

Each product-provided character has a dedicated 2×2 motion sheet. Every human sheet and outfit sheet must be a genuine RGBA cutout: the four outer corners are transparent, the surrounding paper is removed, and white details inside the character remain opaque. CSS changes `background-position` to select identity-consistent idle, wave, jump, and eat frames, then applies a short whole-cutout motion accent. The dog follows the same approach for idle, move, jump, and sit. Never fake cutouts with `mix-blend-mode`, substitute an unrelated figure, or rebuild the chosen character as generic geometry.

### Hand-Drawn World Props

Sun, tree, apple, house, door, stars, and ground are authored with CSS geometry, low-saturation pencil fills, graphite outlines, and minimal warm shadows. Their action states are semantic: the door rotates in perspective, the sun descends into a charcoal world, the tree shakes, and the apple travels toward the character. Keep the stage visually clean: do not repeat the uploaded character as a low-opacity `drawing-backdrop`, and do not add decorative wireframe clouds.

The tree uses an irregular layered crown, leaf highlights, bark variation, and a soft grounded shadow rather than three flat circles. The cottage keeps roof and wall in separate bands, with a readable tiled roof, chimney, windows, arched door, flower box, and one shared hand-drawn outline language. Background thumbnails and their applied stages must describe the same place.

### Outdoor & Room Scenes

The world contains two implemented scenes: `outdoor` and `room`. The room inherits the Animator's Light Table language through warm paper, graphite outlines, and low-saturation colored-pencil furniture. Its bed, desk, chair, and bookcase are ordinary draggable scene objects. The stage renders only objects whose `sceneId` matches `currentSceneId`, and SceneEditor lists only that same current-scene subset.

Opening the house door and completing the move inside switches to `room`; the room provides a clear `去室外` action to return. World state persists `currentSceneId`, each object's `sceneId`, and separate `outdoor` / `room` character entries under `scenePositions`, capturing the character position when entering a scene. Older saved objects without `sceneId` migrate to `outdoor`. The existing four `sceneTheme` choices remain outdoor-only visual themes and do not restyle the room.

### Companion Mini Games

Rock-paper-scissors and card comparison reuse the same warm paper, coral pencil, pale blue frame, and rounded typography as the living world. Score, current round, result, and next action form a clear top-to-bottom sequence. Large empty prototype areas, harsh black borders, and unrelated game-template styling are forbidden. Choice controls keep at least `44px` targets, distinct but restrained color coding, visible focus, short result motion, and zero mobile overflow.

### Direct-Manipulation Scene Objects

Every visible `.scene-object` is a native button that supports click actions plus pointer-based dragging on mouse, pen, and touch. At rest it uses `cursor: grab`, `touch-action: none`, and `user-select: none`. Dragging begins only after a `5px` movement threshold, captures the pointer, raises the object above overlays, changes to `grabbing`, adds Drag Lift, and draws a blue-pencil `1px` dashed frame `8px` outside the object (`5px` on mobile). Releasing or cancelling always clears the drag state; a completed drag suppresses the accidental click that would otherwise fire the object's action.

The stage house is the explicit exception to single-click action playback: single click selects it, double click toggles the door, and `装房子` remains an explicit header tool. Keyboard users can select the house with its button and use the expanded quick-interaction action for opening or closing the door.

Movement is calculated from the object's center plus the initial pointer offset. Clamp the resulting stage-relative percentages using the rendered object's half-width and half-height, with a small safety inset, so no artwork can be dragged outside the stage. Recompute bounds when the scene or viewport changes.

### Companion Music Control

The music launcher is a floating companion button, not a fixed corner ornament. Preserve the exact pointer-to-button grab offset, begin dragging only after `5px`, call pointer capture for the matching pointer, and release it on matching `pointerup` or `pointercancel`. Clamp the complete measured button inside the viewport, persist its settled position locally, and re-clamp the restored position after resize and mobile breakpoint changes. A tap that stays below the threshold opens or closes music; a completed drag never toggles it.

The music panel provides direct entrances to `位置和大小`, `加东西`, `装房子`, and `显示关节` / `隐藏关节`. `位置和大小` opens the existing SceneEditor controls, including its original size control; this dock adds routes to those capabilities and does not replace or reduce the SceneEditor.

### Joint Inspector

The joint toggle is a small tracing-paper control at rest and red-pencil when active. It reveals labeled red-pencil-and-graphite nodes positioned over the preserved sprite artwork plus a compact rig summary. During motion, nodes fade to reduce visual clutter; the overlay remains optional and diagnostic.

### Joint Calibration Editor

The upload follow-on is a two-step calibration workspace, not a simulated recognition result. The uploaded drawing fills a white, graphite-framed canvas with contained image scaling. Draggable `20px` red-pencil nodes are native direct-manipulation buttons with a white inner border, graphite outer ring, grab cursor, and adjacent graphite label. They are excluded from global button press transforms so pressing a node cannot shift its calibrated center. Human, dog, and rabbit templates appear as stacked `56px` controls; the active template flips to red pencil and updates its anatomy-aware node list. On compact screens, the canvas stacks above the controls, remains at least `460px` tall, and follows the compact paper radius.

Artwork treatment is a Volcengine Ark Seedream image-to-image redraw through `/images/generations`, not a local browser filter. 原图 is retained permanently and can always be restored without a request; 轻度 preserves the original style while refining it, 中度 redraws it as a picture-book cartoon, and 重度 performs a more complete character redraw. Before the user acts, state plainly that the drawing will be uploaded to Volcengine Ark for AI analysis or redraw and that the work remains saved on this device.

Cache completed results per source and treatment. Give every selection a request identity, abort the previous browser request and any request still active when the editor unmounts, and accept a completion only when its identity is still current. The server propagates client aborts and disconnects through to Ark, and bounds the upstream generation request with a `180s` timeout. While processing, disable all four treatment choices and final confirmation; on a non-abort failure, restore 原图 and show a retryable message. Selection remains exposed through `aria-pressed`, while a nearby `role="status"` region announces processing, completion, and failure without stealing focus.

The redraw endpoint accepts only PNG, JPEG, WEBP, or GIF data URLs whose decoded input is at most `6MB`. Generated output is capped at `12MB`; base64 output is treated as PNG, while downloaded output must declare an `image/*` MIME type before it is accepted. `ARK_IMAGE_MODEL` is configured independently from the vision and chat models and defaults to `doubao-seedream-4-0-250828`.

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

Scene editing is the keyboard-accessible alternative to free dragging: a directional drawer with theme controls, one object card per current-scene piece, and labeled horizontal/vertical range inputs using the same measured bounds as the stage. It filters by `currentSceneId`; outdoor theme controls retain the existing four choices and affect only the outdoor stage. This is not a second positioning model; both interfaces update the same coordinates. Its child-facing arrangement controls say `移动东西`, `放前面`, `放后面`, and `拿走`, never “图层”. Export is a centered paper dialog with a pale tracing-paper preview and large stacked choices for SVG, JSON, and copyable text. Parent safety reuses the dialog shell but gates settings behind a simple PIN form; settings are roomy bordered rows, while privacy guidance is calm and the clear-data action is isolated and explicitly destructive. The break reminder is shorter and centered, with two equally sized `48px` actions.

Every modal dialog has a labeled close control, scroll-safe height, keyboard focus visibility, and a single unambiguous primary exit. Opening moves focus to its first enabled control; `Tab` and `Shift+Tab` remain contained within the active dialog; `Escape` closes it; closing restores focus to the element that launched it. Material and house dialogs additionally allow a backdrop click to close, without treating clicks inside the sheet as dismissal.

### World & Background Drawing Steps

The `画世界` and `画背景` steps share one restrained graphite-and-tracing-paper return button in the same position and visual style. It returns to the immediately preceding workspace, keeps a `44px` mobile target, and never competes with the drawing canvas.

### Mobile Utility Navigation

Below `560px`, the world header is two rows: the centered wordmark occupies the first row and the utility actions form a horizontally scrollable pill rail on the second. Preserve the `44px` row and touch-safe target envelope, never wrap action labels, hide the scrollbar, and keep every function reachable without compressing the stage width.

### Action Icon Family

Quick-action icons are unified `24px` inline SVGs with no fill, graphite `1.9px` strokes, rounded caps, and rounded joins. Hand, jump arrow, door, sun, tree, dog, and apple all follow this one visual grammar.

## Do's and Don'ts

### Do:

- **Do** keep drafting paper, tracing paper, graphite structure, blue-pencil guides, and low-saturation colored-pencil fills consistent across every surface.
- **Do** preserve each AI companion's identity across its dedicated motion frames.
- **Do** use genuinely transparent RGBA character and outfit sheets so the same cutout works on the stage, material cards, and wardrobe preview without a white paper rectangle.
- **Do** author scene props as simple hand-drawn CSS forms with graphite edges and restrained warm shadows.
- **Do** start a new world with only background, house, primary person, and dog; make every other prop an explicit addable choice without removing its interaction.
- **Do** keep the living stage clear of grid lines, fold marks, ghost silhouettes, and outline-only clouds.
- **Do** render and edit only the active `currentSceneId`; keep room furniture draggable and preserve independent outdoor/room character positions.
- **Do** default legacy objects without `sceneId` to `outdoor`, and keep all four `sceneTheme` choices scoped to outdoor visuals.
- **Do** use the same graphite inline-SVG stroke style for every quick action.
- **Do** collapse quick interaction to one normal-sized open/close button, preserve every action when expanded, and remind users that the stage artwork is directly clickable.
- **Do** keep the joint overlay optional, labeled by anatomy, and visually secondary during motion.
- **Do** keep chat as one continuous transcript with pale tracing-paper assistant bubbles, muted red-pencil user bubbles, visible typing feedback, and action-linked replies.
- **Do** keep human and animal calibration templates anatomy-aware and draggable, and disclose before action that AI analysis or redraw uploads the drawing to Volcengine Ark while the work stays saved on this device.
- **Do** keep 原图 permanently available; use Seedream image-to-image for 轻度保留画风, 中度绘本卡通, and 重度角色重绘; cache each source-and-treatment result; and reject stale request identities.
- **Do** abort superseded and unmounted browser requests, propagate client disconnects through the server to Ark, enforce the `180s` upstream timeout, disable treatment selection and final confirmation while processing, and restore 原图 on failure.
- **Do** accept only PNG, JPEG, WEBP, or GIF redraw inputs up to `6MB`, cap generated output at `12MB`, validate downloaded output as `image/*`, and keep `ARK_IMAGE_MODEL` independent from vision/chat with the `doubao-seedream-4-0-250828` default.
- **Do** preserve the exact joint grab offset, use the rig canvas content-box origin and dimensions, clear only the matching captured pointer on up or cancel, and clamp by measured node half-size.
- **Do** keep story tasks short, progressive, and visibly subordinate to the world they control.
- **Do** preserve speaker attribution when switching between two companions in one transcript.
- **Do** keep pointer and touch dragging direct, bounded, and visibly acknowledged with grab/grabbing cursors, blue-pencil dashed selection, and temporary lift.
- **Do** give the music launcher exact-offset pointer capture, a `5px` drag threshold, viewport clamping, persisted position, and resize/mobile re-clamping; keep the SceneEditor size control intact behind `位置和大小`.
- **Do** use the same quiet return button in both world- and background-drawing steps.
- **Do** keep the scene editor's labeled range controls synchronized as the keyboard-accessible positioning alternative.
- **Do** reuse the same scrim-and-paper layer system for scene editing, export, parent safety, and rest reminders while preserving their distinct risk levels.
- **Do** preserve the `1050px`, `820px`, and `560px` responsive behaviors, two-row mobile navigation, `44px` touch-safe targets, shared gold focus ring, and reduced-motion override.
- **Do** verify zero horizontal page overflow down to the `320px` minimum viewport.
- **Do** preserve zero horizontal overflow and `44px` scene controls at the implemented `390px` mobile width.
- **Do** keep Chinese copy concise, warm, honest about local Demo behavior, and immediately actionable.
- **Do** use normal-sized plain-text header tools and concrete child-facing verbs: `加东西`, `装房子`, `移动东西`, `放前面`, `放后面`, and `拿走`.
- **Do** keep house selection, door interaction, and decoration as three distinct actions: single click selects, double click toggles the door, and the header's `装房子` opens decoration.
- **Do** keep every library item and all 120 house presets visually previewable with code-native hand-drawn forms before selection.
- **Do** give every modal initial focus, `Escape` dismissal, contained tab order, and focus restoration to its launcher.

### Don't:

- **Don't** turn the experience into a generic AI upload dashboard or dense control console.
- **Don't** replace a selected character with a generic DOM puppet or unrelated animation asset.
- **Don't** bake white or checkerboard backgrounds into character sheets or use blend modes to imitate transparency.
- **Don't** use emoji as the primary living-world art for sun, tree, apple, house, or dog when authored assets and CSS props exist.
- **Don't** mix icon libraries, filled glyphs, or emoji into the unified quick-action SVG family.
- **Don't** add gradients as ornamental UI styling, glass effects, or low-contrast decoration; the stage's day/night sky transition is functional scenery.
- **Don't** show joint nodes permanently or force animal anatomy into human shoulder-and-hip terminology.
- **Don't** fragment the conversation into a stack of heavy cards or detach it visually and behaviorally from the living world.
- **Don't** open story, editing, export, or safety layers as competing dashboards or allow multiple modal planes to stack.
- **Don't** hide the active speaker, reset chat when switching companions, or render duplicate conversation panels.
- **Don't** let any scene object cross the measured stage boundary or allow drag completion to trigger its click action.
- **Don't** show objects from the inactive scene in the stage or SceneEditor, or apply an outdoor `sceneTheme` to the room.
- **Don't** restore the uploaded figure as a translucent `drawing-backdrop` or decorate the clean stage with wireframe clouds.
- **Don't** show abstract background swatches when the user is choosing a specific place, or let a material preview disagree with its world rendering.
- **Don't** let the quick interaction area, music button, music panel, or drawing-step navigation introduce horizontal overflow on desktop or mobile.
- **Don't** apply global button press transforms to rig nodes or calculate their drag coordinates from the rig canvas border box.
- **Don't** destructively replace the uploaded original, allow a stale treatment request to win, or leave enhancement and confirmation controls active while processing.
- **Don't** make drag the only way to position an object; keep labeled range controls available to keyboard users.
- **Don't** shrink mobile actions below the touch-safe envelope merely to fit every utility label on one line.
- **Don't** describe Seedream redraw as a local filter, conceal its Volcengine Ark upload, or imply that the locally saved work makes the AI request device-only.
- **Don't** use “图层” in child-facing UI or substitute oversized, infantilized controls for clear novice-friendly wording.
- **Don't** render material choices as generic chips or house presets as partial color swatches; show the whole object being chosen.
- **Don't** open the decoration studio when the user clicks the house in the world; that click belongs to object selection.
