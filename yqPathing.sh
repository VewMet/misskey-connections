#!/bin/bash
echo "Script started"


# Get the path to the Python user base directory
USER_BASE=$(python3 -m site --user-base)

# Add the bin directory to the PATH
if [[ ":$PATH:" != *":$USER_BASE/bin:"* ]]; then
    export PATH="$PATH:$USER_BASE/bin"
fi

# Save the updated PATH to the shell profile file
if [[ -f "$HOME/.bashrc" ]]; then
    PROFILE="$HOME/.bashrc"
elif [[ -f "$HOME/.bash_profile" ]]; then
    PROFILE="$HOME/.bash_profile"
else
    echo "Could not find shell profile file. Please update PATH manually."
    exit 1
fi

if ! grep -q "^export PATH=\"\$PATH:$USER_BASE/bin\"" "$PROFILE"; then
    echo 'export PATH="$PATH:'"$USER_BASE"'/bin"' >> "$PROFILE"
fi

# Reload the shell profile to apply changes
source "$PROFILE"
