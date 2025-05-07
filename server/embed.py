from pymongo import MongoClient
from sentence_transformers import SentenceTransformer

# Connect to your MongoDB Atlas cluster
client = MongoClient(
    "mongodb+srv://admin:Password@matdb.sn0fflh.mongodb.net/?retryWrites=true&w=majority&appName=matdb"
)
db = client["matdb"]
materials_collection = db["materials"]
embeddings_collection = db["embeddings"]

# Load a pre-trained model for embeddings
model_name = "all-MiniLM-L6-v2"
model = SentenceTransformer(model_name)


def generate_material_text(material):
    """Convert material document to text for embedding generation"""
    text_parts = []

    # Add material name and categories
    text_parts.append(f"Material: {material['mat_name']}")
    text_parts.append(f"Categories: {', '.join(material['categories'])}")

    # Add properties with values
    for prop in material.get("properties", []):
        prop_name = prop["prop_name"]
        prop_values = []

        for val in prop.get("prop_values", []):
            prop_values.append(val.get("text_value", ""))

        text_parts.append(f"{prop_name}: {', '.join(prop_values)}")

    # Add keywords if available
    if "keywords" in material and material["keywords"]:
        text_parts.append(f"Keywords: {material['keywords']}")

    return " ".join(text_parts)


# Get all materials
cursor = materials_collection.find({})
for material in cursor:
    # Skip if material has no mat_id
    if "mat_id" not in material:
        print(
            f"Skipping material with no mat_id: {material.get('mat_name', 'Unknown')}"
        )
        continue

    # Generate text representation
    material_text = generate_material_text(material)

    # Generate embedding
    embedding = model.encode(material_text).tolist()

    # Create or update document in embeddings collection
    embeddings_collection.update_one(
        {"mat_id": material["mat_id"]},
        {
            "$set": {"embedding": embedding, "mat_id": material["mat_id"]},
        },
        upsert=True,
    )

    print(
        f"Updated embedding for material: {material['mat_name']} (ID: {material['mat_id']})"
    )

print("All material embeddings updated in the separate collection")
