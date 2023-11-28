const mysql = require("mysql")
const config = require("../config/default")
const db = mysql.createConnection({
	host: config.database.HOST,
	port: config.database.PORT,
	user: config.database.USER,
	password: config.database.PASSWORD,
})

const pool = mysql.createPool({
	host: config.database.HOST,
	port: config.database.PORT,
	user: config.database.USER,
	password: config.database.PASSWORD,
	database: config.database.DATABASE,
})

const dbSql = (sql, values) => {
	return new Promise((resolve, reject) => {
		db.query(sql, values, (err, results, fields) => {
			if (err) {
				reject(err)
			} else {
				resolve(results)
				db.end()
			}
		})
	})
}

// 封装为Promise的数据库执行语句
const runSql = (sql, values) => {
	return new Promise((resolve, reject) => {
		pool.getConnection(function (err, connection) {
			if (err) {
				reject(err)
			} else {
				// 执行一个查询
				connection.query(sql, values, function (err, results, fields) {
					if (err) {
						reject(err)
					} else {
						resolve(results)
					}
					// 释放连接
					connection.release()
				})
			}
		})
	})
}

// 创建数据库
const sqlCreateDatabase = `CREATE DATABASE IF NOT EXISTS ${config.database.DATABASE}`
const createDatabase = () => {
	return dbSql(sqlCreateDatabase, [])
}

// 创建数据表
const createTable = (sql) => {
	return runSql(sql, [])
}

// 创建数据表: 留言、照片
// 创建表中列的语法结构：列名 类型 约束 COMMENT '注释'
const sqlCreateWallTable = `CREATE TABLE IF NOT EXISTS walls(
    id INT NOT NULL AUTO_INCREMENT,
    type INT NOT NULL COMMENT '类型: 0->信息 1->图片',
    message VARCHAR(1000) COMMENT '留言',
    name VARCHAR(100) NOT NULL COMMENT '用户名',
    userId VARCHAR(100) NOT NULL COMMENT '创建者ID',
    moment VARCHAR(108) NOT NULL COMMENT '时间',
    label INT NOT NULL COMMENT '标签',
    color INT COMMENT '颜色',
    imgUrl VARCHAR(100) COMMENT '图片路径',
    PRIMARY KEY ( id )
);`

// 创建数据表: 留言反馈
// 这个时间是不是可以修改一下？
const sqlCreateFeedbackTable = `CREATE TABLE IF NOT EXISTS feedbacks(
    id INT NOT NULL AUTO_INCREMENT,
    wallId INT NOT NULL COMMENT '墙留言ID!',
    userId VARCHAR(100) NOT NULL COMMENT '反馈者ID',
    type INT NOT NULL COMMENT '反馈类型0喜欢1举报2撤销',
    moment VARCHAR(100) NOT NULL COMMENT '时间',
    PRIMARY KEY ( id )
)`

// 创建数据表： 评论
const sqlCreateCommentTable = `CREATE TABLE IF NOT EXISTS comments(
    id INT NOT NULL AUTO_INCREMENT,
    wallId INT NOT NULL COMMENT '墙留言ID',
    userId VARCHAR(100) NOT NULL COMMENT '评论者ID',
    imgUrl VARCHAR(100) COMMENT '头像路径',
    comment VARCHAR(1000) COMMENT '评论内容',
    name VARCHAR(108) NOT NULL COMMENT '评论者名字',
    monent VARCHAR(100) NOT NULL COMMENT '时间',
    PRIMARY KEY ( id )
)`

async function create() {
	await createDatabase(sqlCreateDatabase)
	createTable(sqlCreateWallTable)
	createTable(sqlCreateCommentTable)
	createTable(sqlCreateFeedbackTable)
}

create()

// 新建留言 图片
exports.insertWall = (values) => {
	let sql =
		"INSERT INTO walls set type=?, message=?, name=?, userId=?,moment=?, label=?, color=?, imgUrl=?"
	return runSql(sql, values)
}

// 新建反馈
exports.insertFeedback = (values) => {
	let sql = "INSERT INTO feedbacks set wallId=?, userId=?, type=?, moment=?"
	return runSql(sql, values)
}

// 新建评论
exports.insertComment = (values) => {
	let sql =
		"INSERT INTO comments set wallId=?, userId=?, imgUrl=?, comment=?, name=?, monent=?"
	return runSql(sql, values)
}

// 删除留言
exports.deleteWall = (id) => {
	const sqlWall = "DELETE FROM walls WHERE id=?",
		sqlFeedback = "DELETE FROM feedbacks WHERE wallId=?",
		sqlComment = "DELETE FROM comments WHERE wallId=?"
	return Promise.all([
		runSql(sqlWall, [id]),
		runSql(sqlComment, [id]),
		runSql(sqlFeedback, [id]),
	])
}

// 删除反馈
exports.deleteFeedback = (id) => {
	const sql = "DELETE FROM feedbacks WHERE id=?"
	return runSql(sql, [id])
}

// 删除评论
exports.deleteComment = (id) => {
	const sql = "DELETE FROM comments WHERE id=?"
	return runSql(sql, [id])
}

// 查询指定ID的留言
exports.findWallById = (id) => {
	const sql = "SELECT * FROM walls WHERE id=?"
	return runSql(sql, [id])
 }

// 查询指定ID留言的反馈
exports.findFeedbackByWallId = async (id, userId, db) => {
	const sql = "SELECT * FROM walls WHERE id=?"
	return runSql(sql, [id]).then(async (results) => {
			let result = results[0]
			// result[i].id 就是留言卡片的Id,也就是wall这个数据表的主键
			result.like = await db.getFeedbackCount(result.id, 0) // 查询喜欢的个数
			result.report = await db.getFeedbackCount(result.id, 1) // 查询举报的个数
			result.revoke = await db.getFeedbackCount(result.id, 2) // 查询撤销的个数
			result.isLike = await db.getFeedbackCount(result.id, userId) // 获取创建这个留言内容的用户的ID,用于前端判断是否是自己点过了
			result.commontCount = await db.getCommentCount(result.id) // 查找这个卡片的评论个数
			return result
	})
 }
/* 修改为大写，并且完成 ？ 和value */
// 分页查询
// label: 选项的标签
// 查询的条数： 
exports.findWallPage = (page, pageSize, type, label) => {
	let sql
	if (label === -1) {
		sql = `select * from walls where type="${type}" order by id desc limit ${
			(page - 1) * pageSize
		}, ${pageSize}`
	} else {
		sql = `select * from walls where type="${type}" and label="${label}"order by id desc limit ${
			(page - 1) * pageSize
		}, ${pageSize}`
	}
	return runSql(sql)
}

// 评论查询
exports.findCommentPage = (page, pageSize, id) => {
	const sql = `select * from comments where wallId="${id}" order by id desc limit ${
		(page - 1) * pageSize
	}, ${pageSize}`
	return runSql(sql, [])
}

// 反馈查询
exports.getFeedbackCount = (wallId, type) => {
	const sql = `select count(*) as count from feedbacks where wallId="${wallId}" and type="${type}"`
	return runSql(sql, [])
}

// 查询评论数
exports.getCommentCount = (wallId) => {
	const sql = `select count(*) as count from comments where wallId="${wallId}"`
	return runSql(sql)
}

// 是否点赞
exports.isLike = (wallId, userId) => {
	const sql = `select count(*) as count from feedbacks where wallId="${wallId}" and userId="${userId}"`
	return runSql(sql)
}
