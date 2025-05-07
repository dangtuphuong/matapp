import os
import json
from dotenv import load_dotenv
from langchain_voyageai import VoyageAIEmbeddings
from langchain_openai import ChatOpenAI
from langchain_core.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
    FewShotChatMessagePromptTemplate,
)
from langchain_community.vectorstores import FAISS
from langchain_core.example_selectors import SemanticSimilarityExampleSelector
from langchain.chains import LLMChain


# Load environment variables
load_dotenv()
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# ================= DeepSeek API Configuration =================
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_API_BASE = "https://api.deepseek.com/v1"
DEEPSEEK_MODEL = "deepseek-chat"

# ================= Load Example Data =================
example_data = []
with open("resource/prompts.json", "r", encoding="utf-8") as f:
    example_data = json.load(f)

# ================= Load Schema =================
structure = ""
with open("resource/schema.json", "r", encoding="utf-8") as input_file:
    structure = input_file.read()

# ================= Voyage Embedding Configuration =================
VOYAGE_API_KEY = os.getenv("VOYAGE_API_KEY")
embeddings = VoyageAIEmbeddings(model="voyage-code-3", voyage_api_key=VOYAGE_API_KEY)

# DeepSeek LLM (OpenAI-compatible)
llm = ChatOpenAI(
    model=DEEPSEEK_MODEL,
    temperature=0,
    openai_api_key=DEEPSEEK_API_KEY,
    openai_api_base=DEEPSEEK_API_BASE,
)

# ================= Few-Shot Setup =================
example_selector = SemanticSimilarityExampleSelector.from_examples(
    example_data, embeddings, FAISS, k=4, input_keys=["user_query"]
)

few_shot_prompt = FewShotChatMessagePromptTemplate(
    example_selector=example_selector,
    example_prompt=ChatPromptTemplate.from_messages(
        [("human", "{user_query}"), ("ai", "{mongo_query}")]
    ),
    input_variables=["user_query"],
)


def get_prompt(user_query):
    escaped_structure = structure.replace("{", "{{").replace("}", "}}")

    instruction_prompt = f"""
        You are an expert MongoDB query generator. Create accurate, efficient MongoDB aggregation queries strictly following the schema and user intent.
        SCHEMA INTERPRETATION:
        The schema uses aliases defined in `_ALIAS`.
        - `VMS` (in `_ALIAS.VMS`) is: `{{{{\\"min\\":\\"float\\", \\"max\\":\\"float\\", \\"unit\\":\\"string\\"}}}}`.
        - `PDEF` (in `_ALIAS.PDEF`) is: `[{{{{\\"metric\\":VMS_object, \\"english\\":VMS_object}}}}]`.

        Use the following actual schema for reference:
        ```
        {escaped_structure}
        ```
        QUERY GUIDELINES:
        1.  **Schema Adherence:** Paths must be precise.
        2.  **`PDEF` Field Logic (within `$elemMatch` or for projection):**
            *   **Units:** If user specifies a unit (e.g., "°C", "ksi"), the condition within `$elemMatch` (or for direct access) should be on `metric.unit` or `english.unit`. If no unit specified but implied, assume `metric` and a common unit (e.g., "°C" for temperature, "%" for percentage); otherwise, query numerical `metric` values directly.
            *   **Values:** Use `metric.min` or `english.min` for "lowest", `metric.max` or `english.max` for "highest". For "between X and Y": `metric.max: {{{{ $gte: X }}}} AND metric.min: {{{{ $lte: Y }}}}` (or `english.*`). For "equals X": `metric.min: {{{{ $lte: X }}}} AND metric.max: {{{{ $gte: X }}}}` (or `english.*`).
        3.  **Descriptive/Fallback Properties:**
            *   Query explicitly defined `parsed_properties.Descriptive Properties` (e.g., `Color: ["string"]`) as per their type.
            *   For other properties not `PDEF`, top-level, or explicitly typed in `Descriptive Properties`, assume path `parsed_properties.Descriptive Properties.<PropertyName>`. Perform a case-insensitive text match using `$regex` directly on this field. Example: `{{{{ \\"<path_to_property>\\": {{{{ \\"$regex\\": \\"value\\", \\"$options\\": \\"i\\" }}}} }}}}`.
        4. **Categories Field Rule:**
            * Always query `Categories` using a case-insensitive regex: 
            `{{{{ \\"Categories\\": {{{{ \\"$regex\\": \\"ceramic\\", \\"$options\\": \\"i\\" }}}} }}}}`
        5.  **Existence Checks:** Ensure fields exist and are not null before deep access.
        6.  **Output:** Your ENTIRE response MUST be ONLY the MongoDB aggregation pipeline as a directly parsable JSON array string (e.g., `[{{{{\\\\\\"stage1\\\\\\":{{{{}}}}}}}}, {{{{\\\\\\"stage2\\\\\\":{{{{}}}}}}}}]`). NO explanations, comments, or markdown.
        7.  **Operators:** Use efficient MongoDB operators. Always use `$elemMatch` when filtering conditions apply to elements within an array.
        8.  **Field Name Quoting:**
            *   Always wrap all property names (keys) in **double quotes**, especially those containing spaces, commas, or special characters. Example: `Hardness, Rockwell C`
            *   All keys must be valid JSON strings.
        USER QUERY:
        {user_query}
        DO NOT include any explanations in your response. Output ONLY the MongoDB aggregation pipeline as a valid JSON object.
    """

    return instruction_prompt


def generate_mongodb_query(user_query):
    try:
        instruction_prompt = get_prompt(user_query)

        system_msg = SystemMessagePromptTemplate.from_template(instruction_prompt)
        human_msg = HumanMessagePromptTemplate.from_template("{user_query}")

        chat_prompt = ChatPromptTemplate.from_messages(
            [system_msg, few_shot_prompt, human_msg]
        )

        chain = chat_prompt | llm
        response = chain.invoke({"user_query": user_query})

        return {"success": True, "content": response.content}

    except Exception as e:
        print(f"Error generating MongoDB query: {str(e)}")
        return {
            "success": False,
            "error": str(e),
        }
