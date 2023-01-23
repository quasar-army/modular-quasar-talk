import { Ref, ref } from 'vue'
import { MaybeComputedRef, resolveUnref } from '@vueuse/core'
import { Model } from '../types'

import getConfig from '../plugin/getConfig'
import { OrionFilters } from '../types/query/OrionFilters'
import { OrionSearch } from '../types/query/OrionSearch'
import { OrionAggregate } from '../types/query/OrionAggregate'
import { OrionSort } from '../types/query/OrionsSort'
import qs from 'qs'

export type OnDownloadCallback = () => void

export type SpreadsheetFormat = 'xlsx' | 'csv'

export interface UseDownloadResourcesOptions {
  filters?: MaybeComputedRef<OrionFilters>
  search?: MaybeComputedRef<OrionSearch>
  include?: MaybeComputedRef<string[]>
  sort?: MaybeComputedRef<OrionSort[]>
  select?: MaybeComputedRef<string[]>
  aggregates?: MaybeComputedRef<OrionAggregate[]>
  onDownload?: OnDownloadCallback
  notifyOnError?: boolean
}

export interface UseDownloaderResourcesReturn {
  download: (format: SpreadsheetFormat, query?: Record<string, any>) => Promise<void>
  filters: MaybeComputedRef<OrionFilters | undefined>
  search: MaybeComputedRef<OrionSearch | undefined>
  sort: MaybeComputedRef<OrionSort[] | undefined>
  aggregates: MaybeComputedRef<OrionAggregate[] | undefined>
  downloading: Ref<boolean>
  onDownload: (callback: OnDownloadCallback) => void
}

const defaultOptions = {
  notifyOnError: true,
}

export default function useDownloadResources<ModelType extends typeof Model> (
  modelClass: ModelType,
  options: UseDownloadResourcesOptions = {},
): UseDownloaderResourcesReturn {
  options = Object.assign({}, defaultOptions, options)

  const config = getConfig('default')

  const onDownloadCallbacks = ref<OnDownloadCallback[]>([])

  if (options.onDownload) {
    onDownloadCallbacks.value.push(options.onDownload)
  }

  const onDownload = (callback: OnDownloadCallback) => {
    onDownloadCallbacks.value.push(callback)
  }

  const downloading = ref(false)

  async function download (format: SpreadsheetFormat, query: Record<string, any> = {}) {
    downloading.value = true
    const filters = {
      filters: resolveUnref(options.filters),
      sort: resolveUnref(options.sort),
      search: resolveUnref(options.search),
      aggregates: resolveUnref(options.aggregates),
      select: resolveUnref(options.select),
      ...query,
    }

    const queryString = qs.stringify({
      include: (resolveUnref(options.include) || []).join(',') || undefined,
    })

    const downloadUrl = `${config.apiEndpoint}/${modelClass.entity}/download?${queryString}`

    const token = localStorage.getItem('fuellox-token')
    const tenantId = localStorage.getItem('tenantId')
    const orgId = localStorage.getItem('orgId')

    const xhr = new XMLHttpRequest()

    xhr.open('POST', downloadUrl)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.setRequestHeader('tenant-id', tenantId || '')
    xhr.setRequestHeader('org-id', orgId || '')
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.setRequestHeader('Accept', 'application/json')

    xhr.responseType = 'blob'
    xhr.send(JSON.stringify({ ...filters, format }))

    xhr.onload = function (e) {
      if (this.status === 200) {
        // Create a new Blob object using the response data of the onload object
        const blob = new Blob([this.response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        // Create a link element, hide it, direct it towards the blob, and then 'click' it programatically
        const a = document.createElement('a')
        a.style = 'display: none'
        document.body.appendChild(a)
        // Create a DOMString representing the blob and point the link element towards it
        const url = window.URL.createObjectURL(blob)
        a.href = url
        a.download = 'myFile.xlsx'
        // programatically click the link to trigger the download
        a.click()
        // release the reference to the file by revoking the Object URL
        window.URL.revokeObjectURL(url)
        downloading.value = false
      } else {
        // deal with your error state here
        downloading.value = false
      }
    }
  }

  return {
    download,
    filters: options.filters || ref(undefined),
    search: options.search || ref(undefined),
    aggregates: options.aggregates || ref(undefined),
    downloading,
    onDownload,
    sort: options.sort || ref(undefined),
  }
}

export { useDownloadResources }
