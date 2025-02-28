# Autofill Wordpress

English | [简体中文](README-zh_CN.md)

A utility script that automates form filling in the WordPress admin dashboard, enhancing content management efficiency.

## Main Features

- Bulk article data import
- Automatic filling of titles, content, summaries, and tags
- Automatic category selection from provided options
- Automatic download of article images

## Installation and Usage

### Installation Steps

1. Copy and paste the script into Tampermonkey's dashboard

2. Configure your WordPress site address

   ```javascript
   // @match        https://www.example.com/post-new.php
   ```

   ```javascript
   NEW_POST_URL: "https://www.example.com/post-new.php",
   ```

3. Click Save or press `Ctrl + S` to save the configuration

### Usage Instructions

1. Prepare article data in the following format：

   ```json
   [
     {
       "title": "Article Title",
       "content": "Article Content",
       "summary": "Article Summary",
       "tags": "Article Tags",
       "categories": ["Category1", "Category2"]
     }
   ]
   ```

2. Navigate to your WordPress new post page (e.g., https://www.example.com/post-new.php)

3. The script will automatically process and populate the article content

> Note: The article data format follows the [article-processor](https://github.com/elowenluo/article-processor) project specification

## TODO

- [ ] Add configuration options description to README
