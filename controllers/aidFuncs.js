//Import
const fs = require("fs");
const ejs = require("ejs");
const PuppeteerHTMLPDF = require("puppeteer-html-pdf");
//Database
let inventory = require("../database/inventory.json");
const { names, userTypes } = require("../database/staticData.json");
let users = require("../database/users.json");
//Logs
let audit = require("../database/auditLog.json");
//Other
const expiration = 35;

// [BASIS] Update database
function updateDatabase(user, action, status, change, dose) {
  fs.writeFile("./database/inventory.json", JSON.stringify(inventory, null, 1), (err) => {
    if (err) console.log(err);
  });
  logChanges(user, action, status, change, dose);
}
// [PART 11] Save log changes
function logChanges(user, action, status, change, dose) {
  const now = new Date().toISOString().split("T")[0];
  audit.last_modified = now;
  audit.log.push({
    action: action,
    status: status,
    change: change,
    date: now,
    worker_id: user.id,
    dose: dose || [],
  });
  fs.writeFile("./database/auditLog.json", JSON.stringify(audit, null, 1), (err) => {
    if (err) console.log(err);
  });
}
// [PART 11] Export logs
async function exportLogs(sess, partial) {
  try {
    const page = fs.readFileSync(`./views/partials/logsTable.ejs`, { encoding: "utf-8" });
    let html = ejs.render(page, {
      page: names.logs,
      names,
      alert: sess.alert,
      user: sess.user,
      fields: sess.fields,
      perms: userTypes,
      audit: audit,
    });
    const now = new Date().toISOString().split("T")[0];
    const name = `auditLog-${now}` + (!partial ? `_full` : ``) + `.pdf`;
    const path = `./database/${name}`;
    const htmlPDF = new PuppeteerHTMLPDF();
    htmlPDF.setOptions({
      format: "A4",
      path: path,
      landscape: true,
      margin: {
        left: "0px",
        right: "0px",
        top: "0px",
        bottom: "0px",
      },
    });
    await htmlPDF.create(html);
    return { path, name };
  } catch (err) {
    console.log(err);
  }
  return null;
}
// [HIPPA] Check user has the right permissions for the page
function checkPerms(req, res, perms, get, skip_return) {
  const sess = req.session;
  //Page takes perms
  if (perms && perms != "") {
    //Not logged in
    if (!sess.user) {
      if (!skip_return) res.redirect("/");
      return false;
    }
    //Incorrect perms
    if (!userTypes[sess.user.type].includes(perms)) {
      if (!skip_return) res.redirect(sess.currentPage);
      return false;
    }
  }
  if (get && sess.lastPage != sess.currentPage) sess.lastPage = sess.currentPage;
  sess.currentPage = req.originalUrl;
  return true;
  /*Perms:
  not logged in -> nothing
  admin -> blood-bank, full-export, edit-users,
  user -> blood-bank,
  research-student -> partial-export*/
}
// [HIPPA] Check user changed to valid username & tz
function validUser(username, tz, edited_user) {
  for (const user of users) {
    if (user != edited_user && (user.username == username || user.id == tz)) {
      return false;
    }
  }
  return true;
}
// [HIPPA] Update users database
function updateUsers() {
  fs.writeFile("./database/users.json", JSON.stringify(users, null, 1), (err) => {
    if (err) console.log(err);
  });
}
// [FINAL] Count good blood doses, list expired doses
function sortInventory() {
  var goodInv = { "A+": 0, "O+": 0, "B+": 0, "AB+": 0, "A-": 0, "O-": 0, "B-": 0, "AB-": 0 };
  var todayInv = [];
  var expInv = [];
  for (const type in inventory) {
    for (const dose of inventory[type]) {
      let expired = checkExpired(dose.date);
      if (expired >= 0 && expired <= 3)
        todayInv.push({ type: type, name: dose.name, id: dose.id, date: dose.date, left: expired });
      if (expired >= 0) goodInv[type]++;
      else expInv.push({ type: type, name: dose.name, id: dose.id, date: dose.date });
    }
  }
  todayInv = todayInv.sort((a, b) => {
    if (a.date > b.date) return 1;
    if (a.date < b.date) return -1;
    return 0;
  });
  expInv = expInv.sort((a, b) => {
    if (a.date > b.date) return 1;
    if (a.date < b.date) return -1;
    return 0;
  });
  return { goodInv, todayInv, expInv };
}
// [FINAL] Check expiration date (returns days since expired)
function checkExpired(_date) {
  const today = new Date();
  const date = new Date(_date);
  return expiration - Math.round((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}
// [FINAL]
function printMem() {
  //[Convert Bytes to larger units]
  const prettyBytes = (bytes) => {
    if (!+bytes) return "0 B";
    const units = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${chop(bytes / Math.pow(1024, units), 2)} ${["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][units]}`;
  };
  //[Capitalizes first letter]
  const capitalize = (string) => {
    if (!string) return "";
    return string[0].toUpperCase() + string.slice(1).toLowerCase();
  };
  //[Chop without rounding]
  const chop = (number, digits, frac) => {
    const fact = 10 ** digits;
    var floor = Math.floor(number * fact) / fact;
    if (!frac) return floor;
    const numString = floor + "";
    var frac = numString.includes(".") ? parseFloat("0" + numString.slice(numString.indexOf("."))) : 0;
    return frac;
  };
  try {
    const v8 = require("v8");
    const AsciiTable = require("ascii-table");
    const table = new AsciiTable("Statistics")
      .setBorder("|", "=", "0", "0")
      .setAlign(2, AsciiTable.CENTER)
      .setAlign(3, AsciiTable.CENTER);
    const used = v8.getHeapStatistics();
    var value;
    var context;
    for (let key in used) {
      context = " ";
      //prettier-ignore
      switch (key) {
        case "does_zap_garbage":
          value = used[key] + "";
          context = used[key] === 1 ? "X" : "V";
          break;
        case "used_heap_size":
          context = `${chop((used[key] / used["total_heap_size"]) * 100, 1)}%`;
          break;
        case "number_of_detached_contexts":
          context = used[key] === 0 ? "V" : "!";
          break;
        default: break;
      }
      if (used[key] === 0) value = "0";
      else {
        var vals = prettyBytes(used[key]).split(" ");
        value = `${vals[0].padEnd(6)} ${vals[1]}`;
      }
      table.addRow(capitalize(key.replaceAll("_", " ")), value, context);
    }
    console.log(table.toString().replaceAll(" ", "_"));
  } catch (err) {
    console.log(err);
  }
}

//External access
module.exports = {
  updateDatabase,
  logChanges,
  exportLogs,
  checkPerms,
  validUser,
  updateUsers,
  sortInventory,
  checkExpired,
  printMem,
};
