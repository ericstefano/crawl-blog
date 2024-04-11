from scrapy import Spider
from scrapy import Request
from scrapy.linkextractors import LinkExtractor 
import re

class LinksSpider(Spider):
    name = 'links'
    allowed_domains = ['stackoverflow.com']
    start_urls = ['https://stackoverflow.com/questions']
    
    path_document = './src/resource/links.txt'
    saved_links_set = set()

    def __init__(self, name=None, **kwargs): 
        super().__init__(name, **kwargs) 
        self.link_extractor = LinkExtractor(unique=True, allow_domains=['stackoverflow.com'], process_value=self.filter_links)
        self.file = open(self.path_document, 'w')

    @classmethod
    def update_settings(cls, settings):
        super().update_settings(settings)
        settings.set(
            "DEFAULT_REQUEST_HEADERS", 
            {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en",
                "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            },
            priority="spider"
        )
        settings.set("DOWNLOAD_DELAY", 5, priority="spider")
        settings.set("CONCURRENT_REQUESTS_PER_DOMAIN", 1, priority="spider")
        settings.set("CONCURRENT_REQUESTS", 1, priority="spider")
        settings.set("CONCURRENT_ITEMS", 1, priority="spider")
        settings.set("DEPTH", 3, priority="spider")
        settings.set("ROBOTSTXT_OBEY", True, priority="spider")

    def filter_links(self, value):
        if not re.search(r'#\w+$', value):
            return value
        
    def write_links_to_file(self):
        for saved_link in self.saved_links_set: 
            self.file.write(saved_link + '\n')
    
    def parse(self, response):
        links = self.link_extractor.extract_links(response) 
        for link in links:
            self.log(link.url);
            self.saved_links_set.add(link.url)
            yield Request(link.url)

    def closed(self, reason):
        self.write_links_to_file();