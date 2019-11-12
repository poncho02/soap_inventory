'use strict'

const express = require('express')
const router = express.Router()
const controller = require('../controller/controllerDownload')

router

    .get('/download-inventory',
    	controller.download
    )

module.exports = router