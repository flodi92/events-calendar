export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO format YYYY-MM-DD
  time: string; // HH:mm format
  location: string;
  organizer: string;
  url?: string;
  description?: string;
}

export type ViewMode = 'year' | 'week';

export interface OrganizerStyles {
  bg: string;
  text: string;
  border: string;
  accent: string;
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface SourceConfig {
  id: string;
  url: string;
  active: boolean;
}

export interface FetchEventsResponse {
  events: CalendarEvent[];
  sources: GroundingSource[];
}
