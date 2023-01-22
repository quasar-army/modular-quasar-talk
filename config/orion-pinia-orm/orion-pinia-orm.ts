import { OrionPluginOptions } from '@vuemodel/orion-pinia-orm'

const orionPiniaOrm: OrionPluginOptions = {
  providers: {
    default: {
      apiEndpoint: process.env.CORE_API_URL + '/api',
      getRequestHeaders () {
        const token = localStorage.getItem('fuellox-token')
        const tenantId = localStorage.getItem('tenantId')
        const orgId = localStorage.getItem('orgId')
        return {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'tenant-id': tenantId,
          'org-id': orgId,
        }
      },
    },
  },
}

export default orionPiniaOrm
