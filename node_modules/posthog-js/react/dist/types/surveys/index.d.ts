import { RefCallback } from "react";
import { SurveyPosition } from "posthog-js";
//#region src/hooks/useThumbSurvey.d.ts
interface UseThumbSurveyOptions {
  surveyId: string;
  displayPosition?: SurveyPosition;
  properties?: Record<string, any>;
  onResponse?: (response: 'up' | 'down') => void;
  disableAutoShownTracking?: boolean;
}
interface UseThumbSurveyResult {
  respond: (value: 'up' | 'down') => void;
  response: 'up' | 'down' | null;
  triggerRef: RefCallback<HTMLElement>;
  trackShown?: () => void;
}
declare function useThumbSurvey({ surveyId, displayPosition, properties, onResponse, disableAutoShownTracking }: UseThumbSurveyOptions): UseThumbSurveyResult;
//#endregion
export { UseThumbSurveyOptions, UseThumbSurveyResult, useThumbSurvey };