"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

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
import { zodResolver } from "@hookform/resolvers/zod";

const throwdownSchema = z
    .object({
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

        instagram_handle: z
            .string()
            .trim()
            .max(100, "Instagram handle is too long"),

        competitor_category: z.enum(
            ["", "home_brewer", "barista"],
            {
                message: "Please select your category",
            }
        ),

        coffee_brand: z
            .string()
            .trim()
            .max(150, "Coffee brand is too long"),

        brewing_experience: z.enum(
            ["", "under_1", "1_3", "3_5", "5_plus"],
            {
                message: "Please select your brewing experience",
            }
        ),

        brewer: z
            .string()
            .trim()
            .min(2, "Please enter the brewer you plan to use")
            .max(150, "Brewer name is too long"),

        own_grinder: z.enum(["", "yes", "no"], {
            message: "Please select an option",
        }),

        why_compete: z
            .string()
            .trim()
            .max(1500, "Your answer is too long"),

        practice_coffee_pickup: z.boolean(),

        terms: z
            .boolean()
            .refine(
                (value) => value === true,
                "You must accept the terms, rules and photo consent"
            ),
    })
    .superRefine((data, ctx) => {
        if (!data.competitor_category) {
            ctx.addIssue({
                code: "custom",
                path: ["competitor_category"],
                message: "Please select your category",
            });
        }

        if (!data.brewing_experience) {
            ctx.addIssue({
                code: "custom",
                path: ["brewing_experience"],
                message: "Please select your brewing experience",
            });
        }

        if (!data.own_grinder) {
            ctx.addIssue({
                code: "custom",
                path: ["own_grinder"],
                message: "Please select an option",
            });
        }

        // Coffee brand is ALWAYS shown,
        // but only required for baristas.
        if (
            data.competitor_category === "barista" &&
            !data.coffee_brand.trim()
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["coffee_brand"],
                message: "Please enter your coffee brand or cafe.",
            });
        }
    });

type ThrowdownFormValues = z.infer<typeof throwdownSchema>;

type ThrowdownRegistrationProps = {
    event: CompetitionEvent;
    onBack: () => void;
};

