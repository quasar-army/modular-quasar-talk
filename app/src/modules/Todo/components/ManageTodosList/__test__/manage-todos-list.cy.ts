import ManageTodosList from '../ManageTodosList.vue'

describe('<ManageTodosList>', () => {
  beforeEach(() => {
    // cy.viewport(800, 600)
  })

  it('mounts', () => {
    cy.mount(ManageTodosList, {
      props: {
        //
      },
    })
  })
})
