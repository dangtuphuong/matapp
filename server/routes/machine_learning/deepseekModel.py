import os
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.prompts import FewShotChatMessagePromptTemplate
from langchain_community.vectorstores import FAISS
from langchain_core.example_selectors import SemanticSimilarityExampleSelector
from langchain.chains import LLMChain
from langchain.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)

# Load environment variables
load_dotenv()
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# ================= DeepSeek API Configuration =================
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_API_BASE = "https://api.deepseek.com/v1"
DEEPSEEK_MODEL = "deepseek-chat"

# ================= Example Data =================
example_data = [
    {
        "user_query": "Top 3 best electricity resistance material",
        "mongo_query": '[{"$project": {"matGUID": 1, "Material Name": 1, "Categories": 1, "Material Notes": 1, "Electrical Resistance": {"$arrayElemAt": ["$parsed_properties.Electrical Properties.Electrical Resistivity.metric.max", 0]}}}, {"$sort": {"Electrical Resistance": -1}}, {"$limit": 3}]',
    },
    {
        "user_query": "What are the strongest ceramic material",
        "mongo_query": '[{"$match": {"Categories": {"$in": ["Ceramic"]}}}, {"$project": {"matGUID": 1, "Material Name": 1, "Categories": 1, "Material Notes": 1, "Compressive Strength": {"$max": {"$map": { "input": "$parsed_properties.Mechanical Properties.Compressive Strength", "as": "item", "in": "$$item.metric.max" }}}}}, {"$sort": {"Compressive Strength": -1}}]',
    },
    {
        "user_query": "What are the material with the compressive strength bigger than 50MPa",
        "mongo_query": '[{"$project": {"matGUID": 1, "Material Name": 1, "Categories": 1, "Material Notes": 1, "Compressive Strength": {"$max": {"$map": { "input": "$parsed_properties.Mechanical Properties.Compressive Strength", "as": "item", "in": "$$item.metric.max" }}}}}, {"$match": {"Compressive Strength": {"$gt": 50}}}]',
    },
    {
        "user_query": "What are the Ceramic materials with max service temp above 1600°C",
        "mongo_query": '[{"$match": {"Categories": {"$in": ["Ceramic"]}}}, {"$project": {"matGUID": 1, "Material Name": 1, "Categories": 1, "Material Notes": 1, "Max Service Temp": {"$max": {"$map": { "input": "$parsed_properties.Thermal Properties.Maximum Service Temperature, Air", "as": "item", "in": "$$item.metric.max" }}}}}, {"$match": {"Max Service Temp": {"$gt": 1600}}}]',
    },
]

# ================= Load Schema =================
script_dir = os.path.dirname(os.path.abspath(__file__))
sub_folder_root = os.path.dirname(script_dir)
project_root = os.path.dirname(sub_folder_root)
schema_path = os.path.join(project_root, "resource", "schema.json")
with open(schema_path, "r", encoding="utf-8") as input_file:
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
        All the properties inside "Properties" might not be digit only, they might be string or even array as well, so you shouldn't transform anything to digit. 
        And the only properties that need to query are matGUI and Material Name.
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
