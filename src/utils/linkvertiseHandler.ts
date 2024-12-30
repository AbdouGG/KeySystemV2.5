import { CHECKPOINT_LINKS, createReturnUrl } from './linkConfig';
import { saveVerification } from './checkpointVerification';

export const REDIRECT_PARAM = 'checkpoint';
export const DYNAMIC_PARAM = 'dynamic';
export const TARGET_PARAM = 'target';

let processingVerification = false;

export const createLinkvertiseUrl = (checkpointNumber: number): string => {
  const baseUrl = CHECKPOINT_LINKS[checkpointNumber as keyof typeof CHECKPOINT_LINKS];
  if (!baseUrl) return '';
  return baseUrl;
};

export const validateCheckpoint = (param: string | null): number | null => {
  // Prevent multiple simultaneous verifications
  if (processingVerification) return null;
  
  if (!param) return null;

  const num = parseInt(param, 10);
  if (isNaN(num) || num < 1 || num > 3) return null;

  const params = new URLSearchParams(window.location.search);
  const dynamic = params.get(DYNAMIC_PARAM);
  const target = params.get(TARGET_PARAM);

  if (dynamic === 'true' && target === 'complete') {
    processingVerification = true;
    try {
      saveVerification(num);
      // Clean URL without causing a page reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      return num;
    } finally {
      processingVerification = false;
    }
  }

  return null;
};