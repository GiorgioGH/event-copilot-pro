# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy
from itemloaders.processors import TakeFirst, MapCompose, Join


class VenueItem(scrapy.Item):
    """
    Scrapy Item class for venue data collection in Copenhagen Metropolitan Area.
    Expanded with comprehensive fields for event planning.
    """
    
    # Basic Information
    name = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    address_full = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    description = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    
    # Capacity and Space
    capacity_min_max = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    number_of_rooms = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    
    # Event Types
    event_types = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=lambda x: [item for item in x if item] if x else []
    )
    
    # Pricing
    base_package_price = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    price_per_person = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    
    # Equipment and Services
    in_house_av = scrapy.Field(
        input_processor=MapCompose(str.strip, str.lower),
        output_processor=TakeFirst()
    )
    amenities = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=lambda x: [item for item in x if item] if x else []
    )
    parking_available = scrapy.Field(
        input_processor=MapCompose(str.strip, str.lower),
        output_processor=TakeFirst()
    )
    accessibility = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    wifi_available = scrapy.Field(
        input_processor=MapCompose(str.strip, str.lower),
        output_processor=TakeFirst()
    )
    
    # Contact and Location
    phone = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    email = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    website = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    coordinates = scrapy.Field()  # {'lat': float, 'lng': float}
    
    # Media
    images = scrapy.Field(
        output_processor=lambda x: [item for item in x if item] if x else []
    )
    
    # Ratings and Reviews
    rating = scrapy.Field(
        output_processor=TakeFirst()
    )
    review_count = scrapy.Field(
        output_processor=TakeFirst()
    )
    
    # Metadata
    vendor_type = scrapy.Field(
        output_processor=TakeFirst()
    )  # Always 'venue'
    url_source = scrapy.Field(
        output_processor=TakeFirst()
    )


class CateringItem(scrapy.Item):
    """Item for catering services in Copenhagen."""
    
    name = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    address_full = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    description = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    
    # Service Details
    cuisine_types = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=lambda x: [item for item in x if item] if x else []
    )
    service_types = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=lambda x: [item for item in x if item] if x else []
    )  # e.g., ['buffet', 'plated', 'cocktail']
    dietary_options = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=lambda x: [item for item in x if item] if x else []
    )  # e.g., ['vegetarian', 'vegan', 'gluten-free']
    min_order = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    max_capacity = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    
    # Pricing
    price_per_person = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    base_package_price = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    
    # Contact
    phone = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    email = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    website = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    
    # Media
    images = scrapy.Field(
        output_processor=lambda x: [item for item in x if item] if x else []
    )
    
    # Ratings
    rating = scrapy.Field(
        output_processor=TakeFirst()
    )
    review_count = scrapy.Field(
        output_processor=TakeFirst()
    )
    
    # Metadata
    vendor_type = scrapy.Field(
        output_processor=TakeFirst()
    )  # Always 'catering'
    url_source = scrapy.Field(
        output_processor=TakeFirst()
    )


class TransportItem(scrapy.Item):
    """Item for transportation services in Copenhagen."""
    
    name = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    address_full = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    description = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    
    # Service Details
    vehicle_types = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=lambda x: [item for item in x if item] if x else []
    )  # e.g., ['bus', 'limousine', 'minivan']
    capacity_per_vehicle = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    service_area = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )  # e.g., 'Copenhagen Metropolitan Area'
    
    # Pricing
    price_per_hour = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    price_per_km = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    base_package_price = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    
    # Features
    features = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=lambda x: [item for item in x if item] if x else []
    )  # e.g., ['wifi', 'air-conditioning', 'luxury']
    
    # Contact
    phone = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    email = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    website = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    
    # Media
    images = scrapy.Field(
        output_processor=lambda x: [item for item in x if item] if x else []
    )
    
    # Ratings
    rating = scrapy.Field(
        output_processor=TakeFirst()
    )
    review_count = scrapy.Field(
        output_processor=TakeFirst()
    )
    
    # Metadata
    vendor_type = scrapy.Field(
        output_processor=TakeFirst()
    )  # Always 'transport'
    url_source = scrapy.Field(
        output_processor=TakeFirst()
    )


class ActivitiesItem(scrapy.Item):
    """Item for activities and entertainment in Copenhagen."""
    
    name = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    address_full = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    description = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    
    # Activity Details
    activity_types = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=lambda x: [item for item in x if item] if x else []
    )  # e.g., ['team-building', 'cooking-class', 'escape-room']
    min_participants = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    max_participants = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    duration = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )  # e.g., '2 hours', 'half-day'
    indoor_outdoor = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    
    # Pricing
    price_per_person = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    base_package_price = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    
    # Requirements
    requirements = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=lambda x: [item for item in x if item] if x else []
    )
    
    # Contact
    phone = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    email = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    website = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    
    # Media
    images = scrapy.Field(
        output_processor=lambda x: [item for item in x if item] if x else []
    )
    
    # Ratings
    rating = scrapy.Field(
        output_processor=TakeFirst()
    )
    review_count = scrapy.Field(
        output_processor=TakeFirst()
    )
    
    # Metadata
    vendor_type = scrapy.Field(
        output_processor=TakeFirst()
    )  # Always 'activities'
    url_source = scrapy.Field(
        output_processor=TakeFirst()
    )


class AVEquipmentItem(scrapy.Item):
    """Item for AV equipment rental in Copenhagen."""
    
    name = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    address_full = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    description = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    
    # Equipment Details
    equipment_types = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=lambda x: [item for item in x if item] if x else []
    )  # e.g., ['projector', 'sound-system', 'microphones', 'screens']
    delivery_available = scrapy.Field(
        input_processor=MapCompose(str.strip, str.lower),
        output_processor=TakeFirst()
    )
    setup_service = scrapy.Field(
        input_processor=MapCompose(str.strip, str.lower),
        output_processor=TakeFirst()
    )
    technical_support = scrapy.Field(
        input_processor=MapCompose(str.strip, str.lower),
        output_processor=TakeFirst()
    )
    
    # Pricing
    price_per_day = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    price_per_event = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    base_package_price = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    
    # Contact
    phone = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    email = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    website = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    
    # Media
    images = scrapy.Field(
        output_processor=lambda x: [item for item in x if item] if x else []
    )
    
    # Ratings
    rating = scrapy.Field(
        output_processor=TakeFirst()
    )
    review_count = scrapy.Field(
        output_processor=TakeFirst()
    )
    
    # Metadata
    vendor_type = scrapy.Field(
        output_processor=TakeFirst()
    )  # Always 'av-equipment'
    url_source = scrapy.Field(
        output_processor=TakeFirst()
    )
