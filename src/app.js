import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// importing and declaring routes
import userRouter from './routes/user.route.js';

// init
const app = express();

// server configs and middlewares
const corsOptions = {
    origin:process.env.CORS_ORIGIN,
    credentials: true
};

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'User API',
            version: '1.0.0',
            description: 'API documentation for user management system'
        },
        servers: [
            {
                url: process.env.SERVER_URL,
            },
        ],
    },
    apis: ['src/routes/*.js'], // files containing annotations as above
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/users', userRouter);

export default app;
