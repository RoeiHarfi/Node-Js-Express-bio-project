//Import
const express = require("express");
const router = express.Router();
const { updateDatabase, checkPerms, updateUsers, sortInventory } = require("./aidFuncs");
//Database
let inventory = require("../database/inventory.json");
const { names, msg, pagePerms, userTypes } = require("../database/staticData.json");
let users = require("../database/users.json");
//Logs
let audit = require("../database/auditLog.json");

// [FINAL]  <!-- שינוי סיסמה -->
router.get("/account", async (req, res) => {
  if (!checkPerms(req, res, pagePerms["edit-account"], true)) return;
  var sess = req.session;
  const oldAlert = sess.alert;
  sess.alert = "";
  res.render("account", {
    page: names.account,
    names,
    alert: oldAlert,
    user: sess.user,
    perms: userTypes,
    users: users,
  });
});
router.post("/account", async (req, res) => {
  if (!checkPerms(req, res, pagePerms["edit-account"])) return;
  var sess = req.session;
  //Change password
  var { password } = req.body;
  if (!password) return res.redirect(req.get("referer"));
  const index = users.findIndex((user) => user.id === sess.user.id);
  users[index].password = password;
  sess.user = users[index];

  updateUsers();
  return res.redirect("/back");
});

// [FINAL]  <!-- שינוי סיסמה -->
router.get("/inventory", async (req, res) => {
  if (!checkPerms(req, res, pagePerms["inventory"], true)) return;
  var sess = req.session;
  const oldAlert = sess.alert;
  sess.alert = "";
  var sortInv = sortInventory();
  res.render("inventory", {
    page: names.inventory,
    names,
    db: sortInv,
    alert: oldAlert,
    user: sess.user,
    fields: sess.fields,
    perms: userTypes,
  });
});
router.post("/inventory", async (req, res) => {
  if (!checkPerms(req, res, pagePerms["inventory"])) return;
  var sess = req.session;
  var { remove } = req.body;
  if (!remove) return res.redirect(req.get("referer"));
  const [type, id, date] = remove.split("_");
  const index = inventory[type].findIndex((dose) => dose.id == id && dose.date == date);
  if (index == -1) {
    sess.alert = msg.error;
    return res.redirect(req.get("referer"));
  }
  const logArray = [inventory[type][index]];
  if (!logArray) {
    sess.alert = msg.error;
    return res.redirect(req.get("referer"));
  }
  inventory[type] = inventory[type].filter((dose) => !(dose.id == id && dose.date == date));

  const change = `Type ${type}`;
  updateDatabase(sess.user, names.remove, "Success", change, logArray);
  return res.redirect(req.get("referer"));
});

// Previous page
router.get("/back", async (req, res) => {
  var sess = req.session;
  const referer = req.get("referer").split("/");
  if (sess.lastPage != `/${referer[referer.length - 1]}` && sess.lastPage != sess.currentPage) return res.redirect(sess.lastPage);
  return res.redirect("/");
});
// Displays DB in json format (for admin users)
router.get("/export-jsons", async (req, res) => {
  const { u, p, t } = req.query;
  if (!u || !p) return res.sendStatus(401);
  if (!t) return res.sendStatus(400);
  var auth = false;
  for (const user of users) {
    if (user.username == u)
      if (user.password == p) {
        if (user.type === "admin") auth = true;
        break;
      } else {
        break;
      }
  }
  if (!auth) return res.sendStatus(403);
  switch (t) {
    case "inv":
      return res.json(inventory);
    case "users":
      return res.json(users);
    case "audit":
      return res.json(audit);
  }
  return res.sendStatus(400);
});

//External access
module.exports = router;
