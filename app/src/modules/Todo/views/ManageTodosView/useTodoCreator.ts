import { useCreateResource } from '@vuemodel/orion-pinia-orm'
import Todo from 'modules/Todo/Todo'
import { ref } from 'vue'

export default function useTodoCreator () {
  const showDialog = ref(false)

  const creator = useCreateResource(Todo, {
    onCreate () {
      showDialog.value = false
    },
  })

  return {
    ...creator,
    showDialog,
  }
}
