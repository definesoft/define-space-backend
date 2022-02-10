import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from "typeorm";

@Entity()
export class Remainder {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @PrimaryColumn()
    leadId: number;

    @Column()
    day: number;
    
    @Column()
    month: number;

    @Column()
    year: number;

    @Column()
    notes: string;

    @Column()
    status: string;

}