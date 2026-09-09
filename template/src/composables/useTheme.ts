import { ref, watchEffect } from 'vue';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

function initial(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  // index.html ships class="dark", so dark is the default unless the document
  // says otherwise or the reader has expressed a preference.
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

const theme = ref<Theme>(initial());

watchEffect(() => {
  document.documentElement.classList.toggle('dark', theme.value === 'dark');
  localStorage.setItem(STORAGE_KEY, theme.value);
});

/** Shared across every caller — the ref lives at module scope by design. */
export function useTheme() {
  const toggle = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
  };
  return { theme, toggle };
}
