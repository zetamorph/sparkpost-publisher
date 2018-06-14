import * as fs from 'fs';
import { CreateTemplateContent } from 'sparkpost';
import { CreateOrUpdateTemplate, SparkPostPublisher } from './publisher';

export interface SPFPublisherTypeConfig {
    file: string;
}

export interface SPFPublisherTemplateConfig {
    config: {
        html: SPFPublisherTypeConfig;
        text: SPFPublisherTypeConfig;
    };
    sparkpost: CreateOrUpdateTemplate;
}

export interface SPFPublisherConfig {
    [k: string]: SPFPublisherTemplateConfig | undefined;
}

export interface PublishOrDraftParams {
    apiKey: string;
    publish: boolean;
    template?: string;
}

let config: SPFPublisherConfig;

function getConfig() {
    if (config === undefined) {
        config = JSON.parse(fs.readFileSync('sparkpost-map.json', 'utf8'));
    }

    return config;
}

function getEmailContent(filename: string) {
    return fs.readFileSync(`dist/${filename}`, 'utf8');
}

function setContent(content: CreateTemplateContent, templateConfig: SPFPublisherTemplateConfig) {
    Object.keys(templateConfig.config)
        .forEach(k => content[k] = getEmailContent(templateConfig.config[k].file));

    return content;
}

export function getTemplate(templateId: string, publish: boolean): CreateOrUpdateTemplate {
    const templateConfig: SPFPublisherTemplateConfig | undefined = getConfig()[templateId];

    if (templateConfig === undefined) {
        throw new Error(`Could not find template with ID ${templateId}`);
    }

    if (templateConfig.config.text == null && templateConfig.config.html == null) {
        throw new Error(`At least one required (html/text) in the config of ${templateId}`);
    }

    const template: CreateOrUpdateTemplate = {
        content: {}, // For when the config does not have the content map
        ...templateConfig.sparkpost,
        id: templateId,
        published: publish,
    };

    setContent(template.content, templateConfig);

    return template;
}

export async function handlePublishOrDraft(params: PublishOrDraftParams) {
    let templates;

    if (params.template) {
        templates = [getTemplate(params.template, params.publish)];
    } else {
        templates = Object.keys(getConfig()).map(k => getTemplate(k, params.publish));
    }

    const publisher = new SparkPostPublisher(params.apiKey);

    for (const t of templates) {
        console.log(`Updating ${t.id}`);
        await publisher.createOrUpdate(t);
        console.log(`Updated ${t.id}`);
    }
}
