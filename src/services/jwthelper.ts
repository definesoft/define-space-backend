import * as jwt from 'jsonwebtoken';


export class JwtHelper {

    generateToken(jsonObject: any) {
        const token = jwt.sign(jsonObject, process.env.JWT_KEY, { expiresIn: '1d' });
        return token;
    }

    validateToken(token: any) {
        try {            
            const validated = jwt.verify(token, process.env.JWT_KEY)
            return validated;
        } catch (error) {
            return false;
        }
    }

}