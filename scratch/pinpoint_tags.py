
import re

def find_mismatch(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    stack = []
    template_started = False
    
    for i, line in enumerate(lines):
        line_num = i + 1
        
        if '<template>' in line:
            template_started = True
            continue
        if '</template>' in line:
            break
            
        if not template_started:
            continue
            
        # Find all divs
        tokens = re.findall(r'<div\b|</div>', line)
        for token in tokens:
            if token == '<div':
                stack.append(line_num)
            else:
                if stack:
                    stack.pop()
                else:
                    print(f"Extra closing </div> at line {line_num}")
    
    if stack:
        print("Unclosed <div> tags starting at lines:")
        for ln in stack:
            print(ln)
    else:
        print("All <div> tags are balanced within the template.")

if __name__ == "__main__":
    find_mismatch(r"d:\Project\Vue.js\wa-bot-vue\src\views\admin\chat\components\SideBar.vue")
