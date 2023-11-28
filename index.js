const express = require("express")
const cors = require("cors")
const path = require("path")
const config = require("./config/default")
const multer = require('multer')
/* 解析HTML */
const ejs = require("ejs")
const app = express()

/* 获取静态路径 */
// app.use(express.static(path.join(__dirname, "views")))
app.use(express.static(path.join(__dirname, "dist")))
app.use(express.static(path.join(__dirname, "data")))

/* 加入HTML视图 */
app.engine("html", ejs.__express)
app.set("view engine", "html")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

/* 引入路由 */
const router = require("./routers/index.js")
const fileRouter = require("./routers/file.js")
app.use("/", router)
app.use("/upload", fileRouter)
app.get("/userIp", (req, res) => {
	res.send({
		status: 200,
		ip: req.ip,
	})
})

app.listen(config.port, () => {
	console.log(`Server is running on port ${config.port}`)
})
