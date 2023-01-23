import { EnhancedError } from './errorEnhancerStatusCodeMap'

export default function enhance401 (): EnhancedError {
  return {
    name: 'Unauthorized',
    message: "This usually means this account isn't logged in correctly, or you're trying to access something without the correct permissions.",
    statusCode: 401,
  }
}
