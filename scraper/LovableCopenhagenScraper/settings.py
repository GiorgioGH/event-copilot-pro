# Scrapy settings for LovableCopenhagenScraper project
#
# For simplicity, this file contains only settings considered important or
# commonly used. You can find more settings consulting the documentation:
#
#     https://docs.scrapy.org/en/latest/topics/settings.html
#     https://docs.scrapy.org/en/latest/topics/downloader-middleware.html
#     https://docs.scrapy.org/en/latest/topics/spider-middleware.html

BOT_NAME = "LovableCopenhagenScraper"

SPIDER_MODULES = ["LovableCopenhagenScraper.spiders"]
NEWSPIDER_MODULE = "LovableCopenhagenScraper.spiders"

# ============================================================================
# ETHICAL AND POLITENESS RULES - NON-NEGOTIABLE
# ============================================================================

# Obey robots.txt rules
ROBOTSTXT_OBEY = True

# Custom USER_AGENT to identify the scraper
# Replace [Your Contact Email/URL] with your actual contact information
USER_AGENT = "LovableCopenhagenScraper/1.0 (+https://github.com/yourusername/event-copilot-pro)"

# Minimum delay between requests (in seconds)
# Set to >= 2 seconds as required
DOWNLOAD_DELAY = 2

# Randomize download delay between 0.5 * DOWNLOAD_DELAY and 1.5 * DOWNLOAD_DELAY
RANDOMIZE_DOWNLOAD_DELAY = True

# Enable the AutoThrottle extension for adaptive speed control
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 1
AUTOTHROTTLE_MAX_DELAY = 10
AUTOTHROTTLE_TARGET_CONCURRENCY = 1.0
AUTOTHROTTLE_DEBUG = False

# Limit concurrent requests per domain to <= 4
CONCURRENT_REQUESTS_PER_DOMAIN = 4
CONCURRENT_REQUESTS = 16

# ============================================================================
# PERFORMANCE AND PIPELINE SETTINGS
# ============================================================================

# Configure pipelines
ITEM_PIPELINES = {
    "LovableCopenhagenScraper.pipelines.ValidationPipeline": 300,
    "LovableCopenhagenScraper.pipelines.CleaningPipeline": 400,
    "LovableCopenhagenScraper.pipelines.StoragePipeline": 500,
}

# Enable and configure the AutoThrottle extension (disabled by default)
# See https://docs.scrapy.org/en/latest/topics/autothrottle.html
# AUTOTHROTTLE_ENABLED = True
# The initial download delay
# AUTOTHROTTLE_START_DELAY = 1
# The maximum download delay to be set in case of high latencies
# AUTOTHROTTLE_MAX_DELAY = 10
# The average number of requests Scrapy should be sending in parallel to
# each remote server
# AUTOTHROTTLE_TARGET_CONCURRENCY = 1.0
# Enable showing throttling stats for every response received:
# AUTOTHROTTLE_DEBUG = False

# Enable and configure HTTP caching (disabled by default)
# See https://docs.scrapy.org/en/latest/topics/downloader-middleware.html#httpcache-middleware-settings
# HTTPCACHE_ENABLED = True
# HTTPCACHE_EXPIRATION_SECS = 0
# HTTPCACHE_DIR = "httpcache"
# HTTPCACHE_IGNORE_HTTP_CODES = []
# HTTPCACHE_STORAGE = "scrapy.extensions.httpcache.FilesystemCacheStorage"

# Set settings whose default value is deprecated to a future-proof value
REQUEST_FINGERPRINTER_IMPLEMENTATION = "2.7"
TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor"
FEED_EXPORT_ENCODING = "utf-8"

# ============================================================================
# JAVASCRIPT RENDERING (Playwright/Selenium Integration)
# ============================================================================

# Uncomment and configure if using scrapy-playwright
# DOWNLOAD_HANDLERS = {
#     "http": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
#     "https": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
# }
# PLAYWRIGHT_BROWSER_TYPE = "chromium"
# PLAYWRIGHT_LAUNCH_OPTIONS = {
#     "headless": True,
# }

# ============================================================================
# LOGGING
# ============================================================================

LOG_LEVEL = "INFO"
# LOG_FILE = "scrapy.log"  # Uncomment to log to file

