/** MPA id -> label lookup entry, as read from `data/context/MPA.json`. */
export interface IMPALookupEntry {
  id: string;
  label: string;
}

/** EEZ id -> label lookup entry, as read from `data/context/EEZ.json`. */
export interface IEEZLookupEntry {
  id: number;
  label: string;
}
