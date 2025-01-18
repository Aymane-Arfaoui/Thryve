import string

def remove_trailing_punctuation(input_string: str) -> str:
    punctuation_set = set(string.punctuation)
    for i in range(len(input_string) - 1, -1, -1):
        char = input_string[i]
        if char not in punctuation_set:
            return input_string[: i + 1]

    return ""