/**
 * @copyright 2024 Nilimesh Patra
 *
 * This file is part of the EverGoGreen project.
 *
 * This Project is licensed under the MIT License.
 * See the LICENSE file for more information.
 */
const router = require('express').Router();
const { body, header, validationResult } = require('express-validator');
const myValidationResult = validationResult.withDefaults({
  formatter: (err) => {
    return { field: err.path, message: err.msg };
  },
});
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db');
const secret = process.env.JWT_SECRET;

// Route to get all the users from database
/*
router.get('/', async (req, res) => {
  try {
    const data = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM users", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ success: false, message: 'Unable to get users' });
  }
});
*/

router.post('/', header('Authorization').exists().withMessage('Missing authentication token'), (req, res) => {
  const errors = myValidationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const token = req.headers.authorization;

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, message: 'Unable to authenticate user' });
    }

    const id = decoded.id;

    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, message: 'Unable to authenticate user' });
      } else if (row) {
        const { id, name, address, email, username } = row;
        return res.json({
          success: true,
          message: 'User authenticated',
          user: { id, name, address, email, username },
        });
      }
      res.status(401).json({ success: false, message: 'Invalid authentication token' });
    });
  });
});

router.post(
  '/new',
  [
    body('name').exists().withMessage('Name is required').bail().isString().withMessage('Name must be string').bail().trim().notEmpty().withMessage('Name must not be empty').bail().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('address').exists().withMessage('Address is required').bail().isString().withMessage('Address must be string').bail().trim().notEmpty().withMessage('Address must not be empty').bail().isLength({ min: 5, max: 255 }).withMessage('Address must be between 5 and 255 characters'),
    body('email')
      .exists()
      .withMessage('Email is required')
      .bail()
      .isString()
      .withMessage('Email must be string')
      .bail()
      .notEmpty()
      .withMessage('Email must not be empty')
      .bail()
      .isEmail()
      .withMessage('Invalid email format')
      .custom(async (value) => {
        return await new Promise((resolve, reject) => {
          db.get('SELECT 1 FROM users WHERE email = ?', [value], (err, row) => {
            if (err) {
              reject(err);
            } else if (row) {
              reject(new Error('Email already in use'));
            } else {
              resolve(true);
            }
          });
        });
      }),
    body('username')
      .exists()
      .withMessage('Username is required')
      .bail()
      .isString()
      .withMessage('Username must be string')
      .bail()
      .trim()
      .notEmpty()
      .withMessage('Username must not be empty')
      .bail()
      .isLength({ min: 2, max: 32 })
      .withMessage('Username must be between 2 and 32 characters')
      .bail()
      .matches(/^[.\w]+$/)
      .withMessage('Username can contain only underscores, periods, and alphanumeric characters')
      .bail()
      .custom(async (value) => {
        return await new Promise((resolve, reject) => {
          db.get('SELECT 1 FROM users WHERE username = ?', [value], (err, row) => {
            if (err) {
              reject(err);
            } else if (row) {
              reject(new Error('Username already exists'));
            } else {
              resolve(true);
            }
          });
        });
      }),
    body('password')
      .exists()
      .withMessage('Password is required')
      .bail()
      .isString()
      .withMessage('Password must be string')
      .bail()
      .notEmpty()
      .withMessage('Password must not be empty')
      .bail()
      .isLength({ min: 8, max: 32 })
      .withMessage('Password must be between 8 and 32 characters')
      .bail()
      .isStrongPassword()
      .withMessage('Password must be strong (containing uppercase and lowercase letters, numbers, and special characters)'),
  ],
  (req, res) => {
    const errors = myValidationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, address, email, username, password } = req.body;

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, message: 'Unable to create user' });
      }

      db.run("INSERT INTO users (name, address, email, username, password, role) VALUES (?, ?, ?, ?, ?, 'User')", [name, address, email, username, hash], function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, message: 'Unable to create user' });
        }
        const id = this.lastID;
        console.log(`Inserted a row with the ID: ${id}`);
        res.status(201).json({ success: true, message: `User created with ID: ${id}` });
      });
    });
  },
);

router.post('/auth', [body('username').exists().withMessage('Username is required').bail().isString().withMessage('Username must be string').bail().trim().notEmpty().withMessage('Username must not be empty'), body('password').exists().withMessage('Password is required').bail().isString().withMessage('Password must be string').bail().notEmpty().withMessage('Password must not be empty')], (req, res) => {
  const errors = myValidationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ? OR username = ?', [username, username], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, message: 'Unable to find user' });
    } else if (row) {
      const { id, email, username, password: hash } = row;
      return bcrypt.compare(password, hash, (err, result) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({
            success: false,
            message: 'Unable to authenticate user',
          });
        } else if (result) {
          const token = jwt.sign({ id, email, username }, secret, {
            expiresIn: '1h',
          });
          return res.json({
            success: true,
            message: 'User authenticated',
            token,
          });
        }
        res.status(401).json({ success: false, message: 'Failed to authenticate user' });
      });
    }
    res.status(404).json({ success: false, message: 'User not found' });
  });
});

router.delete('/delete', header('Authorization').exists().withMessage('Missing authentication token'), (req, res) => {
  const errors = myValidationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const token = req.headers.authorization;

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, message: 'Unable to authenticate user' });
    }

    const id = decoded.id;

    db.get('SELECT 1 FROM users WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, message: 'Unable to authenticate user' });
      } else if (row) {
        return db.run('DELETE FROM users WHERE id = ?', [id], (err) => {
          if (err) {
            console.error(err.message);
            return res.status(500).json({
              success: false,
              message: 'Unable to authenticate user',
            });
          }
          res.json({ success: true, message: `User deleted with ID: ${id}` });
        });
      }
      res.status(401).json({ success: false, message: 'Invalid authentication token' });
    });
  });
});

router.delete('/delete/:id', header('Authorization').exists().withMessage('Missing authentication token'), (req, res) => {
  const errors = myValidationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const token = req.headers.authorization;

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, message: 'Unable to authenticate user' });
    }

    db.get('SELECT * FROM users WHERE id = ?', [decoded.id], (err, row) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, message: 'Unable to authenticate user' });
      } else if (row) {
        if (row.role !== 'Admin') {
          return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        const id = req.params.id;
        return db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Unable to find user' });
          } else if (row) {
            const id = row.id;
            return db.run('DELETE FROM users WHERE id = ?', [id], (err) => {
              if (err) {
                console.error(err.message);
                return res.status(500).json({
                  success: false,
                  message: 'Unable to authenticate user',
                });
              }
              res.json({ success: true, message: `User deleted with ID: ${id}` });
            });
          }
          res.status(404).json({ success: false, message: 'User not found' });
        });
      }
      res.status(401).json({ success: false, message: 'Invalid authentication token' });
    });
  });
});

module.exports = router;
