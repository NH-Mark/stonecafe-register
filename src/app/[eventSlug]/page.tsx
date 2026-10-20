import { notFound } from "next/navigation";
import Link from "next/link";

import { getEventBySlug } from "@/features/competition/services/event-service";
import { getImageUrl } from "@/utils/image";

type PageProps = {
  params: Promise<{
    eventSlug: string;
  }>;
};

export default async function EventDetailsPage({ params }: PageProps) {
  const { eventSlug } = await params;

  const event = await getEventBySlug(eventSlug);

  if (!event) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#40332A] px-3 py-6 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-4xl rounded-2xl bg-[#DDCFBE] p-6 shadow-2xl sm:p-10 lg:p-12">
        <div className="flex items-center justify-between">
          <div className="mb-2 w-8" aria-hidden="true" />

          <Link href="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="Stone Cafe"
              className="h-11 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-[#40332A] sm:text-3xl">
            {event.name}
          </h1>

          {event.description && (
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#40332A]/75 sm:text-base">
              {event.description}
            </p>
          )}
        </div>

        <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-md">
          <img
            src={getImageUrl(event.image)}
            alt={event.name}
            className="block h-auto w-full object-contain"
          />
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href={`/${event.slug}/register`}
            className="inline-flex h-11 min-w-56 items-center justify-center rounded-md bg-[#40332A] px-6 text-sm font-semibold text-white transition hover:bg-[#40332A]/90"
          >
            {event.registration_type === "omakase_booking"
              ? "Reserve Your Seat"
              : "Register"}
          </Link>
        </div>
      </div>
    </main>
  );
}
