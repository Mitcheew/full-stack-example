// require in dependencies
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const axios = require('axios');
const massive = require('massive')

// Initialize express app
const app = express();

// destructure from process.env
const {
    SERVER_PORT,
    REACT_APP_DOMAIN,
    REACT_APP_CLIENT_ID,
    CLIENT_SECRET,
    CONNECTION_STRING,
    SECRET
} = process.env;

// connect to DB
massive(CONNECTION_STRING).then(db => app.set('db', db))

// middleware
app.use(session({
    secret: SECRET,
    resave: false,
    saveUninitialized: false
}))

let authBypass = async (req, res, next) => {
    if(process.env.NODE_ENV) {
        const db = req.app.get('db');
        let user = await db.session_user();
        req.session.user = user[0];
        next();
    } else {
        next();
    }
}

// endpoints
app.get('/auth/callback', async (req, res) => {
      // get code from req.query.code
    let payload = {
        client_id: REACT_APP_CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: req.query.code,
        grant_type: 'authorization_code',
        redirect_uri: `http://${req.headers.host}/auth/callback`
    }
    // post request with code for token
    let tokenRes = await axios.post(`https://${REACT_APP_DOMAIN}/oauth/token`, payload);
    // use token to get user data
    let userRes = await axios.get(`https://${REACT_APP_DOMAIN}/userinfo?access_token=${tokenRes.data.access_token}`)

    let { name, sub, picture, email } = userRes.data
    // check if that user already exists in our db
    const db = app.get('db');
    let foundCustomer = await db.find_customer([sub])
    console.log('test')
    if(foundCustomer[0]) {
        // found user existing in the db, put returned user on session
        req.session.user = foundCustomer[0];
    } else {
        // no user was found in the db
        let createdCust = await db.create_customer([name, sub, picture, email])
        req.session.user = createdCust[0];
    }
    res.redirect('/#/private')
})

app.get('/api/user-data', authBypass, (req, res) => {
    if(req.session.user){
        res.status(200).send(req.session.user)
    } else {
        res.status(401).send(`schnope. Go log in`)
    }
})

app.get('/auth/logout', (req, res) => {
    req.session.destroy();
    res.redirect('http://localhost:3000/#/')
})


// listen
app.listen(SERVER_PORT, () => console.log(`Listening on port ${SERVER_PORT}`))
