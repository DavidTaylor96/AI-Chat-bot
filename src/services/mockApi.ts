import { Message } from '../store/chatStore';

// Sample code blocks for different languages
const sampleCodeBlocks = {
  javascript: `function calculateFactorial(n) {
  if (n === 0 || n === 1) {
    return 1;
  }
  return n * calculateFactorial(n - 1);
}

// Example usage
const result = calculateFactorial(5);
console.log(result); // 120`,

  python: `def fibonacci(n):
    """Generate the Fibonacci sequence up to the nth term."""
    sequence = [0, 1]
    while len(sequence) < n:
        next_value = sequence[-1] + sequence[-2]
        sequence.append(next_value)
    return sequence

# Example usage
fib_sequence = fibonacci(10)
print(fib_sequence)  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]`,

  typescript: `interface Person {
  name: string;
  age: number;
  email?: string;
}

class Employee implements Person {
  constructor(
    public name: string,
    public age: number,
    public employeeId: string,
    public email?: string
  ) {}

  getDetails(): string {
    return \`\${this.name} (ID: \${this.employeeId})\`;
  }
}

// Example usage
const employee = new Employee("Jane Doe", 30, "EMP12345");
console.log(employee.getDetails());`,

  react: `import React, { useState, useEffect } from 'react';

function DataFetchingComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.example.com/data');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>Data:</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default DataFetchingComponent;`,

  java: `import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class StreamExample {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();
        names.add("Alice");
        names.add("Bob");
        names.add("Charlie");
        names.add("David");
        
        // Filter names starting with 'A' or 'B'
        List<String> filteredNames = names.stream()
            .filter(name -> name.startsWith("A") || name.startsWith("B"))
            .map(String::toUpperCase)
            .sorted()
            .collect(Collectors.toList());
            
        System.out.println(filteredNames);  // [ALICE, BOB]
    }
}`
};

// This is a fallback mock implementation when the actual API is unavailable
export const sendMockMessage = async (messages: Message[]) => {
  console.log('Using mock API service as fallback');
  
  // Get the last user message
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
  
  if (!lastUserMessage) {
    return {
      id: 'mock-response-' + Date.now(),
      content: "I didn't receive a message to respond to.",
      model: 'Taylor-mock',
      role: 'assistant',
      type: 'message'
    };
  }
  
  // Simple mock responses based on user input
  const userMessage = lastUserMessage.content.toLowerCase();
  let response = '';
  
  // Check for code-related queries
  if (userMessage.includes('javascript') || userMessage.includes('js') || userMessage.includes('function')) {
    response = `Here's an example of a recursive factorial function in JavaScript:

\`\`\`javascript
${sampleCodeBlocks.javascript}
\`\`\`

This function uses recursion to calculate the factorial of a number. The base case is when n is 0 or 1, which returns 1. For all other cases, it multiplies n by the factorial of (n-1).`;
  } 
  else if (userMessage.includes('python') || userMessage.includes('fibonacci')) {
    response = `Here's a Python function that generates the Fibonacci sequence:

\`\`\`python
${sampleCodeBlocks.python}
\`\`\`

This function builds the Fibonacci sequence iteratively by adding the last two numbers to generate the next one.`;
  } 
  else if (userMessage.includes('typescript') || userMessage.includes('interface') || userMessage.includes('class')) {
    response = `Here's a TypeScript example that demonstrates interfaces and classes:

\`\`\`typescript
${sampleCodeBlocks.typescript}
\`\`\`

This code shows how to define an interface and implement it in a class with TypeScript.`;
  } 
  else if (userMessage.includes('react') || userMessage.includes('component') || userMessage.includes('hook')) {
    response = `Here's a React functional component with hooks for data fetching:

\`\`\`jsx
${sampleCodeBlocks.react}
\`\`\`

This component demonstrates how to fetch data with useEffect and manage loading/error states.

I can also provide this as a downloadable file:

[DataFetchingComponent.jsx](attachment)
\`\`\`jsx
${sampleCodeBlocks.react}
\`\`\``;
  } 
  else if (userMessage.includes('java') || userMessage.includes('stream')) {
    response = `Here's a Java example using streams to filter and transform a list:

\`\`\`java
${sampleCodeBlocks.java}
\`\`\`

This demonstrates Java's Stream API for functional-style operations on collections.`;
  }
  else if (userMessage.includes('hello') || userMessage.includes('hi ')) {
    response = "Hello! I'm Taylor (mock mode). How can I assist you today? I'm particularly good at helping with code examples and software engineering questions.";
  } 
  else if (userMessage.includes('help')) {
    response = `I can help with various software engineering tasks! You can ask me about:

1. Code examples in different languages
2. Explanation of programming concepts
3. Debugging help
4. Best practices and design patterns
5. Algorithm implementations

What would you like help with today?`;
  } 
  else if (userMessage.includes('example') || userMessage.includes('code')) {
    const languages = ["javascript", "python", "typescript", "react", "java"];
    const randomLang = languages[Math.floor(Math.random() * languages.length)];
    const displayName = randomLang.charAt(0).toUpperCase() + randomLang.slice(1);
    
    response = `Here's a ${displayName} code example:

\`\`\`${randomLang}
${sampleCodeBlocks[randomLang as keyof typeof sampleCodeBlocks]}
\`\`\`

Would you like me to explain how this code works?`;
  } 
  else if (userMessage.includes('thanks') || userMessage.includes('thank you')) {
    response = "You're welcome! Feel free to ask if you need any other code examples or programming help.";
  } 
  else {
    response = `I'm currently running in mock mode due to API connection issues. 

In this mode, I can provide pre-programmed responses, particularly around code examples. Try asking me for examples in:
- JavaScript
- Python 
- TypeScript
- React
- Java

Or you can just say "Show me a code example" and I'll provide a random one.`;
  }
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    id: 'mock-response-' + Date.now(),
    content: response,
    model: 'Taylor-mock',
    role: 'assistant',
    type: 'message'
  };
};