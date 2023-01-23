export interface OrionProviderConfig {
  apiEndpoint: string
  getRequestHeaders?: () => Record<string, string | number | undefined | null>
  errorNotifiers?: {
    create?: (options: { entityType: string }) => void
    update?: (options: { entityType: string }) => void
    remove?: (options: { entityType: string }) => void
    fetch?: (options: { entityType: string }) => void
    fetchOne?: (options: { entityType: string }) => void
    download?: (options: { entityType: string }) => void
  }
}
