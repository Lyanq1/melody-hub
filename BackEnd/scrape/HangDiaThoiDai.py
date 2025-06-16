from spotify_scraper import SpotifyClient
import time
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.keys import Keys


# Đường dẫn tới chromedriver
CHROMEDRIVER_PATH = 'D:\\Download\chromedriver-win64\\chromedriver-win64\\chromedriver.exe'
  # hoặc đường dẫn tuyệt đối

# URL trang đầu tiên của danh mục sản phẩm
START_URL = 'https://store.hangdiathoidai.com/collections/available-now'

# Khởi tạo trình duyệt
service = Service(CHROMEDRIVER_PATH)
driver = webdriver.Chrome(service=service)
driver.get(START_URL)
time.sleep(2)

products = []

# # Lấy tổng số trang từ pagination
# try:
#     pagination = driver.find_elements(By.CSS_SELECTOR, '.pagination .page a')
#     pages = [int(a.text) for a in pagination if a.text.isdigit()]
#     max_page = max(pages) if pages else 1
# except:
#     max_page = 17

# print(f'Tổng số trang: {max_page}')
max_page = 17
for page in range(1, max_page + 1):
    url = f"{START_URL}?page={page}"
    driver.get(url)
    time.sleep(2)
    items = driver.find_elements(By.CSS_SELECTOR, '.grid__item .product-container')
    for item in items:
        try:
            image = item.find_element(By.CSS_SELECTOR, 'img').get_attribute('src')
        except:
            image = ''
        try:
            name = item.find_element(By.CSS_SELECTOR, 'h4.product-name a').text
        except:
            name = ''
        try:
            price = item.find_element(By.CSS_SELECTOR, '.product-price').text
        except:
            price = ''
        products.append({
            'product-image': image,
            'product-name': name,
            'product-price': price
        })

driver.quit()

# Lưu ra file CSV
df = pd.DataFrame(products)
df.to_csv('products.csv', index=False, encoding='utf-8-sig')
print('Printed products.csv')