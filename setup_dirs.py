import os

base_path = r"c:\Users\niteesh\OneDrive\Desktop\coding\codeswayam\codeswayam-auth"

# Create directories
dirs = [
    os.path.join(base_path, "app", "dashboard"),
    os.path.join(base_path, "app", "account")
]

for dir_path in dirs:
    os.makedirs(dir_path, exist_ok=True)
    print(f"Created directory: {dir_path}")

# Create files
files = [
    (os.path.join(base_path, "app", "dashboard", "page.tsx"), "// Dashboard page component"),
    (os.path.join(base_path, "app", "dashboard", "layout.tsx"), "// Dashboard layout component"),
    (os.path.join(base_path, "app", "account", "page.tsx"), "// Account page component"),
    (os.path.join(base_path, "app", "account", "layout.tsx"), "// Account layout component"),
]

for file_path, content in files:
    with open(file_path, "w") as f:
        f.write(content)
    print(f"Created file: {file_path}")

print("\nAll directories and files created successfully!")
