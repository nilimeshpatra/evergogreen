/**
 * @copyright 2024 Nilimesh Patra
 *
 * This file is part of the EverGoGreen project.
 *
 * This Project is licensed under the MIT License.
 * See the LICENSE file for more information.
 */
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const users = require('./users/routes');
const vhi = require('./vhi/routes');

const app = express();
const { port } = require("../config.json").express;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use('/api/users', users);
app.use('/api/vhi', vhi);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
