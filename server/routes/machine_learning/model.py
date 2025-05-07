import os
import json
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
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

# ================= Load Example Data =================
example_data = []
with open("resource/prompts.json", "r", encoding="utf-8") as f:
    example_data = json.load(f)

# ================= Load Schema =================
structure = ""
with open("resource/schema.json", "r", encoding="utf-8") as input_file:
    structure = input_file.read()

# Load environment variables
load_dotenv()

# Get API key from environment
openai_api_key = os.getenv("OPENAI_API_KEY")

llm = ChatOpenAI(temperature=0, model="gpt-4o-mini", openai_api_key=openai_api_key)
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small", openai_api_key=openai_api_key
)

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


def get_few_shot_prompt():
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


def get_answer(user_query):
    try:
        instruction_prompt = get_prompt(user_query)

        system_msg = SystemMessagePromptTemplate.from_template(instruction_prompt)
        human_msg = HumanMessagePromptTemplate.from_template("{user_query}")

        chat_prompt = ChatPromptTemplate.from_messages(
            [system_msg, few_shot_prompt, human_msg]
        )

        chain = chat_prompt | llm
        answer = chain.invoke({"user_query": user_query})

        return {"success": True, "content": answer.content}

    except Exception as e:
        print(f"Error generating MongoDB query: {str(e)}")
        return {
            "success": False,
            "error": str(e),
        }
