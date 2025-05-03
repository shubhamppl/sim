from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
 
app = FastAPI()

# Add CORS middleware to allow requests from your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
class IngredientData(BaseModel):
    base_price: float
    weight: float
    tariff_percent: float
    supplier_absorption: float
 
# Temporary storage for responses (max 10)
price_responses: List[dict] = []
 
@app.post("/calculate-price/")
async def calculate_price(data: IngredientData):
 
    new_tariff = (data.base_price * data.weight) + (data.tariff_percent / 100)
    tariff_increased_amount = new_tariff - (data.base_price * data.weight)
    supplier_absorption_cost = tariff_increased_amount * data.supplier_absorption / 100
    final_price = new_tariff - supplier_absorption_cost
 
    result = {
        "new_tariff": new_tariff,
        "tariff_increased_amount": tariff_increased_amount,
        "supplier_absorption_cost": supplier_absorption_cost,
        "final_price": final_price
    }
 
    # Store result in the cache (only keep last 10)
    if len(price_responses) >= 10:
        # Remove oldest entry to maintain size 10
        price_responses.pop(0)
    price_responses.append(result)
 
    return {
        "result": result,
        "all_saved_responses": price_responses
    }

# Add endpoint to process supply chain data
@app.post("/process-supply-data/")
async def process_supply_data(data: dict):
    """
    Process supply chain data uploaded from the frontend
    """
    try:
        # Extract data from the request
        headers = data.get("headers", [])
        rows = data.get("rows", [])
        
        # Process the data (here we just count the rows as an example)
        row_count = len(rows)
        
        return {
            "success": True,
            "message": f"Successfully processed {row_count} rows of supply data",
            "headers": headers,
            "sample_rows": rows[:5] if rows else [] # Return first 5 rows as sample
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Error processing supply data: {str(e)}"
        }


