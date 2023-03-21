import os
import tempfile
from zipfile import ZipFile

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