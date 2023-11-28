const multer = require("multer")
const express = require("express")
const path = require("path") // 引入path模块
const router = express.Router()

// 使用diskStorage选项
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 设置文件的保存路径
    cb(null, "./data/photos/")
  },
  filename: (req, file, cb) => {
    // 获取文件的原始名称
    const originalname = file.originalname
    // 获取文件的扩展名
    const extname = path.extname(originalname)
    // 设置文件的新名称，加上扩展名
    cb(null, file.fieldname + "-" + Date.now() + extname)
  }
})

// 使用storage选项创建upload中间件
const upload = multer({ storage }).single("photo")

router.post("/photo", upload, (req, res) => {
	console.log("文件上传成功")
	console.log(req.file)
    const imgUrl = "/photos/" + req.file.filename
	res.send({
		status: 200,
		message: imgUrl,
	})
})

module.exports = router

