import enhance401 from './enhance401'

export interface EnhancedError {
  name: string
  statusCode: number
  message: string
  link?: string
}

export const errorEnhancerStatusCodeMap: Record<number, (response: Response) => EnhancedError> = {
  401: enhance401,
}
