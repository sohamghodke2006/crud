const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const port = 3000;
const { v4: uuidv4 } = require("uuid");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended : true}));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "Node_SQL",
    password: "soham2006"
});

let getRandomUser = () => {
    return [
        faker.string.uuid(),
        faker.internet.username(),
        faker.internet.email(),
        faker.internet.password()
    ];
};

// Inserting random 100 users
// let q = "INSERT INTO user (id, username, email, password) VALUES ?";

// let data = [];
// for(let i = 1; i <= 100; i++) {
//     data.push(getRandomUser());
// }


// try {
//     connection.query(q, [data], (err, result) => {
//         if(err) throw err;
//         console.log(result);
//     });
// } catch(err) {
//     console.log(err);
// }
// connection.end();

// Home Route
app.get("/", (req, res) => {
    let q = "SELECT COUNT(*) FROM user";
    try {
      connection.query(q, (err, result) => {
        if(err) throw err;
        let count = result[0]["COUNT(*)"];
        res.render("home.ejs", { count });
      });
    } catch(err) {
        console.log(err);
        res.send("some error in db");
    }
});


// Show Route
app.get("/user", (req, res) => {
    let q = "SELECT *FROM user";
    try {
      connection.query(q, (err, users) => {
        if(err) throw err;

        res.render("showusers.ejs", { users });
      });
    } catch(err) {
        console.log(err);
        res.send("some error in db");
    }
});

// Create user
app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/user/new", (req, res) => {
  let { username, email, password } = req.body;
  let id = uuidv4();
  let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}','${username}','${email}','${password}') `;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log("added new user");
      res.redirect("/user");
    });
  } catch (err) {
    res.send("some error occurred");
  }
});

// Edit Route
app.get("/user/:id/edit", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id = '${id}'`;
    try {
      connection.query(q, (err, result) => {
        if(err) throw err;
        let user = result[0];
        res.render("edit.ejs", { user });
      });
    } catch(err) {
        console.log(err);
        res.send("some error in db");
    }
});

app.patch("/user/:id", (req, res) => {
    let { id } = req.params;
    let { password: formPass, username: newUsername } = req.body;
    let q = `SELECT * FROM user WHERE id = '${id}'`;
    try {
      connection.query(q, (err, result) => {
        if(err) throw err;
        let user = result[0];
        if(formPass != user.password) {
           res.send("Wrong Password"); 
        } else {
            let q2 = `UPDATE user SET username = '${newUsername}' WHERE id = '${id}'`;
            connection.query(q2, (err, result) => {
                if(err) throw err;
                res.redirect("/user");
            });
        }
      });
    } catch(err) {
        console.log(err);
        res.send("some error in db");
    }
});

// Delete Route
app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.delete("/user/:id", (req, res) => {
    let { id } = req.params;
    let { password } = req.body;
    let q = `SELECT * FROM user WHERE id='${id}'`;
    try {
        connection.query(q, (err, result) => {
          if(err) throw err;
          let user = result[0];

          if(user.password != password) {
            res.send("Wrong password entered!");
          } else {
            let q2 = `DELETE FROM user WHERE id='${id}'`;
            connection.query(q2, (err, result) => {
                if(err) throw err;
                else {
                    console.log(result);
                    console.log("deleted!");
                    res.redirect("/user");
                }
            });
          }
        })
    } catch (err) {
    res.send("some error with DB");
  }
});

app.listen(port, () => {
    console.log(`Server is listening to port ${port}`);
});