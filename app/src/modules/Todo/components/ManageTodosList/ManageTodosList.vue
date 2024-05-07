<script setup lang="ts">
import Todo from 'modules/Todo/Todo'
import ManageTodoItem from '../ManageTodoItem/ManageTodoItem.vue'

interface Props {
  todos: Todo[]
}

defineProps<Props>()

const emit = defineEmits<{
  (event: 'delete', todo: Todo): void
}>()
</script>

<template>
  <q-list>
    <ManageTodoItem
      v-for="todo in todos"
      :key="todo.id"
      :todo="todo"
      @delete="emit('delete', todo)"
    />
  </q-list>
</template>
