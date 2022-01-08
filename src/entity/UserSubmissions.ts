import { Entity, Column, PrimaryGeneratedColumn, RelationId, ManyToOne } from "typeorm";
import { User } from './User';

@Entity()
export class UserSubmissions {

    @PrimaryGeneratedColumn()
    submissionId: number;

    @ManyToOne(type => User)
    userDetails: User;
    
    @RelationId((userSubmissions: UserSubmissions) => userSubmissions.userDetails)
    toUser: number;

    @Column()
    submissionComments: string;

    @Column()
    fileDetails: string;

    @Column()
    submitedAt: Date;


}