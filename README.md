# Taylor Desktop

A desktop application that replicates the Taylor chat interface.

## Features

- Clean, responsive UI matching Taylor's web interface
- Persistent chat history with Zustand
- Multiple chat sessions management
- Real-time API integration with Taylor API
- Mock mode for testing without an API key

## Setup

### Prerequisites

- Node.js (v14+)
- npm (v6+)

### Environment Variables

Create a `.env` file in the root directory with your Taylor API key:

```
REACT_APP_Taylor_API_KEY=your_api_key_here

# Set this to true to force using the mock API for testing
# REACT_APP_DEBUG_USE_MOCK=true
```

The application will automatically run in mock mode if:
- No API key is provided
- The `REACT_APP_DEBUG_USE_MOCK` is set to `true`
- The API connection fails for any reason

### Running the Application

For a quick start, simply run:

```bash
./run_Taylor.sh
```

This script will:
1. Set up the environment if needed
2. Start the React development server
3. Launch the Electron application

### Development Setup

1. Install dependencies:
```bash
npm install
```

2. Run the React development server:
```bash
npm run start-react
```

3. In a separate terminal, run the Electron app:
```bash
npm run start-electron
```

## Building the Application

To build the application for distribution:

```bash
# Build the React app
npm run build

# Package for desktop
npm run package
```

This will generate installers in the `dist` folder for your platform.

## Technologies Used

- React with TypeScript for the frontend
- Electron for desktop integration
- Tailwind CSS for styling
- Zustand for state management
- Taylor API for AI conversations

## Developer-Focused Features

Taylor Desktop includes special features for software engineers:

- **Code Syntax Highlighting**: Automatic language detection and syntax highlighting
- **Copyable Code**: One-click copy button on all code blocks
- **Code Attachments**: Downloadable code files in response messages
- **Language Support**: Highlighting for JavaScript, TypeScript, Python, Java, Go, Rust, C/C++, C#, HTML, CSS, JSON, and more
- **Markdown Formatting**: Full markdown support for documentation and explanations

### How Code Blocks Work

The application provides special handling for code, making it easy to work with programming-related content:

1. **Regular Code Blocks**: Code fenced with triple backticks is automatically highlighted:
   ```
   ```python
   def hello():
       print("Hello, world!")
   ```
   ```

2. **Code Attachments**: Code can be presented as downloadable files:
   ```
   [filename.js](attachment)
   ```javascript
   function example() {
     console.log("This code can be downloaded as a file");
   }
   ```
   ```

3. **Interactive Code UI**:
   - Copy button to easily copy code to clipboard
   - Language identifier in the header
   - Line numbers for easier reference
   - Expandable/collapsible code blocks for long snippets

## License

MIT