const express = require('express')
const teacherController = require('../controllers/teacherController')
const router = express.Router()
router.get('/lessons/:id/engagement', teacherController.engagement)
module.exports = router
