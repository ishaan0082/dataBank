//importing all the necessary modules
import express from "express"
import mongoose from "mongoose";
import bodyParser from "body-parser"
import { name } from "ejs";
import session from "express-session";
import dotenv from 'dotenv';


dotenv.config();


//defining all the constant
const port1 = 3000;
const app = express();
const userid = process.env.USERID;
const password = process.env.PASSWORD;

//connecting to the database "batch26DB"
// mongoose.connect("mongodb://127.0.0.1:27017/batch26DB", { useNewUrlParser: true });
mongoose.connect(`mongodb+srv://${process.env.DATABASEID}:${process.env.DATABASEPASSWORD}@cluster0.o0hdixo.mongodb.net/hehe`, { useNewUrlParser: true });

const studentschema = new mongoose.Schema({
    _id: Number,
    Status: String,
    Name: String,
    FatherName: String,
    Branch: String,
    FirstName: String,
    LastName: String
});
const student = mongoose.model("student", studentschema);

//middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
    session({
        secret: 'your_secret_key', // Change this to a strong, unique secret key
        resave: false,
        saveUninitialized: false,
        // You can customize the store option for different session storage backends.
        // Example for using the default memory store (not recommended for production):
        // store: new session.MemoryStore(),
    })
);


//handling get request
app.get("/", (req, res) => {
    if (req.session.isAuthorised) {
        res.redirect("/home");
    } else {

        res.render("login.ejs");
    }
});

//handling homepage requests, authentication of the admin and the unauthorized users
//var isAuthorised = false;
app.post("/admin", (req, res) => {
    console.log(req.body);
    if (req.body.userid == userid && req.body.password == password) {
        req.session.isAuthorised = true;
        res.redirect("/home");
    } else {
        res.render("login.ejs");
    }
});

//rendering homepage
app.get("/home", (req, res) => {
    if (req.session.isAuthorised) {
        res.render("homepage.ejs");
    } else {
        res.redirect("/");
    }
})

//handling find requests according to the entered rollno
app.post("/admin/find", (req, res) => {
    if (req.session.isAuthorised) {

        if (req.body.rollno == "") {
            res.redirect("/home");
        }
        console.log(req.body);
        var Roll = parseInt(req.body.rollno);
        console.log(Roll);
        student.find({ _id: Roll })
            .then(details => {
                if (details.length == 0) {
                    res.redirect("/home");
                }
                console.log(details);
                res.render("info.ejs", {
                    sdetails: details,
                    name: details[0].Name,
                })
            })
            .catch(err => {
                //console.log(err);
                res.render("homepage.ejs");
            })
    } else {
        res.redirect("/");
    }
});

//handling branch  page
app.get("/admin/findBranch", (req, res) => {
    if (req.session.isAuthorised) {
        res.render("branchpage.ejs");
    } else {
        res.redirect("/");
    }
});
//handling search by branch details
app.post("/admin/findBranch/branch", (req, res) => {
    if (req.session.isAuthorised) {

        if (req.body.branch == "") {
            res.render("branchpage.ejs")
        }
        console.log(req.body);
        var branch = (req.body.branch);
        console.log(branch);
        student.find({ Branch: branch })
            .then(details => {
                //console.log(details);
                res.render("branchinfo.ejs", {
                    sdetails: details,
                    name: details[0].Branch,
                })
            })
            .catch(err => {
                console.log(err);
                res.render("homepage.ejs");
            })
    } else {
        res.redirect("/");
    }

});


//handling namesearches pages
app.get("/admin/findName", (req, res) => {
    if (req.session.isAuthorised) {
        res.render("namepage.ejs");
    } else {
        res.redirect("/");
    }
});
//handling namesearch page data
app.post("/admin/findName/name", (req, res) => {
    if (req.session.isAuthorised) {
        if (req.body.name == "") {
            res.redirect("/admin/findName")
        }
        console.log(req.body);
        var name = (req.body.name).toUpperCase();
        console.log(name);
        student.find({ Name: name })
            .then(details => {
                //console.log(details);
                res.render("info.ejs", {
                    sdetails: details,
                    name: name,
                })
            })
            .catch(err => {
                console.log(err);
                res.redirect("/admin/findName");
            })

    } else {
        res.redirect("/");
    }
});
app.post("/admin/findName/fName", (req, res) => {
    if (req.session.isAuthorised) {

        if (req.body.name == "") {
            res.redirect("/admin/findName")
        }
        console.log(req.body);
        var name = (req.body.name).toUpperCase();
        console.log(name);
        student.find({ FirstName: name })
            .then(details => {
                //console.log(details);
                res.render("info.ejs", {
                    sdetails: details,
                    name: name,
                })
            })
            .catch(err => {
                console.log(err);
                res.redirect("/admin/findName");
            })
    } else {
        res.redirect("/");
    }
});

app.post("/next", (req, res) => {
    if (req.session.isAuthorised) {

        res.render("homepage.ejs");
    } else {
        res.redirect("/");
    }
});
//handling addnewuser get request
app.get("/addNewUser", (req, res) => {
    if (req.session.isAuthorised) {
        res.render("newuser.ejs");
    } else {
        res.redirect("/");
    }
});
//saving details of new user
app.post("/uploadInfo", (req, res) => {
    if (req.session.isAuthorised) {
        student.find({ _id: parseInt(req.body.rollNo) })
            .then(detail => {
                if (detail.length === 0) {
                    var newuser = new student({
                        _id: parseInt(req.body.rollNo),
                        Name: (req.body.fname + " " + req.body.lname).toUpperCase(),
                        Branch: req.body.branch,
                        FatherName: (req.body.fathername).toUpperCase(),
                        FirstName: (req.body.fname).toUpperCase(),
                        LastName: (req.body.lname).toUpperCase()
                    });
                    newuser.save();
                    console.log("New user Added");
                    res.redirect("/home");
                } else {
                    res.render("userexits.ejs");
                }
            })

    } else {
        res.redirect("/");
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Error destroying session:", err);
        } else {
            res.redirect("/"); // Redirect to the login page
        }
    });
});

app.listen(process.env.PORT || port1, () => {
    console.log(`Server started on port ${port1}`);
});

