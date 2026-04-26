import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getSelectedSetsAndReps } from "./scheduleResponseUtils";
import type { DisplayDay, DisplayExercise } from "./schedulePlannerTypes";

type SchedulePreviewCarouselProps = {
  days: DisplayDay[];
  difficulty: string;
};

export function SchedulePreviewCarousel({
  days,
  difficulty,
}: SchedulePreviewCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [instructionOverlay, setInstructionOverlay] = useState<{
    dayLabel: string;
    exercise: DisplayExercise;
  } | null>(null);
  const [isOverlayActive, setIsOverlayActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const overlayCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const getCardElements = () => {
    const container = scrollRef.current;
    if (!container) {
      return [] as HTMLElement[];
    }

    return Array.from(container.querySelectorAll<HTMLElement>("[data-card]"));
  };

  const scrollCardIntoCenter = (
    card: HTMLElement,
    behavior: ScrollBehavior,
  ) => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    const targetLeft =
      card.offsetLeft - (container.clientWidth - card.offsetWidth) / 2;

    container.scrollTo({
      left: Math.max(0, targetLeft),
      behavior,
    });
  };

  useEffect(() => {
    setActiveIndex(0);
    const cards = getCardElements();
    if (cards.length > 0) {
      scrollCardIntoCenter(cards[0], "auto");
    }
  }, [days]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOverlayActive(false);
        setInstructionOverlay(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      if (overlayCloseTimerRef.current) {
        clearTimeout(overlayCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!instructionOverlay) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [instructionOverlay]);

  const scrollToDay = (index: number) => {
    const cards = getCardElements();
    if (cards.length === 0) {
      return;
    }

    const clamped = Math.max(0, Math.min(index, cards.length - 1));
    scrollCardIntoCenter(cards[clamped], "smooth");
    setActiveIndex(clamped);
  };

  const openInstructionOverlay = (
    dayLabel: string,
    exercise: DisplayExercise,
  ) => {
    if (overlayCloseTimerRef.current) {
      clearTimeout(overlayCloseTimerRef.current);
      overlayCloseTimerRef.current = null;
    }

    setInstructionOverlay({ dayLabel, exercise });
    setIsOverlayActive(false);

    requestAnimationFrame(() => {
      setIsOverlayActive(true);
    });
  };

  const closeInstructionOverlay = () => {
    setIsOverlayActive(false);

    if (overlayCloseTimerRef.current) {
      clearTimeout(overlayCloseTimerRef.current);
    }

    overlayCloseTimerRef.current = setTimeout(() => {
      setInstructionOverlay(null);
      overlayCloseTimerRef.current = null;
    }, 220);
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    const cards = getCardElements();
    if (!container || container.clientWidth === 0 || cards.length === 0) {
      return;
    }

    const viewportCenter = container.scrollLeft + container.clientWidth / 2;

    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - viewportCenter);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    if (nearestIndex !== activeIndex) {
      setActiveIndex(nearestIndex);
    }
  };

  if (days.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-3xl border border-white/15 bg-black/30 p-4">
      <div>
        <h3 className="mt-2 text-xl font-semibold text-white">
          Your weekly workout plan
        </h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => scrollToDay(activeIndex - 1)}
            disabled={activeIndex === 0}
            className="cursor-pointer rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white transition enabled:hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
            {activeIndex + 1} / {days.length}
          </p>
          <button
            type="button"
            onClick={() => scrollToDay(activeIndex + 1)}
            disabled={activeIndex === days.length - 1}
            className="cursor-pointer rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white transition enabled:hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-1 md:px-10"
          style={{ perspective: "1200px" }}
        >
          {days.map((day, index) => (
            <article
              key={`${day.dayIndex}-${day.label}`}
              data-card
              className="basis-[84%] shrink-0 snap-center space-y-3 rounded-2xl border border-white/15 bg-white/5 p-3 transition-all duration-300 md:basis-[70%]"
              style={{
                transform:
                  index === activeIndex
                    ? "translateX(0) scale(1) rotateY(0deg)"
                    : index < activeIndex
                      ? "translateX(8px) scale(0.93) rotateY(42deg)"
                      : "translateX(-8px) scale(0.93) rotateY(-42deg)",
                opacity:
                  index === activeIndex
                    ? 1
                    : Math.abs(index - activeIndex) === 1
                      ? 0.72
                      : 0.35,
                zIndex: index === activeIndex ? 20 : 10,
                transformStyle: "preserve-3d",
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-lg font-semibold text-white">
                  {day.label}
                </h4>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-300">
                  {day.usesSpecificDay ? "Scheduled day" : "Flexible day"}
                </span>
              </div>

              {day.exercises.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-cyan-200/30 bg-cyan-200/5 p-5 text-center">
                  <p className="text-sm font-medium text-cyan-100">
                    No exercises scheduled for this day. ☆(≧▽≦)☆ Go play some
                    games or hang out.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {day.exercises.map((exercise, exerciseIndex) => {
                    const selectedPlan = getSelectedSetsAndReps(
                      exercise,
                      difficulty,
                    );

                    return (
                      <button
                        key={`${day.dayIndex}-${exercise.id}-${exerciseIndex}`}
                        type="button"
                        onClick={() =>
                          openInstructionOverlay(day.label, exercise)
                        }
                        className="w-full cursor-pointer rounded-2xl border border-white/15 bg-black/35 p-3 text-left transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200/55 hover:bg-black/50 hover:shadow-[0_16px_30px_-18px_rgba(103,232,249,0.9)] active:scale-[0.99]"
                      >
                        <p className="text-sm font-semibold text-white capitalize">
                          {exercise.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-300 capitalize">
                          {exercise.bodyPart} • {exercise.target}
                        </p>
                        <p className="text-xs text-slate-300 capitalize">
                          {exercise.equipment}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-2.5 py-1 text-[11px] font-medium text-cyan-100">
                            Time Per Rest: {exercise.timePerSetSec ?? "-"}{" "}
                            seconds
                          </span>
                          <span className="rounded-full border border-sky-300/40 bg-sky-300/10 px-2.5 py-1 text-[11px] font-medium text-sky-100">
                            Rest Time: {exercise.restTimeSec ?? "-"} seconds
                          </span>
                          <span className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-2.5 py-1 text-[11px] font-medium text-emerald-100">
                            Time to Warm Up: {exercise.warmupTimeSec ?? "-"}{" "}
                            seconds
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-2.5 py-1 text-[11px] font-medium text-amber-100">
                            Sets: {selectedPlan.sets ?? "-"}
                          </span>
                          <span className="rounded-full border border-fuchsia-300/40 bg-fuchsia-300/10 px-2.5 py-1 text-[11px] font-medium text-fuchsia-100">
                            Reps: {selectedPlan.reps}
                          </span>
                        </div>

                        <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-cyan-100/80">
                          Tap for instructions
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="flex justify-center gap-2">
          {days.map((day, index) => (
            <button
              key={`${day.dayIndex}-dot`}
              type="button"
              onClick={() => scrollToDay(index)}
              aria-label={`Go to ${day.label}`}
              className={`h-2.5 rounded-full transition-all ${
                index === activeIndex ? "w-8 bg-cyan-200" : "w-2.5 bg-white/35"
              }`}
            />
          ))}
        </div>
      </div>

      {instructionOverlay && typeof document !== "undefined"
        ? createPortal(
            <div
              className={`fixed inset-0 z-999 bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${
                isOverlayActive ? "opacity-100" : "opacity-0"
              }`}
              onClick={closeInstructionOverlay}
            >
              <div className="flex min-h-dvh items-center justify-center p-4">
                <div
                  className={`w-full max-w-2xl rounded-2xl border border-white/20 bg-slate-950/95 p-4 shadow-2xl shadow-black/40 transition-all duration-200 sm:p-5 ${
                    isOverlayActive
                      ? "translate-y-0 scale-100 opacity-100"
                      : "translate-y-5 scale-95 opacity-0"
                  }`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/85">
                        {instructionOverlay.dayLabel}
                      </p>
                      <h5 className="mt-1 text-lg font-semibold capitalize text-white">
                        {instructionOverlay.exercise.name}
                      </h5>
                    </div>
                    <button
                      type="button"
                      className="cursor-pointer rounded-lg border border-white/20 px-2.5 py-1 text-xs text-white transition hover:bg-white/10"
                      onClick={closeInstructionOverlay}
                    >
                      Close
                    </button>
                  </div>

                  {instructionOverlay.exercise.instructions.length > 0 ? (
                    <ol className="max-h-[60vh] list-decimal space-y-2 overflow-y-auto pr-2 pl-5 text-sm text-slate-100">
                      {instructionOverlay.exercise.instructions.map(
                        (instruction, instructionIndex) => (
                          <li
                            key={`${instructionOverlay.exercise.id}-overlay-${instructionIndex}`}
                          >
                            {instruction}
                          </li>
                        ),
                      )}
                    </ol>
                  ) : (
                    <p className="text-sm text-slate-300">
                      No instructions available.
                    </p>
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}
