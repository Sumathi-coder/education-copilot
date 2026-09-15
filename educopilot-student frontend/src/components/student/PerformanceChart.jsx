import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'

const CHART_COLORS = {
  teal: '#105666',
  moss: '#839958',
  rosy: '#D3968C',
  brand: '#0A3323',
}

function ChartTooltip({ active, payload, label, unit = '%' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs shadow-lift">
      <p className="mb-0.5 font-medium text-ink-700">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.value}{unit}
        </p>
      ))}
    </div>
  )
}

export function ScoreLineChart({ data = [], dataKey = 'score', xKey = 'date', height = 260, color = 'teal' }) {
  if (!Array.isArray(data) || data.length === 0) return <div className="flex h-[260px] items-center justify-center text-sm text-ink-400">No score data yet.</div>
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#D3DBD5" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#7C8C82' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#7C8C82' }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip />} />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={CHART_COLORS[color]}
          strokeWidth={2.5}
          dot={{ r: 4, fill: CHART_COLORS[color] }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function TopicBarChart({ data = [], dataKey = 'score', xKey = 'topic', height = 260 }) {
  if (!Array.isArray(data) || data.length === 0) return <div className="flex h-[260px] items-center justify-center text-sm text-ink-400">No topic data yet.</div>
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#D3DBD5" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#7C8C82' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#7C8C82' }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(16,86,102,0.06)' }} />
        <Bar dataKey={dataKey} radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`${entry[xKey] ?? 'topic'}-${index}`} fill={entry[dataKey] >= 70 ? CHART_COLORS.moss : entry[dataKey] >= 50 ? CHART_COLORS.rosy : '#B34438'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function SimpleBarChart({ data = [], dataKey, xKey, height = 240, color = 'teal', unit = '' }) {
  if (!Array.isArray(data) || data.length === 0) return <div className="flex h-[240px] items-center justify-center text-sm text-ink-400">No data yet.</div>
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#D3DBD5" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#7C8C82' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#7C8C82' }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ fill: 'rgba(16,86,102,0.06)' }} />
        <Bar dataKey={dataKey} fill={CHART_COLORS[color]} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
