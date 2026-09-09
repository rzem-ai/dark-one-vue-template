<script setup lang="ts">
import { MoonIcon, SunIcon } from '@lucide/vue';

import { Button } from '@/components/ui/button';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from '@/components/ai-elements/conversation';
import { useTheme } from '@/composables/useTheme';

// This shell exists to be deleted. It imports one shadcn-vue primitive and one
// AI Element on purpose: with 113 vendored components, a broken path alias or a
// missing peer dependency should fail here, on first `pnpm dev`, rather than an
// hour into a prototype.
const { theme, toggle } = useTheme();
</script>

<template>
  <div class="flex h-screen flex-col">
    <header class="flex shrink-0 items-center justify-between border-b px-5 py-3">
      <div class="flex items-baseline gap-2">
        <span class="text-sm font-medium">Dark One</span>
        <span class="font-mono text-xs text-muted-foreground">vue + shadcn-vue + ai-elements</span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
        @click="toggle"
      >
        <SunIcon v-if="theme === 'dark'" class="size-4" />
        <MoonIcon v-else class="size-4" />
      </Button>
    </header>

    <main class="min-h-0 flex-1">
      <Conversation class="h-full">
        <ConversationContent>
          <ConversationEmptyState
            title="Everything is wired up"
            description="65 shadcn-vue primitives and 48 AI Elements are installed and themed. Replace src/App.vue and start building."
          />
        </ConversationContent>
      </Conversation>
    </main>
  </div>
</template>
