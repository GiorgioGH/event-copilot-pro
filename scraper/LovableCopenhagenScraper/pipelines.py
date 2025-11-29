# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html

import re
import logging
from itemadapter import ItemAdapter
from typing import Dict, Any, Optional
from scrapy.exceptions import DropItem

logger = logging.getLogger(__name__)


class ValidationPipeline:
    """
    Pipeline to validate that required fields are not empty.
    Ensures data quality before processing.
    """
    
    def process_item(self, item, spider):
        adapter = ItemAdapter(item)
        
        # Validate required fields
        name = adapter.get('name')
        address_full = adapter.get('address_full')
        
        if not name or not name.strip():
            logger.warning(f"Item dropped: Missing 'name' field. URL: {adapter.get('url_source')}")
            raise DropItem(f"Missing required field: name")
        
        if not address_full or not address_full.strip():
            logger.warning(f"Item dropped: Missing 'address_full' field. URL: {adapter.get('url_source')}")
            raise DropItem(f"Missing required field: address_full")
        
        # Validate that address contains Copenhagen or Denmark (basic check)
        address_lower = address_full.lower()
        if 'copenhagen' not in address_lower and 'denmark' not in address_lower:
            logger.warning(f"Item dropped: Address does not appear to be in Copenhagen area. "
                         f"Address: {address_full}, URL: {adapter.get('url_source')}")
            raise DropItem(f"Address does not appear to be in Copenhagen area: {address_full}")
        
        return item


class CleaningPipeline:
    """
    Pipeline to clean and standardize extracted data.
    Focuses on price normalization and data formatting.
    """
    
    def process_item(self, item, spider):
        adapter = ItemAdapter(item)
        
        # Clean and standardize base_package_price
        base_package_price = adapter.get('base_package_price')
        if base_package_price:
            adapter['base_package_price'] = self._clean_price(base_package_price)
        
        # Clean and standardize in_house_av (convert to boolean)
        in_house_av = adapter.get('in_house_av')
        if in_house_av:
            adapter['in_house_av'] = self._parse_boolean(in_house_av)
        
        # Clean capacity_min_max
        capacity_min_max = adapter.get('capacity_min_max')
        if capacity_min_max:
            adapter['capacity_min_max'] = self._clean_capacity(capacity_min_max)
        
        # Ensure event_types is a list
        event_types = adapter.get('event_types')
        if event_types:
            if isinstance(event_types, str):
                # Split by common delimiters if it's a string
                event_types = [e.strip() for e in re.split(r'[,;|]', event_types) if e.strip()]
            adapter['event_types'] = event_types
        
        return item
    
    def _clean_price(self, price_str: str) -> str:
        """
        Clean and standardize price strings.
        Removes currency symbols but keeps the format for reference.
        Converts to a consistent format: 'NUMBER CURRENCY' or 'From NUMBER CURRENCY/person'
        """
        if not price_str:
            return price_str
        
        # Remove extra whitespace
        price_str = ' '.join(price_str.split())
        
        # Try to extract numeric value and currency
        # Pattern: matches numbers, currency codes (DKK, EUR, USD, etc.), and common price indicators
        price_pattern = r'(\d+(?:[.,]\d+)?)\s*(DKK|EUR|USD|kr|€|\$)?(?:\s*(?:per|/)\s*(?:person|pax|guest))?'
        match = re.search(price_pattern, price_str, re.IGNORECASE)
        
        if match:
            number = match.group(1).replace(',', '.')
            currency = match.group(2) or 'DKK'
            # Normalize currency
            currency = currency.upper()
            if currency in ['KR', 'kr']:
                currency = 'DKK'
            
            # Check if it's per person
            if 'per' in price_str.lower() or '/' in price_str:
                return f"From {number} {currency}/person"
            else:
                return f"From {number} {currency}"
        
        # If no pattern match, return cleaned original
        return price_str.strip()
    
    def _parse_boolean(self, value: Any) -> bool:
        """
        Parse various boolean representations to True/False.
        """
        if isinstance(value, bool):
            return value
        
        if isinstance(value, str):
            value_lower = value.lower().strip()
            true_values = ['true', 'yes', '1', 'available', 'included', 'ja', 'yes']
            false_values = ['false', 'no', '0', 'not available', 'not included', 'nej', 'no']
            
            if value_lower in true_values:
                return True
            elif value_lower in false_values:
                return False
        
        # Default to False if unclear
        return False
    
    def _clean_capacity(self, capacity_str: str) -> str:
        """
        Clean and standardize capacity strings.
        Format: 'MIN - MAX' or 'NUMBER'
        """
        if not capacity_str:
            return capacity_str
        
        # Remove extra whitespace
        capacity_str = ' '.join(capacity_str.split())
        
        # Extract numbers
        numbers = re.findall(r'\d+', capacity_str)
        
        if len(numbers) >= 2:
            return f"{numbers[0]} - {numbers[-1]}"
        elif len(numbers) == 1:
            return numbers[0]
        
        return capacity_str.strip()


