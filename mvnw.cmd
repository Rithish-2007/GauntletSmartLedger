@echo off
if exist "%USERPROFILE%\.m2\apache-maven-3.9.9\bin\mvn.cmd" (
    "%USERPROFILE%\.m2\apache-maven-3.9.9\bin\mvn.cmd" %*
) else (
    mvn %*
)
