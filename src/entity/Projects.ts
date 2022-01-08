import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Projects {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    projectName: string;

    @Column()
    desc: string;

    @Column()
    projectStatus: string;

    @Column()
    projectType: string;

    @Column()
    createdAt: Date;

}