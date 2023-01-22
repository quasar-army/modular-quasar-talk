import { computed, ComputedRef, Ref, ref } from 'vue'
import { MaybeComputedRef, resolveUnref } from '@vueuse/core'

import useRest from '../rest/useRest'
import { Model } from '../types'

import getConfig from '../plugin/getConfig'
import { Repository, useRepo } from 'pinia-orm'
import { CollectionResponse } from '../types/CollectionResponse'
import { StandardErrors } from '../errors/useStandardErrors'
import { ValidationErrors } from '../errors/useValidationErrors'
import { OrionFilters } from '../types/query/OrionFilters'
import { QTable } from 'quasar'
import useQTablePaginator, { UseQTablePaginator } from './useQTablePaginator'
import { OrionSearch } from '../types/query/OrionSearch'
import { OrionAggregate } from '../types/query/OrionAggregate'
import { OrionSort } from '../types/query/OrionsSort'

export type OnFetchCallback<ModelType extends Model> = (models: CollectionResponse<ModelType>) => void

export interface UseFetchResourcesOptions<ModelType extends Model> {
  filters?: MaybeComputedRef<OrionFilters>
  search?: MaybeComputedRef<OrionSearch>
  include?: MaybeComputedRef<string[]>
  sort?: MaybeComputedRef<OrionSort[]>
  aggregates?: MaybeComputedRef<OrionAggregate[]>
  onFetch?: OnFetchCallback<ModelType>
  immediate?: boolean
  notifyOnError?: boolean
  persist?: boolean
  persistBy?: 'save' | 'replace'
  limit?: MaybeComputedRef<number>
  qTablePaginator?: UseQTablePaginator
}

export interface UseFetcherResourcesReturn<ModelType extends Model> {
  fetch: (fetchOptions?: { page?: number }) => Promise<void>
  filters: MaybeComputedRef<OrionFilters | undefined>
  search: MaybeComputedRef<OrionSearch | undefined>
  sort: MaybeComputedRef<OrionSort[] | undefined>
  aggregates: MaybeComputedRef<OrionAggregate[] | undefined>
  meta: ComputedRef<CollectionResponse<ModelType>['meta'] | undefined>
  nextPage: () => Promise<void>
  previousPage: () => Promise<void>
  toPage: (page: number) => Promise<void>
  isFirstPage: ComputedRef<boolean | undefined>
  isLastPage: ComputedRef<boolean | undefined>
  data: Ref<CollectionResponse<ModelType> | null>
  fetching: Ref<boolean>
  resources: Ref<ModelType[]>
  hasErrors: ComputedRef<boolean>
  validationErrors: Ref<ValidationErrors>
  standardErrors: Ref<StandardErrors<string | number>>
  hasValidationErrors: ComputedRef<boolean>
  hasStandardErrors: ComputedRef<boolean>
  onFetch: (callback: OnFetchCallback<ModelType>) => void
  repo: Repository<ModelType>
  qTablePagination: Ref<UseQTablePaginator>
  onQTableRequest: QTable['onRequest']
}

const defaultOptions = {
  notifyOnError: true,
  persist: true,
  persistBy: 'replace',
}

