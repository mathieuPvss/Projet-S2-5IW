#!/bin/bash

vmlist="/etc/pve/.vmlist"

if [[ -f "$vmlist" ]]; then
  max_id=$(jq -r '.ids | keys[] | tonumber' "$vmlist" | sort -nr | head -n1)
  if [[ -z "$max_id" ]]; then
    max_id=100
  fi
  echo "{\"next_vmid\": \"$((max_id + 1))\"}"
else
  echo "{\"next_vmid\": \"200\"}"
fi
