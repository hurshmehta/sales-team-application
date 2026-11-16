interface ProgressBarProps {
  percent: number;
  label: string;
}

export default function ProgressBar({ percent, label }: ProgressBarProps) {
  return (
    <div className="mb-8" aria-label={`Progress: ${label}`}>
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-neutral-500">
        <span>{label}</span>
        <span className="text-neutral-900">{percent}%</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-neutral-200"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-neutral-900 transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
