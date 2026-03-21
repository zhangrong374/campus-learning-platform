const mysql = require('mysql2/promise');

async function initData() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'root',
      database: 'campus_learning_platform'
    });

    console.log('✅ 数据库连接成功\n');

    // 清理旧数据
    await connection.query('DELETE FROM course_progress');
    await connection.query('DELETE FROM activity_participants');
    await connection.query('DELETE FROM club_members');
    await connection.query('DELETE FROM posts');
    await connection.query('DELETE FROM schedule');
    await connection.query('DELETE FROM recommendations');
    await connection.query('DELETE FROM activities');
    await connection.query('DELETE FROM clubs');
    await connection.query('DELETE FROM courses');
    console.log('🗑️ 清理旧数据完成\n');

    // 插入课程数据
    console.log('📚 插入课程数据...');
    const courses = [
      { course_code: 'CS101', name: '数据结构与算法', category: '计算机科学', level: '基础', description: '学习基础数据结构和算法', duration: 40 },
      { course_code: 'AI101', name: '人工智能导论', category: '人工智能', level: '中级', description: 'AI基础概念和应用', duration: 35 },
      { course_code: 'AI201', name: '机器学习实战', category: '人工智能', level: '高级', description: '机器学习算法实战', duration: 50 },
      { course_code: 'WEB101', name: 'Web开发基础', category: '编程', level: '基础', description: 'HTML/CSS/JavaScript基础', duration: 30 },
      { course_code: 'DB101', name: '数据库原理', category: '计算机科学', level: '中级', description: '关系型数据库设计', duration: 25 },
      { course_code: 'PY101', name: 'Python编程', category: '编程', level: '基础', description: 'Python语言基础', duration: 20 },
      { course_code: 'AI301', name: '深度学习', category: '人工智能', level: '高级', description: '神经网络和深度学习', duration: 45 },
      { course_code: 'DA101', name: '数据分析', category: '数据分析', level: '中级', description: 'Python数据分析', duration: 30 }
    ];

    for (const course of courses) {
      await connection.query(
        'INSERT INTO courses (course_code, course_name, name, category, level, description, duration) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [course.course_code, course.name, course.name, course.category, course.level, course.description, course.duration]
      );
    }
    console.log(`✅ 已插入 ${courses.length} 门课程`);

    // 插入社团数据
    console.log('\n🎯 插入社团数据...');
    const clubs = [
      { name: 'ACM编程社', category: '技术', description: '算法竞赛和编程交流', member_count: 120 },
      { name: 'AI研究社', category: '技术', description: '人工智能研究与实践', member_count: 85 },
      { name: '数据分析社', category: '学术', description: '数据分析技能提升', member_count: 95 },
      { name: '摄影协会', category: '兴趣', description: '摄影艺术交流', member_count: 200 },
      { name: '音乐社', category: '兴趣', description: '音乐爱好者的家园', member_count: 150 },
      { name: '创业俱乐部', category: '职业', description: '创业实践与交流', member_count: 75 },
      { name: '英语角', category: '学术', description: '英语学习和交流', member_count: 180 }
    ];

    for (const club of clubs) {
      await connection.query(
        'INSERT INTO clubs (name, category, description, member_count) VALUES (?, ?, ?, ?)',
        [club.name, club.category, club.description, club.member_count]
      );
    }
    console.log(`✅ 已插入 ${clubs.length} 个社团`);

    // 插入活动数据
    console.log('\n🎉 插入活动数据...');
    const activities = [
      { title: '算法竞赛训练营', type: '学习', location: '计算机楼201', start_time: '2024-04-15 09:00:00', end_time: '2024-04-15 17:00:00', max_participants: 50, status: 'published' },
      { title: 'AI技术分享会', type: '学习', location: '报告厅', start_time: '2024-04-16 14:00:00', end_time: '2024-04-16 16:00:00', max_participants: 100, status: 'published' },
      { title: '春季校园马拉松', type: '运动', location: '体育场', start_time: '2024-04-20 08:00:00', end_time: '2024-04-20 12:00:00', max_participants: 300, status: 'published' },
      { title: '创业讲座', type: '职业', location: '学术报告厅', start_time: '2024-04-18 19:00:00', end_time: '2024-04-18 21:00:00', max_participants: 150, status: 'published' },
      { title: '编程黑客马拉松', type: '学习', location: '创新中心', start_time: '2024-04-25 09:00:00', end_time: '2024-04-26 18:00:00', max_participants: 80, status: 'published' },
      { title: '摄影作品展览', type: '兴趣', location: '艺术中心', start_time: '2024-04-22 10:00:00', end_time: '2024-04-22 18:00:00', max_participants: 200, status: 'published' }
    ];

    for (const activity of activities) {
      await connection.query(
        'INSERT INTO activities (title, type, location, start_time, end_time, max_participants, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [activity.title, activity.type, activity.location, activity.start_time, activity.end_time, activity.max_participants, activity.status]
      );
    }
    console.log(`✅ 已插入 ${activities.length} 个活动`);

    // 插入帖子数据
    console.log('\n💬 插入帖子数据...');
    const [users] = await connection.query('SELECT id, username FROM users LIMIT 3');
    const posts = [
      { user_id: users[0]?.id || 2, title: '分享一下学习AI的心得', content: '最近在学习深度学习，有很多收获，想和大家分享一下...', category: '学习' },
      { user_id: users[1]?.id || 3, title: '求推荐算法学习资源', content: '想系统学习数据结构和算法，有什么好的教材推荐吗？', category: '问答' },
      { user_id: users[2]?.id || 4, title: '社团招新啦！', content: 'ACM编程社开始招新了，欢迎热爱编程的同学加入！', category: '活动' },
      { user_id: users[0]?.id || 2, title: '考研数学复习经验', content: '分享一下我考研数学的复习经验...', category: '考研' },
      { user_id: users[1]?.id || 3, title: '推荐一本好书', content: '最近读了《深入理解计算机系统》，非常推荐！', category: '推荐' }
    ];

    for (const post of posts) {
      await connection.query(
        'INSERT INTO posts (user_id, title, content, category) VALUES (?, ?, ?, ?)',
        [post.user_id, post.title, post.content, post.category]
      );
    }
    console.log(`✅ 已插入 ${posts.length} 个帖子`);

    // 添加一些推荐数据
    console.log('\n⭐ 插入推荐数据...');
    const [allCourses] = await connection.query('SELECT id FROM courses LIMIT 5');
    const [allClubs] = await connection.query('SELECT id FROM clubs LIMIT 5');

    // 获取实际存在的用户ID
    const [realUsers] = await connection.query('SELECT id FROM users LIMIT 1');
    const userId = realUsers[0]?.id || 2;

    for (const course of allCourses) {
      await connection.query(
        'INSERT INTO recommendations (user_id, type, item_id, score, reason) VALUES (?, ?, ?, ?, ?)',
        [userId, 'course', course.id, 85 + Math.random() * 10, '根据您的学习兴趣推荐']
      );
    }

    for (const club of allClubs) {
      await connection.query(
        'INSERT INTO recommendations (user_id, type, item_id, score, reason) VALUES (?, ?, ?, ?, ?)',
        [userId, 'club', club.id, 80 + Math.random() * 10, '根据您的兴趣推荐']
      );
    }
    console.log('✅ 已插入推荐数据');

    await connection.end();
    console.log('\n✅ 数据初始化完成！');
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

initData();
