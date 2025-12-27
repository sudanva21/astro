import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import certifi

load_dotenv()

async def check_feedback_collection():
    mongo_uri = os.getenv("MONGO_URI")
    db_name = os.getenv("DB_NAME", "unified_backend")
    
    client = AsyncIOMotorClient(mongo_uri, tlsCAFile=certifi.where())
    db = client[db_name]
    
    print("Checking feedback collection in MongoDB...")
    print("-" * 60)
    
    # Get all feedback
    feedback_list = await db.feedback.find().to_list(100)
    
    print(f"\nTotal feedback entries: {len(feedback_list)}\n")
    
    for i, feedback in enumerate(feedback_list, 1):
        print(f"Feedback #{i}:")
        print(f"  ID: {feedback['_id']}")
        print(f"  Username: {feedback.get('username', 'N/A')}")
        print(f"  User ID: {feedback.get('user_id', 'N/A')}")
        print(f"  Rating: {feedback.get('rating', 'N/A')} stars")
        print(f"  Review: {feedback.get('review_text', 'No review')}")
        print(f"  Created: {feedback.get('created_at', 'N/A')}")
        print("-" * 60)
    
    client.close()
    print("\n✅ Database verification complete!")

if __name__ == "__main__":
    asyncio.run(check_feedback_collection())
