# Waveform multitrack editor

Phase 1 is a responsive React, TypeScript, and Vite interface prototype. The starter tracks and clips are visual sample data; they are not audio files and do not produce sound.

## Run locally

Install dependencies with `pnpm install`, then start the development server with `pnpm dev`. Open the local URL printed by Vite. `npm run dev` is also available in a standard Node.js/npm installation.

## Publish with GitHub Pages

The included GitHub Actions workflow installs dependencies, runs the tests, builds the site with the repository path, and deploys the `dist` directory to GitHub Pages after pushes to `main`. In the repository settings, select **Settings → Pages → Build and deployment → GitHub Actions**. The repository must allow GitHub Pages for the account's plan and visibility.

## Current scope

- Main project header and action layout.
- Desktop track panel and horizontally scrollable timeline, with a simplified mobile layout and fixed transport area.
- Reusable track controls and clip components.
- Working UI state for creating an empty project, adding tracks, selecting sample clips, adjusting track volume, toggling mute/solo indicators, and zooming the timeline.
- Timeline coordinate and ruler formatting helpers with unit tests.

Import, save/open, undo/redo, playback, audio processing, and WAV export are deliberately disabled until their storage and audio-engine phases are implemented. Waveform shapes and the master meter are visual samples only.

## Checks

- `pnpm test` runs the timeline helper tests.
- `pnpm typecheck` checks the TypeScript project.
- `pnpm build` runs the TypeScript check and creates the production build.

## Next development task

Implement the audio asset and project data model, then add browser-local import and IndexedDB persistence before wiring decoded waveforms and synchronized Web Audio playback.