class StoragePipeline:
    """
    Pipeline placeholder for storing cleaned data into a database.
    Supports PostgreSQL and MongoDB connections.
    """
    
    def __init__(self):
        # Database connection placeholders
        self.db_connection = None
        self.db_type = None  # 'postgresql' or 'mongodb'
    
    def open_spider(self, spider):
        """
        Initialize database connection when spider opens.
        Configure your database connection here.
        """
        # Example PostgreSQL connection (uncomment and configure)
        # import psycopg2
        # self.db_connection = psycopg2.connect(
        #     host="localhost",
        #     database="event_copilot",
        #     user="your_user",
        #     password="your_password"
        # )
        # self.db_type = 'postgresql'
        
        # Example MongoDB connection (uncomment and configure)
        # from pymongo import MongoClient
        # self.db_connection = MongoClient('mongodb://localhost:27017/')
        # self.db = self.db_connection['event_copilot']
        # self.collection = self.db['venues']
        # self.db_type = 'mongodb'
        
        logger.info("StoragePipeline initialized. Configure database connection in open_spider() method.")
    
    def close_spider(self, spider):
        """
        Close database connection when spider closes.
        """
        if self.db_connection and self.db_type == 'postgresql':
            self.db_connection.close()
            logger.info("PostgreSQL connection closed.")
        elif self.db_connection and self.db_type == 'mongodb':
            self.db_connection.close()
            logger.info("MongoDB connection closed.")
    
    def process_item(self, item, spider):
        """
        Store the item in the database.
        """
        adapter = ItemAdapter(item)
        
        # Convert item to dictionary
        item_dict = dict(adapter)
        
        # PostgreSQL storage example
        if self.db_type == 'postgresql' and self.db_connection:
            try:
                cursor = self.db_connection.cursor()
                cursor.execute("""
                    INSERT INTO venues (name, address_full, capacity_min_max, event_types, 
                                      in_house_av, base_package_price, url_source)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (url_source) DO UPDATE SET
                        name = EXCLUDED.name,
                        address_full = EXCLUDED.address_full,
                        capacity_min_max = EXCLUDED.capacity_min_max,
                        event_types = EXCLUDED.event_types,
                        in_house_av = EXCLUDED.in_house_av,
                        base_package_price = EXCLUDED.base_package_price
                """, (
                    item_dict['name'],
                    item_dict['address_full'],
                    item_dict.get('capacity_min_max'),
                    item_dict.get('event_types', []),
                    item_dict.get('in_house_av', False),
                    item_dict.get('base_package_price'),
                    item_dict['url_source']
                ))
                self.db_connection.commit()
                logger.info(f"Stored venue in PostgreSQL: {item_dict['name']}")
            except Exception as e:
                logger.error(f"Error storing item in PostgreSQL: {e}")
                self.db_connection.rollback()
        
        # MongoDB storage example
        elif self.db_type == 'mongodb' and self.db_connection:
            try:
                self.collection.update_one(
                    {'url_source': item_dict['url_source']},
                    {'$set': item_dict},
                    upsert=True
                )
                logger.info(f"Stored venue in MongoDB: {item_dict['name']}")
            except Exception as e:
                logger.error(f"Error storing item in MongoDB: {e}")
        
        # If no database configured, just log the item
        else:
            logger.info(f"Item ready for storage (database not configured): {item_dict['name']}")
            # Optionally, you could write to JSON/CSV file here
            # Or integrate with your Supabase backend
        
        return item

