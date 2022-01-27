const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient; 
const bcrypt = require('bcrypt');


const app = express();
// port server เเก้ตรงนี้ // 
const port = 3300;

// รอบการเข้ารหัสเเก้ตรงนี้ // 
const enryptRound = 10;


app.use(cors()); 
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())

// url server //
// คตัวอย่าง set url //
// mongodb+srv://username:password@connection/admin?authSource=admin&replicaSet=db-mongodb-nyc1-13024&tls=true&tlsCAFile=<replace-with-path-to-CA-cert> //
// mongodb+srv://doadmin:1q59y38760NOzPVv@db-mongodb-nyc1-13024-bc11591e.mongo.ondigitalocean.com/admin?authSource=admin&replicaSet=db-mongodb-nyc1-13024&tls=true&tlsCAFile=<replace-with-path-to-CA-cert> //
const setUrl = 'mongodb://localhost:27017/';

// ---- //

app.post('/userprofile', async(req, res) => {
    const userEmail = req.body.email; 
    const password = req.body.password;

    MongoClient.connect(setUrl, async function(err, db) {
        if (err) throw err;

        // เลือก database // 
        const dbo = db.db("thai_agro_innovative");

        try{
            // เรียกใช้ collection user_register // 
            const userLogin = await dbo.collection("user_register").findOne({email: userEmail});
            const resultLogin =  await bcrypt.compare(password, userLogin.password);
            // console.log(userLogin[0].length)
            // const rangeData = userLogin.length()
            if(resultLogin === true && userLogin !== undefined){
                console.log(userLogin)
                console.log('status login', resultLogin)
                res.send({data:userLogin, status: true})
            }else{
                res.send({status: false})
            }
        }catch(err){
            console.log(err)
            res.send({status: false})
        }

      });
})

app.post('/register',  async(req, res) => {

    const firstName = req.body.firstname
    const lastName = req.body.lastName
    const email = req.body.email
    const password = req.body.password
    const photo = req.body.photo
 

    const hashPassword = bcrypt.hashSync(password, enryptRound);

    // console.log(hashPassword)
    // console.log(firstName)
    // console.log(lastName)
    // console.log(email)
    // console.log(photo)

    MongoClient.connect(setUrl, function(err, db){
        if(err) throw err;

        // เลือก database // 
        const dbo = db.db("thai_agro_innovative");

        const dataObj = {
            firstname: firstName, 
            lastname: lastName,
            email: email,
            password: hashPassword,
            photo: photo
        };

        // เก็บไว้ใน collection user_register // 
        dbo.collection("user_register").insertOne(dataObj, function(err, result){
            if(err) throw err;
            db.close();
            // console.log(result);
            res.send("insert sucess!");
        })
    })
 

    
})


app.put('/updateprofile', async(req, res) => {

    const firstName = req.body.firstname
    const lastName = req.body.lastName
    const email = req.body.email
    const password = req.body.password
    const photo = req.body.photo

    const hashPassword = bcrypt.hashSync(password, enryptRound);

    MongoClient.connect(setUrl, function(err, db) {
        if (err) throw err;
        // เลือก database // 

        const dbo = db.db("thai_agro_innovative");
        // หา email // 
        const myquery = { email: email };
        // set ค่าที่จะ update กรณีัที่ไม่มีการเปลี่ยนรแปลง req.body จะส่งค่าเดิมกลับมา // 
        const newvalues = { $set: {firstname: firstName, lastname: lastName ,email: email, password: hashPassword, photo: photo} };

        // เก็บไว้ใน collection user_register // 
        dbo.collection("user_register").updateOne(myquery, newvalues, function(err, result) {
          if (err) throw err;
          console.log(result)
          db.close();
          res.send("update sucess");
        });
      });

    
})

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})