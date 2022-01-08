"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTaskAssignments = void 0;
var typeorm_1 = require("typeorm");
var User_1 = require("./User");
var UserTaskAssignments = /** @class */ (function () {
    function UserTaskAssignments() {
    }
    __decorate([
        (0, typeorm_1.PrimaryGeneratedColumn)(),
        __metadata("design:type", Number)
    ], UserTaskAssignments.prototype, "assignmentId", void 0);
    __decorate([
        (0, typeorm_1.ManyToOne)(function (type) { return User_1.User; }),
        __metadata("design:type", User_1.User)
    ], UserTaskAssignments.prototype, "userDetails", void 0);
    __decorate([
        (0, typeorm_1.RelationId)(function (userAssignments) { return userAssignments.userDetails; }),
        __metadata("design:type", Number)
    ], UserTaskAssignments.prototype, "toUser", void 0);
    __decorate([
        (0, typeorm_1.Column)(),
        __metadata("design:type", String)
    ], UserTaskAssignments.prototype, "details", void 0);
    __decorate([
        (0, typeorm_1.Column)(),
        __metadata("design:type", String)
    ], UserTaskAssignments.prototype, "fileDetails", void 0);
    __decorate([
        (0, typeorm_1.Column)(),
        __metadata("design:type", String)
    ], UserTaskAssignments.prototype, "submissionStatus", void 0);
    __decorate([
        (0, typeorm_1.Column)(),
        __metadata("design:type", Date)
    ], UserTaskAssignments.prototype, "submitedAt", void 0);
    __decorate([
        (0, typeorm_1.Column)(),
        __metadata("design:type", Number)
    ], UserTaskAssignments.prototype, "createdBy", void 0);
    UserTaskAssignments = __decorate([
        (0, typeorm_1.Entity)()
    ], UserTaskAssignments);
    return UserTaskAssignments;
}());
exports.UserTaskAssignments = UserTaskAssignments;
