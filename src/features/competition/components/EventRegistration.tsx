
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


type EventRegistrationProps = {
    event: CompetitionEvent;
    onBack: () => void;
};

export default function EventRegistration({
    event,
    onBack,
}: EventRegistrationProps) {
    const router = useRouter();
    const isPaid = event.fee > 0;
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<EventRegistrationFormValues>({
        resolver: zodResolver(eventRegistrationSchema),
        defaultValues: {
            full_name: "",
            email: "",
            phone: "",
            gender: "male",
            company: ""
        },
    });

    const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
} = form;

function onInvalid(
    errors: FieldErrors<EventRegistrationFormValues>
) {
    console.error("Validation errors:", errors);

    Object.entries(errors).forEach(([field, error]) => {
        console.error(`${field}:`, error?.message);
    });
}

async function onSubmit(values: EventRegistrationFormValues) {
    try {
        const registrationData = {
            event_id: event.id,
            full_name: values.full_name,
            email: values.email,
            phone: values.phone,
            gender: values.gender,
            company: values.company?.trim() || null,
        };

        console.log("Registration payload:", registrationData);

        const result = await createEventRegistration(registrationData);

        console.log("Registration successful:", result);

        // Paid event
        if (event.fee > 0) {
            if (result.data.payment_url) {
                window.location.href = result.data.payment_url;
                return;
            }

            throw new Error("Payment URL was not returned.");
        }

        router.push(
            `/register/success?registration_id=${result.data.id}`);
        console.log("Free event registration confirmed.");
    } catch (error) {
        console.error("Registration error:", error);

        if (error instanceof Error) {
            setSubmitError(error.message);
        } else {
            setSubmitError(
                "Something went wrong. Please try again."
            );
        }
    }
}

    return (
        <div className="overflow-hidden rounded-3xl bg-[#F3F3F3] shadow-[0_20px_60px_rgba(64,51,42,0.15)]">
            <div className="grid lg:grid-cols-[1fr_0.82fr]">

                {/* =========================================================
            REGISTRATION FORM
        ========================================================= */}

                <section className="bg-[#DDCFBE] p-6 sm:p-8 lg:p-10 xl:p-12">

                    {/* Back */}
                    <button
                        type="button"
                        onClick={onBack}
                        className="group mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#A57653] transition hover:text-[#40332A]"
                    >
                        <span className="text-base transition-transform group-hover:-translate-x-1">
                            ←
                        </span>

                        Change Event
                    </button>

                    {/* Heading */}
                    <div className="mb-8">
                        <div className="mb-4 flex items-center gap-3">
                            <span className="h-px w-8 bg-[#A57653]" />

                            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#A57653]">
                                Registration
                            </p>
                        </div>

                        <h1 className="text-3xl font-semibold tracking-tight text-[#40332A] sm:text-4xl">
                            Register for the event
                        </h1>

                        <p className="mt-3 max-w-lg text-sm leading-6 text-[#40332A]/60">
                            Enter your details below to secure your place at
                            the selected Stone Cafe event.
                        </p>
                    </div>

                    {/* Selected Event */}
                    <div className="mb-7 flex items-center justify-between gap-4 rounded-2xl border border-[#A57653]/15 bg-[#F3F3F3]/60 p-4">
                        <div className="min-w-0">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#40332A]/45">
                                Selected Event
                            </p>

                            <p className="truncate text-sm font-semibold text-[#40332A]">
                                {event.name}
                            </p>
                        </div>

                        <div className="shrink-0">
                            <span
                                className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${isPaid
                                    ? "bg-[#A57653] text-white"
                                    : "bg-[#40332A] text-white"
                                    }`}
                            >
                                {isPaid
                                    ? `${event.currency} ${event.fee}`
                                    : "Free Entry"}
                            </span>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        noValidate
                        className="space-y-5"
                    >
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

                        <div className="w-full">
                            <label
                                htmlFor="full_name"
                                className="mb-2 block text-sm font-medium text-[#40332A]"
                            >
                                Full Name
                                <span className="ml-1 text-[#A57653]">*</span>
                            </label>

                            <Input
                                id="full_name"
                                type="text"
                                autoComplete="name"
                                placeholder="Enter your full name"
                                {...register("full_name")}
                                className={`box-border !h-11 w-full rounded-md border border-[#D6D6D6] bg-white px-3.5 text-sm text-[#40332A] shadow-none transition-colors
                                placeholder:text-[#999]
                                hover:border-[#A57653]
                                focus:border-[#A57653] focus:ring-0
                                ${errors.full_name
                                        ? "border-red-400 focus:border-red-400"
                                        : ""
                                    }`}
                            />

                            {errors.full_name && (
                                <p className="mt-1.5 text-xs text-red-600">
                                    {errors.full_name.message}
                                </p>
                            )}
                        </div>


                        <div className="grid gap-5 sm:grid-cols-2">
                            {/* Email */}
                            <div className="w-full">
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-[#40332A]"
                                >
                                    Email
                                    <span className="ml-1 text-[#A57653]">*</span>
                                </label>

                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    {...register("email")}
                                    className={`box-border !h-11 w-full rounded-md border border-[#D6D6D6] bg-white px-3.5 text-sm text-[#40332A] shadow-none transition-colors
                placeholder:text-[#999]
                hover:border-[#A57653]
                focus:border-[#A57653] focus:ring-0
                ${errors.email
                                            ? "border-red-400 focus:border-red-400"
                                            : ""
                                        }`}
                                />

                                {errors.email && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="w-full">
                                <label
                                    htmlFor="phone"
                                    className="mb-2 block text-sm font-medium text-[#40332A]"
                                >
                                    Phone
                                    <span className="ml-1 text-[#A57653]">*</span>
                                </label>

                                <Input
                                    id="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    placeholder="+974 XXXX XXXX"
                                    {...register("phone")}
                                    className={`box-border !h-11 w-full rounded-md border border-[#D6D6D6] bg-white px-3.5 text-sm text-[#40332A] shadow-none transition-colors
                placeholder:text-[#999]
                hover:border-[#A57653]
                focus:border-[#A57653] focus:ring-0
                ${errors.phone
                                            ? "border-red-400 focus:border-red-400"
                                            : ""
                                        }`}
                                />

                                {errors.phone && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* =====================================================
                                GENDER + COMPANY
                            ====================================================== */}

                        <div className="grid gap-5 sm:grid-cols-2">
                            {/* Gender */}
                            <div className="w-full">
                                <label
                                    htmlFor="gender"
                                    className="mb-2 block text-sm font-medium text-[#40332A]"
                                >
                                    Gender
                                    <span className="ml-1 text-[#A57653]">*</span>
                                </label>

                                <Controller
                                    name="gender"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger
                                                id="gender"
                                                className={`box-border !h-11 !min-h-11 w-full rounded-md border border-[#D6D6D6] bg-white px-3.5 text-sm text-[#40332A] shadow-none
                                                hover:border-[#A57653]
                                                focus:border-[#A57653] focus:ring-0
                                                ${errors.gender
                                                        ? "border-red-400 focus:border-red-400"
                                                        : ""
                                                    }`}
                                            >
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />

                                {errors.gender && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.gender.message}
                                    </p>
                                )}
                            </div>

                            {/* Company */}
                            <div className="w-full">
                                <label
                                    htmlFor="company"
                                    className="mb-2 block text-sm font-medium text-[#40332A]"
                                >
                                    Cafe / Company
                                </label>

                                <Input
                                    id="company"
                                    type="text"
                                    autoComplete="organization"
                                    placeholder="Cafe or company name"
                                    {...register("company")}
                                    className={`box-border !h-11 w-full rounded-md border border-[#D6D6D6] bg-white px-3.5 text-sm text-[#40332A] shadow-none
                                    placeholder:text-[#999]
                                    hover:border-[#A57653]
                                    focus:border-[#A57653] focus:ring-0
                                    ${errors.company
                                            ? "border-red-400 focus:border-red-400"
                                            : ""
                                        }`}
                                />

                                {errors.company && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.company.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* =====================================================
                SUBMIT
            ====================================================== */}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex h-13 w-full items-center justify-center rounded-full bg-[#A57653] px-6 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#40332A] focus:outline-none focus:ring-4 focus:ring-[#A57653]/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Processing...
                                </>
                            ) : isPaid ? (
                                `Continue to Payment · ${event.currency} ${event.fee}`
                            ) : (
                                "Register Now — Free"
                            )}
                        </button>

                        <p className="text-center text-[10px] leading-5 text-[#40332A]/40">
                            {isPaid
                                ? "You will be redirected to complete your payment after registration."
                                : "There is no registration fee for this event."}
                        </p>
                    </form>
                </section>

                {/* =========================================================
            EVENT DETAILS
        ========================================================= */}

                <aside className="bg-[#F3F3F3] p-6 sm:p-8 lg:p-10 xl:p-12">
                    {/* Event Image */}
                    <div className="relative mb-7 h-64 overflow-hidden rounded-2xl sm:h-72 lg:h-64 xl:h-72">
                        {event.image ? (
                            <Image
                                src={event.image}
                                alt={event.name}
                                fill
                                sizes="(max-width: 1024px) 100vw, 40vw"
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#DDCFBE]">
                                <span className="text-sm font-semibold text-[#40332A]/40">
                                    {event.name}
                                </span>
                            </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-[#40332A]/60 via-transparent to-transparent" />

                        {/* Fee badge */}
                        <div className="absolute left-4 top-4">
                            <span
                                className={`inline-flex rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] shadow-sm ${isPaid
                                    ? "bg-[#A57653] text-white"
                                    : "bg-white text-[#40332A]"
                                    }`}
                            >
                                {isPaid
                                    ? `${event.currency} ${Number(event.fee).toFixed(2)} Entry`
                                    : "Free Entry"}
                            </span>
                        </div>

                        {/* Image caption */}
                        <div className="absolute bottom-5 left-5 right-5">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#DDCFBE]">
                                Stone Cafe
                            </p>

                            <h2 className="mt-1 text-xl font-semibold text-white">
                                {event.name}
                            </h2>
                        </div>
                    </div>

                    {/* Event Heading */}
                    <div>
                        <div className="mb-4 flex items-center gap-3">
                            <span className="h-px w-7 bg-[#A57653]" />

                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#A57653]">
                                Event Details
                            </p>
                        </div>

                        <h2 className="text-2xl font-semibold tracking-tight text-[#40332A]">
                            {event.name}
                        </h2>

                        {event.description && (
                            <p className="mt-3 text-sm leading-6 text-[#40332A]/60">
                                {event.description}
                            </p>
                        )}
                    </div>

                    {/* Details */}
                    <div className="mt-7 border-t border-[#D9D9D8]">
                        <div className="grid grid-cols-2 gap-6 border-b border-[#D9D9D8] py-5">
                            {/* Date */}
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#40332A]/40">
                                    Date
                                </p>

                                <p className="mt-1.5 text-sm font-semibold text-[#40332A]">
                                    {new Date(`${event.date}T00:00:00`).toLocaleDateString(
                                        "en-US",
                                        {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        }
                                    )}
                                </p>
                            </div>

                            {/* Time */}
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#40332A]/40">
                                    Time
                                </p>

                                <p className="mt-1.5 text-sm font-semibold text-[#40332A]">
                                    {event.start_time
                                        ? new Date(
                                            `1970-01-01T${event.start_time}`
                                        ).toLocaleTimeString("en-US", {
                                            hour: "numeric",
                                            minute: "2-digit",
                                        })
                                        : "TBA"}

                                    {event.end_time && (
                                        <>
                                            {" – "}
                                            {new Date(
                                                `1970-01-01T${event.end_time}`
                                            ).toLocaleTimeString("en-US", {
                                                hour: "numeric",
                                                minute: "2-digit",
                                            })}
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="border-b border-[#D9D9D8] py-5">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#40332A]/40">
                                Location
                            </p>

                            <p className="mt-1.5 text-sm font-semibold text-[#40332A]">
                                {event.location || "Location TBA"}
                            </p>
                        </div>
                    </div>

                    {/* Entry Fee */}
                    <div className="mt-7 rounded-2xl bg-[#DDCFBE] p-5">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#40332A]/45">
                                    Entry Fee
                                </p>

                                <p className="mt-1 text-2xl font-semibold text-[#40332A]">
                                    {isPaid
                                        ? `${event.currency} ${Number(event.fee).toFixed(2)}`
                                        : "Free"}
                                </p>
                            </div>

                            <span className="text-2xl">
                                {isPaid ? "◈" : "✓"}
                            </span>
                        </div>

                        <p className="mt-3 text-xs leading-5 text-[#40332A]/55">
                            {isPaid
                                ? "Payment is required to confirm your registration."
                                : "No payment is required. Your registration is completely free."}
                        </p>
                    </div>

                    {/* Small Reassurance */}
                    <div className="mt-6 flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DDCFBE] text-xs text-[#A57653]">
                            ✓
                        </div>

                        <p className="text-[11px] leading-5 text-[#40332A]/50">
                            Your information is securely handled and used only for event
                            registration and communication.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}

