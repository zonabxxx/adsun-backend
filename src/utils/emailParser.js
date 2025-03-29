/**
 * Nástroje pre analýzu a spracovanie emailov
 * @module emailParser
 */

// Importy potrebných knižníc
const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Regex vzory pre detekovanie údajov
 */
const PATTERNS = {
  EMAIL: /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
  PHONE: /(\+?[0-9]{3}[ ]?[0-9]{2,3}[ ]?[0-9]{2,3}[ ]?[0-9]{2,3}|\+?[0-9]{10,12})/g,
  NAME: /Meno[:]?\s+([A-Z][a-z]+\s+[A-Z][a-záčďéíľňóšťúýžÁČĎÉÍĽŇÓŠŤÚÝŽ]+|[A-Z][a-záčďéíľňóšťúýžÁČĎÉÍĽŇÓŠŤÚÝŽ]+\s+[A-Z][a-z]+)/i,
  COMPANY: /(s\.r\.o\.|a\.s\.|k\.s\.|spol\. s r\.o\.|s\. r\. o\.)/i,
  ICO: /[Ii][Čč][Oo][:]?\s*([0-9]{8})/,
  DIC: /[Dd][Ii][Čč][:]?\s*([0-9]{10})/,
  IC_DPH: /[Ii][Čč]\s*[Dd][Pp][Hh][:]?\s*(SK[0-9]{10})/,
  ADDRESS: /(?:[Uu]lica|[Aa]dresa)[:]?\s+([^\n,]+,[^\n]+)/
};

/**
 * Kontroluje, či má email dostatočnú kvalitu pre automatické spracovanie
 * @param {string} emailText - text emailu
 * @returns {boolean} - true ak má dostatočnú kvalitu
 */
const hasQualityContent = (emailText) => {
  // Minimálna dĺžka pre automatické spracovanie
  if (!emailText || emailText.length < 50) return false;
  
  // Počet riadkov v emaili
  const lines = emailText.split('\n').filter(line => line.trim().length > 0);
  if (lines.length < 3) return false;
  
  return true;
};

/**
 * Extrahuje emailovú adresu z textu
 * @param {string} text - text z ktorého extrahujeme email
 * @returns {string|null} - nájdený email alebo null
 */
const extractEmail = (text) => {
  if (!text) return null;
  
  const matches = text.match(PATTERNS.EMAIL);
  if (matches && matches.length > 0) {
    return matches[0].toLowerCase();
  }
  
  return null;
};

/**
 * Extrahuje telefónne číslo z textu
 * @param {string} text - text z ktorého extrahujeme telefón
 * @returns {string|null} - nájdené telefónne číslo alebo null
 */
const extractPhone = (text) => {
  if (!text) return null;
  
  const matches = text.match(PATTERNS.PHONE);
  if (matches && matches.length > 0) {
    // Odstránime medzery a formátujeme číslo
    return matches[0].replace(/\s+/g, '');
  }
  
  return null;
};

/**
 * Extrahuje meno z textu
 * @param {string} text - text z ktorého extrahujeme meno
 * @returns {string|null} - nájdené meno alebo null
 */
const extractName = (text) => {
  if (!text) return null;
  
  // Najprv hľadáme explicitné meno
  const nameMatch = text.match(PATTERNS.NAME);
  if (nameMatch && nameMatch[1]) {
    return nameMatch[1].trim();
  }
  
  // Ak nie je explicitné meno, skúsime extrahovať z podpisu
  const lines = text.split('\n');
  const signatureIdx = lines.findIndex(line => line.includes('pozdravom') || line.includes('Regards'));
  
  if (signatureIdx !== -1 && signatureIdx < lines.length - 1) {
    // Predpokladáme, že meno je na ďalšom riadku po pozdrave
    const potentialName = lines[signatureIdx + 1].trim();
    if (potentialName && potentialName.length > 3 && !potentialName.includes('@')) {
      return potentialName;
    }
  }
  
  return null;
};

/**
 * Extrahuje názov firmy z textu
 * @param {string} text - text z ktorého extrahujeme názov firmy
 * @param {string|null} senderEmail - email odosielateľa pre doplnkovú detekciu
 * @returns {string|null} - nájdený názov firmy alebo null
 */
const extractCompanyName = (text, senderEmail = null) => {
  if (!text) return null;
  
  // Hľadáme pravdepodobný názov firmy v texte
  const lines = text.split('\n');
  
  // Hľadáme riadok, ktorý obsahuje typické firemné označenia
  const companyLineIdx = lines.findIndex(line => PATTERNS.COMPANY.test(line));
  if (companyLineIdx !== -1) {
    return lines[companyLineIdx].trim();
  }
  
  // Hľadáme riadok, ktorý obsahuje IČO, pred ktorým býva zvyčajne názov firmy
  const icoLineIdx = lines.findIndex(line => PATTERNS.ICO.test(line));
  if (icoLineIdx !== -1 && icoLineIdx > 0) {
    const potentialCompanyLine = lines[icoLineIdx - 1].trim();
    if (potentialCompanyLine.length > 3 && !PATTERNS.EMAIL.test(potentialCompanyLine)) {
      return potentialCompanyLine;
    }
  }
  
  // Ak máme k dispozícii email odosielateľa, extrahujeme doménu
  if (senderEmail) {
    const domain = senderEmail.split('@')[1];
    if (domain) {
      // Odstránime TLD a vrátime názov domény ako potenciálny názov firmy
      return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
    }
  }
  
  return null;
};

/**
 * Extrahuje IČO z textu
 * @param {string} text - text z ktorého extrahujeme IČO
 * @returns {string|null} - nájdené IČO alebo null
 */
