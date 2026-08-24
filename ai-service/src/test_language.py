def detect_language(text):
    text = str(text).strip()

    if not text:
        return "unknown"

    sinhala_chars = 0
    tamil_chars = 0
    latin_chars = 0

    for char in text:
        code = ord(char)

        # Sinhala Unicode block: U+0D80–U+0DFF
        if 0x0D80 <= code <= 0x0DFF:
            sinhala_chars += 1

        # Tamil Unicode block: U+0B80–U+0BFF
        elif 0x0B80 <= code <= 0x0BFF:
            tamil_chars += 1

        # Basic Latin letters
        elif char.isascii() and char.isalpha():
            latin_chars += 1

    if sinhala_chars > 0:
        return "si"

    if tamil_chars > 0:
        return "ta"

    if latin_chars > 0:
        return "en"

    return "unknown"


complaints = [
    "There is a large pothole near our house.",
    "අපේ ගෙදර ළඟ පාරේ ලොකු වළක් තියෙනවා.",
    "எங்கள் வீட்டிற்கு அருகில் சாலையில் பெரிய குழி உள்ளது."
]


for complaint in complaints:

    language = detect_language(complaint)

    print("\nComplaint:")
    print(complaint)

    print("Detected Language:")
    print(language)