import { inject } from 'vue'
import { OrionProviderConfig } from '../types/OrionProviderConfig'

export default function getConfig (providerKey = 'default') {
  const config = inject<OrionProviderConfig>('orionPiniaOrmConfig:' + providerKey)

  if (!config) {
    throw new Error('Error getting the default orion config. Did you install the orion rest plugin?')
  }

  return config
}
