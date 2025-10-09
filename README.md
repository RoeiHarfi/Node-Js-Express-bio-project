# Bio Project - Blood Bank

<img align="right" style="width:200px; height:auto;" src="/public/images/favicon.ico">

<p> 
   <img src="https://img.shields.io/badge/Node.js-grey?logo=node.js"> 
   <img src="https://img.shields.io/badge/Express-grey?logo=express"> 
   <img src="https://img.shields.io/badge/EJS-gray?logo=ejs">
   <img src="https://img.shields.io/badge/🎓-College_Project-grey?labelColor=lightgrey"> 
</p>

A college project in Node.js using Express.<br>
A blood bank web app that allows users to manage blood inventory by adding and dispensing doses. It features three user types with different permissions and logs all actions, which can be exported as PDF reports using a Puppeteer-based library.

<table align="center">
   <thead>
   <tr>
      <td colspan="2" align="center">Collaborators</td>
   </tr>
   </thead>
   <tbody>
   <tr>
    <tr>
      <td align="center"><a href="https://github.com/ElenaChes">@ElenaChes</a></td>
      <td align="center"><a href="https://github.com/RoeiHarfi">@RoeiHarfi</a></td>
      </tr>
      <td>
         <a href="https://github.com/ElenaChes"><img src="https://github.com/ElenaChes.png?size=115" width=100 /></a>
      </td>
      <td>
         <a href="https://github.com/RoeiHarfi"><img src="https://github.com/RoeiHarfi.png?size=115" width=100 /></a>
      </td>
   </tr>
   </tbody>
</table>
<details>

  <summary><h3>Content</h3></summary>

- [Installation](#installation)
- [Usage](#usage)

</details>
<hr>

# Installation

1. Run `npm i`.
2. Start `app.js`.

# Usage

1. Log in to your preferred user. (registered users list is in `database/users.json`)
2. Regular users can:
   - Add blood doses to inventory, dispense a set amount, or dispense all O- blood doses in the case of an MCI.
   - Change their own password.
3. Research student users can:
   - View and export logs with personal data emitted.
   - Change their own password.
4. Admin users can:
   - Add blood doses to inventory, dispense a set amount, or dispense all O- blood doses in the case of an MCI.
   - View and export full logs.
   - Add, edit, and delete users in the system.
   - View the blood inventory and remove expired doses.

> [!CAUTION]
> Passwords are stored in plaintext in `database/users.json`.<br>
> This project is intended for learning/testing purposes only and **should not** be used in any real production environment.
