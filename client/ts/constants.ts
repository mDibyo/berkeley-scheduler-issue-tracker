export const DEFAULT_TERM_ABBREV = 'sp17';

export interface Term {
  abbrev: string;
  name: string;
  lastDay: Date;
}

export const terms: {[termAbbrev: string]: Term} = {
  'fa16': {
    abbrev: 'fa16',
    name: 'Fall 2016',
    lastDay: new Date(2016, 11, 3)
  },
  'sp17': {
    abbrev: 'sp17',
    name: 'Spring 2017',
    lastDay: new Date(2017, 3, 28)
  }
};

export const TERM_ABBREV: string = DEFAULT_TERM_ABBREV;

export function termName(): string {
  return terms[TERM_ABBREV].name;
}

export function termLastDay(): Date {
  return terms[TERM_ABBREV].lastDay;
}
