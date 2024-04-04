import requests
import os
from bs4 import BeautifulSoup

path_document = './resource/links.txt'

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

            extracted_links = []
            
            for link in links:
                print(link)
                if link.startswith('http'):
                    extracted_links.append(link)
                else:
                    if not link.startswith('#'): 
                        if link.startswith('/'):
                            
                            next_url = url + link
                        else:
                            
                            next_url = url + '/' + link
                        extracted_links.append(next_url)

            all_links = []
            for next_url in extracted_links:
                all_links.extend(extract_links_(next_url, depth - 1))

            return all_links
        else:
            print("Failed to retrieve page:", response.status_code)
            return []
    except Exception as e:
        print("An error occurred:", str(e))
        return []
    
    
    
    