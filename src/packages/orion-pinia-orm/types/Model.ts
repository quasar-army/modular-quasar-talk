import { Model as PiniaOrmModel } from 'pinia-orm'

export class Model extends PiniaOrmModel {
  id: string | number | undefined
}
