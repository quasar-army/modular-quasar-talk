<script setup lang="ts">
import { mdiPlus } from '@quasar/extras/mdi-v7'
import { useRemoveResource, useUpdateResource } from '@vuemodel/orion-pinia-orm'
import TodosList from 'modules/Todo/components/TodosList/TodosList.vue'
import Todo from 'modules/Todo/Todo'
import useTodosFetcher from './useTodosFetcher'
import useTodoCreator from './useTodoCreator'

const todosFetcher = useTodosFetcher()
const todosUpdater = useUpdateResource(Todo)
const todosRemover = useRemoveResource(Todo)
const todoCreator = useTodoCreator()
</script>

<template>
  <div>
    <TodosList
      v-model:form="todosUpdater.form.value"
      :todos="todosFetcher.repo.all()"
      bordered
      separator
      :updating-id="todosUpdater.updating.value"
      :removing-id="todosRemover.removing.value"
      @update="({ id, form }) => todosUpdater.update(id, form)"
      @remove="todo => todosRemover.remove(todo)"
    />

    <q-btn
      class="q-mt-md"
      :icon="mdiPlus"
      round
      color="primary"
      :loading="todoCreator.creating.value"
      @click="todoCreator.showDialog.value = true"
    />

    <q-dialog v-model="todoCreator.showDialog.value">
      <q-card>
        <q-card-section>
          Create the todo
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
