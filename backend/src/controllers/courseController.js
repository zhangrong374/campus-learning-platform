const { pool } = require('../config/database');

// 获取所有课程
const getAllCourses = async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = 'SELECT * FROM courses';
    const params = [];
    const conditions = [];

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    if (search) {
      conditions.push('(course_name LIKE ? OR course_code LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY course_code';

    const [courses] = await pool.query(query, params);

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('获取课程列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取课程列表失败'
    });
  }
};

// 获取课程详情
const getCourseDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // 获取课程基本信息
    const [courses] = await pool.query(
      'SELECT * FROM courses WHERE id = ?',
      [id]
    );

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    // 获取课程内容
    const [contents] = await pool.query(
      'SELECT * FROM course_content WHERE course_id = ? ORDER BY order_num',
      [id]
    );

    res.json({
      success: true,
      data: {
        course: courses[0],
        contents
      }
    });
  } catch (error) {
    console.error('获取课程详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取课程详情失败'
    });
  }
};

// 创建课程（管理员/学校）
const createCourse = async (req, res) => {
  try {
    const { course_code, course_name, instructor, credits, category, description } = req.body;

    const [result] = await pool.query(
      `INSERT INTO courses (course_code, course_name, instructor, credits, category, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [course_code, course_name, instructor, credits, category, description]
    );

    res.status(201).json({
      success: true,
      message: '课程创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('创建课程错误:', error);
    res.status(500).json({
      success: false,
      message: '创建课程失败'
    });
  }
};

// 添加课程内容
const addCourseContent = async (req, res) => {
  try {
    const { course_id, title, content, video_url, order_num } = req.body;

    const [result] = await pool.query(
      `INSERT INTO course_content (course_id, title, content, video_url, order_num)
       VALUES (?, ?, ?, ?, ?)`,
      [course_id, title, content, video_url, order_num]
    );

    res.status(201).json({
      success: true,
      message: '课程内容添加成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('添加课程内容错误:', error);
    res.status(500).json({
      success: false,
      message: '添加课程内容失败'
    });
  }
};

module.exports = {
  getAllCourses,
  getCourseDetail,
  createCourse,
  addCourseContent
};
