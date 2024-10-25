import pickle
import numpy as np
from flask import Flask, request
import pandas as pd



model = None

def load_model():
    global model
    # model variable refers to the global variable
    with open('voting_clf_soft.pkl', 'rb') as f:
        model = pickle.load(f)

def process_data(customer_dict):
    input_dict =  {
        # 'CreditScore' : customer_dict['CreditScore'],
        # 'Age' : customer_dict['Age'],
        # 'Tenure' : customer_dict['Tenure'],
        # 'Balance' : customer_dict['Balance'],
        # 'NumOfProducts' : customer_dict['NumOfProducts'],
        # 'HasCrCard' : customer_dict['HasCrCard'],
        # 'IsActiveMember' : customer_dict['IsActiveMember'],
        # 'EstimatedSalary' : customer_dict['EstimatedSalary'],
        # 'Geography_France' : 1 if customer_dict['Geography'] == "France" else 0,
        # 'Geography_Germany' : 1 if customer_dict['Geography'] == "Germany" else 0,
        # 'Geography_Spain' : 1 if customer_dict['Geography'] == "Spain" else 0,
        # 'Gender_Female' : 1 if customer_dict['Gender'] == "Female" else 0,
        # 'Gender_Male' : 1 if customer_dict['Gender'] == "Male" else 0,
        # 'CLV' : customer_dict['Balance'] * customer_dict['EstimatedSalary'],
        # 'TenureAgeRatio' : customer_dict['Tenure'] / customer_dict['Age'],
        # 'AgeGroup_MiddleAge' : 1 if   30 < customer_dict["Age"] <= 45 else 0,
        # 'AgeGroup_Senior' : 1 if   45 < customer_dict["Age"] <= 60 else 0,
        # 'AgeGroup_Elderly' : 1 if   60 < customer_dict["Age"] <= 100 else 0
    }

    customer_df = pd.DataFrame([input_dict])

    return customer_df

def get_predictions(data):
    processed_data = process_data(data)
    prediction = model.predict(processed_data)
    probability = model.predict_proba(processed_data)
    return prediction, probability


app = Flask(__name__)


@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    prediction, probability = get_predictions(data)

    return {
        "Prediction" :  prediction.tolist(),
        "Probability" : probability.tolist()
    }

if __name__ == '__main__':
    load_model()  # load model at the beginning once only
    app.run(debug = False, host='0.0.0.0', port=80)