const extractICO = (text) => {
  if (!text) return null;
  
  const matches = text.match(PATTERNS.ICO);
  if (matches && matches[1]) {
    return matches[1].trim();
  }
  
  return null;
};

/**
 * Extrahuje DIČ z textu
 * @param {string} text - text z ktorého extrahujeme DIČ
 * @returns {string|null} - nájdené DIČ alebo null
 */
const extractDIC = (text) => {
  if (!text) return null;
  
  const matches = text.match(PATTERNS.DIC);
  if (matches && matches[1]) {
    return matches[1].trim();
  }
  
  return null;
};

/**
 * Extrahuje IČ DPH z textu
 * @param {string} text - text z ktorého extrahujeme IČ DPH
 * @returns {string|null} - nájdené IČ DPH alebo null
 */
const extractICDPH = (text) => {
  if (!text) return null;
  
  const matches = text.match(PATTERNS.IC_DPH);
  if (matches && matches[1]) {
    return matches[1].trim();
  }
  
  return null;
};

/**
 * Extrahuje adresu z textu
 * @param {string} text - text z ktorého extrahujeme adresu
 * @returns {string|null} - nájdená adresa alebo null
 */
const extractAddress = (text) => {
  if (!text) return null;
  
  const matches = text.match(PATTERNS.ADDRESS);
  if (matches && matches[1]) {
    return matches[1].trim();
  }
  
  return null;
};

/**
 * Analyzuje text emailu a získa údaje o klientovi
 * @param {Object} email - objekt emailu
 * @returns {Object} - extrahované údaje o klientovi
 */
const extractClientInfo = (email) => {
  if (!email || !email.body) {
    return { success: false, message: 'Chýbajúci obsah emailu' };
  }
  
  const text = email.body;
  
  // Základná kontrola kvality obsahu
  if (!hasQualityContent(text)) {
    return { 
      success: false, 
      message: 'Obsah emailu neobsahuje dostatok informácií pre automatické spracovanie',
      partialData: {
        email: email.sender,
        name: email.sender.split('@')[0]
      }
    };
  }
  
  // Extrakcia údajov
  const extractedData = {
    email: email.sender,
    name: extractName(text) || email.sender.split('@')[0],
    phone: extractPhone(text),
    company: extractCompanyName(text, email.sender),
    ico: extractICO(text),
    dic: extractDIC(text),
    icdph: extractICDPH(text),
    address: extractAddress(text)
  };
  
  // Vyhodnotenie úspechu extrakcie
  const requiredFields = ['email', 'name'];
  const missingFields = requiredFields.filter(field => !extractedData[field]);
  
  if (missingFields.length > 0) {
    return {
      success: false,
      message: `Chýbajú povinné údaje: ${missingFields.join(', ')}`,
      partialData: extractedData
    };
  }
  
  return {
    success: true,
    message: 'Údaje o klientovi boli úspešne extrahované',
    data: extractedData
  };
};

/**
 * Vyhľadá klienta v databáze podľa emailu
 * @param {string} email - email klienta
 * @returns {Promise<Object|null>} - nájdený klient alebo null
 */
const findClientByEmail = async (email) => {
  try {
    // Predpokladáme, že máme model klienta dostupný cez mongoose
    // V skutočnom kóde by ste importovali váš model klienta
    const Client = mongoose.model('Client');
    
    return await Client.findOne({ email: email.toLowerCase() }).lean();
  } catch (error) {
    logger.error('Chyba pri hľadaní klienta podľa emailu:', error);
    return null;
  }
};

/**
 * Vyhľadá klienta v databáze podľa IČO
 * @param {string} ico - IČO klienta
 * @returns {Promise<Object|null>} - nájdený klient alebo null
 */
const findClientByICO = async (ico) => {
  try {
    if (!ico) return null;
    
    const Client = mongoose.model('Client');
    return await Client.findOne({ ico: ico }).lean();
  } catch (error) {
    logger.error('Chyba pri hľadaní klienta podľa IČO:', error);
    return null;
  }
};

/**
 * Kompletné spracovanie emailu pre automatickú detekciu klienta
 * @param {Object} email - objekt emailu
 * @returns {Promise<Object>} - výsledok spracovania emailu
 */
const processEmailForClientDetection = async (email) => {
  try {
    // Extrakcia údajov z emailu
    const extractionResult = extractClientInfo(email);
    
    if (!extractionResult.success) {
      return extractionResult;
    }
    
    const clientData = extractionResult.data;
    
    // Vyhľadanie klienta podľa emailu
    let existingClient = await findClientByEmail(clientData.email);
    
    // Ak nenájdeme podľa emailu a máme IČO, skúsime hľadať podľa IČO
    if (!existingClient && clientData.ico) {
      existingClient = await findClientByICO(clientData.ico);
    }
    
    if (existingClient) {
      return {
        success: true,
        message: 'Klient bol nájdený v databáze',
        isExisting: true,
        client: existingClient,
        extractedData: clientData
      };
    }
    
    return {
      success: true,
      message: 'Klient nebol nájdený v databáze, môžete vytvoriť nový záznam',
      isExisting: false,
      extractedData: clientData,
      suggestedClient: {
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        company: clientData.company,
        ico: clientData.ico,
        dic: clientData.dic,
        icdph: clientData.icdph,
        address: clientData.address
      }
    };
  } catch (error) {
    logger.error('Chyba pri spracovaní emailu pre detekciu klienta:', error);
    return {
      success: false,
      message: 'Chyba pri spracovaní emailu: ' + error.message
    };
  }
};

module.exports = {
  extractClientInfo,
  findClientByEmail,
  findClientByICO,
  processEmailForClientDetection,
  extractEmail,
  extractPhone,
  extractName,
  extractCompanyName,
  extractICO,
  extractDIC,
  extractICDPH,
  extractAddress
}; 