const Category = require('../models/category.model');
const Module = require('../models/module.model');
const { filterMenuByPermissions } = require('../utils/permissions');
const logger = require('../utils/logger');

/**
 * Get authorized menu based on user permissions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAuthorizedMenu = async (req, res) => {
  try {
    // Debug logovanie
    logger.info('=== DEBUG: getAuthorizedMenu called ===');
    logger.info(`User ID: ${req.user._id}`);
    logger.info(`Username: ${req.user.username}`);
    logger.info(`Role: ${req.user.roleName}`);
    
    // Get user from request (set by verifyToken middleware)
    const user = req.user;
    
    // If admin, get all menu items
    const isAdmin = user.roleName === 'admin';
    logger.info(`Is admin: ${isAdmin}`);
    
    // Získame všetky kategórie, ktoré sú aktívne
    const categories = await Category.find({ active: true }).sort('order');
    logger.info(`Categories found: ${categories.length}`);

    // Vytvoríme štruktúru menu položiek priamo z kategórií a ich podkategórií
    const menuItems = categories.map(category => {
      // Pre každú kategóriu vytvoríme položku menu
      const item = {
        id: category._id,
        code: category.name.toLowerCase().replace(/\s+/g, ''), // Generujeme kód z názvu
        name: category.name,
        icon: category.icon,
        type: 'category',
        requiredPermission: category.name.toLowerCase().replace(/\s+/g, '') + '_read',
        children: []
      };
      
      // Ak má kategória podkategórie, pridáme ich ako potomkov
      if (category.subcategories && category.subcategories.length > 0) {
        logger.info(`Subcategories in ${category.name}: ${category.subcategories.length}`);
        
        // Pridáme len aktívne podkategórie
        const activeSubcategories = category.subcategories.filter(sub => sub.active);
        
        item.children = activeSubcategories.map(subcategory => ({
          id: subcategory.id,
          code: subcategory.id,
          name: subcategory.name,
          path: subcategory.path,
          icon: subcategory.icon,
          type: 'module',
          requiredPermission: `${category.name.toLowerCase().replace(/\s+/g, '')}_${subcategory.id}_read`
        }));
        
        logger.info(`Active subcategories in ${category.name}: ${item.children.length}`);
      }
      
      return item;
    });
    
    // Debug: Kontrola výsledných položiek menu
    logger.info(`Menu items before filtering: ${menuItems.length}`);
    menuItems.forEach(item => {
      logger.info(`Category: ${item.name}, Children: ${item.children.length}`);
    });
    
    // Mapovanie špecifických názvov kategórií na fixné kódy, ktoré presne zodpovedajú kľúčom v permissions
    const mapCategoryNameToCode = (name) => {
      // Táto funkcia zabezpečuje presné mapovanie na kľúče v permissions
      const nameLower = name.toLowerCase();
      
      // Mapovanie hlavných kategórií
      if (nameLower.includes('dashboard')) return 'dashboard';
      if (nameLower.includes('zákazky') || nameLower.includes('zakazky') || 
          nameLower.includes('správa zákaziek') || nameLower.includes('workflow')) return 'zakazky';
      if (nameLower.includes('výroba') || nameLower.includes('vyroba') || nameLower.includes('sklad')) return 'vyroba';
      if (nameLower.includes('financie') || nameLower.includes('finančný')) return 'financie';
      if (nameLower.includes('admin') || nameLower.includes('administrácia')) return 'admin';
      
      // Ak nenájdeme presné mapovanie, použijeme normalizovaný názov
      return normalizeNameToCode(name);
    };
    
    // Mapovanie špecifických názvov podkategórií na fixné kódy
    const mapSubcategoryNameToCode = (name) => {
      const nameLower = name.toLowerCase();
      
      // Podkategórie zákaziek (workflow fázy)
      if (nameLower.includes('cenová ponuka') || nameLower.includes('cenova ponuka') || 
          nameLower.includes('cenové ponuky') || nameLower.includes('cenove ponuky')) {
        return 'quotes'; // Fixný kód pre cenové ponuky - zoznam
      }
      if (nameLower.includes('objednávka') || nameLower.includes('objednavka')) return 'objednavka';
      if (nameLower.includes('faktúra') || nameLower.includes('faktura') || 
          nameLower.includes('fakturácia') || nameLower.includes('fakturacia')) return 'fakturacia';
      if (nameLower.includes('expedícia') || nameLower.includes('expedicia')) return 'expediacia';
      if (nameLower.includes('zákazka') || nameLower.includes('zakazka')) return 'zakazka';
      
      // Podkategórie výroby
      if (nameLower.includes('sklad')) return 'sklad';
      if (nameLower.includes('plánovanie') || nameLower.includes('planovanie')) return 'planovanie';
      
      // Podkategórie financií
      if (nameLower.includes('faktúry') || nameLower.includes('faktury')) return 'faktury';
      if (nameLower.includes('príjmy') || nameLower.includes('prijmy')) return 'prijmy';
      if (nameLower.includes('výdavky') || nameLower.includes('vydavky')) return 'vydavky';
      
      // Podkategórie admin
      if (nameLower.includes('užívatelia') || nameLower.includes('uzivatelia') || 
          nameLower.includes('používatelia') || nameLower.includes('pouzivatelia')) return 'users';
      if (nameLower.includes('roly') || nameLower.includes('role')) return 'roles';
      if (nameLower.includes('nastavenia') || nameLower.includes('settings')) return 'settings';
      
      // Ak nenájdeme presné mapovanie, použijeme normalizovaný názov
      return normalizeNameToCode(name);
    };
    
    // Základná normalizačná funkcia pre generovanie konzistentných kódov
    const normalizeNameToCode = (name) => {
      if (!name) return '';
      return name
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Odstránenie diakritiky
        .replace(/[^a-z0-9]/g, '') // Ponechá len písmená a čísla
        .trim();
    };
    
    // Generujeme kódy pre menu položky, s predefinovaným mapovaním
    const mappedMenuItems = menuItems.map(item => {
      // Použijeme presné mapovanie alebo normalizovaný kód
      const code = mapCategoryNameToCode(item.name);
      
      // Logujme mapovanie pre diagnostiku
      logger.info(`Mapped main category "${item.name}" to code: ${code}`);
      
      // Prekopírujeme menu položku s aktualizovaným kódom
      const mappedItem = {
        ...item,
        code,
        requiredPermission: `${code}_read`
      };
      
      // Ak položka má deti, upravíme ich kódy tiež
      if (mappedItem.children && mappedItem.children.length > 0) {
        logger.info(`Processing ${mappedItem.children.length} subcategories for category "${item.name}"`);
        
        mappedItem.children = mappedItem.children.map(child => {
          // Pre podkategórie použijeme presné mapovanie
          const childCode = mapSubcategoryNameToCode(child.name);
          
          logger.info(`Mapped subcategory "${child.name}" to code: ${childCode}`);
          
          // Kontrolujeme, či kód podkategórie sa nachádza v používateľských oprávneniach
          if (user.permissions && user.permissions[code]) {
            if (user.permissions[code][childCode]) {
              logger.info(`FOUND PERMISSION: ${code}.${childCode}.read = ${user.permissions[code][childCode].read}`);
            } else {
              logger.info(`NO PERMISSION FOUND: ${code}.${childCode} - using parent permission`);
            }
          }
          
          // Vrátime upraveného potomka
          return {
            ...child,
            code: childCode,
            requiredPermission: `${code}_${childCode}_read`
          };
        });
        
        logger.info(`Finished mapping ${mappedItem.children.length} subcategories for "${item.name}"`);
      }
      
      return mappedItem;
    });
    
    // Logujme používateľove oprávnenia pre diagnostiku
    logger.info(`User permissions: ${JSON.stringify(user.permissions)}`);
    
    // Filter menu based on permissions if not admin
    const filteredMenu = isAdmin ? mappedMenuItems : filterMenuBasedOnPermissions(mappedMenuItems, user.permissions);
    
    // Debug: Kontrola filtrovaných položiek menu
    logger.info(`Menu items after filtering: ${filteredMenu.length}`);
    filteredMenu.forEach(item => {
      logger.info(`Filtered menu item: ${item.name}, Code: ${item.code}, Required Permission: ${item.requiredPermission}`);
    });
    
    res.status(200).json({
      success: true,
      menu: filteredMenu
    });
    
    logger.info('=== DEBUG: getAuthorizedMenu completed ===');
  } catch (error) {
    logger.error(`Menu retrieval error: ${error.message}`);
    logger.error(error.stack);
    res.status(500).json({
      success: false,
      message: 'Error retrieving menu',
      error: error.message
    });
  }
};

/**
 * Filter menu items based directly on user permissions object
 * Vylepšený filter s podporou dedenia oprávnení z hlavnej kategórie
 */
