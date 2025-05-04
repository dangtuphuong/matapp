import os
import json
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
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

# ================= Initialize DeepSeek LLM =================
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

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
        You are an expert in MongoDB queries. Your task is to generate accurate, efficient, and syntactically correct MongoDB aggregation queries that strictly follow the provided schema structure.
        
        SCHEMA STRUCTURE:
        ```
        {escaped_structure}
        ```
        
        REQUIREMENTS:
        1. Generate ONLY a valid MongoDB query JSON object with no explanation text
        2. The query must conform EXACTLY to the schema structure shown above
        3. Only query the following properties: matGUID, Material Name, Categories, and Material Notes
        4. Use proper MongoDB operators and syntax
        5. Ensure the query addresses the user's intent completely
        6. Return ONLY the query code, nothing else
        
        USER QUERY:
        {user_query}
        
        DO NOT include any explanations in your response. Output ONLY the MongoDB query as a valid JSON object.
    """

    return instruction_prompt


def get_answer(user_query):
    instruction_prompt = get_prompt(user_query)

    system_msg = SystemMessagePromptTemplate.from_template(instruction_prompt)
    human_msg = HumanMessagePromptTemplate.from_template("{user_query}")

    chat_prompt = ChatPromptTemplate.from_messages(
        [system_msg, few_shot_prompt, human_msg]
    )

    chain = LLMChain(llm=llm, prompt=chat_prompt)
    answer = chain.run(user_query=user_query)

    return answer
