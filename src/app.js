const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const helmet = require('helmet');
const noCache = require('nocache')

const db = require('./database/db-connection');
const logger = require('./utils/logger');
const server = express();
const { PORT } = require('./config/config');

const authRoutes = require('./api/auth/router');
const datapointRoutes = require('./api/datapoint/router');
const organizationRoutes = require('./api/organization/router');

const swagger = require('./swagger/swagger.Router');

server.use(cookieParser());

// var allowedOrigins = ['http://localhost:8081',
//                       'http://yourapp.com'];
// server.use(cors({ origin: function(origin, callback){
//     // allow requests with no origin 
//     // (like mobile apps or curl requests)
//     if(!origin) return callback(null, true);
//     if(allowedOrigins.indexOf(origin) === -1){
//         var msg = 'The CORS policy for this site does not ' +
//                 'allow access from the specified Origin.';
//         return callback(new Error(msg), false);
//     }
//     return callback(null, true);
//   },
// credentials:true }));
server.use(cors({ origin:true, credentials: true }));
server.use(compression());
// server.use(helmet());
server.use(noCache());
server.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
server.use(bodyParser.json({limit: '50mb'}));
server.use(bodyParser.text({limit: '50mb'}));

server.use('/api-docs', swagger);
server.use('/api/auth', authRoutes);
server.use('/api/datapoint', datapointRoutes);
server.use('/api/organization', organizationRoutes);

db.init().then(() => {
    server.listen(PORT, async () => {
        logger.info(`${server.name} listening at ${PORT}`);
    });
}).catch((err) => {
    logger.error('DB is not available', err);
    process.exit(-1);
});

module.exports = server; 
