/**
 * Content Collections — manifesto loader.
 *
 * The manifesto markdown lives at the manifesto repo root (`../manifesto.md`
 * relative to the site), OUTSIDE the site's `src/` tree, because the markdown
 * is the brand's primary artefact and the site is a consumer of it. The text
 * must not be moved or copied — Astro's `glob` loader is pointed at the
 * repo root to read the canonical file in place.
 *
 * The collection has a single entry (`manifesto`). The page reads it
 * via `getEntry('manifesto', 'manifesto')` and renders the body inside
 * the `.manifesto` article, which the site's own global.css styles.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const manifesto = defineCollection({
  loader: glob({
    pattern: 'manifesto.md',
    base: '../',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    version: z.string().optional(),
  }),
});

/**
 * Signatories — the roster of those who stand with the manifesto.
 *
 * Like `manifesto.md`, the signature files live OUTSIDE the site's `src/`
 * tree, at the repository root under `signatories/`. They are first-class
 * artefacts contributed by pull request (one file per signatory), not site
 * source — the site is a consumer that renders them at build time. The
 * markdown is never moved or copied; the glob loader reads it in place.
 *
 * Two tiers, two collections, two schemas:
 *   - `weavers` — individuals. The GitHub handle IS the filename (the entry
 *     `id`); the avatar and profile link derive from it, so identity is
 *     self-authenticating. A `github` field is optional — CI checks it
 *     matches the filename when present, but signers need not write it.
 *   - `mills` — teams / organisations. `name` and a verifiable `url` are
 *     required; these are maintainer-gated on review.
 */

/**
 * The evidence block stamped into a Mill file AFTER merge by the
 * `record-signatures` workflow. It is never hand-written; signers omit it and
 * the action strips and rewrites it on every merge. It is the durable,
 * committed record of which org insider signed, how they were verified
 * (`public-member` or `control-file`), and when. Kept optional so a file is
 * valid before the stamp lands. See .github/workflows/record-signatures.yml.
 */
const verification = z
  .object({
    'signed-by': z.string(),
    org: z.string(),
    'org-membership': z.enum(['public-member', 'control-file', 'unverified']),
    'verified-via': z.string().url().optional(),
    signed: z.coerce.date().optional(),
  })
  .optional();

// Weavers: the handle IS the filename; identity is self-authenticating, so no
// field is required. `name` is an optional display override, `github` an
// optional guard CI checks against the filename, and `role` an optional label
// shown alongside the name (defaults to "Weaver" at render time).
const weavers = defineCollection({
  loader: glob({
    pattern: '*.md',
    base: '../signatories/weavers/',
  }),
  schema: z.object({
    github: z.string().optional(),
    name: z.string().optional(),
    role: z.string().optional(),
    signed: z.coerce.date().optional(),
  }),
});

// Mills: the path is `mills/<org>/<team>.md`. The org (the entry `id`'s first
// segment) is the verifiable anchor and drives the logo/link; the team slug is
// a self-asserted label. `url` is only present on the private-member path,
// pointing at the org-owned control file. Nothing here is required.
const mills = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: '../signatories/mills/',
  }),
  schema: z.object({
    name: z.string().optional(),
    logo: z.string().url().optional(),
    url: z.string().url().optional(),
    signed: z.coerce.date().optional(),
    verification,
  }),
});

export const collections = { manifesto, weavers, mills };
