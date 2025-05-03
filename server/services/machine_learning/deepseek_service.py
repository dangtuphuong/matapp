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

# ================= Initialize Models =================
# Using HuggingFace embeddings since DeepSeek embeddings aren't directly available in LangChain
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

# DeepSeek LLM (OpenAI-compatible)
llm = ChatOpenAI(
    model=DEEPSEEK_MODEL,
    temperature=0,
    openai_api_key=DEEPSEEK_API_KEY,
    openai_api_base=DEEPSEEK_API_BASE,
)

# ================= Few-Shot Setup (Unchanged) =================
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
        You are an expert in MongoDB queries. Your primary task is to generate accurate, efficient, syntactically and emit strict JSON correct aggregation MongoDB queriese based on the provided schema.  
        - Model: \n{str(escaped_structure)}
        Always and only generate a valid MongoDB query, ensure it matches the user's intent and no explaination. 
        And the only properties that need to query are matGUID and Material Name.
        Here is the user query: 
        {user_query}
        please take reference from below attached example while answering the query
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
