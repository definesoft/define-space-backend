import { Entity, Column, PrimaryGeneratedColumn, RelationId, ManyToOne } from "typeorm";
import * as crypto from 'crypto';
import { User } from './User';

@Entity()
export class UserTaskAssignments {

    @PrimaryGeneratedColumn()
    assignmentId: number;

    @ManyToOne(type => User)
    userDetails: User;
    
    @RelationId((userAssignments: UserTaskAssignments) => userAssignments.userDetails)
    toUser: number;

    @Column()
    details: string;

    @Column()
    fileDetails: string;

    @Column()
    submissionStatus: string;

    @Column()
    submitedAt: Date;

    @Column()
    createdBy: number;

}