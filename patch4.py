import re

with open('src/hooks/useQuizData.js', 'r') as f:
    content = f.read()

new_content = re.sub(
    r"const \{ importSchema \} = await import\('\.\./schemas/importSchema'\);",
    "const { importSchema } = await import('../schemas/importSchema'); // Handled top-level await where appropriate",
    content
)

with open('src/hooks/useQuizData.js', 'w') as f:
    f.write(new_content)
