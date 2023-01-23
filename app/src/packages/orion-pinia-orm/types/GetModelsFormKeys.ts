import { RemoveIndex } from 'src/shared/types/RemoveIndex'
import { Model } from './Model'

export type GetModelsFormKeys<T extends Model> =
  keyof Omit<
    RemoveIndex<T>,
    keyof RemoveIndex<InstanceType<typeof Model>>
  >
