import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RotateCcw, FileText, ListChecks, AlertTriangle } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Card, { CardBody } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ProgressBar from '../../components/ui/ProgressBar'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { fetchRevisionTopics } from '../../services/analyticsService'
import { scoreTone } from '../../utils/formatters'

export default function Revision() {
  const navigate = useNavigate()
  const [topics, setTopics] = useState(null)

  useEffect(() => {
    fetchRevisionTopics().then(setTopics)
  }, [])

  return (
    <div>
      <PageHeader
        title="Revision Plan"
        subtitle="A focused plan for the topics your quiz attempts show you're struggling with."
      />

      {!topics ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : topics.length === 0 ? (
        <EmptyState
          icon={RotateCcw}
          title="Nothing to revise right now"
          description="Take a few more practice tests and weak topics will show up here."
        />
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => {
            const tone = scoreTone(topic.percent)
            return (
              <Card key={topic.topic}>
                <CardBody>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <AlertTriangle className="size-4 text-rosy-400" />
                        <h2 className="font-semibold text-brand-800">{topic.topic}</h2>
                        <Badge tone={tone === 'moss' ? 'moss' : tone === 'warn' ? 'warn' : 'danger'}>
                          {topic.percent}% mastery
                        </Badge>
                      </div>
                      <p className="mb-1 text-xs text-ink-400">{topic.courseName}</p>
                      <p className="mt-2 text-sm leading-relaxed text-ink-600">{topic.reason}</p>
                      <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-500">
                        <FileText className="size-3.5" />
                        {topic.recommendedMaterial}
                      </p>
                    </div>
                    <div className="w-full shrink-0 sm:w-44">
                      <ProgressBar value={topic.percent} tone="rosy" size="sm" />
                      <div className="mt-3 flex flex-col gap-2">
                        <Button
                          size="sm"
                          icon={ListChecks}
                          onClick={() => navigate(`/student/quiz/create?course=${topic.courseId}`)}
                        >
                          Practice this topic
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/student/courses/${topic.courseId}`)}
                        >
                          Review material
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