function filterMenuBasedOnPermissions(menuItems, permissions) {
  logger.info(`=== ENHANCED PERMISSION FILTERING ===`);
  logger.info(`Permissions structure: ${JSON.stringify(permissions, null, 2)}`);
  
  // Kontrola existencie permissions objektu
  if (!permissions || Object.keys(permissions).length === 0) {
    logger.info(`WARNING: Empty permissions object - no menu items will be shown`);
    return [];
  }
  
  // Filtrovanie hlavných kategórií
  return menuItems.filter(category => {
    const sectionCode = category.code;
    logger.info(`\n----- Checking main category: "${category.name}" (code: ${sectionCode}) -----`);
    
    // Kontrola existencie sekcie v permissions
    if (!permissions[sectionCode]) {
      logger.info(`HIDE MAIN: "${category.name}" - section "${sectionCode}" not found in permissions`);
      return false;
    }
    
    // Kontrola read permission pre hlavnú kategóriu
    const hasReadPermission = permissions[sectionCode].read === true;
    
    if (!hasReadPermission) {
      logger.info(`HIDE MAIN: "${category.name}" - read permission is ${permissions[sectionCode].read}`);
      return false;
    }
    
    logger.info(`SHOW MAIN: "${category.name}" - has read permission: ${hasReadPermission}`);
    
    // Filtrovanie podkategórií (deti)
    if (category.children && category.children.length > 0) {
      const originalCount = category.children.length;
      logger.info(`Filtering ${originalCount} subcategories for "${category.name}"`);
      
      // Filtrovanie detí
      category.children = category.children.filter(subcategory => {
        const subcategoryCode = subcategory.code;
        logger.info(`  Checking subcategory: "${subcategory.name}" (code: ${subcategoryCode})`);
        
        // Možnosť 1: Explicitné oprávnenie pre podkategóriu
        if (permissions[sectionCode][subcategoryCode] && 
            permissions[sectionCode][subcategoryCode].read === true) {
          logger.info(`  SHOW SUB: "${subcategory.name}" - has explicit read permission`);
          return true;
        }
        
        // Možnosť 2: Ak podkategória nemá explicitné oprávnenie, kontrolujeme hlavnú kategóriu
        if (!permissions[sectionCode][subcategoryCode] && permissions[sectionCode].read === true) {
          logger.info(`  INHERIT FROM PARENT: "${subcategory.name}" - using parent's read permission`);
          return true;
        }
        
        // Možnosť 3: Podkategória má explicitne nastavené false
        if (permissions[sectionCode][subcategoryCode] && 
            permissions[sectionCode][subcategoryCode].read === false) {
          logger.info(`  HIDE SUB: "${subcategory.name}" - has explicit read:false permission`);
          return false;
        }
        
        // Ak nemá oprávnenie alebo je nastavené na false, skryjeme
        logger.info(`  HIDE SUB: "${subcategory.name}" - no permission found`);
        return false;
      });
      
      logger.info(`Filtered subcategories for "${category.name}": kept ${category.children.length} of ${originalCount}`);
    }
    
    return true;
  });
} 