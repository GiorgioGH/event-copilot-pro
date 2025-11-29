# LovableCopenhagenScraper

A comprehensive Scrapy-based web scraping project for collecting detailed event planning vendor data in the Copenhagen Metropolitan Area, Denmark.

## Project Overview

This scraper collects comprehensive data for all event planning vendors:

**Venues** - Expanded fields including:
- Names, addresses, descriptions
- Capacity ranges, number of rooms
- Event types, amenities
- In-house A/V, parking, WiFi, accessibility
- Pricing, contact info, images, ratings

**Catering Services** - Cuisine types, service types, dietary options, pricing

**Transportation** - Vehicle types, capacity, service area, pricing

**Activities & Entertainment** - Activity types, participant limits, duration, pricing

**AV Equipment Rental** - Equipment types, delivery/setup services, pricing

## Ethical Scraping Practices

This project follows strict ethical scraping guidelines:
- ✅ Respects `robots.txt` rules
- ✅ Uses identifiable User-Agent
- ✅ Implements minimum 2-second delays between requests
- ✅ Randomizes download delays
- ✅ Uses adaptive throttling
- ✅ Limits concurrent requests per domain (≤4)
- ✅ Avoids collecting Personal Identifiable Information (PII)

## Installation

1. **Install Python dependencies:**
   ```bash
   cd scraper
   pip install -r requirements.txt
   ```

2. **Install Playwright browsers (for JavaScript rendering):**
   ```bash
   playwright install chromium
   ```

3. **Verify Scrapy installation:**
   ```bash
   scrapy version
   ```

## Project Structure

```
scraper/
├── LovableCopenhagenScraper/
│   ├── __init__.py
│   ├── items.py              # VenueItem class definition
│   ├── middlewares.py        # Custom middleware (if needed)
│   ├── pipelines.py          # Validation, cleaning, and storage pipelines
│   ├── settings.py            # Scrapy settings with ethical rules
│   └── spiders/
│       ├── __init__.py
│       └── copenhagen_venue_spider.py  # Main spider
├── requirements.txt
└── README.md
```

## Usage

### Basic Usage

The spider is pre-configured with comprehensive start URLs for all vendor types. Just run it!

1. **Run the comprehensive spider:**
   ```bash
   cd scraper
   scrapy crawl copenhagen_event_vendor_spider
   ```

   This will scrape:
   - **Venues** (with expanded fields: description, amenities, images, contact info, ratings, etc.)
   - **Catering services**
   - **Transportation services**
   - **Activities & Entertainment**
   - **AV Equipment rental**

2. **Output:**
   All scraped data is automatically saved to `scraper/data/vendors.json` when the spider finishes.

3. **Optional: Save additional output:**
   ```bash
   scrapy crawl copenhagen_event_vendor_spider -o additional_output.json
   ```

### Advanced Usage

**Pass start URLs via command line:**
```bash
scrapy crawl copenhagen_venue_spider -a start_urls="https://venue-site1.dk,https://venue-site2.dk"
```

**Enable JavaScript rendering for specific sites:**
Edit the `_needs_javascript()` method in the spider to return `True` for sites requiring JavaScript.

**Configure database storage:**
1. Edit `LovableCopenhagenScraper/pipelines.py`
2. Uncomment and configure either PostgreSQL or MongoDB connection in `StoragePipeline.open_spider()`
3. Ensure database credentials are set securely (use environment variables)

## Configuration

### Settings (`settings.py`)

Key settings already configured:
- `ROBOTSTXT_OBEY = True` - Respects robots.txt
- `DOWNLOAD_DELAY = 2` - Minimum 2-second delay
- `RANDOMIZE_DOWNLOAD_DELAY = True` - Randomizes delays
- `AUTOTHROTTLE_ENABLED = True` - Adaptive speed control
- `CONCURRENT_REQUESTS_PER_DOMAIN = 4` - Limits concurrent requests

### Customizing Selectors

The spider uses CSS selectors and XPath. Customize in `parse_venue()` method:

```python
# Example: Extract venue name
item['name'] = response.css('h1.venue-name::text').get()

# Example: Extract address
item['address_full'] = response.css('div.address::text').get()
```

## Data Pipeline

The project includes three pipelines:

1. **ValidationPipeline** - Ensures required fields (name, address) are present
2. **CleaningPipeline** - Standardizes prices, converts booleans, formats data
3. **StoragePipeline** - Stores data to database (PostgreSQL/MongoDB) - configure as needed

## Output Format

The scraper collects data for all vendor types. Each item includes a `vendor_type` field:

**Venue items** include:
```json
{
  "vendor_type": "venue",
  "name": "Venue Name",
  "address_full": "Street Address, Copenhagen, Denmark",
  "description": "Full description...",
  "capacity_min_max": "100 - 300",
  "number_of_rooms": "5",
  "event_types": ["Conference", "Gala Dinner", "Product Launch"],
  "amenities": ["WiFi", "Parking", "Catering"],
  "in_house_av": true,
  "parking_available": true,
  "wifi_available": true,
  "accessibility": "Wheelchair accessible",
  "base_package_price": "From 5000 DKK",
  "phone": "+45 12 34 56 78",
  "email": "contact@venue.dk",
  "images": ["https://..."],
  "rating": 4.5,
  "url_source": "https://venue-website.dk/venue-page"
}
```

**Catering items** include: `name`, `address_full`, `cuisine_types`, `service_types`, `dietary_options`, `price_per_person`, etc.

**Transport items** include: `name`, `vehicle_types`, `price_per_hour`, `service_area`, etc.

**Activities items** include: `name`, `activity_types`, `min_participants`, `max_participants`, `duration`, etc.

**AV Equipment items** include: `name`, `equipment_types`, `delivery_available`, `setup_service`, etc.

## JavaScript Rendering

For websites that load content dynamically with JavaScript:

1. The spider supports Playwright integration via `scrapy-playwright`
2. Add domains requiring JS to `js_required_domains` in the spider
3. Requests will automatically use Playwright for rendering

## Database Integration

### PostgreSQL Setup

1. Create a table:
```sql
CREATE TABLE venues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address_full TEXT NOT NULL,
    capacity_min_max VARCHAR(50),
    event_types TEXT[],
    in_house_av BOOLEAN,
    base_package_price VARCHAR(100),
    url_source TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

2. Configure connection in `pipelines.py`

### MongoDB Setup

1. Configure connection in `pipelines.py`
2. Data will be stored in `event_copilot.venues` collection

## Troubleshooting

**Issue: Selectors not finding data**
- Use browser DevTools to inspect page structure
- Test selectors in Scrapy shell: `scrapy shell "https://venue-url.dk"`
- Check if JavaScript rendering is needed

**Issue: Rate limiting or blocking**
- Increase `DOWNLOAD_DELAY` in settings
- Reduce `CONCURRENT_REQUESTS_PER_DOMAIN`
- Verify `ROBOTSTXT_OBEY` is respected

**Issue: Missing data fields**
- Check validation pipeline logs
- Ensure selectors match website structure
- Some fields may be optional (check item definition)

## Legal and Ethical Considerations

- Always respect website Terms of Service
- Only scrape publicly available data
- Do not collect personal information
- Use scraped data responsibly
- Consider reaching out to website owners for API access when available

## License

This project is part of the Event Copilot Pro application.

## Support

For issues or questions, please refer to the main project documentation or create an issue in the repository.

