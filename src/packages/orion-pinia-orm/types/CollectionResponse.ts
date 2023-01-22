import { Model } from './Model'

export interface CollectionResponse<ModelType extends Model = Model> {
  data: ModelType[]
  'links': {
    'first': string
    'last': string
    'prev': string
    'next': string
  },
  'meta': {
      'current_page': number
      'from': number
      'last_page': number
      'path': string
      'per_page': number
      'to': number
      'total': number
  }
}
