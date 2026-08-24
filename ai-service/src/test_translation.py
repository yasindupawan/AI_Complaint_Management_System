from deep_translator import GoogleTranslator


def translate_to_english(text, language):

    if language == "en":
        return text

    if language == "si":
        source_language = "si"

    elif language == "ta":
        source_language = "ta"

    else:
        raise ValueError("Unsupported language")

    translated_text = GoogleTranslator(
        source=source_language,
        target="en"
    ).translate(text)

    return translated_text


complaints = [
    (
        "අපේ ගෙදර ළඟ පාරේ ලොකු වළක් තියෙනවා.",
        "si"
    ),
    (
        "எங்கள் பகுதியில் இரண்டு நாட்களாக தண்ணீர் வரவில்லை.",
        "ta"
    ),
    (
        "Garbage has not been collected for several days.",
        "en"
    )
]


for complaint, language in complaints:

    translated = translate_to_english(
        complaint,
        language
    )

    print("\nOriginal:")
    print(complaint)

    print("Language:")
    print(language)

    print("English Translation:")
    print(translated)