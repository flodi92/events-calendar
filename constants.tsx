
import React from 'react';
import { Organizer, OrganizerStyles } from './types.ts';

export const ORGANIZER_STYLES: Record<Organizer, OrganizerStyles> = {
  [Organizer.THEATER_EUMENIDEN]: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    accent: 'bg-purple-600'
  },
  [Organizer.GEWANDHAUS]: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    accent: 'bg-blue-600'
  },
  [Organizer.ANKER]: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    accent: 'bg-amber-600'
  }
};

