import { useEffect, useRef, useState } from "react";
import {
  equipmentOptions,
  exerciseOptions,
  type DayName,
  type DayPlan,
  type EquipmentOption,
  type ExerciseOption,
  weekDays,
} from "./scheduleData";
import { SchedulePreviewCarousel } from "./SchedulePreviewCarousel";
import { getBackendDays, toDisplayDay } from "./scheduleResponseUtils";
import type { DisplayDay, SchedulePayload } from "./schedulePlannerTypes";
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
  const bodyweightOnlyEquipment = ["body weight"];
  const [schedulePreview, setSchedulePreview] = useState<DisplayDay[]>([]);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{
    equipmentChoice?: string;
    equipmentList?: string;
    fitness?: string;
    bodyPlanChoice?: string;
    specificBodyParts?: string;
  }>({});
  const equipmentSectionRef = useRef<HTMLFieldSetElement | null>(null);
  const fitnessSectionRef = useRef<HTMLFieldSetElement | null>(null);
  const bodyPlanSectionRef = useRef<HTMLFieldSetElement | null>(null);

  // Single source of truth for form state

  const [form, setForm] = useState<SchedulePayload>({
    equipment:
      selectedEquipment.length > 0
        ? selectedEquipment
        : bodyweightOnlyEquipment,
    difficulty: "",
    muscleGroups: [
      "chest",
      "shoulders",
      "back",
      "upper arms",
      "lower arms",
      "neck",
      "upper legs",
      "lower legs",
      "waist",
      "cardio",
    ],
    durationMinutes: [30, 30, 30, 30, 30, null, null],
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      equipment:
        hasEquipment === "no" ? bodyweightOnlyEquipment : selectedEquipment,
    }));
  }, [hasEquipment, selectedEquipment]);

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
        let hours =
          field === "hours" ? Number(nextValue) : Number(dayPlans[day].hours);
        let minutes =
          field === "minutes"
            ? Number(nextValue)
            : Number(dayPlans[day].minutes);
        hours = isNaN(hours) ? 0 : hours;
        minutes = isNaN(minutes) ? 0 : minutes;
        const total = hours * 60 + minutes;
        const updated = [...prev.durationMinutes];
        updated[dayIndex] = total;
        return { ...prev, durationMinutes: updated };
      });
    }
  };

  const validateForm = () => {
    const nextErrors: {
      equipmentChoice?: string;
      equipmentList?: string;
      fitness?: string;
      bodyPlanChoice?: string;
      specificBodyParts?: string;
    } = {};

    if (hasEquipment !== "yes" && hasEquipment !== "no") {
      nextErrors.equipmentChoice =
        "Please choose whether you have equipment available.";
    }

    if (hasEquipment === "yes" && selectedEquipment.length === 0) {
      nextErrors.equipmentList =
        "Please select at least one available equipment option.";
    }

    if (!form.difficulty) {
      nextErrors.fitness = "Please choose your fitness level.";
    }

    if (targetAllBodyParts !== "yes" && targetAllBodyParts !== "no") {
      nextErrors.bodyPlanChoice =
        "Please choose if you want a balanced or specific body-part plan.";
    }

    if (targetAllBodyParts === "no" && form.muscleGroups.length === 0) {
      nextErrors.specificBodyParts =
        "Please select at least one specific body part.";
    }

    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.equipmentChoice || nextErrors.equipmentList) {
        equipmentSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      } else if (nextErrors.fitness) {
        fitnessSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      } else if (nextErrors.bodyPlanChoice || nextErrors.specificBodyParts) {
        bodyPlanSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }

    return Object.keys(nextErrors).length === 0;
  };

  // Handler for Create Schedule button
  const handleCreateSchedule = async () => {
    if (!validateForm()) {
      setScheduleError(null);
      setSchedulePreview([]);
      return;
    }

    // Log the payload for debugging
    console.log("Sending schedule payload:", form);
    try {
      const response = await fetch("http://localhost:5000/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log("Backend response:", data);

      const backendDays = getBackendDays(data);
      const displayDays = backendDays
        .map((day) => toDisplayDay(day, form.durationMinutes))
        .sort((a, b) => a.calendarDayIndex - b.calendarDayIndex);

      if (displayDays.length === 0) {
        setScheduleError(
          "The schedule response was empty or in an unexpected format.",
        );
        setSchedulePreview([]);
        return;
      }

      setScheduleError(null);
      setFormErrors({});
      setSchedulePreview(displayDays);
    } catch (error) {
      console.error("Error sending schedule:", error);
      setScheduleError("Could not create a schedule. Please try again.");
      setSchedulePreview([]);
    }
  };

  return (
    <form
      className="animate-rise-delay space-y-6 rounded-4xl border border-white/20 bg-black/45 p-5 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        handleCreateSchedule();
      }}
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

      <div className="grid gap-6 lg:grid-cols-1">
        <fieldset
          ref={equipmentSectionRef}
          className="order-2 space-y-3 rounded-3xl border border-white/15 bg-white/5 p-4 transition hover:bg-white/[0.07]"
        >
          <legend className="px-1 text-sm uppercase tracking-[0.22em] text-cyan-100/90">
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
          {formErrors.equipmentChoice ? (
            <p className="text-xs text-rose-200">
              {formErrors.equipmentChoice}
            </p>
          ) : null}

          <div
            className={`space-y-3 pt-2 transition ${
              hasEquipment === "yes" ? "opacity-100" : "opacity-45"
            }`}
          >
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/90">
              Equipment available
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {equipmentOptions.map((item) => (
                <label
                  key={item}
                  className={`flex items-center gap-3 rounded-2xl border px-3 py-2 text-sm capitalize transition ${
                    hasEquipment === "yes"
                      ? "cursor-pointer"
                      : "cursor-not-allowed"
                  } ${
                    form.equipment.includes(item)
                      ? "border-amber-300/60 bg-amber-300/15 text-white"
                      : "border-white/15 bg-black/30 text-slate-200 hover:border-white/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedEquipment.includes(item)}
                    disabled={hasEquipment !== "yes"}
                    onChange={(event) => {
                      const updated = event.target.checked
                        ? selectedEquipment.includes(item)
                          ? selectedEquipment
                          : [...selectedEquipment, item]
                        : selectedEquipment.filter(
                            (selected) => selected !== item,
                          );

                      setSelectedEquipment(updated);
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
            {hasEquipment !== "yes" ? (
              <p className="text-xs text-slate-300/90">
                Equipment options are locked in bodyweight mode.
              </p>
            ) : null}
            {formErrors.equipmentList ? (
              <p className="text-xs text-rose-200">
                {formErrors.equipmentList}
              </p>
            ) : null}
          </div>
        </fieldset>

        <fieldset
          ref={fitnessSectionRef}
          className="order-1 space-y-3 rounded-3xl border border-white/15 bg-white/5 p-4 transition hover:bg-white/[0.07]"
        >
          <legend className="px-1 text-sm uppercase tracking-[0.22em] text-cyan-100/90">
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
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      difficulty: event.target.value,
                    }))
                  }
                  className="peer sr-only"
                />
                <span className="flex h-5 w-5 items-center justify-center rounded-md border border-white/30 bg-black/40 text-transparent transition peer-checked:border-cyan-200 peer-checked:bg-cyan-300 peer-checked:text-slate-950">
                  •
                </span>
              </label>
            ))}
          </div>
          {formErrors.fitness ? (
            <p className="text-xs text-rose-200">{formErrors.fitness}</p>
          ) : null}
        </fieldset>
      </div>

      <fieldset
        ref={bodyPlanSectionRef}
        className="space-y-3 rounded-3xl border border-white/15 bg-white/5 p-4 transition hover:bg-white/[0.07]"
      >
        <legend className="px-1 text-sm uppercase tracking-[0.22em] text-cyan-100/90">
          How much time do you have on each applicable day?
        </legend>
        <div className="grid gap-3">
          {weekDays.map((day) => (
            <div
              key={day}
              className={`grid items-center gap-3 rounded-2xl border px-4 py-3 transition sm:grid-cols-[80px_1fr] lg:grid-cols-[90px_1fr_320px] ${
                dayPlans[day].active
                  ? "border-cyan-300/45 bg-cyan-300/10"
                  : "border-white/15 bg-black/30"
              }`}
            >
              <div className="font-medium text-white">{day}</div>
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <div className="relative h-5 w-5">
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
                    className="peer absolute inset-0 z-10 h-5 w-5 cursor-pointer opacity-0"
                  />
                  <span className="flex h-5 w-5 items-center justify-center rounded-md border border-white/30 bg-black/40 text-transparent transition peer-checked:border-cyan-200 peer-checked:bg-cyan-300 peer-checked:text-slate-950">
                    ✓
                  </span>
                </div>
                <span>Available</span>
              </div>

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
        <legend className="px-1 text-sm uppercase tracking-[0.22em] text-cyan-100/90">
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
        {formErrors.bodyPlanChoice ? (
          <p className="text-xs text-rose-200">{formErrors.bodyPlanChoice}</p>
        ) : null}

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
                        updated = prev.muscleGroups.filter(
                          (selected) => selected !== exercise,
                        );
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
        {targetAllBodyParts === "no" && formErrors.specificBodyParts ? (
          <p className="text-xs text-rose-200">
            {formErrors.specificBodyParts}
          </p>
        ) : null}
      </fieldset>

      <button
        type="submit"
        className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl bg-linear-to-r from-cyan-300 via-sky-300 to-emerald-300 px-5 py-4 text-sm font-semibold text-slate-950 transition duration-300 hover:brightness-110"
      >
        Create schedule
      </button>

      {scheduleError ? (
        <div className="rounded-2xl border border-rose-300/40 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
          {scheduleError}
        </div>
      ) : null}

      <SchedulePreviewCarousel
        days={schedulePreview}
        difficulty={form.difficulty}
      />
    </form>
  );
}
