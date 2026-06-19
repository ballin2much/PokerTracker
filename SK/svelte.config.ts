import type { Config } from '@sveltejs/kit';

// Actual SvelteKit config (adapter, compilerOptions, etc.) lives in vite.config.ts,
// which takes priority over this file (supported since @sveltejs/kit 2.62). This file
// only exists as a fallback so tools that load it directly (e.g. editor extensions)
// don't break on a missing default export.
const config: Config = {};

export default config;
