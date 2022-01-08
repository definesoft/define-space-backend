import * as crypto from 'crypto';


export class PasswordHelper {

    generateHash(password: string) {
        const hash = crypto.createHmac('sha1', process.env.PASSWORD_HASH_KEY)
                        .update(password).digest('hex');
        return hash;
    }

}