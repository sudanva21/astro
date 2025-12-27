"""
Quick script to verify dasha chunk exists in database
"""
import asyncio
from dotenv import load_dotenv
load_dotenv()

from mongo import connect_to_mongo, mongo_db

async def verify_dasha():
    await connect_to_mongo()
    
    # Get all chunk types from the horoscope_chunks collection
    pipeline = [
        {"$group": {"_id": "$chunk_type", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    
    print("Chunk types in database:")
    print("-" * 40)
    async for doc in mongo_db.db.horoscope_chunks.aggregate(pipeline):
        chunk_type = doc["_id"]
        count = doc["count"]
        print(f"  {chunk_type}: {count} chunks")
    
    print("\n" + "-" * 40)
    # Get a sample dasha chunk
    dasha_chunk = await mongo_db.db.horoscope_chunks.find_one(
        {"chunk_type": "dasha"},
        {"_id": 0, "chunk_type": 1, "data": 1}
    )
    
    if dasha_chunk:
        print("Sample dasha chunk found:")
        print(f"  Chunk type: {dasha_chunk['chunk_type']}")
        if 'data' in dasha_chunk and 'system' in dasha_chunk['data']:
            print(f"  System: {dasha_chunk['data']['system']}")
            periods_count = len(dasha_chunk['data'].get('periods', []))
            print(f"  Mahadasha periods: {periods_count}")
            
            # Show first period as sample
            if dasha_chunk['data'].get('periods'):
                first_period = dasha_chunk['data']['periods'][0]
                print(f"  First Mahadasha lord: {first_period.get('lord')}")
                print(f"  Antardasha count: {len(first_period.get('antardasha', []))}")
    else:
        print("No dasha chunk found in database")
    
    from mongo import close_mongo_connection
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(verify_dasha())
