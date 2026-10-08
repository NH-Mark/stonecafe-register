"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CompetitionEvent } from "../types/event";
import { getEvents } from "../services/event-service";
import { getImageUrl } from "@/utils/image";

export default function EventSelection() {
  const router = useRouter();

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

  const handleRegister = (event: CompetitionEvent) => {
    router.push(`/events/${event.slug}`);
  };

  if (loading) {
    return (
      <section>
        <div className="mb-10 text-center">
          <div className="text-xl font-semibold tracking-[0.2em] text-[#40332A]">
            STONE CAFE
          </div>

          <h1 className="mt-6 text-2xl font-semibold text-[#40332A] sm:text-3xl">
            Choose Your Event
          </h1>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          {[1, 2].map((item) => (
            <div key={item} className="animate-pulse">
              <div className="aspect-[2/3] w-full rounded-xl bg-white/70" />
              <div className="mx-auto mt-4 h-11 w-full rounded-md bg-white/70" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section>
        <div className="rounded-xl border border-[#D9D9D8] bg-white p-10 text-center">
          <p className="text-sm text-[#40332A]/60">
            No events are currently available.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-10 text-center">
        <div className="flex justify-center">
          <img
            src="/logo.png"
            alt="Stone Cafe"
            className="h-auto w-32 object-contain sm:w-36"
          />
        </div>

        <h1 className="mt-7 text-2xl font-semibold text-[#40332A] sm:text-3xl">
          Upcoming Events
        </h1>
      </div>

      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
        {events.map((event) => (
          <div key={event.id} className="flex flex-col">
            <button
              type="button"
              onClick={() => handleRegister(event)}
              aria-label={`Register for ${event.name}`}
              className="group relative overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {event.image ? (
                <div className="relative w-full">
                  <img
                    src={getImageUrl(event.image) ?? ""}
                    alt={event.name}
                    className="block h-auto max-h-[700px] w-full object-contain"
                  />

                  <div className="absolute inset-0 bg-[#40332A]/0 transition-colors duration-300 group-hover:bg-[#40332A]/5" />
                </div>
              ) : (
                <div className="flex aspect-[2/3] w-full items-center justify-center bg-[#F3F3F3] px-6 text-center">
                  <div>
                    <p className="text-lg font-semibold text-[#40332A]">
                      {event.name}
                    </p>

                    <p className="mt-2 text-sm text-[#40332A]/50">
                      Event poster coming soon
                    </p>
                  </div>
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleRegister(event)}
              className="mt-4 flex h-11 w-full items-center justify-center rounded-md bg-[#40332A] px-6 text-sm font-semibold text-white transition hover:bg-[#40332A]/90"
            >
              {event.registration_type === "omakase_booking"
                ? "Reserve Your Seat"
                : "Register"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}