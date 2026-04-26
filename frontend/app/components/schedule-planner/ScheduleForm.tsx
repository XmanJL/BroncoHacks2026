import { useState } from "react";
import {
  equipmentOptions,
  exerciseOptions,
  type DayName,
  type DayPlan,
  type EquipmentOption,
  type ExerciseOption,
  weekDays,
} from "./scheduleData";
import { TimeStepper } from "./TimeStepper";

type ScheduleFormProps = {
  hasEquipment: string;
  setHasEquipment: (value: string) => void;
  selectedEquipment: EquipmentOption[];
  setSelectedEquipment: (value: EquipmentOption[]) => void;
  targetAllBodyParts: string;
  setTargetAllBodyParts: (value: string) => void;
  selectedExercises: ExerciseOption[];
  setSelectedExercises: (value: ExerciseOption[]) => void;
  fitnessLevel: string;
  setFitnessLevel: (value: string) => void;
  dayPlans: Record<DayName, DayPlan>;
  setDayPlans: (value: Record<DayName, DayPlan>) => void;
};

export function ScheduleForm({
  hasEquipment,
  setHasEquipment,
  selectedEquipment,
  setSelectedEquipment,
  targetAllBodyParts,
  setTargetAllBodyParts,
  selectedExercises,
  setSelectedExercises,
  fitnessLevel,
  setFitnessLevel,
  dayPlans,
  setDayPlans,
}: ScheduleFormProps) {

  // Single source of truth for form state
  
  const [form, setForm] = useState<SchedulePayload>({
    equipment: [],
    difficulty: "",
    muscleGroups: ["chest",
                  "shoulders",
                  "back",
                  "upper arms",
                  "lower arms",
                  "neck",
                  "upper legs",
                  "lower legs",
                  "waist",
                  "cardio",],
    durationMinutes: [30, 30, 30, 30, 30, null, null],
  });


    type SchedulePayload = {
      equipment: string[];
      difficulty: string;
      muscleGroups: string[];
      durationMinutes: (number | null)[]; // length 7
    };


  // ...existing code...
  const updateDayTimeByMinutes = (day: DayName, deltaMinutes: number) => {
    const currentHours = Math.max(0, Number(dayPlans[day].hours) || 0);
    const currentMinutes = Math.max(
      0,
      Math.min(59, Number(dayPlans[day].minutes) || 0),
    );
    const nextTotalMinutes = Math.max(
      0,
      Math.min(12 * 60, currentHours * 60 + currentMinutes + deltaMinutes),
    );

    const nextHours = Math.floor(nextTotalMinutes / 60);
    const nextMinutes = nextTotalMinutes % 60;

    setDayPlans({
      ...dayPlans,
      [day]: {
        ...dayPlans[day],
        hours: String(nextHours),
        minutes: String(nextMinutes),
      },
    });

    // Update form.durationMinutes for the correct day index
    const dayIndex = weekDays.indexOf(day);
    if (dayIndex !== -1) {
      setForm((prev) => {
        const updated = [...prev.durationMinutes];
        updated[dayIndex] = nextTotalMinutes;
        return { ...prev, durationMinutes: updated };
      });
    }
  };

  const updateDayTimeFromSelect = (
    day: DayName,
    field: "hours" | "minutes",
    value: string,
  ) => {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      return;
    }

    const nextValue =
      field === "hours"
        ? String(Math.max(0, Math.min(12, parsed)))
        : String(Math.max(0, Math.min(55, parsed - (parsed % 5))));

    setDayPlans({
      ...dayPlans,
      [day]: {
        ...dayPlans[day],
        [field]: nextValue,
      },
    });

    // Update form.durationMinutes for the correct day index
    const dayIndex = weekDays.indexOf(day);
    if (dayIndex !== -1) {
      setForm((prev) => {
        let hours = field === "hours" ? Number(nextValue) : Number(dayPlans[day].hours);
        let minutes = field === "minutes" ? Number(nextValue) : Number(dayPlans[day].minutes);
        hours = isNaN(hours) ? 0 : hours;
        minutes = isNaN(minutes) ? 0 : minutes;
        const total = hours * 60 + minutes;
        const updated = [...prev.durationMinutes];
        updated[dayIndex] = total;
        return { ...prev, durationMinutes: updated };
      });
    }
  };

  // Handler for Create Schedule button
  const handleCreateSchedule = async () => {
    // Log the payload for debugging
    console.log("Sending schedule payload:", form);
    try {
      const response = await fetch("http://localhost:5000/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      console.log("Backend response:", data);
      // Optionally, show a success message or handle errors here
    } catch (error) {
      console.error("Error sending schedule:", error);
    }
  };

  return (
    <form
      className="animate-rise-delay space-y-6 rounded-4xl border border-white/20 bg-black/45 p-5 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-8"
      onSubmit={e => { e.preventDefault(); handleCreateSchedule(); }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">
            Create schedule form
          </p>
          <h2 className="font-display mt-2 text-2xl font-semibold text-white sm:text-3xl">
            Answer a few quick setup questions
          </h2>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <fieldset className="space-y-3 rounded-3xl border border-white/15 bg-white/5 p-4 transition hover:bg-white/[0.07]">
          <legend className="px-1 text-sm font-medium text-white">
            Do you have equipment?
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              ["yes", "Yes, I have equipment"],
              ["no", "No, just my room / bodyweight space"],
            ].map(([value, label]) => (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                  hasEquipment === value
                    ? "border-cyan-300/60 bg-cyan-300/15 text-white"
                    : "border-white/15 bg-black/30 text-slate-200 hover:border-white/30"
                }`}
              >
                <input
                  type="radio"
                  name="equipment"
                  value={value}
                  checked={hasEquipment === value}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setHasEquipment(nextValue);
                    if (nextValue === "no") {
                      setSelectedEquipment(["body weight"]);
                    }
                  }}
                  className="peer sr-only"
                />
                <span className="flex h-5 w-5 items-center justify-center rounded-md border border-white/30 bg-black/40 text-transparent transition peer-checked:border-cyan-200 peer-checked:bg-cyan-300 peer-checked:text-slate-950">
                  •
                </span>
                <span>{label}</span>
              </label>
            ))}
          </div>

          {hasEquipment === "yes" ? (
            <div className="space-y-3 pt-2">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-300">
                Equipment available
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {equipmentOptions.map((item) => (
                  <label
                    key={item}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2 text-sm capitalize transition ${
                      form.equipment.includes(item)
                        ? "border-amber-300/60 bg-amber-300/15 text-white"
                        : "border-white/15 bg-black/30 text-slate-200 hover:border-white/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.equipment.includes(item)}
                      onChange={(event) => {
                        setForm((prev) => {
                          let updated: string[];
                          if (event.target.checked) {
                            updated = prev.equipment.includes(item)
                              ? prev.equipment
                              : [...prev.equipment, item];
                          } else {
                            updated = prev.equipment.filter((selected) => selected !== item);
                          }
                          return { ...prev, equipment: updated };
                        });
                        // Optionally sync with setSelectedEquipment if needed
                      }}
                      className="peer sr-only"
                    />
                    <span className="flex h-5 w-5 items-center justify-center rounded-md border border-white/30 bg-black/40 text-transparent transition peer-checked:border-amber-200 peer-checked:bg-amber-300 peer-checked:text-slate-950">
                      ✓
                    </span>
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}
        </fieldset>

        <fieldset className="space-y-3 rounded-3xl border border-white/15 bg-white/5 p-4 transition hover:bg-white/[0.07]">
          <legend className="px-1 text-sm font-medium text-white">
            How fit do you consider yourself?
          </legend>
          <div className="grid gap-2">
            {[
              ["beginner", "Beginner"],
              ["intermediate", "Intermediate"],
              ["advanced", "Advanced"],
            ].map(([value, label]) => (
              <label
                key={value}
                className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                  form.difficulty === value
                    ? "border-cyan-300/60 bg-cyan-300/15 text-white"
                    : "border-white/15 bg-black/30 text-slate-200 hover:border-white/30"
                }`}
              >
                <span>{label}</span>
                <input
                  type="radio"
                  name="fitnessLevel"
                  value={value}
                  checked={form.difficulty === value}
                  onChange={(event) => setForm((prev) => ({ ...prev, difficulty: event.target.value }))}
                  className="peer sr-only"
                />
                <span className="flex h-5 w-5 items-center justify-center rounded-md border border-white/30 bg-black/40 text-transparent transition peer-checked:border-cyan-200 peer-checked:bg-cyan-300 peer-checked:text-slate-950">
                  •
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <fieldset className="space-y-3 rounded-3xl border border-white/15 bg-white/5 p-4 transition hover:bg-white/[0.07]">
        <legend className="px-1 text-sm font-medium text-white">
          How much time do you have on each applicable day?
        </legend>
        <div className="grid gap-3">
          {weekDays.map((day) => (
            <div
              key={day}
              className="grid items-center gap-3 rounded-2xl border border-white/15 bg-black/30 px-4 py-3 sm:grid-cols-[80px_1fr] lg:grid-cols-[90px_1fr_320px]"
            >
              <div className="font-medium text-white">{day}</div>
              <label className="flex items-center gap-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={dayPlans[day].active}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setDayPlans({
                      ...dayPlans,
                      [day]: {
                        ...dayPlans[day],
                        active: checked,
                      },
                    });
                    // Update durationMinutes in form
                    const dayIndex = weekDays.indexOf(day);
                    setForm((prev) => {
                      const updated = [...prev.durationMinutes];
                      if (!checked) {
                        updated[dayIndex] = null;
                      } else {
                        // Default to current hours/minutes or 0 if not set
                        const hours = Number(dayPlans[day].hours) || 0;
                        const minutes = Number(dayPlans[day].minutes) || 0;
                        updated[dayIndex] = hours * 60 + minutes;
                      }
                      return { ...prev, durationMinutes: updated };
                    });
                  }}
                  className="peer sr-only"
                />
                <span className="flex h-5 w-5 items-center justify-center rounded-md border border-white/30 bg-black/40 text-transparent transition peer-checked:border-cyan-200 peer-checked:bg-cyan-300 peer-checked:text-slate-950">
                  ✓
                </span>
                Available
              </label>

              <div className="flex items-center gap-3 lg:justify-self-end">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-300">
                  Time
                </span>
                <TimeStepper
                  label={`${day} training time`}
                  hours={dayPlans[day].hours}
                  minutes={dayPlans[day].minutes}
                  isDisabled={!dayPlans[day].active}
                  onIncrement={() => updateDayTimeByMinutes(day, 5)}
                  onDecrement={() => updateDayTimeByMinutes(day, -5)}
                  onHoursChange={(value) =>
                    updateDayTimeFromSelect(day, "hours", value)
                  }
                  onMinutesChange={(value) =>
                    updateDayTimeFromSelect(day, "minutes", value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-3xl border border-white/15 bg-white/5 p-4 transition hover:bg-white/[0.07]">
        <legend className="px-1 text-sm font-medium text-white">
          Do you want a balanced plan for targeting body parts?
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            ["yes", "Yes"],
            ["no", "No, I want to target specific areas"],
          ].map(([value, label]) => (
            <label
              key={value}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                targetAllBodyParts === value
                  ? "border-cyan-300/60 bg-cyan-300/15 text-white"
                  : "border-white/15 bg-black/30 text-slate-200 hover:border-white/30"
              }`}
            >
              <input
                type="radio"
                name="target-all-body-parts"
                value={value}
                checked={targetAllBodyParts === value}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setTargetAllBodyParts(nextValue);

                  if (nextValue === "yes") {
                    setSelectedExercises([...exerciseOptions]);
                  }
                }}
                className="peer sr-only"
              />
              <span className="flex h-5 w-5 items-center justify-center rounded-md border border-cyan-300/55 bg-cyan-300/10 text-transparent transition peer-checked:border-cyan-200 peer-checked:bg-cyan-300 peer-checked:text-slate-950">
                •
              </span>
              <span>{label}</span>
            </label>
          ))}
        </div>

        {targetAllBodyParts === "yes" ? (
          <div className="rounded-2xl border border-emerald-300/35 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
            This will balance training across all body parts.
          </div>
        ) : null}

        {targetAllBodyParts === "no" ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {exerciseOptions.map((exercise) => (
              <label
                key={exercise}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm capitalize transition ${
                  form.muscleGroups.includes(exercise)
                    ? "border-orange-300/60 bg-orange-300/15 text-white"
                    : "border-white/15 bg-black/30 text-slate-200 hover:border-white/30"
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.muscleGroups.includes(exercise)}
                  onChange={(event) => {
                    setForm((prev) => {
                      let updated: string[];
                      if (event.target.checked) {
                        updated = prev.muscleGroups.includes(exercise)
                          ? prev.muscleGroups
                          : [...prev.muscleGroups, exercise];
                      } else {
                        updated = prev.muscleGroups.filter((selected) => selected !== exercise);
                      }
                      return { ...prev, muscleGroups: updated };
                    });
                  }}
                  className="peer sr-only"
                />
                <span className="flex h-5 w-5 items-center justify-center rounded-md border border-orange-300/55 bg-orange-300/10 text-transparent transition peer-checked:border-orange-200 peer-checked:bg-orange-300 peer-checked:text-slate-950">
                  ✓
                </span>
                <span>{exercise}</span>
              </label>
            ))}
          </div>
        ) : null}
      </fieldset>

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-cyan-300 via-sky-300 to-emerald-300 px-5 py-4 text-sm font-semibold text-slate-950 transition duration-300 hover:brightness-110"
      >
        Create schedule
      </button>
    </form>
  );
}
