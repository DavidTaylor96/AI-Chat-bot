import { DocumentChunk, ChunkedDocument, DocumentChunker } from '../utils/documentChunker';
import { EmbeddingService } from '../utils/embeddingService';
import { Message } from '../store/chatStore';

export interface RAGContext {
  chunks: DocumentChunk[];
  totalTokens: number;
  sourceDocuments: string[];
}

export interface RAGConfig {
  maxContextTokens: number;
  maxChunks: number;
  minSimilarity: number;
  enableHybridSearch: boolean;
}

export class RAGService {
  private static instance: RAGService;
  private embeddingService: EmbeddingService;
  private documents: Map<string, ChunkedDocument> = new Map();
  private config: RAGConfig;

  private constructor(config: RAGConfig = {
    maxContextTokens: 8000,
    maxChunks: 10,
    minSimilarity: 0.1,
    enableHybridSearch: true
  }) {
    this.config = config;
    this.embeddingService = EmbeddingService.getInstance();
    this.loadDocuments();
  }

  static getInstance(config?: RAGConfig): RAGService {
    if (!RAGService.instance) {
      RAGService.instance = new RAGService(config);
    }
    return RAGService.instance;
  }

  /**
   * Add a repository analysis document to the RAG system
   */
  async addDocument(content: string, fileName: string, title?: string): Promise<ChunkedDocument> {
    console.log(`Adding document: ${fileName} (${content.length} chars)`);
    
    // Chunk the document
    const chunkedDoc = DocumentChunker.chunkDocument(content, fileName, title);
    
    // Generate embeddings for all chunks
    console.log(`Generated ${chunkedDoc.chunks.length} chunks, creating embeddings...`);
    chunkedDoc.chunks = await this.embeddingService.embedChunks(chunkedDoc.chunks);
    
    // Store document
    this.documents.set(chunkedDoc.id, chunkedDoc);
    this.saveDocuments();
    
    console.log(`Document indexed successfully: ${chunkedDoc.chunks.length} chunks with embeddings`);
    return chunkedDoc;
  }

  /**
   * Remove a document from the RAG system
   */
  removeDocument(documentId: string): boolean {
    const deleted = this.documents.delete(documentId);
    if (deleted) {
      this.saveDocuments();
    }
    return deleted;
  }

  /**
   * Get all documents
   */
  getDocuments(): ChunkedDocument[] {
    return Array.from(this.documents.values());
  }

  /**
   * Find relevant context for a query using hybrid search
   */
  async findRelevantContext(
    query: string,
    excludeDocuments: string[] = []
  ): Promise<RAGContext> {
    const allChunks = this.getAllChunks().filter(
      chunk => !excludeDocuments.includes(chunk.metadata.sourceFile)
    );

    if (allChunks.length === 0) {
      return { chunks: [], totalTokens: 0, sourceDocuments: [] };
    }

    let relevantChunks: DocumentChunk[] = [];

    if (this.config.enableHybridSearch) {
      // Hybrid search: combine keyword and semantic search
      const keywordChunks = DocumentChunker.filterRelevantChunks(
        allChunks,
        query,
        Math.ceil(this.config.maxChunks / 2)
      );

      const semanticResults = await this.embeddingService.findSimilarChunks(
        query,
        allChunks,
        Math.ceil(this.config.maxChunks / 2),
        this.config.minSimilarity
      );

      // Combine and deduplicate results
      const combinedMap = new Map<string, { chunk: DocumentChunk; score: number }>();
      
      // Add keyword results with base score
      keywordChunks.forEach(chunk => {
        combinedMap.set(chunk.id, { chunk, score: 1.0 });
      });
      
      // Add semantic results with similarity score
      semanticResults.forEach(({ chunk, similarity }) => {
        const existing = combinedMap.get(chunk.id);
        if (existing) {
          // Boost score for chunks found by both methods
          existing.score += similarity * 1.5;
        } else {
          combinedMap.set(chunk.id, { chunk, score: similarity });
        }
      });

      // Sort by combined score and select top chunks
      relevantChunks = Array.from(combinedMap.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, this.config.maxChunks)
        .map(item => item.chunk);
    } else {
      // Semantic search only
      const semanticResults = await this.embeddingService.findSimilarChunks(
        query,
        allChunks,
        this.config.maxChunks,
        this.config.minSimilarity
      );
      relevantChunks = semanticResults.map(result => result.chunk);
    }

    // Fit chunks within token limit
    const contextChunks = this.fitWithinTokenLimit(relevantChunks);
    
    const sourceDocuments = Array.from(new Set(contextChunks.map(chunk => chunk.metadata.sourceFile)));
    const totalTokens = contextChunks.reduce((sum, chunk) => sum + chunk.tokens, 0);

    return {
      chunks: contextChunks,
      totalTokens,
      sourceDocuments
    };
  }

