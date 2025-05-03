import json
import re
import ast


def clean_and_parse_pipeline(pipeline_str):
    match = re.search(r"```(?:json)?\s*(.*?)\s*```", pipeline_str, re.DOTALL)
    cleaned_str = (
        match.group(1)
        if match
        else pipeline_str.replace("```json", "").replace("```", "").strip()
    )
    try:
        return json.loads(cleaned_str)
    except json.JSONDecodeError:
        return ast.literal_eval(cleaned_str)
