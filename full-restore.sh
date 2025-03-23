#!/bin/bash

rm -rf backup_*_*.sql
./download-backup.sh
./restore.sh

