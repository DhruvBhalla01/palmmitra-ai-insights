import { h } from 'preact';
import { SurveyAppearance, SurveyQuestionDescriptionContentType } from '../../../posthog-surveys-types';
export declare function IntroScreen({ header, description, contentType, forceDisableHtml, appearance, onStart, }: {
    header: string;
    description: string;
    forceDisableHtml: boolean;
    contentType?: SurveyQuestionDescriptionContentType;
    appearance: SurveyAppearance;
    onStart: () => void;
}): h.JSX.Element;
