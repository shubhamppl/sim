from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from fastapi.middleware.cors import CORSMiddleware
import datetime
import json
import os

app = FastAPI()

# Add CORS middleware to allow requests from your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# This will store our uploaded data in memory
supply_chain_data = []
product_data = []
 
class IngredientData(BaseModel):
    base_price: float
    weight: float
    tariff_percent: float
    supplier_absorption: float

class IngredientSourceRequest(BaseModel):
    ingredient_name: str
    product_name: str
    country: Optional[str] = None
    import_country: Optional[str] = None
    cash_payment_delay: Optional[int] = None
 
# Temporary storage for responses (max 10)
price_responses: List[dict] = []

@app.post("/process-supply-data/")
async def process_supply_data(data: dict):
    """
    Process supply chain data uploaded from the frontend
    """
    try:
        # Extract data from the request
        headers = data.get("headers", [])
        rows = data.get("rows", [])
        
        # Store the supply chain data globally
        global supply_chain_data
        supply_chain_data = {
            "headers": headers,
            "rows": rows
        }
        
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

@app.post("/process-product-data/")
async def process_product_data(data: dict):
    """
    Process product data uploaded from the frontend
    """
    try:
        # Extract data from the request
        headers = data.get("headers", [])
        rows = data.get("rows", [])
        
        # Store the product data globally
        global product_data
        product_data = {
            "headers": headers,
            "rows": rows
        }
        
        return {
            "success": True,
            "message": f"Successfully processed {len(rows)} rows of product data",
            "headers": headers,
            "sample_rows": rows[:5] if rows else []
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Error processing product data: {str(e)}"
        }

@app.post("/ingredient-source-details/")
async def get_ingredient_source_details(request: IngredientSourceRequest):
    """
    Get detailed data for an ingredient source based on the request parameters.
    Used for populating the edit form with supply chain data.
    """
    try:
        # Access our global data
        global supply_chain_data
        global product_data
        
        # Find indices for relevant columns in supply chain data
        supply_headers = supply_chain_data.get("headers", [])
        supply_rows = supply_chain_data.get("rows", [])
        
        raw_material_idx = next((i for i, h in enumerate(supply_headers) if h == "Raw_Material_Name"), -1)
        export_country_idx = next((i for i, h in enumerate(supply_headers) if h == "Export_Country"), -1)
        import_country_idx = next((i for i, h in enumerate(supply_headers) if h == "Import_country"), -1)
        product_sub_cat_idx = next((i for i, h in enumerate(supply_headers) if h == "Product_Sub_Category"), -1)
        base_price_idx = next((i for i, h in enumerate(supply_headers) if h == "Base_Price_Per_Unit"), -1)
        tariff_idx = next((i for i, h in enumerate(supply_headers) if h == "Tariffs"), -1)
        
        # Find matching rows based on the request
        matching_rows = []
        
        for row in supply_rows:
            if (len(row) > raw_material_idx and row[raw_material_idx] == request.ingredient_name and
                len(row) > export_country_idx and row[export_country_idx] == request.country and
                len(row) > import_country_idx and row[import_country_idx] == request.import_country):
                matching_rows.append(row)
        
        # If no matching rows found, check if we should use product data
        if not matching_rows and product_data:
            product_headers = product_data.get("headers", [])
            product_rows = product_data.get("rows", [])
            
            # Find indices for relevant columns in product data
            p_raw_material_idx = next((i for i, h in enumerate(product_headers) if h == "Raw_Material_Name"), -1)
            p_from_country_idx = next((i for i, h in enumerate(product_headers) if h == "From_Country"), -1)
            p_to_country_idx = next((i for i, h in enumerate(product_headers) if h == "To_Country"), -1)
            p_product_sub_cat_idx = next((i for i, h in enumerate(product_headers) if h == "Product_Sub_Category"), -1)
            p_base_price_idx = next((i for i, h in enumerate(product_headers) if h == "Base_Price_Per_Unit"), -1)
            p_tariff_idx = next((i for i, h in enumerate(product_headers) if h == "Current_Tariff_Percent"), -1)
            
            # Find matching rows in product data
            for row in product_rows:
                if (len(row) > p_raw_material_idx and row[p_raw_material_idx] == request.ingredient_name and
                    len(row) > p_from_country_idx and row[p_from_country_idx] == request.country and
                    len(row) > p_to_country_idx and row[p_to_country_idx] == request.import_country):
                    matching_rows.append(row)
                    # Use product data indices instead of supply chain indices
                    raw_material_idx = p_raw_material_idx
                    export_country_idx = p_from_country_idx
                    import_country_idx = p_to_country_idx
                    product_sub_cat_idx = p_product_sub_cat_idx
                    base_price_idx = p_base_price_idx
                    tariff_idx = p_tariff_idx
        
        # Use the first matching row if available
        matching_row = matching_rows[0] if matching_rows else None
        
        # Calculate contract end date based on payment delay
        today = datetime.date.today()
        delay_days = request.cash_payment_delay if request.cash_payment_delay is not None else 30
        contract_end_date = (today + datetime.timedelta(days=delay_days)).isoformat()
        
        # Prepare the result
        result = {
            "success": True,
            "data": {
                "raw_material_name": request.ingredient_name,
                "export_country": request.country or "Unknown",
                "import_country": request.import_country or "Unknown",
                "product_sub_category": request.product_name,
                "contract_end_date": contract_end_date,
                "base_price_per_unit": 0,
                "tariff_percent": 0,
                "payment_terms": {
                    "delay_days": delay_days,
                    "contract_end": contract_end_date
                },
                "supplier_details": {
                    "name": f"Supplier for {request.ingredient_name}",
                    "reliability_score": 85,
                    "available_quantity": 5000
                }
            }
        }
        
        # Update with real values from data if available
        if matching_row:
            try:
                # Extract values from the matching row
                if base_price_idx >= 0 and len(matching_row) > base_price_idx:
                    base_price = float(matching_row[base_price_idx]) if matching_row[base_price_idx] else 0
                    result["data"]["base_price_per_unit"] = base_price
                
                if tariff_idx >= 0 and len(matching_row) > tariff_idx:
                    tariff = float(matching_row[tariff_idx]) if matching_row[tariff_idx] else 0
                    result["data"]["tariff_percent"] = tariff
                
                if product_sub_cat_idx >= 0 and len(matching_row) > product_sub_cat_idx:
                    result["data"]["product_sub_category"] = matching_row[product_sub_cat_idx]
            except (ValueError, TypeError) as e:
                print(f"Error parsing values: {e}")
        
        return result
    except Exception as e:
        print(f"Error in get_ingredient_source_details: {str(e)}")
        return {
            "success": False,
            "message": f"Error retrieving ingredient details: {str(e)}"
        }

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
 
    # Store result in the cache
    if len(price_responses) >= 10:
        price_responses.pop(0)
    price_responses.append(result)
 
    return {
        "result": result,
        "all_saved_responses": price_responses
    }


