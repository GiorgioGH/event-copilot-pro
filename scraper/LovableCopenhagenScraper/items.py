# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy
from itemloaders.processors import TakeFirst, MapCompose, Join


class VenueItem(scrapy.Item):
    """
    Scrapy Item class for venue data collection in Copenhagen Metropolitan Area.
    All fields are required for corporate event planning data.
    """
    
    # The official name of the venue
    name = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    
    # The complete street address (Copenhagen, Denmark focus)
    address_full = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    
    # The minimum and maximum corporate event capacity (e.g., '100 - 300' people)
    capacity_min_max = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    
    # A list of suitable events (e.g., 'Gala Dinner', 'Conference', 'Product Launch')
    event_types = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=lambda x: [item for item in x if item]  # Remove empty strings
    )
    
    # Boolean (True/False) indicating in-house A/V equipment
    in_house_av = scrapy.Field(
        input_processor=MapCompose(str.strip, str.lower),
        output_processor=TakeFirst()
    )
    
    # A string representing the typical starting price or price range
    # (e.g., '5000 DKK' or 'From 400 DKK/person'). Crucial for budget calculation.
    base_package_price = scrapy.Field(
        input_processor=MapCompose(str.strip),
        output_processor=TakeFirst()
    )
    
    # The source URL for the data
    url_source = scrapy.Field(
        output_processor=TakeFirst()
    )

