export type BackendExerciseRow = (string | number | boolean | null)[];

export type BackendExerciseObject = {
  [key: string]: unknown;
};

export type BackendDayResponse = {
  day: number;
  exercises: Array<BackendExerciseRow | BackendExerciseObject>;
};

export type DisplayExercise = {
  id: number;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  timePerSetSec: number | null;
  restTimeSec: number | null;
  warmupTimeSec: number | null;
  defaultSetsBeginner: number | null;
  defaultSetsIntermediate: number | null;
  defaultSetsAdvanced: number | null;
  defaultRepsBeginner: string;
  defaultRepsIntermediate: string;
  defaultRepsAdvanced: string;
  instructions: string[];
};

export type DisplayDay = {
  dayIndex: number;
  calendarDayIndex: number;
  label: string;
  usesSpecificDay: boolean;
  exercises: DisplayExercise[];
};

export type SchedulePayload = {
  equipment: string[];
  difficulty: string;
  muscleGroups: string[];
  durationMinutes: (number | null)[];
};
