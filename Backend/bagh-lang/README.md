# 🐯 Bagh Lang

Bagh Lang (`.bg`) is a bilingual (Bangla + phonetic Latin) programming language that translates into Python at runtime. It was crafted by [Shahriar Labs](https://shahriarlabs.com/) to help kids pick up code in their native language. Mix Bangla keywords such as `যদি` or `লিখো` with familiar transliterations like `jodi` or `likho`, then watch them run instantly.

![Bagh Lang Logo](bagh_lang/assets/bagh_logo.png)

> Looking for the FastAPI cloud service? It now lives in `Backend/app/` so the language package stays lean.

## Features
- Bangla and phonetic Latin keywords mapped to Python control flow and built-ins.
- Automatic conversion of Bangla numerals (`১`, `২`, `৩`, …) to Western digits.
- Standard-library shorthands (`গণিত`, `সময়`, `স্ট্রিং`) for Python's `math`, `time`, and `str`.
- Interactive REPL (`bagh repl`) with a Bangla banner.
- Basic syntax validation powered by `lark` when available (falls back to `ast.parse`).
- Packaged CLI runner with PyInstaller for Python-free distribution.
- Built-in branding commands (`bagh logo`) to view the ASCII banner and packaged logo location.
- Kid-friendly Tkinter IDE (`bagh-gui`) featuring a big Run button, colorful console, and workspace sidebar for creating/opening `.bg` stories.

## Maintainer
- Built with love by [Shihab Shahriar](https://github.com/shihabshahrier) at [Shahriar Labs](https://shahriarlabs.com/).

## Quick Start

```bash
git clone https://github.com/shihabshahrier/bagh-lang.git
cd bagh-lang
python3 -m bagh_lang bagh_lang/examples/hello.bg
```

Output:

```
🐯 বাঘ এসেছে!
```

### REPL

```bash
python3 -m bagh_lang repl
# or once packaged:
./dist/bagh repl
```

Banner preview:

```
🐯  Bagh Lang v0.1
>>> লিখো("হাই")
হাই
```

## Installation

### From Source

```bash
git clone https://github.com/shihabshahrier/bagh-lang.git
cd bagh-lang
python3 -m pip install .
```

This installs the `bagh` CLI, so you can run:

```bash
bagh path/to/program.bg
bagh repl
bagh logo
bagh-gui  # launches the Tkinter editor (requires local Python install)
```

### Optional Syntax Extras

Install with syntax validation support:

```bash
python3 -m pip install .[syntax]
```

### Graphical App

After installation you can launch the Tkinter UI via `bagh-gui`. The window lets you edit Bangla/Latin `.bg` files, run them, and inspect console output with Bangla error messages. Use the File ▸ Open menu to load existing scripts or start from the pre-populated banner.

### More Examples

- `bagh_lang/examples/hello.bg` — single-line greeting.
- `bagh_lang/examples/fizzbuzz.bg` — Bangla FizzBuzz using `ঘুরো … বার` loops and conditionals.
- `bagh_lang/examples/showcase.bg` — comprehensive feature tour covering type conversion, loops, data structures, and module helpers.
- Data structures demo:

  ```bg
  ফল = তালিকা(["আম", "কলা", "লিচু"])
  লিখো("দ্বিতীয় ফল:", ফল[১])

  ছাত্র = তথ্য({
      "নাম": "রফিক",
      "বয়স": ১৫
  })
  লিখো("ছাত্রের নাম:", ছাত্র["নাম"])
  ```

- Type conversion helpers:

  ```bg
  সংখ্যা_মান = সংখ্যা("৫")
  দশমিক = দশমি("৩.১৪")
  বাক্য_টেক্সট = বাক্য(দশমিক)
  শব্দ_টেক্সট = শব্দ(সংখ্যা_মান)

  লিখো("রূপান্তর int:", সংখ্যা_মান)
  লিখো("রূপান্তর float:", দশমিক)
  লিখো("বাক্য:", বাক্য_টেক্সট)
  লিখো("শব্দ:", শব্দ_টেক্সট)
  ```

## Language Reference

| Bagh Token | Latin | Python |
|------------|-------|--------|
| `যদি` | `jodi` | `if` |
| `নয়তো` | `noyto` | `else` |
| `ফাংশন`, `কাজ` | `function`, `kaj` | `def` |
| `ফেরত` | `ferot` | `return` |
| `লিখো` | `likho` | `print` |
| `ঘুরো`, `জন্য` | `ghuro`, `jonno` | `for` |
| `বার` | `bar` | `in range` *(auto-wraps count: `ঘুরো আই ৩ বার` → `for আই in range(3)`)* |
| `যখন`, `যাবত` | `jokhon`, `jabat` | `while` |
| `থামাও` | `thamao` | `break` |
| `চালাও` | `chalao` | `continue` |
| `সত্য` | `sotto` | `True` |
| `মিথ্যা` | `mithya` | `False` |
| `গণিত` | `gonit` | `math` |
| `সময়` | `shomoy` | `time` |
| `স্ট্রিং` | `string` | `str` |
| `তালিকা` | `talika` | `list` |
| `তথ্য` | `tottho` | `dict` |
| `সংখ্যা` | `shongkha` | `int` |
| `দশমি` | `doshomi` | `float` |
| `বাক্য`, `শব্দ` | `bakkyo`, `shobdo` | `str` |

Bangla numerals are converted automatically, so `লিখো(১ + ২)` prints `3`.

### Loop Examples

```bg
ঘুরো আই ৩ বার:
    লিখো("বাঘ " + str(আই))

সংখ্যা = ১
যখন সংখ্যা <= ৩:
    লিখো("গণনা: " + str(সংখ্যা))
    সংখ্যা = সংখ্যা + ১
```

Translates to:

```python
for আই in range(3):
    print("বাঘ " + str(আই))

সংখ্যা = 1
while সংখ্যা <= 3:
    print("গণনা: " + str(সংখ্যা))
    সংখ্যা = সংখ্যা + 1
```

## Development

- `bagh_lang/translator.py` handles keyword and numeral translation.
- `bagh_lang/runtime.py` validates and executes translated code, surfacing Bangla error messages.
- `bagh_lang/repl.py` implements the interactive shell.
- `bagh_lang/examples/hello.bg` offers a quick smoke test.

To run a `.bg` file directly during development:

```bash
python3 -m bagh_lang path/to/file.bg
```

## License

Licensed under the [MIT License](LICENSE).
