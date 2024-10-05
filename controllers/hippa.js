//Import
const express = require("express");
const router = express.Router();
const { checkPerms, validUser, updateUsers } = require("./aidFuncs");
//Database
const { names, msg, pagePerms, userTypes } = require("../database/staticData.json");
let users = require("../database/users.json");

// [HIPPA] <!-- התחברות -->
router.get("/", async (req, res) => {
  if (!checkPerms(req, res, null, true)) return;
  var sess = req.session;
  if (sess.user) {
    if (sess.user.type == "research-student") return res.redirect("/logs");
    return res.redirect("/input");
  }
  const oldAlert = sess.alert;
  sess.alert = "";
  res.render("login", {
    page: "",
    names,
    alert: oldAlert,
    user: null,
    fields: sess.fields,
    perms: userTypes,
  });
});
router.post("/", async (req, res) => {
  const { username, password } = req.body;
  var sess = req.session;
  for (const user of users) {
    if (user.username == username)
      if (user.password == password) {
        sess.user = user;
        sess.fields = null;
        break;
      } else {
        sess.alert = msg.pass;
        sess.fields = { username: username, password: password };
        return res.redirect(req.get("referer"));
      }
  }
  if (!sess.user) {
    sess.alert = msg.user;
    sess.fields = { username: username, password: password };
  } else {
    sess.alert = "";
    sess.fields = null;
  }
  return res.redirect(req.get("referer"));
});
router.get("/logout", async (req, res) => {
  var sess = req.session;
  sess.user = null;
  sess.alert = "";
  sess.fields = null;
  return res.redirect("/");
});

// [HIPPA] <!-- הגדרת יוזרים -->
router.get("/users", async (req, res) => {
  if (!checkPerms(req, res, pagePerms["edit-users"], true)) return;
  var sess = req.session;
  const oldAlert = sess.alert;
  sess.alert = "";
  res.render("users", {
    page: names.users,
    names,
    alert: oldAlert,
    user: sess.user,
    fields: sess.fields,
    perms: userTypes,
    users: users,
  });
});
router.post("/users", async (req, res) => {
  if (!checkPerms(req, res, pagePerms["edit-users"])) return;
  var sess = req.session;
  //Add new user
  if (req.body.add) {
    var { username, name, tz, password, type } = req.body;
    sess.fields = { username, name, tz, password, type };
    if (!username || !name || !tz || !password || !type) return res.redirect(req.get("referer"));
    if (!validUser(username, tz)) sess.alert = msg.invalid_user.replace("X", "להוסיף");
    else {
      users.push({ username: username, type: type, name: name, id: tz, password: password });
      sess.fields = null;
    }
  }
  //Edit existing user
  else if (req.body.edit) {
    var index = req.body.edit;
    var selfUpdate = users[index].username === sess.user.username;
    var { username, name, tz, password, type } = req.body;
    if (!validUser(username, tz, users[index])) sess.alert = msg.invalid_user.replace("X", "לערוך");
    else {
      if (!username || !name || !tz || !password || (!selfUpdate && !type)) return res.redirect(req.get("referer"));
      users[index].username = username;
      users[index].name = name;
      users[index].id = tz;
      users[index].password = password;
      if (!selfUpdate) users[index].type = type;
      sess.fields = null;
      if (selfUpdate) sess.user = users[index];
    }
  }
  //Deleting existing user
  else if (req.body) {
    var { username } = req.body;
    users = users.filter((user) => user.username != username);
    sess.fields = null;
  }
  updateUsers();
  return res.redirect(req.get("referer"));
});

//External access
module.exports = router;
