const asyncHandler = require('express-async-handler');
const Contact = require('../models/contactModel');

const submitContactForm = asyncHandler(async (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    try {
        const contactEntry = new Contact({
            name,
            email,
            phone,
            subject,
            message
        });
        const savedContact = await contactEntry.save();
        res.status(201).json(savedContact);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
    });


    const getContactForm = asyncHandler(async (req, res) => {
        const contactForm = await Contact.find();
        res.status(200).json(contactForm);
    })

    
module.exports = {
    submitContactForm,
    getContactForm
};