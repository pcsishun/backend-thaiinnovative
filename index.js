const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient; 
const bcrypt = require('bcrypt');

const app = express();
// port server แก้ตรงนี้ // 
const port = 3300;

// รอบการเข้ารหัสแก้ตรงนี้ // 
const enryptRound = 10;

// -- config backend -- //
app.use(cors()); 
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())

// url server //
// คตัวอย่าง set url //
// mongodb+srv://username:password@connection/admin?authSource=admin&replicaSet=db-mongodb-nyc1-13024&tls=true&tlsCAFile=<replace-with-path-to-CA-cert> //
// mongodb+srv://doadmin:1q59y38760NOzPVv@db-mongodb-nyc1-13024-bc11591e.mongo.ondigitalocean.com/admin?authSource=admin&replicaSet=db-mongodb-nyc1-13024&tls=true&tlsCAFile=<replace-with-path-to-CA-cert> //
const setUrl = 'mongodb://localhost:27017/';

// -- api user login -- //
app.post('/userprofile', async(req, res) => {

    //  ข้อมูลที่หน้าบ้านส่งเข้ามา  //
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
            
            // const rangeData = userLogin.length()
            if(arrayLogin[0] !== null){

                // ตรวจสอบว่า รหัสทัี่ส่งเข้ามาเหมือนกัน  //
                const resultLogin =  await bcrypt.compare(password, userLogin.password);

                if(resultLogin === true){
                    // ส่งข้อมูลกลับไปหลังจาก เช็ตว่ารหัสนั้นตรงกัน // 
                    const setSendingData = {
                        statusLogin: true,
                        statusDesc: "login success",
                        firstname: userLogin.firstname,
                        lastname: userLogin.lastname,
                        email: userLogin.email,
                        photo: userLogin.photo
                    }
                    res.send(setSendingData)
                }
                else{

                    // ส่งข้อมูลกลับหากตัวแปร resultLogin มีค่าเป็น false // 
                    const setSendingData = {
                        statusLogin: false,
                        statusDesc: "Invalid email or password",
                    } 
                    res.send(setSendingData)             
                }

            }else{
                // ส่งข้อมูลกลับหากตัวแปร arrayLogin ไม่พบ  email ที่รับมา // 
                const setSendingData = {
                    statusLogin: false,
                    statusDesc: "Invalid email or password",
                } 
                res.send(setSendingData)
            }
        }catch(err){
            // ส่งข้อมูลกลับหากเกิด error ขึ้น // 
            const setSendingData = {
                statusLogin:  false,
                statusDesc: "Invalid email or password",
            } 
            res.send(setSendingData)
        }

      });
      
    // res.sendStatus(200)
})

// -- api สำหรับ user สมัครเข้าใช้งาน -- //
app.post('/register',  async(req, res) => {
 
    //  ข้อมูลที่หน้าบ้านส่งเข้ามา  //
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const email = req.body.email
    const password = req.body.password
    const photo = req.body.photo
    const containerCode = req.body.containerCode
 
    const hashPassword = bcrypt.hashSync(password, enryptRound);

    MongoClient.connect(setUrl, async function(err, db){
        if(err) throw err;

        // เลือก database // 
        const dbo = db.db("thai_agro_innovative");

        const checkEmail = await dbo.collection("user_register").findOne({email: email});
        const arrayEmail = [checkEmail]

        if(arrayEmail[0] !== null){
            const setDuplicate = {
                registerStatus: false,
                text: "this email alreadly register."
            }
            res.send(setDuplicate)
        }else{

            // ตัวแปล ที่จะทำการเก็บข้อมูลบันทึกลงใน Mongodb // 
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

                const replyText = {
                    registerStatus: true,
                    text: "register sucess"
                }
                res.send(replyText);
            })
        }
    })
})

// -- api สำหรับ user จัดการหน้า profile ตัวเอง เช่นการ update -- //
app.put('/updateprofile', async(req, res) => {

     // ตัวแปล ที่รับมาจากหน้าบ้าน // 
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const email = req.body.email
    const password = req.body.password
    const photo = req.body.photo

    // เข้ารหัส password // 
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