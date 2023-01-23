import { useFetchResources } from '@vuemodel/orion-pinia-orm'
import Todo from 'modules/Todo/Todo'

export default function useTodosFetcher () {
  const fetcher = useFetchResources(Todo, {
    immediate: true,
  })

  return {
    ...fetcher,
  }
}
