export interface DocumentChunk {
  id: string;
  content: string;
  section: string;
  subsection?: string;
  tokens: number;
  embedding?: number[];
  metadata: {
    sourceFile: string;
    chunkIndex: number;
    startLine?: number;
    endLine?: number;
    type: 'header' | 'content' | 'table' | 'code' | 'list';
  };
}

export interface ChunkedDocument {
  id: string;
  title: string;
  sourceFile: string;
  totalChunks: number;
  chunks: DocumentChunk[];
  createdAt: number;
  metadata: {
    totalSize: number;
    language?: string;
    repositoryPath?: string;
  };
}

export class DocumentChunker {
  private static readonly MAX_CHUNK_SIZE = 1000; // tokens
  private static readonly OVERLAP_SIZE = 100; // tokens
  private static readonly HEADER_PATTERNS = [
    /^#{1,6}\s+(.+)$/gm, // Markdown headers
    /^(.+)\n[=-]+\n/gm, // Underlined headers
  ];

  /**
   * Estimate token count (rough approximation: 1 token ≈ 4 characters)
   */
  private static estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Extract sections from markdown content
   */
  private static extractSections(content: string): Array<{
    title: string;
    content: string;
    level: number;
    startIndex: number;
    endIndex: number;
  }> {
    const sections: Array<{
      title: string;
      content: string;
      level: number;
      startIndex: number;
      endIndex: number;
    }> = [];
    
    const lines = content.split('\n');
    let currentSection = {
      title: 'Introduction',
      content: '',
      level: 0,
      startIndex: 0,
      endIndex: 0,
    };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headerMatch) {
        // Save previous section if it has content
        if (currentSection.content.trim()) {
          currentSection.endIndex = i - 1;
          sections.push({ ...currentSection });
        }
        
        // Start new section
        currentSection = {
          title: headerMatch[2].trim(),
          content: '',
          level: headerMatch[1].length,
          startIndex: i,
          endIndex: i,
        };
      } else {
        currentSection.content += line + '\n';
      }
    }
    
    // Add final section
    if (currentSection.content.trim()) {
      currentSection.endIndex = lines.length - 1;
      sections.push(currentSection);
    }
    
    return sections;
  }

  /**
   * Split large sections into smaller chunks while preserving context
   */
  private static splitSection(
    section: { title: string; content: string; level: number },
    chunkIndex: number,
    sourceFile: string
  ): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const content = section.content.trim();
    
    if (this.estimateTokens(content) <= this.MAX_CHUNK_SIZE) {
      // Section fits in one chunk
      chunks.push({
        id: `${sourceFile}-${chunkIndex}`,
        content,
        section: section.title,
        tokens: this.estimateTokens(content),
        metadata: {
          sourceFile,
          chunkIndex,
          type: this.classifyContent(content),
        },
      });
    } else {
      // Split section into smaller chunks
      const paragraphs = content.split(/\n\s*\n/);
      let currentChunk = '';
      let subChunkIndex = 0;
      
      for (const paragraph of paragraphs) {
        const paragraphTokens = this.estimateTokens(paragraph);
        const currentTokens = this.estimateTokens(currentChunk);
        
        if (currentTokens + paragraphTokens > this.MAX_CHUNK_SIZE && currentChunk) {
          // Save current chunk
          chunks.push({
            id: `${sourceFile}-${chunkIndex}-${subChunkIndex}`,
            content: currentChunk.trim(),
            section: section.title,
            subsection: `Part ${subChunkIndex + 1}`,
            tokens: this.estimateTokens(currentChunk),
            metadata: {
              sourceFile,
              chunkIndex: parseInt(`${chunkIndex}${subChunkIndex}`),
              type: this.classifyContent(currentChunk),
            },
          });
          
          // Start new chunk with overlap
          const overlap = this.getOverlap(currentChunk);
          currentChunk = overlap + paragraph + '\n\n';
          subChunkIndex++;
        } else {
          currentChunk += paragraph + '\n\n';
        }
      }
      
      // Add final chunk
      if (currentChunk.trim()) {
        chunks.push({
          id: `${sourceFile}-${chunkIndex}-${subChunkIndex}`,
          content: currentChunk.trim(),
          section: section.title,
          subsection: subChunkIndex > 0 ? `Part ${subChunkIndex + 1}` : undefined,
          tokens: this.estimateTokens(currentChunk),
          metadata: {
            sourceFile,
            chunkIndex: parseInt(`${chunkIndex}${subChunkIndex}`),
            type: this.classifyContent(currentChunk),
          },
        });
      }
    }
    
    return chunks;
  }

  /**
   * Get overlap text from the end of a chunk
   */
  private static getOverlap(text: string): string {
    const sentences = text.split(/[.!?]+/);
    let overlap = '';
    let tokens = 0;
    
    for (let i = sentences.length - 1; i >= 0 && tokens < this.OVERLAP_SIZE; i--) {
      const sentence = sentences[i].trim();
      if (sentence) {
        const sentenceTokens = this.estimateTokens(sentence);
        if (tokens + sentenceTokens <= this.OVERLAP_SIZE) {
          overlap = sentence + '. ' + overlap;
          tokens += sentenceTokens;
        } else {
          break;
        }
      }
    }
    
    return overlap;
  }

  /**
   * Classify content type for better retrieval
   */
  private static classifyContent(content: string): 'header' | 'content' | 'table' | 'code' | 'list' {
    if (/^\|.*\|/.test(content)) return 'table';
    if (/```/.test(content)) return 'code';
    if (/^\s*[-*+]\s+/m.test(content) || /^\s*\d+\.\s+/m.test(content)) return 'list';
    if (/^#{1,6}\s+/.test(content)) return 'header';
    return 'content';
  }

  /**
   * Main chunking function
   */
  static chunkDocument(
    content: string,
    sourceFile: string,
    title?: string
  ): ChunkedDocument {
    const sections = this.extractSections(content);
    const chunks: DocumentChunk[] = [];
    let chunkIndex = 0;
    
    for (const section of sections) {
      const sectionChunks = this.splitSection(section, chunkIndex, sourceFile);
      chunks.push(...sectionChunks);
      chunkIndex += sectionChunks.length;
    }
    
    return {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title || this.extractTitle(content) || 'Untitled Document',
      sourceFile,
      totalChunks: chunks.length,
      chunks,
      createdAt: Date.now(),
      metadata: {
        totalSize: content.length,
        repositoryPath: this.extractRepositoryPath(content),
      },
    };
  }

  /**
   * Extract title from document content
   */
  private static extractTitle(content: string): string | null {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) return titleMatch[1].trim();
    
    const titleMatch2 = content.match(/^(.+)\n=+\n/);
    if (titleMatch2) return titleMatch2[1].trim();
    
    return null;
  }

  /**
   * Extract repository path from analysis content
   */
  private static extractRepositoryPath(content: string): string | undefined {
    const pathMatch = content.match(/\*\*Repository Path\*\*:\s*`([^`]+)`/);
    return pathMatch ? pathMatch[1] : undefined;
  }

  /**
   * Filter chunks by relevance to query
   */
  static filterRelevantChunks(
    chunks: DocumentChunk[],
    query: string,
    maxChunks: number = 5
  ): DocumentChunk[] {
    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/).filter(term => term.length > 2);
    
    const scoredChunks = chunks.map(chunk => {
      let score = 0;
      const contentLower = chunk.content.toLowerCase();
      const sectionLower = chunk.section.toLowerCase();
      
      // Exact matches in section titles (high weight)
      for (const term of queryTerms) {
        if (sectionLower.includes(term)) score += 10;
        if (contentLower.includes(term)) score += 1;
      }
      
      // Boost specific content types based on query
      if (queryLower.includes('api') && chunk.metadata.type === 'table') score += 5;
      if (queryLower.includes('function') && chunk.content.includes('function')) score += 3;
      if (queryLower.includes('class') && chunk.content.includes('class')) score += 3;
      if (queryLower.includes('dependency') && chunk.section.toLowerCase().includes('dependen')) score += 5;
      
      return { chunk, score };
    });
    
    return scoredChunks
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxChunks)
      .map(item => item.chunk);
  }
}