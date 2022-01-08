"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleWare = void 0;
var jwthelper_1 = require("../services/jwthelper");
var jwtHelper = new jwthelper_1.JwtHelper();
var AuthMiddleWare = function (req, response, next) {
    if (req.url === '/login') {
        next();
    }
    else {
        var authorization = req.headers.authorization;
        var token = authorization.split('Bearer ');
        if (token[1]) {
            var validateToken = jwtHelper.validateToken(token[1]);
            if (validateToken) {
                req['userDetails'] = validateToken;
                next();
            }
            else {
                response.status(401).json({
                    msg: "Expecting Login"
                });
            }
        }
        else {
            response.status(401).json({
                msg: "Expecting Login"
            });
        }
    }
};
exports.AuthMiddleWare = AuthMiddleWare;
