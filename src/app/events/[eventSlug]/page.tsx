// app/register/[eventSlug]/page.tsx

import { notFound } from "next/navigation";

import { getEventBySlug } from "@/features/competition/services/event-service";
import EventRegistration from "@/features/competition/components/EventRegistration";

type PageProps = {
  params: Promise<{
    eventSlug: string;
  }>;
};

export default async function EventRegistrationPage({
  params,
}: PageProps) {
  const { eventSlug } = await params;

  const event = await getEventBySlug(eventSlug);

  if (!event) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#40332A] px-3 py-6 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-6xl rounded-2xl bg-[#DDCFBE] p-6 shadow-2xl sm:p-10 lg:p-12">
        <EventRegistration event={event} />
      </div>
    </main>
  );
}