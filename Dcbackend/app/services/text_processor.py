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
# TEXT CLEANING
# =========================================================

def clean_text(text: str) -> str:

    if not text:
        return ""

    # Normalize line endings
    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    # Remove excessive spaces
    text = re.sub(
        r"[ \t]+",
        " ",
        text
    )

    # Remove spaces at beginning/end of lines
    text = re.sub(
        r" *\n *",
        "\n",
        text
    )

    # Remove excessive blank lines
    text = re.sub(
        r"\n{3,}",
        "\n\n",
        text
    )

    # Remove spaces before punctuation
    text = re.sub(
        r"\s+([,.!?;:])",
        r"\1",
        text
    )

    return text.strip()


# =========================================================
# NORMAL PDF TEXT EXTRACTION
# =========================================================

def extract_with_pypdf(
    file_path: str
) -> str:

    print("\n================================")
    print("NORMAL PDF TEXT EXTRACTION")
    print("================================")

    try:

        reader = PdfReader(
            file_path
        )

        total_pages = len(
            reader.pages
        )

        print(
            "Total pages:",
            total_pages
        )

        extracted_text = ""


        for page_number, page in enumerate(
            reader.pages,
            start=1
        ):

            print(
                f"Extracting page {page_number}/{total_pages}..."
            )

            try:

                page_text = page.extract_text()


                if page_text and page_text.strip():

                    page_text = clean_text(
                        page_text
                    )


                    extracted_text += (
                        f"\n--- Page {page_number} ---\n"
                    )

                    extracted_text += (
                        page_text
                    )


                    print(
                        f"Page {page_number}: "
                        f"{len(page_text)} characters"
                    )


                else:

                    print(
                        f"Page {page_number}: "
                        "No text found"
                    )


            except Exception as page_error:

                print(
                    f"Page {page_number} "
                    f"extraction error:",
                    str(page_error)
                )


        extracted_text = clean_text(
            extracted_text
        )


        print(
            "Normal extraction characters:",
            len(extracted_text)
        )


        return extracted_text


    except Exception as e:

        print(
            "pypdf extraction error:",
            str(e)
        )

        return ""


# =========================================================
# OCR EXTRACTION
# =========================================================

def extract_with_ocr(
    file_path: str
) -> str:

    print("\n================================")
    print("OCR EXTRACTION STARTED")
    print("================================")

    extracted_text = ""


    try:

        pdf = pymupdf.open(
            file_path
        )

        total_pages = len(
            pdf
        )

        print(
            "Total pages:",
            total_pages
        )


        for page_number, page in enumerate(
            pdf,
            start=1
        ):

            print(
                f"OCR processing page "
                f"{page_number}/{total_pages}..."
            )


            # Render PDF page as image
            pix = page.get_pixmap(
                matrix=pymupdf.Matrix(
                    2,
                    2
                )
            )


            # Convert PDF image to PIL image
            image = Image.frombytes(
                "RGB",
                (
                    pix.width,
                    pix.height
                ),
                pix.samples
            )


            # Perform OCR
            page_text = pytesseract.image_to_string(
                image
            )


            if page_text and page_text.strip():

                page_text = clean_text(
                    page_text
                )


                extracted_text += (
                    f"\n--- Page {page_number} ---\n"
                )

                extracted_text += (
                    page_text
                )


                print(
                    f"Page {page_number}: "
                    f"{len(page_text)} characters"
                )


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
            "OCR characters:",
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
# MAIN TEXT EXTRACTION
# =========================================================

def extract_pdf_text(
    file_path: str
) -> str:

    print("\n================================")
    print("PDF TEXT EXTRACTION STARTED")
    print("================================")

    print(
        "File:",
        file_path
    )


    # =====================================================
    # CHECK FILE
    # =====================================================

    if not os.path.exists(
        file_path
    ):

        print(
            "ERROR: PDF file does not exist"
        )

        return ""


    # =====================================================
    # NORMAL PDF EXTRACTION
    # =====================================================

    extracted_text = extract_with_pypdf(
        file_path
    )


    # =====================================================
    # NORMAL TEXT FOUND
    # =====================================================

    if extracted_text:

        print(
            "\nNormal PDF extraction successful."
        )

        print(
            "Total extracted characters:",
            len(extracted_text)
        )

        return extracted_text


    # =====================================================
    # OCR FALLBACK
    # =====================================================

    print(
        "\nNormal extraction returned no text."
    )

    print(
        "Trying OCR..."
    )


    ocr_text = extract_with_ocr(
        file_path
    )


    # =====================================================
    # OCR TEXT FOUND
    # =====================================================

    if ocr_text:

        print(
            "\nOCR extraction successful."
        )

        print(
            "Total extracted characters:",
            len(ocr_text)
        )

        return ocr_text


    # =====================================================
    # NOTHING EXTRACTED
    # =====================================================

    print(
        "\nERROR: No text could be extracted."
    )

    return ""