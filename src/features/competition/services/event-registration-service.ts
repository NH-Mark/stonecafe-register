

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type CreateEventRegistrationPayload = {
    event_id: number;
    full_name: string;
    email: string;
    phone: string;
    gender: string;
    company?: string | null;
};

export type EventRegistrationResponse = {
    message: string;
    data: {
        id: number;
        event_id: number;
        status: string;
        payment_status: string;
        payment_amount: number | string | null;
        payment_currency: string | null;
        payment_url?: string | null;
    };
};

export async function createEventRegistration(
    payload: CreateEventRegistrationPayload
): Promise<EventRegistrationResponse> {
    const response = await fetch(`${API_URL}/event-registrations`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Unable to complete registration."
        );
    }

    return result;
}