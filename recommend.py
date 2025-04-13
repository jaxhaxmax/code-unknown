from pycaret.regression import load_model, predict_model
import pandas as pd


model = load_model('green_score_model')

def recommend_tips(input_data):
    
    df = pd.DataFrame([input_data])
    
    
    prediction = predict_model(model, data=df)
    score = prediction['prediction_label'].values[0]

    
    if score > 80:
        tip = "You're doing great! 🌿 Try switching to renewable energy sources next."
    elif score > 60:
        tip = "Nice work! Consider reducing streaming time or walking more."
    else:
        tip = "Let’s step it up! 🚶 Try walking instead of driving and unplug unused devices."

    return {
        "green_score": round(score),
        "tip": tip
    }
