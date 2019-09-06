"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var commander = require("commander");
var index_1 = require("./index");
var draftAndPublish = [
    {
        name: 'api-key',
        type: 'string',
        describe: 'SparkPost API key',
    },
    {
        name: 'endpoint',
        type: 'string',
        describe: 'SparkPost API endpoint',
    },
    {
        name: 'suffix',
        type: 'string',
        describe: 'Specify a suffix for your template IDs',
    },
    {
        name: 'template',
        type: 'string',
        describe: 'Execute the operation on a single template',
    },
    {
        short: 'v',
        name: 'verbose',
        type: 'boolean',
        describe: 'More debug output',
    },
];
function optionUsageTag(_a) {
    var short = _a.short, name = _a.name;
    return short !== undefined ? "-" + short + ", --" + name : "--" + name;
}
function optionParam(option) {
    switch (option.type) {
        case 'string':
            return " <" + option.name + ">";
        case 'boolean':
            return '';
    }
}
function applyOptions(command, options) {
    options.forEach(function (o) { return command.option(optionUsageTag(o) + optionParam(o), o.describe); });
    return command;
}
function checkApiKey(req) {
    if (req.apiKey == null) {
        throw new Error('SparkPost API key not set.');
    }
}
function parsePublishOrDraft(req, publish) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var options;
        return tslib_1.__generator(this, function (_a) {
            checkApiKey(req);
            options = {
                endpoint: req.endpoint,
                apiKey: req.apiKey,
                publish: publish,
                suffix: req.suffix,
                verbose: req.verbose,
            };
            if (req.template) {
                options.template = req.template;
            }
            return [2 /*return*/, index_1.handlePublishOrDraft(options)];
        });
    });
}
function withErrors(fn) {
    var _this = this;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fn.apply(void 0, args)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        console.error(e_1);
                        process.exitCode = 1;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
}
applyOptions(commander.command('publish'), draftAndPublish)
    .action(withErrors(function (req) { return parsePublishOrDraft(req, true); }));
applyOptions(commander.command('draft'), draftAndPublish)
    .action(withErrors(function (req) { return parsePublishOrDraft(req, false); }));
commander.parse(process.argv);
