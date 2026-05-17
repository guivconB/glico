@echo off
REM Inicia o backend na pasta backend e mantém o terminal aberto enquanto o servidor rodar.
cd /d "%~dp0backend"
echo Iniciando backend em %CD% ...
npm start
