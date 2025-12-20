#!/bin/bash

# Initial system monitoring script

echo "Final Linux System Monitoring Report" > system_report.txt
date >> system_report.txt

echo "" >> system_report.txt
echo "CPU Usage:" >> system_report.txt
top -bn1 | head -5 >> system_report.txt

echo "" >> system_report.txt
echo "Memory Usage:" >> system_report.txt
free -h >> system_report.txt
