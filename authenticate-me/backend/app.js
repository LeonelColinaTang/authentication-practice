const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { environment } = require('./config');
const routes = require('./routes');
const { ValidationError } = require('sequelize');

const isProduction = environment === 'production';

//Here we initialize the express app
const app = express();

// this middleware logs information about 
// requests and responses
app.use(morgan('dev'));

// This parses cookies
app.use(cookieParser());

// This parses JSON bodies of requests with Content-Type
// of 'application/json'
app.use(express.json());


// SECURITY MIDDLEWARE
if(!isProduction){
    // We enable this only in development
    // because here the frontend come from 
    // different servers. In Production, we
    // don't need it because they both come from
    // the same server
    app.use(cors());
}

// helmet helps set a variety of headers to better
// secure your app
app.use(
    helmet.crossOriginResourcePolicy({
        policy: 'cross-origin'
    })
);

// Set the _csrf token and create req.csrfToken
app.use(
    csurf({
        cookie: {
            secure: isProduction,
            sameSite: isProduction && 'Lax',
            httpOnly: true
        }
    })

    // this adds a _csrf cookie to any server response
    // that's http only. It also adds the method
    // req.csrfToken that will be set to another
    // cookie: XSRF-TOKEN. These two cookies work
    // together to provide CSRF protection.
    // the XSRF-TOKEN needs to be sent in the header of
    // any request that's not GET. This header will
    // be used to validate the _csrf cookie to confirm
    // the request is not coming from an unauthorized
    // site
);





//ROUTES
app.use(routes);



// ERROR HANDLING
app.use((_req,_res, next) =>{
    const err = new Error('The requested resource couldn`t be found.')
    err.title = "Resource Not Found";
    err.errors = ["The requested resources couldn't be found."];
    err.status = 404;
    next(err);
})

// Process sequelize errors
app.use((err, _req, _res, next) =>{
    // check if error is a Sequelize error
    if(err instanceof ValidationError){
        err.errors = err.errors.map((e) => e.message);
        err.title = 'Validation error'
    }
    next(err)
});

//Errors formatter
app.use((err, _req, res, _next) =>{

    res.status(err.status || 500);
    console.error(err);
    res.json({
        title: err.title || 'Server Error',
        message: err.message,
        errors: err.errors,
        stack: isProduction ? null : err.stack
    });
});


module.exports = app;