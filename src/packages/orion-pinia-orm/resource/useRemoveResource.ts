import { Repository, useRepo } from 'pinia-orm'
import { computed, ComputedRef, Ref, ref } from 'vue'
import { StandardErrors } from '../errors/useStandardErrors'
import getConfig from '../plugin/getConfig'
import useRest from '../rest/useRest'
import { Model } from '../types'
import { ResourceNode } from '../types/ResourceNode'

export type OnRemoveCallback<ModelType extends Model> = (model: ResourceNode<ModelType>) => void

export interface RemoveResourceOptions<ModelType extends Model> {
  id?: string | number
  onRemove?: OnRemoveCallback<ModelType>
  notifyOnError?: boolean
  persist?: boolean
}

export interface UseRemoveResourceReturn<ModelType extends Model> {
  id: Ref<string | number | null>
  remove: (resourceParam?: number | {
      id: number | string;
  } | undefined) => Promise<void>
  repo: Repository<ModelType>
  data: Ref<ResourceNode<ModelType> | null>
  removing: ComputedRef<string | number | false | null>
  resource: Ref<ModelType | undefined>
  hasErrors: ComputedRef<boolean>
  standardErrors: Ref<StandardErrors<string | number>>
  hasValidationErrors: ComputedRef<boolean>
  hasStandardErrors: ComputedRef<boolean>
  onRemove: (callback: OnRemoveCallback<ModelType>) => void
}

const defaultOptions = {
  notifyOnError: true,
  persist: true,
}

export default function useRemoveResource<ModelType extends typeof Model> (
  modelClass: ModelType,
  options: RemoveResourceOptions<InstanceType<ModelType>> = {},
): UseRemoveResourceReturn<InstanceType<ModelType>> {
  const repo = useRepo(modelClass)

  const entity = modelClass.entity
  options = Object.assign({}, defaultOptions, options)

  const config = getConfig()
  const errorNotifier = config.errorNotifiers?.remove

  const resource: Ref<InstanceType<ModelType> | undefined> = ref()
  const id = ref(options.id || null)

  const onRemoveCallbacks = ref<OnRemoveCallback<InstanceType<ModelType>>[]>([])

  if (options.onRemove) {
    onRemoveCallbacks.value.push(options.onRemove)
  }

  const onRemove = (callback: OnRemoveCallback<InstanceType<ModelType>>) => {
    onRemoveCallbacks.value.push(callback)
  }

  const endpoint = ref('')

  const rest = useRest<ResourceNode<InstanceType<ModelType>>>(endpoint)

  async function remove (resourceParam?: number | { id: number | string }) {
    if (resourceParam) {
      id.value = typeof resourceParam === 'number'
        ? resourceParam
        : resourceParam.id
    }

    endpoint.value = `${entity}/${id.value}`

    await rest.execute('delete')

    if (!rest.hasErrors.value) {
      if (rest.data.value) {
        resource.value = rest.data.value.data

        if (options.persist) {
          repo.destroy(resource.value.id)
        }
      }

      onRemoveCallbacks.value.forEach(callback => {
        if (resource.value !== null) {
          callback(resource.value)
        }
      })
    } else {
      if (errorNotifier && options.notifyOnError) errorNotifier({ entityType: entity })
    }
  }

  const removing = computed(() => {
    return rest.isFetching.value ? id.value : false
  })

  return {
    id,
    remove,
    removing,
    repo,
    data: rest.data,
    resource,
    hasErrors: rest.hasErrors,
    standardErrors: rest.standardErrors,
    hasValidationErrors: rest.hasValidationErrors,
    hasStandardErrors: rest.hasStandardErrors,
    onRemove,
  }
}

export { useRemoveResource }
