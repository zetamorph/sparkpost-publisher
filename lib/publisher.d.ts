import { CreateTemplate, CreateTemplateContent } from 'sparkpost';
import * as SparkPost from 'sparkpost';
export declare type TemplateContent = CreateTemplateContent | {
    email_rfc822: string;
};
export interface CreateOrUpdateTemplate extends CreateTemplate {
    id: string;
    content: TemplateContent;
}
export declare class SparkPostPublisher {
    private readonly sparkPost;
    constructor(apiKey: string, options?: SparkPost.ConstructorOptions);
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
    createOrUpdate(template: CreateOrUpdateTemplate, publish?: boolean): Promise<void>;
}
