import { Model } from 'pinia-orm'
import { Num, Str, Uid } from 'pinia-orm/dist/decorators'

export default class Todo extends Model {
  static entity = 'todos'

  // Fields
  @Uid() declare id: string

  @Str('') declare title: string | null
  @Num(0) declare done: 0 | 1

  // Relationships
}
