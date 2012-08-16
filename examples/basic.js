var connect = require('connect'),
    build = require('../'),
    app = connect();



app.use(connect['static']())