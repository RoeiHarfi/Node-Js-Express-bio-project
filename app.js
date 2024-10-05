/*[ Imports ]*/
const express = require("express");
const bodyParser = require("body-parser");
var session = require("express-session");
const path = require("path");
const fs = require("fs");
const { printMem } = require("./controllers/aidFuncs");
// Info:
const port = 8080;
const url = `http://localhost:${port}/`;

/*[ Initialize app ]*/
const app = express();
app.set("view engine", "ejs"); //define engine
app.set("views", "views"); //define views location
app.use(session({ resave: false, saveUninitialized: false, secret: "for some reason" }));

/*[ Define aid tools ]*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public"))); //define public folder
app.use("/images", express.static(path.join(__dirname, "public/images")));

/*[ Initialize routes ]*/
const controllers = fs.readdirSync(`./controllers`);
for (const file of controllers) {
  if (file == "aidFuncs.js") continue;
  const routes = require(`./controllers/${file}`);
  app.use(routes);
}
app.get("*", (req, res) => res.sendStatus(404));

/*[ Launch app ]*/
app.listen(port);
printMem(); //[FINAL]
console.log(url);

module.exports.app = app;