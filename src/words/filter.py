words = set()

common_words = set()

with open("common.wordlist.txt", encoding="utf-8") as f:
    for line in f:
        common_words.add(line.strip())

with open("SHsnid.csv", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        _, _, _, _, form, _ = line.split(";")
        form = form.lower()
        if form in common_words or not form.isalpha():
            continue
        if len(form) == 5:
            words.add(form)

words = sorted(words)

with open("all.wordlist.txt", "w+", encoding="utf-8", newline="\n") as f:
    for i in words:
        f.write(f"{i}\n")
