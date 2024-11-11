const { faker } = require('@faker-js/faker');
const mysql = require("mysql2");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const prompt = require("prompt-sync")({ sigint: true });
const { v4: uuidv4 } = require("uuid");

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "delta_app",
    password: "sbi@Arjun007"
});

let getRandomUser = () => {
    return  [ 
      faker.string.uuid(),
      faker.internet.username(),
      faker.internet.email(),
      faker.internet.password()
    ];
  }

  //                        we already added 100 users so no need for this code now

// let q = "INSERT INTO user (id, username, email, password) VALUES ?";
// let data = [];

// for (let i=0; i<100; i++){
//     data.push(getRandomUser());
// }



// connection.end();           // this is used to end the connection

// Home page
app.get("/",(req,res)=>{
    let q = `SELECT count(*) FROM user`;
        connection.query(q,(err,result) => {

        if (err) {
            console.log(err);
            return res.send("ERROR has been found in DB"); // Exit if there's an error
        }
            console.log("hello this is first port");
            let count =result[0]["count(*)"]; 
         // Check if result is valid before sending response
            res.render("home.ejs", {count});
        })  
    });

// Show users
app.get("/user",(req,res)=>{
    let q = `SELECT * FROM user`;
        connection.query(q,(err,users) => {

        if (err) {
            console.log(err);
            return res.send("ERROR has been found in DB");
        }
            res.render("show.ejs",{users});
        })  
    });

// Edit username

app.get("/user/:id/edit",(req,res)=>{
    let {id} = req.params;
    let q = `SELECT * FROM user WHERE id = '${id}'`;
    connection.query(q,(err,result) => {
        if (err) {
            console.log(err);
            return res.send("ERROR has been found in DB");
        }
            console.log(result);
            let user = result[0];
            res.render("edit.ejs",{user});
        })
})

// Update (DB) Route

app.patch("/user/:id",(req,res)=>{
    let {id} = req.params;
    let{password: newPassword, username: newUsername} = req.body;
    let q = `SELECT * FROM user WHERE id = '${id}'`;
    connection.query(q,(err,result)=>{
        let user = result[0];
        if(err){
            console.log(err);
            res.send("ERROR has been found in DB");
        }
        if(newPassword != user.password){
            res.send("You have entered the wrong password");
        }
        else{
            let q2 = `UPDATE user SET username='${newUsername}' WHERE id='${id}'`;
            connection.query(q2,(err,result)=>{
                if(err){
                    res.send("ERROR has been found in DB");
                }res.redirect("/user");
            })
        }
    })
})

// Delete route

app.delete("/user/:id",(req,res)=>{
    let {id} = req.params;
    let{password: newPass} = req.body;
    console.log(id);
    let q = `SELECT * FROM user WHERE id = '${id}'`;
    connection.query(q,(err,result)=>{
        let user = result[0];
        console.log(user);
        if(err){
            res.send("ERROR has been found in DB");
        }
        if(newPass != user.password ){
            res.send("You have entered the wrong password");
        }
        else{
            let q2 = `DELETE FROM user WHERE id = '${id}'`;
            connection.query(q2,(err,result)=>{
                if(err){
                    console.log(err);
                    res.send("ERROR has been found in DB");
                }res.redirect("/user");
            })
        }
    })
})

// New route

app.post("/user/new",(req,res)=>{
    res.render("new.ejs");
})

// for creating a new user

app.post("/user",(req,res)=>{
    let user = [];
    let {username,email,password} = req.body;
    let id = uuidv4();
    user.push(id,username,email,password);
    console.log(user);
    let q = `INSERT INTO user (id, username, email, password) VALUES ?`;
    connection.query(q,[[user]],(err,result)=>{
        if(err){
            console.log(err);
            res.send("ERROR has been found in DB");
        }
        res.redirect("/user");
    })
})

app.listen("8080",()=>{
    console.log("app is listening to 8080 ");
});
