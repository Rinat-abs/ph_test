const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const config = require('./config');
const MySQLStore = require('connect-mysql')(session);
const options = {
    config,
    resave: false,
    cleanup: true,
    keepalive: true,
    table: 'sessions'
};

const varMiddleware = require('./middleware/variables');
const homeRoutes = require('./Routers/home');
const regRoutes = require('./Routers/reg');
const loginRoutes = require('./Routers/login');
const testRoutes = require('./Routers/test');
const adminRoutes = require('./Routers/admin');
const autoAddTestToDB = require('./Routers/testRouters/autoAddTestToDB');


let app = express();





app.use(session({
    secret: '124gdfhth!кереждрнге?353-6аолшу',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: false,
        secure: false,
        maxAge: 1000 * 60000,
        expires: 1000 * 60000 
      },
    store: new MySQLStore(options) 
}));

app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({extended: false}));



app.use(flash());

app.use(varMiddleware);




app.use('/', homeRoutes);
app.use('/reg', regRoutes);
app.use('/login', loginRoutes);
app.use('/test', testRoutes);
app.use('/admin', adminRoutes);
app.use('/auto-add-test-to-db', autoAddTestToDB);



app.get('/*', function(req, res){
    res.render('404', {
        title: 'Страница не найдена'
    });
}); 

function start()
{
    try
    {
        const PORT = process.env.PORT || 3333;
        app.listen(PORT, () => {
            console.log(`Server is running - ${PORT}`);
        });
    }
    catch(e)
    {
        console.log(e);
    }
}

start();