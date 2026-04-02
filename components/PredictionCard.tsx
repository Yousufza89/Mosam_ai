type PredictionCardProps = {
  title: string
  value: string
  subtitle?: string
  variant?: "default" | "accent"
}

export default function PredictionCard({
  title,
  value,
  subtitle,
  variant = "default",
}: PredictionCardProps) {
  const isAccent = variant === "accent"

  return (
    <div
      className={
        isAccent
          ? "bg-green-50 rounded-lg p-6 text-center border-2 border-green-200"
          : "bg-gray-50 rounded-lg p-6 text-center"
      }
    >
      <p
        className={
          isAccent
            ? "text-sm text-green-700 mb-2 font-semibold"
            : "text-sm text-gray-600 mb-2"
        }
      >
        {title}
      </p>
      <p
        className={
          isAccent
            ? "text-4xl font-bold text-green-600"
            : "text-4xl font-bold text-gray-700"
        }
      >
        {value}
      </p>
      {subtitle && (
        <p
          className={
            isAccent
              ? "text-xs text-green-600 mt-2"
              : "text-xs text-gray-500 mt-2"
          }
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}