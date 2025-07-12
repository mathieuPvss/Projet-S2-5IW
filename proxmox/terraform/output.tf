output "k3s_hosts" {
  value = {
    for name, vm in module.k3s_nodes :
    name => {
      name = vm.name
      ip   = vm.ip_address
    }
  }
}

output "database_lxc" {
  value = {
    for name, lxc in module.database_lxc :
    name => {
      name = lxc.name
      ip   = lxc.ip_address
      vmid = lxc.vmid
    }
  }
}