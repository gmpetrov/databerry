#!/bin/bash
rm -rf chatbotgpt chatbotgpt.zip && \
mkdir -p chatbotgpt && \
cp -r assets chatbotgpt.php LICENSE readme.txt uploads.ini chatbotgpt && \
zip -r chatbotgpt.zip chatbotgpt && \
rm -rf chatbotgpt