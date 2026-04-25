export const weekDays = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

export const exerciseOptions = [
  "waist",
  "upper legs",
  "back",
  "lower legs",
  "chest",
  "upper arms",
  "cardio",
  "shoulders",
  "lower arms",
  "neck",
] as const;

export const equipmentOptions = [
  "body weight",
  "cable",
  "leverage machine",
  "assisted",
  "medicine ball",
  "stability ball",
  "band",
  "barbell",
  "rope",
  "dumbbell",
  "ez barbell",
  "sled machine",
  "upper body ergometer",
  "kettlebell",
  "olympic barbell",
  "weighted",
  "bosu ball",
  "resistance band",
  "roller",
  "skierg machine",
  "hammer",
  "smith machine",
  "wheel roller",
  "stationary bike",
  "tire",
  "trap bar",
  "elliptical machine",
  "stepmill machine",
] as const;

export type ExerciseOption = (typeof exerciseOptions)[number];
export type EquipmentOption = (typeof equipmentOptions)[number];

export type DayName = (typeof weekDays)[number];

export type DayPlan = {
  active: boolean;
  hours: string;
  minutes: string;
};

export const initialDayPlans: Record<DayName, DayPlan> = {
  Mon: { active: true, hours: "0", minutes: "45" },
  Tue: { active: true, hours: "0", minutes: "45" },
  Wed: { active: true, hours: "0", minutes: "30" },
  Thu: { active: true, hours: "0", minutes: "45" },
  Fri: { active: true, hours: "0", minutes: "45" },
  Sat: { active: false, hours: "0", minutes: "30" },
  Sun: { active: false, hours: "0", minutes: "30" },
};

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toSafeNumber(value: string) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

export function dayPlanMinutes(plan: DayPlan) {
  const hours = Math.max(0, toSafeNumber(plan.hours));
  const minutes = Math.min(59, Math.max(0, toSafeNumber(plan.minutes)));
  return hours * 60 + minutes;
}
