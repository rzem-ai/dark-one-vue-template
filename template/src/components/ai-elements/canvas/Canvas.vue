<script setup lang="ts">
import type { ComputedRef } from 'vue'
import type { FlowEmits, FlowProps, FlowSlots } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { VueFlow } from '@vue-flow/core'
import { useForwardPropsEmits } from 'reka-ui'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const props = withDefaults(defineProps<FlowProps>(), {
  deleteKeyCode: () => ['Backspace', 'Delete'],
  fitViewOnInit: true,
  panOnDrag: false,
  panOnScroll: true,
  selectNodesOnDrag: true,
  zoomOnDoubleClick: false,
})

const emits = defineEmits<FlowEmits>()
const slots = defineSlots<FlowSlots>()
// vue-flow's FlowProps is large enough that useForwardPropsEmits's mapped
// return type exceeds TypeScript's instantiation depth (TS2589). The
// forwarding is correct at runtime; annotating the result stops the compiler
// reconstructing a type nothing here reads. Every other component in this
// tree uses the helper uninstrumented — this is specific to FlowProps.
const forwarded = useForwardPropsEmits(
  props as Record<string, unknown>,
  emits as unknown as (name: string, ...args: unknown[]) => void,
) as ComputedRef<Record<string, unknown>>
</script>

<template>
  <VueFlow data-slot="canvas" v-bind="forwarded">
    <Background />

    <template v-if="slots['connection-line']" #connection-line="connectionLineProps">
      <slot name="connection-line" v-bind="connectionLineProps" />
    </template>

    <template v-if="slots['zoom-pane']" #zoom-pane>
      <slot name="zoom-pane" />
    </template>

    <slot />
  </VueFlow>
</template>
