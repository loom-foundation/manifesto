# The Loom Manifesto

*When machines build at speed, clarity becomes the craft.*

The canonical manifesto and the site that publishes it at <https://theloommanifesto.org>.

## Contents

| Path            | What                                                                          |
| --------------- | ---------------------------------------------------------------------------- |
| `manifesto.md`  | The manifesto: the source of truth.                                           |
| `meta/`         | Principles governing how the manifesto is developed.                          |
| `signatories/`  | The roster: Weavers (individuals) and Mills (teams). See its README to sign.  |
| `site/`         | The Astro site that renders the manifesto and the roster.                     |

## Signing

Anyone can sign by opening a pull request: see [`signatories/README.md`](signatories/README.md).

## Licensing

This repository holds **two works under two licences**:

- **The manifesto content** (`manifesto.md` and `meta/`) is licensed under **CC BY-ND 4.0** (see [`LICENSE`](LICENSE)). It is shared and quoted, not modified: no derivatives.
- **The website source** (everything under `site/`) is licensed under the **Apache License 2.0** (see [`site/LICENSE`](site/LICENSE) and [`site/NOTICE`](site/NOTICE)), matching the rest of the Loom Foundation's code.

Signatory files under `signatories/` record a name; by opening a pull request you agree the entry may be published and retained.

## Running the site

The site reads sibling repositories in the west workspace (the manifesto content here, brand assets in `org/`, and the design system in `packages/design-system/`), so assemble the workspace first:

```sh
cd path/to/loom-foundation && west update
cd manifesto/site && npm install && npm run dev
```
