@echo off
echo 初始化数据库...
mysql -uroot -proot < src\database\init.sql
echo 数据库初始化完成！
pause
