/**
 * Kontroler pre priame operácie s databázou mimo Mongoose modelov
 */
const directDbSync = require('../utils/directDbSync');

/**
 * Uloženie workflow fáz priamo do MongoDB
 */
exports.saveWorkflowPhases = async (req, res) => {
  try {
    console.log('Saving workflow phases directly to MongoDB');
    const { phases } = req.body;
    
    if (!phases || !Array.isArray(phases)) {
      return res.status(400).json({
        success: false,
        message: 'No valid phases provided'
      });
    }
    
    console.log(`Processing ${phases.length} workflow phases`);
    
    // Použitie utility na priamu aktualizáciu
    const result = await directDbSync.updateWorkflowPhases(phases);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
        result: result.result
      });
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error saving workflow phases:', error);
    return res.status(500).json({
      success: false,
      message: 'Error saving workflow phases',
      error: error.message
    });
  }
};

/**
 * Získanie workflow fáz priamo z MongoDB
 */
exports.getWorkflowPhases = async (req, res) => {
  try {
    console.log('Getting workflow phases directly from MongoDB');
    
    // Použitie utility na priame získanie
    const phases = await directDbSync.getWorkflowPhases();
    
    return res.status(200).json({
      success: true,
      phases
    });
  } catch (error) {
    console.error('Error getting workflow phases:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting workflow phases',
      error: error.message
    });
  }
};

/**
 * Aktualizácia zakazky permission template
 */
exports.updateZakazkyPermissionTemplate = async (req, res) => {
  try {
    console.log('Updating zakazky permission template in MongoDB');
    
    // Použitie utility na aktualizáciu
    const result = await directDbSync.updateZakazkyPermissionTemplate();
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
        result: result.result
      });
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error updating zakazky permission template:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating zakazky permission template',
      error: error.message
    });
  }
};

/**
 * Vytvorenie alebo aktualizácia hlavnej menu kategórie pre Workflow
 */
exports.createWorkflowMainCategory = async (req, res) => {
  try {
    console.log('Vytváram hlavnú kategóriu pre Workflow v menu');
    
    // Použitie utility na vytvorenie kategórie
    const result = await directDbSync.createWorkflowMainCategory();
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
        result: result.result
      });
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Chyba pri vytváraní workflow kategórie:', error);
    return res.status(500).json({
      success: false,
      message: 'Chyba pri vytváraní workflow kategórie',
      error: error.message
    });
  }
};

/**
 * Oprava cesty pre cenovú ponuku v menu
 */
exports.fixCenovaPonukyPath = async (req, res) => {
  try {
    console.log('Opravujem cestu pre cenovú ponuku v menu');
    
    // Použitie utility na opravu cesty
    const result = await directDbSync.fixCenovaPonukyPath();
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
        result: result.result
      });
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Chyba pri oprave cesty cenovej ponuky:', error);
    return res.status(500).json({
      success: false,
      message: 'Chyba pri oprave cesty cenovej ponuky',
      error: error.message
    });
  }
}; 