import scrapy
from LovableCopenhagenScraper.items import VenueItem  # Assuming VenueItem is defined in your items.py
from scrapy_playwright.page import PageMethod
import re
import json


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
        scrapy crawl copenhagen_venue_spider -a start_urls="url1,url2"
    """
    
    name = "copenhagen_venue_spider"
    
    # --- 1. ALLOWED DOMAINS (Updated) ---
    # Add all root domains you intend to scrape here for Scrapy to enforce limits
    allowed_domains = [
        "venuu.com",
        "meetingplannerguide.com",
        "spacebase.com",
        "venuedirectory.com",
        "bellagroup.dk",
        "tivolihotel.com",
        "scandichotels.com",
        "bredgade28.dk",
        "copenhagencatering.dk",
        "hallernes.dk",
        "tapas-bar.dk",
        # Add any other specific venue domains (e.g., "lokomotivvaerkstedet.dk")
    ] 
    
    # Custom settings for this spider (can override project settings)
    custom_settings = {
        'DOWNLOAD_DELAY': 2,  # Politeness: 2 second delay between requests to same domain
        'RANDOMIZE_DOWNLOAD_DELAY': True,
        # Ensure your project's settings.py also has ROBOTSTXT_OBEY = True and a custom USER_AGENT
    }
    
    # --- 2. INITIALIZATION AND START URLS (Updated) ---
    def __init__(self, *args, **kwargs):
        super(CopenhagenVenueSpider, self).__init__(*args, **kwargs)
        
        # Default starting URLs for high-value aggregators/directories
        default_start_urls = [
            "https://venuu.com/dk/en/corporate-event-copenhagen",
            "https://meetingplannerguide.com/venues",
            "https://www.spacebase.com/en/copenhagen/",
            "https://www.venuedirectory.com/meeting-rooms-hire-in/copenhagen/destination/58288",
            "https://www.tivolihotel.com/conferences-meetings-events/meeting-rooms-copenhagen",
            "https://www.scandichotels.com/en/conferences-meetings/copenhagen",
        ]
        
        # Use command line arguments if passed, otherwise use the default list
        if hasattr(self, 'start_urls') and isinstance(self.start_urls, str):
            self.start_urls = [url.strip() for url in self.start_urls.split(',')]
        else:
            self.start_urls = default_start_urls
    
    def start_requests(self):
        """
        Generate initial requests, checking if Playwright (JS rendering) is required.
        """
        for url in self.start_urls:
            # Check if JavaScript rendering is needed using the updated helper
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
    
    # --- 3. JAVASCRIPT CHECKER (Updated) ---
    def _needs_javascript(self, url: str) -> bool:
        """
        Determine if a URL requires JavaScript rendering based on its domain.
        """
        # Domains that are likely to be heavily JS-driven or use dynamic loading
        js_required_domains = [
            "spacebase.com", 
            "venuu.com",     
            "bellagroup.dk", 
        ] 
        return any(domain in url for domain in js_required_domains)
    
    # --- 4. PARSE LISTING PAGE ---
    def parse(self, response):
        """
        Parse the response, looking for venue links first.
        """
        # --- A. Extract individual venue links from the listing page ---
        # Selectors commonly used for listing page links
        venue_links = (
            response.css('a.venue-link::attr(href)').getall() or
            response.css('.listing-item a.title::attr(href)').getall() or
            response.xpath('//a[contains(@href, "/venue/") or contains(@href, "/meetings/")]/@href').getall()
        )
        
        if venue_links:
            for link in set(venue_links): # Use set to remove duplicates
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
            
            # --- B. Handle Pagination ---
            # Look for "Next" or "Load More" buttons/links
            next_page = (
                response.css('a.next-page::attr(href)').get() or
                response.xpath('//a[contains(text(), "Next") or contains(text(), "næste")]/@href').get()
            )
            
            if next_page:
                absolute_next_page_url = response.urljoin(next_page)
                if self._needs_javascript(absolute_next_page_url):
                    yield scrapy.Request(
                        url=absolute_next_page_url,
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
                    yield scrapy.Request(url=absolute_next_page_url, callback=self.parse)

        else:
            # If no links were found, assume the page itself is a single venue detail page and parse it.
            yield from self.parse_venue(response)
    
    # --- 5. PARSE VENUE DETAIL PAGE ---
    def parse_venue(self, response):
        """
        Extract venue data from a single venue page.
        """
        item = VenueItem()
        
        # --- A. Extract Venue Name ---
        item['name'] = (
            response.css('h1.venue-name::text').get() or
            response.css('h1::text').get() or
            response.xpath('//h1[contains(@class, "venue") or contains(@class, "title")]/text()').get() or
            response.css('title::text').get()
        )
        if item['name']:
            item['name'] = item['name'].strip()
        
        # --- B. Extract Full Address ---
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
        
        # Try JSON-LD structured data (often reliable for addresses)
        if not item['address_full']:
            json_ld = response.css('script[type="application/ld+json"]::text').get()
            if json_ld:
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
        
        # --- C. Extract Capacity (min-max) ---
        capacity_text = (
            response.css('.capacity::text').get() or
            response.xpath('//*[contains(text(), "capacity") or contains(text(), "Capacity")]/following-sibling::text()').get() or
            response.xpath('//*[contains(@class, "capacity")]//text()').get()
        )
        item['capacity_min_max'] = None
        if capacity_text:
            capacity_text = capacity_text.replace(',', '').replace('.', '') # Clean numbers
            numbers = re.findall(r'\d+', capacity_text)
            if len(numbers) >= 2:
                item['capacity_min_max'] = f"{numbers[0]} - {numbers[-1]}"
            elif len(numbers) == 1:
                item['capacity_min_max'] = numbers[0]
        
        # --- D. Extract Event Types ---
        event_types = []
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
        
        # Check for common event type keywords in body text (as a fallback)
        event_keywords = ['Conference', 'Gala', 'Dinner', 'Product Launch', 'Seminar', 
                          'Workshop', 'Networking', 'Exhibition', 'Trade Show']
        page_text = ' '.join(response.css('body *::text').getall()).lower()
        for keyword in event_keywords:
            if keyword.lower() in page_text and keyword not in event_types:
                event_types.append(keyword)
        
        item['event_types'] = sorted(list(set(event_types))) if event_types else None
        
        # --- E. Extract In-house A/V Availability ---
        av_text = (
            response.css('.av-equipment::text').get() or
            response.xpath('//*[contains(text(), "A/V") or contains(text(), "audio") or contains(text(), "video") or contains(text(), "projektor")]/text()').get() or
            ''
        ).lower()
        
        # Check for positive indicators (English and Danish)
        av_positive = any(keyword in av_text for keyword in ['yes', 'available', 'included', 'in-house', 'ja', 'medfølger', 'inkluderet'])
        av_negative = any(keyword in av_text for keyword in ['no', 'not available', 'not included', 'nej', 'ekskluderet'])
        
        if av_positive and not av_negative:
            item['in_house_av'] = True
        elif av_negative:
            item['in_house_av'] = False
        else:
            item['in_house_av'] = None 
        
        # --- F. Extract Base Package Price ---
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
        
        # Try to find price in text content (using currency keywords)
        if not item['base_package_price']:
            # Looks for price preceded by "from" or "fra" and followed by currency (DKK, EUR, kr, €)
            price_pattern = r'(?:from|fra|starting|ved)\s*(?:at)?\s*(\d+(?:[.,]\d+)?)\s*(?:DKK|EUR|kr|€|per person|pr\. pers)'
            page_text = ' '.join(response.css('body *::text').getall())
            match = re.search(price_pattern, page_text, re.IGNORECASE)
            if match:
                item['base_package_price'] = f"From {match.group(1)} DKK/EUR (check)" # Need pipeline to clean/standardize
        
        # --- G. Set Source URL ---
        item['url_source'] = response.url
        
        # --- H. Yield Item ---
        # Only yield item if we have at least name and address
        if item['name'] and item['address_full']:
            yield item
        else:
            self.logger.warning(f"Incomplete item extracted from {response.url}: name={item['name']}, address={item['address_full']}")