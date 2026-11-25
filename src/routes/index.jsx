import { createFileRoute } from '@tanstack/react-router'
import { FotokursPage } from './fotokurs'

export const Route = createFileRoute('/')({
  component: FotokursPage,
  head: () => ({ meta: [{ title: 'Foto Workshop · Ta kontroll över din kamera' }] }),
})
