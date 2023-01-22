import { GetModelsFormKeys } from './GetModelsFormKeys'
import { Model } from './Model'

export type ModelForm<ModelType extends Model> = Partial<
  Record<GetModelsFormKeys<ModelType>, any>
>
