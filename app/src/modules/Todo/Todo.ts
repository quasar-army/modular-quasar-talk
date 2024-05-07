import { Model } from 'pinia-orm'
import { Attr, Uid } from 'pinia-orm/dist/decorators'

export default class Todo extends Model {
  static entity = 'todos'

  // Fields
  @Uid() declare id: string
  @Attr() declare title: null | string
  @Attr() declare done: 0 | 1

  // Relationships
}
