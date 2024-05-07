import ManageTodoItem from '../ManageTodoItem.vue'

describe('<ManageTodoItem>', () => {
  beforeEach(() => {
    // cy.viewport(800, 600)
  })

  it('mounts', () => {
    cy.mount(ManageTodoItem, {
      props: {
        //
      },
    })
  })
})
