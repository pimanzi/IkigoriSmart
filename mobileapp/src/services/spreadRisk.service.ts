import { SpreadRiskRequest, SpreadRiskResponse } from '../types';

export class SpreadRiskError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SpreadRiskError';
  }
}

export async function predictSpreadRisk(
  request: SpreadRiskRequest
): Promise<SpreadRiskResponse> {
  const apiUrl = process.env.EXPO_PUBLIC_WEATHER_RISK_API_URL;

  const response = await fetch(`${apiUrl}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    if (response.status === 503) {
      throw new SpreadRiskError('scan.api.apiUnavailable');
    }
    throw new SpreadRiskError('scan.api.predictionFailed');
  }

  const data: SpreadRiskResponse = await response.json();
  return data;
}
