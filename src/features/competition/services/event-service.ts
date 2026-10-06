import { CompetitionEvent } from "../types/event";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type EventsResponse = {
  data: CompetitionEvent[];
};

export async function getEvents(): Promise<CompetitionEvent[]> {
  const response = await fetch(`${API_URL}/events`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }

  const result: EventsResponse = await response.json();

  return result.data;
}