export default function useFetchResources<ModelType extends typeof Model> (
  modelClass: ModelType,
  options: UseFetchResourcesOptions<InstanceType<ModelType>> = {},
): UseFetcherResourcesReturn<InstanceType<ModelType>> {
  const repo = useRepo<InstanceType<ModelType>>(modelClass)

  const qTablePaginator = useQTablePaginator(options.qTablePaginator || {
    rowsPerPage: 15,
    sortBy: 'updated_at',
    descending: false,
    page: 1,
    rowsNumber: 0,
  })

  const entity = modelClass.entity
  options = Object.assign({}, defaultOptions, options)

  const config = getConfig('default')
  const errorNotifier = config.errorNotifiers?.fetch

  const onFetchCallbacks = ref<OnFetchCallback<InstanceType<ModelType>>[]>([])

  if (options.onFetch) {
    onFetchCallbacks.value.push(options.onFetch)
  }

  const onFetch = (callback: OnFetchCallback<InstanceType<ModelType>>) => {
    onFetchCallbacks.value.push(callback)
  }

  const resources: Ref<InstanceType<ModelType>[]> = ref([])

  const rest = useRest<CollectionResponse<InstanceType<ModelType>>>(entity + '/search')

  async function fetch (fetchOptions?: { page?: number }, query: Record<string, any> = {}) {
    await rest.execute(
      'post',
      {
        page: fetchOptions?.page,
        filters: resolveUnref(options.filters),
        limit: resolveUnref(options.limit) || qTablePaginator.pagination.value.rowsPerPage,
        sort: resolveUnref(options.sort),
        search: resolveUnref(options.search),
        aggregates: resolveUnref(options.aggregates),
        ...query,
      },
      {
        include: (resolveUnref(options.include) || []).join(',') || undefined,
      },
    )

    if (!rest.hasErrors.value) {
      if (rest.data.value?.data) {
        resources.value = rest.data.value.data
      }

      if (options.persist) {
        if (options.persistBy === 'replace') {
          repo.flush()
          repo.save(resources.value)
        } else {
          repo[options.persistBy || 'save'](resources.value)
        }
      }

      onFetchCallbacks.value.forEach(callback => {
        if (rest.data.value) {
          callback(rest.data.value)
        }
      })

      if (rest.data.value) {
        qTablePaginator.setPaginationFromOrionResponse(rest.data.value)
      }
    } else {
      if (errorNotifier && options.notifyOnError) errorNotifier({ entityType: entity })
    }
  }

  if (options.immediate) {
    fetch()
  }

  const meta = computed(() => rest.data.value?.meta)
  const links = computed(() => rest.data.value?.links)

  const isFirstPage = computed(() => meta.value?.current_page === 1)

  const isLastPage = computed(() => {
    return meta.value && meta.value.current_page === meta.value.last_page
  })

  async function nextPage () {
    if (!links.value?.next) {
      console.warn('next page link not set')
      return
    }
    if (!meta.value?.current_page) {
      console.warn('missing "current_page" in meta')
      return
    }
    await fetch({ page: meta.value.current_page + 1 })
  }

  async function toPage (page: number) {
    await fetch({ page })
  }

  async function previousPage () {
    if (isFirstPage.value) {
      console.warn('Cannot fetch previous page when on the first page')
      return
    }
    if (!meta.value?.current_page) {
      console.warn('missing "current_page" in meta')
      return
    }
    await fetch({ page: meta.value.current_page - 1 })
  }

  async function onQTableRequest (request: Parameters<NonNullable<QTable['onRequest']>>[0]) {
    const query: Record<string, any> = {}
    if (request.pagination.sortBy) {
      query.sort = [{
        field: request.pagination.sortBy,
        direction: request.pagination.descending ? 'desc' : 'asc',
      }]
    }
    await fetch({ page: request.pagination.page }, query)

    qTablePaginator.pagination.value.descending = request.pagination.descending
    qTablePaginator.pagination.value.sortBy = request.pagination.sortBy
  }

  return {
    fetch,
    nextPage,
    previousPage,
    meta,
    toPage,
    filters: options.filters || ref(undefined),
    search: options.search || ref(undefined),
    aggregates: options.aggregates || ref(undefined),
    isFirstPage,
    isLastPage,
    data: rest.data,
    fetching: rest.isFetching,
    resources,
    hasErrors: rest.hasErrors,
    validationErrors: rest.validationErrors,
    standardErrors: rest.standardErrors,
    hasValidationErrors: rest.hasValidationErrors,
    hasStandardErrors: rest.hasStandardErrors,
    onFetch,
    sort: options.sort || ref(undefined),
    repo,
    onQTableRequest,
    qTablePagination: qTablePaginator.pagination,
  }
}

export { useFetchResources }
