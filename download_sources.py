import os
import time
import json
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service

# ———— 配置区 ————
CHROMEDRIVER_PATH = os.path.join(os.getcwd(), "chromedriver-mac-arm64", "chromedriver")  # 自动适配本地 chromedriver 路径
TARGET_URL       = "https://www.topregal.com/de/lagerregale/konfigurator/"
EXPORT_DIR       = "topregal_3d_viewer_src"         # 导出目录
# ——————————————————

# 1. 启动浏览器并打开页面
service = Service(CHROMEDRIVER_PATH)
options = webdriver.ChromeOptions()
driver = webdriver.Chrome(service=service, options=options)
driver.get(TARGET_URL)

# 2. 等待页面加载，点击“3D预览”入口
time.sleep(5)
btn = driver.find_element(By.CSS_SELECTOR,
    "li[data-original-title='Virtuelle Vorschau'] a")
driver.execute_script("arguments[0].click()", btn)
print("已点击3D配置器入口，等待 bundle 加载…")
time.sleep(8)

# 3. 定位到加载进页面的 3D bundle 脚本 URL
scripts = driver.find_elements(By.TAG_NAME, "script")
bundle_url = None
for s in scripts:
    src = s.get_attribute("src") or ""
    if "topregal_3d_viewer" in src and src.endswith(".js"):
        bundle_url = src
        break

driver.quit()

if not bundle_url:
    raise RuntimeError("找不到 3D 配置器对应的 bundle 脚本 URL")

print("找到 bundle 脚本：", bundle_url)

# 4. 拼出 .map 文件地址
if bundle_url.endswith(".js"):
    map_url = bundle_url + ".map"
else:
    raise RuntimeError("脚本 URL 不是以 .js 结尾，无法推断 .map")

print("对应的 SourceMap 地址：", map_url)

# 5. 下载并解析 .map
resp = requests.get(map_url)
resp.raise_for_status()
sm = resp.json()

sources        = sm.get("sources", [])
sourcesContent = sm.get("sourcesContent", [])

if not sources or not sourcesContent:
    raise RuntimeError("SourceMap 中没有 sources 或 sourcesContent")

# 6. 遍历保存 webpack://topregal_3d_viewer 下的所有文件
count = 0
for src_path, content in zip(sources, sourcesContent):
    prefix = "webpack://topregal_3d_viewer/"
    if src_path.startswith(prefix):
        # 本地路径：去掉前缀
        rel_path = src_path[len(prefix):].lstrip("/")
        save_path = os.path.join(EXPORT_DIR, rel_path)
        os.makedirs(os.path.dirname(save_path), exist_ok=True)

        with open(save_path, "w", encoding="utf-8") as f:
            f.write(content)
        count += 1
        print(f"保存：{save_path}")

print(f"\n全部完成，共保存 {count} 个文件，存放在 `{EXPORT_DIR}/` 下。")
