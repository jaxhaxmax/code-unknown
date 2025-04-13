import pandas as pd
import numpy as np
from pycaret.regression import *


data = pd.DataFrame({
    'device_hours': np.random.randint(1, 10, 100),
    'streaming_hours': np.random.randint(0, 8, 100),
    'emails_sent': np.random.randint(10, 300, 100),
    'transport_mode': np.random.choice(['car', 'bike', 'walk', 'bus'], 100),
    'energy_kwh': np.random.uniform(1.0, 10.0, 100),
    'green_score': np.random.randint(30, 100, 100)  
})


s = setup(data, target='green_score', session_id=123, categorical_features=['transport_mode'], silent=True)


best_model = compare_models()


save_model(best_model, 'green_score_model')

print("Model saved successfully!")
