
"use client";

import Image from "next/image";
import { Controller, FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { CompetitionEvent } from "../types/event";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { EventRegistrationFormValues, eventRegistrationSchema } from "../schemas/registrationSchema";
import { createEventRegistration } from "../services/event-registration-service";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getImageUrl } from "@/utils/image";
import OmakaseRegistration from "./OmakaseRegistration";
import ThrowdownRegistration from "./ThrowdownRegistration";


type EventRegistrationProps = {
    event: CompetitionEvent;
    onBack: () => void;
};

export default function EventRegistration({
    event,
    onBack,
}: EventRegistrationProps) {
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

