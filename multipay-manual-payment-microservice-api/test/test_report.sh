#!/bin/bash

# 1. Definir caminhos absolutos para evitar erro de "pasta não encontrada"
ROOT_DIR=$(pwd)
TEST_RESULTS="$ROOT_DIR/TestResults"
REPORT_DIR="$TEST_RESULTS/coveragereport"
INDEX_FILE="$REPORT_DIR/index.html"

echo "🚀 [1/3] Rodando testes..."

# Executa o comando de teste
dotnet test /p:CollectCoverage=true \
            /p:CoverletOutputFormat=cobertura \
            /p:MergeWith="../cobertura-coverage.xml" \
            /p:CoverletOutput="../TestResults/"

# Aguarda 30 segundos para garantir que o arquivo coverage.cobertura.xml seja gerado
# echo Aguardando 30 segundos...
# timeout /t 30

# O 'reportgenerator' só roda se o comando acima terminar (mesmo com falha nos testes)
echo "📊 [2/3] Gerando relatório..."

reportgenerator \
    -reports:"$TEST_RESULTS/coverage.cobertura.xml" \
    -targetdir:"$REPORT_DIR" \
    -reporttypes:Html

# 2. Forçar abertura no Chrome de forma agressiva
if [ -f "$INDEX_FILE" ]; then
    echo "🌐 [3/3] Abrindo no Chrome..."
    
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        # Windows (Git Bash)
        start chrome "$INDEX_FILE"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open -a "Google Chrome" "$INDEX_FILE"
    else
        # Linux
        google-chrome "$INDEX_FILE" || google-chrome-stable "$INDEX_FILE" || xdg-open "$INDEX_FILE"
    fi
else
    echo "❌ Erro: O arquivo $INDEX_FILE não foi gerado."
    echo "Verifique se o arquivo 'coverage.cobertura.xml' existe em $TEST_RESULTS"
fi