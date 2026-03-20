#!/bin/bash
# Activate virtual environment helper script

source .venv/bin/activate
echo "Virtual environment activated!"
echo "Python: $(which python)"
echo "Installed packages:"
pip list
