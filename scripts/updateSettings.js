const mongoose = require('mongoose');
const config = require('../src/config/config');

// Pripojenie k MongoDB
mongoose.connect(config.db.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Doplňujúce údaje pre všetky sekcie
const updateData = {
  company: {
    name: 'ADsun, s.r.o.',
    logo: '/assets/images/logo.png',
    address: 'Hlavná 123, 945 01 Komárno',
    ico: '12345678',
    dic: '1234567890',
    icdph: 'SK1234567890',
    email: 'info@adsun.sk',
    phone: '+421 123 456 789',
    web: 'www.adsun.sk',
    bankAccount: 'SK1234567890123456789012',
    swift: 'TATRSKBX',
    signature: '/assets/images/signature.png',
    contacts: [
      { name: 'Ján Novák', position: 'Konateľ', phone: '+421 911 222 333', email: 'jan.novak@adsun.sk' },
      { name: 'Peter Horváth', position: 'Obchodný manažér', phone: '+421 944 555 666', email: 'peter.horvath@adsun.sk' }
    ],
    bankDetails: [
      { bankName: 'Tatra Banka', accountNumber: 'SK1234567890123456789012', iban: 'SK1234567890123456789012', swift: 'TATRSKBX', currency: 'EUR' },
      { bankName: 'Slovenská sporiteľňa', accountNumber: '98765432109876543210', iban: 'SK9876543210987654321098', swift: 'SLSPSKBA', currency: 'EUR' }
    ],
    branches: [
      { name: 'Centrála Komárno', address: 'Hlavná 123, 945 01 Komárno', phone: '+421 123 456 789', email: 'komarno@adsun.sk' },
      { name: 'Pobočka Bratislava', address: 'Obchodná 45, 811 06 Bratislava', phone: '+421 987 654 321', email: 'bratislava@adsun.sk' }
    ],
    legalInfo: {
      companyRegistry: 'Okresný súd Nitra, Oddiel: Sro, Vložka č.: 12345/N',
      dateEstablished: '2010-01-01',
      legalForm: 'Spoločnosť s ručením obmedzeným'
    }
  },
  invoices: {
    prefix: 'FA',
    numberingFormat: 'YYYY/nnnn',
    defaultDueDate: 14,
    defaultCurrency: 'EUR',
    vatRate: 20,
    invoiceFooter: 'Ďakujeme za Vašu objednávku.',
    defaultTerms: 'Faktúra je splatná do dátumu splatnosti uvedeného na faktúre.',
    sendAutomatically: true,
    reminderEnabled: true,
    reminderDays: [3, 7, 14],
    templates: [
      { id: 'standard', name: 'Štandardná šablóna', isDefault: true },
      { id: 'modern', name: 'Moderná šablóna', isDefault: false },
      { id: 'minimal', name: 'Minimalistická šablóna', isDefault: false }
    ],
    emails: {
      sendCopy: true,
      bccAddresses: 'fakturacia@adsun.sk',
      defaultSubject: 'Nová faktúra #{number}',
      defaultMessage: 'Vážený zákazník,\n\nv prílohe Vám posielame faktúru #{number}.\n\nS pozdravom,\nADsun, s.r.o.'
    },
    types: [
      { id: 'regular', name: 'Bežná faktúra', prefix: 'FA', isDefault: true },
      { id: 'proforma', name: 'Zálohová faktúra', prefix: 'ZF', isDefault: false },
      { id: 'credit', name: 'Dobropis', prefix: 'DP', isDefault: false },
      { id: 'debit', name: 'Ťarchopis', prefix: 'TP', isDefault: false }
    ],
    paymentMethods: [
      { id: 'bankTransfer', name: 'Bankový prevod', isDefault: true },
      { id: 'cash', name: 'Hotovosť', isDefault: false },
      { id: 'card', name: 'Platobná karta', isDefault: false },
      { id: 'paypal', name: 'PayPal', isDefault: false }
    ],
    deliveryMethods: [
      { id: 'email', name: 'Email', isDefault: true },
      { id: 'post', name: 'Poštou', isDefault: false },
      { id: 'personal', name: 'Osobne', isDefault: false }
    ],
    reminderSettings: {
      firstReminder: { days: 3, subject: 'Pripomienka faktúry #{number}', message: 'Dovoľujeme si Vám pripomenúť, že faktúra #{number} bude čoskoro splatná.' },
      secondReminder: { days: 7, subject: 'Druhá pripomienka faktúry #{number}', message: 'Upozorňujeme Vás, že faktúra #{number} je po splatnosti.' },
      thirdReminder: { days: 14, subject: 'Tretia pripomienka faktúry #{number}', message: 'Žiadame Vás o urýchlenú úhradu faktúry #{number}, ktorá je vážne po splatnosti.' }
    }
  },
  orders: {
    prefix: 'OBJ',
    numberingFormat: 'YYYY/nnnn',
    defaultProcessingTime: 3,
    automaticConfirmation: true,
    statusOptions: [
      'Nová',
      'Potvrdená',
      'V procese',
      'Dokončená',
      'Zrušená'
    ],
    notifyOnStatusChange: true,
    statuses: [
      { id: 'new', name: 'Nová', color: '#17a2b8', isDefault: true },
      { id: 'confirmed', name: 'Potvrdená', color: '#28a745', isDefault: false },
      { id: 'inProcess', name: 'V procese', color: '#fd7e14', isDefault: false },
      { id: 'completed', name: 'Dokončená', color: '#007bff', isDefault: false },
      { id: 'cancelled', name: 'Zrušená', color: '#dc3545', isDefault: false }
    ],
    defaultValues: {
      paymentMethod: 'bankTransfer',
      deliveryMethod: 'courier',
      currency: 'EUR',
      vatRate: 20
    },
    notifications: {
      emailCustomer: true,
      emailAdmin: true,
      smsCustomer: false,
      smsAdmin: false
    }
  },
  documents: {
    primaryColor: '#0066cc',
    secondaryColor: '#f8f9fa',
    fontFamily: 'Arial',
    logoPosition: 'top-left',
    headerText: 'ADsun, s.r.o.',
    footerText: 'www.adsun.sk | info@adsun.sk | +421 123 456 789',
    showContactInFooter: true,
    documentTypes: [
      { id: 1, name: 'Faktúra', category: 'Finančné', requiredFields: ['číslo', 'dátum', 'suma'] },
      { id: 2, name: 'Dodací list', category: 'Logistika', requiredFields: ['číslo', 'položky', 'množstvo'] },
      { id: 3, name: 'Zmluva', category: 'Právne', requiredFields: ['zmluvné strany', 'predmet', 'podmienky'] }
    ],
    documentTemplates: [
      {
        id: 1,
        name: 'Štandardná faktúra',
        type: 'invoice',
        isDefault: true,
        content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .company-info { width: 50%; }
    .invoice-info { width: 40%; text-align: right; }
    .invoice-items { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .invoice-items th, .invoice-items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    .invoice-items th { background-color: #f2f2f2; }
    .invoice-total { text-align: right; margin-top: 20px; }
    .footer { margin-top: 50px; text-align: center; font-size: 0.9em; color: #777; }
  </style>
</head>
<body>
  <div class="invoice-header">
    <div class="company-info">
      <h2>[[Názov spoločnosti]]</h2>
      <p>[[Adresa spoločnosti]]<br>
      IČO: [[IČO]]<br>
      DIČ: [[DIČ]]</p>
    </div>
    <div class="invoice-info">
      <h1>FAKTÚRA č. [[Číslo faktúry]]</h1>
      <p>Dátum vystavenia: [[Dátum vystavenia]]<br>
      Dátum splatnosti: [[Dátum splatnosti]]<br>
      Variabilný symbol: [[VS]]</p>
    </div>
  </div>
  
  <div class="client-info">
    <h3>Odberateľ:</h3>
    <p>[[Názov odberateľa]]<br>
    [[Adresa odberateľa]]<br>
    IČO: [[IČO odberateľa]]<br>
    DIČ: [[DIČ odberateľa]]</p>
  </div>
  
  <table class="invoice-items">
    <thead>
      <tr>
        <th>P.č.</th>
        <th>Popis položky</th>
        <th>Množstvo</th>
        <th>MJ</th>
        <th>Cena za MJ</th>
        <th>Celkom bez DPH</th>
        <th>DPH</th>
        <th>Celkom s DPH</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>[[Názov položky]]</td>
        <td>[[Množstvo]]</td>
        <td>[[MJ]]</td>
        <td>[[Cena za MJ]]</td>
        <td>[[Cena bez DPH]]</td>
        <td>[[DPH]]</td>
        <td>[[Cena s DPH]]</td>
      </tr>
    </tbody>
  </table>
  
  <div class="invoice-total">
    <p><strong>Celkom bez DPH:</strong> [[Celkom bez DPH]]</p>
    <p><strong>DPH:</strong> [[Celkom DPH]]</p>
    <p><strong>Celkom na úhradu:</strong> [[Celkom s DPH]]</p>
  </div>
  
  <div class="payment-info">
    <h3>Platobné údaje:</h3>
    <p>IBAN: [[IBAN]]<br>
    SWIFT: [[SWIFT]]<br>
    Banka: [[Názov banky]]</p>
  </div>
  
  <div class="footer">
    <p>Faktúra bola vystavená elektronicky a je platná bez pečiatky a podpisu.</p>
    <p>[[Názov spoločnosti]] | [[Webstránka]] | [[Email]] | [[Telefón]]</p>
  </div>
</body>
</html>`
      },
      {
        id: 2,
        name: 'Štandardný dodací list',
        type: 'delivery_note',
        isDefault: true,
        content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .company-info { width: 50%; }
    .document-info { width: 40%; text-align: right; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    .items-table th { background-color: #f2f2f2; }
    .signatures { display: flex; justify-content: space-between; margin-top: 100px; }
    .signature-box { width: 45%; text-align: center; }
    .signature-line { margin-top: 50px; border-top: 1px solid #000; padding-top: 5px; }
    .footer { margin-top: 50px; text-align: center; font-size: 0.9em; color: #777; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <h2>[[Názov spoločnosti]]</h2>
      <p>[[Adresa spoločnosti]]<br>
      IČO: [[IČO]]<br>
      DIČ: [[DIČ]]</p>
    </div>
    <div class="document-info">
      <h1>DODACÍ LIST č. [[Číslo dodacieho listu]]</h1>
      <p>Dátum: [[Dátum vystavenia]]<br>
      K faktúre č.: [[Číslo faktúry]]</p>
    </div>
  </div>
  
  <div class="client-info">
    <h3>Odberateľ:</h3>
    <p>[[Názov odberateľa]]<br>
    [[Adresa odberateľa]]<br>
    IČO: [[IČO odberateľa]]<br>
    DIČ: [[DIČ odberateľa]]</p>
  </div>
  
  <table class="items-table">
    <thead>
      <tr>
        <th>P.č.</th>
        <th>Popis položky</th>
        <th>Množstvo</th>
        <th>MJ</th>
        <th>Poznámka</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>[[Názov položky]]</td>
        <td>[[Množstvo]]</td>
        <td>[[MJ]]</td>
        <td>[[Poznámka]]</td>
      </tr>
    </tbody>
  </table>
  
  <div class="note">
    <h3>Poznámka:</h3>
    <p>[[Poznámka k dodaciemu listu]]</p>
  </div>
  
  <div class="signatures">
    <div class="signature-box">
      <div class="signature-line">Odovzdal (meno a podpis)</div>
    </div>
    <div class="signature-box">
      <div class="signature-line">Prevzal (meno a podpis)</div>
    </div>
  </div>
  
  <div class="footer">
    <p>[[Názov spoločnosti]] | [[Webstránka]] | [[Email]] | [[Telefón]]</p>
  </div>
</body>
</html>`
      },
      {
        id: 3,
        name: 'Štandardná zmluva',
        type: 'contract',
        isDefault: true,
        content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Times New Roman, serif; margin: 0; padding: 20px; line-height: 1.5; }
    .header { text-align: center; margin-bottom: 30px; }
    .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center; }
    .section { margin-bottom: 20px; }
    .section-title { font-weight: bold; margin-bottom: 10px; }
    .footer { margin-top: 50px; }
    .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
    .signature-box { width: 45%; }
    .signature-line { margin-top: 50px; border-top: 1px solid #000; padding-top: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">ZMLUVA O DIELO</h1>
    <p>uzatvorená podľa § 536 a nasl. Obchodného zákonníka č. 513/1991 Zb. v znení neskorších predpisov</p>
  </div>
  
  <div class="section">
    <div class="section-title">I. Zmluvné strany</div>
    <p><strong>Zhotoviteľ:</strong><br>
    [[Názov spoločnosti zhotoviteľa]]<br>
    Sídlo: [[Adresa zhotoviteľa]]<br>
    IČO: [[IČO zhotoviteľa]]<br>
    DIČ: [[DIČ zhotoviteľa]]<br>
    IČ DPH: [[IČ DPH zhotoviteľa]]<br>
    Zastúpený: [[Meno zástupcu zhotoviteľa]]<br>
    Bankové spojenie: [[Banka zhotoviteľa]]<br>
    IBAN: [[IBAN zhotoviteľa]]</p>
    
    <p><strong>Objednávateľ:</strong><br>
    [[Názov spoločnosti objednávateľa]]<br>
    Sídlo: [[Adresa objednávateľa]]<br>
    IČO: [[IČO objednávateľa]]<br>
    DIČ: [[DIČ objednávateľa]]<br>
    IČ DPH: [[IČ DPH objednávateľa]]<br>
    Zastúpený: [[Meno zástupcu objednávateľa]]<br>
    Bankové spojenie: [[Banka objednávateľa]]<br>
    IBAN: [[IBAN objednávateľa]]</p>
  </div>
  
  <div class="section">
    <div class="section-title">II. Predmet zmluvy</div>
    <p>[[Podrobný popis predmetu zmluvy]]</p>
  </div>
  
  <div class="section">
    <div class="section-title">III. Cena a platobné podmienky</div>
    <p>Cena za dielo: [[Cena]] EUR bez DPH</p>
    <p>DPH 20%: [[DPH suma]] EUR</p>
    <p>Celková cena s DPH: [[Cena s DPH]] EUR</p>
    <p>Platobné podmienky: [[Platobné podmienky]]</p>
  </div>
  
  <div class="section">
    <div class="section-title">IV. Termín plnenia</div>
    <p>[[Termín plnenia]]</p>
  </div>
  
  <div class="section">
    <div class="section-title">V. Záverečné ustanovenia</div>
    <p>Táto zmluva nadobúda platnosť a účinnosť dňom jej podpísania oboma zmluvnými stranami.</p>
    <p>Zmluva je vyhotovená v dvoch exemplároch, z ktorých každá strana obdrží jeden.</p>
    <p>Zmluvné strany prehlasujú, že si zmluvu prečítali, jej obsahu porozumeli a na znak súhlasu ju podpisujú.</p>
  </div>
  
  <div class="signatures">
    <div class="signature-box">
      <p>V [[Mesto zhotoviteľa]], dňa [[Dátum podpisu]]</p>
      <div class="signature-line">Za zhotoviteľa</div>
    </div>
    <div class="signature-box">
      <p>V [[Mesto objednávateľa]], dňa [[Dátum podpisu]]</p>
      <div class="signature-line">Za objednávateľa</div>
    </div>
  </div>
</body>
</html>`
      }
    ],
    enableESignatures: false,
    requireSignatureVerification: false,
    signatureMethod: 'drawn',
    verificationExpiration: 24,
    allowMultipleSigners: false
  },
  finances: {
    currencies: ['EUR', 'CZK', 'USD'],
    defaultPaymentMethod: 'bankTransfer',
    paymentMethods: [
      { id: 'cash', name: 'Hotovosť', enabled: true, isDefault: false },
      { id: 'bankTransfer', name: 'Bankový prevod', enabled: true, isDefault: true },
      { id: 'card', name: 'Platobná karta', enabled: true, isDefault: false },
      { id: 'paypal', name: 'PayPal', enabled: false, isDefault: false }
    ],
    reportingPeriod: 'monthly',
    defaultTaxSettings: {
      vatPayer: true,
      vatRate: 20
    },
    taxes: [
      { id: 'vat', name: 'DPH', rate: 20, isDefault: true },
      { id: 'vat-reduced', name: 'Znížená DPH', rate: 10, isDefault: false },
      { id: 'no-vat', name: 'Bez DPH', rate: 0, isDefault: false }
    ],
    currencySettings: [
      { code: 'EUR', symbol: '€', position: 'after', decimalPlaces: 2 },
      { code: 'CZK', symbol: 'Kč', position: 'after', decimalPlaces: 0 },
      { code: 'USD', symbol: '$', position: 'before', decimalPlaces: 2 }
    ]
  },
  workflow: {
    defaultStageId: 'stage-1',
    allowBackTransitions: true,
    requiredApproval: false,
    notifyOnTransition: true,
    stageCategories: [
      { name: 'Obchodné', color: '#17a2b8', icon: 'shopping-cart' },
      { name: 'Výrobné', color: '#28a745', icon: 'industry' },
      { name: 'Expedičné', color: '#fd7e14', icon: 'truck' },
      { name: 'Finančné', color: '#dc3545', icon: 'euro-sign' }
    ],
    stages: [
      { id: 'stage-1', name: 'Cenová ponuka', color: '#17a2b8', category: 'Obchodné', order: 1 },
      { id: 'stage-2', name: 'Objednávka', color: '#28a745', category: 'Obchodné', order: 2 },
      { id: 'stage-3', name: 'Výroba', color: '#fd7e14', category: 'Výrobné', order: 3 },
      { id: 'stage-4', name: 'Expedícia', color: '#007bff', category: 'Expedičné', order: 4 },
      { id: 'stage-5', name: 'Fakturácia', color: '#dc3545', category: 'Finančné', order: 5 }
    ],
    transitions: [
      { from: 'stage-1', to: 'stage-2', name: 'Objednať', requiresApproval: false },
      { from: 'stage-2', to: 'stage-3', name: 'Začať výrobu', requiresApproval: true },
      { from: 'stage-3', to: 'stage-4', name: 'Odoslať', requiresApproval: false },
      { from: 'stage-4', to: 'stage-5', name: 'Fakturovať', requiresApproval: false }
    ]
  },
  products: {
    categories: [
      {
        id: 'largeFormat',
        name: 'Veľkoformátová tlač',
        icon: 'print',
        subcategories: [
          { id: 'banners', name: 'Bannery' },
          { id: 'billboards', name: 'Billboardy' },
          { id: 'posters', name: 'Plagáty' }
        ]
      },
      {
        id: 'smallFormat',
        name: 'Maloformátová tlač',
        icon: 'file',
        subcategories: [
          { id: 'businessCards', name: 'Vizitky' },
          { id: 'flyers', name: 'Letáky' },
          { id: 'brochures', name: 'Brožúry' }
        ]
      },
      {
        id: 'promotional',
        name: 'Reklamné predmety',
        icon: 'gift',
        subcategories: [
          { id: 'tshirts', name: 'Tričká' },
          { id: 'pens', name: 'Perá' },
          { id: 'cups', name: 'Hrnčeky' }
        ]
      }
    ],
    hierarchicalCategories: [
      {
        id: 'printing',
        name: 'Tlačové služby',
        icon: 'print',
        description: 'Všetky typy tlačových služieb',
        products: [],
        subcategories: [
          {
            id: 'large-format',
            name: 'Veľkoformátová tlač',
            icon: 'image',
            description: 'Tlač pre veľké formáty a exteriérové použitie',
            products: [],
            subcategories: [
              {
                id: 'banners',
                name: 'Bannery a plachty',
                icon: 'flag',
                description: 'Reklamné bannery a PVC plachty',
                products: []
              },
              {
                id: 'posters',
                name: 'Plagáty a bilboardy',
                icon: 'image',
                description: 'Veľkoformátové plagáty a bilboardy',
                products: []
              },
              {
                id: 'stickers',
                name: 'Nálepky a polepy',
                icon: 'sticky-note',
                description: 'Nálepky, polepy a rezaná grafika',
                products: []
              }
            ]
          },
          {
            id: 'offset',
            name: 'Ofsetová tlač',
            icon: 'print',
            description: 'Kvalitná tlač pre väčšie náklady',
            products: [],
            subcategories: [
              {
                id: 'brochures',
                name: 'Brožúry a katalógy',
                icon: 'book',
                description: 'Viazané brožúry a produktové katalógy',
                products: []
              },
              {
                id: 'flyers',
                name: 'Letáky a skladačky',
                icon: 'file',
                description: 'Reklamné letáky a skladačky',
                products: []
              }
            ]
          },
          {
            id: 'digital',
            name: 'Digitálna tlač',
            icon: 'print',
            description: 'Rýchla a kvalitná tlač v malých nákladoch',
            products: [],
            subcategories: [
              {
                id: 'business-cards',
                name: 'Vizitky',
                icon: 'address-card',
                description: 'Štandardné aj špeciálne vizitky',
                products: []
              },
              {
                id: 'documents',
                name: 'Dokumenty a formuláre',
                icon: 'file-alt',
                description: 'Firemné dokumenty a formuláre',
                products: []
              }
            ]
          }
        ]
      },
      {
        id: 'promotional',
        name: 'Reklamné predmety',
        icon: 'gift',
        description: 'Reklamné a darčekové predmety',
        products: [],
        subcategories: [
          {
            id: 'clothing',
            name: 'Oblečenie',
            icon: 'tshirt',
            description: 'Reklamné oblečenie s potlačou',
            products: [],
            subcategories: [
              {
                id: 'tshirts',
                name: 'Tričká a mikiny',
                icon: 'tshirt',
                description: 'Reklamné tričká a mikiny s potlačou',
                products: []
              },
              {
                id: 'caps',
                name: 'Čiapky a klobúky',
                icon: 'hat-wizard',
                description: 'Reklamné čiapky a klobúky s potlačou',
                products: []
              }
            ]
          },
          {
            id: 'accessories',
            name: 'Doplnky',
            icon: 'bookmark',
            description: 'Reklamné doplnky a príslušenstvo',
            products: [],
            subcategories: [
              {
                id: 'pens',
                name: 'Perá a písacie potreby',
                icon: 'pen',
                description: 'Reklamné perá a písacie potreby',
                products: []
              },
              {
                id: 'mugs',
                name: 'Hrnčeky a poháre',
                icon: 'mug-hot',
                description: 'Reklamné hrnčeky a poháre s potlačou',
                products: []
              },
              {
                id: 'bags',
                name: 'Tašky a vaky',
                icon: 'shopping-bag',
                description: 'Reklamné tašky a vaky s potlačou',
                products: []
              }
            ]
          }
        ]
      },
      {
        id: 'signage',
        name: 'Reklamné systémy',
        icon: 'sign',
        description: 'Reklamné a navigačné systémy',
        products: [],
        subcategories: [
          {
            id: 'indoor',
            name: 'Interiérové systémy',
            icon: 'building',
            description: 'Reklamné a navigačné systémy pre interiér',
            products: []
          },
          {
            id: 'outdoor',
            name: 'Exteriérové systémy',
            icon: 'street-view',
            description: 'Reklamné a navigačné systémy pre exteriér',
            products: []
          }
        ]
      }
    ],
    unitOptions: ['ks', 'm2', 'bm', 'bal'],
    attributes: [
      { id: 'material', name: 'Materiál', type: 'select', options: ['Papier', 'Plast', 'Textil', 'Kov'] },
      { id: 'weight', name: 'Gramáž', type: 'number', unit: 'g/m²' },
      { id: 'color', name: 'Farba', type: 'color' },
      { id: 'finish', name: 'Povrchová úprava', type: 'select', options: ['Matný', 'Lesklý', 'Pololesklý'] }
    ]
  },
  system: {
    appName: 'ADSUN 2.0',
    maintenanceMode: false,
    debugMode: false,
    itemsPerPage: 15,
    logLevel: 'warning',
    cacheEnabled: true,
    performance: {
      enableCaching: true,
      cacheLifetime: 3600,
      minifyAssets: true,
      compressResponses: true
    },
    logging: {
      logLevel: 'warning',
      logToFile: true,
      logToConsole: true,
      logRotation: 'daily',
      logRetention: 30
    }
  },
  security: {
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordExpiration: 90,
    requireStrongPasswords: true,
    enableTwoFactor: false,
    passwords: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecial: true,
      passwordExpireDays: 90
    },
    twoFactor: {
      enabled: false,
      method: 'app',
      issuer: 'ADsun, s.r.o.'
    },
    ipRestrictions: {
      enabled: false,
      allowedIpRanges: []
    }
  }
};

// Funkcia pre aktualizáciu nastavení
async function updateSettings() {
  try {
    console.log('Začínam aktualizáciu chýbajúcich údajov v nastaveniach...');
    
    // Získanie kolekcie
    const settingsCollection = mongoose.connection.collection('settings');
    
    // Zistíme, či už existujú nastavenia
    const existingSettings = await settingsCollection.findOne({ type: 'global' });
    
    if (!existingSettings) {
      console.log('Nenašli sa žiadne nastavenia, vytváram nové...');
      
      // Vytvorenie nových nastavení
      await settingsCollection.insertOne({
        type: 'global',
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Nastavenia boli úspešne vytvorené');
    } else {
      console.log('Aktualizujem existujúce nastavenia...');
      
      // Vytvorenie aktualizovaného objektu pri zachovaní existujúcich hodnôt
      const mergedSettings = { type: 'global' };
      
      // Pre každú sekciu
      for (const section in updateData) {
        if (section === 'products' && existingSettings.products) {
          // Pre produkty chceme byť obzvlášť opatrní, aby sme nezničili existujúce dáta
          mergedSettings.products = {
            // Najprv použijeme naše nové údaje ako základ
            ...updateData.products,
            // Potom pridáme existujúce údaje, ale nezahrnieme kategórie a hierarchicalCategories
            // pretože tie chceme nahradiť našimi kompletnými údajmi
            ...Object.fromEntries(
              Object.entries(existingSettings.products).filter(
                ([key]) => !['categories', 'hierarchicalCategories'].includes(key)
              )
            ),
            // Explicitne pridáme naše komplexné kategórie
            categories: updateData.products.categories,
            hierarchicalCategories: updateData.products.hierarchicalCategories
          };
        } else if (section === 'workflow' && existingSettings.workflow) {
          // Pre workflow chceme tiež zachovať existujúce dáta, ale pridať naše nové
          mergedSettings.workflow = {
            ...updateData.workflow,
            ...existingSettings.workflow,
            // Explicitne nastavíme naše nové stages a transitions
            stageCategories: updateData.workflow.stageCategories,
            stages: updateData.workflow.stages,
            transitions: updateData.workflow.transitions
          };
        } else if (existingSettings[section]) {
          // Pre ostatné sekcie spravíme hlboké zlúčenie
          mergedSettings[section] = deepMerge(updateData[section], existingSettings[section]);
        } else {
          // Ak sekcia neexistuje, pridáme našu novú sekciu
          mergedSettings[section] = updateData[section];
        }
      }
      
      // Aktualizácia nastavení
      await settingsCollection.updateOne(
        { type: 'global' },
        { 
          $set: {
            ...mergedSettings,
            updatedAt: new Date()
          } 
        }
      );
      
      console.log('Nastavenia boli úspešne aktualizované');
    }
    
    console.log('Aktualizácia nastavení bola úspešne dokončená');
  } catch (error) {
    console.error('Chyba pri aktualizácii nastavení:', error);
  } finally {
    // Odpojenie od MongoDB
    mongoose.disconnect();
  }
}

// Pomocná funkcia pre hlboké zlúčenie objektov
function deepMerge(target, source) {
  if (typeof target !== 'object' || typeof source !== 'object') return source;
  
  const output = { ...target };
  
  for (const key in source) {
    if (source[key] instanceof Array) {
      // Pre polia, použijeme hodnoty zo source
      output[key] = source[key];
    } else if (typeof source[key] === 'object' && source[key] !== null) {
      // Pre objekty, rekurzívne zlúčime
      output[key] = output[key] ? deepMerge(output[key], source[key]) : source[key];
    } else {
      // Pre primitívne hodnoty, použijeme hodnoty zo source
      output[key] = source[key];
    }
  }
  
  return output;
}

// Spustenie aktualizácie
updateSettings(); 