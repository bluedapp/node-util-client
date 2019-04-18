#!/bin/bash

git diff --diff-filter=d --cached --name-only | grep -v '^dist/*' | grep -E '\.(js|jsx|ts|tsx)$' | xargs -I % sh -c 'git show ":%" | npx eslint --stdin --stdin-filename "%"'