import { Entity, Column, PrimaryGeneratedColumn, RelationId, ManyToOne } from "typeorm";
import { User } from './User';

@Entity()
export class UserSubmissions {

    @PrimaryGeneratedColumn()
    submissionId: number;
    
    @Column()
    submittedBy: number;

    @Column()
    toProject: string;

    @Column()
    submissionComments: string;

    @Column()
    fileDetails: string;

    @Column()
    submitedAt: Date;


}