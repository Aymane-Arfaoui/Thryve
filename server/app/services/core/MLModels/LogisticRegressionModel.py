import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from datetime import datetime, timedelta
import os

class GoalPredictionModel:
    def __init__(self):
        self.logmodel = None
        self.setup_model()

    def setup_model(self):
        print()
        # Assuming CWD is 'server' and the CSV is in MLModels/data/
        data_path = 'app/services/core/MLModels/data/habit_scores_sample.csv'
        
        # Load and prepare data
        df = pd.read_csv(data_path)
        
        # Process dates
        df['day'] = pd.to_datetime(df['day'])
        df['day_of_week'] = df['day'].dt.dayofweek
        df['day_of_year'] = df['day'].dt.dayofyear
        df['below_threshold'] = (df['score'] < 50).astype(int)

        # Prepare features
        X = df[['day_of_week', 'day_of_year']]
        y = df['below_threshold']

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33, random_state=42)

        # Train model
        self.logmodel = LogisticRegression()
        self.logmodel.fit(X_train, y_train)

        # Print model performance
        predictions = self.logmodel.predict(X_test)
        print("\nModel Performance Report:")
        print(classification_report(y_test, predictions))

    def predict_tomorrow(self):
        tomorrow = datetime.now() + timedelta(days=1)
        day_of_week = tomorrow.weekday()
        day_of_year = tomorrow.timetuple().tm_yday

        tomorrow_features = pd.DataFrame({
            "day_of_week": [day_of_week],
            "day_of_year": [day_of_year]
        })

        prediction = self.logmodel.predict(tomorrow_features)
        probability = self.logmodel.predict_proba(tomorrow_features)[:, 1]

        return {
            "will_fall_below_threshold": bool(prediction[0]),
            "probability": float(probability[0]),
            "prediction_date": tomorrow.strftime("%Y-%m-%d")
        }

if __name__ == "__main__":
    model = GoalPredictionModel()
    prediction = model.predict_tomorrow()
    print(f"Prediction for tomorrow:", prediction)