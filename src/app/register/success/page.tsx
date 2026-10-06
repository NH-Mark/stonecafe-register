"use client";

import Link from "next/link";

export default function RegistrationSuccessPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#40332A] px-4 py-10">
            <div className="w-full max-w-lg rounded-2xl bg-[#DDCFBE] p-8 text-center shadow-2xl sm:p-12">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#A57653] text-2xl text-white">
                    ✓
                </div>

                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-[#A57653]">
                    Stone Cafe
                </p>

                <h1 className="mt-3 text-3xl font-semibold text-[#40332A]">
                    Registration Successful
                </h1>

                <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#40332A]/60">
                    Thank you for registering. Your registration has been
                    successfully received.
                </p>

                <div className="mx-auto mt-6 max-w-md rounded-xl bg-white/60 px-5 py-4">
                    <p className="text-sm leading-6 text-[#40332A]/70">
                        A confirmation email with your event details will be
                        sent to the email address you provided.
                    </p>
                </div>

                <Link
                    href="/register"
                    className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-[#40332A] px-6 text-sm font-semibold text-white transition hover:bg-[#40332A]/90"
                >
                    Register for Another Event
                </Link>
            </div>
        </main>
    );
}