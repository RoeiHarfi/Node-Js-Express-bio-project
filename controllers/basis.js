//Import
const express = require("express");
const router = express.Router();
const { updateDatabase, checkPerms, checkExpired } = require("./aidFuncs");
//Database
let inventory = require("../database/inventory.json");
const { donors, population, dist, names, msg, pagePerms, userTypes } = require("../database/staticData.json");

// [BASIS] <!-- קליטת מנות דם -->
router.get("/input", async (req, res) => {
  if (!checkPerms(req, res, pagePerms["blood-bank"], true)) return;
  var sess = req.session;
  const oldAlert = sess.alert;
  sess.alert = "";
  res.render("input", {
    page: names.input,
    names,
    db: { inventory: inventory, donors: donors, population: population, dist: dist },
    alert: oldAlert,
    user: sess.user,
    fields: sess.fields,
    perms: userTypes,
  });
});
router.post("/input", async (req, res) => {
  const start = new Date(); //[FINAL]
  if (!checkPerms(req, res, pagePerms["blood-bank"])) return;
  const { type, date, tz, name } = req.body;
  var sess = req.session;
  if (!type || !date || !tz || !name) {
    sess.alert = msg.alert1;
    return res.redirect(req.get("referer"));
  }
  const goodInv = inventory[type].filter((dose) => checkExpired(dose.date) >= 0);
  const originalInv = goodInv.length;
  const logArray = [{ name: name, id: tz, date: date }];
  inventory[type].push(...logArray);
  inventory[type] = inventory[type].sort((a, b) => {
    if (a.date > b.date) return 1;
    if (a.date < b.date) return -1;
    return 0;
  });
  const change = `Type ${type}: ${originalInv} → ${originalInv + 1}`;
  updateDatabase(sess.user, names.input, "Success", change, logArray);
  sess.alert = msg.notif1;
  const execution = new Date().getTime() - start.getTime(); //[FINAL]
  console.log(`${names.input}: ${execution / 1000}s (${execution}ms)`);
  return res.redirect(req.get("referer"));
});

// [BASIS] <!-- ניפוק מנות דם -->
router.get("/give", async (req, res) => {
  if (!checkPerms(req, res, pagePerms["blood-bank"], true)) return;
  var sess = req.session;
  const oldAlert = sess.alert;
  sess.alert = "";
  res.render("give", {
    page: names.give,
    names,
    db: { inventory: inventory, donors: donors, population: population, dist: dist },
    alert: oldAlert,
    user: sess.user,
    fields: sess.fields,
    perms: userTypes,
  });
});
router.post("/give", async (req, res) => {
  const start = new Date(); //[FINAL]
  if (!checkPerms(req, res, pagePerms["blood-bank"])) return;
  const { type, amount } = req.body;
  var sess = req.session;
  if (!type || !amount) {
    sess.alert = msg.alert1;
    return res.redirect(req.get("referer"));
  }
  const goodInv = inventory[type].filter((dose) => checkExpired(dose.date) >= 0);
  const badInv = inventory[type].filter((dose) => checkExpired(dose.date) < 0);
  const originalInv = goodInv.length; //[FINAL]
  var newAmount;
  var logArray = []; //[FINAL]
  var status = "Success";
  // Error (out of blood) + calculate suggestion
  if (originalInv < amount) {
    newAmount = 0;
    logArray = goodInv; //[FINAL]
    inventory[type] = badInv; //[FINAL]
    let suggestDonors = donors[type].sort((a, b) => {
      if (dist[a] < dist[b]) return 1;
      if (dist[a] > dist[b]) return -1;
      return 0;
    });
    let suggestOther;
    for (const donor of suggestDonors) {
      const donorArr = inventory[donor].filter((dose) => checkExpired(dose.date) >= 0);
      if (donorArr.length >= amount - originalInv) {
        suggestOther = donor;
        break;
      }
    }
    sess.fields = { type: suggestOther || type, amount: amount - originalInv };
    if (suggestOther)
      sess.alert = msg.alert2
        .replace("X", originalInv)
        .replace("Y", amount - originalInv)
        .replace("Z", suggestOther);
    else sess.alert = msg.alert2b.replace("X", originalInv).replace("Y", amount - originalInv);
    if (originalInv == 0) status = "Failed";
    else status = "Parital success";
  }
  // Success
  else {
    newAmount = originalInv - amount;
    logArray = goodInv.slice(0, amount); //[FINAL]
    inventory[type] = goodInv.slice(amount).concat(badInv); //[FINAL]
    inventory[type] = inventory[type].sort((a, b) => {
      if (a.date > b.date) return 1;
      if (a.date < b.date) return -1;
      return 0;
    });
    sess.fields = { type: type };
    sess.alert = msg.notif23.replace("X", amount);
  }
  const change = `Type ${type}: ${originalInv} → ${newAmount}`;
  updateDatabase(sess.user, names.give, status, change, logArray);
  const execution = new Date().getTime() - start.getTime(); //[FINAL]
  console.log(`${names.give}: ${execution / 1000}s (${execution}ms)`);
  return res.redirect(req.get("referer"));
});

// [BASIS] <!-- ניפוק מנות דם באר"ן -->
router.get("/emerg", async (req, res) => {
  if (!checkPerms(req, res, pagePerms["blood-bank"], true)) return;
  var sess = req.session;
  const oldAlert = sess.alert;
  sess.alert = "";
  const goodInv = inventory["O-"].filter((dose) => checkExpired(dose.date) >= 0);
  res.render("emerg", {
    page: names.emerg,
    names,
    db: { inventory: inventory, donors: donors, population: population, dist: dist },
    alert: oldAlert,
    user: sess.user,
    fields: { maxHave: goodInv.length },
    perms: userTypes,
  });
});
router.post("/emerg", async (req, res) => {
  const start = new Date(); //[FINAL]
  if (!checkPerms(req, res, pagePerms["blood-bank"])) return;
  var sess = req.session;
  const type = "O-";
  const goodInv = inventory[type].filter((dose) => checkExpired(dose.date) >= 0);
  const badInv = inventory[type].filter((dose) => checkExpired(dose.date) < 0);
  const originalInv = goodInv.length;
  var logArray = [];
  var status = "Success";
  // Error (out of blood)
  if (originalInv == 0) {
    sess.alert = msg.alert3;
    status = "Failed";
  } // Success
  else {
    logArray = goodInv;
    inventory[type] = badInv;
    sess.alert = msg.notif23.replace("X", originalInv);
  }
  const change = `Type ${type}: ${originalInv} → 0`;
  updateDatabase(sess.user, names.emerg, status, change, logArray);
  const execution = new Date().getTime() - start.getTime(); //[FINAL]
  console.log(`${names.emerg}: ${execution / 1000}s (${execution}ms)`);
  return res.redirect(req.get("referer"));
});

//External access
module.exports = router;
