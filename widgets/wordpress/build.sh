#!/bin/bash
rm -rf chaindesk chaindesk.zip && \
mkdir -p chaindesk && \
cp -r assets chaindesk.php LICENSE readme.txt uploads.ini chaindesk && \
zip -r chaindesk.zip chaindesk && \
rm -rf chaindesk