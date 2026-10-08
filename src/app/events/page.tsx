"use client";

import { useState } from "react";

import EventSelection from "@/features/competition/components/EventSelection";
import EventRegistration from "@/features/competition/components/EventRegistration";
import { CompetitionEvent } from "@/features/competition/types/event";

export default function RegisterPage() {

    return (
        <main className="min-h-screen bg-[#40332A] px-3 py-6 sm:px-6 sm:py-10 lg:px-10">
            <div className="mx-auto max-w-6xl rounded-2xl bg-[#DDCFBE] p-6 shadow-2xl sm:p-10 lg:p-12">
             
                <EventSelection/>
                {/* ) : (
                    <EventRegistration
                        event={selectedEvent}
                        onBack={() => setSelectedEvent(null)}
                    />
                )} */}
            </div>
        </main>
    );
}