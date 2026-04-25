"use client";

import { useState } from "react";
import { HeroSection } from "./HeroSection";
import { ScheduleForm } from "./ScheduleForm";
import {
  exerciseOptions,
  initialDayPlans,
  type EquipmentOption,
  type ExerciseOption,
} from "./scheduleData";

export function SchedulePlannerPage() {
  const [hasEquipment, setHasEquipment] = useState("yes");
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentOption[]>(
    ["dumbbell"],
  );
  const [targetAllBodyParts, setTargetAllBodyParts] = useState("yes");
  const [selectedExercises, setSelectedExercises] = useState<ExerciseOption[]>([
    ...exerciseOptions,
  ]);
  const [fitnessLevel, setFitnessLevel] = useState("beginner");
  const [dayPlans, setDayPlans] = useState(initialDayPlans);

  const title =
    "Build a schedule that fits your week, your space, and your goals.";
  const description =
    "Tell the planner what equipment you have, how much time you can train, and what you want to improve, then it creates a realistic weekly path. It balances recovery, muscle groups, and your availability so the plan feels doable instead of generic.";

  return (
    <main className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="absolute inset-0 bg-[url('/gym-room.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(2,6,23,0.78),rgba(2,6,23,0.85),rgba(0,0,0,0.88))]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <HeroSection title={title} description={description} />

        <ScheduleForm
          hasEquipment={hasEquipment}
          setHasEquipment={setHasEquipment}
          selectedEquipment={selectedEquipment}
          setSelectedEquipment={setSelectedEquipment}
          targetAllBodyParts={targetAllBodyParts}
          setTargetAllBodyParts={setTargetAllBodyParts}
          selectedExercises={selectedExercises}
          setSelectedExercises={setSelectedExercises}
          fitnessLevel={fitnessLevel}
          setFitnessLevel={setFitnessLevel}
          dayPlans={dayPlans}
          setDayPlans={setDayPlans}
        />
      </div>
    </main>
  );
}
