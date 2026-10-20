"use client";

import { useRouter } from "next/navigation";

import { CompetitionEvent } from "../types/event";
import OmakaseRegistration from "./OmakaseRegistration";
import ThrowdownRegistration from "./ThrowdownRegistration";

type EventRegistrationProps = {
  event: CompetitionEvent;
};

export default function EventRegistration({
  event,
}: EventRegistrationProps) {
  const router = useRouter();

  const onBack = () => {
    router.push(`/${event.slug}`);
  };

  switch (event.registration_type) {
    case "omakase_booking":
      return (
        <OmakaseRegistration
          event={event}
          onBack={onBack}
        />
      );

    case "throwdown_application":
      return (
        <ThrowdownRegistration
          event={event}
          onBack={onBack}
        />
      );

    default:
      return null;
  }
}