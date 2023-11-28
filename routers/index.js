const controller = require("../controller/dbServer.js")
const express = require("express")
const router = express.Router()

// 新建留言
router.post("/insertWall", controller.insertWall)
// 新建反馈
router.post("/insertFeedback", controller.insertFeedback)
// 新建评论
router.post("/insertComment", controller.insertComment)
// 删除留言
router.post("/deleteWall", controller.deleteWall)
// 删除反馈
router.post("/deleteFeedback", controller.deleteFeedback)
// 删除评论
router.post("/deleteComment", controller.deleteComment)
// 分页查看留言墙
router.post("/findWallPage", controller.findWallPage)
// 倒序分页查询墙的评论
router.post("/findCommentPage", controller.findCommentPage)

module.exports = router
