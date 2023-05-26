import os
import tempfile
from zipfile import ZipFile

# Usage:
# 1. Obtain the styles.xml from the docx file you want:
#   - On a docx file, run the terminal command "unzip yourfile.docx" 
#   - Copy/paste the styles.xml into this code project, update the relative path under "style_path" below.
# 2. Create a docx_dir or change the path accordingly, and put all the unstyled docx files you want in that folder. 
# 3. Run the command python inject_style_recursive.py. This script will update and replace your docx files with style embedded. 
#    The script runs recursively, so if you have a child folder structure it will retain that. 
# Now you can replace your original docx files with the new.

# Path to custom style.xml file
style_path = 'custom_style/styles.xml'

# Root directory to start the search
docx_dir = 'docx_dir'

# Recursively search for .docx files in the directory and its subdirectories
for dirpath, dirnames, filenames in os.walk(docx_dir):
    for file in filenames:
        if file.endswith(".docx"):
            # Create a temporary ZipFile object to modify the archive
            docx_dir = os.path.join(dirpath, file)

            with ZipFile(docx_dir, "r") as original:
                # Create a temporary ZipFile object to modify the archive
                with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                    temp_file.close()
                    with ZipFile(temp_file.name, "w") as temp:
                        # Copy all files from the original archive except the styles.xml file
                        for item in original.infolist():
                            if item.filename != "word/styles.xml":
                                temp.writestr(item, original.read(item.filename))
                        # Add the new styles.xml file
                        temp.write(style_path, "word/styles.xml")
            # Replace the original archive with the modified one
            os.replace(temp_file.name, docx_dir)
