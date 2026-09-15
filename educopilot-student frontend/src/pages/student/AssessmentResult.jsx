import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Trophy, ArrowLeft } from 'lucide-react'
import Card, { CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'

export default function AssessmentResult() {
  const { assessmentId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const result = location.state?.result
  const assessment = location.state?.assessment

  if (!result || !assessment) {
    return <div className="flex min-h-[70vh] items-center justify-center"><Card><CardBody className="text-center"><p className="text-sm text-ink-600">Result details are available immediately after submission.</p><Button className="mt-4" onClick={() => navigate('/student/assessments')}>Back to Assessments</Button></CardBody></Card></div>
  }

  return <div className="mx-auto max-w-2xl"><Card><CardBody className="text-center"><div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-teal-50 text-teal-600"><Trophy className="size-7" /></div><p className="text-sm text-ink-500">{assessment.courseName} · {assessment.type}</p><h1 className="mt-1 text-2xl font-semibold text-brand-800">{assessment.name}</h1><p className="mt-5 text-5xl font-semibold text-brand-800">{result.percent}%</p><p className="mt-1 text-sm text-ink-500">{result.score} out of {result.total} correct</p><Badge tone={result.percent >= 70 ? 'moss' : result.percent >= 50 ? 'warn' : 'danger'} className="mt-3">{result.percent >= 70 ? 'Good work' : 'Review the material'}</Badge><div className="mt-6"><Button as={Link} to="/student/assessments" variant="secondary" icon={ArrowLeft}>Back to Assessments</Button></div></CardBody></Card></div>
}
