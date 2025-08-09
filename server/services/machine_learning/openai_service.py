import os
import json
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate, FewShotChatMessagePromptTemplate
from langchain_core.example_selectors import SemanticSimilarityExampleSelector
from langchain.prompts import SystemMessagePromptTemplate, HumanMessagePromptTemplate

# ================= Load Example Data =================
example_data = []
with open("resource/prompts.json", "r", encoding="utf-8") as f:
    example_data = json.load(f)

# ================= Load Schema =================
structure = ""
with open("resource/schema.json", "r", encoding="utf-8") as input_file:
    structure = input_file.read()

# ================= Environment Setup =================
load_dotenv()


def require_api_key():
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise EnvironmentError("OPENAI_API_KEY is missing.")
    return openai_api_key


# ================= Lazy Loaders =================
llm = None
embeddings = None
example_selector = None
few_shot_prompt = None


def get_llm():
    global llm
    if llm is None:
        # gpt-4.1-nano, gpt-4o-mini or gpt-4.1-mini
        llm = ChatOpenAI(
            temperature=0, model="gpt-5-nano", openai_api_key=require_api_key()
        )
    return llm


def get_embeddings():
    global embeddings
    if embeddings is None:
        embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small", openai_api_key=require_api_key()
        )
    return embeddings


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


def get_answer(user_query):
    try:
        instruction_prompt = get_prompt(user_query)

        system_msg = SystemMessagePromptTemplate.from_template(instruction_prompt)
        human_msg = HumanMessagePromptTemplate.from_template("{user_query}")

        chat_prompt = ChatPromptTemplate.from_messages(
            [system_msg, get_few_shot_prompt(), human_msg]
        )

        chain = chat_prompt | get_llm()
        answer = chain.invoke({"user_query": user_query})

        return {"success": True, "content": answer.content}

    except Exception as e:
        print(f"Error generating MongoDB query: {str(e)}")
        return {"success": False, "error": str(e)}
