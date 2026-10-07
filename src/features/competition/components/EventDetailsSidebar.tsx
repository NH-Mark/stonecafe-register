"use client";

import { CompetitionEvent } from "../types/event";

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

type EventRegistrationSidebarProps = {
    event: CompetitionEvent;

    selectedSlot?: EventTimeSlot | null;
    seatCount?: number;

    mode?: "booking" | "application";
};

function formatDate(date: string) {
    const value = new Date(`${date}T00:00:00`);

    return value.toLocaleDateString([], {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatTime(time: string) {
    const [hours, minutes] = time.split(":").map(Number);

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function EventRegistrationSidebar({
    event,
    selectedSlot,
    seatCount = 0,
    mode = "booking",
}: EventRegistrationSidebarProps) {
    const fee = Number(event.fee);
    const totalAmount = seatCount * fee;

    return (
        <aside className="h-fit overflow-hidden rounded-2xl bg-[#40332A] text-white shadow-sm lg:sticky lg:top-6">
            {/* Event Details */}
            <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#DDCFBE]/60">
                    Event Details
                </p>

                <h2 className="mt-3 text-xl font-semibold leading-7">
                    {event.name}
                </h2>

                {event.description && (
                    <p className="mt-3 text-sm leading-6 text-white/60">
                        {event.description}
                    </p>
                )}

                <div className="mt-6 space-y-5 border-t border-white/10 pt-5">
                    {/* Date */}
                    <div>
                        <p className="text-xs uppercase tracking-wider text-white/40">
                            Date
                        </p>

                        <p className="mt-1 text-sm font-medium">
                            {formatDate(event.date)}
                        </p>
                    </div>

                    {/* Time */}
                     {mode === "application" && (
                    <div>
                        <p className="text-xs uppercase tracking-wider text-white/40">
                            Time
                        </p>

                        <p className="mt-1 text-sm font-medium">
                            {event.start_time
                                ? formatTime(event.start_time)
                                : "Time TBA"}

                            {event.end_time && (
                                <>
                                    {" - "}
                                    {formatTime(event.end_time)}
                                </>
                            )}
                        </p>
                    </div>
                     )}

                    {/* Location */}
                    <div>
                        <p className="text-xs uppercase tracking-wider text-white/40">
                            Location
                        </p>

                        <p className="mt-1 text-sm font-medium">
                            {event.location || "Doha"}
                        </p>
                    </div>

                    {/* Price */}
                    <div>
                        <p className="text-xs uppercase tracking-wider text-white/40">
                            Price
                        </p>

                        <p className="mt-1 text-sm font-medium">
                            {fee > 0 ? (
                                <>
                                    {event.currency}{" "}
                                    {fee.toFixed(2)}

                                    {mode === "booking" && (
                                        <span className="ml-1 font-normal text-white/50">
                                            per seat
                                        </span>
                                    )}
                                </>
                            ) : (
                                "Free"
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Booking Summary */}
            {mode === "booking" && (
                <div className="border-t border-white/10 bg-black/10 p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#DDCFBE]/60">
                        Booking Summary
                    </p>

                    <div className="mt-5 space-y-4">
                        {/* Session */}
                        <div>
                            <p className="text-xs uppercase tracking-wider text-white/40">
                                Session
                            </p>

                            {selectedSlot ? (
                                <>
                                    <p className="mt-1 text-sm font-medium">
                                        {selectedSlot.name}
                                    </p>

                                    <p className="mt-1 text-sm text-white/50">
                                        {formatTime(
                                            selectedSlot.start_time
                                        )}{" "}
                                        -{" "}
                                        {formatTime(
                                            selectedSlot.end_time
                                        )}
                                    </p>
                                </>
                            ) : (
                                <p className="mt-1 text-sm text-white/40">
                                    Select a session
                                </p>
                            )}
                        </div>

                        {/* Available */}
                        {selectedSlot && (
                            <div className="flex items-center justify-between border-t border-white/10 pt-4">
                                <span className="text-sm text-white/60">
                                    Available
                                </span>

                                <span className="text-sm font-medium">
                                    {selectedSlot.available_seats}{" "}
                                    {selectedSlot.available_seats === 1
                                        ? "seat"
                                        : "seats"}
                                </span>
                            </div>
                        )}

                        {/* Selected seats */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-white/60">
                                Your seats
                            </span>

                            <span className="text-sm font-medium">
                                {seatCount}
                            </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-white/60">
                                Price per seat
                            </span>

                            <span className="text-sm font-medium">
                                {event.currency} {fee.toFixed(2)}
                            </span>
                        </div>

                        {/* Total */}
                        <div className="border-t border-white/10 pt-5">
                            <div className="flex items-end justify-between">
                                <span className="text-sm text-white/60">
                                    Total
                                </span>

                                <span className="text-2xl font-semibold">
                                    {event.currency}{" "}
                                    {totalAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className="mt-5 text-center text-xs leading-5 text-white/40">
                        {seatCount > 0
                            ? `${seatCount} ${
                                  seatCount === 1
                                      ? "seat"
                                      : "seats"
                              } selected.`
                            : "Select your session and seats to see your total."}
                    </p>
                </div>
            )}

            {/* Application Summary */}
            {mode === "application" && (
                <div className="border-t border-white/10 bg-black/10 p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#DDCFBE]/60">
                        Registration
                    </p>

                    <p className="mt-4 text-sm leading-6 text-white/60">
                        Submit your application for review. Selected
                        competitors will receive payment instructions
                        by email.
                    </p>
                </div>
            )}
        </aside>
    );
}