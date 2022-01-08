import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, Unique, ManyToOne, RelationId } from "typeorm";
import * as crypto from 'crypto';
import { PasswordHelper } from './../services/password';
const passwordHelper = new PasswordHelper();
@Entity()
@Unique(['email', 'userName'])
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    userName: string;

    @Column()
    info: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    createdBy: number;

    @Column()
    password: string;

    @Column()
    isAdmin: number;

    @BeforeInsert()
    encryptPassword() {
        this.password = passwordHelper.generateHash(this.password);
        this.isAdmin = 0;
    }

}