import { createApp } from 'vue';

// Self-hosted so a strict CSP cannot break typography. Fontsource declares
// these as 'Geist Variable' and 'Fira Code Variable'; style.css must use those
// exact names or the browser falls back to system-ui without complaining.
import '@fontsource-variable/geist';
import '@fontsource-variable/fira-code';

import './style.css';
import App from './App.vue';

createApp(App).mount('#app');
