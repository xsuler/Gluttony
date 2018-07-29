# Gluttony

---------
an Impressive 3D wechat game

## 体验版二维码
![scan to play](https://github.com/xsuler/Gluttony/blob/master/code.jpg?raw=true)

## 游戏的策划和功能
- 游戏世界中存在三种球体：玩家，攻击者（红色），吞噬者（绿色）
- 玩家通过重力感应控制小球移动
- 吞噬者会互相吞噬，较大的吞噬较小的
- 玩家参与吞噬者的吞噬
- 被吞噬后的球体会重新刷新大小和位置，继续参与游戏世界的吞噬
- 攻击者与玩家，吞噬者产生碰撞，不参与吞噬
## 技术实现方案以及重点与难点
###   外部库引用
- 3D采用three.js绘制
- 物理引擎采用oimo.js
- 过渡效果采用tween.js
### 重点
- 重力感应控制小球移动（对小球施加某个方向的力）
- 吞噬者的吞噬效果，包括mesh大小的改变，物理世界body大小的改变，位置和大小的刷新
### 难点
- 重力感应控制小球移动中力的方向的计算以及大小的调整
- 摄像机的追随，旋转，移动和缓冲过渡效果
- 画面流畅度的改善
- 使用用three.js, oimo.js, tween.js 中间遇到的各种坑
## 游戏测试
各项功能完好，测试通过
## 亮点
- 重力感应控制
- 画面流畅，沉浸感强
## 感想
- 开始用Laya，但是Laya没有3D的物理引擎，和其他物理引擎存在兼容问题，于是选择使用three.js。
- 本来想做网络游戏，无奈网络同步实现困难，特别是在物理引擎下，尝试网络同步效果极差。

# 作者信息
- 苏乐
- 2016, School of Software, Tsinghua University
- phone: 18801005159
- email: aeonsule@gmail.com