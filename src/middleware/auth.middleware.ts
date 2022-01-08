import { Response, Request } from 'express';
import { JwtHelper } from '../services/jwthelper';
const jwtHelper = new JwtHelper();
export const AuthMiddleWare = (req: Request, response: Response, next) => {
    if (req.url === '/login') {
        next();
    } else {
        const { authorization } = req.headers;
        const token = authorization.split('Bearer ');
        if (token[1]) {
            const validateToken = jwtHelper.validateToken(token[1]);
            if (validateToken) {                
                req['userDetails'] = validateToken;
                next();
            } else {
                response.status(401).json({
                    msg: "Expecting Login"
                })
            }
            
        } else {
            response.status(401).json({
                msg: "Expecting Login"
            })
        }
    }
}