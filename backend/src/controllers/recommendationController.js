const { pool } = require('../config/database');

// 生成推荐（基于用户兴趣和目标）
const generateRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    // 获取用户资料
    const [profiles] = await pool.query(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [userId]
    );

    if (profiles.length === 0) {
      return res.json({
        success: true,
        data: {
          courses: [],
          clubs: [],
          activities: []
        }
      });
    }

    const profile = profiles[0];
    const interests = profile.interests ? profile.interests.split(',') : [];

    const recommendations = {
      courses: [],
      clubs: [],
      activities: []
    };

    // 推荐课程（根据专业和兴趣）
    if (profile.major || interests.length > 0) {
      let courseQuery = 'SELECT * FROM courses WHERE 1=1';
      const courseParams = [];

      if (profile.major) {
        courseQuery += ' AND category = ?';
        courseParams.push(profile.major);
      } else if (interests.length > 0) {
        courseQuery += ' AND (';
        const interestConditions = interests.map(() => 'description LIKE ?').join(' OR ');
        courseQuery += interestConditions;
        courseQuery += ')';
        interests.forEach(interest => courseParams.push('%' + interest.trim() + '%'));
      }

      courseQuery += ' LIMIT 5';
      const [courses] = await pool.query(courseQuery, courseParams);
      recommendations.courses = courses;

      // 保存推荐记录
      courses.forEach(course => {
        const reason = '根据您的' + (profile.major || '兴趣') + '推荐';
        pool.query(
          `INSERT INTO recommendations (user_id, type, item_id, score, reason)
           VALUES (?, 'course', ?, ?, ?)`,
          [userId, course.id, 85.0, reason]
        );
      });
    }

    // 推荐社团（根据兴趣）
    if (interests.length > 0) {
      let clubQuery = 'SELECT * FROM clubs WHERE 1=1';
      const clubParams = [];

      clubQuery += ' AND (';
      const interestConditions = interests.map(() => 'name LIKE ? OR description LIKE ?').join(' OR ');
      clubQuery += interestConditions;
      clubQuery += ')';
      interests.forEach(interest => {
        clubParams.push('%' + interest.trim() + '%', '%' + interest.trim() + '%');
      });

      clubQuery += ' LIMIT 5';
      const [clubs] = await pool.query(clubQuery, clubParams);
      recommendations.clubs = clubs;

      // 保存推荐记录
      clubs.forEach(club => {
        const reason = '根据您的兴趣推荐: ' + interests.join(', ');
        pool.query(
          `INSERT INTO recommendations (user_id, type, item_id, score, reason)
           VALUES (?, 'club', ?, ?, ?)`,
          [userId, club.id, 80.0, reason]
        );
      });
    }

    // 推荐活动（进行中的活动）
    const [activities] = await pool.query(
      `SELECT * FROM activities
       WHERE status = 'published' AND start_time > NOW()
       ORDER BY current_participants DESC
       LIMIT 5`
    );
    recommendations.activities = activities;

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('生成推荐错误:', error);
    res.status(500).json({
      success: false,
      message: '生成推荐失败'
    });
  }
};

// 获取推荐记录
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;

    let query = 'SELECT * FROM recommendations WHERE user_id = ?';
    const params = [userId];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY score DESC, created_at DESC LIMIT 20';

    const [recommendations] = await pool.query(query, params);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('获取推荐记录错误:', error);
    res.status(500).json({
      success: false,
      message: '获取推荐记录失败'
    });
  }
};

module.exports = {
  generateRecommendations,
  getRecommendations
};
