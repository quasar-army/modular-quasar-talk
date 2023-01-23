import { computed, ref } from 'vue'
import { EnhancedError } from './enhancers/errorEnhancerStatusCodeMap'
import makeErrorEnhancer from './makeErrorEnhancer'

export default function useEnhancedErrors () {
  const enhancedError = ref<EnhancedError>()
  const hasEnhancedError = computed(() => !!enhancedError.value)

  function enhanceError (response: Response) {
    enhancedError.value = makeErrorEnhancer(response)
  }

  return {
    enhancedError,
    hasEnhancedError,
    enhanceError,
  }
}
