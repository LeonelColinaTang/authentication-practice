const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { environment } = require('./config');
const routes = require('./routes');

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








module.exports = app;