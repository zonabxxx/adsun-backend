// Importy modulov
const userController = require('./admin/userController');
const roleController = require('./admin/roleController');
const permissionController = require('./admin/permissionController');
const settingsController = require('./admin/settingsController');

// Exportovanie funkcií pre správu používateľov
exports.getUsers = userController.getUsers;
exports.getUserById = userController.getUserById;
exports.createUser = userController.createUser;
exports.updateUser = userController.updateUser;
exports.updateUserStatus = userController.updateUserStatus;
exports.deleteUser = userController.deleteUser;
exports.updateUserPermissions = userController.updateUserPermissions;

// Exportovanie funkcií pre správu rolí
exports.getRoles = roleController.getRoles;
exports.getRoleById = roleController.getRoleById;
exports.createRole = roleController.createRole;
exports.updateRole = roleController.updateRole;
exports.deleteRole = roleController.deleteRole;
exports.updateRolePermissions = roleController.updateRolePermissions;

// Exportovanie funkcií pre správu oprávnení
exports.getPermissions = permissionController.getPermissions;
exports.getPermissionTemplates = permissionController.getPermissionTemplates;

// Exportovanie funkcií pre správu nastavení
exports.getSystemSettings = settingsController.getSystemSettings;
exports.updateSystemSettings = settingsController.updateSystemSettings;

// Export pomocných funkcií
exports.utils = require('./admin/utils'); 