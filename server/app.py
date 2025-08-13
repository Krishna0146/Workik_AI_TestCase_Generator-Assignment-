from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.chains import LLMChain
from langchain.chat_models import init_chat_model
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Enable CORS for all routes
CORS(app)

# Or enable CORS only for specific origins
# CORS(app, origins=['http://localhost:5173', 'http://127.0.0.1:5173'])

# Set up API key
os.environ["MISTRAL_API_KEY"] = os.getenv("MISTRAL_API_KEY")

# Load model
llm = init_chat_model("mistral-large-latest", model_provider="mistralai")

# Prepare prompt
prompt = PromptTemplate.from_template("""
You are a coding assistant. Given a code, generate exactly 4 sample test cases.

Each test case must be in the following format:
Input: <input>
Output: <output>

Do not include any explanation or markdown formatting.

Code:
{code}

Test Cases:
""")

# Create chain
chain = LLMChain(llm=llm, prompt=prompt, output_parser=StrOutputParser())

@app.route("/generate-testcases", methods=["POST"])
def generate_testcases():
    try:
        # Get code from frontend
        data = request.get_json()
        code = data.get("code", "")
        print(code)

        if not code.strip():
            return jsonify({"error": "No code provided"}), 400

        # Generate test cases
        response = chain.invoke({"code": code})

        # Since StrOutputParser returns string directly, not dict
        if isinstance(response, str):
            test_cases_text = response
        elif isinstance(response, dict) and "text" in response:
            test_cases_text = response["text"]
        else:
            return jsonify({"error": "Unexpected model output"}), 500

        # Parse into structured list with line breaks preserved
        lines = test_cases_text.strip().split("\n")
        test_cases = []
        current_case = {}
        capturing_output = False
        capturing_input = False

        for line in lines:
            if line.startswith("Input:"):
                if current_case:
                    test_cases.append(current_case)
                    current_case = {}
                current_case["input"] = line.replace("Input:", "").strip()
                capturing_input = True
                capturing_output = False
            elif line.startswith("Output:"):
                current_case["output"] = line.replace("Output:", "").strip()
                capturing_output = True
                capturing_input = False
            elif capturing_input:
                current_case["input"] += "\n" + line.strip()
            elif capturing_output:
                current_case["output"] += "\n" + line.strip()

        # Append the last case
        if current_case:
            test_cases.append(current_case)

        return jsonify({"test_cases": test_cases})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)