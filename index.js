const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient; 
const bcrypt = require('bcrypt');


const app = express();
const port = 3300;
app.use(cors()); 
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())


app.get('/userprofile', async(req, res) => {

    res.send("200");
})

app.post('/register',  async(req, res) => {

    const firstName = req.body.firstname
    const lastName = req.body.lastName
    const email = req.body.email
    const password = req.body.password
    const photo = req.body.photo
    // url server //
    // คตัวอย่าง set url //
    // mongodb+srv://username:password@connection/admin?authSource=admin&replicaSet=db-mongodb-nyc1-13024&tls=true&tlsCAFile=<replace-with-path-to-CA-cert> //
    // mongodb+srv://doadmin:1q59y38760NOzPVv@db-mongodb-nyc1-13024-bc11591e.mongo.ondigitalocean.com/admin?authSource=admin&replicaSet=db-mongodb-nyc1-13024&tls=true&tlsCAFile=<replace-with-path-to-CA-cert> //
    const setUrl = 'mongodb://localhost:27017/';

    const enryptRound = 10; 

    const hashPassword = bcrypt.hashSync(password, enryptRound);
    // console.log(hashPassword)
    // console.log(firstName)
    // console.log(lastName)
    // console.log(email)
    // console.log(photo)

    MongoClient.connect(setUrl, function(err, db){
        if(err) throw err;
        const dbo = db.db("thai_agro_innovative");
        const dataObj = [{
            firstname: firstName, 
            lastname: lastName,
            email: email,
            password: hashPassword,
            photo: photo
        }];
        dbo.collection("user_register").insertOne(dataObj, function(err, res){
            if(err) throw err;
            db.close();
        })
    })


    res.send("insert sucess!");
})


app.put('/updateprofile', async(req, res) => {
    app.send("update success!")
})

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})