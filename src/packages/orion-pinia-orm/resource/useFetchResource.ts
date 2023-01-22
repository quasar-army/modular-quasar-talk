import { ComputedRef, Ref, ref } from 'vue'
import useRest from '../rest/useRest'
import { MaybeComputedRef, MaybeRef, resolveUnref } from '@vueuse/core'
import { Model } from '../types'
import { ResourceNode } from '../types/ResourceNode'
import getConfig from '../plugin/getConfig'
import { Repository, useRepo } from 'pinia-orm'
import { ValidationErrors } from '../errors/useValidationErrors'
import { StandardErrors } from '../errors/useStandardErrors'
import { OrionFilters } from '../types/query/OrionFilters'

export type OnFetchCallback<ModelType extends Model> = (resourceNode: ResourceNode<ModelType>) => void

export interface FetchResourceOptions<ModelType extends Model> {
  filters?: MaybeComputedRef<OrionFilters>
  id?: MaybeRef<number | string | undefined>
  onFetch?: OnFetchCallback<ModelType>
  immediate?: boolean
  include?: string[]
  notifyOnError?: boolean
  persist?: boolean
  persistBy?: 'save' | 'replace'
}

export interface UseFetchResourceReturn<ModelType extends Model> {
  fetch: (resourceParam?: {
    id: number | string
    attributes: Record<string, unknown>
  } | number | string) => Promise<void>
  repo: Repository<ModelType>
  filters: MaybeComputedRef<OrionFilters | undefined>
  id: Ref<string | number | null | undefined>
  data: Ref<ResourceNode<ModelType> | null>
  fetching: Ref<boolean>
  resource: Ref<ModelType | undefined>
  hasErrors: ComputedRef<boolean>
  validationErrors: Ref<ValidationErrors>
  standardErrors: Ref<StandardErrors<string | number>>
  hasValidationErrors: ComputedRef<boolean>
  hasStandardErrors: ComputedRef<boolean>
  onFetch: (callback: OnFetchCallback<ModelType>) => void
}

const defaultOptions = {
  persist: true,
  notifyOnError: true,
  persistBy: 'replace',
}

export default function useFetchResource<ModelType extends typeof Model> (
  modelClass: ModelType,
  options: FetchResourceOptions<InstanceType<ModelType>> = {},
): UseFetchResourceReturn<InstanceType<ModelType>> {
  const repo = useRepo(modelClass)

  const entity = modelClass.entity
  options = Object.assign({}, defaultOptions, options)

  const config = getConfig()
  const errorNotifier = config.errorNotifiers?.fetch

  const idRef = ref(options.id || null)

  const resource: Ref<InstanceType<ModelType> | undefined> = ref()
  const endpoint = ref('')

  const onFetchCallbacks = ref<OnFetchCallback<InstanceType<ModelType>>[]>([])

  const onFetch = (callback: OnFetchCallback<InstanceType<ModelType>>) => {
    onFetchCallbacks.value.push(callback)
  }

  if (options.onFetch) {
    onFetchCallbacks.value.push(options.onFetch)
  }

  const rest = useRest<ResourceNode<InstanceType<ModelType>>>(endpoint)

  async function fetch (resourceParam?: { id: number | string, attributes: Record<string, unknown> } | number | string) {
    let fetchId: number | string | undefined

    if (typeof resourceParam === 'number' || typeof resourceParam === 'string') {
      fetchId = resourceParam
    } else if (resourceParam?.id) {
      fetchId = resourceParam?.id
    } else if (typeof idRef.value === 'number' || typeof idRef.value === 'string') {
      fetchId = idRef.value
    }

    if (!fetchId) {
      throw new Error('No id provided: cannot fetch resource without an identifier')
    }

    endpoint.value = `${entity}/${fetchId}`

    await rest.execute('get', {
      include: options.include ? resolveUnref(options.include).join(',') : [],
      filters: resolveUnref(options.filters),
    })

    if (!rest.hasErrors.value) {
      if (rest.data.value?.data) {
        resource.value = rest.data.value.data

        if (options.persist) {
          if (options.persistBy === 'replace') {
            repo.flush()
            repo.save(resource.value)
          } else {
            repo[options.persistBy || 'save'](resource.value)
          }
        }
      }

      onFetchCallbacks.value.forEach(callback => {
        if (rest.data.value !== null) {
          callback(rest.data.value)
        }
      })
    } else {
      if (errorNotifier && options.notifyOnError) errorNotifier({ entityType: entity })
    }
  }

  if (options.immediate && idRef.value) {
    fetch(idRef.value)
  }

  return {
    fetch,
    repo,
    id: idRef,
    filters: options.filters || ref(undefined),
    data: rest.data,
    fetching: rest.isFetching,
    resource,
    hasErrors: rest.hasErrors,
    validationErrors: rest.validationErrors,
    standardErrors: rest.standardErrors,
    hasValidationErrors: rest.hasValidationErrors,
    hasStandardErrors: rest.hasStandardErrors,
    onFetch,
  }
}

export { useFetchResource }
