---
name: quiqqer_bricks_create_and_edit_blocks
description: Use when creating or editing brick instances in a QUIQQER project (editorial work on content, settings, and custom CSS), especially when working from a screenshot or visual example or setting internal links. Not for developing new brick types in packages. Prefer existing bricks and the active template's design system, and treat visual references as direction, not as a pixel-perfect blueprint.
category: content
---

# QUIQQER Bricks Create And Edit Blocks

Use this skill for editorial brick work: creating brick instances in a project and editing their content,
settings, and custom CSS (for example through the bricks MCP tools).

## Scope

- Use this skill for brick creation and brick editing in the QUIQQER bricks workflow, even when the
  selected brick type is provided by another package.
- This skill does not cover developing new brick types (PHP controls, `bricks.xml`) in packages. For that,
  load `quiqqer_bricks_develop_brick_types` instead.
- Package-specific brick behavior and styling rules still come from the package that provides that brick.
- Keep the task focused on the brick itself. Do not expand it into unrelated page restructuring unless the
  prompt explicitly requires it.

## Safe MCP Workflow

- Before creating a brick, use `quiqqer_brick_types_list` to find suitable existing types and
  `quiqqer_brick_types_get` with settings to inspect the selected type's `hasContent` value, setting names,
  types, options, and defaults. Do not invent control identifiers or settings.
- Before editing a brick, load it with `quiqqer_bricks_get` including its attributes and keep the returned
  data as the source of truth.
- `quiqqer_bricks_update` replaces the complete `settings` object when `settings` is provided; it does not
  merge individual keys. Start from the current settings, change only the required keys, and send the full
  merged object. Never send a partial settings object. Apply the same read-modify-write rule to
  `customfields` when changing them.
- Omit `settings` or `customfields` from an update when they are not being changed.
- After creating or updating a brick, load it again with `quiqqer_bricks_get` and confirm that the intended
  values changed while unrelated content, attributes, settings, and custom fields stayed intact.

## Working Style

- Check first whether an existing brick already fits the task or can be adapted with small changes.
- Prefer extending or configuring an existing brick over introducing a parallel custom solution.
- When the instruction is to orient on an existing brick or page, copy or derive from it and adjust content
  and structure only as far as the task requires.
- Keep markup, fields, and content changes as small as possible.
- Preserve existing semantics and editor-facing structure unless the task requires a change.

## Visual References (Screenshots, Mockups)

- By default, treat screenshots and visual examples as stylistic direction, not as a pixel-perfect
  blueprint.
- Recreate the visual intent with the active template's own typography, spacing, components, and tokens.
  A result that deviates slightly from the screenshot but uses the design system is better than a
  pixel-perfect copy with duplicated CSS.
- Do not style every element individually to match the screenshot. Build the HTML first with the
  template's existing utility and component classes, then add CSS only for what remains.
- If the prompt explicitly asks for the closest possible reproduction, that task instruction overrides
  this default rule.

## Design System First

- Prefer semantic HTML elements and the active template's existing utility classes, component classes, and
  CSS tokens before writing custom CSS.
- Apply utility classes directly in the markup (for example `class="mt-0 text-center"`) instead of writing
  custom CSS for the same effect.
- Use semantic headings (`h1`–`h6`) instead of recreating heading styles manually, and let text inherit its
  default color where possible.
- Check the skill list for the active template's CSS classes skill (content category) and load it for the
  concrete class inventory. The active template may be a child template that only adds project-specific
  tokens and utilities; when its skill names a parent template, load the parent template's skills as well
  for the base inventory.
- Do not invent template-specific CSS conventions inside the bricks context.

## Custom CSS In Bricks

- Brick custom CSS is scoped to the brick by default when `customCSSScoping` is enabled. Preserve that
  setting and do not disable it unless the prompt explicitly requires global CSS. Do not build an
  artificial global prefix wrapper around normally scoped rules.
- Name classes locally, short and understandable, instead of unnecessarily long as with global CSS.
- Use the template's design tokens where they exist. Do not hardcode colors; use literal sizes only when
  the design system has no suitable token and the value is genuinely specific to this brick.
- The token inventory lives in the template's developer conventions skill. Load it as well when writing
  custom CSS — skills can be loaded by name regardless of their category.
- Prefer simple selectors. Automatic scoping handles normal rules and rules nested in `@media` or
  `@supports`; do not assume that global at-rules, `html`, `:root`, or selectors containing `body` are
  scoped automatically.
- In rare cases a rule must escape the automatic scoping, for example to style the brick's own wrapper
  element. Prefix the selector with `body` to bypass the scoping, and still limit it to this one brick
  through its ID class (`.brick-<id>`, rendered by quiqqer/bricks, or a template wrapper class such as
  `.brick-id-<id>` when the template provides one):

  ```css
  body .brick-116 { … }
  ```

  Never write unscoped global rules from brick custom CSS.

## Internal Links

- Use the internal QUIQQER link format instead of resolved URLs:

  ```text
  index.php?id=<siteId>&project=<project>&lang=<lang>
  ```

- When updating an existing internal link, determine only the new site ID and keep its existing `project`
  and `lang` parameters intact.
- When creating a new internal link, determine the site ID, project, and language from the target site. Do
  not save placeholders or guessed project and language values.
- Do not replace structured QUIQQER references with plain external-looking URLs.
