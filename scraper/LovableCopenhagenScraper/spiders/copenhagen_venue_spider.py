import scrapy
from LovableCopenhagenScraper.items import (
    VenueItem, CateringItem, TransportItem, ActivitiesItem, AVEquipmentItem
)
from scrapy_playwright.page import PageMethod
import re
import json


class CopenhagenEventVendorSpider(scrapy.Spider):
    """
    Comprehensive spider to scrape all event planning vendor data in Copenhagen Metropolitan Area.
    
    Scrapes:
    - Venues (with expanded fields)
    - Catering services
    - Transportation
    - Activities & Entertainment
    - AV Equipment rental
    
    Usage:
        scrapy crawl copenhagen_event_vendor_spider
    """
    
    name = "copenhagen_event_vendor_spider"
    
    # Allowed domains - comprehensive list
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
        "copenhagen.dk",
        "visitcopenhagen.com",
        "tripadvisor.com",
        "yelp.com",
        "google.com",
        "facebook.com",
        "linkedin.com",
        "catering.dk",
        "eventyr.dk",
        "teambuilding.dk",
        "av-rental.dk",
        "soundlight.dk",
    ]
    
    custom_settings = {
        'DOWNLOAD_DELAY': 2,
        'RANDOMIZE_DOWNLOAD_DELAY': True,
    }
    
    def __init__(self, *args, **kwargs):
        super(CopenhagenEventVendorSpider, self).__init__(*args, **kwargs)
        
        # Comprehensive start URLs for all vendor types
        default_start_urls = [
            # Venues
            "https://venuu.com/dk/en/corporate-event-copenhagen",
            "https://meetingplannerguide.com/venues",
            "https://www.spacebase.com/en/copenhagen/",
            "https://www.venuedirectory.com/meeting-rooms-hire-in/copenhagen/destination/58288",
            "https://www.tivolihotel.com/conferences-meetings-events/meeting-rooms-copenhagen",
            "https://www.scandichotels.com/en/conferences-meetings/copenhagen",
            "https://www.bellagroup.dk/en/venues",
            "https://www.bredgade28.dk",
            "https://www.hallernes.dk",
            
            # Catering
            "https://www.copenhagencatering.dk",
            "https://www.tapas-bar.dk",
            "https://www.catering.dk/copenhagen",
            
            # Activities & Team Building
            "https://www.eventyr.dk/copenhagen",
            "https://www.teambuilding.dk",
            
            # AV Equipment
            "https://www.soundlight.dk",
            "https://www.av-rental.dk/copenhagen",
        ]
        
        if hasattr(self, 'start_urls') and isinstance(self.start_urls, str):
            self.start_urls = [url.strip() for url in self.start_urls.split(',')]
        else:
            self.start_urls = default_start_urls
    
    def start_requests(self):
        """Generate initial requests with JS rendering check."""
        for url in self.start_urls:
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
        """Determine if URL requires JavaScript rendering."""
        js_required_domains = [
            "spacebase.com",
            "venuu.com",
            "bellagroup.dk",
            "eventyr.dk",
        ]
        return any(domain in url for domain in js_required_domains)
    
    def _detect_vendor_type(self, url: str, response) -> str:
        """Detect vendor type from URL or page content."""
        url_lower = url.lower()
        page_text = ' '.join(response.css('body *::text').getall()).lower()
        
        # Check URL patterns
        if any(keyword in url_lower for keyword in ['catering', 'cater', 'food', 'restaurant']):
            return 'catering'
        elif any(keyword in url_lower for keyword in ['transport', 'taxi', 'bus', 'limousine', 'chauffeur']):
            return 'transport'
        elif any(keyword in url_lower for keyword in ['activity', 'team-building', 'entertainment', 'eventyr', 'teambuilding']):
            return 'activities'
        elif any(keyword in url_lower for keyword in ['av', 'sound', 'light', 'equipment', 'rental', 'projector']):
            return 'av-equipment'
        elif any(keyword in url_lower for keyword in ['venue', 'meeting', 'conference', 'hall', 'room']):
            return 'venue'
        
        # Check page content
        if any(keyword in page_text for keyword in ['catering', 'menu', 'cuisine', 'buffet']):
            return 'catering'
        elif any(keyword in page_text for keyword in ['transport', 'vehicle', 'chauffeur', 'pickup']):
            return 'transport'
        elif any(keyword in page_text for keyword in ['team building', 'activity', 'workshop', 'experience']):
            return 'activities'
        elif any(keyword in page_text for keyword in ['sound system', 'projector', 'microphone', 'av equipment']):
            return 'av-equipment'
        
        # Default to venue
        return 'venue'
    
    def parse(self, response):
        """Parse listing pages or direct vendor pages."""
        # Extract links from listing pages
        vendor_links = (
            response.css('a.venue-link::attr(href)').getall() or
            response.css('.listing-item a::attr(href)').getall() or
            response.css('.vendor-link::attr(href)').getall() or
            response.css('a[href*="/venue/"]::attr(href)').getall() or
            response.css('a[href*="/catering/"]::attr(href)').getall() or
            response.css('a[href*="/transport/"]::attr(href)').getall() or
            response.css('a[href*="/activity/"]::attr(href)').getall() or
            response.xpath('//a[contains(@href, "/venue/") or contains(@href, "/catering/") or contains(@href, "/transport/") or contains(@href, "/activity/")]/@href').getall()
        )
        
        if vendor_links:
            for link in set(vendor_links):
                absolute_url = response.urljoin(link)
                if self._needs_javascript(absolute_url):
                    yield scrapy.Request(
                        url=absolute_url,
                        callback=self.parse_vendor,
                        meta={
                            'playwright': True,
                            'playwright_page_methods': [
                                PageMethod('wait_for_selector', 'body', timeout=10000),
                                PageMethod('wait_for_load_state', 'networkidle'),
                            ],
                        }
                    )
                else:
                    yield scrapy.Request(url=absolute_url, callback=self.parse_vendor)
            
            # Handle pagination
            next_page = (
                response.css('a.next-page::attr(href)').get() or
                response.css('a[rel="next"]::attr(href)').get() or
                response.xpath('//a[contains(text(), "Next") or contains(text(), "næste")]/@href').get()
            )
            if next_page:
                absolute_next = response.urljoin(next_page)
                if self._needs_javascript(absolute_next):
                    yield scrapy.Request(
                        url=absolute_next,
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
                    yield scrapy.Request(url=absolute_next, callback=self.parse)
        else:
            # Direct vendor page
            yield from self.parse_vendor(response)
    
    def parse_vendor(self, response):
        """Extract vendor data based on detected type."""
        vendor_type = self._detect_vendor_type(response.url, response)
        
        if vendor_type == 'venue':
            yield from self.parse_venue(response)
        elif vendor_type == 'catering':
            yield from self.parse_catering(response)
        elif vendor_type == 'transport':
            yield from self.parse_transport(response)
        elif vendor_type == 'activities':
            yield from self.parse_activities(response)
        elif vendor_type == 'av-equipment':
            yield from self.parse_av_equipment(response)
    
    def parse_venue(self, response):
        """Extract comprehensive venue data."""
        item = VenueItem()
        item['vendor_type'] = 'venue'
        item['url_source'] = response.url
        
        # Name
        item['name'] = (
            response.css('h1.venue-name::text').get() or
            response.css('h1::text').get() or
            response.xpath('//h1[contains(@class, "venue") or contains(@class, "title")]/text()').get() or
            response.css('title::text').get()
        )
        if item['name']:
            item['name'] = item['name'].strip()
        
        # Address
        address_selectors = [
            'div.address::text', 'span.address::text', '[itemprop="address"]::text',
            '.venue-address::text', 'address::text', '[itemprop="streetAddress"]::text'
        ]
        item['address_full'] = None
        for selector in address_selectors:
            addr = response.css(selector).get()
            if addr:
                item['address_full'] = addr.strip()
                break
        
        # Try JSON-LD
        if not item['address_full']:
            json_ld = response.css('script[type="application/ld+json"]::text').get()
            if json_ld:
                try:
                    data = json.loads(json_ld)
                    if isinstance(data, dict):
                        addr = data.get('address', {})
                        if isinstance(addr, dict):
                            item['address_full'] = ', '.join([
                                addr.get('streetAddress', ''),
                                addr.get('addressLocality', ''),
                                addr.get('postalCode', ''),
                                addr.get('addressCountry', '')
                            ]).strip(', ')
                except:
                    pass
        
        # Description
        item['description'] = (
            response.css('meta[name="description"]::attr(content)').get() or
            response.css('.description::text').get() or
            response.css('.venue-description::text').get() or
            response.xpath('//*[contains(@class, "description")]//text()').get()
        )
        
        # Capacity
        capacity_text = (
            response.css('.capacity::text').get() or
            response.xpath('//*[contains(text(), "capacity")]/following-sibling::text()').get() or
            response.xpath('//*[contains(@class, "capacity")]//text()').get()
        )
        if capacity_text:
            numbers = re.findall(r'\d+', capacity_text.replace(',', '').replace('.', ''))
            if len(numbers) >= 2:
                item['capacity_min_max'] = f"{numbers[0]} - {numbers[-1]}"
            elif len(numbers) == 1:
                item['capacity_min_max'] = numbers[0]
        
        # Number of rooms
        rooms_text = response.xpath('//*[contains(text(), "room") or contains(text(), "lokale")]/text()').get()
        if rooms_text:
            rooms = re.findall(r'\d+', rooms_text)
            if rooms:
                item['number_of_rooms'] = rooms[0]
        
        # Event types
        event_types = []
        for selector in ['.event-types li::text', '.event-types span::text', '[data-event-type]::text', '.tags::text']:
            types = response.css(selector).getall()
            if types:
                event_types.extend([t.strip() for t in types if t.strip()])
        
        page_text = ' '.join(response.css('body *::text').getall()).lower()
        event_keywords = ['Conference', 'Gala', 'Dinner', 'Product Launch', 'Seminar', 'Workshop', 'Networking', 'Exhibition']
        for keyword in event_keywords:
            if keyword.lower() in page_text and keyword not in event_types:
                event_types.append(keyword)
        item['event_types'] = sorted(list(set(event_types))) if event_types else []
        
        # Pricing
        price_selectors = ['.price::text', '.package-price::text', '[itemprop="price"]::text', '.starting-price::text']
        item['base_package_price'] = None
        for selector in price_selectors:
            price = response.css(selector).get()
            if price:
                item['base_package_price'] = price.strip()
                break
        
        # A/V
        av_text = ' '.join(response.css('body *::text').getall()).lower()
        item['in_house_av'] = any(kw in av_text for kw in ['yes', 'available', 'included', 'in-house', 'ja', 'medfølger'])
        
        # Amenities
        amenities = []
        for selector in ['.amenities li::text', '.amenities span::text', '.features li::text']:
            amens = response.css(selector).getall()
            if amens:
                amenities.extend([a.strip() for a in amens if a.strip()])
        item['amenities'] = amenities
        
        # Parking, WiFi, Accessibility
        item['parking_available'] = 'parking' in av_text or 'parkeringsplads' in av_text
        item['wifi_available'] = 'wifi' in av_text or 'wi-fi' in av_text
        item['accessibility'] = 'accessible' in av_text or 'tilgængelig' in av_text or 'wheelchair' in av_text
        
        # Contact
        item['phone'] = response.css('[itemprop="telephone"]::text').get() or re.search(r'\+?\d{2,3}[\s-]?\d{2,3}[\s-]?\d{2,4}[\s-]?\d{2,4}', response.text)
        if item['phone'] and hasattr(item['phone'], 'group'):
            item['phone'] = item['phone'].group(0)
        item['email'] = response.css('[itemprop="email"]::text').get() or re.search(r'[\w\.-]+@[\w\.-]+\.\w+', response.text)
        if item['email'] and hasattr(item['email'], 'group'):
            item['email'] = item['email'].group(0)
        item['website'] = response.css('[itemprop="url"]::attr(content)').get() or response.url
        
        # Images
        item['images'] = response.css('img::attr(src)').getall()[:10]  # Limit to 10 images
        item['images'] = [response.urljoin(img) for img in item['images'] if img]
        
        # Rating
        rating_text = response.css('[itemprop="ratingValue"]::text').get() or response.css('.rating::text').get()
        if rating_text:
            rating_match = re.search(r'(\d+\.?\d*)', rating_text)
            if rating_match:
                item['rating'] = float(rating_match.group(1))
        
        if item['name'] and item['address_full']:
            yield item
    
    def parse_catering(self, response):
        """Extract catering service data."""
        item = CateringItem()
        item['vendor_type'] = 'catering'
        item['url_source'] = response.url
        
        # Name
        item['name'] = (
            response.css('h1::text').get() or
            response.css('title::text').get()
        )
        if item['name']:
            item['name'] = item['name'].strip()
        
        # Address
        item['address_full'] = (
            response.css('[itemprop="address"]::text').get() or
            response.css('address::text').get() or
            response.css('.address::text').get()
        )
        
        # Description
        item['description'] = response.css('meta[name="description"]::attr(content)').get()
        
        # Cuisine types
        page_text = ' '.join(response.css('body *::text').getall()).lower()
        cuisine_keywords = ['italian', 'french', 'asian', 'danish', 'vegetarian', 'vegan', 'mediterranean']
        item['cuisine_types'] = [c for c in cuisine_keywords if c in page_text]
        
        # Service types
        service_keywords = ['buffet', 'plated', 'cocktail', 'canapes', 'breakfast', 'lunch', 'dinner']
        item['service_types'] = [s for s in service_keywords if s in page_text]
        
        # Pricing
        price_match = re.search(r'(\d+)\s*(?:DKK|EUR|kr)', page_text, re.IGNORECASE)
        if price_match:
            item['price_per_person'] = f"{price_match.group(1)} DKK"
        
        # Contact
        item['phone'] = re.search(r'\+?\d{2,3}[\s-]?\d{2,3}[\s-]?\d{2,4}[\s-]?\d{2,4}', response.text)
        if item['phone']:
            item['phone'] = item['phone'].group(0)
        item['email'] = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', response.text)
        if item['email']:
            item['email'] = item['email'].group(0)
        
        # Images
        item['images'] = [response.urljoin(img) for img in response.css('img::attr(src)').getall()[:5]]
        
        if item['name']:
            yield item
    
    def parse_transport(self, response):
        """Extract transportation service data."""
        item = TransportItem()
        item['vendor_type'] = 'transport'
        item['url_source'] = response.url
        
        # Name
        item['name'] = (
            response.css('h1::text').get() or
            response.css('title::text').get()
        )
        if item['name']:
            item['name'] = item['name'].strip()
        
        # Address
        item['address_full'] = response.css('address::text').get() or response.css('.address::text').get()
        
        # Vehicle types
        page_text = ' '.join(response.css('body *::text').getall()).lower()
        vehicle_keywords = ['bus', 'limousine', 'minivan', 'car', 'van', 'coach']
        item['vehicle_types'] = [v for v in vehicle_keywords if v in page_text]
        
        # Pricing
        price_match = re.search(r'(\d+)\s*(?:DKK|EUR|kr)', page_text, re.IGNORECASE)
        if price_match:
            item['price_per_hour'] = f"{price_match.group(1)} DKK"
        
        # Contact
        item['phone'] = re.search(r'\+?\d{2,3}[\s-]?\d{2,3}[\s-]?\d{2,4}[\s-]?\d{2,4}', response.text)
        if item['phone']:
            item['phone'] = item['phone'].group(0)
        
        if item['name']:
            yield item
    
    def parse_activities(self, response):
        """Extract activities/entertainment data."""
        item = ActivitiesItem()
        item['vendor_type'] = 'activities'
        item['url_source'] = response.url
        
        # Name
        item['name'] = (
            response.css('h1::text').get() or
            response.css('title::text').get()
        )
        if item['name']:
            item['name'] = item['name'].strip()
        
        # Address
        item['address_full'] = response.css('address::text').get()
        
        # Activity types
        page_text = ' '.join(response.css('body *::text').getall()).lower()
        activity_keywords = ['team-building', 'cooking', 'escape-room', 'workshop', 'networking', 'sports']
        item['activity_types'] = [a for a in activity_keywords if a in page_text]
        
        # Pricing
        price_match = re.search(r'(\d+)\s*(?:DKK|EUR|kr)', page_text, re.IGNORECASE)
        if price_match:
            item['price_per_person'] = f"{price_match.group(1)} DKK"
        
        # Contact
        item['phone'] = re.search(r'\+?\d{2,3}[\s-]?\d{2,3}[\s-]?\d{2,4}[\s-]?\d{2,4}', response.text)
        if item['phone']:
            item['phone'] = item['phone'].group(0)
        
        if item['name']:
            yield item
    
    def parse_av_equipment(self, response):
        """Extract AV equipment rental data."""
        item = AVEquipmentItem()
        item['vendor_type'] = 'av-equipment'
        item['url_source'] = response.url
        
        # Name
        item['name'] = (
            response.css('h1::text').get() or
            response.css('title::text').get()
        )
        if item['name']:
            item['name'] = item['name'].strip()
        
        # Address
        item['address_full'] = response.css('address::text').get()
        
        # Equipment types
        page_text = ' '.join(response.css('body *::text').getall()).lower()
        equipment_keywords = ['projector', 'sound system', 'microphone', 'screen', 'speaker', 'lighting']
        item['equipment_types'] = [e for e in equipment_keywords if e in page_text]
        
        # Services
        item['delivery_available'] = 'delivery' in page_text or 'levering' in page_text
        item['setup_service'] = 'setup' in page_text or 'opsætning' in page_text
        item['technical_support'] = 'support' in page_text or 'teknisk' in page_text
        
        # Pricing
        price_match = re.search(r'(\d+)\s*(?:DKK|EUR|kr)', page_text, re.IGNORECASE)
        if price_match:
            item['price_per_day'] = f"{price_match.group(1)} DKK"
        
        # Contact
        item['phone'] = re.search(r'\+?\d{2,3}[\s-]?\d{2,3}[\s-]?\d{2,4}[\s-]?\d{2,4}', response.text)
        if item['phone']:
            item['phone'] = item['phone'].group(0)
        
        if item['name']:
            yield item
