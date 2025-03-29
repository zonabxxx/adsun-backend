const Role = require('../../models/role.model');
const User = require('../../models/user.model');
const logger = require('../../utils/logger');
const { initializeDefaultPermissions } = require('./utils');

/**
 * Získanie zoznamu všetkých rolí
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRoles = async (req, res) => {
  try {
    // Získanie všetkých rolí
    const roles = await Role.find({}).sort({ name: 1 });
    
    console.log(`[DEBUG] Počet nájdených rolí: ${roles.length}`);
    
    // Detailné logovanie rolí
    roles.forEach((role, index) => {
      console.log(`[DEBUG] Rola ${index + 1}: ID=${role._id}, name=${role.name}, isSystem=${role.isSystem || false}`);
      
      // Skontrolujeme, či má rola definované oprávnenia
      const permissions = role.defaultPermissions || {};
      console.log(`[DEBUG] Rola ${index + 1} permissions (skrátené):`, 
        Object.keys(permissions).length === 0 ? 
        "{}" : 
        JSON.stringify(permissions).substring(0, 100) + '...');
    });
    
    // Transformácia dát pre jednotný formát
    const formattedRoles = roles.map(role => {
      // Získame permissions z defaultPermissions
      let permissions = role.defaultPermissions || {};
      
      // Ak permissions je prázdny objekt, inicializujeme základné oprávnenia podľa názvu role
      if (Object.keys(permissions).length === 0) {
        console.log(`[DEBUG] Inicializujem základné oprávnenia pre rolu: ${role.name}`);
        permissions = initializeDefaultPermissions(role.name);
        console.log(`[DEBUG] Vytvorené základné oprávnenia pre rolu ${role.name}:`, 
          JSON.stringify(permissions).substring(0, 100) + '...');
        
        // Uložíme aktualizovanú rolu s oprávneniami pre budúce použitie
        role.defaultPermissions = permissions;
        
        // Uložíme zmeny do databázy asynchrónne (nevyžadujeme čakanie na uloženie)
        role.save().catch(err => {
          console.error(`[DEBUG] Chyba pri ukladaní základných oprávnení pre rolu ${role.name}:`, err);
        });
      }
      
      return {
        id: role._id,
        name: role.name,
        description: role.description || '',
        permissions: permissions, // Vraciam permissions ako kópiu defaultPermissions pre kompatibilitu
        defaultPermissions: permissions,
        isSystem: role.isSystem || false,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      };
    });
    
    console.log('[DEBUG] Odosielam formátované role:');
    formattedRoles.forEach((role, index) => {
      console.log(`[DEBUG] Formátovaná rola ${index + 1}: id=${role.id}, name=${role.name}`);
    });
    
    res.status(200).json({
      success: true,
      roles: formattedRoles
    });
  } catch (error) {
    logger.error(`Error getting roles: ${error.message}`);
    console.error('[DEBUG] Chyba pri získavaní rolí:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba pri získavaní rolí',
      error: error.message
    });
  }
};

/**
 * Získanie detailu role podľa ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRoleById = async (req, res) => {
  try {
    console.log(`[DEBUG] Hľadám rolu s ID: ${req.params.id}`);
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      console.log(`[DEBUG] Rola s ID ${req.params.id} nebola nájdená`);
      return res.status(404).json({
        success: false,
        message: 'Rola nenájdená'
      });
    }
    
    console.log(`[DEBUG] Našla sa rola: ID=${role._id}, name=${role.name}`);
    
    // Získame permissions z defaultPermissions
    let permissions = role.defaultPermissions || {};
    console.log(`[DEBUG] Existujúce permissions pre rolu ${role.name}:`, 
      Object.keys(permissions).length === 0 ? 
      "{}" : 
      JSON.stringify(permissions).substring(0, 200));
    
    // Ak permissions je prázdny objekt, inicializujeme základné oprávnenia
    if (Object.keys(permissions).length === 0) {
      console.log(`[DEBUG] Inicializujem základné oprávnenia pre rolu ${role.name}`);
      permissions = initializeDefaultPermissions(role.name);
      console.log(`[DEBUG] Vytvorené základné oprávnenia:`, 
        JSON.stringify(permissions).substring(0, 200));
      
      // Uložíme aktualizovanú rolu s oprávneniami
      role.defaultPermissions = permissions;
      
      await role.save();
      console.log(`[DEBUG] Uložené základné oprávnenia pre rolu ${role.name}`);
    }
    
    res.status(200).json({
      success: true,
      role: {
        id: role._id,
        name: role.name,
        description: role.description || '',
        permissions: permissions, // Vraciam permissions ako kópiu defaultPermissions pre kompatibilitu  
        defaultPermissions: permissions,
        isSystem: role.isSystem || false,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      }
    });
  } catch (error) {
    logger.error(`Error getting role by ID: ${error.message}`);
    console.error(`[DEBUG] Chyba pri získavaní role podľa ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Chyba pri získavaní role',
      error: error.message
    });
  }
};

/**
 * Vytvorenie novej role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions, defaultPermissions } = req.body;
    
    // Logovanie pre debug
    console.log('[DEBUG] Dáta pre vytvorenie role:', JSON.stringify({
      name,
      description,
      permissionsType: permissions ? typeof permissions : null,
      permissionsIsArray: permissions ? Array.isArray(permissions) : null,
      permissionsKeys: permissions && typeof permissions === 'object' && !Array.isArray(permissions) ? Object.keys(permissions) : null
    }));
    
    // Kontrola existencie názvu role
    const existingRole = await Role.findOne({ name });
    
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Rola s týmto názvom už existuje'
      });
    }
    
    // Inicializácia oprávnení - preferujeme permissions pred defaultPermissions
    let rolePermissions = {};
    
    // Detailné logovanie prijatých dát
    if (permissions) {
      console.log('[DEBUG] Permissions typ:', typeof permissions);
      console.log('[DEBUG] Permissions je pole?', Array.isArray(permissions));
      if (typeof permissions === 'object') {
        if (Array.isArray(permissions)) {
          console.log('[DEBUG] Permissions ako pole obsahuje:', permissions);
        } else {
          console.log('[DEBUG] Permissions ako objekt má kľúče:', Object.keys(permissions));
          
          // Kontrola náhodnej vzorky hodnôt
          const sampleKeys = Object.keys(permissions).slice(0, 2);
          sampleKeys.forEach(key => {
            console.log(`[DEBUG] Permissions[${key}] typ:`, typeof permissions[key]);
            console.log(`[DEBUG] Permissions[${key}] hodnota:`, JSON.stringify(permissions[key]).substring(0, 50));
          });
        }
      }
    }
    
    // Ak permissions je objekt s hierarchickou štruktúrou
    if (permissions && typeof permissions === 'object' && !Array.isArray(permissions)) {
      rolePermissions = JSON.parse(JSON.stringify(permissions)); // Vytvorenie hlbokej kópie
      console.log('[DEBUG] Použité permissions z requestu - objekt');
      
      // Iterujeme cez všetky kategórie a odstránime vlastnosti z MongoDB
      Object.keys(rolePermissions).forEach(categoryKey => {
        const category = rolePermissions[categoryKey];
        
        // Ak je kategória objekt, odstránime MongoDB vlastnosti
        if (category && typeof category === 'object') {
          if ('_id' in category) delete category._id;
          if ('__v' in category) delete category.__v;
          if ('createdAt' in category) delete category.createdAt;
          if ('updatedAt' in category) delete category.updatedAt;
          
          // Iterujeme cez všetky vlastnosti kategórie
          Object.keys(category).forEach(propKey => {
            const prop = category[propKey];
            
            // Ak je vlastnosť kategórie objekt (podkategória), odstránime MongoDB vlastnosti
            if (prop && typeof prop === 'object' && !Array.isArray(prop)) {
              if ('_id' in prop) delete prop._id;
              if ('__v' in prop) delete prop.__v;
              if ('createdAt' in prop) delete prop.createdAt;
              if ('updatedAt' in prop) delete prop.updatedAt;
            }
          });
        }
      });
    } 
    // Ak defaultPermissions je objekt s hierarchickou štruktúrou
    else if (defaultPermissions && typeof defaultPermissions === 'object' && !Array.isArray(defaultPermissions)) {
      rolePermissions = JSON.parse(JSON.stringify(defaultPermissions)); // Vytvorenie hlbokej kópie
      console.log('[DEBUG] Použité defaultPermissions z requestu - objekt');
    }
    // Ak permissions je pole stringov (z predchádzajúcej implementácie)
    else if (Array.isArray(permissions) && permissions.length > 0) {
      console.log('[DEBUG] Permissions je pole stringov, prekonvertujem na objekt:', permissions);
      
      // Vytvoríme základné štruktúry pre každú kategóriu
      permissions.forEach(categoryId => {
        if (typeof categoryId === 'string') {
          rolePermissions[categoryId] = {
            read: true,
            write: false
          };
          console.log(`[DEBUG] Vytvorená štruktúra pre kategóriu ${categoryId}`);
        }
      });
    }
    // Ak permissions a defaultPermissions nie sú platné, použijeme defaultné oprávnenia
    else {
      console.log('[DEBUG] Pre rolu neboli poskytnuté žiadne oprávnenia, použijem základné');
      rolePermissions = initializeDefaultPermissions(name);
    }
    
    // Uistíme sa, že štruktúra pre uloženie je validná
    if (!rolePermissions || typeof rolePermissions !== 'object' || Array.isArray(rolePermissions)) {
      console.log('[DEBUG] Neplatná štruktúra oprávnení, použijem prázdny objekt');
      rolePermissions = { dashboard: { read: true } };
    }
    
    console.log('[DEBUG] Konečné oprávnenia pre uloženie:', 
      JSON.stringify(rolePermissions).substring(0, 200) + (JSON.stringify(rolePermissions).length > 200 ? '...' : ''));
    
    // Vytvorenie novej role s oprávneniami
    const newRole = new Role({
      name,
      description: description || '',
      defaultPermissions: rolePermissions,
      isSystem: false
    });
    
    await newRole.save();
    
    console.log(`[DEBUG] Rola ${name} bola úspešne vytvorená s ID ${newRole._id}`);
    console.log(`[DEBUG] Uložené oprávnenia - hlavné kategórie:`, Object.keys(rolePermissions).join(', '));
    
    res.status(201).json({
      success: true,
      message: 'Rola bola úspešne vytvorená',
      role: {
        id: newRole._id,
        name: newRole.name,
        description: newRole.description,
        permissions: rolePermissions,
        defaultPermissions: rolePermissions,
        isSystem: newRole.isSystem
      }
    });
  } catch (error) {
    logger.error(`Error creating role: ${error.message}`);
    console.error('[DEBUG] Chyba pri vytváraní role:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba pri vytváraní role',
      error: error.message
    });
  }
};

/**
 * Aktualizácia role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateRole = async (req, res) => {
  try {
    const { name, description, permissions, defaultPermissions } = req.body;
    
    // Logovanie pre debug
    console.log('[DEBUG] Dáta pre aktualizáciu role:', JSON.stringify({
      id: req.params.id,
      name,
      description,
      permissionsProvided: !!permissions,
      defaultPermissionsProvided: !!defaultPermissions
    }));
    
    // Kontrola existencie role
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rola nenájdená'
      });
    }
    
    // Kontrola, či je systémová rola
    if (role.isSystem) {
      return res.status(403).json({
        success: false,
        message: 'Systémové role nemôžu byť upravované'
      });
    }
    
    // Kontrola existencie názvu role pri zmene
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({
        _id: { $ne: req.params.id },
        name
      });
      
      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: 'Rola s týmto názvom už existuje'
        });
      }
    }
    
    // Prioritizujeme permissions pred defaultPermissions
    let rolePermissions = null;
    if (permissions && typeof permissions === 'object' && !Array.isArray(permissions)) {
      rolePermissions = JSON.parse(JSON.stringify(permissions)); // Deep copy
      console.log('[DEBUG] Použité permissions z requestu');
    } else if (defaultPermissions && typeof defaultPermissions === 'object' && !Array.isArray(defaultPermissions)) {
      rolePermissions = JSON.parse(JSON.stringify(defaultPermissions)); // Deep copy
      console.log('[DEBUG] Použité defaultPermissions z requestu');
    }
    
    // Aktualizácia role
    if (name) role.name = name;
    if (description !== undefined) role.description = description;
    if (rolePermissions) {
      role.defaultPermissions = rolePermissions;
      console.log('[DEBUG] Aktualizované oprávnenia role');
    }
    
    await role.save();
    
    res.status(200).json({
      success: true,
      message: 'Rola bola úspešne aktualizovaná',
      role: {
        id: role._id,
        name: role.name,
        description: role.description,
        permissions: role.defaultPermissions,
        defaultPermissions: role.defaultPermissions,
        isSystem: role.isSystem
      }
    });
  } catch (error) {
    logger.error(`Error updating role: ${error.message}`);
    console.error('[DEBUG] Chyba pri aktualizácii role:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba pri aktualizácii role',
      error: error.message
    });
  }
};

/**
 * Vymazanie role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rola nenájdená'
      });
    }
    
    // Kontrola, či je systémová rola
    if (role.isSystem) {
      return res.status(403).json({
        success: false,
        message: 'Systémové role nemôžu byť vymazané'
      });
    }
    
    // Kontrola, či existujú používatelia s touto rolou
    const usersWithRole = await User.countDocuments({ roleId: role._id });
    
    if (usersWithRole > 0) {
      return res.status(400).json({
        success: false,
        message: 'Túto rolu nie je možné vymazať, pretože ju používajú existujúci používatelia'
      });
    }
    
    await Role.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Rola bola úspešne vymazaná'
    });
  } catch (error) {
    logger.error(`Error deleting role: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Chyba pri vymazávaní role',
      error: error.message
    });
  }
};

/**
 * Aktualizácia oprávnení pre rolu
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateRolePermissions = async (req, res) => {
  try {
    const { defaultPermissions } = req.body;
    
    if (!defaultPermissions || typeof defaultPermissions !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Neplatný formát oprávnení'
      });
    }
    
    console.log(`[DEBUG] Aktualizácia oprávnení pre rolu s ID: ${req.params.id}`);
    console.log(`[DEBUG] Prijaté oprávnenia:`, JSON.stringify(defaultPermissions).substring(0, 200));
    
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rola nenájdená'
      });
    }
    
    // Kontrola, či je systémová rola
    if (role.isSystem && role.name === 'Administrator') {
      return res.status(403).json({
        success: false,
        message: 'Oprávnenia administrátora nemôžu byť upravované'
      });
    }
    
    // Uloženie novej verzie oprávnení
    role.defaultPermissions = defaultPermissions;
    console.log(`[DEBUG] Ukladám aktualizované oprávnenia pre rolu ${role.name}`);
    await role.save();
    
    res.status(200).json({
      success: true,
      message: 'Oprávnenia role boli úspešne aktualizované',
      role: {
        id: role._id,
        name: role.name,
        defaultPermissions: role.defaultPermissions
      }
    });
  } catch (error) {
    logger.error(`Error updating role permissions: ${error.message}`);
    console.error(`[DEBUG] Chyba pri aktualizácii oprávnení pre rolu s ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Chyba pri aktualizácii oprávnení role',
      error: error.message
    });
  }
}; 