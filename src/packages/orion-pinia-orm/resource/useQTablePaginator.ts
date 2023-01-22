import { MaybeComputedRef, resolveUnref } from '@vueuse/core'
import { ref } from 'vue'
import { Model } from '../types'
import { CollectionResponse } from '../types/CollectionResponse'

export interface UseQTablePaginator {
  rowsPerPage: MaybeComputedRef<number>
  sortBy: MaybeComputedRef<string>
  descending: MaybeComputedRef<boolean>
  page: MaybeComputedRef<number>
  rowsNumber: MaybeComputedRef<number>
}

export default function useQTablePaginator (optionsParam: UseQTablePaginator) {
  const pagination = ref<UseQTablePaginator>({
    sortBy: resolveUnref(optionsParam.sortBy),
    descending: resolveUnref(optionsParam.descending),
    page: resolveUnref(optionsParam.page),
    rowsPerPage: resolveUnref(optionsParam.rowsPerPage),
    rowsNumber: resolveUnref(optionsParam.rowsNumber),
  })

  function setPaginationFromOrionResponse (data: CollectionResponse<Model>) {
    pagination.value.page = data.meta.current_page
    pagination.value.rowsPerPage = data.meta.per_page
    pagination.value.rowsNumber = data.meta.total
  }

  return {
    pagination,
    setPaginationFromOrionResponse,
  }
}
