# API Preditiva Python

Esta pasta contém a API separada em Python para fazer predições usando o modelo treinado.

## Passos

1. Instale as dependências:
   ```bash
   cd api
   python -m pip install -r requirements.txt
   ```

2. Treine e salve o modelo:
   ```bash
   python train_model.py
   ```

3. Inicie a API:
   ```bash
   uvicorn predictive_api:app --reload --port 8000
   ```

4. Acesse o endpoint de saúde:
   - `GET http://localhost:8000/`

5. Chame a predição:
   - `POST http://localhost:8000/predict`
   - Corpo JSON com os campos esperados.
