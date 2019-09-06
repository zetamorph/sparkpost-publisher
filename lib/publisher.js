"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var SparkPost = require("sparkpost");
var SparkPostPublisher = /** @class */ (function () {
    function SparkPostPublisher(apiKey, options) {
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
    SparkPostPublisher.prototype.createOrUpdate = function (template, publish) {
        if (publish === void 0) { publish = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var e_1, submitTemplate, e_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        return [4 /*yield*/, this.sparkPost.templates.get(template.id)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        e_1 = _a.sent();
                        if (e_1.statusCode !== 404) {
                            throw e_1;
                        }
                        // No draft version of this template ID exists, create it
                        return [4 /*yield*/, this.sparkPost.templates.create(template)];
                    case 3:
                        // No draft version of this template ID exists, create it
                        _a.sent();
                        if (!publish) {
                            return [2 /*return*/];
                        }
                        return [3 /*break*/, 4];
                    case 4:
                        submitTemplate = tslib_1.__assign({}, template, { published: publish });
                        delete submitTemplate.id; // ID is not allowed on update
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 9]);
                        // Update drafts when publish is false or update existing published templates
                        return [4 /*yield*/, this.sparkPost.templates.update(template.id, submitTemplate, {
                                update_published: publish,
                            })];
                    case 6:
                        // Update drafts when publish is false or update existing published templates
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 7:
                        e_2 = _a.sent();
                        if (e_2.statusCode !== 404) {
                            throw e_2;
                        }
                        // When only a draft version exists, update_published causes an error. Retry without
                        // update_published
                        return [4 /*yield*/, this.sparkPost.templates.update(template.id, submitTemplate)];
                    case 8:
                        // When only a draft version exists, update_published causes an error. Retry without
                        // update_published
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    return SparkPostPublisher;
}());
exports.SparkPostPublisher = SparkPostPublisher;
