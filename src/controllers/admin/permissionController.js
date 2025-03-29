const logger = require('../../utils/logger');
const PermissionTemplate = require('../../models/permissionTemplate.model');

/**
 * Získanie zoznamu všetkých oprávnení
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPermissions = async (req, res) => {
  try {
    // Definované základné oprávnenia systému
    const systemPermissions = [
      { id: 'admin_read', name: 'Čítanie administrácie', category: 'Admin', description: 'Umožňuje prezerať administračné nastavenia' },
      { id: 'admin_write', name: 'Zápis administrácie', category: 'Admin', description: 'Umožňuje upravovať administračné nastavenia' },
      { id: 'vyroba_read', name: 'Čítanie výroby', category: 'Výroba', description: 'Umožňuje prezerať výrobné dáta' },
      { id: 'vyroba_write', name: 'Zápis výroby', category: 'Výroba', description: 'Umožňuje upravovať výrobné dáta' },
      { id: 'financie_read', name: 'Čítanie financií', category: 'Financie', description: 'Umožňuje prezerať finančné dáta' },
      { id: 'financie_write', name: 'Zápis financií', category: 'Financie', description: 'Umožňuje upravovať finančné dáta' },
      { id: 'zakazky_read', name: 'Čítanie zákaziek', category: 'Zákazky', description: 'Umožňuje prezerať zákazky' },
      { id: 'zakazky_write', name: 'Zápis zákaziek', category: 'Zákazky', description: 'Umožňuje vytvárať a upravovať zákazky' }
    ];
    
    res.status(200).json({
      success: true,
      permissions: systemPermissions
    });
  } catch (error) {
    logger.error(`Error getting permissions: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Chyba pri získavaní oprávnení',
      error: error.message
    });
  }
};

/**
 * Získanie všetkých šablón oprávnení
 */
exports.getPermissionTemplates = async (req, res) => {
  try {
    console.log("getPermissionTemplates called");
    
    // Načítame existujúce šablóny
    const templates = await PermissionTemplate.find({});
    
    console.log('Backend - Found templates count:', templates.length);
    
    // Transformujeme šablóny do jednotného formátu a odstránime MongoDB-špecifické polia
    const formattedTemplates = templates.map(template => {
      // Odstránime MongoDB špecifické polia a konvertujeme na plain object
      const plainTemplate = template.toObject ? template.toObject() : { ...template };
      
      const result = {
        id: plainTemplate.id,
        name: plainTemplate.name,
        description: plainTemplate.description || '',
        permissions: plainTemplate.permissions || [],
        children: Array.isArray(plainTemplate.children) 
          ? plainTemplate.children.map(child => ({
              id: child.id,
              name: child.name,
              permissions: child.permissions || []
            }))
          : []
      };
      
      // Odstránime všetky nepotrebné polia
      delete result._id;
      delete result.__v;
      delete result.createdAt;
      delete result.updatedAt;
      
      return result;
    });
    
    // Pripravíme odpoveď
    const response = {
      success: true,
      templates: formattedTemplates
    };
    
    console.log('Backend - Response structure:', 
      JSON.stringify(response).substring(0, 100) + '...');
    
    // Vrátime odpoveď v očakávanom formáte
    return res.json(response);
  } catch (error) {
    console.error('Backend Error:', error.message);
    logger.error(`Error getting permission templates: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Chyba pri získavaní šablón oprávnení',
      error: error.message
    });
  }
}; 