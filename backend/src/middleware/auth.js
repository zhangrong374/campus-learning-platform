const jwt = require('jsonwebtoken');

// JWT认证中间件
const auth = (req, res, next) => {
  try {
    // 从请求头获取token
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: '未提供认证令牌' 
      });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: '认证令牌无效' 
    });
  }
};

// 管理员权限中间件
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'school') {
    return res.status(403).json({ 
      success: false, 
      message: '需要管理员权限' 
    });
  }
  next();
};

module.exports = { auth, adminAuth };
