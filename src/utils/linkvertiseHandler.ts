import { CHECKPOINT_LINKS } from './linkConfig';
import { saveVerification } from './checkpointVerification';

export const REDIRECT_PARAM = 'checkpoint';
export const TARGET_PARAM = 'target';
export const DYNAMIC_PARAM = 'dynamic';

export const createLinkvertiseUrl = (checkpointNumber: number): string => {
  const baseUrl = CHECKPOINT_LINKS[checkpointNumber as keyof typeof CHECKPOINT_LINKS];
  if (!baseUrl) return '';
  return baseUrl;
};

export const validateCheckpoint = (param: string | null): number | null => {
  if (!param) return null;

  const num = parseInt(param, 10);
  if (isNaN(num) || num < 1 || num > 3) return null;

  const params = new URLSearchParams(window.location.search);
  const dynamic = params.get(DYNAMIC_PARAM);
  const target = params.get(TARGET_PARAM);

  if (dynamic === 'true' && target === 'complete') {
    try {
      saveVerification(num);
      // Clean up URL without causing a refresh
      window.history.replaceState({}, '', window.location.pathname);
      return num;
    } catch (error) {
      console.error('Failed to validate checkpoint:', error);
      return null;
    }
  }

  return null;
};