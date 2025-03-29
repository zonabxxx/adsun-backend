const permissionTemplates = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    permissions: ['read'],
    children: []
  },
  {
    id: 'admin',
    name: 'Administrácia',
    permissions: ['read', 'write'],
    children: [
      {
        id: 'users',
        name: 'Používatelia',
        permissions: ['read', 'write', 'delete']
      },
      {
        id: 'roles',
        name: 'Role a oprávnenia',
        permissions: ['read', 'write', 'delete']
      },
      {
        id: 'settings',
        name: 'Nastavenia systému',
        permissions: ['read', 'write']
      },
      {
        id: 'logs',
        name: 'Systémové logy',
        permissions: ['read']
      },
      {
        id: 'backups',
        name: 'Zálohovanie',
        permissions: ['read', 'write', 'execute']
      }
    ]
  },
  {
    id: 'zakazky',
    name: 'Zákazky',
    permissions: ['read', 'write', 'delete'],
    children: [
      {
        id: 'create',
        name: 'Vytváranie zákaziek',
        permissions: ['read', 'write']
      },
      {
        id: 'edit',
        name: 'Úprava zákaziek',
        permissions: ['read', 'write', 'delete']
      },
      {
        id: 'management',
        name: 'Správa zákaziek',
        permissions: ['read', 'write', 'delete', 'approve']
      }
    ]
  },
  {
    id: 'vyroba',
    name: 'Výroba',
    permissions: ['read', 'write', 'delete'],
    children: [
      {
        id: 'sklad',
        name: 'Sklad',
        permissions: ['read', 'write', 'delete']
      },
      {
        id: 'planovanie',
        name: 'Plánovanie výroby',
        permissions: ['read', 'write']
      },
      {
        id: 'vyrobky',
        name: 'Správa výrobkov',
        permissions: ['read', 'write', 'delete']
      }
    ]
  },
  {
    id: 'financie',
    name: 'Financie',
    permissions: ['read', 'write', 'delete'],
    children: [
      {
        id: 'faktury',
        name: 'Faktúry',
        permissions: ['read', 'write', 'delete', 'approve']
      },
      {
        id: 'prijmy',
        name: 'Príjmy',
        permissions: ['read', 'write', 'delete']
      },
      {
        id: 'vydavky',
        name: 'Výdavky',
        permissions: ['read', 'write', 'delete']
      },
      {
        id: 'mzdy',
        name: 'Mzdy',
        permissions: ['read', 'write', 'approve']
      }
    ]
  }
];

module.exports = permissionTemplates; 