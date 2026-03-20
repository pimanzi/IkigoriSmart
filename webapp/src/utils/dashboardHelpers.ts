export interface RawPrediction {
  id: string;
  severity: string;
  risk_level: string;
  district: string;
  created_at: string;
}

export function computeSeverityBreakdown(
  predictions: RawPrediction[]
): { severity: string; count: number }[] {
  return ['Healthy', 'Early', 'Moderate', 'Severe'].map(severity => ({
    severity,
    count: predictions.filter(p => p.severity === severity).length,
  }));
}

export function computeRiskBreakdown(
  predictions: RawPrediction[]
): { risk_level: string; count: number }[] {
  return ['Low', 'Medium', 'High'].map(risk_level => ({
    risk_level,
    count: predictions.filter(p => p.risk_level === risk_level).length,
  }));
}

export function computePredictionsOverTime(
  predictions: RawPrediction[],
  cutoffDays = 30
): { date: string; musanze: number; nyabihu: number }[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - cutoffDays);

  const recent = predictions.filter(p => new Date(p.created_at) >= cutoff);

  const dateMap: Record<string, { musanze: number; nyabihu: number }> = {};
  recent.forEach(p => {
    const date = new Date(p.created_at).toISOString().split('T')[0];
    if (!dateMap[date]) dateMap[date] = { musanze: 0, nyabihu: 0 };
    if (p.district === 'Musanze') dateMap[date].musanze++;
    if (p.district === 'Nyabihu') dateMap[date].nyabihu++;
  });

  return Object.entries(dateMap)
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
