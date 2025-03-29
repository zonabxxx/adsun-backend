const logger = require('../../utils/logger');

/**
 * Mapuje hodnoty roleName na skutočné názvy rolí v databáze (ak existuje mapovanie)
 * @param {String} roleName - Názov role, ktorý sa má mapovať
 * @returns {String} - Skutočný názov role v databáze alebo neupravený vstupný názov
 */
const mapRoleNameToDbName = (roleName) => {
  // Základné mapovanie pre spätnú kompatibilitu
  const roleMap = {
    'admin': 'admin',
    'manager': 'manager',
    'user': 'user',
    'accountant': 'accountant',
    'employee': 'employee'
  };
  
  // Ak existuje mapovanie, použijeme ho, inak vrátíme pôvodný názov
  return roleMap[roleName] || roleName;
};

/**
 * Mapuje skutočné názvy rolí v databáze na hodnoty roleName (ak existuje mapovanie)
 * @param {String} dbRoleName - Skutočný názov role v databáze
 * @returns {String} - Namapovaná hodnota alebo neupravený vstupný názov
 */
const mapDbNameToRoleName = (dbRoleName) => {
  // Základné mapovanie pre spätnú kompatibilitu
  const roleMap = {
    'admin': 'admin',
    'manager': 'manager',
    'user': 'user',
    'accountant': 'accountant', 
    'employee': 'employee'
  };
  
  // Ak existuje mapovanie, použijeme ho, inak vrátíme pôvodný názov
  return roleMap[dbRoleName] || dbRoleName;
};

/**
 * Inicializácia základných oprávnení podľa názvu role
 * @param {String} roleName - Názov role
 * @returns {Object} - Objekt s inicializovanými oprávneniami
 */
const initializeDefaultPermissions = (roleName) => {
  console.log(`[DEBUG] Inicializujem základné oprávnenia pre rolu: ${roleName}`);
  
  // Základné oprávnenia pre dashboard (aby každá rola mala aspoň prístup na dashboard)
  const permissions = {
    dashboard: {
      read: true,
      statistics: {
        read: true
      }
    }
  };
  
  // Pridáme oprávnenia podľa názvu role
  const roleNameLower = roleName.toLowerCase();
  
  // Administrátorske oprávnenia
  if (roleNameLower === 'administrator' || roleNameLower === 'admin') {
    permissions.admin = {
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
    };
    permissions.zakazky = {
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
    };
    permissions.vyroba = {
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
    };
    permissions.financie = {
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
    };
  } 
  // Manažérske oprávnenia
  else if (roleNameLower === 'manažér' || roleNameLower === 'manager') {
    permissions.admin = {
      read: true,
      users: {
        read: true
      },
      roles: {
        read: true
      }
    };
    permissions.zakazky = {
      read: true,
      write: true,
      create: {
        read: true,
        write: true
      },
      edit: {
        read: true,
        write: true
      },
      management: {
        read: true,
        write: true,
        approve: true
      }
    };
    permissions.vyroba = {
      read: true,
      write: true,
      sklad: {
        read: true
      },
      planovanie: {
        read: true,
        write: true
      }
    };
    permissions.financie = {
      read: true,
      faktury: {
        read: true,
        approve: true
      }
    };
  }
  // Účtovnícke oprávnenia
  else if (roleNameLower === 'účtovník' || roleNameLower === 'accountant') {
    permissions.financie = {
      read: true,
      write: true,
      faktury: {
        read: true,
        write: true,
        approve: true
      },
      prijmy: {
        read: true,
        write: true
      },
      vydavky: {
        read: true,
        write: true
      },
      mzdy: {
        read: true,
        write: true
      }
    };
    permissions.zakazky = {
      read: true
    };
  }
  // Zamestnanecké oprávnenia
  else if (roleNameLower === 'employee' || roleNameLower === 'zamestnanec') {
    permissions.zakazky = {
      read: true
    };
    permissions.vyroba = {
      read: true,
      sklad: {
        read: true
      }
    };
  }
  
  console.log(`[DEBUG] Vytvorené základné oprávnenia pre rolu ${roleName}:`, JSON.stringify(permissions).substring(0, 100) + '...');
  
  return permissions;
};

module.exports = {
  mapRoleNameToDbName,
  mapDbNameToRoleName,
  initializeDefaultPermissions
}; 