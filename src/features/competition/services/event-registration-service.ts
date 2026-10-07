const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type CreateEventRegistrationPayload = {
    event_id: number;

    full_name: string;
    email: string;
    phone: string;

    // Omakase
    event_time_slot_id?: number;
    seat_count?: number;
    dietary_needs?: string | null;

    // Event-specific fields
    metadata?: Record<string, unknown>;
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

export type ApiValidationErrors = Record<
    string,
    string[]
>;

export class ApiError extends Error {
    errors?: ApiValidationErrors;

    constructor(
        message: string,
        errors?: ApiValidationErrors
    ) {
        super(message);

        this.name = "ApiError";
        this.errors = errors;
    }
}

export async function createEventRegistration(
    payload: CreateEventRegistrationPayload
): Promise<EventRegistrationResponse> {
    const response = await fetch(
        `${API_URL}/event-registrations`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    let result: {
        message?: string;
        errors?: ApiValidationErrors;
        data?: EventRegistrationResponse["data"];
    };

    try {
        result = await response.json();
    } catch {
        throw new ApiError(
            "Unable to process the server response."
        );
    }

    if (!response.ok) {
        throw new ApiError(
            result.message ||
                "Unable to complete registration.",
            result.errors
        );
    }

    return result as EventRegistrationResponse;
}