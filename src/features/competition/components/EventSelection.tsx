"use client";

import { useEffect, useState } from "react";
import { CompetitionEvent } from "../types/event";
import { getEvents } from "../services/event-service";

type EventSelectionProps = {
  selectedEvent: CompetitionEvent | null;
  onSelect: (event: CompetitionEvent) => void;
};

export default function EventSelection({
  selectedEvent,
  onSelect,
}: EventSelectionProps) {
  const [events, setEvents] = useState<CompetitionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError(null);

        const data = await getEvents();

        setEvents(data);
      } catch (error) {
        console.error("Failed to load events:", error);
        setError("Unable to load events. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  if (loading) {
    return (
      <section>
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#A57653]">
            Stone Cafe
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-[#40332A] sm:text-4xl">
            Choose Your Event
          </h1>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-[390px] animate-pulse rounded-2xl border border-[#D9D9D8] bg-white"
            />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section>
        <div className="rounded-2xl border border-[#D9D9D8] bg-white p-10 text-center">
          <p className="text-sm text-[#40332A]/60">
            No events are currently available.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#A57653]">
          Stone Cafe
        </p>

        <h1 className="mt-3 text-3xl font-semibold text-[#40332A] sm:text-4xl">
          Choose Your Event
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#40332A]/60">
          Select the event you would like to participate in.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {events.map((event) => {
          const isSelected = selectedEvent?.id === event.id;

          return (
            <button
              key={event.id}
              type="button"
              onClick={() => onSelect(event)}
              className={`group overflow-hidden rounded-2xl border text-left transition ${
                isSelected
                  ? "border-[#A57653] bg-[#F3F3F3] ring-2 ring-[#A57653]/20"
                  : "border-[#D9D9D8] bg-white hover:border-[#A57653]/60"
              }`}
            >
              <div className="relative h-48 overflow-hidden">
                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#F3F3F3]">
                    <span className="text-sm font-medium text-[#40332A]/40">
                      {event.name}
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-[#40332A]/20" />

                <div className="absolute right-4 top-4">
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      Number(event.fee) === 0
                        ? "bg-white text-[#40332A]"
                        : "bg-[#A57653] text-white"
                    }`}
                  >
                    {Number(event.fee) === 0
                      ? "FREE"
                      : `${event.currency} ${Number(event.fee).toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h2 className="text-xl font-semibold text-[#40332A]">
                  {event.name}
                </h2>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#40332A]/60">
                  {event.description}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.12em] text-[#A57653]">
                    {event.date}
                  </span>

                  <span
                    className={`text-sm font-semibold ${
                      isSelected
                        ? "text-[#A57653]"
                        : "text-[#40332A]"
                    }`}
                  >
                    {isSelected ? "Selected ✓" : "Select Event →"}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}