  /**
   * Enhance messages with RAG context
   */
  async enhanceMessagesWithContext(
    messages: Message[],
    maxContextMessages: number = 5
  ): Promise<{ messages: Message[]; context: RAGContext }> {
    if (messages.length === 0) {
      return { messages, context: { chunks: [], totalTokens: 0, sourceDocuments: [] } };
    }

    // Get recent user messages for context
    const recentMessages = messages
      .filter(msg => msg.role === 'user')
      .slice(-maxContextMessages);

    // Combine recent queries for better context retrieval
    const combinedQuery = recentMessages
      .map(msg => msg.content)
      .join(' ');

    // Find relevant context
    const context = await this.findRelevantContext(combinedQuery);

    if (context.chunks.length === 0) {
      return { messages, context };
    }

    // Create context message
    const contextMessage = this.formatContextMessage(context);
    
    // Insert context before the last user message
    const enhancedMessages = [...messages];
    if (enhancedMessages.length > 0) {
      enhancedMessages.splice(-1, 0, {
        id: `context-${Date.now()}`,
        content: contextMessage,
        role: 'user' as const,
        timestamp: Date.now()
      });
    }

    return { messages: enhancedMessages, context };
  }

  /**
   * Format context chunks into a readable message
   */
  private formatContextMessage(context: RAGContext): string {
    const sections = new Map<string, DocumentChunk[]>();
    
    // Group chunks by section
    context.chunks.forEach(chunk => {
      const key = `${chunk.section}`;
      if (!sections.has(key)) {
        sections.set(key, []);
      }
      sections.get(key)!.push(chunk);
    });

    let contextMessage = '## Repository Analysis Context\n\n';
    
    // Add source information
    if (context.sourceDocuments.length > 0) {
      contextMessage += `**Sources**: ${context.sourceDocuments.join(', ')}\n\n`;
    }

    // Add relevant sections
    for (const [sectionName, chunks] of Array.from(sections.entries())) {
      contextMessage += `### ${sectionName}\n\n`;
      
      chunks.forEach((chunk: any) => {
        let chunkContent = chunk.content.trim();
        
        // Truncate very long chunks
        if (chunkContent.length > 1500) {
          chunkContent = chunkContent.substring(0, 1500) + '...';
        }
        
        contextMessage += chunkContent + '\n\n';
        
        if (chunk.subsection) {
          contextMessage += `*From: ${chunk.subsection}*\n\n`;
        }
      });
    }

    contextMessage += `---\n*Context contains ${context.chunks.length} sections (${context.totalTokens} tokens)*\n\n`;
    
    return contextMessage;
  }

  /**
   * Fit chunks within token limit while preserving important information
   */
  private fitWithinTokenLimit(chunks: DocumentChunk[]): DocumentChunk[] {
    let totalTokens = 0;
    const result: DocumentChunk[] = [];
    
    // Sort chunks by importance (tables and code blocks first, then by section relevance)
    const sortedChunks = [...chunks].sort((a, b) => {
      const aWeight = this.getChunkImportanceWeight(a);
      const bWeight = this.getChunkImportanceWeight(b);
      return bWeight - aWeight;
    });
    
    for (const chunk of sortedChunks) {
      if (totalTokens + chunk.tokens <= this.config.maxContextTokens) {
        result.push(chunk);
        totalTokens += chunk.tokens;
      } else {
        break;
      }
    }
    
    return result;
  }

  /**
   * Calculate importance weight for chunk prioritization
   */
  private getChunkImportanceWeight(chunk: DocumentChunk): number {
    let weight = 1;
    
    // Boost important content types
    switch (chunk.metadata.type) {
      case 'table': weight += 3; break;
      case 'code': weight += 2; break;
      case 'header': weight += 1; break;
    }
    
    // Boost important sections
    const sectionLower = chunk.section.toLowerCase();
    if (sectionLower.includes('api')) weight += 2;
    if (sectionLower.includes('function')) weight += 2;
    if (sectionLower.includes('class')) weight += 2;
    if (sectionLower.includes('summary')) weight += 3;
    if (sectionLower.includes('executive')) weight += 3;
    
    return weight;
  }

  /**
   * Get all chunks from all documents
   */
  private getAllChunks(): DocumentChunk[] {
    const allChunks: DocumentChunk[] = [];
    for (const doc of Array.from(this.documents.values())) {
      allChunks.push(...doc.chunks);
    }
    return allChunks;
  }

  /**
   * Save documents to localStorage
   */
  private saveDocuments(): void {
    try {
      const docs = Array.from(this.documents.entries());
      localStorage.setItem('rag-documents', JSON.stringify(docs));
    } catch (error) {
      console.error('Failed to save RAG documents:', error);
    }
  }

  /**
   * Load documents from localStorage
   */
  private loadDocuments(): void {
    try {
      const stored = localStorage.getItem('rag-documents');
      if (stored) {
        const docs = JSON.parse(stored) as Array<[string, ChunkedDocument]>;
        this.documents = new Map(docs);
        console.log(`Loaded ${docs.length} documents from storage`);
      }
    } catch (error) {
      console.error('Failed to load RAG documents:', error);
    }
  }

  /**
   * Clear all documents
   */
  clearAllDocuments(): void {
    this.documents.clear();
    this.saveDocuments();
  }

  /**
   * Get statistics about the RAG system
   */
  getStats(): {
    totalDocuments: number;
    totalChunks: number;
    totalTokens: number;
    averageChunkSize: number;
  } {
    const allChunks = this.getAllChunks();
    const totalTokens = allChunks.reduce((sum, chunk) => sum + chunk.tokens, 0);
    
    return {
      totalDocuments: this.documents.size,
      totalChunks: allChunks.length,
      totalTokens,
      averageChunkSize: allChunks.length > 0 ? Math.round(totalTokens / allChunks.length) : 0
    };
  }
}