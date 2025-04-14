# backend/train_model.py
import pandas as pd
from pycaret.regression import setup, create_model, save_model

# Sample synthetic data
data = pd.DataFrame({
    'electricity': [200, 400, 150, 600, 250, 300],
    'car': [50, 100, 20, 150, 40, 60],
    'meat': [3, 10, 1, 14, 4, 6],
    'emission': [130, 270, 95, 400, 140, 180]
})

# PyCaret setup
setup(
    data=data,
    target='emission',
    session_id=123,
    verbose=False
)

# Use 2-fold cross-validation to avoid error
model = create_model('lr', fold=2)

# Save the model
save_model(model, 'C:\code green\model\carbon_model')
 