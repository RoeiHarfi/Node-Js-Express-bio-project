//Import
const fs = require("fs");
const express = require("express");
const router = express.Router();
const { exportLogs, checkPerms } = require("./aidFuncs");
//Database
const { names, pagePerms, userTypes } = require("../database/staticData.json");
//Logs
let audit = require("../database/auditLog.json");

// [PART 11] <!-- ייצוא לוגים -->
router.get("/logs", async (req, res) => {
  var partial = checkPerms(req, res, pagePerms["partial-export"], true, true);
  if (!partial && !checkPerms(req, res, pagePerms["full-export"], true)) return;
  var sess = req.session;
  const oldAlert = sess.alert;
  sess.alert = "";
  res.render("logs", {
    page: names.logs,
    names,
    alert: oldAlert,
    user: sess.user,
    fields: sess.fields,
    perms: userTypes,
    audit: audit,
  });
});
router.post("/export", async (req, res) => {
  var partial = checkPerms(req, res, pagePerms["partial-export"], false, true);
  if (!partial && !checkPerms(req, res, pagePerms["full-export"])) return;
  var sess = req.session;
  const file = await exportLogs(sess, partial);
  if (file) {
    return res.download(file.path, file.name, (err) => {
      if (err) console.log(err);
      fs.unlinkSync(file.path);
    });
  }
  return res.redirect(req.get("referer"));
});

//External access
module.exports = router;
