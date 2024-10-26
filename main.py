import pickle
from datetime import datetime
import numpy as np
from flask import Flask, request
import pandas as pd




scaler = None

model = None

def load_model():
    global model
    # model variable refers to the global variable
    with open('voting_clf_soft.pkl', 'rb') as f:
        model = pickle.load(f)

def load_scaler():
    global scaler
    with open('scaler.pkl', 'rb') as f:
        scaler = pickle.load(f)


load_model()  
load_scaler()

def process_data(transaction_dict):

    input_dict =  {
        'amt': transaction_dict.get('amt'),
        'zip': transaction_dict.get('zip'),
        'lat': transaction_dict.get('lat'),
        'long': transaction_dict.get('long'),
        'city_pop': transaction_dict.get('city_pop'),
        'merch_lat': transaction_dict.get('merch_lat'),
        'merch_long': transaction_dict.get('merch_long'),
        'Age': int((datetime.strptime(transaction_dict['trans_date_trans_time'], '%Y-%m-%d %H:%M:%S') - 
                datetime.strptime(transaction_dict['dob'], '%Y-%m-%d')).days // 365),
        'hour': datetime.strptime(transaction_dict['trans_date_trans_time'], '%Y-%m-%d %H:%M:%S').hour,
        'category_food_dining' : transaction_dict.get('category') == "food_dining",
        'category_gas_transport' : transaction_dict.get('category') == "gas_transport",
        'category_grocery_net' : transaction_dict.get('category') == "grocery_net",
        'category_grocery_pos' : transaction_dict.get('category') == "grocery_pos",
        'category_health_fitness' : transaction_dict.get('category') == "health_fitness",
        'category_home' : transaction_dict.get('category') == "home",
        'category_kids_pets' : transaction_dict.get('category') == "kids_pets",
        'category_misc_net' : transaction_dict.get('category') == "misc_net",
        'category_misc_pos' : transaction_dict.get('category') == "misc_pos",
        'category_personal_care' : transaction_dict.get('category') == "personal_care",
        'category_shopping_net' : transaction_dict.get('category') == "shopping_net",
        'category_shopping_pos' : transaction_dict.get('category') == "shopping_pos",
        'category_travel' : transaction_dict.get('category') == "travel",
        'gender_M': transaction_dict.get('gender') == 'M',
    }

    transaction_df = pd.DataFrame([input_dict])

    numerical_cols = transaction_df.select_dtypes(include=['float64', 'int64']).columns
    transaction_df[numerical_cols] = scaler.transform(transaction_df[numerical_cols])

    return transaction_df

def get_predictions(data):
    processed_data = process_data(data)
    prediction = model.predict(processed_data)
    probability = model.predict_proba(processed_data)
    return prediction, probability, data


app = Flask(__name__)


@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    prediction, probability, data = get_predictions(data)

    return {
        "Prediction" :  prediction.tolist(),
        "Probability" : probability.tolist()
    }

# if __name__ == '__main__':
#     app.run(debug = False, host='0.0.0.0', port=80)