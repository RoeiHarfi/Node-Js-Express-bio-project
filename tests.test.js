//[Import]
var assert = require("assert");
var request = require("supertest");
const { app } = require("./app");
//[Variables]
const inventory = require("./database/inventory.json");
const users = require("./database/users");
const test_admin = users[0];
const test_user = users[1];
const test_student = users[2];
const test_newUser = { username: "test", type: "admin", name: "test", id: "000000005", password: "000000" };
const test_blood1 = { type: "A+", date: "2024-01-01", id: "000000000", name: "test" };
const test_blood2 = { type: "A+", date: "2024-01-02", id: "000000000", name: "test" };
var label = ["[User]", "[Research student]", "[Admin]"];
var tests = 0;
var agent;

describe("Running tests...\n  (note that all tests login to the website before they start)", function () {
  //=====================================================================================
  //Login as user
  before(async () => {
    agent = request.agent(app);
    agent
      .post("/")
      .send({ username: test_user.username, password: test_user.password })
      .expect(302) //redirect
      .redirects(1); //go to /
  });
  it("1) " + label[0] + " Receive blood", () => {
    tests++;
    agent
      .post("/input")
      .send({ type: test_blood1.type, date: test_blood1.date, tz: test_blood1.id, name: test_blood1.name })
      .expect(302) //redirect
      .redirects(1)
      .end(function (err, response, body) {
        if (err) setTimeout(() => done(), 1000);
        assert.equal(response.header["content-type"], "text/html; charset=utf-8");
        setTimeout(() => done(), 1000);
      });
  });
  it("2) " + label[0] + " Dispense blood", () => {
    tests++;
    const removed_dose = inventory[test_blood2.type][0]; //the dose that will be given
    agent
      .post("/give")
      .send({ type: test_blood2.type, amount: 1 })
      .expect(302) //redirect
      .redirects(1)
      .end(function (err, response, body) {
        if (err) setTimeout(() => done(), 1000);
        assert.equal(response.header["content-type"], "text/html; charset=utf-8");
        //add the removed dose back
        agent
          .post("/input")
          .send({ type: removed_dose.type, date: removed_dose.date, tz: removed_dose.id, name: removed_dose.name })
          .expect(302) //redirect
          .redirects(1)
          .end(function (err, response, body) {
            if (err) setTimeout(() => done(), 1000);
            assert.equal(response.header["content-type"], "text/html; charset=utf-8");
            setTimeout(() => done(), 1000);
          });
      });
  });
  it("3) " + label[0] + " Dispense blood (ןרא)", () => {
    tests++;
    const removed_doses = inventory["O-"]; //the doses that will be given
    agent
      .post("/emerg")
      .send({})
      .expect(302) //redirect
      .redirects(1)
      .end(function (err, response, body) {
        if (err) setTimeout(() => done(), 1000);
        assert.equal(response.header["content-type"], "text/html; charset=utf-8");
        //add the removed doses back
        for (const removed_dose in removed_doses) {
          agent
            .post("/input")
            .send({ type: removed_dose.type, date: removed_dose.date, tz: removed_dose.id, name: removed_dose.name })
            .expect(302) //redirect
            .redirects(1)
            .end(function (err, response, body) {
              if (err) setTimeout(() => done(), 1000);
              assert.equal(response.header["content-type"], "text/html; charset=utf-8");
              setTimeout(() => done(), 1000);
            });
        }
      });
  });
  it("4) " + label[0] + " View account info", () => {
    tests++;
    agent
      .get("/account")
      .expect(200)
      .end(function (err, response, body) {
        if (err) setTimeout(() => done(), 1000);
        assert.equal(response.header["content-type"], "text/plain; charset=utf-8");
        setTimeout(() => done(), 1000);
      });
  });
  it("5) " + label[0] + " Edit password", () => {
    tests++;
    agent
      .post("/account")
      .send({ password: "111111" })
      .expect(302) //redirect
      .redirects(1)
      .end(function (err, response, body) {
        if (err) setTimeout(() => done(), 1000);
        assert.equal(response.header["content-type"], "text/html; charset=utf-8");
        agent
          .post("/account")
          .send({ password: test_user.password })
          .expect(302) //redirect
          .redirects(1)
          .end(function (err, response, body) {
            if (err) setTimeout(() => done(), 1000);
            assert.equal(response.header["content-type"], "text/html; charset=utf-8");
            setTimeout(() => done(), 1000);
          });
      });
  });
  //=====================================================================================
  //Login as reseach student
  before(async () => {
    agent = request.agent(app);
    agent
      .post("/")
      .send({ username: test_student.username, password: test_student.password })
      .expect(302) //redirect
      .redirects(1); //go to /
  });
  it("6) " + label[1] + " View logs", () => {
    tests++;
    agent
      .get("/logs")
      .expect(200)
      .end(function (err, response, body) {
        if (err) setTimeout(() => done(), 1000);
        assert.equal(response.header["content-type"], "text/plain; charset=utf-8");
        setTimeout(() => done(), 1000);
      });
  });
  it("7) " + label[1] + " Export logs", () => {
    tests++;
    agent
      .post("/export")
      .send({})
      .expect(302) //redirect
      .redirects(1)
      .end(function (err, response, body) {
        if (err) setTimeout(() => done(), 1000);
        assert.equal(response.header["content-type"], "text/html; charset=utf-8");
        setTimeout(() => done(), 1000);
      });
  });
  it("8) " + label[1] + " View account info", () => {
    tests++;
    agent
      .get("/account")
      .expect(200)
      .end(function (err, response, body) {
        if (err) setTimeout(() => done(), 1000);
        assert.equal(response.header["content-type"], "text/plain; charset=utf-8");
        setTimeout(() => done(), 1000);
      });
  });
  it("9) " + label[1] + " Edit password", () => {
    tests++;
    agent
      .post("/account")
      .send({ password: "111111" })
      .expect(302) //redirect
      .redirects(1)
      .end(function (err, response, body) {
        if (err) setTimeout(() => done(), 1000);
        assert.equal(response.header["content-type"], "text/html; charset=utf-8");
        agent
          .post("/account")
          .send({ password: test_student.password })
          .expect(302) //redirect
          .redirects(1)
          .end(function (err, response, body) {
            if (err) setTimeout(() => done(), 1000);
            assert.equal(response.header["content-type"], "text/html; charset=utf-8");
            setTimeout(() => done(), 1000);
          });
      });
  });
  //=====================================================================================
  //Login as admin
  before(async () => {
    agent = request.agent(app);
    agent
      .post("/")
      .send({ username: test_admin.username, password: test_admin.password })
      .expect(302) //redirect
      .redirects(1); //go to /
  });
  it("10) " + label[2] + " Receive blood", () => {
    tests++;
    agent
      .post("/input")
      .send({ type: test_blood2.type, date: test_blood2.date, tz: test_blood2.id, name: test_blood2.name })
      .expect(302) //redirect
      .redirects(1)
      .end(function (err, response, body) {
        if (err) setTimeout(() => done(), 1000);
        assert.equal(response.header["content-type"], "text/html; charset=utf-8");
        setTimeout(() => done(), 1000);
      });
  });
  it("11) " + label[2] + " Dispense blood", () => {
    tests++;
    const removed_dose = inventory[test_blood2.type][0]; //the dose that will be given
    agent
      .post("/give")
      .send({ type: test_blood2.type, amount: 1 })
      .expect(302) //redirect
      .redirects(1)
      .end(function (err, response, body) {
        if (err) setTimeout(() => done(), 1000);
        assert.equal(response.header["content-type"], "text/html; charset=utf-8");
        //add the removed dose back
        agent
          .post("/input")
          .send({ type: removed_dose.type, date: removed_dose.date, tz: removed_dose.id, name: removed_dose.name })
          .expect(302) //redirect
          .redirects(1)
          .end(function (err, response, body) {
            if (err) setTimeout(() => done(), 1000);
            assert.equal(response.header["content-type"], "text/html; charset=utf-8");
            setTimeout(() => done(), 1000);
          });
      });
  });
  it("12) " + label[2] + " Dispense blood (ןרא)", () => {
    tests++;
    const removed_doses = inventory["O-"]; //the doses that will be given
    agent
      .post("/emerg")
      .send({})
      .expect(302) //redirect
      .redirects(1)
      .end(function (err, response, body) {
        if (err) setTimeout(() => done(), 1000);
        assert.equal(response.header["content-type"], "text/html; charset=utf-8");
        //add the removed doses back
        for (const removed_dose in removed_doses) {
          agent
            .post("/input")
            .send({ type: removed_dose.type, date: removed_dose.date, tz: removed_dose.id, name: removed_dose.name })
            .expect(302) //redirect
            .redirects(1)
            .end(function (err, response, body) {
              if (err) setTimeout(() => done(), 1000);
              assert.equal(response.header["content-type"], "text/html; charset=utf-8");
              setTimeout(() => done(), 1000);
            });
        }
      });
  });
  it("13) " + label[2] + " View full logs", () => {
    tests++;
    agent
      .get("/logs")
      .expect(200)
      .end(function (err, response, body) {
        if (err) setTimeout(() => done(), 1000);
        assert.equal(response.header["content-type"], "text/plain; charset=utf-8");
        setTimeout(() => done(), 1000);
      });
  });
  it("14) " + label[2] + " Export full logs", () => {
    tests++;
    agent
      .post("/export")
      .send({})
      .expect(302) //redirect
      .redirects(1)
      .end(function (err, response, body) {
        if (err) setTimeout(() => done(), 1000);
        assert.equal(response.header["content-type"], "text/html; charset=utf-8");
        setTimeout(() => done(), 1000);
      });
  });
  it("15) " + label[2] + " View all users", () => {
    tests++;
    agent
      .get("/users")
      .expect(200)
      .end(function (err, response, body) {
        if (err) setTimeout(() => done(), 1000);
        assert.equal(response.header["content-type"], "text/plain; charset=utf-8");
        setTimeout(() => done(), 1000);
      });
  });
  it("16) " + label[2] + " Add new user", () => {
    tests++;
    agent
      .post("/users")
      .send({
        username: test_newUser.username,
        name: test_newUser.name,
        tz: test_newUser.id,
        password: test_newUser.password,
        type: test_newUser.type,
        add: "new",
      })
      .expect(302) //redirect
      .redirects(1)
      .end(function (err, response, body) {
        if (err) setTimeout(() => done(), 1000);
        assert.equal(response.header["content-type"], "text/html; charset=utf-8");
        setTimeout(() => done(), 1000);
      });
  });
  it("17) " + label[2] + " Edit user", () => {
    tests++;
    agent
      .post("/users")
      .send({
        username: test_newUser.username,
        name: test_newUser.name,
        tz: test_newUser.id,
        password: "111111",
        type: "user",
        edit: users.length - 1,
      })
      .expect(302) //redirect
      .redirects(1)
      .end(function (err, response, body) {
        if (err) setTimeout(() => done(), 1000);
        assert.equal(response.header["content-type"], "text/html; charset=utf-8");
        setTimeout(() => done(), 1000);
      });
  });
  it("18) " + label[2] + " Delete user", () => {
    tests++;
    agent
      .post("/users")
      .send({ username: test_newUser.username })
      .expect(302) //redirect
      .redirects(1)
      .end(function (err, response, body) {
        if (err) setTimeout(() => done(), 1000);
        assert.equal(response.header["content-type"], "text/html; charset=utf-8");
        setTimeout(() => done(), 1000);
      });
  });
  it("19) " + label[2] + " View inventory", () => {
    tests++;
    agent
      .get("/inventory")
      .expect(200)
      .end(function (err, response, body) {
        if (err) setTimeout(() => done(), 1000);
        assert.equal(response.header["content-type"], "text/plain; charset=utf-8");
        setTimeout(() => done(), 1000);
      });
  });
  it("20) " + label[2] + " Remove expired doses", () => {
    tests++;
    agent
      .post("/inventory")
      .send({ remove: `${test_blood1.type}_${test_blood1.id}_${test_blood1.date}` })
      .expect(302) //redirect
      .redirects(1)
      .end(function (err, response, body) {
        if (err) setTimeout(() => done(), 1000);
        assert.equal(response.header["content-type"], "text/html; charset=utf-8");
        agent
          .post("/inventory")
          .send({ remove: `${test_blood2.type}_${test_blood2.id}_${test_blood2.date}` })
          .expect(302) //redirect
          .redirects(1)
          .end(function (err, response, body) {
            if (err) setTimeout(() => done(), 1000);
            assert.equal(response.header["content-type"], "text/html; charset=utf-8");
            setTimeout(() => done(), 1000);
          });
      });
  });

  after(() => console.log(`  ${tests} tests complete.`));
});
