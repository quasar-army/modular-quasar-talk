import { Model } from 'pinia-orm'
import { App } from 'vue'
import { OrionProviderConfig } from '../types/OrionProviderConfig'

export interface OrionPluginOptions {
  providers: Record<string, OrionProviderConfig>
  playground?: {
    models?: (typeof Model)[]
  }
}

export const OrionPlugin = {
  install: (app: App, options: OrionPluginOptions): void => {
    Object.entries(options.providers)
      .forEach(([providerKey, provider]: [string, OrionProviderConfig]) => {
        app.provide('orionPiniaOrmConfig:' + providerKey, provider)
      })
  },
}
