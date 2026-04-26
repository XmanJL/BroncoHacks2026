import { weekDays } from "./scheduleData";
import type {
  BackendDayResponse,
  BackendExerciseObject,
  BackendExerciseRow,
  DisplayDay,
  DisplayExercise,
} from "./schedulePlannerTypes";

export const isBackendDayResponse = (
  value: unknown,
): value is BackendDayResponse => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const maybeDay = value as { day?: unknown; exercises?: unknown };
  return typeof maybeDay.day === "number" && Array.isArray(maybeDay.exercises);
};

export const getBackendDays = (payload: unknown): BackendDayResponse[] => {
  if (Array.isArray(payload) && payload.every(isBackendDayResponse)) {
    return payload;
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "schedule" in payload
  ) {
    const maybeSchedule = (payload as { schedule?: unknown }).schedule;
    if (
      Array.isArray(maybeSchedule) &&
      maybeSchedule.every(isBackendDayResponse)
    ) {
      return maybeSchedule;
    }
  }

  return [];
};

export const toDisplayExercise = (row: BackendExerciseRow): DisplayExercise => {
  const readString = (index: number, fallback: string) => {
    const value = row[index];
    return typeof value === "string" && value.length > 0 ? value : fallback;
  };

  const readNumber = (index: number): number | null => {
    const value = row[index];
    return typeof value === "number" ? value : null;
  };

  return {
    id: readNumber(0) ?? -1,
    name: readString(1, "Unknown exercise"),
    bodyPart: readString(3, "Unknown body part"),
    equipment: readString(4, "Unknown equipment"),
    target: readString(5, "Unknown target"),
    timePerSetSec: readNumber(17),
    restTimeSec: readNumber(18),
    warmupTimeSec: readNumber(19),
    defaultSetsBeginner: readNumber(20),
    defaultSetsIntermediate: readNumber(21),
    defaultSetsAdvanced: readNumber(22),
    defaultRepsBeginner: readString(23, "-"),
    defaultRepsIntermediate: readString(24, "-"),
    defaultRepsAdvanced: readString(25, "-"),
    instructions: [],
  };
};

const readObjectString = (
  source: BackendExerciseObject,
  keys: string[],
  fallback: string,
) => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return fallback;
};

const readObjectNumber = (source: BackendExerciseObject, key: string) => {
  const value = source[key];
  return typeof value === "number" ? value : null;
};

const readNestedInstruction = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && value !== null) {
    const entries = Object.values(value as Record<string, unknown>);
    const firstString = entries.find((entry) => typeof entry === "string");
    return typeof firstString === "string" ? firstString : "";
  }

  return "";
};

const extractInstructions = (source: BackendExerciseObject) => {
  return Object.keys(source)
    .filter((key) => key.startsWith("instructions/"))
    .sort((a, b) => {
      const aIndex = Number(a.split("/")[1]);
      const bIndex = Number(b.split("/")[1]);
      return aIndex - bIndex;
    })
    .map((key) => readNestedInstruction(source[key]))
    .filter((instruction) => instruction.length > 0 && instruction !== "-1");
};

export const toDisplayExerciseFromObject = (
  source: BackendExerciseObject,
): DisplayExercise => {
  return {
    id: readObjectNumber(source, "id") ?? -1,
    name: readObjectString(
      source,
      ["name_display", "name_norm"],
      "Unknown exercise",
    ),
    bodyPart: readObjectString(
      source,
      ["body_part_raw", "body_part_group"],
      "Unknown body part",
    ),
    equipment: readObjectString(
      source,
      ["equipment_raw", "equipment_group"],
      "Unknown equipment",
    ),
    target: readObjectString(
      source,
      ["target_raw", "target_group"],
      "Unknown target",
    ),
    timePerSetSec: readObjectNumber(source, "time_per_set_sec"),
    restTimeSec: readObjectNumber(source, "rest_time_sec"),
    warmupTimeSec: readObjectNumber(source, "warmup_time_sec"),
    defaultSetsBeginner: readObjectNumber(source, "default_sets_beginner"),
    defaultSetsIntermediate: readObjectNumber(
      source,
      "default_sets_intermediate",
    ),
    defaultSetsAdvanced: readObjectNumber(source, "default_sets_advanced"),
    defaultRepsBeginner: readObjectString(
      source,
      ["default_reps_beginner"],
      "-",
    ),
    defaultRepsIntermediate: readObjectString(
      source,
      ["default_reps_intermediate"],
      "-",
    ),
    defaultRepsAdvanced: readObjectString(
      source,
      ["default_reps_advanced"],
      "-",
    ),
    instructions: extractInstructions(source),
  };
};

const toDisplayExerciseAny = (
  exercise: BackendExerciseRow | BackendExerciseObject,
): DisplayExercise => {
  if (Array.isArray(exercise)) {
    return toDisplayExercise(exercise);
  }

  if (typeof exercise === "object" && exercise !== null) {
    return toDisplayExerciseFromObject(exercise as BackendExerciseObject);
  }

  return {
    id: -1,
    name: "Unknown exercise",
    bodyPart: "Unknown body part",
    equipment: "Unknown equipment",
    target: "Unknown target",
    timePerSetSec: null,
    restTimeSec: null,
    warmupTimeSec: null,
    defaultSetsBeginner: null,
    defaultSetsIntermediate: null,
    defaultSetsAdvanced: null,
    defaultRepsBeginner: "-",
    defaultRepsIntermediate: "-",
    defaultRepsAdvanced: "-",
    instructions: [],
  };
};

export const toDisplayDay = (
  dayItem: BackendDayResponse,
  durationMinutes: (number | null)[],
): DisplayDay => {
  const safeDayIndex = Math.max(1, Math.min(7, Math.floor(dayItem.day)));
  const directIndex = safeDayIndex - 1;
  const activeDayIndices = durationMinutes
    .map((minutes, index) => (minutes !== null ? index : -1))
    .filter((index) => index !== -1);

  // If the direct day points at an inactive slot, treat backend day as rank among active days.
  const rankedIndex =
    activeDayIndices[safeDayIndex - 1] !== undefined
      ? activeDayIndices[safeDayIndex - 1]
      : directIndex;

  const resolvedIndex =
    durationMinutes[directIndex] === null ? rankedIndex : directIndex;
  const usesSpecificDay = durationMinutes[resolvedIndex] !== null;
  const dayName = weekDays[resolvedIndex] ?? `Day ${safeDayIndex}`;
  const isRestDay = !usesSpecificDay || dayItem.exercises.length === 0;

  return {
    dayIndex: safeDayIndex,
    calendarDayIndex: resolvedIndex,
    label: isRestDay ? `${dayName}: Rest Day!` : dayName,
    usesSpecificDay,
    exercises: isRestDay ? [] : dayItem.exercises.map(toDisplayExerciseAny),
  };
};

export const getSelectedSetsAndReps = (
  exercise: DisplayExercise,
  difficulty: string,
) => {
  if (difficulty === "intermediate") {
    return {
      sets: exercise.defaultSetsIntermediate,
      reps: exercise.defaultRepsIntermediate,
    };
  }

  if (difficulty === "advanced") {
    return {
      sets: exercise.defaultSetsAdvanced,
      reps: exercise.defaultRepsAdvanced,
    };
  }

  return {
    sets: exercise.defaultSetsBeginner,
    reps: exercise.defaultRepsBeginner,
  };
};
