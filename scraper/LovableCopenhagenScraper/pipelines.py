# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html

import re
import json
import os
import logging
from itemadapter import ItemAdapter
from typing import Dict, Any, Optional, List
from scrapy.exceptions import DropItem

logger = logging.getLogger(__name__)


class ValidationPipeline:
    """
    Pipeline to validate that required fields are not empty.
    Ensures data quality before processing.
    Handles all vendor types (venues, catering, transport, activities, AV equipment).
    """
    
    def process_item(self, item, spider):
        adapter = ItemAdapter(item)
        
        # Validate required fields - name is always required
        name = adapter.get('name')
        if not name or not name.strip():
            logger.warning(f"Item dropped: Missing 'name' field. URL: {adapter.get('url_source')}")
            raise DropItem(f"Missing required field: name")
        
        # For venues, address is required. For other types, it's optional but preferred
        vendor_type = adapter.get('vendor_type', 'venue')
        address_full = adapter.get('address_full')
        
        if vendor_type == 'venue':
            if not address_full or not address_full.strip():
                logger.warning(f"Venue dropped: Missing 'address_full' field. URL: {adapter.get('url_source')}")
                raise DropItem(f"Missing required field: address_full for venue")
            
            # Validate that venue address contains Copenhagen or Denmark
            address_lower = address_full.lower()
            if 'copenhagen' not in address_lower and 'denmark' not in address_lower and 'københavn' not in address_lower:
                logger.warning(f"Venue dropped: Address does not appear to be in Copenhagen area. "
                             f"Address: {address_full}, URL: {adapter.get('url_source')}")
                raise DropItem(f"Address does not appear to be in Copenhagen area: {address_full}")
        else:
            # For other vendor types, address is optional but log if missing
            if not address_full or not address_full.strip():
                logger.info(f"Vendor {vendor_type} has no address (optional): {name}")
        
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
    Pipeline for storing cleaned data to a JSON file.
    Collects all items during scraping and writes them to a JSON file when the spider closes.
    Also supports PostgreSQL and MongoDB connections (optional).
    """
    
    def __init__(self):
        # JSON file storage
        self.items: List[Dict[str, Any]] = []
        self.json_file_path = None
        
        # Database connection placeholders (optional)
        self.db_connection = None
        self.db_type = None  # 'postgresql' or 'mongodb'
    
    def open_spider(self, spider):
        """
        Initialize storage when spider opens.
        Sets up JSON file path and optionally database connection.
        """
        # Determine JSON file path (relative to scraper directory)
        # Get the project root directory (scraper/LovableCopenhagenScraper)
        project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        # Create data directory if it doesn't exist
        data_dir = os.path.join(project_dir, 'data')
        os.makedirs(data_dir, exist_ok=True)
        
        # Set JSON file path - stores all vendor types
        self.json_file_path = os.path.join(data_dir, 'vendors.json')
        
        # Load existing vendors if file exists (to avoid duplicates)
        if os.path.exists(self.json_file_path):
            try:
                with open(self.json_file_path, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
                    if isinstance(existing_data, list):
                        self.items = existing_data
                        logger.info(f"Loaded {len(self.items)} existing vendors from {self.json_file_path}")
                    else:
                        self.items = []
            except (json.JSONDecodeError, IOError) as e:
                logger.warning(f"Could not load existing JSON file: {e}. Starting fresh.")
                self.items = []
        else:
            self.items = []
        
        logger.info(f"StoragePipeline initialized. JSON file: {self.json_file_path}")
        
        # Optional: Database connection setup (uncomment if needed)
        # Example PostgreSQL connection:
        # import psycopg2
        # self.db_connection = psycopg2.connect(
        #     host="localhost",
        #     database="event_copilot",
        #     user="your_user",
        #     password="your_password"
        # )
        # self.db_type = 'postgresql'
        
        # Example MongoDB connection:
        # from pymongo import MongoClient
        # self.db_connection = MongoClient('mongodb://localhost:27017/')
        # self.db = self.db_connection['event_copilot']
        # self.collection = self.db['venues']
        # self.db_type = 'mongodb'
    
    def close_spider(self, spider):
        """
        Write all collected items to JSON file when spider closes.
        Also closes database connection if configured.
        """
        # Write items to JSON file
        if self.json_file_path:
            try:
                # Remove duplicates based on url_source
                seen_urls = set()
                unique_items = []
                for item in self.items:
                    url = item.get('url_source')
                    if url and url not in seen_urls:
                        seen_urls.add(url)
                        unique_items.append(item)
                    elif not url:
                        # Keep items without URL (shouldn't happen, but just in case)
                        unique_items.append(item)
                
                # Write to JSON file with pretty formatting
                with open(self.json_file_path, 'w', encoding='utf-8') as f:
                    json.dump(unique_items, f, indent=2, ensure_ascii=False)
                
                # Count by vendor type for logging
                vendor_counts = {}
                for item in unique_items:
                    vtype = item.get('vendor_type', 'unknown')
                    vendor_counts[vtype] = vendor_counts.get(vtype, 0) + 1
                
                logger.info(f"Successfully wrote {len(unique_items)} vendors to {self.json_file_path}")
                logger.info(f"Vendor breakdown: {vendor_counts}")
            except Exception as e:
                logger.error(f"Error writing to JSON file: {e}")
        
        # Close database connection if configured
        if self.db_connection and self.db_type == 'postgresql':
            self.db_connection.close()
            logger.info("PostgreSQL connection closed.")
        elif self.db_connection and self.db_type == 'mongodb':
            self.db_connection.close()
            logger.info("MongoDB connection closed.")
    
    def process_item(self, item, spider):
        """
        Store the item in memory (will be written to JSON on close).
        Optionally also store in database if configured.
        """
        adapter = ItemAdapter(item)
        
        # Convert item to dictionary
        item_dict = dict(adapter)
        
        # Add to items list for JSON storage
        self.items.append(item_dict)
        vendor_type = item_dict.get('vendor_type', 'unknown')
        logger.info(f"Collected {vendor_type} vendor for JSON storage: {item_dict['name']}")
        
        # Optional: Also store in database if configured
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
        
        return item

