<script setup lang="ts">
import { useFetchResources } from '@vuemodel/orion-pinia-orm'
import Todo from 'modules/Todo/Todo'

const todosFetcher = useFetchResources(Todo)
</script>

<template>
  <q-page
    padding
    class="column flex-center"
  >
    <q-btn
      label="fetch"
      :loading="todosFetcher.fetching.value"
      color="primary"
      outline
      @click="todosFetcher.fetch()"
    />

    <pre>{{ todosFetcher.repo.all() }}</pre>
  </q-page>
</template>
