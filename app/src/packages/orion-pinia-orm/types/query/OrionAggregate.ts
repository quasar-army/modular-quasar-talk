import { OrionFilters } from './OrionFilters'

export type Aggregate = 'count' |
  'avg' |
  'sum' |
  'min' |
  'max' |
  'exists'

export interface OrionAggregate {
  type: Aggregate
  relation: string
  field?: string
  filters?: OrionFilters
}

export const aggregates: Aggregate[] = [
  'count',
  'avg',
  'sum',
  'min',
  'max',
  'exists',
]
