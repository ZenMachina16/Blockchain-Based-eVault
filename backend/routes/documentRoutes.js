const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const authenticateToken = require('../middleware/auth');

// Get all documents for a case
router.get('/cases/:caseId/documents', authenticateToken, documentController.getCaseDocuments);

// Upload a new document
router.post('/cases/:caseId/documents', authenticateToken, documentController.uploadDocument);

// Update document
router.put('/documents/:documentId', authenticateToken, documentController.updateDocument);

// Delete document
router.delete('/documents/:documentId', authenticateToken, documentController.deleteDocument);

// Verify document
router.post('/documents/:documentId/verify', authenticateToken, documentController.verifyDocument);

// Change document status
router.put('/documents/:documentId/status', authenticateToken, documentController.changeDocumentStatus);

module.exports = router; 