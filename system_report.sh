#!/bin/bash

# Initial system monitoring script

echo "System Report" > system_report.txt
date >> system_report.txt

echo "" >> system_report.txt
echo "Network Configuration:" >> system_report.txt
ifconfig >> system_report.txt
