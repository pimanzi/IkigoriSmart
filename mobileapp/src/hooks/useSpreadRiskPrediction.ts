import { useMutation } from '@tanstack/react-query';
import { predictSpreadRisk, SpreadRiskError } from '../services/spreadRisk.service';
import { SpreadRiskRequest, SpreadRiskResponse } from '../types';

export const useSpreadRiskPrediction = () => {
  const mutation = useMutation<SpreadRiskResponse, SpreadRiskError, SpreadRiskRequest>({
    mutationFn: (request: SpreadRiskRequest) => predictSpreadRisk(request),
  });

  return {
    predict: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
  };
};
