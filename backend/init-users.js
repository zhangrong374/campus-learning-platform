const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function initUsers() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'root',
      database: 'campus_learning_platform'
    });

    console.log('✅ 数据库连接成功\n');

    // 删除现有测试用户（如果有）
    await connection.query('DELETE FROM users WHERE username IN (?, ?)', ['admin', 'student1']);
    console.log('🗑️ 清理旧测试用户');

    // 创建管理员账号
    console.log('\n➕ 创建管理员账号...');
    try {
      const adminPassword = await bcrypt.hash('123456', 10);
      await connection.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['admin', 'admin@school.edu', adminPassword, 'admin']
      );
      console.log('✅ 管理员账号: admin / 123456');
    } catch (e) {
      console.log('⏭️ 管理员账号已存在');
    }

    // 创建学生账号
    console.log('\n➕ 创建学生账号...');
    try {
      const studentPassword = await bcrypt.hash('123456', 10);
      const [result] = await connection.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['student1', 'student1@school.edu', studentPassword, 'student']
      );
      const userId = result.insertId;

      // 创建学生资料
      await connection.query(
        `INSERT INTO student_profiles (user_id, major, grade, interests, goal_type, target_position, description)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, '计算机科学', '2024', '编程,AI,数据分析', 'job', '软件工程师', '热爱编程和AI技术']
      );
      console.log('✅ 学生账号: student1 / 123456');
    } catch (e) {
      console.log('⏭️ 学生账号已存在');
    }

    // 创建更多测试学生
    const students = [
      { username: 'student2', email: 'student2@school.edu', major: '数学', grade: '2023' },
      { username: 'student3', email: 'student3@school.edu', major: '物理', grade: '2024' }
    ];

    for (const student of students) {
      try {
        // 检查用户是否已存在
        const [existing] = await connection.query(
          'SELECT id FROM users WHERE username = ?',
          [student.username]
        );

        if (existing.length > 0) {
          console.log(`⏭️ 跳过已存在的用户: ${student.username}`);
          continue;
        }

        const hashedPassword = await bcrypt.hash('123456', 10);
        const [res] = await connection.query(
          'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
          [student.username, student.email, hashedPassword, 'student']
        );

        await connection.query(
          'INSERT INTO student_profiles (user_id, major, grade) VALUES (?, ?, ?)',
          [res.insertId, student.major, student.grade]
        );
        console.log(`✅ 学生账号: ${student.username} / 123456`);
      } catch (e) {
        console.log(`⏭️ 跳过: ${student.username} (已存在)`);
      }
    }

    // 显示所有用户
    const [users] = await connection.query('SELECT id, username, email, role FROM users');
    console.log('\n📋 所有用户:');
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.role}) - ${user.email}`);
    });

    await connection.end();
    console.log('\n✅ 用户初始化完成！');
  } catch (error) {
    console.error('❌ 错误:', error.message);
    // 不退出程序，继续执行
  }
}

initUsers();
