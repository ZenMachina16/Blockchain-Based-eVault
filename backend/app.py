import os
import subprocess
from flask import Flask, request, send_file, jsonify
from fpdf import FPDF
import spacy
import heapq
from collections import Counter
from pdfminer.high_level import extract_text
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for the Flask app
CORS(app)

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

# Risk-related words
RISK_WORDS = ["fraud", "penalty", "violation", "risk", "lawsuit", "breach",
              "noncompliance", "litigation", "regulatory", "fine"]

# Path to save uploaded PDFs
UPLOAD_FOLDER = './uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Function to extract text from the PDF
def extract_text_from_pdf(pdf_path):
    return extract_text(pdf_path)

# Function to extract key clauses from the text
def extract_key_clauses(text):
    text = text.replace("\n", " ").strip()
    doc = nlp(text)
    return [sent.text.strip() for sent in doc.sents if len(sent.text) > 10][:10]

# Function to summarize the text
def summarize_text(text, num_sentences=5):
    doc = nlp(text)
    word_frequencies = Counter([token.text.lower() for token in doc if token.is_alpha and not token.is_stop])
    sentence_scores = {sent: sum(word_frequencies.get(word.text.lower(), 0) for word in sent) for sent in doc.sents}
    return ' '.join(str(sent) for sent in heapq.nlargest(num_sentences, sentence_scores, key=sentence_scores.get))

# Function to detect risks in the text
def detect_risks(text):
    return list(set(token.text for token in nlp(text.lower()) if token.text in RISK_WORDS))

# Function to generate a PDF report
def generate_pdf_report(summary, clauses, risks, updates, pdf_path="Analysis_Results.pdf"):
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    pdf.cell(200, 10, "Legal Document Analysis Report", ln=True, align="C")
    pdf.ln(10)

    pdf.set_font("Arial", "B", 12)
    pdf.cell(200, 10, " Summary:", ln=True)
    pdf.set_font("Arial", "", 11)
    pdf.multi_cell(0, 10, summary if summary else "No summary available.")
    pdf.ln(5)

    pdf.set_font("Arial", "B", 12)
    pdf.cell(200, 10, " Key Clauses:", ln=True)
    pdf.set_font("Arial", "", 11)
    for i, clause in enumerate(clauses, 1):
        pdf.multi_cell(0, 10, f"{i}. {clause}")
    pdf.ln(5)

    pdf.set_font("Arial", "B", 12)
    pdf.cell(200, 10, " Detected Risks:", ln=True)
    pdf.set_font("Arial", "", 11)
    pdf.multi_cell(0, 10, ", ".join(risks) if risks else "No risks detected.")
    pdf.ln(5)

    pdf.set_font("Arial", "B", 12)
    for update in updates:
        pdf.multi_cell(0, 10, f"- {update['title']}: {update['summary']}")

    pdf.output(pdf_path)
    return pdf_path

# Function to process the PDF
def process_pdf(pdf_path):
    text = extract_text_from_pdf(pdf_path)
    summary = summarize_text(text)
    clauses = extract_key_clauses(text)
    risks = detect_risks(text)
    updates = get_regulatory_updates()

    pdf_path = generate_pdf_report(summary, clauses, risks, updates)
    return pdf_path

# Mock function to return regulatory updates
def get_regulatory_updates():
    return [
        {"title": "New Data Protection Law", "summary": "The latest regulations require enhanced user consent for data collection."},
        {"title": "Compliance Update", "summary": "Updated guidelines on contract enforcement and risk mitigation."}
    ]
    
    
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB limit

@app.route('/')
def home():
    return "Flask server is running on port 5001!"


# Endpoint to upload PDF
@app.route('/upload', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Save the uploaded file
    pdf_filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(pdf_filename)

    # Process the uploaded PDF
    generated_pdf = process_pdf(pdf_filename)
    if not generated_pdf:
        return jsonify({'error': 'Error generating PDF report'}), 500

    # Send the generated PDF back to the client
    return send_file(generated_pdf, as_attachment=True, download_name="summary_report.pdf")

if __name__ == '__main__':
     app.run(debug=True, port=5001)
