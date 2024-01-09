const express = require('express');
const session = require('express-session');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose')
const env = require('dotenv');
const path = require('path');

env.config()
const port = process.env.PORT || 3000
const app = express();

app.use(
  session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 500 * 60 * 60 * 1000, // expires after 500 hours in milliseconds
    },
  })
);

// Create a write stream for the log file
const fs = require('fs');
const logStream = fs.createWriteStream(path.join(__dirname, 'accessData.csv'), { flags: 'a' });
const csvFormat = ':date[iso],:remote-addr,:remote-user,:method,:url,:http-version,:status,:res[content-length],:referrer,:user-agent';
app.use(morgan(csvFormat, { stream: logStream }));

// using views dorectory to load views
app.set('views', path.join(__dirname, 'views'));
// using view engine
app.set('view engine', 'ejs');
// using assets folder
app.use('/assets', express.static(path.join(__dirname, 'assets')));
// using assets folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// using public folder to load static files
app.use(express.static(path.join(__dirname, 'public')));


// setting up cors and express sessions
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// page routes
const pages = require('./routes/page_routes')
app.use(pages)

const user = require('./routes/user_routes')
app.use(user)

const products = require('./routes/product_routes')
app.use(products)

const orders = require('./routes/order_routes')
app.use(orders)

const admin = require('./routes/admin_routes')
app.use(admin)

app.get('*', (req,res) => {
  res.render('Error404')
})

mongoose.connect( process.env.MongoDB_URL || "mongodb://127.0.0.1:27017/GYMER?retryWrites=true&w=majority")
.then(console.log(`MongoDB Conneted (${process.env.MongoDB_URL || "mongodb://127.0.0.1:27017/GYMER?retryWrites=true&w=majority"})`))
.then(app.listen(port,'127.0.0.1', () => { console.log(`Server Listen On ${port}`)}))
.catch(err => {console.log("An error occured at Mongo Connection\n" + err)})