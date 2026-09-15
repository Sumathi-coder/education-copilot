import Card, { CardBody, CardHeader } from '../ui/Card'
import { ScoreLineChart, TopicBarChart, SimpleBarChart } from '../student/PerformanceChart'

const chartComponents = {
  line: ScoreLineChart,
  topicBar: TopicBarChart,
  bar: SimpleBarChart,
}

export default function AnalyticsChart({ title, subtitle, type = 'bar', data, ...chartProps }) {
  const ChartComponent = chartComponents[type] ?? SimpleBarChart

  return (
    <Card>
      <CardHeader>
        <div>
          <h3 className="font-semibold text-brand-800">{title}</h3>
          {subtitle && <p className="text-xs text-ink-500">{subtitle}</p>}
        </div>
      </CardHeader>
      <CardBody>
        <ChartComponent data={data} {...chartProps} />
      </CardBody>
    </Card>
  )
}
