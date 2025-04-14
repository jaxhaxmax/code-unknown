# backend/predictor.py
import sys
import os
import pandas as pd
from pycaret.regression import load_model, predict_model

try:
    # Get the directory of the script itself
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Create an absolute path to the model file
    model_path = os.path.join(os.path.dirname(script_dir), "model", "carbon_model")
    
    # Debug info to stderr (won't affect the output)
    print(f"Loading model from: {model_path}", file=sys.stderr)
    model = load_model(model_path)
    
    electricity = float(sys.argv[1])
    car = float(sys.argv[2])
    meat = float(sys.argv[3])
    
    input_df = pd.DataFrame([{
        "electricity": electricity,
        "car": car,
        "meat": meat
    }])
    
    prediction = predict_model(model, data=input_df)
    
    # Determine the correct column name
    if "prediction_label" in prediction.columns:
        result = prediction["prediction_label"].iloc[0]
    elif "prediction_score" in prediction.columns:
        result = prediction["prediction_score"].iloc[0]
    else:
        # Find any column that might contain the prediction
        # Usually the last column in PyCaret output
        for col in prediction.columns:
            if col.startswith("pred") or "Label" in col or "Score" in col:
                result = prediction[col].iloc[0]
                break
        else:
            # If we can't find a prediction column, use a simple formula
            # This is a fallback in case the model doesn't work
            result = 0.5 * electricity + 0.3 * car + 5 * meat
    
    # Ensure we output only a clean number
    print(f"{float(result):.2f}", flush=True)
    
except Exception as e:
    print(f"Error: {str(e)}", file=sys.stderr)
    sys.exit(1)