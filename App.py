from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

@app.post("/upload/")
async def upload_file(
    file: UploadFile = File(...),
    country: str = Form(...),
    category: str = Form(...),
    product: str = Form(...),
    units: int = Form(...)
):
    try:
        contents = await file.read()
        excel_data = pd.read_excel(io.BytesIO(contents))

        # Ensure required columns are present
        required_columns = [
            'To_Country',
            'Product_Category',
            'Product_Sub_Category',
            'Base_Price_Per_Unit',
            'Current_Tariff_Percent',
            'Future_Tariff_Percent'
        ]
        for column in required_columns:
            if column not in excel_data.columns:
                return {"error": f"Missing column: {column}"}

        # Filter data based on user input
        filtered_data = excel_data[
            (excel_data['To_Country'] == country) &
            (excel_data['Product_Category'] == category) &
            (excel_data['Product_Sub_Category'] == product)
        ]

        if filtered_data.empty:
            return {"error": "No matching data found for the given inputs."}

        # Calculate new columns
        filtered_data['Base_Price_With_Current_Tariff'] = (
            filtered_data['Base_Price_Per_Unit'] +
            (filtered_data['Base_Price_Per_Unit'] * filtered_data['Current_Tariff_Percent'] / 100)
        ) * units

        filtered_data['Base_Price_With_Future_Tariff'] = (
            filtered_data['Base_Price_Per_Unit'] +
            (filtered_data['Base_Price_Per_Unit'] * filtered_data['Future_Tariff_Percent'] / 100)
        ) * units

        # Write the updated DataFrame to an in-memory Excel file
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            filtered_data.to_excel(writer, index=False)
        output.seek(0)

        return StreamingResponse(
            output,
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            headers={"Content-Disposition": "attachment; filename=updated_file.xlsx"}
        )

    except Exception as e:
        return {"error": str(e)}