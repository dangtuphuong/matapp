import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate, FewShotChatMessagePromptTemplate
from langchain_community.vectorstores import FAISS
from langchain_core.example_selectors import SemanticSimilarityExampleSelector

# Load environment variables
load_dotenv()


# ================= Gemini Configuration =================
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = "gemini-2.5-pro-exp-03-25"

# ================= Example Data (Same as Before) =================
example_data = [
    {
        "user_query": "Top 3 best electricity resistance material",
        "mongo_query": '[{"$project": {"matGUID": 1,"Material Name": 1,"Categories": 1,"Material Notes": 1,"Electrical Resistance": {"$arrayElemAt": ["$parsed_properties.Electrical Properties.Dielectric Strength.metric.max", 0]}}},{"$sort": {"Electrical Resistance": -1}},{"$limit": 3}]',
    },
    {
        "user_query": "What are the strongest ceramic material",
        "mongo_query": '[{"$match": {Categories: {"$all": ["Ceramic"]}}},{"$project": {"matGUI": 1,"Material Name": 1, "Categories": 1,"Material Notes": 1,"Tensile Strength (Metric)": { "$max": "$parsed_properties.Mechanical Properties.Tensile Strength, Ultimate.metric.max"},"Tensile Strength (English)": {"$max": "$parsed_properties.Mechanical Properties.Tensile Strength, Ultimate.english.max"}}},{"$sort": {"Tensile Strength (Metric)": -1,"Tensile Strength (English)": -1}}]',
    },
    {
        "user_query": "What are the material with the tensile strength bigger than 1235MPa",
        "mongo_query": '{"$project": {"Material Name": 1,"matGUID": 1,"Categories": 1,"Material Notes": 1,"parsed_properties.Mechanical Properties.Tensile Strength.metric.max": 1}},{"$match": {"parsed_properties.Mechanical Properties.Tensile Strength.metric.max": { "$gt": 1235 }}}',
    },
    {
        "user_query": "What are the Metal material with the tensile strength bigger than 179100 psi",
        "mongo_query": '[{"$match": {"Categories": "Metal","parsed_properties.Mechanical Properties.Tensile Strength, Yield.english.max": { "$gt": 179100 }}},{"$project": {"matGUID": 1,"Material Name": 1,"Categories": 1,"Material Notes": 1,"parsed_properties.Mechanical Properties.Tensile Strength, Yield.english": 1}}]',
    },
]

# ================= Load Schema =================
script_dir = os.path.dirname(os.path.abspath(__file__))
sub_folder_root = os.path.dirname(script_dir)
project_root = os.path.dirname(sub_folder_root)
schema_path = os.path.join(project_root, "resource", "schema.txt")
with open(schema_path, "r", encoding="utf-8") as input_file:
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

    prompt = ChatPromptTemplate.from_messages(
        [("human", instruction_prompt), few_shot_prompt, ("human", "{user_query}")]
    )

    chain = prompt | llm
    return chain.invoke({"user_query": user_query}).content
