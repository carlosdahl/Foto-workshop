import { createRootRoute, HeadContent, Outlet, useRouterState } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: Layout,
  head: () => ({ meta: [{ title: 'Fotoworkshopen' }] }),
  notFoundComponent: () => <h1>Sidan finns inte</h1>,
})

function Layout() {
  const isStandalonePage = useRouterState({
    select: (state) => ['/fotokurs', '/admin'].includes(state.location.pathname),
  })

  if (isStandalonePage) {
    return (
      <>
        <HeadContent />
        <Outlet />
      </>
    )
  }

  return (
    <div className="site">
      <HeadContent />
      <Outlet />
    </div>
  )
}
