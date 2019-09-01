const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')
const { check, validationResult } = require('express-validator');

const User = require('../models/User');
const Contact = require('../models/Contact');

// This route Get request to api/contacts,
// description is to get all users contacts,
// access to public to register an become a user,
// auth param will protect the route
router.get('/', auth, async (req, res) =>{
    try{
        const contacts = await Contact.find({ user: req.user.id}).sort({ date: -1});
        res.json(contacts);
    } catch(err) {
        console.error(err.message);
        res.status('server error');
    }
});
// This route Post request to api/contacts,
// description is to add new contacts,
// access to private contacts from user
router.post('/', [auth, [
    check('name', 'Name is required').not().isEmpty()

 ] ], 
 async (req, res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array()}
        );
    }
 const {name, email, phone, type } = req.body;
 
 try{
     const newContact = new Contact({
         name,
         email,
         phone,
         type,
         user: req.user.id
     });
     const contact = await newContact.save();
     res.json(contact);

 } catch(err){
     console.error(err.message)
     res.status(500).send('server error');

 }
}
 
);
// This route is Put request to api/contacts/:id with id to specify contact,
// description is to update new contacts,
// access to private for user
router.put('/:id', auth, async (req, res) =>{
    const {name, email, phone, type } = req.body;

    //build a contact object to update
    const contactFields = {};
    if(name) contactFields.name = name;
    if(email) contactFields.email = email;
    if(phone) contactFields.phone = phone;
    if(type) contactFields.type = type;

    try{
        let contact = await Contact.findById(req.params.id);
        if(!contact) return res.status(404).json({ msg: 'contact not found'});
        
        //make sure user owns contact
        if(contact.user.toString() !== req.user.id){
            return res.status(401).json({ msg: 'not authorized'});

        }
        contact = await Contact.findByIdAndUpdate(req.params.id, 
            { $set: contactFields},
            { new: true});

            res.json(contact);
    } catch (err){
        console.error(err.message)
     res.status(500).send('server error');

    }

});
// This route is delete request to api/contacts/:id with id to specify contact,
// description is to delete contacts,
// access to private for user
router.delete('/:id', auth, async(req, res) =>{
    try{
        let contact = await Contact.findById(req.params.id);
        
        if(!contact) return res.status(404).json({ msg: 'contact not found'});
        
        //make sure user owns contact
        if(contact.user.toString() !== req.user.id){
            return res.status(401).json({ msg: 'not authorized'});

        }
      await Contact.findByIdAndRemove(req.params.id);        
      res.json({ msg: 'contact has been deleted'});
    } catch (err){
        console.error(err.message)
     res.status(500).send('server error');

    }

});

module.exports = router;