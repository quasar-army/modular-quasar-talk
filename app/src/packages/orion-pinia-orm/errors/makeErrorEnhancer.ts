import { errorEnhancerStatusCodeMap } from './enhancers/errorEnhancerStatusCodeMap'

export default function makeErrorEnhancer (response: Response) {
  return errorEnhancerStatusCodeMap?.[response.status]?.(response)
}