export default function ThrowdownRegistration({
    event,
    onBack,
}: ThrowdownRegistrationProps) {
    const router = useRouter();

    const [submitError, setSubmitError] = useState<string | null>(
        null
    );

    const {
        register,
        control,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ThrowdownFormValues>({
        resolver: zodResolver(throwdownSchema),
        defaultValues: {
            full_name: "",
            phone: "",
            email: "",
            instagram_handle: "",
            competitor_category: "",
            coffee_brand: "",
            brewing_experience: "",
            brewer: "",
            own_grinder: "",
            why_compete: "",
            practice_coffee_pickup: false,
            terms: false,
        },
    });

    const category = watch("competitor_category");

    async function onSubmit(values: ThrowdownFormValues) {
        try {
            setSubmitError(null);

            const result = await createEventRegistration({
                event_id: event.id,

                full_name: values.full_name,
                email: values.email,
                phone: values.phone,

                metadata: {
                    instagram_handle:
                        values.instagram_handle?.trim() || null,

                    competitor_category:
                        values.competitor_category,

                    coffee_brand:
                        values.coffee_brand?.trim() || null,

                    brewing_experience:
                        values.brewing_experience,

                    brewer: values.brewer.trim(),

                    own_grinder:
                        values.own_grinder === "yes",

                    why_compete:
                        values.why_compete?.trim() || null,

                    practice_coffee_pickup:
                        values.practice_coffee_pickup,

                    photo_consent: true,
                },
            });

            console.log(
                "Throwdown application submitted:",
                result
            );

            router.push("/events/success");
        } catch (error) {
            console.error(
                "Throwdown registration error:",
                error
            );

            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "Unable to submit your application."
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

                    <div className="flex items-center">
                        <img
                            src="/logo.png"
                            alt="Stone Cafe"
                            className="h-14 w-auto object-contain"
                        />
                    </div>
                </div>

                {/* Title */}
                <div className="mb-8 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A57653]">
                        REGISTRATION
                    </p>

                    <h1 className="mt-2 text-2xl font-semibold text-[#40332A] sm:text-3xl">
                        {event.name}
                    </h1>

                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#40332A]/60">
                        Submit your application to compete.
                        Selected competitors will receive payment
                        instructions by email.
                    </p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* LEFT + RIGHT */}
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
                        {/* LEFT - APPLICATION FORM */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                            {/* Form Header */}
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-[#40332A]">
                                    Your Details
                                </h2>

                                <p className="mt-1 text-sm text-[#40332A]/50">
                                    Tell us a little about yourself
                                    and your brewing experience.
                                </p>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                {/* Full Name */}
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-[11px] font-semibold text-[#40332A]">
                                        Full name
                                    </label>


                                    <FormInput {...register("full_name")} placeholder="Enter your full name" error={errors.full_name?.message} />

                                    
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-semibold text-[#40332A]">
                                        Mobile number (WhatsApp)
                                    </label>

                                    <FormInput {...register("phone")} type="tel" placeholder="+974 XXXXXXXX" error={errors.phone?.message} />

                                    
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-semibold text-[#40332A]">
                                        Email address
                                    </label>

                                    <FormInput {...register("email")} type="email" placeholder="you@example.com" error={errors.email?.message} />
                                </div>

                                {/* Instagram */}
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-semibold text-[#40332A]">
                                        Instagram handle
                                        <span className="ml-1 font-normal text-[#40332A]/40">
                                            Optional
                                        </span>
                                    </label>

                                    <FormInput {...register("instagram_handle")} placeholder="@yourusername" />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-semibold text-[#40332A]">
                                        Competitor category
                                    </label>

                                    <Controller
                                        name="competitor_category"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger
                                                    className={`box-border h-10 w-full rounded-md border border-[#D6D6D6] bg-white px-3 text-xs font-normal text-[#40332A] hover:border-[#A57653] focus:border-[#A57653] ${errors.competitor_category
                                                            ? "border-red-400"
                                                            : ""
                                                        }`}
                                                >
                                                    <SelectValue
                                                        className="text-xs"
                                                        placeholder="Select category"
                                                    >
                                                        {field.value === "home_brewer"
                                                            ? "Home brewer"
                                                            : field.value === "barista"
                                                                ? "Barista from a coffee brand"
                                                                : undefined}
                                                    </SelectValue>
                                                </SelectTrigger>

                                                <SelectContent className="text-xs">
                                                    <SelectItem
                                                        value="home_brewer"
                                                        className="text-xs"
                                                    >
                                                        Home brewer
                                                    </SelectItem>

                                                    <SelectItem
                                                        value="barista"
                                                        className="text-xs"
                                                    >
                                                        Barista from a coffee brand
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.competitor_category && (
                                        <p className="mt-1 text-[11px] text-red-600">
                                            {
                                                errors
                                                    .competitor_category
                                                    .message
                                            }
                                        </p>
                                    )}
                                </div>

                                {/* Coffee Brand */}

                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-[11px] font-semibold text-[#40332A]">
                                        Coffee brand / cafe
                                    </label>

                                    <FormInput {...register("coffee_brand")} placeholder="Employer or coffee brand" error={errors.coffee_brand?.message} />
                                </div>


                                {/* Experience */}
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-semibold text-[#40332A]">
                                        Brewing experience
                                    </label>

                                    <Controller
                                        name="brewing_experience"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value ?? ""}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger
                                                    className={`h-10 w-full border-[#D6D6D6] bg-white px-3 text-xs font-medium hover:border-[#A57653] focus:border-[#A57653] ${errors.brewing_experience
                                                        ? "border-red-400"
                                                        : ""
                                                        }`}
                                                >
                                                    <SelectValue
                                                        className="text-xs"
                                                        placeholder="Select experience"
                                                    >
                                                        {field.value === "under_1"
                                                            ? "Under 1 year"
                                                            : field.value === "1_3"
                                                                ? "1–3 years"
                                                                : field.value === "3_5"
                                                                    ? "3–5 years"
                                                                    : field.value === "5_plus"
                                                                        ? "5+ years"
                                                                        : undefined}
                                                    </SelectValue>
                                                </SelectTrigger>

                                                <SelectContent>
                                                    <SelectItem value="under_1" className="text-xs">
                                                        Under 1 year
                                                    </SelectItem>

                                                    <SelectItem value="1_3" className="text-xs">
                                                        1–3 years
                                                    </SelectItem>

                                                    <SelectItem value="3_5" className="text-xs">
                                                        3–5 years
                                                    </SelectItem>

                                                    <SelectItem value="5_plus" className="text-xs">
                                                        5+ years
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />

                                    {errors.brewing_experience && (
                                        <p className="mt-1 text-[11px] text-red-600">
                                            {
                                                errors
                                                    .brewing_experience
                                                    .message
                                            }
                                        </p>
                                    )}
                                </div>

                                {/* Brewer */}
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-semibold text-[#40332A]">
                                        Brewer you plan to use
                                    </label>

                                    <FormInput {...register("brewer")} placeholder="e.g. Origami, V60, etc." error={errors.brewer?.message} />
                                </div>

                                {/* Grinder */}
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-[11px] font-semibold text-[#40332A]">
                                        Will you bring your own grinder?
                                    </label>

                                    <Controller
                                        name="own_grinder"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value ?? ""}
                                                onValueChange={
                                                    field.onChange
                                                }
                                            >
                                                <SelectTrigger
                                                    className={`h-10 w-full border-[#D6D6D6] bg-white px-3 text-xs font-medium hover:border-[#A57653] focus:border-[#A57653] ${errors.own_grinder
                                                        ? "border-red-400"
                                                        : ""
                                                        }`}
                                                >
                                                    <SelectValue
                                                        placeholder="Select an option"
                                                        className="text-xs"
                                                    />
                                                </SelectTrigger>

                                                <SelectContent className="text-xs">
                                                    <SelectItem
                                                        value="yes"
                                                        className="text-xs"
                                                    >
                                                        Yes
                                                    </SelectItem>

                                                    <SelectItem
                                                        value="no"
                                                        className="text-xs"
                                                    >
                                                        No — EK43 is available
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />

                                    {errors.own_grinder && (
                                        <p className="mt-1 text-[11px] text-red-600">
                                            {errors.own_grinder.message}
                                        </p>
                                    )}
                                </div>

                                {/* Why Compete */}
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-[11px] font-semibold text-[#40332A]">
                                        Why do you want to compete?
                                        <span className="ml-1 font-normal text-[#40332A]/40">
                                            Optional
                                        </span>
                                    </label>

                                    <textarea
                                        {...register("why_compete")}
                                        rows={4}
                                        placeholder="Tell us a little about why you want to compete."
                                        className="box-border w-full resize-none rounded-md border border-[#D6D6D6] bg-white px-3.5 py-3 !text-[12px] leading-5 text-[#40332A] outline-none transition-colors placeholder:!text-[12px] placeholder:text-[#999] hover:border-[#A57653] focus:border-[#A57653]"
                                    />
                                    {errors.why_compete && (
                                        <p className="mt-1 text-[11px] text-red-600">
                                            {
                                                errors.why_compete
                                                    .message
                                            }
                                        </p>
                                    )}
                                </div>

                                {/* Practice Coffee */}
                                <div className="sm:col-span-2">
                                    <label className="flex cursor-pointer items-start gap-3">
                                        <input
                                            type="checkbox"
                                            {...register(
                                                "practice_coffee_pickup"
                                            )}
                                            className="mt-0.5 h-4 w-4 accent-[#A57653]"
                                        />

                                        <span className="text-xs leading-5 text-[#40332A]/70">
                                            I can collect the practice
                                            coffee from Stone on
                                            Friday, 13 November.
                                        </span>
                                    </label>
                                </div>

                                {/* Terms */}
                                <div className="sm:col-span-2">
                                    <label className="flex cursor-pointer items-start gap-3">
                                        <input
                                            type="checkbox"
                                            {...register("terms")}
                                            className="mt-0.5 h-4 w-4 accent-[#A57653]"
                                        />

                                        <span className="text-xs leading-5 text-[#40332A]/70">
                                            I agree to the competition
                                            terms, rules and
                                            photo/video consent.
                                        </span>
                                    </label>

                                    {errors.terms && (
                                        <p className="mt-1 text-[11px] text-red-600">
                                            {errors.terms.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                             {/* Error */}
                                {submitError && (
                                    <div
                                        role="alert"
                                        className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
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
                                    disabled={isSubmitting}
                                    className="flex h-11 w-full items-center justify-center rounded-md bg-[#40332A] px-5 text-xs font-semibold text-white transition hover:bg-[#40332A]/90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting
                                        ? "Submitting..."
                                        : "Submit Application"}
                                </button>

                                <p className="mt-3 text-center text-[11px] leading-5 text-[#40332A]/40">
                                    Applications are reviewed by the
                                    Stone &amp; Fuel team. Selected
                                    competitors will receive payment
                                    instructions by email.
                                </p>
                            </div>
                        </div>

                        {/* RIGHT - EVENT SIDEBAR */}
                        <EventRegistrationSidebar
                            event={event}
                            selectedSlot={null}
                            seatCount={0}
                            mode="application"
                        />
                    </div>
                </form>
            </div>
        </section>
    );
}