variable "proxmox_api_url" {
  default = "https://127.0.0.1:8006/api2/json"
}

variable "proxmox_user" {
  default = "root@pam"
}

variable "proxmox_password" {
  description = "Proxmox root password"
  sensitive   = true
}

variable "node_name" {
  default = "proxmox"
}

variable "vm_template" {
  default = "debian-12-cloudinit-template"
}

variable "vm_memory" {
  default = 4096
}

variable "vm_cpu_cores" {
  default = 2
}

variable "vm_cpu_type" {
  default = "host"
}

variable "vm_cipassword" {
  description = "Password for the k3s user"
  sensitive   = true
}

provider "proxmox" {
  pm_api_url      = var.proxmox_api_url
  pm_user         = var.proxmox_user
  pm_password     = var.proxmox_password
  pm_tls_insecure = true
}

locals {
  base_ip = "192.168.1."
}

data "external" "next_vmid" {
  program = ["bash", "${path.module}/get_next_vmid.sh"]
}

locals {
  starting_vmid = tonumber(data.external.next_vmid.result["next_vmid"])

  k3s_nodes = {
    "master-0" = {
      offset     = 0
      memory     = var.vm_memory
      cpu_cores  = var.vm_cpu_cores
    }
    "worker-0" = {
      offset     = 1
      memory     = 2048
      cpu_cores  = var.vm_cpu_cores
    }
    "worker-1" = {
      offset     = 2
      memory     = 2048
      cpu_cores  = var.vm_cpu_cores
    }
  }
}

module "k3s_nodes" {
  source = "./modules/k3s_vm"
  for_each = local.k3s_nodes

  name         = each.key
  target_node  = var.node_name
  vmid         = local.starting_vmid + each.value.offset
  clone        = var.vm_template
  memory       = each.value.memory
  cpu_cores    = each.value.cpu_cores
  cpu_type     = var.vm_cpu_type
  ip_address   = "${local.base_ip}${local.starting_vmid + each.value.offset}"
  cipassword   = var.vm_cipassword
  ssh_pubkey   = file("~/.ssh/id_rsa.pub")
}





# Variables pour LXC
variable "lxc_template" {
  default = "local:vztmpl/debian-12-standard_12.7-1_amd64.tar.zst"
}

variable "lxc_password" {
  description = "Password for LXC root user"
  sensitive   = true
}

# Configuration des LXC de base de données
locals {
  database_lxc = {
    "postgres-db" = {
      vmid        = 142  # IP finale: 192.168.1.42
      memory      = 2048
      cpu_cores   = 2
      rootfs_size = "30G"
      db_type     = "postgres"
    }
    "elasticsearch-db" = {
      vmid        = 144  # IP finale: 192.168.1.44
      memory      = 3072
      cpu_cores   = 2
      rootfs_size = "50G"
      db_type     = "elasticsearch"
    }
  }
}

# Créer les LXC pour les bases de données
module "database_lxc" {
  source = "./modules/database_lxc"
  for_each = local.database_lxc

  name         = each.key
  target_node  = var.node_name
  vmid         = each.value.vmid
  template     = var.lxc_template
  memory       = each.value.memory
  cpu_cores    = each.value.cpu_cores
  rootfs_size  = each.value.rootfs_size
  ip_address   = "${local.base_ip}${each.value.vmid}"
  ssh_pubkey   = file("~/.ssh/id_rsa.pub")
  database_type = each.value.db_type
}
