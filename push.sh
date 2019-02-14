#!/bin/sh

git add --all;git commit -m 'rolling in changes';npm version patch;npm publish;git push