import { computed, Ref, ref } from 'vue'
import useRest from '../rest/useRest'
import { MaybeRef } from '@vueuse/core'
import { Model } from '../types'
import { ResourceNode } from '../types/ResourceNode'
import getConfig from '../plugin/getConfig'
import { Item, useRepo } from 'pinia-orm'
import useFetchResource from './useFetchResource'
import nonFormProps from '../constants/nonFormProps'
import { GetModelsFormKeys } from '../types/GetModelsFormKeys'

export type OnUpdateCallback<ModelType extends Model> = (model: ResourceNode<ModelType>) => void

export interface UpdateResourceOptions<ModelType extends Model> {
  form?: Partial<Record<GetModelsFormKeys<ModelType>, any>>
  id?: MaybeRef<string | number | undefined>
  makeFormWithId?: string | number
  onUpdate?: OnUpdateCallback<ModelType>
  notifyOnError?: boolean
  persist?: boolean
}

const defaultOptions = {
  notifyOnError: true,
  persist: true,
}

export default function useUpdateResource<ModelType extends typeof Model> (
  modelClass: ModelType,
  options: UpdateResourceOptions<InstanceType<ModelType>> = {},
) {
  options = Object.assign({}, defaultOptions, options)
  const repo = useRepo(modelClass)
  const entity = modelClass.entity

  const config = getConfig()
  const errorNotifier = config.errorNotifiers?.update

  const form: Ref<Partial<Record<GetModelsFormKeys<InstanceType<ModelType>>, any>>> = ref(options.form || {})
  const resource: Ref<InstanceType<ModelType> | undefined> = ref()
  const id = ref(options.id || null)

  const onUpdateCallbacks: Ref<OnUpdateCallback<InstanceType<ModelType>>[]> = ref([])

  if (options.onUpdate) {
    onUpdateCallbacks.value.push(options.onUpdate)
  }

  const resourceFetcher = useFetchResource(modelClass)

  const findingModelForUpdate = ref(false)

  function makeFormFromModel (model: Item<Model>) {
    if (!model) { return }
    const fields = model.$fields()
    Object.keys(fields).forEach(field => {
      if (!nonFormProps.includes(field)) {
        form.value[field] = model[field]
      }
    })
  }

  async function makeFormWithId (targetId: string | number) {
    id.value = targetId
    const foundModel = repo.find(targetId)
    if (!foundModel) {
      findingModelForUpdate.value = true
      await resourceFetcher.fetch(targetId)
      const foundModel = repo.find(targetId)
      if (foundModel) {
        makeFormFromModel(foundModel)
      }
      findingModelForUpdate.value = false
    } else {
      makeFormFromModel(foundModel)
    }
  }

  if (options.makeFormWithId) {
    makeFormWithId(options.makeFormWithId)
  }

  const onUpdate = (callback: OnUpdateCallback<InstanceType<ModelType>>) => {
    onUpdateCallbacks.value.push(callback)
  }

  const endpoint = ref('')

  const rest = useRest<ResourceNode<InstanceType<ModelType>>>(endpoint)

  async function update (idParam?: number | string, attributes?: Record<string, unknown>) {
    if (idParam) {
      id.value = idParam
    }

    endpoint.value = `${entity}/${id.value}`

    if (attributes) {
      form.value = attributes
    }

    await rest.execute('put', form.value)

    if (!rest.hasErrors.value && rest.data.value) {
      if (rest.data.value) {
        resource.value = rest.data.value.data

        if (options.persist) {
          repo.save(resource.value)
        }
      }

      onUpdateCallbacks.value.forEach(callback => {
        if (rest.data.value !== null) {
          callback(rest.data.value)
        }
      })
    } else {
      if (errorNotifier && options.notifyOnError) errorNotifier({ entityType: entity })
    }
  }

  const updating = computed(() => {
    return (rest.isFetching.value && id.value) ? id.value : false
  })

  return {
    id,
    update,
    form,
    makeFormWithId,
    data: rest.data,
    updating,
    resource,
    hasErrors: rest.hasErrors,
    validationErrors: rest.validationErrors,
    standardErrors: rest.standardErrors,
    hasValidationErrors: rest.hasValidationErrors,
    hasStandardErrors: rest.hasStandardErrors,
    findingModelForUpdate,
    repo,
    onUpdate,
  }
}

export { useUpdateResource }
