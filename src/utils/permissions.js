/**
 * Flatten hierarchical permissions object into an array
 * @param {Object} permissionsObj - Hierarchical permissions object
 * @param {String} prefix - Prefix for nested permissions
 * @returns {Array} - Flattened permissions array
 */
const flattenPermissions = (permissionsObj, prefix = '') => {
  let result = [];
  
  for (const key in permissionsObj) {
    const value = permissionsObj[key];
    
    // Ak je hodnota boolean a true, pridáme oprávnenie
    if (typeof value === 'boolean' && value === true) {
      result.push(`${prefix}${key}`);
      continue;
    }
    
    // Ak je hodnota objekt, rekurzívne spracujeme jeho obsah
    if (typeof value === 'object' && value !== null) {
      const nestedPermissions = flattenPermissions(value, `${prefix}${key}_`);
      result = [...result, ...nestedPermissions];
    }
  }
  
  return result;
};

/**
 * Check if user has specific permission
 * @param {Object} userPermissions - User's permissions object
 * @param {String} requiredPermission - Required permission to check
 * @returns {Boolean} - Whether user has the permission
 */
const hasPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions || typeof userPermissions !== 'object') {
    return false;
  }

  const flattenedPermissions = flattenPermissions(userPermissions);
  return flattenedPermissions.includes(requiredPermission);
};

/**
 * Convert flat permissions array to hierarchical object
 * @param {Array} flatPermissions - Array of flat permission strings
 * @returns {Object} - Hierarchical permissions object
 */
const unflattenPermissions = (flatPermissions) => {
  const result = {};
  
  flatPermissions.forEach(permission => {
    const parts = permission.split('_');
    let current = result;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    current[parts[parts.length - 1]] = true;
  });
  
  return result;
};

/**
 * Filter menu items based on user permissions
 * @param {Array} menuItems - Array of menu items
 * @param {Object} userPermissions - User's permissions object
 * @returns {Array} - Filtered menu items
 */
const filterMenuByPermissions = (menuItems, userPermissions) => {
  const flattenedPermissions = flattenPermissions(userPermissions);
  console.log(`Flattened permissions: ${JSON.stringify(flattenedPermissions)}`);
  
  return menuItems.filter(item => {
    // Check if item has required permission
    if (item.requiredPermission && !flattenedPermissions.includes(item.requiredPermission)) {
      console.log(`Filtering out menu item "${item.name}" because user lacks required permission: ${item.requiredPermission}`);
      return false;
    }
    
    // Check if item should be hidden (hidden_subcategory_X)
    if (flattenedPermissions.includes(`hidden_subcategory_${item.code}`)) {
      console.log(`Filtering out menu item "${item.name}" because it's marked as hidden: hidden_subcategory_${item.code}`);
      return false;
    }
    
    // Recursively filter children
    if (item.children && item.children.length > 0) {
      console.log(`Filtering children of menu item "${item.name}"`);
      const filteredChildren = filterMenuByPermissions(item.children, userPermissions);
      item.children = filteredChildren;
      
      // If all children are filtered out and this is a category, hide the category
      if (filteredChildren.length === 0 && item.type === 'category') {
        console.log(`Filtering out category "${item.name}" because all its children were filtered out`);
        return false;
      }
    }
    
    console.log(`Keeping menu item "${item.name}" with permission: ${item.requiredPermission}`);
    return true;
  });
};

module.exports = {
  flattenPermissions,
  hasPermission,
  unflattenPermissions,
  filterMenuByPermissions
}; 