import * as express from "express";
import { Request, Response } from "express";
import { Between, createConnection, MoreThan } from "typeorm";
import { User } from "./entity/User";
import { UserTaskAssignments } from "./entity/UserTaskAssignments";
import { JwtHelper } from "./services/jwthelper";
import { PasswordHelper } from "./services/password";
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import * as AWS from 'aws-sdk';
import { UserSubmissions } from "./entity/UserSubmissions";
import * as cors from 'cors';
import { Projects } from "./entity/Projects";
import { AuthMiddleWare } from "./middleware/auth.middleware";
import { Leads } from "./entity/Leads";
import { Remainder } from "./entity/Remainder";
//~/.aws/credentials -> Creds in this path
const fileConfig = {
    Bucket: 'user-assignments-uploads',
    Key: 'user-assignments-'
}
const passwordHelper = new PasswordHelper();
const jwtHelper = new JwtHelper();
const s3 = new AWS.S3({
    signatureVersion: 'v4',
    region: 'ap-south-1'
});
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: fileConfig.Bucket,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
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
    const leadsRepository = connection.getRepository(Leads);
    const remainderRepository = connection.getRepository(Remainder);

    // create and setup express app
    const app = express();
    app.use(express.json());
    app.use(cors())
    app.use((req, res, next) => AuthMiddleWare(req, res, next))
    // register routes

    app.post("/login", async function (req: Request, res: Response) {
        const { userName, password } = req.body;
        const userDetails = await userRepository.findOne({
            userName
        });
        if (userDetails) {

            const inputPassword = passwordHelper.generateHash(password);
            console.log('inputPassword', userDetails, password);
            if (inputPassword === userDetails.password) {
                const returnObject = {
                    firstName: userDetails.firstName,
                    lastName: userDetails.lastName,
                    userId: userDetails.id,
                    isAdmin: userDetails.isAdmin
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

    app.get("/users/get-user-details/:id", async function (req: Request, res: Response) {
        const results = await userRepository.findOne(req.params.id);
        return res.send(results);
    });

    app.get("/users/created-by-me", async function (req: Request | any, res: Response) {
        const results = await userRepository.find({
            select: ['id', 'firstName', 'lastName', 'info', 'userName', 'email'],
            where: {
                createdBy: +req.userDetails.userId
            }
        });
        return res.send(results);
    });


    app.post("/users", async function (req: Request | any, res: Response) {
        try {
            req.body.createdBy = +req.userDetails.userId;
            req.body.password = process.env.INITIAL_PASSWORD;
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

    app.delete("/users/delete-user/:id", async function (req: Request, res: Response) {
        const results = await userRepository.delete(req.params.id);
        return res.send(results);
    });

    app.post("/users/submit-assignment", async function (req: Request | any, res: Response) {
        try {
            req.body.submittedBy = +req.userDetails.userId;
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

    app.get('/users/check-is-admin', async function (req: Request | any, res: Response) {
        const { isAdmin } = req.userDetails;
        return res.send({ isAdmin });
    })

    app.get("/users/submissions", async function (req: Request | any, res: Response) {
        try {
            let userSubmissions = [];
            const { isAdmin } = req.userDetails;
            if (isAdmin) {
                userSubmissions = await userSubmissionsRepository.find()
            } else {
                userSubmissions = await userSubmissionsRepository.find({
                    submittedBy: +req.userDetails.userId
                })
            }
            const attachedUserDetails = await Promise.all(userSubmissions.map(async eachSubmission => {
                const userDetails = await userRepository.findOne({
                    id: eachSubmission.submittedBy
                })
                const projectDetails = await projectsRepository.findOne({
                    id: +eachSubmission.toProject
                })
                return {
                    ...eachSubmission,
                    name: userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : null,
                    projectName: projectDetails ? projectDetails.projectName : null
                }
            }))
            return res.send(attachedUserDetails);
        } catch (error) {
            console.log('error', error);

            return res.status(400).json({
                status: 0,
                message: `Can't create user`
            })
        }
    });

    app.get("/users/submissions/:id", async function (req: Request, res: Response) {
        try {
            const userSubmissions = await userSubmissionsRepository.find({
                submittedBy: +req.params.id
            });
            return res.send(userSubmissions);
        } catch (error) {
            return res.status(400).json({
                status: 0,
                message: `Can't create user`
            })
        }
    });

    app.get("/users/details", async function (req: Request | any, res: Response) {
        try {
            const userDetails = await userRepository.findOne({
                select: ['firstName', 'lastName', 'info', 'email', 'userName'],
                where: {
                    id: +req.userDetails.userId
                }
            })
            return res.send(userDetails);
        } catch (error) {
            return res.status(400).json({
                status: 0,
                message: `Can't get details`
            })
        }
    });

    app.put("/users/update-user", async function (req: Request | any, res: Response) {
        try {
            const userDetails = await userRepository.findOne({
                id: +req.userDetails.userId
            })
            userDetails.firstName = req.body.firstName;
            userDetails.lastName = req.body.lastName;
            userDetails.info = req.body.info;
            await userRepository.save(userDetails);
            return res.send({
                message: 'Updated User'
            });
        } catch (error) {
            return res.status(400).json({
                status: 0,
                message: `Can't get details`
            })
        }
    });

    app.post("/users/generate-download-link", async function (req: Request, res: Response) {
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
            console.log('Error', error);

            return res.status(400).json({
                status: 0,
                message: `Can't create user`
            })
        }
    });

    app.get("/projects", async function (req: Request, res: Response) {
        const results = await projectsRepository.find();
        return res.send(results);
    });

    app.get("/dashboard-details", async function (req: Request, res: Response) {
        const results = await projectsRepository.find();

        return res.send({
            totalProjects: results.length,
            totalCompletedProjects: results.filter(e => e.projectStatus == 'Completed').length,
            totalInProgress: results.filter(e => e.projectStatus == 'In Progress').length
        });
    });

    app.delete("/delete-project/:id", async function (req: Request, res: Response) {
        const results = await projectsRepository.delete(req.params.id);
        return res.send(results);
    });

    app.put("/projects", async function (req: Request, res: Response) {
        const project = await projectsRepository.findOne({
            id: +req.body.id
        });
        project.projectStatus = req.body.projectStatus;
        const results = await projectsRepository.save(project)
        return res.send(results);
    });

    app.post("/projects", async function (req: Request, res: Response) {
        req.body.createdAt = new Date();
        const project = await projectsRepository.create(req.body);
        const results = await projectsRepository.save(project)
        return res.send(results);
    });

    app.post("/add-lead", async function (req: Request | any, res: Response) {
        req.body.createdAt = new Date();
        req.body.userId = +req.userDetails.userId;
        const lead = await leadsRepository.create(req.body);
        const results = await leadsRepository.save(lead)
        return res.send(results);
    });

    app.post("/add-remainder", async function (req: Request | any, res: Response) {
        req.body.userId = +req.userDetails.userId;
        const remainder = await remainderRepository.create(req.body);
        const results = await remainderRepository.save(remainder);
        return res.send(results);
    });

    app.post("/day-leads", async function (req: Request | any, res: Response) {
        const todayRemainders = await remainderRepository.find({
            where: {
                userId: +req.userDetails.userId,
                day: req.body.day,
                month: req.body.month,
                year: req.body.year,
            }
        });
        const remainderWIthLeads = todayRemainders.map(async eachRemainder => {
            return {
                ...eachRemainder,
                leadDetails: await leadsRepository.findOne({
                    id: eachRemainder.leadId
                })
            }
        })
        return res.send(await Promise.all(remainderWIthLeads));
    });

    app.get("/leads/:leadId", async function (req: Request | any, res: Response) {
        const leads = await leadsRepository.findOne({
            where: {
                userId: +req.userDetails.userId,
                id: +req.params.leadId
            }
        });
        if (leads) {
            const remainders = await remainderRepository.find({
                where: {
                    leadId: leads.id
                }
            })
            res.send({
                leadDetails: leads,
                remainders
            });
        } else {
            return res.status(400).json({
                status: 0,
                message: `Can't get details`
            })
        }
    });

    app.get("/leads", async function (req: Request | any, res: Response) {
        const leads = await leadsRepository.find({
            where: {
                userId: +req.userDetails.userId
            }
        });
        const leadsWithRemainders = leads.map(async eachLead => {
            return {
                ...eachLead,
                remainders: await remainderRepository.find({
                    where: {
                        leadId: eachLead.id
                    }
                })
            }
        })
        res.send(await Promise.all(leadsWithRemainders));
    });

    app.post("/uploadFile", upload.single('file'), async function (req: Request | any, res: Response) {
        try {
            return res.send({
                status: 1,
                key: req.file.key,
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