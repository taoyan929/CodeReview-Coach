interface ProgressMetricProps {
  label: string
  value: string
  muted?: boolean
}

export function ProgressMetric({
  label,
  value,
  muted = false,
}: ProgressMetricProps) {
  return (
    <div>
      <dt className="text-sm text-paper/50">{label}</dt>
      <dd
        className={[
          'mt-1 font-semibold',
          muted ? 'text-2xl text-paper/80' : 'text-3xl',
        ].join(' ')}
      >
        {value}
      </dd>
    </div>
  )
}
