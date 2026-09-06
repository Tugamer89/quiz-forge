from playwright.sync_api import sync_playwright
import time

def take_screenshot():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('http://localhost:5173/quiz-forge/')
        time.sleep(2)
        page.screenshot(path='screenshot.png')
        browser.close()

if __name__ == '__main__':
    take_screenshot()
