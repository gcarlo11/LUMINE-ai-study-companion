import pdfplumber

def extract_text_from(file_path):
    text = ''
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text + '\n'
    return text

def chunk_text(text, chunk_size=600, overlap=100):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunks = " ".join(words[i:i + chunk_size])
        chunks.append(chunks)
    return chunks
