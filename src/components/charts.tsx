import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function Bars({ data, x, y, color = 'var(--accent)' }: { data: object[]; x: string; y: string; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.15)" />
        <XAxis dataKey={x} tick={{ fill: 'var(--ink-soft)', fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fill: 'var(--ink-soft)', fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey={y} fill={color} radius={[10, 10, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function Lines({ data, x, y }: { data: object[]; x: string; y: string }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.15)" />
        <XAxis dataKey={x} tick={{ fill: 'var(--ink-soft)', fontSize: 12 }} />
        <YAxis tick={{ fill: 'var(--ink-soft)', fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey={y} stroke="var(--accent)" strokeWidth={3} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function Pies({ data }: { data: { name: string; value: number; color: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
          {data.map((d) => <Cell key={d.name} fill={d.color} />)}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}
