export type CompetitionEvent = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;

  date: string;
  start_time: string | null;
  end_time: string | null;

  location: string | null;

  fee: number;
  currency: string;

  capacity: number | null;
  is_active: boolean;
  registration_type:string;
};