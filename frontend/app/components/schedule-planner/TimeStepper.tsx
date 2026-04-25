type TimeStepperProps = {
  label: string;
  hours: string;
  minutes: string;
  isDisabled?: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onHoursChange: (value: string) => void;
  onMinutesChange: (value: string) => void;
};

export function TimeStepper({
  label,
  hours,
  minutes,
  isDisabled,
  onIncrement,
  onDecrement,
  onHoursChange,
  onMinutesChange,
}: TimeStepperProps) {
  const hourNumber = Number(hours) || 0;
  const minuteNumber = Number(minutes) || 0;
  const minuteOptions = Array.from({ length: 12 }, (_, index) =>
    String(index * 5),
  );

  return (
    <div
      role="group"
      aria-label={`${label} controls`}
      className="flex flex-nowrap items-center gap-2"
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={isDisabled}
        className="h-9 w-9 rounded-xl border border-white/20 bg-black/40 text-lg leading-none text-white transition hover:border-cyan-300 hover:bg-cyan-400/20 hover:text-cyan-100 hover:shadow-[0_0_14px_rgba(34,211,238,0.45)] disabled:cursor-not-allowed disabled:opacity-45"
        aria-label={`Decrease ${label}`}
      >
        -
      </button>

      <label className="sr-only" htmlFor={`${label}-hours`}>
        Hours
      </label>
      <select
        id={`${label}-hours`}
        value={String(hourNumber)}
        disabled={isDisabled}
        onChange={(event) => onHoursChange(event.target.value)}
        onKeyDown={(event) => {
          if (isDisabled) {
            return;
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            onIncrement();
          }

          if (event.key === "ArrowDown") {
            event.preventDefault();
            onDecrement();
          }
        }}
        className="rounded-xl border border-white/20 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition hover:border-cyan-300/70 focus:border-cyan-300/70 disabled:cursor-not-allowed disabled:opacity-45"
        aria-label={`${label} hours`}
      >
        {Array.from({ length: 13 }, (_, index) => (
          <option key={index} value={String(index)}>
            {index}h
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor={`${label}-minutes`}>
        Minutes
      </label>
      <select
        id={`${label}-minutes`}
        value={
          minuteOptions.includes(String(minuteNumber))
            ? String(minuteNumber)
            : "0"
        }
        disabled={isDisabled}
        onChange={(event) => onMinutesChange(event.target.value)}
        onKeyDown={(event) => {
          if (isDisabled) {
            return;
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            onIncrement();
          }

          if (event.key === "ArrowDown") {
            event.preventDefault();
            onDecrement();
          }
        }}
        className="rounded-xl border border-white/20 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition hover:border-cyan-300/70 focus:border-cyan-300/70 disabled:cursor-not-allowed disabled:opacity-45"
        aria-label={`${label} minutes`}
      >
        {minuteOptions.map((option) => (
          <option key={option} value={option}>
            {String(option).padStart(2, "0")}m
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onIncrement}
        disabled={isDisabled}
        className="h-9 w-9 rounded-xl border border-white/20 bg-black/40 text-lg leading-none text-white transition hover:border-cyan-300 hover:bg-cyan-400/20 hover:text-cyan-100 hover:shadow-[0_0_14px_rgba(34,211,238,0.45)] disabled:cursor-not-allowed disabled:opacity-45"
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </div>
  );
}
