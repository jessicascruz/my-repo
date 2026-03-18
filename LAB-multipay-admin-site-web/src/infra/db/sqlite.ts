import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'multipay.db');
const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    referenceId TEXT,
    subReferenceId TEXT,
    conditionId TEXT,
    systemId INTEGER,
    adminLink TEXT,
    status TEXT,
    companyId INTEGER,
    companyDescription TEXT,
    companyCode TEXT,
    amount REAL,
    discount REAL,
    expirationTime INTEGER,
    callbackUrl TEXT,
    paymentLink TEXT,
    updatedAt TEXT,
    createdAt TEXT,
    requesterId TEXT,
    requesterName TEXT,
    requesterEmail TEXT,
    businessPartnerId TEXT,
    businessPartnerFirstName TEXT,
    businessPartnerLastName TEXT,
    businessPartnerName TEXT,
    businessPartnerEmail TEXT,
    businessPartnerDocumentType TEXT,
    businessPartnerDocumentNumber TEXT,
    businessPartnerPhoneNumber TEXT,
    businessPartnerAddress TEXT -- JSON
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    orderId TEXT,
    name TEXT,
    image TEXT,
    quantity INTEGER,
    unitPrice REAL,
    FOREIGN KEY(orderId) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    orderId TEXT,
    method TEXT,
    amount REAL,
    status TEXT,
    createdAt TEXT,
    updatedAt TEXT,
    authorizedAt TEXT,
    approvedAt TEXT,
    internalPaymentId TEXT,
    companyId INTEGER,
    acquirerId INTEGER,
    acquirerEc TEXT,
    acquirerDescription TEXT,
    acquirerStatus TEXT,
    acquirerStatusDetail TEXT,
    acquirerNsu TEXT,
    acquirerTransactionId TEXT,
    acquirerAuthorizationCode TEXT,
    FOREIGN KEY(orderId) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS manual_payments (
    id TEXT PRIMARY KEY,
    orderId TEXT,
    amount REAL,
    reason TEXT,
    attachments TEXT,
    createdAt TEXT,
    updatedAt TEXT,
    status TEXT DEFAULT 'pending',
    requesterId TEXT,
    requesterName TEXT,
    requesterEmail TEXT,
    FOREIGN KEY(orderId) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS discounts (
    id TEXT PRIMARY KEY,
    orderId TEXT,
    systemId INTEGER,
    requestAmount REAL,
    requestDiscount REAL,
    oldAmount REAL,
    oldDiscount REAL,
    createdAt TEXT,
    requesterId TEXT,
    requesterName TEXT,
    requesterEmail TEXT,
    FOREIGN KEY(orderId) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS refunds (
    id TEXT PRIMARY KEY,
    orderId TEXT,
    paymentId TEXT,
    amount REAL,
    createdAt TEXT,
    updatedAt TEXT,
    requesterId TEXT,
    requesterName TEXT,
    requesterEmail TEXT,
    acquirerId INTEGER,
    acquirerDescription TEXT,
    acquirerStatus TEXT,
    acquirerStatusDetail TEXT,
    acquirerEc TEXT,
    FOREIGN KEY(orderId) REFERENCES orders(id),
    FOREIGN KEY(paymentId) REFERENCES payments(id)
  );
`);

export default db;
