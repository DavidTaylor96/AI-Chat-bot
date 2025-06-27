import React, { useState } from 'react';
import { ArrowRight, ArrowDown, Database, Server, Monitor, Cpu, HardDrive, Zap } from 'lucide-react';

const LLMSystemArchitecture = () => {
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [selectedUseCase, setSelectedUseCase] = useState<any>('weak');

  const useCases:any = {
    weak: {
      clientRequest: `POST /api/chat
{
  "message": "Fix my TypeScript error"
}`,
      tokenization: `Tokens: ["Fix", "my", "TypeScript", "error"]
Token IDs: [8432, 1891, 5436, 1049]
Context Length: 4 tokens`,
      attention: [
        { token: "Fix", weight: 0.3 },
        { token: "TypeScript", weight: 0.4 },
        { token: "error", weight: 0.5 },
        { token: "my", weight: 0.1 }
      ],
      patterns: [
        { name: "TypeScript", activation: 0.3 },
        { name: "Debug", activation: 0.25 },
        { name: "Generic", activation: 0.2 },
        { name: "Interface", activation: 0.1 }
      ],
      response: `{
  "response": "To fix TypeScript errors, you can:
  1. Check your type annotations
  2. Run 'tsc --noEmit' to see all errors
  3. Use TypeScript strict mode
  4. Check the TypeScript documentation",
  "confidence": 0.3,
  "processing_time": "250ms"
}`,
      analysis: {
        activation: "30% - Weak neural activation",
        quality: "Generic - Basic debugging advice",
        value: "Low - Requires follow-up questions"
      },
      analysisColor: "bg-red-50 border-red-200"
    },

    good: {
      clientRequest: `POST /api/chat
{
  "message": "Fix TypeScript error 'Property embeddingChunks does not exist on type ParseResult' in repository analyzer tool. Architecture: BaseParser -> TypeScriptParser -> ParseResult interface. Need to add vector embedding support following existing optional property pattern like interfaces?, typeAliases?",
  "context": {
    "file": "src/types.ts",
    "codebase": "repository-analyzer", 
    "architecture": "parser-pattern"
  }
}`,
      tokenization: `Tokens: ["Fix", "TypeScript", "error", "Property", "embeddingChunks", "ParseResult", "repository", "analyzer", "BaseParser", "TypeScriptParser", "interface", "vector", "embedding", "optional", "pattern"]
Token IDs: [8432, 1891, 1049, 7829, 12456, 5436, 9876, 3421, 8765, 4532, 1234, 5678, 9876, 3456, 7890]
Context Length: 15 tokens`,
      attention: [
        { token: "ParseResult", weight: 0.95 },
        { token: "embeddingChunks", weight: 0.92 },
        { token: "TypeScript", weight: 0.89 },
        { token: "interface", weight: 0.87 },
        { token: "optional", weight: 0.84 }
      ],
      patterns: [
        { name: "TypeScript Interface", activation: 0.95 },
        { name: "Parser Architecture", activation: 0.88 },
        { name: "Repository Analysis", activation: 0.83 },
        { name: "Vector Embedding", activation: 0.81 }
      ],
      response: `{
  "response": "To fix this TypeScript error, add the embeddingChunks property to your ParseResult interface in src/types.ts:

  \`\`\`typescript
  export interface ParseResult {
    functions: FunctionInfo[];
    classes: ClassInfo[];
    imports: ImportInfo[];
    exports: ExportInfo[];
    constants: ConstantInfo[];
    interfaces?: InterfaceInfo[];
    typeAliases?: TypeAliasInfo[];
    embeddingChunks?: VectorEmbeddingInfo[];  // Add this line
  }
  
  // Also add the VectorEmbeddingInfo interface:
  export interface VectorEmbeddingInfo {
    id: string;
    content: string;
    embedding?: number[];
    metadata: {
      file: string;
      type: 'function' | 'class' | 'interface' | 'component';
      name: string;
      lineStart: number;
      lineEnd: number;
      language: string;
    };
  }
  \`\`\`

  Then implement createEmbeddingChunks() in your TypeScriptParser:

  \`\`\`typescript
  // In src/parsers/typescript-parser.ts
  private createEmbeddingChunks(): VectorEmbeddingInfo[] {
    const chunks: VectorEmbeddingInfo[] = [];
    
    // Create chunks for functions
    this.functions.forEach(func => {
      chunks.push({
        id: \`\${this.filePath}:function:\${func.name}\`,
        content: this.getFunctionContent(func.lineStart, func.lineEnd),
        metadata: {
          file: this.filePath,
          type: 'function',
          name: func.name,
          lineStart: func.lineStart,
          lineEnd: func.lineEnd,
          language: 'typescript'
        }
      });
    });
    
    return chunks;
  }
  \`\`\`",
  "confidence": 0.95,
  "processing_time": "180ms"
}`,
      analysis: {
        activation: "95% - Strong pattern intersection",
        quality: "Precise - Specific architectural solution",
        value: "High - Ready-to-implement solution"
      },
      analysisColor: "bg-green-50 border-green-200"
    },

    overload: {
      clientRequest: `POST /api/chat
{
  "message": "Fix TypeScript error Property embeddingChunks does not exist on type ParseResult in repository analyzer tool with Node.js CLI architecture using BaseParser TypeScriptParser inheritance pattern following SOLID principles DRY patterns implementing vector embeddings machine learning natural language processing AST parsing code generation documentation generation file system scanning dependency analysis import export graph analysis state management React components TypeScript interfaces type aliases database schemas ORM patterns authentication authorization middleware error handling testing patterns Jest unit tests integration tests CI/CD deployment Docker containers microservices architecture API design REST GraphQL endpoints",
  "context": {
    "file": "src/types.ts",
    "codebase": "repository-analyzer",
    "architecture": "everything-mentioned-above"
  }
}`,
      tokenization: `Tokens: ["Fix", "TypeScript", "error", "Property", "embeddingChunks", "ParseResult", "repository", "analyzer", "Node", "CLI", "BaseParser", "inheritance", "SOLID", "DRY", "vector", "embeddings", "machine", "learning", "NLP", "AST", "parsing", "code", "generation", "documentation", "file", "system", "scanning", "dependency", "analysis", "import", "export", "graph", "state", "management", "React", "components", "interfaces", "type", "aliases", "database", "schemas", "ORM", "authentication", "authorization", "middleware", "error", "handling", "testing", "Jest", "unit", "integration", "CI", "CD", "deployment", "Docker", "containers", "microservices", "API", "design", "REST", "GraphQL", "endpoints"]
Token IDs: [many IDs...]
Context Length: 65+ tokens`,
      attention: [
        { token: "TypeScript", weight: 0.4 },
        { token: "ParseResult", weight: 0.3 },
        { token: "vector", weight: 0.3 },
        { token: "React", weight: 0.3 },
        { token: "API", weight: 0.2 }
      ],
      patterns: [
        { name: "TypeScript", activation: 0.6 },
        { name: "React Components", activation: 0.7 },
        { name: "API Design", activation: 0.5 },
        { name: "Microservices", activation: 0.8 }
      ],
      response: `{
  "response": "For your TypeScript repository analyzer with microservices architecture, you should implement a comprehensive solution using dependency injection with factory patterns for vector embeddings while following SOLID principles:

  \`\`\`typescript
  // This response is mixing unrelated concepts (HALLUCINATION)
  @Injectable()
  export class VectorEmbeddingMicroservice {
    constructor(
      private graphQLApi: GraphQLService,
      private dockerContainer: ContainerOrchestrator,
      private jwtAuth: OAuth2Handler
    ) {}
    
    async processReactComponents(): Promise<ParseResult & MicroserviceResponse> {
      // This makes no sense - mixing React with backend parsing
      return await this.dockerContainer.deployWithJest({
        embeddings: this.graphQLApi.generateVectors(),
        authentication: this.jwtAuth.validateReactProps()
      });
    }
  }
  \`\`\`

  You should also implement OAuth2 authentication with JWT tokens and use Jest for testing with CI/CD deployment pipelines. Consider using a React-based dashboard with GraphQL endpoints...",
  "confidence": 0.2,
  "processing_time": "890ms",
  "warning": "Response may contain hallucinated content due to context overload"
}`,
      analysis: {
        activation: "Competing patterns - Neural confusion",
        quality: "Unfocused - Mentions unrelated concepts",
        value: "Negative - Contains hallucinated solutions"
      },
      analysisColor: "bg-yellow-50 border-yellow-400"
    }
  };

  const componentDetails: any = {
    client: {
      title: "Client Applications",
      description: "User interfaces and applications",
      specs: "• Web browsers\n• Mobile apps\n• API clients\n• Developer tools"
    },
    api: {
      title: "API Gateway",
      description: "Request routing and validation",
      specs: "• Authentication\n• Rate limiting\n• Request validation\n• Load balancing"
    },
    preprocessing: {
      title: "Preprocessing Service",
      description: "Input preparation and tokenization",
      specs: "• Text normalization\n• Tokenization\n• Context assembly\n• Input validation"
    },
    llm: {
      title: "LLM Core Engine",
      description: "Main neural processing unit",
      specs: "• 80+ Neural layers\n• 175B+ parameters\n• Transformer architecture\n• Attention mechanism"
    },
    embedding: {
      title: "Embedding Service",
      description: "Vector processing and storage",
      specs: "• Token → Vector conversion\n• 4096-dimensional vectors\n• Positional encoding\n• Context vectors"
    },
    memory: {
      title: "Parameter Store",
      description: "Neural network weights storage",
      specs: "• 175B+ parameters\n• Model weights\n• No external knowledge DB\n• Compressed patterns"
    },
    postprocessing: {
      title: "Response Service",
      description: "Output formatting and validation",
      specs: "• Token assembly\n• Safety filtering\n• Format validation\n• Response optimization"
    },
    cache: {
      title: "Cache Layer",
      description: "Performance optimization",
      specs: "• Response caching\n• Token caching\n• Pattern caching\n• Context caching"
    }
  };

  // Component rendering functions
  const ClientBox = ({ onClick, selected }: any) => (
    <div 
      className={`bg-blue-100 border-2 border-blue-400 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${selected ? 'ring-4 ring-blue-300' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <Monitor className="text-blue-600" size={24} />
        <h3 className="font-bold text-blue-800">Client Layer</h3>
      </div>
      <p className="text-sm text-blue-700">Web Apps, Mobile Apps, APIs</p>
    </div>
  );

  const ServiceBox = ({ title, icon: Icon, color, bgColor, onClick, selected }: any) => (
    <div 
      className={`${bgColor} border-2 border-${color}-400 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${selected ? `ring-4 ring-${color}-300` : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`text-${color}-600`} size={20} />
        <h4 className={`font-bold text-${color}-800 text-sm`}>{title}</h4>
      </div>
    </div>
  );

  const DatabaseBox = ({ title, icon: Icon, color, bgColor, onClick, selected }: any) => (
    <div 
      className={`${bgColor} border-2 border-${color}-400 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${selected ? `ring-4 ring-${color}-300` : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`text-${color}-600`} size={20} />
        <h4 className={`font-bold text-${color}-800 text-sm`}>{title}</h4>
      </div>
    </div>
  );

  const Arrow = ({ direction = 'right', label = '' }) => (
    <div className="flex items-center justify-center">
      {direction === 'right' && (
        <div className="flex items-center">
          <div className="h-0.5 bg-gray-600 w-8"></div>
          <ArrowRight className="text-gray-600" size={16} />
          {label && <span className="ml-2 text-xs text-gray-600">{label}</span>}
        </div>
      )}
      {direction === 'down' && (
        <div className="flex flex-col items-center">
          <div className="w-0.5 bg-gray-600 h-8"></div>
          <ArrowDown className="text-gray-600" size={16} />
          {label && <span className="mt-2 text-xs text-gray-600">{label}</span>}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🏗️ LLM System Architecture
        </h1>
        <p className="text-lg text-gray-600">
          End-to-end system component relationships
        </p>
      </div>

      {/* Architecture Diagram */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        
        {/* Client Layer */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-4 text-center">CLIENT LAYER</h2>
          <div className="flex justify-center">
            <ClientBox 
              onClick={() => setSelectedComponent('client')} 
              selected={selectedComponent === 'client'}
            />
          </div>
        </div>

        {/* Arrow down */}
        <div className="flex justify-center mb-8">
          <Arrow direction="down" label="HTTPS/REST API" />
        </div>

        {/* API Gateway */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-4 text-center">API LAYER</h2>
          <div className="flex justify-center">
            <ServiceBox 
              title="API Gateway"
              icon={Server}
              color="purple"
              bgColor="bg-purple-100"
              onClick={() => setSelectedComponent('api')}
              selected={selectedComponent === 'api'}
            />
          </div>
        </div>

        {/* Arrow down */}
        <div className="flex justify-center mb-8">
          <Arrow direction="down" label="Internal API" />
        </div>

        {/* Processing Layer */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-4 text-center">PROCESSING LAYER</h2>
          <div className="grid grid-cols-3 gap-4 items-center">
            <ServiceBox 
              title="Preprocessing"
              icon={Zap}
              color="green"
              bgColor="bg-green-100"
              onClick={() => setSelectedComponent('preprocessing')}
              selected={selectedComponent === 'preprocessing'}
            />
            
            <div className="flex justify-center">
              <Arrow direction="right" />
            </div>

            <ServiceBox 
              title="Embedding Service"
              icon={Cpu}
              color="orange"
              bgColor="bg-orange-100"
              onClick={() => setSelectedComponent('embedding')}
              selected={selectedComponent === 'embedding'}
            />
          </div>
        </div>

        {/* Arrow down */}
        <div className="flex justify-center mb-8">
          <Arrow direction="down" label="Vector Data" />
        </div>

        {/* Core LLM Layer */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-4 text-center">LLM CORE LAYER</h2>
          <div className="flex justify-center">
            <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6 w-80">
              <div 
                className={`cursor-pointer transition-all hover:shadow-lg ${selectedComponent === 'llm' ? 'ring-4 ring-red-300' : ''}`}
                onClick={() => setSelectedComponent('llm')}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Cpu className="text-red-600" size={32} />
                  <h3 className="font-bold text-red-800 text-lg">LLM Core Engine</h3>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {Array.from({length: 8}, (_, i) => (
                    <div key={i} className="bg-red-200 rounded p-2 text-xs text-center">
                      L{(i + 1) * 10}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-red-700">80+ Neural Layers • 175B+ Parameters</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bidirectional arrow to storage */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <ArrowDown className="text-gray-600" size={16} />
            <span className="mx-2 text-xs text-gray-600">Parameter Access</span>
            <ArrowRight className="text-gray-600 rotate-180" size={16} />
          </div>
        </div>

        {/* Storage Layer */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-4 text-center">STORAGE LAYER</h2>
          <div className="grid grid-cols-2 gap-8">
            <DatabaseBox 
              title="Parameter Store"
              icon={HardDrive}
              color="yellow"
              bgColor="bg-yellow-100"
              onClick={() => setSelectedComponent('memory')}
              selected={selectedComponent === 'memory'}
            />
            
            <DatabaseBox 
              title="Cache Layer"
              icon={Database}
              color="indigo"
              bgColor="bg-indigo-100"
              onClick={() => setSelectedComponent('cache')}
              selected={selectedComponent === 'cache'}
            />
          </div>
        </div>

        {/* Arrow up for response */}
        <div className="flex justify-center mb-8">
          <Arrow direction="down" label="Response Generation" />
        </div>

        {/* Response Layer */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-4 text-center">RESPONSE LAYER</h2>
          <div className="flex justify-center">
            <ServiceBox 
              title="Response Service"
              icon={Server}
              color="emerald"
              bgColor="bg-emerald-100"
              onClick={() => setSelectedComponent('postprocessing')}
              selected={selectedComponent === 'postprocessing'}
            />
          </div>
        </div>

        {/* Final arrow back to client */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center">
            <div className="w-0.5 bg-gray-600 h-8"></div>
            <ArrowRight className="text-gray-600 rotate-90" size={16} />
            <span className="mt-2 text-xs text-gray-600">JSON Response</span>
          </div>
        </div>
      </div>

      {/* Component Details */}
      {selectedComponent && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">
            {componentDetails[selectedComponent].title}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-gray-600 mb-4">{componentDetails[selectedComponent].description}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Key Specifications</h4>
              <pre className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 p-3 rounded">
                {componentDetails[selectedComponent].specs}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Context vs Message Processing */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-bold mb-6">🔍 Context vs Message Processing</h3>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Input Structure */}
          <div className="bg-blue-50 p-4 rounded border">
            <h4 className="font-semibold mb-3">📋 Request Structure</h4>
            <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`POST /api/chat
{
  "message": "Fix TypeScript error...",
  "context": {
    "file": "src/types.ts",
    "codebase": "repository-analyzer",
    "architecture": "parser-pattern"
  },
  "system_prompt": "You are an expert...",
  "conversation_history": [...]
}`}
            </pre>
          </div>

          {/* Token Assembly */}
          <div className="bg-orange-50 p-4 rounded border">
            <h4 className="font-semibold mb-3">🔧 How LLM Sees It</h4>
            <pre className="bg-gray-900 text-yellow-400 p-3 rounded text-sm overflow-x-auto">
{`Single Token Stream:
[SYSTEM] You are an expert...
[CONTEXT] File: src/types.ts
Architecture: parser-pattern
[USER] Fix TypeScript error...
[ASSISTANT]`}
            </pre>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-semibold mb-4">⚙️ Processing Steps</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h5 className="font-medium">API Gateway Parsing</h5>
                <p className="text-sm text-gray-600">Separates JSON fields: message, context, system_prompt, history</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h5 className="font-medium">Context Assembly</h5>
                <p className="text-sm text-gray-600">Preprocessing service combines all parts into single prompt template</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h5 className="font-medium">Tokenization</h5>
                <p className="text-sm text-gray-600">Entire assembled prompt becomes one token stream - LLM sees no distinction</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <h5 className="font-medium">Neural Processing</h5>
                <p className="text-sm text-gray-600">Attention mechanism weights all tokens equally - no "context" vs "question" distinction</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Examples */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-bold mb-6">📝 Prompt Template Assembly</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">🏗️ How Context Gets Assembled</h4>
            <div className="bg-gray-900 text-gray-300 p-4 rounded-lg text-sm overflow-x-auto">
              <pre>{`// Preprocessing Service Logic (TypeScript)
interface ChatRequest {
  message: string;
  context?: {
    file?: string;
    codebase?: string;
    architecture?: string;
    [key: string]: any;
  };
  system_prompt?: string;
  history?: ConversationTurn[];
}

interface ConversationTurn {
  user: string;
  assistant: string;
  timestamp?: string;
}

interface AssembledPrompt {
  prompt: string;
  tokenCount: number;
  hasContext: boolean;
}

class PromptAssemblyService {
  private readonly MAX_CONTEXT_LENGTH = 3000;
  
  public assemblePrompt(request: ChatRequest): AssembledPrompt {
    let prompt = "";
    let tokenCount = 0;
    
    // 1. System Prompt (if provided)
    if (request.system_prompt) {
      prompt += request.system_prompt + "\\n\\n";
      tokenCount += this.estimateTokens(request.system_prompt);
    }
    
    // 2. Context Information (structured)
    if (request.context) {
      prompt += "Context:\\n";
      
      if (request.context.file) {
        prompt += \`File: \${request.context.file}\\n\`;
      }
      
      if (request.context.architecture) {
        prompt += \`Architecture: \${request.context.architecture}\\n\`;
      }
      
      if (request.context.codebase) {
        prompt += \`Codebase: \${request.context.codebase}\\n\`;
      }
      
      // Add any additional context fields
      Object.entries(request.context).forEach(([key, value]) => {
        if (!['file', 'architecture', 'codebase'].includes(key)) {
          prompt += \`\${key}: \${value}\\n\`;
        }
      });
      
      prompt += "\\n";
      tokenCount += this.estimateTokens(prompt);
    }
    
    // 3. Conversation History (if any)
    if (request.history && request.history.length > 0) {
      const historyPrompt = this.assembleHistory(request.history);
      prompt += historyPrompt;
      tokenCount += this.estimateTokens(historyPrompt);
    }
    
    // 4. Current User Message
    prompt += \`User: \${request.message}\\n\`;
    prompt += "Assistant: ";
    tokenCount += this.estimateTokens(request.message);
    
    // 5. Validate context length
    if (tokenCount > this.MAX_CONTEXT_LENGTH) {
      throw new Error(\`Context too long: \${tokenCount} tokens exceeds limit of \${this.MAX_CONTEXT_LENGTH}\`);
    }
    
    return {
      prompt,
      tokenCount,
      hasContext: !!request.context
    };
  }
  
  private assembleHistory(history: ConversationTurn[]): string {
    return history
      .map(turn => \`User: \${turn.user}\\nAssistant: \${turn.assistant}\\n\\n\`)
      .join('');
  }
  
  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}

// Usage Example
const promptService = new PromptAssemblyService();

const request: ChatRequest = {
  message: "Fix TypeScript error 'Property embeddingChunks does not exist on type ParseResult'",
  context: {
    file: "src/types.ts",
    codebase: "repository-analyzer", 
    architecture: "parser-pattern"
  },
  system_prompt: "You are an expert TypeScript developer and code analyst."
};

const assembled: AssembledPrompt = promptService.assemblePrompt(request);
console.log(assembled.prompt);`}</pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">📤 Final Assembled Prompt</h4>
            <div className="bg-blue-50 p-4 rounded border">
              <pre className="text-sm">{`You are an expert TypeScript developer and code analyst.

Context:
File: src/types.ts
Architecture: parser-pattern
Codebase: repository-analyzer

User: Fix TypeScript error 'Property embeddingChunks does not exist on type ParseResult' in repository analyzer tool. Architecture: BaseParser -> TypeScriptParser -> ParseResult interface. Need to add vector embedding support following existing optional property pattern like interfaces?, typeAliases?
Assistant:`}</pre>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded border">
            <h4 className="font-semibold mb-2">🔑 Key Insight</h4>
            <p className="text-sm text-gray-700">
              <strong>The LLM doesn't distinguish between "context" and "question"</strong> - it sees one continuous token stream. 
              The preprocessing service is responsible for organizing the information in a way that maximizes attention weights 
              on the most relevant parts.
            </p>
          </div>
        </div>
      </div>

      {/* Use Case Data Flow */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-bold mb-6">🔬 Use Case: Data Flow Examples</h3>
        
        {/* Context Comparison Tabs */}
        <div className="mb-6">
          <div className="flex border-b">
            <button 
              className={`px-4 py-2 font-medium ${selectedUseCase === 'weak' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-500'}`}
              onClick={() => setSelectedUseCase('weak')}
            >
              ❌ Weak Context
            </button>
            <button 
              className={`px-4 py-2 font-medium ${selectedUseCase === 'good' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500'}`}
              onClick={() => setSelectedUseCase('good')}
            >
              ✅ Good Context
            </button>
            <button 
              className={`px-4 py-2 font-medium ${selectedUseCase === 'overload' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-500'}`}
              onClick={() => setSelectedUseCase('overload')}
            >
              ⚠️ Context Overload
            </button>
          </div>
        </div>

        {/* Use Case Content */}
        {useCases[selectedUseCase] && (
          <div className="space-y-6">
            {/* Input Code */}
            <div>
              <h4 className="font-semibold mb-2">📤 Client Request</h4>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{useCases[selectedUseCase].clientRequest}
              </pre>
            </div>

            {/* Processing Steps */}
            <div>
              <h4 className="font-semibold mb-2">⚙️ System Processing</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Tokenization */}
                <div className="bg-green-50 p-4 rounded border">
                  <h5 className="font-medium mb-2">🔪 Tokenization Output</h5>
                  <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
{useCases[selectedUseCase].tokenization}
                  </pre>
                </div>

                {/* Attention Weights */}
                <div className="bg-red-50 p-4 rounded border">
                  <h5 className="font-medium mb-2">🎯 Attention Weights</h5>
                  <div className="space-y-2">
                    {useCases[selectedUseCase].attention.map((item: any, idx: any) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-sm">{item.token}</span>
                        <div className="flex items-center gap-2 w-32">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${item.weight > 0.8 ? 'bg-red-500' : item.weight > 0.5 ? 'bg-yellow-500' : 'bg-gray-400'}`}
                              style={{ width: `${item.weight * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono w-8">{item.weight}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Neural Activation */}
            <div>
              <h4 className="font-semibold mb-2">🧠 Neural Pattern Activation</h4>
              <div className="bg-orange-50 p-4 rounded border">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {useCases[selectedUseCase].patterns.map((pattern: any, idx: any) => (
                    <div key={idx} className="bg-white p-3 rounded border">
                      <div className="text-sm font-medium mb-1">{pattern.name}</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${pattern.activation > 0.8 ? 'bg-green-500' : pattern.activation > 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${pattern.activation * 100}%` }}
                          />
                        </div>
                        <span className="text-xs">{Math.round(pattern.activation * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Response */}
            <div>
              <h4 className="font-semibold mb-2">📤 System Response</h4>
              <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
{useCases[selectedUseCase].response}
              </pre>
            </div>

            {/* Analysis */}
            <div className={`p-4 rounded-lg border-2 ${useCases[selectedUseCase].analysisColor}`}>
              <h4 className="font-semibold mb-2">📊 Analysis</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Activation Strength:</span>
                  <div className="mt-1">{useCases[selectedUseCase].analysis.activation}</div>
                </div>
                <div>
                  <span className="font-medium">Solution Quality:</span>
                  <div className="mt-1">{useCases[selectedUseCase].analysis.quality}</div>
                </div>
                <div>
                  <span className="font-medium">Engineering Value:</span>
                  <div className="mt-1">{useCases[selectedUseCase].analysis.value}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Flow Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">📊 Data Flow Summary</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Request Flow</h4>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Client sends text request</li>
              <li>2. API Gateway validates & routes</li>
              <li>3. Preprocessing tokenizes input</li>
              <li>4. Embedding converts to vectors</li>
              <li>5. LLM Core processes with neural layers</li>
              <li>6. Parameter Store provides model weights</li>
              <li>7. Response Service formats output</li>
              <li>8. Client receives structured response</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Key Architecture Notes</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• No external knowledge database required</li>
              <li>• All intelligence stored in neural parameters</li>
              <li>• Context engineering happens at preprocessing</li>
              <li>• Caching improves performance significantly</li>
              <li>• Each component is independently scalable</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LLMSystemArchitecture;