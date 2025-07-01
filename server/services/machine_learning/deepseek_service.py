import os
import json
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
    FewShotChatMessagePromptTemplate,
)
from langchain_community.vectorstores import FAISS
from langchain_core.example_selectors import SemanticSimilarityExampleSelector


# Load environment
load_dotenv()
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# ================= DeepSeek API Configuration =================
deepseek_api_key = os.getenv("DEEPSEEK_API_KEY")
deepseek_api_base = "https://api.deepseek.com/v1"
deepseek_model = "deepseek-chat"


# ================= Load Static Resources =================
example_data = []
with open("resource/prompts.json", "r", encoding="utf-8") as f:
    example_data = json.load(f)

# ================= Load Schema =================
structure = ""
with open("resource/schema.json", "r", encoding="utf-8") as input_file:
    structure = input_file.read()

# ================= Lazy Load Globals =================
embeddings = None
llm = None
example_selector = None
few_shot_prompt = None


GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")


def get_embeddings():
    global embeddings
    if embeddings is None:
        # Check if the Google API key is missing
        if GOOGLE_API_KEY is None:
            raise ValueError(
                "Embedding failed: Google API Key is missing. DeepSeek currently does not support embedding."
            )

        embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001", google_api_key=GOOGLE_API_KEY
        )
    return embeddings


def get_llm():
    global llm
    if llm is None:
        if not deepseek_api_key:
            raise ValueError("DEEPSEEK_API_KEY is missing.")
        llm = ChatOpenAI(
            model=deepseek_model,
            temperature=0,
            openai_api_key=deepseek_api_key,
            openai_api_base=deepseek_api_base,
        )
    return llm


def get_example_selector():
    global example_selector
    if example_selector is None:
        example_selector = SemanticSimilarityExampleSelector.from_examples(
            example_data, get_embeddings(), FAISS, k=4, input_keys=["user_query"]
        )
    return example_selector


def get_few_shot_prompt():
    global few_shot_prompt
    if few_shot_prompt is None:
        few_shot_prompt = FewShotChatMessagePromptTemplate(
            example_selector=get_example_selector(),
            example_prompt=ChatPromptTemplate.from_messages(
                [("human", "{user_query}"), ("ai", "{mongo_query}")]
            ),
            input_variables=["user_query"],
        )
    return few_shot_prompt


def get_prompt(user_query):
    escaped_structure = structure.replace("{", "{{").replace("}", "}}")

    instruction_prompt = f"""
        You are an expert at writing MongoDB aggregation pipelines. Generate a **valid JSON array string** that matches the **user intent** and strictly follows the **schema**.

        **SCHEMA FORMAT:**
            - {str(escaped_structure)}

        **RULES:**
        1. **Use precise field paths** from the schema.
        2. **PDEF logic**:
            - Units: If specified, filter `metric.unit` or `english.unit`. If implied, assume `metric`.
            - Values:
                - "lowest": use `*.min $lte X`
                - "highest": use `*.max $gte X`
                - "between X and Y": `*.max $gte X AND *.min $lte Y`
                - "equals X": `*.min $lte X AND *.max $gte X`
        3. **Other properties**:
            - Use `parsed_properties.Descriptive Properties.<Property>` and apply case-insensitive `$regex`.
        4. **Categories**: Always query with case-insensitive regex.
        5. **Check field existence** before deep access.
        6. **No explanations**. Return **only** the aggregation pipeline as a JSON string.
        7. **Must quote all keys** with double quotes. Use `$elemMatch` for arrays.

        USER QUERY:
        {user_query}
    """

    return instruction_prompt


def generate_mongodb_query(user_query):
    try:
        instruction_prompt = get_prompt(user_query)

        system_msg = SystemMessagePromptTemplate.from_template(instruction_prompt)
        human_msg = HumanMessagePromptTemplate.from_template("{user_query}")

        chat_prompt = ChatPromptTemplate.from_messages(
            [system_msg, get_few_shot_prompt(), human_msg]
        )

        chain = chat_prompt | get_llm()
        response = chain.invoke({"user_query": user_query})

        return {"success": True, "content": response.content}

    except Exception as e:
        print(f"Error generating MongoDB query: {str(e)}")
        return {"success": False, "error": str(e)}
