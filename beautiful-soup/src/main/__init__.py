import extract

def main():
    sites_crawler =  "https://stackoverflow.com/questions"
    
    extract.extract_links_(sites_crawler, 3)
    print("Finalização do processo")
    
if __name__ == "__main__":
    main()