const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

const User = require('../models/User')

// This route  Get request to api/auth,
// description is to Get logged in user,
// access to users private details
router.get('/', auth,  async (req, res) =>{
   try{
       const user = await User.findById(req.user.id).select('-password');
       res.json(user);
   } catch(err){
     console.error(err.message);
     res.status(500).send('server error');
   }
});
// This route Post request to api/auth to authenticate user,
// description is to user authenticated and token,
// access will be public to authenticate and get token
router.post('/', [
    check('email', 'please enter a valid email').isEmail(),
    check('password', 'password is required').exists()
], 
async (req, res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array()});
    }
    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if(!user) {
          return res.status(400).json({ msg: 'invalid credentials'});
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if(!isMatch){
          return res.status(400).json({ msg: 'invalid credentials'});
      }
      const payload = {
        user: {
            id: user.id
        }
    };
    jwt.sign(payload, config.get('jwtSecret'), {
        expiresIn: 36000
    }, (err, token) => {
        if(err) throw err;
        res.json({token});

    });
    } catch (err){
      console.error(err.message);
      res.status(500).send('server error')
    }
  }
);

module.exports = router;