from app.services.pdf_extractor import extract_pdf_text

pdf_path = "app/uploads/your_file.pdf"

text = extract_pdf_text(pdf_path)

print("\n========== EXTRACTED TEXT ==========\n")
print(text)
print("\n========== END ==========\n")