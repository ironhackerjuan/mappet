const { Router } = require('express')
const router = new Router()
const uploads = require('../config/multer.config')
const routeGuard = require('../middlewares/session.middleware')
const singleController = require('../controllers/single.controllers')

router.get(
  '/:category/:id',
  routeGuard.isNotAuthenticated,
  singleController.getSpot
)

module.exports = router