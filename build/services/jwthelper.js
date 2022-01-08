"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtHelper = void 0;
var jwt = require("jsonwebtoken");
var JwtHelper = /** @class */ (function () {
    function JwtHelper() {
    }
    JwtHelper.prototype.generateToken = function (jsonObject) {
        var token = jwt.sign(jsonObject, process.env.JWT_KEY, { expiresIn: '1d' });
        return token;
    };
    JwtHelper.prototype.validateToken = function (token) {
        try {
            var validated = jwt.verify(token, process.env.JWT_KEY);
            return validated;
        }
        catch (error) {
            return false;
        }
    };
    return JwtHelper;
}());
exports.JwtHelper = JwtHelper;
