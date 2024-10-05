# Bio project - Blood Bank

<img align="right" style="width:200px; height:auto;" src="/public/images/favicon.ico">

A college project in Node JS using Express.<br>
Description: a Blood bank website with the ability to recieve and dispense blood doses, has permission management with three user types and records preformed actions in logs that can be exported.

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

1. Login to your preferred user. (registered users list is in `database/users.json`)
2. Regular users can:
   - recieve blood doses, dispense a set amount, or dispense all O- blood doses in the case of an MCI.
   - change their own password.
3. Research student users can:
   - view & export logs with personal data emitted.
   - change their own password.
4. Admin users can:
   - recieve blood doses, dispense a set amount, or dispense all O- blood doses in the case of an MCI.
   - view & export full logs.
   - add, edit and delete users in the system.
   - view the blood inventory and remove expired doses.
