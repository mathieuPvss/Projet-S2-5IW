# SSH Keys Management

This directory contains the SSH keys for the k3s cluster.

## Files

- `k3s-cluster-key` - **PRIVATE KEY** (keep secure!)
- `k3s-cluster-key.pub` - Public key (safe to share)

## Security Recommendations

### For the Private Key (`k3s-cluster-key`):

1. **Store securely**: Consider one of these options:
   - Use a password manager (1Password, Bitwarden, etc.)
   - Store in a secure vault (HashiCorp Vault, AWS Secrets Manager, etc.)
   - Use macOS Keychain: `security add-generic-password -a $USER -s k3s-cluster-key -w`
   - Store in an encrypted file: `gpg -c k3s-cluster-key`

2. **Access control**: 
   - Set restrictive permissions: `chmod 600 k3s-cluster-key`
   - Only allow access to authorized users

3. **Backup**: 
   - Keep a secure backup of the private key
   - Store backup in a different location

### For Production Use:

1. **Rotate keys regularly**: Generate new keys periodically
2. **Monitor access**: Log SSH connections to track usage
3. **Limit key scope**: Use different keys for different environments

## Usage

The public key is automatically distributed to all VMs via the Ansible playbook `setup-vms.yml`.

To run the setup:
```bash
cd /path/to/proxmox/ansible
ansible-playbook -i inventory/hosts.ini setup-vms.yml
```

## Key Details

- **Type**: ED25519
- **Comment**: lo.gauthier.glo@gmail.com
- **Generated**: $(date)
- **Fingerprint**: SHA256:j2bBHRn+UJMRvFQl71THYwh7+ORZ2x8qiRCt9N3ziig 