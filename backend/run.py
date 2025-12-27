import os
import sys
import uvicorn
from pathlib import Path

# Add the calculation source directory to the Python path
calculation_src = os.path.abspath(os.path.join(os.path.dirname(__file__), "calculation", "calculation-main", "src"))
sys.path.insert(0, calculation_src)

backend_dir = os.path.dirname(__file__)

if __name__ == "__main__":
    # Run the unified FastAPI app from main.py
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[calculation_src, backend_dir],
        workers=1
    )
