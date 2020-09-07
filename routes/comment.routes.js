// routes/comment.routes.js

const { Router } = require('express')
const router = new Router()
const routeGuard = require('../middlewares/session.middleware')
const commentController = require('../controllers/comment.controllers')

router.get(
  '/admin/comment/:id/delete',
  routeGuard.isAuthenticated,
  commentController.deleteComment
)

router.post(
  '/:category/:id/comment',
  routeGuard.isAuthenticated,
  commentController.saveComment
)

module.exports = router
