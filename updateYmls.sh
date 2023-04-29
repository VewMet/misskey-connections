#!/bin/bash

# Read in the input YAML file
input=$(cat input.yml)

# Loop through each key-value pair in the input file
while IFS=: read -r key value; do
  # Trim any leading/trailing whitespace from the key and value
  key=$(echo "$key" | xargs)
  value=$(echo "$value" | xargs)

  # Use yq to update the target YAML file with the new value
  yq eval "$key = \"$value\"" -i default.yml
done <<< "$input"
