@echo off
setlocal
title PROVA - BUILD DEPLOY CLOUDFLARE E GITHUB

REM ==================================================
REM CONFIGURACAO DO PROJETO
REM ==================================================
set "PROJECT_NAME=PROVA"
set "CLOUDFLARE_WORKER=prova"
set "BUILD_COMMAND=npm run build"
set "COMMIT_MESSAGE=Atualizacao %PROJECT_NAME%"

REM Usa automaticamente a pasta onde este arquivo .cmd esta salvo.
cd /d "%~dp0"
if errorlevel 1 goto ERRO_PASTA

echo.
echo ========================================
echo %PROJECT_NAME%
echo BUILD ^| DEPLOY CLOUDFLARE WORKERS ^| GITHUB
echo ========================================
echo.
echo Pasta local: %CD%
echo Worker Cloudflare: %CLOUDFLARE_WORKER%
echo.

REM ==================================================
REM BUILD
REM ==================================================
echo ******** BUILD
call %BUILD_COMMAND%
if errorlevel 1 goto ERRO_BUILD

echo.
echo ******** BUILD OK
echo.

REM ==================================================
REM DEPLOY CLOUDFLARE WORKERS
REM Publica o conteudo da pasta dist como assets do Worker.
REM ==================================================
echo ******** DEPLOY CLOUDFLARE WORKERS
echo Worker: %CLOUDFLARE_WORKER%
echo.

call npx --yes wrangler deploy --assets ./dist --name %CLOUDFLARE_WORKER%
if errorlevel 1 goto ERRO_DEPLOY

echo.
echo ******** DEPLOY CLOUDFLARE OK
echo.

REM ==================================================
REM GITHUB - SOMENTE COM AUTORIZACAO
REM ==================================================
echo ******** ATUALIZAR GITHUB
echo.
git status --short
if errorlevel 1 goto ERRO_GITHUB

echo.
choice /C SN /M "Deseja atualizar o GitHub"
if errorlevel 2 goto SUCESSO

git add -A
if errorlevel 1 goto ERRO_GITHUB

git diff --cached --quiet
if not errorlevel 1 goto SEM_ALTERACOES

git commit -m "%COMMIT_MESSAGE%"
if errorlevel 1 goto ERRO_GITHUB

git push
if errorlevel 1 goto ERRO_GITHUB

goto SUCESSO

:SEM_ALTERACOES
echo.
echo Nenhuma alteracao nova para enviar ao GitHub.
goto SUCESSO

:ERRO_PASTA
echo ERRO: Nao foi possivel acessar a pasta do projeto.
goto FIM_ERRO

:ERRO_BUILD
echo.
echo ERRO NA COMPILACAO.
echo DEPLOY E GITHUB CANCELADOS.
goto FIM_ERRO

:ERRO_DEPLOY
echo.
echo ERRO NO DEPLOY CLOUDFLARE WORKERS.
echo GITHUB CANCELADO.
echo.
echo Verifique o login do Wrangler e a configuracao do Worker.
goto FIM_ERRO

:ERRO_GITHUB
echo.
echo ERRO AO ATUALIZAR O GITHUB.
echo O DEPLOY CLOUDFLARE JA FOI CONCLUIDO.
goto FIM_ERRO

:SUCESSO
echo.
echo ========================================
echo PROCESSO CONCLUIDO!
echo ========================================
echo.
pause
exit /b 0

:FIM_ERRO
echo.
pause
exit /b 1
