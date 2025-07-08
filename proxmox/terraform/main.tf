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
