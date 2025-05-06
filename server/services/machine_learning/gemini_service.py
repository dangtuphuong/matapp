import os
import json
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate, FewShotChatMessagePromptTemplate
from langchain_community.vectorstores import FAISS
from langchain_core.example_selectors import SemanticSimilarityExampleSelector


# Load environment variables
load_dotenv()


# ================= Gemini Configuration =================
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = "gemini-2.5-flash-preview-04-17"

# ================= Load Example Data =================
example_data = []
with open("resource/prompts.json", "r", encoding="utf-8") as f:
    example_data = json.load(f)


# ================= Load Schema =================
structure = ""
with open("resource/schema.json", "r", encoding="utf-8") as input_file:
    structure = input_file.read()

# ================= Initialize Models =================
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001", google_api_key=os.getenv("GOOGLE_API_KEY")
)

llm = ChatGoogleGenerativeAI(
    model=GEMINI_MODEL,
    temperature=0,
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    convert_system_message_to_human=True,
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
        3. Use proper MongoDB operators and syntax
        4. Ensure the query addresses the user's intent completely
        5. Return ONLY the query code, nothing else
        
        USER QUERY:
        {user_query}
        
        DO NOT include any explanations in your response. Output ONLY the MongoDB query as a valid JSON object.
    """

    return instruction_prompt


def generate_mongodb_query(user_query):
    try:
        instruction_prompt = get_prompt(user_query)

        prompt = ChatPromptTemplate.from_messages(
            [("system", instruction_prompt), few_shot_prompt, ("human", "{user_query}")]
        )

        chain = prompt | llm
        response = chain.invoke({"user_query": user_query})

        return {"success": True, "content": response.content}

    except Exception as e:
        print(f"Error generating MongoDB query: {str(e)}")
        return {
            "success": False,
            "error": str(e),
        }
