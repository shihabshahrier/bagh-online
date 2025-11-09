"""Keyword and literal mappings used by the Bagh Lang translator."""

# Mapping from Bangla or phonetic Latin tokens to Python equivalents.
bangla_to_python = {
    # Conditions
    "যদি": "if",
    "jodi": "if",
    "নয়তো": "else",
    "noyto": "else",
    "নাহলে": "elif",
    "nahole": "elif",

    # Loops
    "ঘুরো": "for",
    "ghuro": "for",
    "জন্য": "for",
    "jonno": "for",
    "বার": "in range",
    "bar": "in range",
    "যখন": "while",
    "jokhon": "while",
    "যাবত": "while",
    "jabat": "while",
    "থামাও": "break",
    "thamao": "break",
    "চালাও": "continue",
    "chalao": "continue",
    "চালিয়ে_যাও": "continue",
    "chalie_jao": "continue",

    # Functions
    "কাজ": "def",
    "kaj": "def",
    "ফাংশন": "def",
    "function": "def",
    "ফেরত": "return",
    "ferot": "return",

    # Input / Output
    "লিখো": "print",
    "likho": "print",
    "পড়ো": "input",
    "poro": "input",

    # Truthy / falsy
    "সত্য": "True",
    "sotto": "True",
    "মিথ্যা": "False",
    "mithya": "False",

    # Standard modules / helpers
    "গণিত": "math",
    "gonit": "math",
    "সময়": "time",
    "shomoy": "time",
    "স্ট্রিং": "str",
    "string": "str",

    # Data structures
    "তালিকা": "list",
    "talika": "list",
    "তথ্য": "dict",
    "tottho": "dict",

    # Type conversion
    "সংখ্যা": "int",
    "shongkha": "int",
    "দশমি": "float",
    "doshomi": "float",
    "বাক্য": "str",
    "bakkyo": "str",
    "শব্দ": "str",
    "shobdo": "str",
}

# Bangla numeral mapping for direct substitution.
bangla_numerals = {
    "০": "0",
    "১": "1",
    "২": "2",
    "৩": "3",
    "৪": "4",
    "৫": "5",
    "৬": "6",
    "৭": "7",
    "৮": "8",
    "৯": "9",
}
