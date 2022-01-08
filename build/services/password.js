"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordHelper = void 0;
var crypto = require("crypto");
var PasswordHelper = /** @class */ (function () {
    function PasswordHelper() {
    }
    PasswordHelper.prototype.generateHash = function (password) {
        var hash = crypto.createHmac('sha1', process.env.PASSWORD_HASH_KEY)
            .update(password).digest('hex');
        return hash;
    };
    return PasswordHelper;
}());
exports.PasswordHelper = PasswordHelper;
