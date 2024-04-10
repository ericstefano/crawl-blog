import requests
from bs4 import BeautifulSoup
from string import Template
import re

path_document = './python/resource/links.txt'
template = Template("$url;$content\n")

def extract_links_(url, depth):
    if depth == 0:
        return []

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    }

    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            links = [link.get('href') for link in soup.find_all('a', href=True)]
            
            content_format = re.sub(r'\s+', ' ', soup.get_text().lower().replace("\n",""))
            
            with open(path_document, 'a', encoding='utf-8') as arquivo:
                arquivo.write(template.substitute(url=url,content=content_format))

            extracted_links = []
            
            for link in links:
                if link.startswith('http'):
                    extracted_links.append(link)
                else:
                    if not link.startswith('#'): 
                        if link.startswith('/'):
                            
                            next_url = url + link
                        else:
                            
                            next_url = url + '/' + link
                        extracted_links.append(next_url)

            def search_questions(link):
                if "questions" in link: return True
                else: return False
                
            extracted_links_questions = list(filter(search_questions, extracted_links))

            for next_url in extracted_links_questions:
                print(next_url)
                extract_links_(next_url, depth - 1)
                
        else:
            print("Failed to retrieve page:", response.status_code)
            return []
    except Exception as e:
        print("An error occurred:", str(e))
        return []
    
    
    
    