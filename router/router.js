'use strict'

const express = require('express')
const router = express.Router()
const controller = require('../controller/controllerDownload')
const exelController = require('../controller/exelController')

router

    .get('/download-inventory',
    	controller.download
    )

    .get('/download-inventory-exel',
        exelController.download
    )

    .get('/download-inventory-exel-stock',
        exelController.getPricesAndStock
    )

module.exports = router