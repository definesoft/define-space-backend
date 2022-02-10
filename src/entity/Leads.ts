import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Leads {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    leadName: string;

    @Column()
    desc: string;

    @Column()
    status: string;

    @Column()
    createdAt: Date;

}