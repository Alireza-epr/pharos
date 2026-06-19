import { createContext } from 'react';

/**
 * Accessible name a SectionItem exposes to the form control(s) it wraps.
 *
 * The visible SectionItem title is rendered as a <span> (not a <label>), so
 * native inputs nested inside have no programmatic label. Form controls read
 * this value as a fallback `aria-label`, keeping them accessible without
 * threading a label prop through every call site.
 */
export const SectionLabelContext = createContext<string | undefined>(undefined);
