import useValidationErrors, { ValidationErrors } from '../errors/useValidationErrors'
import useStandardErrors, { StandardErrors } from '../errors/useStandardErrors'
import { computed, ComputedRef, Ref, ref, unref } from 'vue'
import { MaybeRef, useFetch } from '@vueuse/core'
import qs from 'qs'
import getConfig from '../plugin/getConfig'
import useEnhancedErrors from '../errors/useEnhancedErrors'
import { EnhancedError } from '../errors/enhancers/errorEnhancerStatusCodeMap'

export type RequestAction = 'post'
  | 'put'
  | 'get'
  | 'delete'

export interface UseRestOptions {
  include?: MaybeRef<unknown>
  fields?: MaybeRef<unknown>
}

export interface UseRestReturn<ResponseData = unknown> {
  execute: (action: RequestAction, payload?: Record<string, unknown>, paramQueryString?: Record<string, unknown>) => Promise<void>
  include: Ref<unknown>
  fields: Ref<unknown>
  standardErrors: Ref<StandardErrors<string | number>>
  enhancedError: Ref<EnhancedError | undefined>
  hasEnhancedError: ComputedRef<boolean>
  hasStandardErrors: ComputedRef<boolean>
  validationErrors: Ref<ValidationErrors>
  hasValidationErrors: ComputedRef<boolean>
  hasErrors: ComputedRef<boolean>
  isFetching: Ref<boolean>
  data: Ref<ResponseData | null>
  isFinished: Ref<boolean>
}

export default function useRest<ResponseData = unknown> (
  endpointParam: MaybeRef<string>,
  options: UseRestOptions = {},
): UseRestReturn<ResponseData> {
  const config = getConfig()

  const include = ref(options.include || undefined)
  const fields = ref(options.fields || undefined)
  const endpoint = ref(endpointParam)

  const isFetching = ref(false)

  const standardErrors = useStandardErrors()
  const validationErrors = useValidationErrors()
  const enhancedErrorsService = useEnhancedErrors()

  const hasErrors = computed(() => {
    return standardErrors.hasErrors.value ||
      validationErrors.hasErrors.value
  })

  const fetcher = useFetch<ResponseData>(
    () => config.apiEndpoint + '/' + endpoint.value,
    { credentials: 'include' },
    {
      beforeFetch ({ options }) {
        const headers = config.getRequestHeaders ? config.getRequestHeaders() : {}

        options.headers = { ...options.headers, ...headers }
      },
      immediate: false,
    },
  )

  async function execute (action: RequestAction, payload: Record<string, unknown> = {}, queryParam: Record<string, unknown> = {}) {
    payload.include = payload.include || include.value
    payload.fields = payload.fields || fields.value

    isFetching.value = true

    const paramQueryString = qs.stringify(queryParam)
    endpoint.value += paramQueryString ? ('?' + qs.stringify(queryParam)) : ''

    // When the action is a "get" request
    // convert the payload to a query string
    if (action === 'get') {
      const queryString = qs.stringify(payload)
      endpoint.value += queryString ? ('?' + qs.stringify(payload)) : ''
      await fetcher.get().json().execute()
      endpoint.value = unref(endpointParam)
    } else if (payload) {
      await fetcher[action](payload).json().execute()
    } else {
      await fetcher[action]().json().execute()
    }

    isFetching.value = false

    if (fetcher.error.value) {
      standardErrors.errors.value.push({
        type: 'standard',
        message: fetcher.error.value,
      })

      if (fetcher.response.value) {
        enhancedErrorsService.enhanceError(fetcher.response.value)
      }

      if (
        fetcher.data.value?.error?.name === 'ValidationError' &&
        fetcher.data.value?.error?.details?.errors
      ) {
        validationErrors.errors.value = fetcher.data.value?.error.details.errors
      }
    }
  }

  return {
    execute,
    include,
    fields,
    standardErrors: standardErrors.errors,
    enhancedError: enhancedErrorsService.enhancedError,
    hasEnhancedError: enhancedErrorsService.hasEnhancedError,
    hasStandardErrors: standardErrors.hasErrors,
    validationErrors: validationErrors.errors,
    hasValidationErrors: validationErrors.hasErrors,
    hasErrors,
    isFetching,
    data: fetcher.data,
    isFinished: fetcher.isFinished,
  }
}

export { useRest }
