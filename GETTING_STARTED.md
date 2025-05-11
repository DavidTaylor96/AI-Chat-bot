# Getting Started with Claude Desktop

Claude Desktop is designed for software engineers and developers who want to use Claude's AI capabilities within a desktop environment. This guide will help you get started with the application.

## Installation

### Prerequisites
- Node.js (v14+)
- npm (v6+)

### Quick Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/claude-desktop.git
cd claude-desktop
```

2. Install dependencies
```bash
npm install
```

3. Run the application
```bash
./run_claude.sh
```

## Configuration

### API Key

To use the real Claude API (instead of mock mode), you'll need to set up your API key:

1. Create a `.env` file in the root directory (copy from `.env.example`)
2. Add your Claude API key from [console.anthropic.com](https://console.anthropic.com)
```
REACT_APP_CLAUDE_API_KEY=sk-ant-api03-your-key-here
```

### Mock Mode

If you don't have an API key or want to test the application without making API calls, you can use mock mode:

- The application automatically uses mock mode when no API key is provided
- You can force mock mode by setting `REACT_APP_DEBUG_USE_MOCK=true` in your `.env` file
- Mock mode provides pre-programmed responses with code examples in various languages

## Usage

### Chat Interface

The application provides a chat interface similar to Claude's web interface:

- Enter your message in the input box at the bottom
- Press Enter to send the message
- View responses in the conversation thread

### Working with Code

Claude Desktop has special features for software engineers:

1. **Viewing Code**:
   - Code blocks are automatically syntax highlighted
   - Line numbers are displayed for reference
   - Language is detected and displayed in the header

2. **Copying Code**:
   - Click the copy button in the top right of any code block
   - The code will be copied to your clipboard without the need to select text

3. **Downloading Code**:
   - For code blocks marked as attachments, use the download button
   - The file will be saved with the specified filename

4. **Code Examples**:
   - In mock mode, try asking for examples in specific languages:
     - "Show me a JavaScript example"
     - "Can you provide a Python function?"
     - "Give me an example of TypeScript interfaces"

### Session Management

- Multiple chat sessions are supported
- Use the sidebar to switch between conversations
- Create new conversations with the "+ New chat" button
- Sessions are stored locally and persist between app restarts

## Building for Distribution

To create a distributable version of the application:

```bash
./build_app.sh
```

This creates packages for your platform in the `dist/` directory.

## Troubleshooting

### API Connection Issues

If you're having trouble connecting to the Claude API:

1. Verify your API key is correct
2. Check that your internet connection is working
3. Ensure you're not hitting rate limits or usage quotas

### Application Issues

If the application isn't working correctly:

1. Check the console output for errors
2. Make sure you have the latest version of Node.js
3. Try running `npm install` to ensure all dependencies are installed
4. Delete the `node_modules` folder and run `npm install` again if needed

## Support

If you encounter issues or have questions, please open an issue on GitHub.