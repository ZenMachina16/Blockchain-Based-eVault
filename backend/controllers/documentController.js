const Document = require('../models/Document');
const Case = require('../models/Case');

// Get all documents for a case
exports.getCaseDocuments = async (req, res) => {
  try {
    const { caseId } = req.params;
    const documents = await Document.find({ caseId })
      .populate('uploadedBy', 'name email')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
};

// Upload a new document
exports.uploadDocument = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { title, description, type, ipfsHash } = req.body;
    const userId = req.user.id;

    // Verify case exists and user has access
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Create new document
    const document = new Document({
      title,
      description,
      type,
      ipfsHash,
      caseId,
      uploadedBy: userId,
    });

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
};

// Update document
exports.updateDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { title, description, type, ipfsHash } = req.body;
    const userId = req.user.id;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Store previous version
    document.previousVersions.push({
      ipfsHash: document.ipfsHash,
      version: document.version,
      timestamp: new Date(),
    });

    // Update document
    document.title = title || document.title;
    document.description = description || document.description;
    document.type = type || document.type;
    document.ipfsHash = ipfsHash || document.ipfsHash;
    document.version += 1;

    await document.save();
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error updating document', error: error.message });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const document = await Document.findById(documentId);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    await document.remove();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting document', error: error.message });
  }
};

// Verify document
exports.verifyDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    document.isVerified = true;
    document.verifiedBy = userId;
    await document.save();

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error verifying document', error: error.message });
  }
};

// Change document status
exports.changeDocumentStatus = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { status } = req.body;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    document.status = status;
    await document.save();

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error changing document status', error: error.message });
  }
}; 