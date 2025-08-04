import "./css/base.css";
import "./css/tailwind.css";

import { mount } from "svelte";

import { load_custom_prompts } from "~/stores/prompts.js";
import { initialize_theme } from "~/stores/theme.js";

import App from "./App.svelte";

load_custom_prompts();
initialize_theme();

mount(App, { target: document.body });
