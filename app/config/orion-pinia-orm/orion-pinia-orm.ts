import { OrionPluginOptions } from '@vuemodel/orion-pinia-orm'

const orionPiniaOrm: OrionPluginOptions = {
  providers: {
    default: {
      apiEndpoint: process.env.CORE_API_URL + '/api',
      getRequestHeaders () {
        const token = localStorage.getItem('token')
        return {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }
      },
    },
  },
}

export default orionPiniaOrm
