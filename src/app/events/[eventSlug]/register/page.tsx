import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{
    eventSlug: string;
  }>;
};

export default async function LegacyEventRegistrationPage({ params }: PageProps) {
  const { eventSlug } = await params;

  redirect(`/${eventSlug}/register`);
}
