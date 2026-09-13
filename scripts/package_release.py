import os
import zipfile
import shutil

EXCLUDE_DIRS = {
    'node_modules',
    '.next',
    '.git',
    '.turbo',
    '.vercel',
    '__pycache__',
}

EXCLUDE_FILES = {
    'onboardflow-source-v1.0.zip',
    '.env.local',
    '.DS_Store',
    'tsconfig.tsbuildinfo',
}

def make_zip(source_dir, output_zip):
    print(f"Creating release archive: {output_zip}...")
    file_count = 0
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(source_dir):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for file in files:
                if file in EXCLUDE_FILES or file.endswith('.zip'):
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, source_dir)
                zf.write(file_path, arcname)
                file_count += 1
    print(f"Packaged {file_count} files successfully.")

if __name__ == '__main__':
    root_dir = os.path.abspath('.')
    zip_path = os.path.join(root_dir, 'onboardflow-source-v1.0.zip')
    public_zip_path = os.path.join(root_dir, 'public', 'onboardflow-source-v1.0.zip')
    
    make_zip(root_dir, zip_path)
    
    os.makedirs(os.path.join(root_dir, 'public'), exist_ok=True)
    shutil.copy2(zip_path, public_zip_path)
    print(f"Copied to public download endpoint: {public_zip_path}")
    print(f"Zip size: {os.path.getsize(zip_path) / 1024:.1f} KB")

