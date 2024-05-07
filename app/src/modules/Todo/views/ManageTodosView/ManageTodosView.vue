<script setup lang="ts">
import { useRemoveResource } from '@vuemodel/orion-pinia-orm'
import ManageTodosList from 'modules/Todo/components/ManageTodosList/ManageTodosList.vue'
import Todo from 'modules/Todo/Todo'
import useTodosFetcher from 'src/pages/ManageTodosPage/useTodosFetcher'

const todosFetcher = useTodosFetcher()
const todoRemover = useRemoveResource(Todo)
</script>

<template>
  <div>
    <ManageTodosList
      :todos="todosFetcher.repo.all()"
      @delete="todo => todoRemover.remove(todo)"
    />
  </div>
</template>
