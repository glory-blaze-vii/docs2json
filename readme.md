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
