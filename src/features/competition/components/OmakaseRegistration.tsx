"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { CompetitionEvent } from "../types/event";
import { createEventRegistration } from "../services/event-registration-service";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import EventRegistrationSidebar from "./EventDetailsSidebar";
import FormInput from "@/components/ui/form-input";
import Link from "next/link";
const omakaseSchema = z.object({
    full_name: z
        .string()
        .trim()
        .min(2, "Full name must be at least 2 characters")
        .max(100, "Full name is too long"),

    phone: z
        .string()
        .trim()
        .min(7, "Please enter a valid mobile number")
        .max(30, "Phone number is too long"),

    email: z
        .string()
        .trim()
        .email("Please enter a valid email address"),

    event_time_slot_id: z
        .string()
        .min(1, "Please select a session"),

    seat_count: z
        .string()
        .min(1, "Please select the number of seats"),

    dietary_needs: z
        .string()
        .trim()
        .max(1000, "Dietary information is too long")
        .optional()
        .or(z.literal("")),

    terms: z
        .boolean()
        .refine(
            (value) => value === true,
            "You must accept the terms and conditions"
        ),
});

type OmakaseFormValues = z.infer<typeof omakaseSchema>;

type EventTimeSlot = {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    capacity: number;
    reserved_seats: number;
    available_seats: number;
    is_full: boolean;
};

