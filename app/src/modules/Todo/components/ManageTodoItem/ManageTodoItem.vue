<script setup lang="ts">
import Todo from 'modules/Todo/Todo'
import { mdiDelete } from '@quasar/extras/mdi-v7'

interface Props {
  todo: Todo
}

defineProps<Props>()

const emit = defineEmits<{
  (event: 'delete'): void
}>()
</script>

<template>
  <q-item>
    <q-item-section side>
      <q-checkbox
        :true-value="1"
        :false-value="0"
        :model-value="todo.done"
      />
    </q-item-section>
    <q-item-section>
      {{ todo.title }}
    </q-item-section>
    <q-item-section side>
      <q-btn
        flat
        round
        size="sm"
        :icon="mdiDelete"
        @click="emit('delete')"
      />
    </q-item-section>
  </q-item>
</template>
