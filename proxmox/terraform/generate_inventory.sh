#!/bin/bash
set -euo pipefail

# Paths
INVENTORY_DIR="../ansible/inventory"
TF_OUTPUT_JSON="$INVENTORY_DIR/inventory.json"
HOSTS_INI="$INVENTORY_DIR/hosts.ini"
KNOWN_HOSTS="$HOME/.ssh/known_hosts"

# Ensure inventory dir exists
mkdir -p "$INVENTORY_DIR"

# Clean up old IPs from known_hosts (range: 192.168.1.181 to 192.168.1.199)
sed -i '/192\.168\.1\.1\(8[1-9]\|9[0-9]\)/d' "$KNOWN_HOSTS"

# Get the Terraform output as JSON
terraform output -json k3s_hosts > "$TF_OUTPUT_JSON"

# Create INI-style inventory
{
  echo "[master]"
  jq -r 'to_entries[] | select(.key | test("master")) | "\(.value.ip)"' "$TF_OUTPUT_JSON"

  echo ""
  echo "[worker]"
  jq -r 'to_entries[] | select(.key | test("worker")) | "\(.value.ip)"' "$TF_OUTPUT_JSON"

  echo ""
  echo "[all:vars]"
  echo "ansible_user=k3s"
  echo "ansible_ssh_pass=YOUR_PASSWORD_HERE"  # Replace with vault later
} > "$HOSTS_INI"

# Preload SSH host keys
echo "Preloading SSH host keys..."
jq -r 'to_entries[] | .value.ip' "$TF_OUTPUT_JSON" | while read -r ip; do
  echo "  - $ip"
  ssh-keyscan -H "$ip" >> "$KNOWN_HOSTS" 2>/dev/null || echo "Failed to scan $ip"
done

echo "✅ Inventory and SSH keys prepared."
