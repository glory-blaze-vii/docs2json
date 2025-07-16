# README.md

## 📄 docs2json: Document to JSON Converter with STS Scoring

Convert `.docx` and `.pdf` documents into structured JSON files using OpenAI’s GPT models.

---

## 🚀 Features

- Upload `.docx` and `.pdf` files
- Extract clean, readable dialogue from sales conversations
- Auto-structure with semantic tags:
  - Step (1–4) from GBI framework
  - Conversation type 
  - EQ Skill annotations
- Output STS scoring metadata for:
  - Listening
  - Question Quality
  - Closing Score
  - Emotional Intelligence
- JSON output or `.jsonl` batch export

---

## 📂 Folder Structure
```
docs2json/
├── main.py                   # Core conversion logic
├── scoring.py                # STS scoring calculator
├── sample-document.txt       # Example text input
├── test-document.pdf         # Example PDF input
├── routes.ts                 # API routing layer
├── server/services/          # PDF/DOCX parser, OpenAI client
├── output_json/              # Final structured .json files
├── prompts/                  # LLM prompt templates
└── .gitignore                # Ignored files & secrets
```

---

## ✅ STS Scoring Sample Output
```json
{
  "step": "2",
  "type": "Sales Professional ↔ Buyer Client",
  "scenario": "Positive – Momentum Builder",
  "sts_scoring": {
    "Listening_Score": 1,
    "Question_Quality": 1,
    "Solutions_Score": 1,
    "Closing_Score": 0,
    "EQ_Labeling": 1,
    "Rapport_Confidence": "High"
  },
  "overall_score": 82,
  "grade": "B"
}
```

---

## 🛠️ Setup Instructions

1. Clone the repo (after pushing from Replit):
```bash
git clone https://github.com/glory-blaze-vii/docs2json.git
cd docs2json
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Add your OpenAI key in `.env` or Replit Secrets:
```env
OPENAI_API_KEY=sk-...
```

4. Run it:
```bash
python main.py
```

---

## 📧 Maintainers
- Michael Lawrence Morgan (michael@delyorkgroup.com)

---

## 📜 License
MIT (Add LICENSE file if desired)

---

# .gitignore
```
# Python
__pycache__/
*.py[cod]
*.egg
*.egg-info/
*.pyo

# Environments
.venv/
venv/
ENV/
.env

# Logs
logs/
*.log

# Secrets
openai_key.txt
apikeys.json

# Replit
.replit
.replitdev/

# Output
output_json/
*.jsonl
*.tmp
```
