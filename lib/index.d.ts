import { CreateOrUpdateTemplate } from './publisher';
export interface SPFPublisherTypeConfig {
    file: string;
}
export interface SPFPublisherTemplateConfig {
    config: {
        [k: string]: SPFPublisherTypeConfig;
    };
    sparkpost: CreateOrUpdateTemplate;
}
export interface SPFPublisherConfig {
    [k: string]: SPFPublisherTemplateConfig | undefined;
}
export interface PublishOrDraftParams {
    apiKey: string;
    endpoint?: string;
    publish: boolean;
    suffix?: string;
    template?: string;
    verbose: boolean;
}
export declare function getTemplate(templateId: string): CreateOrUpdateTemplate;
export declare function handlePublishOrDraft(params: PublishOrDraftParams): Promise<void>;
