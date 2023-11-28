const db = require("../db/db.js")

exports.insertWall = async (req, res) => {
	const { type, message, name, userId, moment, label, color, imgUrl } =
		req.body
	await db
		.insertWall([
			type,
			message,
			name,
			userId,
			moment,
			label,
			color,
			imgUrl,
		])
		.then((result) => {
			db.findFeedbackByWallId(result.insertId, userId, db).then(
				(result) => {
					res.send({
						status: 200,
						message: result,
					})
				}
			)
		})
}

exports.insertFeedback = async (req, res) => {
	const { wallId, userId, type, moment } = req.body
	await db.insertFeedback([wallId, userId, type, moment]).then((result) => {
		res.send({
			status: 200,
			message: result,
		})
	})
}

exports.insertComment = async (req, res) => {
	const { wallId, userId, imgUrl, comment, name, moment } = req.body
	await db
		.insertComment([wallId, userId, imgUrl, comment, name, moment])
		.then((result) => {
			res.send({
				status: 200,
				message: result,
			})
		})
}

exports.deleteWall = async (req, res) => {
	const { id } = req.body
	await db.deleteWall([id]).then((result) => {
		res.send({
			status: 200,
			message: result,
		})
	})
}

exports.deleteFeedback = async (req, res) => {
	const { id } = req.body
	await db.deleteFeedback([id]).then((result) => {
		res.send({
			status: 200,
			message: result,
		})
	})
}

exports.deleteComment = async (req, res) => {
	const { id } = req.body
	await db.deleteComment([id]).then((result) => {
		res.send({
			status: 200,
			message: result,
		})
	})
}

exports.findWallPage = async (req, res) => {
	const { page, pageSize, type, label, userId } = req.body
	await db.findWallPage(page, pageSize, type, label).then(async (result) => {
		for (let i = 0; i < result.length; i++) {
			// result[i].id 就是留言卡片的Id,也就是wall这个数据表的主键
			result[i].like = await db.getFeedbackCount(result[i].id, 0) // 查询喜欢的个数
			result[i].report = await db.getFeedbackCount(result[i].id, 1) // 查询举报的个数
			result[i].revoke = await db.getFeedbackCount(result[i].id, 2) // 查询撤销的个数
			result[i].isLike = await db.isLike(result[i].id, userId) // 获取创建这个留言内容的用户的ID,用于前端判断是否是自己点过了
			result[i].commontCount = await db.getCommentCount(result[i].id) // 查找这个卡片的评论个数
		}
		res.send({
			status: 200,
			message: result,
		})
	})
}

// 倒序分页查墙的评论
exports.findCommentPage = async (req, res) => {
	const { page, pageSize, id } = req.body
	await db.findCommentPage(page, pageSize, id).then((result) => {
		res.send({
			status: 200,
			message: result,
		})
	})
}
