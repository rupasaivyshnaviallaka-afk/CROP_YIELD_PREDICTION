import os
from pathlib import Path

import joblib
import pandas as pd
from flask import Flask, jsonify, request

app = Flask(__name__)
MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "crop_yield_model.joblib"
REQUIRED_FIELDS = ("crop_name", "region", "year", "rainfall", "temperature", "pesticide_usage")


def load_model_bundle():
    if not MODEL_PATH.is_file():
        return None
    return joblib.load(MODEL_PATH)


def prediction_from_bundle(bundle, payload):
    if isinstance(bundle, dict):
        estimator = bundle.get("model")
        feature_columns = bundle.get("feature_columns")
    else:
        estimator = bundle
        feature_columns = getattr(estimator, "feature_names_in_", None)

    if estimator is None or feature_columns is None:
        raise ValueError(
            "The model artifact must be a scikit-learn-compatible estimator or a bundle "
            "with 'model' and 'feature_columns'."
        )
    feature_columns = list(feature_columns)
    if not feature_columns:
        raise ValueError("The trained model artifact must define at least one feature column.")

    missing_features = [name for name in feature_columns if name not in payload]
    if missing_features:
        raise ValueError(
            "The trained model requires features that this API does not receive: "
            + ", ".join(missing_features)
            + ". Provide the matching preprocessing pipeline or update the input contract."
        )

    features = pd.DataFrame([{name: payload[name] for name in feature_columns}])
    prediction = estimator.predict(features)
    return float(prediction[0])


def dispatch(endpoint):
    endpoint = endpoint.strip("/")
    if endpoint == "health" and request.method == "GET":
        return jsonify({"status": "ok", "service": "crop-yield-api"}), 200

    if endpoint != "predict" or request.method != "POST":
        return jsonify({"error": "Not found"}), 404

    expected_key = os.environ.get("CROP_MODEL_API_KEY")
    if expected_key and request.headers.get("X-API-Key") != expected_key:
        return jsonify({"error": "Unauthorized"}), 401

    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"error": "Request body must be a JSON object."}), 400

    missing = [field for field in REQUIRED_FIELDS if payload.get(field) is None or payload.get(field) == ""]
    if missing:
        return jsonify({"error": "Missing required fields: " + ", ".join(missing)}), 400

    try:
        payload["year"] = int(payload["year"])
        for field in ("rainfall", "temperature", "pesticide_usage"):
            payload[field] = float(payload[field])
    except (TypeError, ValueError):
        return jsonify({"error": "year must be an integer; rainfall, temperature, and pesticide_usage must be numeric."}), 400

    if not 1900 <= payload["year"] <= 2100:
        return jsonify({"error": "year must be between 1900 and 2100."}), 400

    if any(payload[field] < 0 for field in ("rainfall", "pesticide_usage")):
        return jsonify({"error": "rainfall and pesticide_usage cannot be negative."}), 400

    if not MODEL_PATH.is_file():
        return jsonify({
            "error": "Trained model artifact is missing. Add models/crop_yield_model.joblib containing the fitted preprocessing/model pipeline; no prediction was generated.", 
            "required_artifact": str(MODEL_PATH),
        }), 503

    try:
        estimate = prediction_from_bundle(load_model_bundle(), payload)
    except ValueError as error:
        return jsonify({"error": str(error)}), 422
    except Exception:
        app.logger.exception("Crop yield model inference failed")
        return jsonify({"error": "The trained model could not generate a prediction. Check the artifact and its dependencies."}), 500

    return jsonify({"prediction": estimate, "unit": "as defined by the trained model", "model": MODEL_PATH.name}), 200


@app.route("/", defaults={"requested_path": ""}, methods=["GET", "POST"])
@app.route("/<path:requested_path>", methods=["GET", "POST"])
def vercel_handler(requested_path):
    # Vercel rewrites /backend/<endpoint> here and passes the original endpoint in _path.
    endpoint = request.args.get("_path", requested_path).strip("/")
    return dispatch(endpoint)