type OmakaseRegistrationProps = {
    event: CompetitionEvent;
    onBack: () => void;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function formatTime(time: string) {
    const [hours, minutes] = time.split(":").map(Number);

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function OmakaseRegistration({
    event,
    onBack,
}: OmakaseRegistrationProps) {
    const router = useRouter();

    const [slots, setSlots] = useState<EventTimeSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(true);
    const [slotsError, setSlotsError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<OmakaseFormValues>({
        resolver: zodResolver(omakaseSchema),
        defaultValues: {
            full_name: "",
            phone: "",
            email: "",
            event_time_slot_id: "",
            seat_count: "",
            dietary_needs: "",
            terms: false,
        },
    });

    const selectedSlotId = watch("event_time_slot_id");
    const seatCount = Number(watch("seat_count") || 0);

    const selectedSlot = useMemo(
        () =>
            slots.find(
                (slot) => String(slot.id) === selectedSlotId
            ) ?? null,
        [slots, selectedSlotId]
    );

    useEffect(() => {
        async function loadSlots() {
            try {
                setLoadingSlots(true);
                setSlotsError(null);

                const response = await fetch(
                    `${API_URL}/events/${event.id}/time-slots`,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                        },
                        cache: "no-store",
                    }
                );

                let result: {
                    message?: string;
                    data?: EventTimeSlot[];
                };

                try {
                    result = await response.json();
                } catch {
                    throw new Error(
                        "Unable to process the server response."
                    );
                }

                if (!response.ok) {
                    throw new Error(
                        result.message ||
                        "Unable to load sessions."
                    );
                }

                setSlots(result.data ?? []);
            } catch (error) {
                console.error(
                    "Failed to load time slots:",
                    error
                );

                setSlotsError(
                    error instanceof Error
                        ? error.message
                        : "Unable to load sessions."
                );
            } finally {
                setLoadingSlots(false);
            }
        }

        loadSlots();
    }, [event.id]);

    // Reset seat count when changing session if the
    // previously selected number is no longer available.
    useEffect(() => {
        if (!selectedSlot) {
            setValue("seat_count", "");
            return;
        }

        const currentSeatCount = Number(
            watch("seat_count") || 0
        );

        if (
            currentSeatCount > selectedSlot.available_seats ||
            currentSeatCount > 5
        ) {
            setValue("seat_count", "");
        }
    }, [selectedSlot, setValue, watch]);

    async function onSubmit(values: OmakaseFormValues) {
        try {
            setSubmitError(null);

            const currentSlot = slots.find(
                (slot) =>
                    String(slot.id) ===
                    values.event_time_slot_id
            );

            if (!currentSlot) {
                setSubmitError(
                    "Please select a valid session."
                );
                return;
            }

            if (
                currentSlot.is_full ||
                currentSlot.available_seats <= 0
            ) {
                setSubmitError(
                    "This session is no longer available. Please select another session."
                );
                return;
            }

            const requestedSeats = Number(values.seat_count);

            if (
                !Number.isInteger(requestedSeats) ||
                requestedSeats < 1 ||
                requestedSeats > 5
            ) {
                setSubmitError(
                    "Please select between 1 and 5 seats."
                );
                return;
            }

            if (
                requestedSeats >
                currentSlot.available_seats
            ) {
                setSubmitError(
                    `Only ${currentSlot.available_seats} seat${currentSlot.available_seats === 1
                        ? ""
                        : "s"
                    } remaining in this session.`
                );
                return;
            }

            const result = await createEventRegistration({
                event_id: event.id,
                event_time_slot_id: currentSlot.id,
                seat_count: requestedSeats,

                full_name: values.full_name,
                email: values.email,
                phone: values.phone,

                dietary_needs:
                    values.dietary_needs?.trim() || null,
            });

            if (result.data.payment_url) {
                window.location.href =
                    result.data.payment_url;
                return;
            }

            router.push("/events/success");
        } catch (error) {
            console.error(
                "Omakase registration error:",
                error
            );

            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "Unable to complete your registration."
            );
        }
    }

    return (
        <section>
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onBack}
                        className="text-sm font-medium text-[#40332A]/60 transition hover:text-[#40332A]"
                    >
                        ← Back
                    </button>

                    <Link href="/events" className="flex items-center">
                        <img
                            src="/logo.png"
                            alt="Stone Cafe"
                            className="h-14 w-auto object-contain"
                        />
                    </Link>
                </div>

                <div className="mb-8 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A57653]">
                        Registration
                    </p>

                    <h1 className="mt-2 text-2xl font-semibold text-[#40332A] sm:text-3xl">
                        {event.name}
                    </h1>

                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#40332A]/60">
                        Select your preferred session and
                        complete your registration.
                    </p>
                </div>

                

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
                        {/* LEFT - REGISTRATION FORM */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-[#40332A]">
                                    Your Details
                                </h2>

                                <p className="mt-1 text-sm text-[#40332A]/50">
                                    Please enter your details below to reserve your seats.
                                </p>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                {/* Full Name */}
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-[11px] font-semibold text-[#40332A]">
                                        Full name
                                    </label>

                                    <FormInput
                                        {...register("full_name")}
                                        placeholder="Enter your full name"
                                        error={errors.full_name?.message}
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-semibold text-[#40332A]">
                                        Mobile number (WhatsApp)
                                    </label>

                                    <FormInput
                                        {...register("phone")}
                                        type="tel"
                                        placeholder="+974 XXXXXXXX"
                                        error={errors.phone?.message}
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-semibold text-[#40332A]">
                                        Email address
                                    </label>

                                    <FormInput
                                        {...register("email")}
                                        type="email"
                                        placeholder="you@example.com"
                                        error={errors.email?.message}
                                    />
                                </div>

                                {/* Session */}
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-semibold text-[#40332A]">
                                        Session
                                    </label>

                                    <Controller
                                        name="event_time_slot_id"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    setValue("seat_count", "");
                                                }}
                                                disabled={loadingSlots}
                                            >
                                                <SelectTrigger
                                                    className={`box-border h-11 w-full rounded-md border border-[#D6D6D6] bg-white px-3.5 text-xs font-normal text-[#40332A] hover:border-[#A57653] focus:border-[#A57653] ${errors.event_time_slot_id
                                                            ? "border-red-400"
                                                            : ""
                                                        }`}
                                                >
                                                    <SelectValue
                                                        className="text-xs leading-none"
                                                        placeholder={
                                                            loadingSlots
                                                                ? "Loading sessions..."
                                                                : "Select session"
                                                        }
                                                    >
                                                        {selectedSlot
                                                            ? `${selectedSlot.name} — ${formatTime(
                                                                selectedSlot.start_time
                                                            )} - ${formatTime(
                                                                selectedSlot.end_time
                                                            )}`
                                                            : undefined}
                                                    </SelectValue>
                                                </SelectTrigger>

                                                <SelectContent className="text-xs">
                                                    {slots.map((slot) => (
                                                        <SelectItem
                                                            key={slot.id}
                                                            value={String(slot.id)}
                                                            disabled={
                                                                slot.is_full ||
                                                                slot.available_seats <= 0
                                                            }
                                                            className="text-xs"
                                                        >
                                                            {slot.name} —{" "}
                                                            {formatTime(slot.start_time)} -{" "}
                                                            {formatTime(slot.end_time)} (
                                                            {slot.is_full
                                                                ? "Full"
                                                                : `${slot.available_seats} seat${slot.available_seats === 1
                                                                    ? ""
                                                                    : "s"
                                                                } left`}
                                                            )
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />

                                    {slotsError && (
                                        <p className="mt-1.5 text-[11px] text-red-600">
                                            {slotsError}
                                        </p>
                                    )}

                                    {errors.event_time_slot_id && (
                                        <p className="mt-1.5 text-[11px] text-red-600">
                                            {errors.event_time_slot_id.message}
                                        </p>
                                    )}
                                </div>

                                {/* Number of Seats */}
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-semibold text-[#40332A]">
                                        Number of seats
                                    </label>

                                    <Controller
                                        name="seat_count"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                disabled={
                                                    !selectedSlot ||
                                                    selectedSlot.available_seats <= 0
                                                }
                                            >
                                                <SelectTrigger
                                                    className={`box-border h-11 w-full rounded-md border border-[#D6D6D6] bg-white px-3.5 text-xs font-normal text-[#40332A] hover:border-[#A57653] focus:border-[#A57653] ${errors.seat_count
                                                            ? "border-red-400"
                                                            : ""
                                                        }`}
                                                >
                                                    <SelectValue
                                                        className="text-xs leading-none"
                                                        placeholder="Select seats"
                                                    >
                                                        {field.value
                                                            ? `${field.value} ${Number(field.value) === 1
                                                                ? "seat"
                                                                : "seats"
                                                            }`
                                                            : undefined}
                                                    </SelectValue>
                                                </SelectTrigger>

                                                <SelectContent className="text-xs">
                                                    {Array.from(
                                                        {
                                                            length: Math.min(
                                                                5,
                                                                selectedSlot?.available_seats ?? 0
                                                            ),
                                                        },
                                                        (_, index) => {
                                                            const count = index + 1;

                                                            return (
                                                                <SelectItem
                                                                    key={count}
                                                                    value={String(count)}
                                                                    className="text-xs"
                                                                >
                                                                    {count}{" "}
                                                                    {count === 1
                                                                        ? "seat"
                                                                        : "seats"}
                                                                </SelectItem>
                                                            );
                                                        }
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />

                                    {errors.seat_count && (
                                        <p className="mt-1.5 text-[11px] text-red-600">
                                            {errors.seat_count.message}
                                        </p>
                                    )}
                                </div>

                                {/* Dietary Needs */}
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-[11px] font-semibold text-[#40332A]">
                                        Dietary needs / allergies
                                        <span className="ml-1 font-normal text-[#40332A]/40">
                                            Optional
                                        </span>
                                    </label>

                                    <textarea
                                        {...register("dietary_needs")}
                                        rows={4}
                                        placeholder="Please let us know about any dietary needs or allergies."
                                        className={`box-border w-full resize-none rounded-md border bg-white px-3.5 py-3 text-[12px] leading-5 text-[#40332A] outline-none transition-colors placeholder:text-[12px] placeholder:text-[#999] hover:border-[#A57653] focus:border-[#A57653] ${errors.dietary_needs
                                                ? "border-red-400"
                                                : "border-[#D6D6D6]"
                                            }`}
                                    />

                                    {errors.dietary_needs && (
                                        <p className="mt-1.5 text-[11px] text-red-600">
                                            {errors.dietary_needs.message}
                                        </p>
                                    )}
                                </div>

                                {/* Terms */}
                                <div className="sm:col-span-2">
                                    <label className="flex cursor-pointer items-start gap-3">
                                        <input
                                            type="checkbox"
                                            {...register("terms")}
                                            className="mt-1 h-4 w-4 accent-[#A57653]"
                                        />

                                        <span className="text-xs leading-5 text-[#40332A]/70">
                                            I agree to the terms and conditions,
                                            including the cancellation and refund policy.
                                        </span>
                                    </label>

                                    {errors.terms && (
                                        <p className="mt-1.5 text-[11px] text-red-600">
                                            {errors.terms.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {/* Submit Error */}
                                {submitError && (
                                    <div
                                        role="alert"
                                        className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
                                    >
                                        <p className="text-sm font-medium text-red-700">
                                            {submitError}
                                        </p>
                                    </div>
                                )}

                            {/* Submit */}
                            <div className="mt-8 border-t border-[#40332A]/10 pt-6">
                                <button
                                    type="submit"
                                    disabled={
                                        isSubmitting ||
                                        loadingSlots ||
                                        !selectedSlot
                                    }
                                    className="flex h-11 w-full items-center justify-center rounded-md bg-[#A57653] px-5 text-xs font-semibold text-white transition hover:bg-[#A57653]/90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting
                                        ? "Processing..."
                                        : "Continue to Payment"}
                                </button>

                                <p className="mt-3 text-center text-[11px] leading-5 text-[#40332A]/40">
                                    You will be redirected to secure payment after
                                    submitting your registration.
                                </p>
                            </div>
                        </div>

                        {/* RIGHT - COMMON SIDEBAR */}
                        <EventRegistrationSidebar
                            event={event}
                            selectedSlot={selectedSlot}
                            seatCount={seatCount}
                            mode="booking"
                        />
                    </div>
                </form>

            </div>
        </section>
    );
}