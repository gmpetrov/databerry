#!/bin/bash
composer install && \
php vendor/bin/autoindex prestashop:add:index && \
php vendor/bin/php-cs-fixer fix && \
# _PS_ROOT_DIR_=. vendor/bin/phpstan analyse --configuration=tests/phpstan/phpstan.neon && \
rm -rf chaindesk chaindesk.zip && \
mkdir -p chaindesk && \
cp -r chaindesk.php controllers docker-compose.yml entrypoint.sh index.php logo.png views chaindesk && \
zip -r chaindesk.zip chaindesk && \
rm -rf chaindesk