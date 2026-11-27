Live demo- https://v0-cropyield.vercel.app/dashboard

# 🌾 Crop Yield Prediction Using Machine Learning

## 📌 Project Overview

Crop Yield Prediction is a machine learning-based application designed to predict agricultural crop yield using important environmental and agricultural factors such as rainfall, temperature, pesticide usage, crop type, region, and year.

The project aims to help farmers, agricultural researchers, and decision-makers understand the factors influencing crop production and make more informed agricultural decisions.

The application combines a user-friendly frontend with a Python Flask API backend to provide crop yield predictions.

## 🎯 Objectives

- Predict crop yield using machine learning algorithms.
- Analyze the relationship between climate conditions and agricultural production.
- Compare different machine learning models to identify a suitable prediction model.
- Provide an interactive interface for entering agricultural details.
- Develop an API for connecting the frontend with the prediction model.
- Support data-driven agricultural planning and decision-making.

## ✨ Key Features

- **Crop Yield Prediction:** Predicts estimated crop production based on user inputs.
- **Climate-Based Analysis:** Considers rainfall and temperature.
- **Agricultural Data Analysis:** Uses crop type, region, year, and pesticide usage.
- **Machine Learning Models:** Supports comparison of multiple regression algorithms.
- **Flask REST API:** Provides an endpoint for receiving inputs and returning predictions.
- **Interactive Dashboard:** Displays prediction results through a user-friendly interface.
- **API Integration:** Connects the frontend with the backend prediction service.

## 🛠️ Technologies Used

| Category | Technologies |
|---|---|
| Frontend | Vercel-generated web application |
| Backend | Python, Flask |
| Machine Learning | Scikit-learn, XGBoost |
| Data Processing | Pandas, NumPy |
| Data Visualization | Matplotlib, Seaborn |
| Model Storage | Joblib |
| Deployment | Vercel |
| Version Control | Git, GitHub |

## 📊 Dataset

The project uses agricultural data containing the following features:

- Area / Region
- Crop Type
- Year
- Average Annual Rainfall (mm)
- Pesticide Usage (tonnes)
- Average Temperature (°C)
- Crop Yield (hg/ha)

The dataset is used for training and evaluating machine learning models.

**Target Variable:** Crop Yield (`hg/ha_yield`).

## 🤖 Machine Learning Algorithms

The following algorithms can be evaluated for crop yield prediction:

1. Linear Regression
2. Decision Tree Regressor
3. Random Forest Regressor
4. Support Vector Regression (SVR)
5. Gradient Boosting Regressor
6. XGBoost Regressor

### Model Evaluation Metrics

- Mean Absolute Error (MAE)
- Mean Squared Error (MSE)
- Root Mean Squared Error (RMSE)
- R² Score

The best-performing model should be selected based on validation results and evaluated using a separate test dataset.

## 🏗️ System Architecture

```text
       User
        |
        v
  Web Application
        |
        v
   Flask REST API
        |
        v
 Data Preprocessing
        |
        v
 Trained ML Model
        |
        v
 Crop Yield Prediction
        |
        v
  Display Result
```

## 🔗 API Endpoints

### 1. Health Check

**Endpoint:** `GET /health`

Checks whether the backend API is running.

### 2. Crop Yield Prediction

**Endpoint:** `POST /predict`

Accepts agricultural information and returns the predicted crop yield.

Example request:

```json
{
  "Area": "India",
  "Item": "Rice",
  "Year": 2023,
  "average_rain_fall_mm_per_year": 1200,
  "pesticides_tonnes": 500,
  "avg_temp": 25
}
```

Example response (illustrative format):

```json
{
  "success": true,
  "predicted_yield_hg_per_ha": 45000,
  "predicted_yield_tonnes_per_ha": 4.5
}
```

Actual response fields and prediction values depend on the implemented backend and trained model.

## 🔐 Environment Variables

Configure the following variables in the deployment platform:

| Variable | Description |
|---|---|
| `CROP_MODEL_API_KEY` | Secret key for API authentication, if enabled |
| `CROP_MODEL_API_URL` | Deployed Flask prediction endpoint |
| `DATA_GOV_IN_API_KEY` | Optional key for accessing official Indian government data |
| `DATA_GOV_IN_RESOURCE_ID` | Resource ID of the selected government dataset |

**Security Note:** Never upload API keys, passwords, or `.env` files to GitHub. Store secrets in the deployment platform's environment variable settings.

## 🚀 Deployment

The project frontend and backend can be deployed using Vercel, provided the application structure and Python runtime are compatible with Vercel.

Deployment steps:

1. Upload the project source code to GitHub.
2. Connect the GitHub repository to Vercel.
3. Configure the required environment variables.
4. Deploy the application.
5. Test the health-check and prediction endpoints.
6. Verify that the frontend successfully communicates with the backend.

## 📈 Expected Outcomes

- Generate estimated crop yield predictions from agricultural inputs.
- Identify relationships between climate conditions and crop production.
- Compare machine learning algorithms using evaluation metrics.
- Provide an accessible interface for exploring crop yield predictions.
- Support agricultural research and data-driven decision-making.

## 🔮 Future Enhancements

- Integrate real-time weather information.
- Use official Indian agricultural datasets.
- Include soil pH, nitrogen, phosphorus, and potassium (NPK) values.
- Add district-wise and season-wise crop yield prediction.
- Implement advanced ensemble learning techniques.
- Integrate SHAP for explainable AI.
- Develop a mobile-friendly application.
- Provide crop recommendations based on environmental conditions.

## 👩‍💻 Project Information

**Project Name:** Crop Yield Prediction Using Machine Learning

**Domain:** Machine Learning / Agriculture / Artificial Intelligence

**Project Type:** Academic / Machine Learning Project

## 📜 License

This project is developed for educational and research purposes. A suitable open-source license can be added when publishing the repository.
