import { svelte } from "@sveltejs/vite-plugin-svelte";
import { execFileSync as exec } from "child_process";
import { prep_vite_proxy } from "components/src/util.js";
import path from "path";
import AutoImport from "unplugin-auto-import/vite";

import pkg from "./package.json";

const is_build = process.argv.includes("build");

// Config
const config = pkg.config;
let proxy = {};
if (!is_build) {
  for (const k in config) {
    if (k in process.env && config[k] !== process.env[k]) {
      console.warn(`\n\n❗❗ Overriding default config for ${k}❗❗\n\n`);
      config[k] = process.env[k];
    }
  }

  proxy = prep_vite_proxy([["/utils-api", config.UTILS_API_URL]]);
  // rewrite the urls to point to the proxied endpoints
  config.UTILS_API_URL = "/utils-api";
}

const vars = {
  "window.__BUILD_DATE__": `'${new Date().toISOString()}'`,
  "window.__BUILD_HASH__": `'${exec("git rev-parse --short HEAD || true", { shell: true }).toString().trim()}'`,
  "window.__APP_VERSION__": `'${pkg.version}'`,
  "window.__DEBUG__": !is_build,
  "window.CONFIG": JSON.stringify({ ...pkg.config }),
  "window.addEventListener": `globalThis?.window?.addEventListener || (() => { })`,
};

/** @type {import('vite').UserConfig}*/
export default {
  publicDir: is_build ? false : "public",
  build: {
    reportCompressedSize: false,
    minify: false,
    sourcemap: true,
    lib: {
      entry: "src/main.js",
      formats: ["es"],
      fileName: (format) => `bundle.${format}.js`,
    },
  },
  server: {
    fs: {
      allow: ["../.."],
    },
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
    host: !!process.env.VITE_HOST,
    port: +(process.env.VITE_PORT || 5035),
    proxy,
  },
  resolve: {
    alias: [
      { find: "~", replacement: path.resolve("src") },
      { find: "$lib", replacement: path.resolve("src/lib") },
      { find: "$ui", replacement: path.resolve("src/lib/components/ui") },
    ],
  },
  define: is_build ? {} : vars,
  worker: {
    format: "es",
    rollupOptions: {
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
  plugins: [
    svelte({
      onwarn(warning, handler) {
        const IGNORED_WARNINGS = [
          "a11y_autofocus",
          "a11y_click_events_have_key_events",
          "a11y_no_static_element_interactions",
          "a11y_label_has_associated_control",
          "a11y_no_noninteractive_element_interactions",
        ];
        if (!IGNORED_WARNINGS.includes(warning.code)) handler(warning);
      },
    }),
    AutoImport({
      imports: [
        "svelte",
        "svelte/store",
        "svelte/transition",
        "svelte/animate",
      ],
      dts: "./src/auto-imports.d.ts",
    }),
  ],
};
