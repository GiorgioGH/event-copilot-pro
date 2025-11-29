import scrapy
from LovableCopenhagenScraper.items import VenueItem
from scrapy_playwright.page import PageMethod
import re


class CopenhagenVenueSpider(scrapy.Spider):
    """
    Spider to scrape venue data for corporate event planning in Copenhagen Metropolitan Area.
    
    This spider extracts:
    - Venue name
    - Full address
    - Capacity range
    - Supported event types
    - In-house A/V availability
    - Base package pricing
    - Source URL
    
    Usage:
        scrapy crawl copenhagen_venue_spider -a start_urls="https://example.com/venues"
    """
    
    name = "copenhagen_venue_spider"
    allowed_domains = []  # Add allowed domains here, e.g., ["venuewebsite.dk", "anothervenue.dk"]
    
    # Custom settings for this spider (can override project settings)
    custom_settings = {
        'DOWNLOAD_DELAY': 2,
        'RANDOMIZE_DOWNLOAD_DELAY': True,
    }
    
    def __init__(self, *args, **kwargs):
        super(CopenhagenVenueSpider, self).__init__(*args, **kwargs)
        # You can pass start URLs via command line: -a start_urls="url1,url2"
        if hasattr(self, 'start_urls') and isinstance(self.start_urls, str):
            self.start_urls = [url.strip() for url in self.start_urls.split(',')]
    
    def start_requests(self):
        """
        Generate initial requests. Override this method to customize start URLs.
        """
        # Example start URLs - replace with actual venue listing pages
        start_urls = getattr(self, 'start_urls', [
            # Add your actual venue listing URLs here
            # "https://example-venue-site.dk/venues",
            # "https://another-venue-site.dk/listings",
        ])
        
        for url in start_urls:
            # Check if JavaScript rendering is needed
            if self._needs_javascript(url):
                yield scrapy.Request(
                    url=url,
                    callback=self.parse,
                    meta={
                        'playwright': True,
                        'playwright_page_methods': [
                            PageMethod('wait_for_selector', 'body', timeout=10000),
                            PageMethod('wait_for_load_state', 'networkidle'),
                        ],
                    }
                )
            else:
                yield scrapy.Request(url=url, callback=self.parse)
    
    def _needs_javascript(self, url: str) -> bool:
        """
        Determine if a URL requires JavaScript rendering.
        Override this method based on your target websites.
        """
        # Add logic to determine if JavaScript is needed
        # For example, check domain or URL pattern
        js_required_domains = []  # Add domains that require JS, e.g., ["spa-venue.dk"]
        return any(domain in url for domain in js_required_domains)
    
    def parse(self, response):
        """
        Parse the response and extract venue data.
        This is a template - customize selectors based on target websites.
        """
        # If this is a listing page, extract individual venue URLs
        venue_links = response.css('a.venue-link::attr(href)').getall()
        if venue_links:
            for link in venue_links:
                absolute_url = response.urljoin(link)
                if self._needs_javascript(absolute_url):
                    yield scrapy.Request(
                        url=absolute_url,
                        callback=self.parse_venue,
                        meta={
                            'playwright': True,
                            'playwright_page_methods': [
                                PageMethod('wait_for_selector', 'body', timeout=10000),
                                PageMethod('wait_for_load_state', 'networkidle'),
                            ],
                        }
                    )
                else:
                    yield scrapy.Request(url=absolute_url, callback=self.parse_venue)
            return
        
        # If this is a single venue page, parse it directly
        yield from self.parse_venue(response)
    
    def parse_venue(self, response):
        """
        Extract venue data from a single venue page.
        Customize CSS selectors and XPath expressions based on target website structure.
        """
        item = VenueItem()
        
        # Extract venue name
        # Customize selector based on website structure
        item['name'] = (
            response.css('h1.venue-name::text').get() or
            response.css('h1::text').get() or
            response.xpath('//h1[contains(@class, "venue") or contains(@class, "title")]/text()').get() or
            response.css('title::text').get()
        )
        
        # Extract full address
        # Look for address in various common locations
        address_selectors = [
            'div.address::text',
            'span.address::text',
            '[itemprop="address"]::text',
            '.venue-address::text',
            'address::text',
        ]
        item['address_full'] = None
        for selector in address_selectors:
            address = response.css(selector).get()
            if address:
                item['address_full'] = address.strip()
                break
        
        # If not found, try to extract from structured data or meta tags
        if not item['address_full']:
            # Try JSON-LD structured data
            json_ld = response.css('script[type="application/ld+json"]::text').get()
            if json_ld:
                import json
                try:
                    data = json.loads(json_ld)
                    if isinstance(data, dict) and 'address' in data:
                        addr = data['address']
                        if isinstance(addr, dict):
                            item['address_full'] = ', '.join([
                                addr.get('streetAddress', ''),
                                addr.get('addressLocality', ''),
                                addr.get('postalCode', ''),
                                addr.get('addressCountry', '')
                            ]).strip(', ')
                except json.JSONDecodeError:
                    pass
        
        # Extract capacity (min-max)
        capacity_text = (
            response.css('.capacity::text').get() or
            response.xpath('//*[contains(text(), "capacity") or contains(text(), "Capacity")]/following-sibling::text()').get() or
            response.xpath('//*[contains(@class, "capacity")]//text()').get()
        )
        if capacity_text:
            # Extract numbers from capacity text
            numbers = re.findall(r'\d+', capacity_text)
            if len(numbers) >= 2:
                item['capacity_min_max'] = f"{numbers[0]} - {numbers[-1]}"
            elif len(numbers) == 1:
                item['capacity_min_max'] = numbers[0]
        
        # Extract event types
        event_types = []
        # Look for event type lists or tags
        event_type_selectors = [
            '.event-types li::text',
            '.event-types span::text',
            '[data-event-type]::text',
            '.tags::text',
        ]
        for selector in event_type_selectors:
            types = response.css(selector).getall()
            if types:
                event_types.extend([t.strip() for t in types if t.strip()])
        
        # Also check for common event type keywords in text
        event_keywords = ['Conference', 'Gala', 'Dinner', 'Product Launch', 'Seminar', 
                         'Workshop', 'Networking', 'Exhibition', 'Trade Show']
        page_text = ' '.join(response.css('body *::text').getall()).lower()
        for keyword in event_keywords:
            if keyword.lower() in page_text and keyword not in event_types:
                event_types.append(keyword)
        
        item['event_types'] = event_types if event_types else None
        
        # Extract in-house A/V availability
        av_text = (
            response.css('.av-equipment::text').get() or
            response.xpath('//*[contains(text(), "A/V") or contains(text(), "audio") or contains(text(), "video")]/text()').get() or
            ''
        ).lower()
        
        # Check for positive indicators
        av_positive = any(keyword in av_text for keyword in ['yes', 'available', 'included', 'in-house', 'ja'])
        av_negative = any(keyword in av_text for keyword in ['no', 'not available', 'not included', 'nej'])
        
        if av_positive and not av_negative:
            item['in_house_av'] = True
        elif av_negative:
            item['in_house_av'] = False
        else:
            item['in_house_av'] = None  # Unknown
        
        # Extract base package price
        price_selectors = [
            '.price::text',
            '.package-price::text',
            '[itemprop="price"]::text',
            '.starting-price::text',
            'span.price::text',
        ]
        item['base_package_price'] = None
        for selector in price_selectors:
            price = response.css(selector).get()
            if price:
                item['base_package_price'] = price.strip()
                break
        
        # Try to find price in text content
        if not item['base_package_price']:
            price_pattern = r'(?:from|fra|starting|fra)\s*(?:at|ved)?\s*(\d+(?:[.,]\d+)?)\s*(?:DKK|EUR|kr|€)'
            page_text = ' '.join(response.css('body *::text').getall())
            match = re.search(price_pattern, page_text, re.IGNORECASE)
            if match:
                item['base_package_price'] = f"From {match.group(1)} DKK"
        
        # Set source URL
        item['url_source'] = response.url
        
        # Only yield item if we have at least name and address
        if item['name'] and item['address_full']:
            yield item
        else:
            self.logger.warning(f"Incomplete item extracted from {response.url}: name={item['name']}, address={item['address_full']}")

