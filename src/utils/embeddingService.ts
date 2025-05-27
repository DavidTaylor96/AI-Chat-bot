import { DocumentChunk } from './documentChunker';

export interface EmbeddingConfig {
  model: 'transformers' | 'openai';
  dimensions: number;
  maxBatchSize: number;
}

export class EmbeddingService {
  private static instance: EmbeddingService;
  private config: EmbeddingConfig;
  private pipeline: any = null;
  private isInitializing = false;

  private constructor(config: EmbeddingConfig = {
    model: 'transformers',
    dimensions: 384,
    maxBatchSize: 10
  }) {
    this.config = config;
  }

  static getInstance(config?: EmbeddingConfig): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService(config);
    }
    return EmbeddingService.instance;
  }

  /**
   * Initialize the embedding pipeline (transformers.js for client-side)
   */
  private async initializePipeline(): Promise<void> {
    if (this.pipeline || this.isInitializing) return;
    
    this.isInitializing = true;
    
    try {
      // Dynamically import transformers.js (client-side embedding)
      const { pipeline } = await import('@xenova/transformers');
      
      // Use a lightweight embedding model that works well in browsers
      this.pipeline = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2', // 22MB model, 384 dimensions
        { 
          progress_callback: (data: any) => {
            console.log('Loading embedding model:', data);
          }
        }
      );
      
      console.log('Embedding pipeline initialized successfully');
    } catch (error) {
      console.error('Failed to initialize embedding pipeline:', error);
      // Fallback to simple text similarity
      this.pipeline = null;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Generate embeddings for text chunks
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (this.config.model === 'transformers') {
      return this.generateTransformersEmbeddings(texts);
    } else {
      // Fallback to simple similarity scoring
      return this.generateSimpleEmbeddings(texts);
    }
  }

  /**
   * Generate embeddings using transformers.js (client-side)
   */
  private async generateTransformersEmbeddings(texts: string[]): Promise<number[][]> {
    await this.initializePipeline();
    
    if (!this.pipeline) {
      console.warn('Pipeline not available, falling back to simple embeddings');
      return this.generateSimpleEmbeddings(texts);
    }

    const embeddings: number[][] = [];
    
    // Process in batches to avoid memory issues
    for (let i = 0; i < texts.length; i += this.config.maxBatchSize) {
      const batch = texts.slice(i, i + this.config.maxBatchSize);
      
      try {
        const results = await Promise.all(
          batch.map(async (text) => {
            const output = await this.pipeline(text, {
              pooling: 'mean',
              normalize: true,
            });
            return Array.from(output.data) as number[];
          })
        );
        
        embeddings.push(...results);
      } catch (error) {
        console.error('Error generating embeddings for batch:', error);
        // Fallback for this batch
        const fallbackEmbeddings = this.generateSimpleEmbeddings(batch);
        embeddings.push(...fallbackEmbeddings);
      }
    }
    
    return embeddings;
  }

  /**
   * Simple fallback embeddings using TF-IDF-like approach
   */
  private generateSimpleEmbeddings(texts: string[]): number[][] {
    // Create a simple vocabulary from all texts
    const vocabulary = new Set<string>();
    const processedTexts = texts.map(text => {
      const words = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2);
      
      words.forEach(word => vocabulary.add(word));
      return words;
    });

    const vocabArray = Array.from(vocabulary);
    const vocabSize = Math.min(vocabArray.length, this.config.dimensions);
    
    // Generate embeddings as term frequency vectors
    return processedTexts.map(words => {
      const embedding = new Array(this.config.dimensions).fill(0);
      
      words.forEach(word => {
        const index = vocabArray.indexOf(word);
        if (index !== -1 && index < vocabSize) {
          embedding[index] += 1;
        }
      });
      
      // Normalize
      const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
      return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
    });
  }

  /**
   * Calculate cosine similarity between embeddings
   */
  static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  /**
   * Find similar chunks using embedding similarity
   */
  async findSimilarChunks(
    query: string,
    chunks: DocumentChunk[],
    topK: number = 5,
    minSimilarity: number = 0.1
  ): Promise<Array<{ chunk: DocumentChunk; similarity: number }>> {
    // Generate query embedding
    const queryEmbeddings = await this.generateEmbeddings([query]);
    const queryEmbedding = queryEmbeddings[0];
    
    // Ensure all chunks have embeddings
    const chunksWithoutEmbeddings = chunks.filter(chunk => !chunk.embedding);
    if (chunksWithoutEmbeddings.length > 0) {
      const texts = chunksWithoutEmbeddings.map(chunk => chunk.content);
      const embeddings = await this.generateEmbeddings(texts);
      
      chunksWithoutEmbeddings.forEach((chunk, index) => {
        chunk.embedding = embeddings[index];
      });
    }
    
    // Calculate similarities
    const similarities = chunks.map(chunk => ({
      chunk,
      similarity: chunk.embedding ? 
        EmbeddingService.cosineSimilarity(queryEmbedding, chunk.embedding) : 0
    }));
    
    // Filter and sort by similarity
    return similarities
      .filter(item => item.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Batch process chunks to add embeddings
   */
  async embedChunks(chunks: DocumentChunk[]): Promise<DocumentChunk[]> {
    const texts = chunks.map(chunk => chunk.content);
    const embeddings = await this.generateEmbeddings(texts);
    
    return chunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index]
    }));
  }
}