from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

# Load your model and scaler
model = joblib.load('chronic_model.pkl')
scaler = joblib.load('scaler.pkl')

# These are the averages (means) from your patients.csv dataset
# We use these for any values the user doesn't provide.
DEFAULT_MEANS = {
    'age': 55.6, 'sex': 0.5, 'bmi': 28.0, 'chronic_hf': 0.25,
    'diabetes': 0.24, 'weight_gain_pct': 2.5, 'mean_sbp': 145.0,
    'mean_hr': 82.5, 'mean_spo2': 95.0, 'hbA1c': 7.2,
    'bnp': 316.0, 'adherence_30': 0.73, 'ed_visits_90': 1.0,
    'prior_admits': 1.0, 'smoking': 0.5, 'alcohol': 0.76,
    'diet_score': 3.1, 'family_history': 0.5, 'socioecon': 1.0,
    'med_count': 4.6, 'sleep_hrs': 6.5, 'recent_infection': 0.26
}

FEATURE_ORDER = list(DEFAULT_MEANS.keys())

@app.route('/predict', methods=['POST'])
def predict():
    user_data = request.json['features']
    final_features = []
    for feature in FEATURE_ORDER:
        final_features.append(float(user_data.get(feature, DEFAULT_MEANS[feature])))

    features_scaled = scaler.transform([final_features])
    
    # Get probabilities instead of 0/1
    # prob[0][0] is Low Risk prob, prob[0][1] is High Risk prob
    prob = model.predict_proba(features_scaled)
    high_risk_prob = float(prob[0][1])

    # SENSITIVITY ADJUSTMENT:
    # If the probability of High Risk is > 35%, we flag it as High Risk.
    prediction = 1 if high_risk_prob > 0.5 else 0

    return jsonify({
        'prediction': prediction,
        'probability': high_risk_prob  # Return the specific High Risk %
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)