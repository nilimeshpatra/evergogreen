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
const db = require('../db');
const secret = process.env.JWT_SECRET;

router.get('/', async (req, res) => {
  try {
    const vhi_list = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM vhi', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    res.json({ success: true, message: 'Retrieved VHI list', vhi_list });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ success: false, message: 'Unable to retrieve VHI list' });
  }
});

router.post('/add', [header('Authorization').exists().withMessage('Missing authentication token').bail(), body('location').exists().withMessage('Location is required').bail().isString().withMessage('Location must be string').bail().trim().notEmpty().withMessage('Location must not be empty').bail().isLength({ min: 5, max: 32 }).withMessage('Location must be between 5 and 32 characters'), body('vhi_value').exists().withMessage('VHI value is required').bail().isInt().withMessage('VHI value must be integer'), body('date').exists().withMessage('Date is required').bail().isString().withMessage('Date must be string').bail().notEmpty().withMessage('Date must not be empty').bail().isDate('dd-mm-yyyy').withMessage('Invalid date'), body('vegetation_type').exists().withMessage('Vegetation type is required').bail().isString().withMessage('Vegetation must be string').bail().trim().notEmpty().withMessage('Vegetation must not be empty').bail().isIn(['Forest', 'Grassland', 'Crop', 'Other']).withMessage('Vegetation type must be Forest, Grassland, Crop, or Other')], (req, res) => {
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
        const { location, vhi_value, date, vegetation_type } = req.body;

        return db.run('INSERT INTO vhi (author, location, vhi_value, date, vegetation_type) VALUES (?, ?, ?, ?, ?)', [id, location, vhi_value, date, vegetation_type], function (err) {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, message: 'Unable to add entry' });
          }
          const id = this.lastID;
          console.log(`Inserted a row with the ID: ${id}`);
          res.status(201).json({ success: true, message: `Entry added with ID: ${id}` });
        });
      }
      res.status(401).json({ success: false, message: 'Invalid authentication token' });
    });
  });
});

router.delete('/delete', (req, res) => {
  res.status(400).json({ success: false, errors: [{ field: 'param', message: 'Missing id parameter' }] });
});

router.delete('/delete/:id', [header('Authorization').exists().withMessage('Missing authentication token')], (req, res) => {
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

    const id = req.params.id;
    const authorId = decoded.id;

    db.get('SELECT 1 FROM vhi WHERE id = ? AND author = ?', [id, authorId], (err, row) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, message: 'Unable to find entry' });
      } else if (row) {
        return db.run('DELETE FROM vhi WHERE id = ? AND author = ?', [id, authorId], (err) => {
          if (err) {
            console.error(err.message);
            return res.status(500).json({
              success: false,
              message: 'Unable to delete entry',
            });
          }
          res.json({
            success: true,
            message: `Entry ${id} has been deleted`,
          });
        });
      }
      res.status(404).json({ success: false, message: 'Entry not found' });
    });
  });
});

module.exports = router;
