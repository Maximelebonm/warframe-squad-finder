import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/taxi')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/taxi"!</div>
}
