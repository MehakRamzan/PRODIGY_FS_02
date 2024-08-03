
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const { body, validationResult } = require('express-validator');
const Employee = require('../models/Employee');

// Show all employees
router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const employees = await Employee.find();
        res.render('employees/index', { employees });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// Add employee form
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('employees/add', { 
        name: '',     // Initialize fields with empty strings
        email: '',    // Adjust these fields as per your form requirements
        position: '',
        department: '',
        errors: []    // Initialize errors array
    });
});

// Create new employee
router.post('/', ensureAuthenticated, async (req, res) => {
    // Handle validation errors if any
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('employees/add', { 
            name: req.body.name,          // Pass back form values for re-rendering
            email: req.body.email,
            position: req.body.position,
            department: req.body.department,
            errors: errors.array()       // Pass errors array for displaying in the form
        });
    }

    const employee = new Employee({
        name: req.body.name,
        email: req.body.email,
        position: req.body.position,
        department: req.body.department
    });

    try {
        await employee.save();
        res.redirect('/employees');
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// Edit employee form
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.render('employees/edit', {
            employee,
            errors: []  // Initialize errors array
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update employee
router.post('/edit/:id', ensureAuthenticated, async (req, res) => {
    // Handle validation errors if any
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('employees/edit', {
            employee: {
                _id: req.params.id,
                name: req.body.name,
                email: req.body.email,
                position: req.body.position,
                department: req.body.department
            },
            errors: errors.array()   // Pass errors array for displaying in the form
        });
    }

    try {
        await Employee.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            email: req.body.email,
            position: req.body.position,
            department: req.body.department
        });
        res.redirect('/employees');
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete employee
router.get('/delete/:id', ensureAuthenticated, async (req, res) => {
    try {
        const employee = await Employee.findOneAndDelete({ _id: req.params.id });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.redirect('/employees');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
