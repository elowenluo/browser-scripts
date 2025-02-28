# Autofill Wordpress

[English](README.md) | 简体中文

用于自动填写 WordPress 后台表单的实用脚本，提升内容管理效率。

## 主要功能

- 批量导入文章数据
- 自动填写标题、文章内容、总结、标签
- 自动选择所给分类
- 自动下载图片

## 安装使用

### 安装步骤

1. 将脚本代码复制并粘贴到油猴插件的 Dashboard 中

2. 配置你的 WordPress 站点地址：

   ```javascript
   // @match        https://www.example.com/post-new.php
   ```

   ```javascript
   NEW_POST_URL: "https://www.example.com/post-new.php",
   ```

3. 点击保存或按 `Ctrl + S` 保存配置

### 使用方法

1. 准备符合以下格式的文章数据：

   ```json
   [
     {
       "title": "文章标题",
       "content": "文章正文内容",
       "summary": "文章摘要",
       "tags": "文章标签",
       "categories": ["分类1", "分类2"]
     }
   ]
   ```

2. 访问你配置的 WordPress 新建文章页面（如 https://www.example.com/post-new.php）

3. 脚本将自动处理并填写文章内容

> 提示：文章数据格式基于 [article-processor](https://github.com/elowenluo/article-processor) 项目规范

## TODO

- [ ] README 新增配置项描述
