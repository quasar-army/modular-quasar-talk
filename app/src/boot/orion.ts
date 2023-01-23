import { OrionPlugin } from '@vuemodel/orion-pinia-orm'
import config from 'config/orion-pinia-orm/orion-pinia-orm'
import { boot } from 'quasar/wrappers'

export default boot(({ app }) => {
  app.use(OrionPlugin, config)
})
