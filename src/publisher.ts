import { CreateTemplate, CreateTemplateContent } from 'sparkpost';
import * as SparkPost from 'sparkpost';

export type TemplateContent = CreateTemplateContent | { email_rfc822: string };

export interface CreateOrUpdateTemplate extends CreateTemplate {
    id: string;
    content: TemplateContent;
}

export class SparkPostPublisher {

    private readonly sparkPost: SparkPost;

    constructor(apiKey: string) {
        this.sparkPost = new SparkPost(apiKey);
    }

    async createOrUpdate(template: CreateOrUpdateTemplate, publish = false) {
        try {
            await this.sparkPost.templates.get(template.id);
        } catch (e) {
            if (e.statusCode !== 404) {
                throw e;
            }

            await this.sparkPost.templates.create(template);
            return;
        }

        await this.sparkPost.templates.update(template.id, template, {
            update_published: publish,
        });
    }
}
