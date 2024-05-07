import { useFetchResources } from '@vuemodel/orion-pinia-orm'
import Todo from 'modules/Todo/Todo'

export default function useTodosFetcher () {
  const todosFetcher = useFetchResources(Todo, {
    immediate: true,
  })

  return {
    ...todosFetcher,
  }
}
