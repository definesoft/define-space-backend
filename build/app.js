"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var typeorm_1 = require("typeorm");
var User_1 = require("./entity/User");
var UserTaskAssignments_1 = require("./entity/UserTaskAssignments");
var jwthelper_1 = require("./services/jwthelper");
var password_1 = require("./services/password");
var multer = require("multer");
var multerS3 = require("multer-s3");
var AWS = require("aws-sdk");
var UserSubmissions_1 = require("./entity/UserSubmissions");
var cors = require("cors");
var Projects_1 = require("./entity/Projects");
var auth_middleware_1 = require("./middleware/auth.middleware");
var Leads_1 = require("./entity/Leads");
var Remainder_1 = require("./entity/Remainder");
//~/.aws/credentials -> Creds in this path
var fileConfig = {
    Bucket: 'user-assignments-uploads',
    Key: 'user-assignments-'
};
var passwordHelper = new password_1.PasswordHelper();
var jwtHelper = new jwthelper_1.JwtHelper();
var s3 = new AWS.S3({
    signatureVersion: 'v4',
    region: 'ap-south-1'
});
var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: fileConfig.Bucket,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            var date = new Date();
            cb(null, fileConfig.Key + date.getTime());
        }
    })
});
// create typeorm connection
(0, typeorm_1.createConnection)().then(function (connection) {
    var userRepository = connection.getRepository(User_1.User);
    var userAssignmentsRepository = connection.getRepository(UserTaskAssignments_1.UserTaskAssignments);
    var userSubmissionsRepository = connection.getRepository(UserSubmissions_1.UserSubmissions);
    var projectsRepository = connection.getRepository(Projects_1.Projects);
    var leadsRepository = connection.getRepository(Leads_1.Leads);
    var remainderRepository = connection.getRepository(Remainder_1.Remainder);
    // create and setup express app
    var app = express();
    app.use(express.json());
    app.use(cors());
    app.use(function (req, res, next) { return (0, auth_middleware_1.AuthMiddleWare)(req, res, next); });
    // register routes
    app.post("/login", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, userName, password, userDetails, inputPassword, returnObject;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = req.body, userName = _a.userName, password = _a.password;
                        return [4 /*yield*/, userRepository.findOne({
                                userName: userName
                            })];
                    case 1:
                        userDetails = _b.sent();
                        if (userDetails) {
                            inputPassword = passwordHelper.generateHash(password);
                            console.log('inputPassword', userDetails, password);
                            if (inputPassword === userDetails.password) {
                                returnObject = {
                                    firstName: userDetails.firstName,
                                    lastName: userDetails.lastName,
                                    userId: userDetails.id,
                                    isAdmin: userDetails.isAdmin
                                };
                                return [2 /*return*/, res.send(__assign(__assign({}, returnObject), { token: jwtHelper.generateToken(returnObject) }))];
                            }
                            else {
                                return [2 /*return*/, res.status(401).json({
                                        status: 0,
                                        message: 'Invalid password'
                                    })];
                            }
                        }
                        else {
                            return [2 /*return*/, res.status(400).json({
                                    status: 0,
                                    message: 'User not found'
                                })];
                        }
                        return [2 /*return*/];
                }
            });
        });
    });
    app.get("/users/get-user-details/:id", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, userRepository.findOne(req.params.id)];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, res.send(results)];
                }
            });
        });
    });
    app.get("/users/created-by-me", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, userRepository.find({
                            select: ['id', 'firstName', 'lastName', 'info', 'userName', 'email'],
                            where: {
                                createdBy: +req.userDetails.userId
                            }
                        })];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, res.send(results)];
                }
            });
        });
    });
    app.post("/users", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var user, results, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        req.body.createdBy = +req.userDetails.userId;
                        req.body.password = process.env.INITIAL_PASSWORD;
                        return [4 /*yield*/, userRepository.create(req.body)];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, userRepository.save(user)];
                    case 2:
                        results = _a.sent();
                        return [2 /*return*/, res.send({
                                status: 1,
                                message: 'Saved Sucessfully!'
                            })];
                    case 3:
                        error_1 = _a.sent();
                        return [2 /*return*/, res.status(400).json({
                                status: 0,
                                message: "Can't create user"
                            })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    });
    app.delete("/users/delete-user/:id", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, userRepository.delete(req.params.id)];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, res.send(results)];
                }
            });
        });
    });
    app.post("/users/submit-assignment", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var user, results, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        req.body.submittedBy = +req.userDetails.userId;
                        return [4 /*yield*/, userSubmissionsRepository.create(req.body)];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, userSubmissionsRepository.save(user)];
                    case 2:
                        results = _a.sent();
                        return [2 /*return*/, res.send({
                                status: 1,
                                message: 'Saved Sucessfully!'
                            })];
                    case 3:
                        error_2 = _a.sent();
                        return [2 /*return*/, res.status(400).json({
                                status: 0,
                                message: "Can't create user"
                            })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    });
    app.get('/users/check-is-admin', function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var isAdmin;
            return __generator(this, function (_a) {
                isAdmin = req.userDetails.isAdmin;
                return [2 /*return*/, res.send({ isAdmin: isAdmin })];
            });
        });
    });
    app.get("/users/submissions", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userSubmissions, isAdmin, attachedUserDetails, error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        userSubmissions = [];
                        isAdmin = req.userDetails.isAdmin;
                        if (!isAdmin) return [3 /*break*/, 2];
                        return [4 /*yield*/, userSubmissionsRepository.find()];
                    case 1:
                        userSubmissions = _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, userSubmissionsRepository.find({
                            submittedBy: +req.userDetails.userId
                        })];
                    case 3:
                        userSubmissions = _a.sent();
                        _a.label = 4;
                    case 4: return [4 /*yield*/, Promise.all(userSubmissions.map(function (eachSubmission) { return __awaiter(_this, void 0, void 0, function () {
                            var userDetails, projectDetails;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, userRepository.findOne({
                                            id: eachSubmission.submittedBy
                                        })];
                                    case 1:
                                        userDetails = _a.sent();
                                        return [4 /*yield*/, projectsRepository.findOne({
                                                id: +eachSubmission.toProject
                                            })];
                                    case 2:
                                        projectDetails = _a.sent();
                                        return [2 /*return*/, __assign(__assign({}, eachSubmission), { name: userDetails ? "".concat(userDetails.firstName, " ").concat(userDetails.lastName) : null, projectName: projectDetails ? projectDetails.projectName : null })];
                                }
                            });
                        }); }))];
                    case 5:
                        attachedUserDetails = _a.sent();
                        return [2 /*return*/, res.send(attachedUserDetails)];
                    case 6:
                        error_3 = _a.sent();
                        console.log('error', error_3);
                        return [2 /*return*/, res.status(400).json({
                                status: 0,
                                message: "Can't create user"
                            })];
                    case 7: return [2 /*return*/];
                }
            });
        });
    });
    app.get("/users/submissions/:id", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userSubmissions, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, userSubmissionsRepository.find({
                                submittedBy: +req.params.id
                            })];
                    case 1:
                        userSubmissions = _a.sent();
                        return [2 /*return*/, res.send(userSubmissions)];
                    case 2:
                        error_4 = _a.sent();
                        return [2 /*return*/, res.status(400).json({
                                status: 0,
                                message: "Can't create user"
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    });
    app.get("/users/details", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userDetails, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, userRepository.findOne({
                                select: ['firstName', 'lastName', 'info', 'email', 'userName'],
                                where: {
                                    id: +req.userDetails.userId
                                }
                            })];
                    case 1:
                        userDetails = _a.sent();
                        return [2 /*return*/, res.send(userDetails)];
                    case 2:
                        error_5 = _a.sent();
                        return [2 /*return*/, res.status(400).json({
                                status: 0,
                                message: "Can't get details"
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    });
    app.put("/users/update-user", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userDetails, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, userRepository.findOne({
                                id: +req.userDetails.userId
                            })];
                    case 1:
                        userDetails = _a.sent();
                        userDetails.firstName = req.body.firstName;
                        userDetails.lastName = req.body.lastName;
                        userDetails.info = req.body.info;
                        return [4 /*yield*/, userRepository.save(userDetails)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, res.send({
                                message: 'Updated User'
                            })];
                    case 3:
                        error_6 = _a.sent();
                        return [2 /*return*/, res.status(400).json({
                                status: 0,
                                message: "Can't get details"
                            })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    });
    app.post("/users/generate-download-link", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var signedUrl;
            return __generator(this, function (_a) {
                try {
                    signedUrl = s3.getSignedUrl('getObject', __assign(__assign({}, fileConfig), { Key: req.body.key, Expires: 60 * 5 }));
                    return [2 /*return*/, res.send({
                            status: 1,
                            link: signedUrl
                        })];
                }
                catch (error) {
                    console.log('Error', error);
                    return [2 /*return*/, res.status(400).json({
                            status: 0,
                            message: "Can't create user"
                        })];
                }
                return [2 /*return*/];
            });
        });
    });
    app.get("/projects", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, projectsRepository.find()];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, res.send(results)];
                }
            });
        });
    });
    app.get("/dashboard-details", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, projectsRepository.find()];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, res.send({
                                totalProjects: results.length,
                                totalCompletedProjects: results.filter(function (e) { return e.projectStatus == 'Completed'; }).length,
                                totalInProgress: results.filter(function (e) { return e.projectStatus == 'In Progress'; }).length
                            })];
                }
            });
        });
    });
    app.delete("/delete-project/:id", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, projectsRepository.delete(req.params.id)];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, res.send(results)];
                }
            });
        });
    });
    app.put("/projects", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var project, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, projectsRepository.findOne({
                            id: +req.body.id
                        })];
                    case 1:
                        project = _a.sent();
                        project.projectStatus = req.body.projectStatus;
                        return [4 /*yield*/, projectsRepository.save(project)];
                    case 2:
                        results = _a.sent();
                        return [2 /*return*/, res.send(results)];
                }
            });
        });
    });
    app.post("/projects", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var project, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        req.body.createdAt = new Date();
                        return [4 /*yield*/, projectsRepository.create(req.body)];
                    case 1:
                        project = _a.sent();
                        return [4 /*yield*/, projectsRepository.save(project)];
                    case 2:
                        results = _a.sent();
                        return [2 /*return*/, res.send(results)];
                }
            });
        });
    });
    app.post("/add-lead", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var lead, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        req.body.createdAt = new Date();
                        req.body.userId = +req.userDetails.userId;
                        return [4 /*yield*/, leadsRepository.create(req.body)];
                    case 1:
                        lead = _a.sent();
                        return [4 /*yield*/, leadsRepository.save(lead)];
                    case 2:
                        results = _a.sent();
                        return [2 /*return*/, res.send(results)];
                }
            });
        });
    });
    app.post("/add-remainder", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var remainder, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        req.body.userId = +req.userDetails.userId;
                        return [4 /*yield*/, remainderRepository.create(req.body)];
                    case 1:
                        remainder = _a.sent();
                        return [4 /*yield*/, remainderRepository.save(remainder)];
                    case 2:
                        results = _a.sent();
                        return [2 /*return*/, res.send(results)];
                }
            });
        });
    });
    app.post("/day-leads", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var todayRemainders, remainderWIthLeads, _a, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, remainderRepository.find({
                            where: {
                                userId: +req.userDetails.userId,
                                day: req.body.day,
                                month: req.body.month,
                                year: req.body.year,
                            }
                        })];
                    case 1:
                        todayRemainders = _c.sent();
                        remainderWIthLeads = todayRemainders.map(function (eachRemainder) { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            var _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _a = [__assign({}, eachRemainder)];
                                        _b = {};
                                        return [4 /*yield*/, leadsRepository.findOne({
                                                id: eachRemainder.leadId
                                            })];
                                    case 1: return [2 /*return*/, __assign.apply(void 0, _a.concat([(_b.leadDetails = _c.sent(), _b)]))];
                                }
                            });
                        }); });
                        _b = (_a = res).send;
                        return [4 /*yield*/, Promise.all(remainderWIthLeads)];
                    case 2: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    });
    app.get("/leads/:leadId", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var leads, remainders;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, leadsRepository.findOne({
                            where: {
                                userId: +req.userDetails.userId,
                                id: +req.params.leadId
                            }
                        })];
                    case 1:
                        leads = _a.sent();
                        if (!leads) return [3 /*break*/, 3];
                        return [4 /*yield*/, remainderRepository.find({
                                where: {
                                    leadId: leads.id
                                }
                            })];
                    case 2:
                        remainders = _a.sent();
                        res.send({
                            leadDetails: leads,
                            remainders: remainders
                        });
                        return [3 /*break*/, 4];
                    case 3: return [2 /*return*/, res.status(400).json({
                            status: 0,
                            message: "Can't get details"
                        })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    });
    app.get("/leads", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var leads, leadsWithRemainders, _a, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, leadsRepository.find({
                            where: {
                                userId: +req.userDetails.userId
                            }
                        })];
                    case 1:
                        leads = _c.sent();
                        leadsWithRemainders = leads.map(function (eachLead) { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            var _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _a = [__assign({}, eachLead)];
                                        _b = {};
                                        return [4 /*yield*/, remainderRepository.find({
                                                where: {
                                                    leadId: eachLead.id
                                                }
                                            })];
                                    case 1: return [2 /*return*/, __assign.apply(void 0, _a.concat([(_b.remainders = _c.sent(), _b)]))];
                                }
                            });
                        }); });
                        _b = (_a = res).send;
                        return [4 /*yield*/, Promise.all(leadsWithRemainders)];
                    case 2:
                        _b.apply(_a, [_c.sent()]);
                        return [2 /*return*/];
                }
            });
        });
    });
    app.post("/uploadFile", upload.single('file'), function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    return [2 /*return*/, res.send({
                            status: 1,
                            key: req.file.key,
                            message: 'Saved Sucessfully!'
                        })];
                }
                catch (error) {
                    return [2 /*return*/, res.status(400).json({
                            status: 0,
                            message: "Can't create user"
                        })];
                }
                return [2 /*return*/];
            });
        });
    });
    // start express server
    app.listen(3000);
}).catch(function (e) {
    console.log('Error', e);
});
