/**
 * Enterprise RAG Engine
 * High-performance semantic vector retrieval with strict Role-Based Access Control (RBAC),
 * dynamic ACL filtering, chunk attribution, citation synthesis, and document ingestion.
 */

class EnterpriseRAGEngine {
  constructor(documents = []) {
    this.documents = JSON.parse(JSON.stringify(documents));
    this.chunks = [];
    this.idfMap = new Map();
    this.vocabulary = new Set();
    this.reindexAll();
  }

  // Tokenize and clean text
  tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-_]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 2 && !this.isStopword(w));
  }

  isStopword(word) {
    const stops = new Set([
      "the", "and", "for", "with", "that", "this", "from", "are", "have", "has",
      "our", "all", "can", "will", "was", "any", "been", "they", "its", "each",
      "more", "when", "also", "into", "than", "over", "only", "were", "some"
    ]);
    return stops.has(word);
  }

  // Chunk documents into logical semantic sections
  reindexAll() {
    this.chunks = [];
    this.vocabulary.clear();
    const docFrequencies = new Map();

    this.documents.forEach(doc => {
      const sections = doc.content.split(/(?=###\s+)/);
      sections.forEach((sec, idx) => {
        const lines = sec.trim().split("\n");
        const headingMatch = lines[0].match(/###\s+(.*)/);
        const sectionTitle = headingMatch ? headingMatch[1].trim() : `Section ${idx + 1}`;
        const body = lines.slice(headingMatch ? 1 : 0).join("\n").trim();

        if (body.length > 10) {
          const chunkId = `${doc.id}#sec-${idx + 1}`;
          const tokens = this.tokenize(`${doc.title} ${doc.tags.join(" ")} ${sectionTitle} ${body}`);
          
          // Term frequencies
          const tf = new Map();
          tokens.forEach(tok => {
            tf.set(tok, (tf.get(tok) || 0) + 1);
            this.vocabulary.add(tok);
          });

          // Document frequency for IDF
          const uniqueTokens = new Set(tokens);
          uniqueTokens.forEach(tok => {
            docFrequencies.set(tok, (docFrequencies.get(tok) || 0) + 1);
          });

          this.chunks.push({
            chunkId,
            docId: doc.id,
            docTitle: doc.title,
            department: doc.department,
            clearance: doc.clearance,
            author: doc.author,
            updatedAt: doc.updatedAt,
            version: doc.version,
            sectionTitle,
            content: body,
            fullSnippet: `${sectionTitle}\n${body}`,
            tokens,
            tf
          });
        }
      });
    });

    // Compute Inverse Document Frequency (IDF)
    const N = Math.max(1, this.chunks.length);
    docFrequencies.forEach((df, term) => {
      this.idfMap.set(term, Math.log((N - df + 0.5) / (df + 0.5) + 1));
    });

    // Compute TF-IDF normalized vectors for all chunks
    this.chunks.forEach(chunk => {
      let normSq = 0;
      chunk.vector = new Map();
      chunk.tf.forEach((freq, term) => {
        const idf = this.idfMap.get(term) || 0.5;
        const weight = freq * idf;
        chunk.vector.set(term, weight);
        normSq += weight * weight;
      });
      chunk.norm = Math.sqrt(normSq) || 1;
    });

    console.log(`[RAG Engine] Indexed ${this.documents.length} docs into ${this.chunks.length} semantic chunks across ${this.vocabulary.size} unique terms.`);
  }

  // Strict Permission-Enforced Retrieval
  retrieve({ query, currentUser, topK = 4, departmentFilter = null }) {
    if (!query || !currentUser) {
      return { retrievedChunks: [], blockedDocs: [], totalMatched: 0 };
    }

    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) {
      return { retrievedChunks: [], blockedDocs: [], totalMatched: 0 };
    }

    // Build query TF-IDF vector
    const queryTf = new Map();
    queryTokens.forEach(tok => queryTf.set(tok, (queryTf.get(tok) || 0) + 1));
    const queryVector = new Map();
    let qNormSq = 0;
    queryTf.forEach((freq, term) => {
      const idf = this.idfMap.get(term) || 1.2;
      const weight = freq * idf;
      queryVector.set(term, weight);
      qNormSq += weight * weight;
    });
    const qNorm = Math.sqrt(qNormSq) || 1;

    // Evaluate relevance for all chunks
    const scoredChunks = [];
    this.chunks.forEach(chunk => {
      if (departmentFilter && chunk.department !== departmentFilter) {
        return;
      }

      // Cosine similarity
      let dotProduct = 0;
      queryVector.forEach((qWeight, term) => {
        if (chunk.vector.has(term)) {
          dotProduct += qWeight * chunk.vector.get(term);
        }
      });

      // Bonus for exact keyword matches in title or tags
      let titleBonus = 0;
      const titleLower = chunk.docTitle.toLowerCase();
      queryTokens.forEach(tok => {
        if (titleLower.includes(tok)) titleBonus += 0.25;
      });

      const cosineScore = dotProduct / (qNorm * chunk.norm);
      const compositeScore = cosineScore + titleBonus;

      if (compositeScore > 0.08) {
        scoredChunks.push({
          chunk,
          score: Math.min(0.99, compositeScore)
        });
      }
    });

    // Sort by composite relevance score descending
    scoredChunks.sort((a, b) => b.score - a.score);

    // CRITICAL ENFORCEMENT: Role-Based Access Control Filtering
    // Evaluates whether the current employee has appropriate clearance for each matched chunk
    const retrievedChunks = [];
    const blockedDocsMap = new Map();

    const allowedClearances = new Set(currentUser.allowedClearances || ["Public"]);

    scoredChunks.forEach(item => {
      const isAllowed = allowedClearances.has(item.chunk.clearance);

      if (isAllowed) {
        if (retrievedChunks.length < topK) {
          retrievedChunks.push({
            chunkId: item.chunk.chunkId,
            docId: item.chunk.docId,
            docTitle: item.chunk.docTitle,
            department: item.chunk.department,
            clearance: item.chunk.clearance,
            author: item.chunk.author,
            updatedAt: item.chunk.updatedAt,
            version: item.chunk.version,
            sectionTitle: item.chunk.sectionTitle,
            content: item.chunk.content,
            score: parseFloat(item.score.toFixed(3)),
            citationId: `[Doc: ${item.chunk.docId}]`
          });
        }
      } else {
        // Track document that was blocked by permission policy
        if (!blockedDocsMap.has(item.chunk.docId)) {
          blockedDocsMap.set(item.chunk.docId, {
            docId: item.chunk.docId,
            docTitle: item.chunk.docTitle,
            department: item.chunk.department,
            requiredClearance: item.chunk.clearance,
            userClearance: currentUser.clearanceLabel,
            reason: `Access Denied: Requires ${item.chunk.clearance} clearance tier.`
          });
        }
      }
    });

    return {
      retrievedChunks,
      blockedDocs: Array.from(blockedDocsMap.values()),
      totalMatched: scoredChunks.length,
      userClearance: currentUser.clearanceLabel
    };
  }

  // Dynamic Document Ingestion
  ingestDocument({ id, title, department, clearance, author, content, tags = [] }) {
    if (!id || !title || !content) {
      throw new Error("Missing required document parameters (id, title, content)");
    }

    // Check if ID already exists
    const existingIdx = this.documents.findIndex(d => d.id === id);
    const newDoc = {
      id,
      title,
      department: department || "General",
      clearance: clearance || "Internal",
      author: author || "Enterprise Ingestion Pipeline",
      updatedAt: new Date().toISOString().split("T")[0],
      version: "v1.0",
      tags: Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim().toLowerCase()),
      summary: content.slice(0, 160) + "...",
      content
    };

    if (existingIdx >= 0) {
      this.documents[existingIdx] = newDoc;
    } else {
      this.documents.unshift(newDoc);
    }

    this.reindexAll();
    return newDoc;
  }

  // Delete document
  deleteDocument(docId) {
    const prevCount = this.documents.length;
    this.documents = this.documents.filter(d => d.id !== docId);
    if (this.documents.length !== prevCount) {
      this.reindexAll();
      return true;
    }
    return false;
  }

  // Get single document by ID
  getDocumentById(docId) {
    return this.documents.find(d => d.id === docId);
  }

  // Get statistics
  getStats() {
    const clearanceBreakdown = {};
    const departmentBreakdown = {};

    this.documents.forEach(d => {
      clearanceBreakdown[d.clearance] = (clearanceBreakdown[d.clearance] || 0) + 1;
      departmentBreakdown[d.department] = (departmentBreakdown[d.department] || 0) + 1;
    });

    return {
      totalDocuments: this.documents.length,
      totalChunks: this.chunks.length,
      vocabularySize: this.vocabulary.size,
      clearanceBreakdown,
      departmentBreakdown
    };
  }
}

// Attach to window
window.EnterpriseRAGEngine = EnterpriseRAGEngine;

