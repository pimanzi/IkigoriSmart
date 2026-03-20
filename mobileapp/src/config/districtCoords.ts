// District GPS coordinates for Open-Meteo weather API
// Musanze and Nyabihu are the two target districts
// of the IkigoriSmart project in Northern Rwanda

export type District = 'Musanze' | 'Nyabihu';

export interface DistrictCoords {
  latitude: number;
  longitude: number;
  label: string;
}

export const DISTRICT_COORDS: Record<District, DistrictCoords> = {
  Musanze: {
    latitude: -1.5075,
    longitude: 29.6063,
    label: 'Musanze',
  },
  Nyabihu: {
    latitude: -1.63895,
    longitude: 29.43354,
    label: 'Nyabihu',
  },
};
