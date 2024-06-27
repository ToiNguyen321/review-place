var express = require('express');
var bodyParser = require('body-parser');

var databaseConnect = require('./models/database');
var places = require('./routes/v1/places');
var users = require('./routes/v1/user');
require('dotenv').config();

databaseConnect()

var app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.set('view engine', 'ejs');
app.set('views', './views');

// Website routes
app.use('/api/v1/places', places);
app.use('/api/v1/users', users);
app.use('/files', express.static('uploads/files'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log(`Starting at port ${PORT}...`);
});