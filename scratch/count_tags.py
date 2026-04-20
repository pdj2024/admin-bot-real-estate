
import re

def count_tags(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Take only the template section
    template_match = re.search(r'<template>(.*?)</template>', content, re.DOTALL)
    if not template_match:
        print("No template found")
        return
    
    template_content = template_match.group(1)
    
    # Simple tag counting handles most cases for this file structure
    open_divs = len(re.findall(r'<div\b', template_content))
    close_divs = len(re.findall(r'</div>', template_content))
    
    print(f"Opening <div> tags: {open_divs}")
    print(f"Closing </div> tags: {close_divs}")
    print(f"Difference: {open_divs - close_divs}")
    
    # Also count other tags just in case
    # This is rough but helpful
    all_tags = re.findall(r'<(?!/)(?!Icon|input|img|br|hr|meta|link|!)(?!import|script|style|template)([a-zA-Z0-9]+)', template_content)
    all_close = re.findall(r'</(?!Icon)([a-zA-Z0-9]+)', template_content)
    
    tag_counts = {}
    for tag in all_tags:
        tag_counts[tag] = tag_counts.get(tag, 0) + 1
    for tag in all_close:
        tag_counts[tag] = tag_counts.get(tag, 0) - 1
        
    print("\nTag Balances (Positive means missing closing, negative means extra closing):")
    for tag, balance in tag_counts.items():
        if balance != 0:
            print(f"<{tag}>: {balance}")

if __name__ == "__main__":
    count_tags(r"d:\Project\Vue.js\wa-bot-vue\src\views\admin\chat\components\SideBar.vue")
