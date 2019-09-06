"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var chalk_1 = require("chalk");
var fs = require("fs");
var publisher_1 = require("./publisher");
var config;
function getConfig() {
    if (config === undefined) {
        config = JSON.parse(fs.readFileSync('sparkpost-map.json', 'utf8'));
    }
    return config;
}
function getEmailContent(filename) {
    return fs.readFileSync("dist/" + filename, 'utf8');
}
function setContent(content, templateConfig) {
    Object.keys(templateConfig.config)
        .forEach(function (k) { return content[k] = getEmailContent(templateConfig.config[k].file); });
    return content;
}
function getTemplate(templateId) {
    var templateConfig = getConfig()[templateId];
    if (templateConfig === undefined) {
        throw new Error("Could not find template with ID " + templateId);
    }
    if (templateConfig.config.text == null
        && templateConfig.config.html == null
        && templateConfig.config.email_rfc822 == null) {
        throw new Error("At least one required (html/text/email_rfc822) in the config of " + templateId);
    }
    var template = tslib_1.__assign({ content: {} }, templateConfig.sparkpost, { id: templateId });
    setContent(template.content, templateConfig);
    return template;
}
exports.getTemplate = getTemplate;
function handlePublishOrDraft(params) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var templates, publisher, _i, templates_1, t, id;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (params.template) {
                        templates = [getTemplate(params.template)];
                    }
                    else {
                        templates = Object.keys(getConfig()).map(getTemplate);
                    }
                    publisher = new publisher_1.SparkPostPublisher(params.apiKey, {
                        endpoint: params.endpoint,
                    });
                    _i = 0, templates_1 = templates;
                    _a.label = 1;
                case 1:
                    if (!(_i < templates_1.length)) return [3 /*break*/, 4];
                    t = templates_1[_i];
                    id = t.id;
                    if (params.suffix !== undefined) {
                        id += "-" + params.suffix;
                    }
                    if (params.verbose) {
                        console.log("Updating " + id);
                    }
                    return [4 /*yield*/, publisher.createOrUpdate(tslib_1.__assign({}, t, { id: id }), params.publish)];
                case 2:
                    _a.sent();
                    console.log(chalk_1.default.green("Updated " + id));
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.handlePublishOrDraft = handlePublishOrDraft;
