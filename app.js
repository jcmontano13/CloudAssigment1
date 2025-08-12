// require path package built in to node.js no need to install. to recognize in all operating system
const path = require('path');

// require express package (import express package)
const express = require('express');

// require CSURF to protect from CSRF 
const csrf = require('csurf');

// require express-session for session handling
const expressSession = require('express-session');

// import session handler 
const createrSessionConfig = require('./config/session');
// require import database object 
const db = require('./data/database');

// import middlewares add csrftoken, error handler, check successful login, protect route for administration purpose, cart
const addCsrfTokenMiddleware = require('./middlewares/csrf-token');
const errorHandlerMiddleware = require('./middlewares/error-handler');
const checkAuthStatusMiddleware = require('./middlewares/check-auth');
const protectRoutesMiddleware = require('./middlewares/protect-routes');
const cartMiddleware = require('./middlewares/cart');
const updateCartPricesMiddleware = require('./middlewares/update-cart-prices');
const notFoundMiddleware = require('./middlewares/not-found');

// require import auth.routes / product.routes / base.routes(custom files) / cart routes / order routes
const authRoutes = require('./routes/auth.routes');
const productsRoutes = require('./routes/products.routes');
const baseRoutes = require('./routes/base.routes');
const adminRoutes = require('./routes/admin.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/orders.routes');

// derive app object as function
const app = express();

// option for express to set ejs to render views
app.set('view engine', 'ejs');

// define the path on view, using __dirname global variable is path to current project folder
app.set('views', path.join(__dirname, 'views'));

// define name of the static folder to be accessible to public
app.use(express.static('public'));
app.use('/products/assets', express.static('product-data')); // only req start with /products/assets will be handled

// handing data attached to request, handle data during form submission
app.use(express.urlencoded({ extended: false }));

// return the middleware function for json data
app.use(express.json());

// activate express
const sessionConfig = createrSessionConfig();

// initialize the session
app.use(expressSession(sessionConfig));

// activate csrf as middleware - should be before a request reach the route
app.use(csrf());

// activate cart middleware
app.use(cartMiddleware);

// activate update cart prices middleware
app.use(updateCartPricesMiddleware);

// activate csrf middileware
app.use(addCsrfTokenMiddleware);

// check auth status
app.use(checkAuthStatusMiddleware);

// use app.use to add middleware for every incoming request
app.use(baseRoutes);
app.use(authRoutes);
app.use(productsRoutes);
app.use('/cart', cartRoutes); // only prefix with cart will only be triggered
app.use('/orders', protectRoutesMiddleware, orderRoutes);  // only orders will be triggerd
app.use('/admin', protectRoutesMiddleware, adminRoutes); // only admin will only be triggered

app.use(notFoundMiddleware);

// add error handling middleware
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 3000; // Use port 3000 for local development if PORT not set
db.connectToDatabase()
    .then(function () {
        // listening to port
        app.listen(PORT);
    }).catch(function (error) {
        console.log('Failed to connect to the database!')
        console.log(error);
    }); // then if succeed, catch if error

