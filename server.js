const express = require('express');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose')
const env = require('dotenv');
const path = require('path');

env.config()
const port = process.env.PORT || 3000
const app = express();

app.use(session({
  secret: 'your-secret-key',
  resave: true,
  saveUninitialized: true
}));

mongoose
.connect(process.env.MongoDB_URL)
.then(console.log("MongoDB Conneted.."));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'public')));

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

app.listen(port, () => {
  console.log(`Server Listen On ${port}`)
})