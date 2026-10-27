import { Link } from 'react-router-dom'
import { Card } from '../components/ui'

export function NotFound({ inApp = false }: { inApp?: boolean }) {
  return (
    <Card className="mx-auto mt-16 max-w-lg text-center">
      <p className="display text-6xl font-black">404</p>
      <p className="mt-3 font-bold">Тропа не найдена.</p>
      <Link to={inApp ? '/app' : '/'} className="btn btn-primary mt-6">На вершину</Link>
    </Card>
  )
}
