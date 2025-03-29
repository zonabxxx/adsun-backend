const User = require('../../models/user.model');
const Role = require('../../models/role.model');
const logger = require('../../utils/logger');
const { mapRoleNameToDbName } = require('./utils');

/**
 * Získanie zoznamu všetkých používateľov
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-passwordHash');
    
    // Transformácia dát pre jednotný formát
    const formattedUsers = users.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.roleName || 'Používateľ',
      active: user.isActive || false,
      lastLogin: user.lastLogin
    }));
    
    res.status(200).json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    logger.error(`Error getting users: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Chyba pri získavaní používateľov',
      error: error.message
    });
  }
};

/**
 * Získanie detailu používateľa podľa ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Používateľ nenájdený'
      });
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        fullName: user.fullName || '',
        role: user.roleName || 'Používateľ',
        roleName: user.roleName || 'Používateľ',
        roleId: user.roleId,
        permissions: user.permissions || {},
        active: user.isActive || false,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    logger.error(`Error getting user by ID: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Chyba pri získavaní používateľa',
      error: error.message
    });
  }
};

/**
 * Vytvorenie nového používateľa
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, roleName, isActive } = req.body;
    
    // Logovanie vstupných dát
    logger.info(`Vytváram používateľa: ${username}, email: ${email}, roleName: ${roleName || 'neurčená'}`);
    
    // Kontrola existencie používateľského mena alebo emailu
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Používateľské meno alebo email už existuje'
      });
    }
    
    // Základné oprávnenia pre dashboard - použijeme len ak sa nenájde rola
    let permissions = {
      dashboard: {
        read: true,
        statistics: {
          read: true
        }
      }
    };
    
    let selectedRoleName = 'user'; // Predvolená hodnota
    let roleId = null;

    // Ak je zadaná rola, pokúsime sa ju nájsť v databáze
    if (roleName) {
      // Mapujeme názov role (ak je potrebné mapovanie)
      const dbRoleName = mapRoleNameToDbName(roleName);
      logger.info(`Hľadám rolu s názvom ${dbRoleName} (mapované z ${roleName})`);
      
      const role = await Role.findOne({ name: dbRoleName });
      if (role) {
        roleId = role._id;
        selectedRoleName = roleName; // Použijeme originálny roleName od používateľa
        logger.info(`Priradenie role ${dbRoleName} (${role._id}) novému používateľovi ${username}`);
        
        // Použijeme oprávnenia z role - najprv skontrolujeme, či má rola defaultPermissions
        const rolePermissions = role._doc.defaultPermissions || role.permissions;
        if (rolePermissions && Object.keys(rolePermissions).length > 0) {
          permissions = rolePermissions;
          logger.info(`Použitie oprávnení z role ${dbRoleName} pre používateľa ${username}`);
        } else {
          logger.info(`Rola ${dbRoleName} nemá definované oprávnenia v databáze, používam základné oprávnenia pre dashboard`);
        }
      } else {
        logger.warn(`Rola s názvom ${dbRoleName} nebola nájdená v databáze, použijem predvolenú rolu 'user'`);
      }
    } else {
      logger.info('Rola nebola zadaná, použijem predvolenú rolu "user"');
    }
    
    // Vytvorenie nového používateľa s oprávneniami
    const newUser = new User({
      username,
      email,
      password,
      firstName: firstName || '',
      lastName: lastName || '',
      roleName: selectedRoleName,
      roleId: roleId,
      permissions: permissions,
      isActive: isActive === undefined ? true : isActive
    });
    
    // Logovanie vytváraného používateľa
    logger.info(`Ukladám nového používateľa s roleName: ${selectedRoleName}, roleId: ${roleId || 'null'}`);
    logger.info(`Permissions pre nového používateľa: ${JSON.stringify(permissions)}`);
    
    await newUser.save();
    
    res.status(201).json({
      success: true,
      message: 'Používateľ bol úspešne vytvorený',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.roleName,
        active: newUser.isActive,
        permissions: newUser.permissions
      }
    });
  } catch (error) {
    logger.error(`Error creating user: ${error.message}`);
    logger.error(`Stack trace: ${error.stack}`);
    res.status(500).json({
      success: false,
      message: 'Chyba pri vytváraní používateľa',
      error: error.message
    });
  }
};

/**
 * Aktualizácia používateľa podľa ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, firstName, lastName, roleName, isActive, password, permissions } = req.body;
    
    logger.info(`Aktualizujem používateľa s ID: ${id}`);
    logger.info(`Príchodzie dáta: ${JSON.stringify({ ...req.body, password: password ? '***' : undefined })}`);
    
    // Hľadáme používateľa v databáze
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Používateľ nebol nájdený'
      });
    }
    
    // Kontrola duplicitného používateľského mena alebo emailu
    if (username !== user.username || email !== user.email) {
      const existingUser = await User.findOne({
        _id: { $ne: id },
        $or: [
          { username: username || user.username },
          { email: email || user.email }
        ]
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Používateľské meno alebo email už používa iný používateľ'
        });
      }
    }
    
    // Aktualizácia základných údajov používateľa
    user.username = username || user.username;
    user.email = email || user.email;
    user.firstName = firstName !== undefined ? firstName : user.firstName;
    user.lastName = lastName !== undefined ? lastName : user.lastName;
    user.isActive = isActive !== undefined ? isActive : user.isActive;
    
    // Aktualizácia hesla, ak bolo poskytnuté
    if (password) {
      logger.info(`Aktualizácia hesla pre používateľa ${user.username}`);
      // Nastavíme virtuálnu property password, ktorá spustí hook pre hashování
      user.password = password;
    }
    
    // Aktualizácia permissions, ak boli poskytnuté
    if (permissions) {
      user.permissions = permissions;
      logger.info(`Aktualizácia oprávnení pre používateľa ${user.username}`);
    }
    
    let roleUpdated = false;
    
    // Aktualizácia role ak bola zadaná
    if (roleName && roleName !== user.roleName) {
      logger.info(`Zmena role používateľa ${user.username} z ${user.roleName} na ${roleName}`);
      
      // Mapujeme názov role (ak je potrebné mapovanie)
      const dbRoleName = mapRoleNameToDbName(roleName);
      logger.info(`Hľadám rolu s názvom ${dbRoleName} (mapované z ${roleName})`);
      
      const role = await Role.findOne({ name: dbRoleName });
      if (role) {
        user.roleId = role._id;
        user.roleName = roleName; // Použijeme originálny roleName od používateľa
        roleUpdated = true;
        
        logger.info(`Priradenie novej role ${dbRoleName} (${role._id}) používateľovi ${user.username}`);
        
        // Použijeme oprávnenia z role, ak existujú a neboli explicitne prevedené iné permissions
        if (!permissions) {
          const rolePermissions = role._doc.defaultPermissions || role.permissions;
          if (rolePermissions && Object.keys(rolePermissions).length > 0) {
            user.permissions = rolePermissions;
            logger.info(`Aktualizácia oprávnení z novej role ${dbRoleName} pre používateľa ${user.username}`);
          } else {
            logger.info(`Rola ${dbRoleName} nemá definované oprávnenia, ponechávam existujúce oprávnenia pre používateľa ${user.username}`);
          }
        }
      } else {
        logger.warn(`Rola s názvom ${dbRoleName} nebola nájdená v databáze, ponechávam pôvodnú rolu ${user.roleName}`);
      }
    } else {
      logger.info(`Rola používateľa ${user.username} zostáva nezmenená (${user.roleName})`);
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Používateľ bol úspešne aktualizovaný',
      roleUpdated,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.roleName,
        permissions: user.permissions,
        active: user.isActive
      }
    });
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);
    logger.error(`Stack trace: ${error.stack}`);
    res.status(500).json({
      success: false,
      message: 'Chyba pri aktualizácii používateľa',
      error: error.message
    });
  }
};

/**
 * Aktualizácia stavu používateľa (aktívny/neaktívny)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { active } = req.body;
    
    if (active === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Chýba parameter aktívny/neaktívny'
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Používateľ nenájdený'
      });
    }
    
    user.isActive = active;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `Používateľ bol ${active ? 'aktivovaný' : 'deaktivovaný'}`,
      user: {
        id: user._id,
        active: user.isActive
      }
    });
  } catch (error) {
    logger.error(`Error updating user status: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Chyba pri aktualizácii stavu používateľa',
      error: error.message
    });
  }
};

/**
 * Vymazanie používateľa
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Používateľ nenájdený'
      });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Používateľ bol úspešne vymazaný'
    });
  } catch (error) {
    logger.error(`Error deleting user: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Chyba pri vymazávaní používateľa',
      error: error.message
    });
  }
};

/**
 * Aktualizácia oprávnení pre používateľa
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateUserPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    
    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Neplatný formát oprávnení'
      });
    }
    
    logger.info(`Aktualizácia oprávnení pre používateľa s ID: ${req.params.id}`);
    logger.debug(`Prijaté oprávnenia: ${JSON.stringify(permissions).substring(0, 200)}...`);
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Používateľ nenájdený'
      });
    }
    
    // Uloženie individuálnych oprávnení pre používateľa
    user.permissions = permissions;
    logger.info(`Ukladám aktualizované oprávnenia pre používateľa ${user.username}`);
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Oprávnenia používateľa boli úspešne aktualizované',
      user: {
        id: user._id,
        username: user.username,
        permissions: user.permissions
      }
    });
  } catch (error) {
    logger.error(`Error updating user permissions: ${error.message}`);
    logger.error(`Stack trace: ${error.stack}`);
    res.status(500).json({
      success: false,
      message: 'Chyba pri aktualizácii oprávnení používateľa',
      error: error.message
    });
  }
}; 