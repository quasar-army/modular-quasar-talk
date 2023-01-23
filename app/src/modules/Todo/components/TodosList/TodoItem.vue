<script lang="ts" setup>
import { mdiDelete } from '@quasar/extras/mdi-v7'
import Todo from 'modules/Todo/Todo'
import { ModelForm } from 'src/packages/orion-pinia-orm/types/ModelForm'
import { syncRef } from '@vueuse/core'
import { ref, toRefs } from 'vue'

interface Props {
  title: string | null
  done: 0 | 1
  updating: boolean
  removing: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (event: 'remove'): void
  (event: 'update', form: ModelForm<Todo>): void
}>()

const { title, done } = toRefs(props)

const titleInput = ref('')
syncRef(title, titleInput, { direction: 'ltr' })

const doneInput = ref('')
syncRef(done, doneInput, { direction: 'ltr' })
</script>

<template>
  <q-item>
    <q-item-section side>
      <q-checkbox
        :true-value="1"
        :false-value="0"
        :model-value="done"
        :disable="updating"
        @update:model-value="isDone => emit('update', { done: isDone })"
      />
    </q-item-section>

    <q-item-section>
      <q-input
        v-model="titleInput"
        borderless
        :loading="updating"
        @blur="emit('update', { title: titleInput })"
      />
    </q-item-section>

    <q-item-section side>
      <q-btn
        flat
        round
        :icon="mdiDelete"
        :loading="removing"
        @click="emit('remove')"
      />
    </q-item-section>
  </q-item>
</template>
