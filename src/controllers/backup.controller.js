const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const tar = require('tar');
const { promisify } = require('util');
const { exec } = require('child_process');
const execPromise = promisify(exec);
const logger = require('../utils/logger');

// Zistí veľkosť priečinka
async function getDirSize(directory) {
  try {
    const { stdout } = await execPromise(`du -sk "${directory}" | cut -f1`);
    return parseInt(stdout.trim()) * 1024; // konverzia z KB na B
  } catch (err) {
    logger.error(`Chyba pri zisťovaní veľkosti priečinka: ${err}`);
    return 0;
  }
}

// Vytvorenie cieľového adresára, ak neexistuje
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

const BACKUP_DIR = path.join(__dirname, '../../../backup');
ensureDirectoryExists(BACKUP_DIR);

// Získať zoznam všetkých záloh
exports.getAllBackups = async (req, res) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const backups = [];

    for (const file of files) {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);

      if (stats.isFile()) {
        backups.push({
          name: file,
          size: stats.size,
          created: stats.birthtime,
          type: path.extname(file).slice(1).toUpperCase(),
          path: filePath
        });
      }
    }

    // Zoradiť podľa dátumu vytvorenia (od najnovšieho)
    backups.sort((a, b) => b.created - a.created);

    res.status(200).json({
      success: true,
      backups
    });
  } catch (error) {
    logger.error(`Chyba pri získavaní záloh: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Chyba pri získavaní záloh',
      error: error.message
    });
  }
};

// Vytvorenie zálohy
exports.createBackup = async (req, res) => {
  const { type = 'zip', includeNodeModules = false, includeDatabase = true } = req.body;
  
  if (!['zip', 'tar.gz'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Neplatný formát zálohy. Podporované formáty: zip, tar.gz'
    });
  }

  try {
    // Vytvorenie názvu súboru s aktuálnym dátumom a časom
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const fileName = `backup_${timestamp}.${type}`;
    const filePath = path.join(BACKUP_DIR, fileName);

    // Cesty k adresárom, ktoré sa majú zálohovať
    const rootDir = path.join(__dirname, '../../..');
    const frontendDir = path.join(rootDir, 'frontend');
    const backendDir = path.join(rootDir, 'backend');

    // Adresáre, ktoré sa majú vylúčiť
    const excludeDirs = [];
    if (!includeNodeModules) {
      excludeDirs.push('node_modules');
    }

    let archiveSize = 0;

    if (type === 'zip') {
      // Vytvorenie ZIP archívu
      const output = fs.createWriteStream(filePath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximálna úroveň kompresie
      });

      archive.pipe(output);

      // Pridanie backend a frontend adresárov
      archive.directory(backendDir, 'backend', (entry) => {
        if (excludeDirs.some(dir => entry.name.includes(dir))) {
          return false;
        }
        return entry;
      });

      archive.directory(frontendDir, 'frontend', (entry) => {
        if (excludeDirs.some(dir => entry.name.includes(dir))) {
          return false;
        }
        return entry;
      });

      // Finalizácia archívu
      await archive.finalize();
      
      // Získanie veľkosti archívu
      const stats = fs.statSync(filePath);
      archiveSize = stats.size;
    } else if (type === 'tar.gz') {
      // Vytvorenie TAR.GZ archívu
      await tar.c(
        {
          gzip: true,
          file: filePath,
          cwd: rootDir,
          filter: (path) => {
            return !excludeDirs.some(dir => path.includes(dir));
          }
        },
        ['backend', 'frontend']
      );
      
      // Získanie veľkosti archívu
      const stats = fs.statSync(filePath);
      archiveSize = stats.size;
    }

    res.status(200).json({
      success: true,
      backup: {
        name: fileName,
        size: archiveSize,
        created: new Date(),
        type: type.toUpperCase(),
        path: filePath
      },
      message: 'Záloha bola úspešne vytvorená'
    });
  } catch (error) {
    logger.error(`Chyba pri vytváraní zálohy: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Chyba pri vytváraní zálohy',
      error: error.message
    });
  }
};

// Stiahnutie zálohy
exports.downloadBackup = async (req, res) => {
  const { fileName } = req.params;
  
  if (!fileName) {
    return res.status(400).json({
      success: false,
      message: 'Chýba názov súboru'
    });
  }

  try {
    const filePath = path.join(BACKUP_DIR, fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Záloha nebola nájdená'
      });
    }

    res.download(filePath);
  } catch (error) {
    logger.error(`Chyba pri sťahovaní zálohy: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Chyba pri sťahovaní zálohy',
      error: error.message
    });
  }
};

// Odstránenie zálohy
exports.deleteBackup = async (req, res) => {
  const { fileName } = req.params;
  
  if (!fileName) {
    return res.status(400).json({
      success: false,
      message: 'Chýba názov súboru'
    });
  }

  try {
    const filePath = path.join(BACKUP_DIR, fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Záloha nebola nájdená'
      });
    }

    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'Záloha bola úspešne odstránená'
    });
  } catch (error) {
    logger.error(`Chyba pri odstraňovaní zálohy: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Chyba pri odstraňovaní zálohy',
      error: error.message
    });
  }
}; 