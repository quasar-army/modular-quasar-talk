import TodosList from '../TodosList.vue'

describe('<TodosList>', () => {
  beforeEach(() => {
    // cy.viewport(800, 600)
  })

  it('mounts', () => {
    cy.mount(TodosList, {
      props: {
        //
      },
    })
  })
})
