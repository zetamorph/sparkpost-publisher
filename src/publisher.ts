import { CreateTemplate, CreateTemplateContent } from 'sparkpost';
import * as SparkPost from 'sparkpost';

export type TemplateContent = CreateTemplateContent | { email_rfc822: string };

export interface CreateOrUpdateTemplate extends CreateTemplate {
    id: string;
    content: TemplateContent;
}

export class SparkPostPublisher {

    private readonly sparkPost: SparkPost;

    constructor(apiKey: string, options?: SparkPost.ConstructorOptions) {
        this.sparkPost = new SparkPost(apiKey, options);
    }

    /**
     * Creates or updates a template.
     *
     * Due to some quirks on SparkPost's side we have to do some acrobatics in order to correctly
     * create or update a template since there are different states in which a template can find
     * itself in.
     *
     * States:
     * - Non existent
     * - Only draft exists
     * - Published version exists
     *
     * The most important gotcha is that there is no single way to publish a template which only has
     * a draft as well as update an existing published template. The following occurs:
     *
     * - adding _published: true_ does not update the existing published template
     * - adding _update_published: true_ errors if no published version exists
     *
     * Unfortunately we have to rely on expecting an error using _update_published_ and follow up
     * with the other approach.
     */
    async createOrUpdate(template: CreateOrUpdateTemplate, publish = false) {
        try {
            await this.sparkPost.templates.get(template.id);
        } catch (e) {
            if (e.statusCode !== 404) {
                throw e;
            }

            // No draft version of this template ID exists, create it
            await this.sparkPost.templates.create(template);

            if (!publish) {
                return;
            }
        }

        const submitTemplate = {
            ...template,
            published: publish,
        };
        delete submitTemplate.id; // ID is not allowed on update

        try {
            // Update drafts when publish is false or update existing published templates
            await this.sparkPost.templates.update(template.id, submitTemplate, {
                update_published: publish,
            });
        } catch (e) {
            if (e.statusCode !== 404) {
                throw e;
            }

            // When only a draft version exists, update_published causes an error. Retry without
            // update_published
            await this.sparkPost.templates.update(template.id, submitTemplate);
        }
    }
}
