import os

def dump_code_to_txt(dir_path: str):
    # Ensure trailing slash is handled
    dir_path = dir_path.rstrip("/\\")
    
    # Output folder and file
    output_folder = "zzz"
    os.makedirs(output_folder, exist_ok=True)
    output_file = os.path.join(output_folder, f"{os.path.basename(dir_path)}.txt")

    # Allowed extensions
    allowed_ext = {".css", ".jsx", ".tsx", ".ts", ".js", ".html"}

    with open(output_file, "w", encoding="utf-8") as out_f:
        for root, _, files in os.walk(dir_path):
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in allowed_ext:
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, dir_path)

                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            code = f.read()
                    except Exception as e:
                        code = f"<<Error reading file: {e}>>"

                    # Write in required format
                    out_f.write(rel_path + "\n")
                    out_f.write(code + "\n")
                    out_f.write("-------------\n")

    print(f"✅ All code dumped to: {output_file}")


if __name__ == "__main__":
    dir_name = input("Enter the relative path of the directory: ").strip()
    if os.path.isdir(dir_name):
        dump_code_to_txt(dir_name)
    else:
        print("❌ Invalid directory path. Please check and try again.")
