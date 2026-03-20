# NPM Publishing Guide

ClawNexus is now configured to be published on npm as the **`clawnexus`** package.

## Installation

Users can now install and run ClawNexus directly:

```bash
npx clawnexus
```

Or install globally:

```bash
npm install -g clawnexus
clawnexus
```

## Prerequisites

1. **npm Account** — [Create one at npmjs.com](https://www.npmjs.com/signup) if you don't have one
2. **Authenticated locally** — Run `npm login` and enter your credentials
3. **Verify ownership** — You must be the package owner or have publish permissions

## Publishing Process

### 1. Build the project

```bash
pnpm build
```

Verify the `dist/` directory is created with production assets.

### 2. Review package.json

Key publishing fields are already configured:

- `name`: `clawnexus` — The npm package name
- `version`: Auto-increment when releasing (e.g., `2026.3.9`)
- `bin`: Points to `bin/openclaw-office.js` as the `clawnexus` command
- `files`: Includes only `dist/`, `bin/`, `LICENSE`, `README.md`

### 3. Test the package locally

```bash
npm pack
# This creates clawnexus-2026.3.8.tgz
npm install ./clawnexus-2026.3.8.tgz -g
clawnexus --help
```

### 4. Publish to npm

```bash
npm publish
```

This will:
- Upload the package to npm registry
- Make it available via `npx clawnexus` immediately
- Update the package page on npmjs.com

### 5. Verify publication

```bash
npm view clawnexus
npx clawnexus --version
```

## Version Management

ClawNexus uses **calendar versioning** (`YYYY.M.D` format):

- Current: `2026.3.8`
- Next: `2026.3.9` (patch release)
- Next minor: `2026.4.0` (new month/feature)

Update version before publishing:

```bash
npm version patch      # 2026.3.8 → 2026.3.9
npm version minor      # 2026.3.8 → 2026.4.0
npm version major      # 2026.3.8 → 2027.0.0
```

Or manually edit `package.json`:

```json
{
  "version": "2026.3.9"
}
```

## Files Included in npm Package

Via `.npmignore`, only these files are packaged:

```
clawnexus/
├── dist/              # Production build (required)
├── bin/               # CLI scripts
├── LICENSE
└── README.md
```

Excluded:
- `src/` — TypeScript source
- `tests/` — Test files
- `.env*` — Environment files
- `node_modules/` — Dependencies
- Development configs (Vite, TypeScript, etc.)
- `CLAUDE.md` — Developer docs

## Updating Published Package

### For bug fixes or patches:

```bash
# Make changes, test locally
npm version patch
pnpm build
npm publish
```

### For features or breaking changes:

```bash
# Make changes, test locally
npm version minor  # or major for breaking changes
pnpm build
npm publish
```

## Troubleshooting

### "You do not have permission to publish"

- Verify you're logged in: `npm whoami`
- If no permission, request access from the package owner
- Or publish under a scoped package: `@yourname/clawnexus`

### "Could not find dist/ directory"

- Run `pnpm build` first to generate production files

### Package not found after publishing

- npm can take 1-2 minutes to replicate
- Verify with `npm view clawnexus` or check npmjs.com/package/clawnexus

## Quick Start for Users

Once published, users can:

```bash
# One-time run
npx clawnexus

# Or with options
npx clawnexus --gateway ws://my-gateway.com:18789 --port 3000

# Or install globally
npm install -g clawnexus
clawnexus
```

## Release Checklist

Before each publish:

- [ ] Update `version` in `package.json`
- [ ] Run `pnpm build`
- [ ] Run `npm pack` and test locally with `npm install -g`
- [ ] Verify `clawnexus --help` works
- [ ] Test against real Gateway if possible
- [ ] Update CHANGELOG (optional)
- [ ] Commit version bump and publish tag (optional)
- [ ] Run `npm publish`
- [ ] Verify on npmjs.com/package/clawnexus

---

**Package:** [`clawnexus` on npm](https://www.npmjs.com/package/clawnexus)

**Repository:** [github.com/prantikmedhi/openclaw-office](https://github.com/prantikmedhi/openclaw-office)
