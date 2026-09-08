import os
import re

from pypdf import PdfReader

import pymupdf
import pytesseract

from PIL import Image


# =========================================================
# TESSERACT CONFIGURATION
# =========================================================

TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

if os.path.exists(TESSERACT_PATH):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH


# =========================================================
# CLEAN TEXT
# =========================================================

def clean_text(text: str) -> str:

    if not text:
        return ""

    # Normalize line breaks
    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    # Remove excessive spaces
    text = re.sub(
        r"[ \t]+",
        " ",
        text
    )

    # Remove excessive blank lines
    text = re.sub(
        r"\n{3,}",
        "\n\n",
        text
    )

    return text.strip()


# =========================================================
# NORMAL PDF TEXT EXTRACTION
# =========================================================

def extract_with_pypdf(file_path: str) -> str:

    print("\n================================")
    print("NORMAL PDF TEXT EXTRACTION")
    print("================================")

    try:

        reader = PdfReader(file_path)

        print(
            "Number of pages:",
            len(reader.pages)
        )

        extracted_text = ""

        for page_number, page in enumerate(
            reader.pages,
            start=1
        ):

            print(
                f"Reading page {page_number}..."
            )

            page_text = page.extract_text()

            if page_text:

                extracted_text += (
                    f"\n--- Page {page_number} ---\n"
                )

                extracted_text += page_text

        return clean_text(
            extracted_text
        )

    except Exception as e:

        print(
            "pypdf extraction error:",
            str(e)
        )

        return ""


# =========================================================
# OCR EXTRACTION
# =========================================================

def extract_with_ocr(file_path: str) -> str:

    print("\n================================")
    print("OCR EXTRACTION STARTED")
    print("================================")

    extracted_text = ""

    try:

        # Open PDF
        pdf = fitz.open(
            file_path
        )

        print(
            "Number of pages:",
            len(pdf)
        )


        for page_number, page in enumerate(
            pdf,
            start=1
        ):

            print(
                f"OCR processing page {page_number}..."
            )


            # Render PDF page as image
            pix = page.get_pixmap(
                matrix=fitz.Matrix(
                    2,
                    2
                )
            )


            # Convert to PIL image
            image = Image.frombytes(
                "RGB",
                [
                    pix.width,
                    pix.height
                ],
                pix.samples
            )


            # OCR
            page_text = pytesseract.image_to_string(
                image
            )


            if page_text:

                print(
                    f"Page {page_number}: "
                    f"{len(page_text)} characters"
                )


                extracted_text += (
                    f"\n--- Page {page_number} ---\n"
                )

                extracted_text += page_text

            else:

                print(
                    f"Page {page_number}: "
                    "No text detected"
                )


        pdf.close()


        extracted_text = clean_text(
            extracted_text
        )


        print(
            "\nOCR TOTAL CHARACTERS:",
            len(extracted_text)
        )


        return extracted_text


    except Exception as e:

        print(
            "OCR extraction error:",
            str(e)
        )

        return ""


# =========================================================
# MAIN EXTRACTION FUNCTION
# =========================================================

def extract_pdf_text(file_path: str) -> str:

    print("\n================================")
    print("PDF EXTRACTION STARTED")
    print("File:", file_path)
    print("================================")


    # Check file
    if not os.path.exists(file_path):

        print(
            "ERROR: PDF file does not exist"
        )

        return ""


    # =====================================================
    # STEP 1
    # TRY NORMAL TEXT EXTRACTION
    # =====================================================

    extracted_text = extract_with_pypdf(
        file_path
    )


    # =====================================================
    # STEP 2
    # IF TEXT EXISTS, RETURN IT
    # =====================================================

    if extracted_text:

        print(
            "\nNormal PDF text extraction successful."
        )

        print(
            "Characters:",
            len(extracted_text)
        )

        return extracted_text


    # =====================================================
    # STEP 3
    # NO TEXT → OCR
    # =====================================================

    print(
        "\nNo normal text found."
    )

    print(
        "PDF may be scanned/image-based."
    )

    print(
        "Starting OCR..."
    )


    ocr_text = extract_with_ocr(
        file_path
    )


    # =====================================================
    # STEP 4
    # RETURN OCR TEXT
    # =====================================================

    if ocr_text:

        print(
            "\nOCR extraction successful."
        )

        return ocr_text


    # =====================================================
    # NOTHING FOUND
    # =====================================================

    print(
        "\nERROR: Could not extract text."
    )

    return ""