import ManageTodosView from '../ManageTodosView.vue'

describe('<ManageTodosView>', () => {
  beforeEach(() => {
    // cy.viewport(800, 600)
  })

  it('mounts', () => {
    cy.mount(ManageTodosView, {
      props: {
        //
      },
    })
  })
})
