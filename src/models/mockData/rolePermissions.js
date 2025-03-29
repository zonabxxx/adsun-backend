const defaultRolePermissions = {
  dashboard: {
    read: true
  },
  admin: {
    read: true,
    write: true,
    users: {
      read: true,
      write: true,
      delete: true
    },
    roles: {
      read: true,
      write: true,
      delete: true
    },
    settings: {
      read: true,
      write: true
    },
    logs: {
      read: true
    },
    backups: {
      read: true,
      write: true,
      execute: true
    }
  },
  zakazky: {
    read: true,
    write: true,
    delete: true,
    create: {
      read: true,
      write: true
    },
    edit: {
      read: true,
      write: true,
      delete: true
    },
    management: {
      read: true,
      write: true,
      delete: true,
      approve: true
    }
  },
  vyroba: {
    read: true,
    write: true,
    delete: true,
    sklad: {
      read: true,
      write: true,
      delete: true
    },
    planovanie: {
      read: true,
      write: true
    },
    vyrobky: {
      read: true,
      write: true,
      delete: true
    }
  },
  financie: {
    read: true,
    write: true,
    delete: true,
    faktury: {
      read: true,
      write: true,
      delete: true,
      approve: true
    },
    prijmy: {
      read: true,
      write: true,
      delete: true
    },
    vydavky: {
      read: true,
      write: true,
      delete: true
    },
    mzdy: {
      read: true,
      write: true,
      approve: true
    }
  }
};

// Predvolené role v systéme
const defaultRoles = [
  {
    name: "admin",
    description: "Administrátor systému s plnými právami",
    isSystem: true,
    defaultPermissions: defaultRolePermissions
  },
  {
    name: "manager",
    description: "Manažér s právami na správu zákaziek a výroby",
    isSystem: true,
    defaultPermissions: {
      dashboard: {
        read: true
      },
      zakazky: {
        read: true,
        write: true,
        delete: true,
        create: {
          read: true,
          write: true
        },
        edit: {
          read: true,
          write: true,
          delete: true
        },
        management: {
          read: true,
          write: true,
          delete: true,
          approve: true
        }
      },
      vyroba: {
        read: true,
        write: true,
        delete: true,
        sklad: {
          read: true,
          write: true,
          delete: true
        },
        planovanie: {
          read: true,
          write: true
        },
        vyrobky: {
          read: true,
          write: true,
          delete: true
        }
      }
    }
  },
  {
    name: "employee",
    description: "Bežný zamestnanec",
    isSystem: true,
    defaultPermissions: {
      dashboard: {
        read: true
      },
      zakazky: {
        read: true,
        create: {
          read: true
        },
        edit: {
          read: true
        }
      },
      vyroba: {
        read: true,
        sklad: {
          read: true
        },
        planovanie: {
          read: true
        },
        vyrobky: {
          read: true
        }
      }
    }
  }
];

module.exports = {
  defaultRolePermissions,
  defaultRoles
}; 