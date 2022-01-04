import * as express from "express";
import {Request, Response} from "express";
import {createConnection} from "typeorm";
import {User} from "./entity/User";
import { UserTaskAssignments } from "./entity/UserTaskAssignments";
import { JwtHelper } from "./services/jwthelper";
import { PasswordHelper } from "./services/password";
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import * as AWS from 'aws-sdk';
import { UserSubmissions } from "./entity/UserSubmissions";
import * as cors from 'cors';
import { Projects } from "./entity/Projects";
//~/.aws/credentials -> Creds in this path
const fileConfig = {
    Bucket: 'user-assignments-uploads',
    Key: 'user-assignments-'
}
const passwordHelper = new PasswordHelper();
const jwtHelper = new JwtHelper();
const s3 = new AWS.S3();
const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: fileConfig.Bucket,
      metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {          
        const date = new Date();
        cb(null, fileConfig.Key + date.getTime());
      }
    })
})
// create typeorm connection
createConnection().then(connection => {
    const userRepository = connection.getRepository(User);
    const userAssignmentsRepository = connection.getRepository(UserTaskAssignments);
    const userSubmissionsRepository = connection.getRepository(UserSubmissions);
    const projectsRepository = connection.getRepository(Projects);

    // create and setup express app
    const app = express();
    app.use(express.json());
    app.use(cors())
    // register routes

    app.post("/login", async function(req: Request, res: Response) {
        const { userName, password } = req.body;
        const userDetails = await userRepository.findOne({
            userName
        });
        if (userDetails) {
            const inputPassword = passwordHelper.generateHash(password);
            if (inputPassword === userDetails.password) {
                const returnObject = {
                        firstName: userDetails.firstName,
                        lastName: userDetails.lastName,
                        userId: userDetails.id
                    };
                return res.send({
                    ...returnObject,
                    token: jwtHelper.generateToken(returnObject)
                })
            } else {
                return res.status(401).json({
                    status: 0,
                    message: 'Invalid password'
                })
            }
        } else {
            return res.status(400).json({
                status: 0,
                message: 'User not found'
            })
        }
    });

    app.get("/users/:id", async function(req: Request, res: Response) {
        const results = await userRepository.findOne(req.params.id);
        return res.send(results);
    });

    app.get("/users/created-by/:id", async function(req: Request, res: Response) {
        const results = await userRepository.find({
            select: ['id', 'firstName', 'lastName', 'info'],
            where: {
                createdBy: +req.params.id
            }
        });
        return res.send(results);
    });


    app.post("/users", async function(req: Request, res: Response) {   
        try {
            const user = await userRepository.create(req.body);
            const results = await userRepository.save(user);
            return res.send({
                status: 1,
                message: 'Saved Sucessfully!'
            });   
        } catch (error) {
            return res.status(400).json({
                status: 0,
                message: `Can't create user`
            })
        }
    });

    app.delete("/users/:id", async function(req: Request, res: Response) {
        const results = await userRepository.delete(req.params.id);
        return res.send(results);
    });

    app.post("/users/add-assignment", async function(req: Request, res: Response) {   
        try {
            const user = await userAssignmentsRepository.create(req.body);
            const results = await userAssignmentsRepository.save(user);
            return res.send({
                status: 1,
                message: 'Saved Sucessfully!'
            });   
        } catch (error) {
            return res.status(400).json({
                status: 0,
                message: `Can't create user`
            })
        }
    });

    app.post("/users/submit-assignment", async function(req: Request, res: Response) {   
        try {
            const user = await userSubmissionsRepository.create(req.body);
            const results = await userSubmissionsRepository.save(user);
            return res.send({
                status: 1,
                message: 'Saved Sucessfully!'
            });   
        } catch (error) {
            return res.status(400).json({
                status: 0,
                message: `Can't create user`
            })
        }
    });

    app.get("/users/submissions/:id", async function(req: Request, res: Response) {   
        try {
            const userSubmissions = await userSubmissionsRepository.find({
                toUser: +req.params.id
            });
            return res.send(userSubmissions);   
        } catch (error) {
            return res.status(400).json({
                status: 0,
                message: `Can't create user`
            })
        }
    });

    app.post("/users/generate-download-link", async function(req: Request, res: Response) {   
        try {
            const signedUrl = s3.getSignedUrl('getObject', {
                ...fileConfig,
                Key: req.body.key,
                Expires: 60 * 5
            });
            return res.send({
                status: 1,
                link: signedUrl
            });
        } catch (error) {
            return res.status(400).json({
                status: 0,
                message: `Can't create user`
            })
        }
    });

    app.get("/projects", async function(req: Request, res: Response) {
        const results = await projectsRepository.find();
        return res.send(results);
    });

    app.post("/uploadFile", upload.single('file') , async function(req: Request, res: Response) {   
        try {
            return res.send({
                status: 1,
                message: 'Saved Sucessfully!'
            });   
        } catch (error) {
            return res.status(400).json({
                status: 0,
                message: `Can't create user`
            })
        }
    });


    // start express server
    app.listen(3000);
}).catch(e => {
    console.log('Error', e);
});