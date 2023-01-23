import { computed, ComputedRef, Ref, ref } from 'vue'

export type ValidationError = {
  message?: string
  name?: string
  path?: string[]
}

export type ValidationErrors = Record<string, ValidationError>

export interface UseValidationErrorsReturn {
  errors: Ref<ValidationErrors>
  hasErrors: ComputedRef<boolean>
}

export function useValidationErrors (): UseValidationErrorsReturn {
  const errors = ref<ValidationErrors>({})
  const hasErrors = computed(() => !!Object.keys(errors.value).length)

  return {
    errors,
    hasErrors,
  }
}

export {
  useValidationErrors as default,
}
