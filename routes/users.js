const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../models/User')

// This route  Post request to api/users,
// description   register a  user,
// access to public to register an become a user
router.post('/',  [
    check('name', 'Name is require').not().isEmpty(),
    check('email', 'please include email').isEmail(),
    check('password', 'enter a password with atleast 6 characters'
    ).isLength({min: 6})
    
],
async (req, res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array()});
    }
    const { name, email, password } = req.body; 
    try{
        let user = await User.findOne({email});
        if(user){
            return res.status(400).json({msg: 'user already exist'})
        }
        user  = new User({
            name,
            email,
            password
        });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        
        // object to send in the token
        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(payload, config.get('jwtSecret'), {
            expiresIn: 36000
        }, (err, token) => {
            if(err) throw err;
            res.json({token});

        });

    } catch (err){
        console.log(err.message);
        res.status(500).send('server error')
    }
});


module.exports = router;