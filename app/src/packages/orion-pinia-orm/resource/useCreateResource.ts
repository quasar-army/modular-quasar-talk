import { ComputedRef, Ref, ref } from 'vue'
import useRest from '../rest/useRest'
import { Model } from '../types/Model'
import { ValidationErrors } from '../errors/useValidationErrors'
import { StandardErrors } from '../errors/useStandardErrors'
import { LooseModelForm } from '../types/LooseModelForm'
import { ResourceNode } from '../types/ResourceNode'
import getConfig from '../plugin/getConfig'
import { Repository, useRepo } from 'pinia-orm'
import { CollectionResponse } from '../types/CollectionResponse'
import { GetModelsFormKeys } from '../types/GetModelsFormKeys'
import nonFormProps from '../constants/nonFormProps'

export type OnCreateCallback<ModelType extends Model> = (models: CollectionResponse<ModelType>) => void

export interface CreateResourceOptions<ModelType extends Model> {
  formDefaults?: () => Record<string, unknown>
  onCreate?: OnCreateCallback<ModelType>
  notifyOnError?: boolean
  persist?: boolean
}

export interface UseCreateResourceReturn<ModelType extends Model> {
  create: (form?: LooseModelForm<ModelType>) => Promise<void>
  repo: Repository<ModelType>
  form: Ref<Partial<Record<GetModelsFormKeys<ModelType>, any>>>
  resetForm: () => void
  formDefaults: Ref<() => Record<string, unknown>>
  data: Ref<ResourceNode<ModelType> | null>
  creating: Ref<boolean>
  resource: Ref<ModelType | undefined>
  hasErrors: ComputedRef<boolean>
  validationErrors: Ref<ValidationErrors>
  standardErrors: Ref<StandardErrors<string | number>>
  hasValidationErrors: ComputedRef<boolean>
  hasStandardErrors: ComputedRef<boolean>
  onCreate: (callback: OnCreateCallback<ModelType>) => void
}

const defaultOptions = {
  notifyOnError: true,
  persist: true,
}

export default function useCreateResource<ModelType extends typeof Model> (
  modelClass: ModelType,
  options: CreateResourceOptions<InstanceType<ModelType>> = {},
): UseCreateResourceReturn<InstanceType<ModelType>> {
  const repo = useRepo(modelClass)

  const entity = modelClass.entity
  options = Object.assign({}, defaultOptions, options)

  const config = getConfig()
  const errorNotifer = config.errorNotifiers?.create

  const formDefaults = ref(options.formDefaults || (() => { return {} }))
  const resource: Ref<InstanceType<ModelType> | undefined> = ref()

  const onCreateCallbacks: Ref<OnCreateCallback<InstanceType<ModelType>>[]> = ref([])
  const form: Ref<Partial<Record<GetModelsFormKeys<InstanceType<ModelType>>, any>>> = ref({})

  function resetForm () {
    const fields = modelClass.schemas[modelClass.entity]

    Object.entries(fields).forEach(([fieldKey, field]) => {
      if (!nonFormProps.includes(fieldKey) && !field.parent && !field.related) {
        form.value[fieldKey] = field.value
      }
    })
  }

  resetForm()

  if (options.onCreate) {
    onCreateCallbacks.value.push(options.onCreate)
  }

  const onCreate = (callback: OnCreateCallback<InstanceType<ModelType>>) => {
    onCreateCallbacks.value.push(callback)
  }

  const rest = useRest<ResourceNode<InstanceType<ModelType>>>(entity)

  async function create (formParam?: LooseModelForm<InstanceType<ModelType>>) {
    const mergedForm = Object.assign({}, formParam || {}, form.value, formDefaults.value())

    await rest.execute('post', mergedForm)

    if (!rest.hasErrors.value && rest.data.value) {
      if (rest.data.value.data) {
        resource.value = rest.data.value.data

        if (options.persist) {
          repo.save(resource.value)
        }
      }

      resetForm()

      onCreateCallbacks.value.forEach(callback => {
        if (resource.value !== null) {
          callback(resource.value)
        }
      })
    } else {
      if (errorNotifer && options.notifyOnError) errorNotifer({ entityType: entity })
    }
  }

  return {
    create,
    formDefaults,
    resetForm,
    repo,
    form,
    data: rest.data,
    creating: rest.isFetching,
    resource,
    hasErrors: rest.hasErrors,
    validationErrors: rest.validationErrors,
    standardErrors: rest.standardErrors,
    hasValidationErrors: rest.hasValidationErrors,
    hasStandardErrors: rest.hasStandardErrors,
    onCreate,
  }
}

export { useCreateResource }
