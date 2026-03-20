export interface Theme {
  colors: {
    brandMain: string;
    brandHover: string;
    brandDark: string;
    secondaryMain: string;
    secondaryHover: string;
    surfaceMain: string;
    surfaceHover: string;
    textPrimary: string;
    textSecondary: string;
    successMain: string;
    successHover: string;
    errorMain: string;
    errorHover: string;
    infoMain: string;
    infoHover: string;
    iconsPrimary: string;
    iconsSecondary: string;
    iconsMuted: string;
    iconsActive: string;
    chart1: string;
    chart2: string;
    chart3: string;
    chart4: string;
    chart5: string;
  };
}

export const lightTheme: Theme = {
  colors: {
    brandMain: '#04966a',
    brandHover: '#e6f6f1',
    brandDark: '#037d59',
    secondaryMain: '#1e3a8a',
    secondaryHover: '#e8edff',
    surfaceMain: '#ffffff',
    surfaceHover: '#f3f4f6',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    successMain: '#16a34a',
    successHover: '#e7f9ef',
    errorMain: '#dc2626',
    errorHover: '#fde8e8',
    infoMain: '#2563eb',
    infoHover: '#e7f0ff',
    iconsPrimary: '#04966a',
    iconsSecondary: '#6b7280',
    iconsMuted: '#9ca3af',
    iconsActive: '#037d59',
    chart1: '#04966a',
    chart2: '#1e3a8a',
    chart3: '#16a34a',
    chart4: '#f59e0b',
    chart5: '#dc2626',
  },
};

export const darkTheme: Theme = {
  colors: {
    brandMain: '#16a34a',
    brandHover: '#1f2937',
    brandDark: '#15803d',
    secondaryMain: '#3b82f6',
    secondaryHover: '#1f2937',
    surfaceMain: '#111827',
    surfaceHover: '#1f2937',
    textPrimary: '#f9fafb',
    textSecondary: '#9ca3af',
    successMain: '#22c55e',
    successHover: '#1f2937',
    errorMain: '#ef4444',
    errorHover: '#1f2937',
    infoMain: '#3b82f6',
    infoHover: '#1f2937',
    iconsPrimary: '#16a34a',
    iconsSecondary: '#9ca3af',
    iconsMuted: '#6b7280',
    iconsActive: '#22c55e',
    chart1: '#16a34a',
    chart2: '#3b82f6',
    chart3: '#22c55e',
    chart4: '#fbbf24',
    chart5: '#ef4444',
  },
};
