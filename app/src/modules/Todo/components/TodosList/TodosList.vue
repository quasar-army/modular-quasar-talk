<script setup lang="ts">
import Todo from 'modules/Todo/Todo'
import { ModelForm } from 'src/packages/orion-pinia-orm/types/ModelForm'
import TodoItem from './TodoItem.vue'

interface Props {
  todos: Todo[]
  removingId?: string | number | false
  updatingId?: string | number | false
}

defineProps<Props>()

const emit = defineEmits<{
  (event: 'remove', todo: Todo): void
  (event: 'update', payload: { id: string, form: ModelForm<Todo> }): void
}>()
</script>

<template>
  <q-list>
    <TodoItem
      v-for="todo in todos"
      :key="todo.id"
      :title="todo.title"
      :done="todo.done"
      :removing="removingId === todo.id"
      :updating="updatingId === todo.id"
      @update="form => emit('update', { id: todo.id, form })"
      @remove="emit('remove', todo)"
    />
  </q-list>
</template>
