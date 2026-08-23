# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Inferred from the supplied hackathon brief: React + Vite, selected because the repository is empty and the brief explicitly names it as the simplest fallback.

## Users

- Primary: children and parents turning a child's drawing into a playful interactive scene.
- Demo audience: hackathon judges who need to understand and try the complete interaction within seconds.

## Product Purpose

My Living Drawing makes a child's uploaded drawing or selected product-provided AI character feel alive. Success means a user can enter through a lightweight Demo login, upload an image or choose a human/animal companion, inspect its articulated rig, and trigger visible character and scene actions by buttons or natural-language Chinese commands, even without network access.

## Positioning

The product turns a single child's drawing into a small commandable world, combining object-level animation with simple natural-language control instead of merely filtering or captioning the image.

## Operating Context

This is a three-day hackathon demo used on a presentation device where network or AI APIs may fail. The happy path must be short, obvious, and stable.

## Capabilities and Constraints

- Upload a local child-drawing image and analyze it through an independently replaceable `analyzeDrawing(image)` module.
- Enter through an explicitly local, password-free Demo login.
- Choose from four product-provided AI cartoon companions before entering the world.
- Preserve the selected character artwork in the world and switch among identity-consistent idle, wave, jump, and eat animation frames.
- Human rigs use head, body, shoulder/elbow, and hip/knee nodes; animal rigs use species-specific movable parts.
- Local animal profiles cover dog, cat, rabbit, bird, horse, turtle, and octopus.
- Version one uses mock scene recognition so the experience is never blocked by AI availability.
- Render person, house and door, sun, tree, dog, and apple objects from one scene-object model.
- Trigger actions through one `playAction(objectId, action)` interface.
- Support person wave/jump/eat, door open/close, sunset/sunrise, tree shake, dog move/jump, and apple feed.
- Parse common Chinese commands locally with `parseCommand(text, sceneObjects)`.
- Hold short, contextual character conversations about greetings, feelings, hobbies, animals, and simple branching adventures; selected replies can trigger matching scene actions.
- Prefer CSS transforms and transitions over complex animation or backend systems.
- Do not fabricate live AI capability; mock analysis must be communicated honestly.

## Brand Commitments

- Product name: My Living Drawing.
- Promise: “让孩子画出来的世界活起来”.
- Voice: warm, concise, encouraging, and child-friendly.
- Character reactions include “你好呀！”, “风来啦！”, and “好吃！”.

## Evidence on Hand

The supplied product brief defines the scene model, required actions, fallback command vocabulary, basic page anatomy, and acceptance checklist. The user also supplied human and animal line-art references for joint reasoning. A four-character transparent sprite sheet was generated for this project at `src/assets/ai-character-sprite.png`. No logo, production AI endpoint, or user research was supplied.

## Product Principles

- A complete reliable demo is more valuable than technical complexity.
- Every important interaction works locally and visibly.
- One scene model and one action interface keep controls and language commands in sync.
- Feedback should make the world feel alive within a fraction of a second.
- New AI integrations must remain replaceable and must never block the fallback flow.

## Accessibility & Inclusion

The interface must remain keyboard-operable, use visible focus states, provide reduced-motion behavior, and preserve readable contrast. Uploaded images need user-provided or descriptive alternative text.
