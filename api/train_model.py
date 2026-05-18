from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT / 'dataset' / 'diabetes_012_health_indicators_BRFSS2015.csv'
MODEL_PATH = Path(__file__).resolve().parent / 'modelo_glico_diabetes.joblib'

FEATURES = [
    'HighBP',
    'HighChol',
    'BMI',
    'Smoker',
    'Stroke',
    'HeartDiseaseorAttack',
    'PhysActivity',
    'Fruits',
    'Veggies',
    'HvyAlcoholConsump',
    'GenHlth',
    'MentHlth',
    'PhysHlth',
    'Sex',
    'Age',
    'Education',
]


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Dataset não encontrado em {DATA_PATH}. Verifique se o arquivo existe."
        )

    df = pd.read_csv(DATA_PATH)
    df = df.dropna(subset=FEATURES + ['Diabetes_012'])

    X = df[FEATURES].astype(float)
    y = df['Diabetes_012'].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(
        random_state=42,
        n_estimators=200,
        max_depth=12,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print(f"Treinamento concluído. Acurácia de teste: {acc:.4f}")
    print(classification_report(y_test, y_pred, digits=4))

    joblib.dump(model, MODEL_PATH)
    print(f"Modelo salvo em: {MODEL_PATH}")


if __name__ == '__main__':
    main()
