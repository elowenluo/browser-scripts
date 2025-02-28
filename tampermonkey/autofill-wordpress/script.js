// ==UserScript==
// @name         Autofill WordPress Content
// @namespace    https://github.com/elowenluo/browser-scripts
// @version      1.2.0
// @description  Fill the content automatically in WordPress.
// @author       Elowen Luo
// @match        https://example.com/wp-admin/post-new.php
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// ==/UserScript==

(async function () {
  "use strict";

  const CONSTANTS = {
    STORAGE_KEY: "lastArticleIndex",
    SELECTORS: {
      TITLE: "#title",
      CONTENT_HTML: "#content-html",
      CONTENT_VISUAL: "#content-tmce",
      CONTENT_AREA: "textarea#content.wp-editor-area",
      SUMMARY: "#excerpt",
      DOWNLOAD_IMAGE: "#content-hacklog_ria",
      ALL_IMAGES_DOWNLOADED: "#all-done",
      RETRY_BUTTON: ".retry",
      IMAGE_LIST: "#image-list",
      IMAGE_LIST_IFRAME: "#TB_iframeContent",
      CLOSE_BUTTON: "#TB_closeWindowButton",
      TAG_INPUT: "#new-tag-post_tag",
      TAG_ADD_BUTTON: ".tagadd",
      CATEGORY_CHECKBOX: 'input[name="post_category[]"]',
      SAVE_DRAFT_BUTTON: "#save-post",
    },
    DELAYS: {
      SHORT: 0.5,
      MEDIUM: 1,
      LONG: 3,
    },
    NEW_POST_URL: "https://example.com/wp-admin/post-new.php",
    MAX_RETRIES: 3,
  };

  const utils = {
    delay: seconds =>
      new Promise(resolve => setTimeout(resolve, seconds * 1000)),

    getElement: selector => document.querySelector(selector),

    getAllElements: selector => document.querySelectorAll(selector),

    async getClipboardData() {
      try {
        const jsonData = await navigator.clipboard.readText();
        return JSON.parse(jsonData);
      } catch (error) {
        console.error("Failed to parse clipboard data:", error);
        throw error;
      }
    },

    findCategoryCheckbox(categoryName) {
      const checkboxes = this.getAllElements(
        CONSTANTS.SELECTORS.CATEGORY_CHECKBOX
      );
      for (const checkbox of checkboxes) {
        const label = checkbox.parentElement;
        if (label && label.textContent.trim() === categoryName.trim()) {
          return checkbox;
        }
      }
      console.warn(`Category not found: ${categoryName}`);
      return null;
    },
  };

  class WordPressAutofill {
    constructor() {
      this.currentIndex = this.getStartIndex();
    }

    getStartIndex() {
      const savedIndex = GM_getValue(CONSTANTS.STORAGE_KEY, "0");
      return parseInt(savedIndex, 10);
    }

    async editTitle(title) {
      const titleElement = utils.getElement(CONSTANTS.SELECTORS.TITLE);
      titleElement.value = title;
      console.log("Title edited successfully!");
      await utils.delay(CONSTANTS.DELAYS.MEDIUM);
    }

    async editContent(content) {
      const htmlButton = utils.getElement(CONSTANTS.SELECTORS.CONTENT_HTML);
      htmlButton.click();

      const contentArea = utils.getElement(CONSTANTS.SELECTORS.CONTENT_AREA);
      contentArea.value = content;
      console.log("Content edited successfully!");
      await utils.delay(CONSTANTS.DELAYS.MEDIUM);
    }

    async editSummary(summary) {
      const summaryElement = utils.getElement(CONSTANTS.SELECTORS.SUMMARY);
      summaryElement.value = summary;
      console.log("Summary edited successfully!");
    }

    async downloadImages() {
      const visualButton = utils.getElement(CONSTANTS.SELECTORS.CONTENT_VISUAL);
      visualButton.click();

      const downloadButton = utils.getElement(
        CONSTANTS.SELECTORS.DOWNLOAD_IMAGE
      );
      downloadButton.click();

      const isSuccess = await this.waitImagesDownloaded();

      if (isSuccess) {
        const closeButton = utils.getElement(CONSTANTS.SELECTORS.CLOSE_BUTTON);
        closeButton.click();

        console.log("Images downloaded successfully!");
      } else {
        console.warn(
          "Failed to download all images after maximum retries. Skipping this article..."
        );
      }

      await utils.delay(CONSTANTS.DELAYS.MEDIUM);
    }

    async editTags(tags) {
      if (!tags) return;

      const tagInput = utils.getElement(CONSTANTS.SELECTORS.TAG_INPUT);
      tagInput.value = tags;

      const addButton = utils.getElement(CONSTANTS.SELECTORS.TAG_ADD_BUTTON);
      addButton.click();

      console.log("Tags added successfully!");
      await utils.delay(CONSTANTS.DELAYS.SHORT);
    }

    async editCategories(categories) {
      if (!Array.isArray(categories) || categories.length === 0) {
        return;
      }

      let categoriesFound = 0;
      for (const category of categories) {
        const checkbox = utils.findCategoryCheckbox(category);
        if (checkbox && !checkbox.checked) {
          checkbox.checked = true;
          categoriesFound++;
        }
      }

      console.log(
        `Categories processed: ${categoriesFound}/${categories.length}`
      );
      await utils.delay(CONSTANTS.DELAYS.SHORT);
    }

    async createNewPage() {
      console.log("Creating a new page...");
      await utils.delay(CONSTANTS.DELAYS.LONG);
      GM_openInTab(CONSTANTS.NEW_POST_URL, { active: true });
    }

    async fillArticle(article) {
      try {
        const { title, content, summary, tags, categories } = article;

        await this.editTitle(title);
        await this.editContent(content);
        await this.editSummary(summary);
        await this.editTags(tags);
        await this.editCategories(categories);
        await this.downloadImages();

        GM_setValue(CONSTANTS.STORAGE_KEY, (this.currentIndex + 1).toString());
        await this.createNewPage();
      } catch (error) {
        console.error("Error in fillArticle:", error);
        throw error;
      }
    }

    async processArticles(articles) {
      if (!Array.isArray(articles) || articles.length === 0) {
        console.warn("No articles to process");
        return;
      }

      if (this.currentIndex >= articles.length) {
        console.log("All articles processed");
        GM_deleteValue(CONSTANTS.STORAGE_KEY);
        return;
      }

      const currentArticle = articles[this.currentIndex];
      await this.fillArticle(currentArticle);
    }

    async waitImagesDownloaded(retryCount = 0) {
      try {
        if (retryCount >= CONSTANTS.MAX_RETRIES) {
          console.warn("Maximum retries reached. Exiting...");
          return false;
        }

        const iframe = utils.getElement(CONSTANTS.SELECTORS.IMAGE_LIST_IFRAME);
        if (!iframe) {
          console.log("Iframe not found, waiting...");
          await utils.delay(CONSTANTS.DELAYS.MEDIUM);
          return await this.waitImagesDownloaded();
        }

        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow.document;

        const imageList = iframeDoc.querySelector(
          CONSTANTS.SELECTORS.IMAGE_LIST
        );
        if (!imageList) {
          console.log("Image list in iframe not found, waiting...");
          await utils.delay(CONSTANTS.DELAYS.MEDIUM);
          return await this.waitImagesDownloaded();
        }

        const noImageMessage = imageList.querySelector("p");
        if (
          noImageMessage?.textContent.includes("No remote images to download")
        ) {
          console.log("No image need to download!");
          return true;
        }

        const allDoneElement = iframeDoc.querySelector(
          CONSTANTS.SELECTORS.ALL_IMAGES_DOWNLOADED
        );
        if (
          allDoneElement &&
          getComputedStyle(allDoneElement).display !== "none"
        ) {
          console.log("All images downloaded successfully!");
          return true;
        }

        const retryButtons = iframeDoc.querySelectorAll(
          CONSTANTS.SELECTORS.RETRY_BUTTON
        );
        if (retryButtons.length > 0) {
          console.log("Retrying image downloads...");
          retryButtons.forEach(button => button.click());
          await utils.delay(CONSTANTS.DELAYS.LONG);
          return await this.waitImagesDownloaded(retryCount + 1);
        }

        console.log("Waiting for images to be downloaded...");
        await utils.delay(CONSTANTS.DELAYS.LONG);
        return await this.waitImagesDownloaded();
      } catch (error) {
        console.error("Error checking download status:", error);
        await utils.delay(CONSTANTS.DELAYS.LONG);
        return await this.waitImagesDownloaded(retryCount + 1);
      }
    }
  }

  async function main() {
    try {
      const articles = await utils.getClipboardData();
      const autofill = new WordPressAutofill();
      await autofill.processArticles(articles);
    } catch (error) {
      console.error("Error in main function:", error);
    }
  }

  await main();
})();
