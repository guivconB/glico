from pathlib import Path

import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, conint

MODEL_FILE = Path(__file__).resolve().parent / 'modelo_glico_diabetes.joblib'

app = FastAPI(
    title='Glico Predictive API',
    description='API Python separada para calcular risco de diabetes usando modelo treinado.',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173', 'http://127.0.0.1:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
    allow_expose_headers=['*'],
)


class PredictionRequest(BaseModel):
    high_bp: bool = Field(..., description='Possui pressão alta')
    high_chol: bool = Field(..., description='Possui colesterol alto')
    weight_kg: float = Field(..., gt=0, description='Peso em kg')
    height_cm: float = Field(..., gt=0, description='Altura em cm')
    smoker: bool = Field(..., description='Fuma')
    phys_activity: bool = Field(..., description='Pratica atividade física regularmente')
    heart_disease: bool = Field(..., description='Já teve problema cardíaco ou ataque')
    stroke: bool = Field(..., description='Já teve AVC')
    health_rating: conint(ge=1, le=5) = Field(..., description='Autoavaliação de saúde: 1 excelente, 5 ruim')
    mental_unhealthy_days: conint(ge=0, le=30) = Field(..., description='Dias no mês em que a saúde mental não foi boa')
    physical_unhealthy_days: conint(ge=0, le=30) = Field(..., description='Dias no mês em que a saúde física não foi boa')
    heavy_alcohol_consumption: bool = Field(..., description='Consome bebida alcoólica com frequência')
    fruits: bool = Field(..., description='Consome frutas com frequência')
    veggies: bool = Field(..., description='Consome vegetais com frequência')
    sex: str = Field(..., description='Masculino ou Feminino')
    age: conint(ge=0, le=120) = Field(..., description='Idade em anos')


def map_age_to_category(age: int) -> int:
    if age < 18:
        return 1
    if age <= 24:
        return 1
    if age <= 29:
        return 2
    if age <= 34:
        return 3
    if age <= 39:
        return 4
    if age <= 44:
        return 5
    if age <= 49:
        return 6
    if age <= 54:
        return 7
    if age <= 59:
        return 8
    if age <= 64:
        return 9
    if age <= 69:
        return 10
    if age <= 74:
        return 11
    if age <= 79:
        return 12
    return 13


def compute_bmi(weight_kg: float, height_cm: float) -> float:
    height_m = height_cm / 100.0
    if height_m <= 0:
        raise ValueError('Altura deve ser maior que 0')
    return round(weight_kg / (height_m**2), 1)


def load_model():
    if not MODEL_FILE.exists():
        raise RuntimeError(
            f"Modelo não encontrado. Execute 'python train_model.py' dentro de /api para criar {MODEL_FILE.name}."
        )
    return joblib.load(MODEL_FILE)


MODEL = load_model()

RISK_LABELS = {
    0: 'Saudável',
    1: 'Pré-diabetes',
    2: 'Diabetes',
}


@app.get('/')
def root():
    return {'status': 'ok', 'message': 'Glico Predictive API rodando'}


@app.post('/predict')
def predict(request: PredictionRequest):
    try:
        bmi = compute_bmi(request.weight_kg, request.height_cm)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    sex_value = 1 if request.sex.strip().lower().startswith('f') else 0
    age_category = map_age_to_category(request.age)

    feature_vector = [
        int(request.high_bp),
        int(request.high_chol),
        bmi,
        int(request.smoker),
        int(request.stroke),
        int(request.heart_disease),
        int(request.phys_activity),
        int(request.fruits),
        int(request.veggies),
        int(request.heavy_alcohol_consumption),
        request.health_rating,
        request.mental_unhealthy_days,
        request.physical_unhealthy_days,
        sex_value,
        age_category,
    ]

    prediction = MODEL.predict([feature_vector])[0]
    probabilities = []

    if hasattr(MODEL, 'predict_proba'):
        proba = MODEL.predict_proba([feature_vector])[0]
        probabilities = [round(float(p), 4) for p in proba]
        risk_score = int(round(max(probabilities) * 100))
    else:
        proba = None
        risk_score = 0

    return {
        'risk_class': int(prediction),
        'risk_label': RISK_LABELS.get(int(prediction), 'Desconhecido'),
        'risk_score': risk_score,
        'probabilities': probabilities,
        'bmi': bmi,
        'age_category': age_category,
        'feature_vector': feature_vector,
    }
