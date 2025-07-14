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

# Get the Terraform outputs as JSON
terraform output -json k3s_hosts > "$TF_OUTPUT_JSON"
terraform output -json database_lxc > "$INVENTORY_DIR/database_lxc.json"

# Create INI-style inventory
{
  echo "[master]"
  jq -r 'to_entries[] | select(.key | test("master")) | "\(.value.ip)"' "$TF_OUTPUT_JSON"

  echo ""
  echo "[worker]"
  jq -r 'to_entries[] | select(.key | test("worker")) | "\(.value.ip)"' "$TF_OUTPUT_JSON"

  echo ""
  echo "[databases]"
  jq -r 'to_entries[] | "\(.key) ansible_host=\(.value.ip)"' "$INVENTORY_DIR/database_lxc.json"

  echo ""
  echo "[all:vars]"
  echo "ansible_user=k3s"
  echo "ansible_ssh_pass={{ vm_password }}"
  echo ""
  echo "[databases:vars]"
  echo "ansible_user=root"
  echo "ansible_ssh_pass={{ lxc_password }}"
} > "$HOSTS_INI"

# Preload SSH host keys for all hosts (k3s + databases)
echo "Preloading SSH host keys..."
echo "K3s hosts:"
jq -r 'to_entries[] | .value.ip' "$TF_OUTPUT_JSON" | while read -r ip; do
  echo "  - $ip"
  ssh-keyscan -H "$ip" >> "$KNOWN_HOSTS" 2>/dev/null || echo "Failed to scan $ip"
done

echo "Database LXC hosts:"
jq -r 'to_entries[] | .value.ip' "$INVENTORY_DIR/database_lxc.json" | while read -r ip; do
  echo "  - $ip"
  ssh-keyscan -H "$ip" >> "$KNOWN_HOSTS" 2>/dev/null || echo "Failed to scan $ip"
done

# Clean up temporary files
rm -f "$INVENTORY_DIR/database_lxc.json"

echo "✅ Inventory and SSH keys prepared."
