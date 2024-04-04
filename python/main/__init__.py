import extract

def main():
    sites_crawler =  "https://stackoverflow.com/"
    
    links = extract.extract_links_(sites_crawler, 2)
    print("Finalização do processo")
    
    for link in links:
        print(link)

if __name__ == "__main__":
    main()