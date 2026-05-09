from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

print("Connecting to Qdrant...")
client = QdrantClient("http://127.0.0.1:6333")

collection_name = "kimi_memories"

try:
    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=1024, distance=Distance.COSINE),
    )
    print(f"Success: Collection '{collection_name}' created!")
except Exception as e:
    print(f"Notice: {e}")
