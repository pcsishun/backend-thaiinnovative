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

    // console.log(userEmail, password);

    MongoClient.connect(setUrl, async function(err, db) {
        if (err) throw err;

        // เลือก database // 
        const dbo = db.db("thai_agro_innovative");

        try{
            // เรียกใช้ collection user_register // 
            const userLogin = await dbo.collection("user_register").findOne({email: userEmail});
            const arrayLogin = [userLogin]
            
            // console.log(userLogin[0].length)
            // const rangeData = userLogin.length()
            if(arrayLogin[0] !== null){
                const resultLogin =  await bcrypt.compare(password, userLogin.password);

                if(resultLogin === true){
                    const setSendingData = {
                        statusLogin: true,
                        statusDesc: "login success",
                        firstname: userLogin.firstname,
                        lastname: userLogin.lastname,
                        email: userLogin.email,
                        photo: userLogin.photo
                    }
                    // // console.log(setSendingData)
                    // console.log('status login', setSendingData)
                    res.send(setSendingData)
                }
                else{
                    const setSendingData = {
                        statusLogin: false,
                        statusDesc: "Invalid email or password",
                    } 
                    res.send(setSendingData)             
                }

            }else{
                const setSendingData = {
                    statusLogin: false,
                    statusDesc: "Invalid email or password",
                } 
                res.send(setSendingData)
            }
        }catch(err){
            const setSendingData = {
                statusLogin:  false,
                statusDesc: "Invalid email or password",
            } 
            res.send(setSendingData)
        }

      });
      
    // res.sendStatus(200)
})

app.post('/register',  async(req, res) => {

    // console.log(req.body);

    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const email = req.body.email
    const password = req.body.password
    const photo = req.body.photo
    const containerCode = req.body.containerCode
 

    const hashPassword = bcrypt.hashSync(password, enryptRound);

    // console.log(hashPassword)
    // console.log(firstName)
    // console.log(lastName)
    // console.log(email)
    // console.log(photo)

    MongoClient.connect(setUrl, async function(err, db){
        if(err) throw err;

        // เลือก database // 
        const dbo = db.db("thai_agro_innovative");

        const checkEmail = await dbo.collection("user_register").findOne({email: email});
        const arrayEmail = [checkEmail]
        // console.log(arrayEmail);
        if(arrayEmail[0] !== null){
            const setDuplicate = {
                registerStatus: false,
                text: "this email alreadly register."
            }
            res.send(setDuplicate)
        }else{
            const dataObj = {
                firstname: firstName, 
                lastname: lastName,
                email: email,
                password: hashPassword,
                photo: photo,
                containerCode: containerCode 
            };
            // เก็บไว้ใน collection user_register // 
            dbo.collection("user_register").insertOne(dataObj, function(err, result){
                if(err) throw err;
                db.close();
                // console.log(result);

                const replyText = {
                    registerStatus: true,
                    text: "register sucess"
                }
                res.send(replyText);
            })
        }
    })
})


app.put('/updateprofile', async(req, res) => {
    console.log(req.body)
    const firstName = req.body.firstName
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