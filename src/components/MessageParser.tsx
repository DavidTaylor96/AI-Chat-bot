import React, { ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';
import CodeAttachment from './CodeAttachment';
import TextAttachment from './TextAttachment';
import ImageAttachment from './ImageAttachment';
import MermaidDiagram from './MermaidDiagram';

interface MessageParserProps {
  content: string;
}

// Regular expression to match code blocks with language specification
// Matches ```language\ncode``` or ```\ncode``` (language optional)
const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

// Regular expression to match file attachments
// Format: [filename.ext](attachment)\n```language\ncode```
const attachmentRegex = /\[([^\]]+)\]\(attachment\)\n```(\w+)?\n([\s\S]*?)```/g;

// Regular expression to match text attachments
// Format: [filename.txt](text-attachment)\n```text\ncontent```
const textAttachmentRegex = /\[([^\]]+)\]\(text-attachment\)\n```(\w+)?\n([\s\S]*?)```/g;

// Regular expression to match image attachments
// Format: [filename.jpg](image-attachment:width:height)\n```image\nbase64data```
const imageAttachmentRegex = /\[([^\]]+)\]\(image-attachment:(\d+):(\d+)\)\n```image\n([\s\S]*?)```/g;

// Regular expression to match mermaid diagrams
// Format: ```mermaid\ndiagram code```
const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;

const MessageParser: React.FC<MessageParserProps> = ({ content }) => {
  if (!content) return null;

  // Find all code attachment blocks in the content
  const codeAttachments: Array<{
    fullMatch: string;
    filename: string;
    language: string;
    code: string;
    index: number;
  }> = [];

  let codeAttachmentMatch;
  while ((codeAttachmentMatch = attachmentRegex.exec(content)) !== null) {
    codeAttachments.push({
      fullMatch: codeAttachmentMatch[0],
      filename: codeAttachmentMatch[1],
      language: codeAttachmentMatch[2] || 'text',
      code: codeAttachmentMatch[3],
      index: codeAttachmentMatch.index
    });
  }

  // Find all text attachment blocks in the content
  const textAttachments: Array<{
    fullMatch: string;
    filename: string;
    text: string;
    index: number;
  }> = [];

  let textAttachmentMatch;
  while ((textAttachmentMatch = textAttachmentRegex.exec(content)) !== null) {
    textAttachments.push({
      fullMatch: textAttachmentMatch[0],
      filename: textAttachmentMatch[1],
      text: textAttachmentMatch[3],
      index: textAttachmentMatch.index
    });
  }

  // Find all image attachment blocks in the content
  const imageAttachments: Array<{
    fullMatch: string;
    filename: string;
    width: number;
    height: number;
    dataUrl: string;
    index: number;
  }> = [];

  let imageAttachmentMatch;
  while ((imageAttachmentMatch = imageAttachmentRegex.exec(content)) !== null) {
    imageAttachments.push({
      fullMatch: imageAttachmentMatch[0],
      filename: imageAttachmentMatch[1],
      width: parseInt(imageAttachmentMatch[2], 10),
      height: parseInt(imageAttachmentMatch[3], 10),
      dataUrl: imageAttachmentMatch[4],
      index: imageAttachmentMatch.index
    });
  }

  // Find all mermaid diagram blocks
  const mermaidDiagrams: Array<{
    fullMatch: string;
    code: string;
    index: number;
  }> = [];

  let mermaidMatch;
  while ((mermaidMatch = mermaidRegex.exec(content)) !== null) {
    mermaidDiagrams.push({
      fullMatch: mermaidMatch[0],
      code: mermaidMatch[1],
      index: mermaidMatch.index
    });
  }

  // Get the content with all attachments removed
  let contentWithoutAttachments = content;
  for (const attachment of [...codeAttachments, ...textAttachments, ...imageAttachments]) {
    contentWithoutAttachments = contentWithoutAttachments.replace(attachment.fullMatch, '');
  }

  // Also remove mermaid diagrams
  for (const diagram of mermaidDiagrams) {
    contentWithoutAttachments = contentWithoutAttachments.replace(diagram.fullMatch, '');
  }

  // Find all regular code blocks in the remaining content
  const codeBlocks: Array<{
    fullMatch: string;
    language: string;
    code: string;
    index: number;
  }> = [];

  let match;
  while ((match = codeBlockRegex.exec(contentWithoutAttachments)) !== null) {
    codeBlocks.push({
      fullMatch: match[0],
      language: match[1] || 'text',
      code: match[2],
      index: match.index
    });
  }

  // If no code blocks or attachments, just return the content as markdown
  if (codeBlocks.length === 0 &&
      codeAttachments.length === 0 &&
      textAttachments.length === 0 &&
      imageAttachments.length === 0 &&
      mermaidDiagrams.length === 0) {
    return (
      <div className="whitespace-pre-wrap break-words max-w-full text-gray-800">
         {content}
      </div>
    );
  }

  // If we only have attachments, render them with the remaining text
  if (codeBlocks.length === 0 &&
      (codeAttachments.length > 0 || textAttachments.length > 0 ||
       imageAttachments.length > 0 || mermaidDiagrams.length > 0)) {
    return (
      <div className="whitespace-pre-wrap break-words max-w-full text-gray-800">
         {contentWithoutAttachments}
        {codeAttachments.map((attachment, i) => (
          <CodeAttachment
            key={`code-attachment-${i}`}
            code={attachment.code}
            language={attachment.language}
            filename={attachment.filename}
          />
        ))}
        {textAttachments.map((attachment, i) => (
          <TextAttachment
            key={`text-attachment-${i}`}
            text={attachment.text}
            filename={attachment.filename}
          />
        ))}
        {imageAttachments.map((attachment, i) => (
          <ImageAttachment
            key={`image-attachment-${i}`}
            src={attachment.dataUrl}
            filename={attachment.filename}
            width={attachment.width}
            height={attachment.height}
          />
        ))}
        {mermaidDiagrams.map((diagram, i) => (
          <MermaidDiagram
            key={`mermaid-diagram-${i}`}
            code={diagram.code}
            filename={`diagram-${i + 1}.md`}
          />
        ))}
      </div>
    );
  }

  // Split the content into text and code blocks
  const parts: ReactElement[] = [];
  let lastIndex = 0;

  // Process regular code blocks
  codeBlocks.forEach((block, i) => {
    // Add text before the code block
    if (block.index > lastIndex) {
      const text = contentWithoutAttachments.substring(lastIndex, block.index);
      parts.push(
        <div key={`text-${i}`} className="text-gray-800">
          {text}
        </div>
      );
    }

    // Add the code block
    parts.push(
      <CodeBlock
        key={`code-${i}`}
        code={block.code}
        language={block.language}
      />
    );

    lastIndex = block.index + block.fullMatch.length;
  });

  // Add any remaining text after the last code block
  if (lastIndex < contentWithoutAttachments.length) {
    const text = contentWithoutAttachments.substring(lastIndex);
    parts.push(
      <div key={`text-${codeBlocks.length}`} className="text-gray-800">
        {/* <ReactMarkdown components={markdownComponents}>{text}</ReactMarkdown> */}
        <p>{text}</p>
      </div>
    );
  }

  // Add code attachments at the end
  codeAttachments.forEach((attachment, i) => {
    parts.push(
      <CodeAttachment
        key={`code-attachment-${codeBlocks.length + i}`}
        code={attachment.code}
        language={attachment.language}
        filename={attachment.filename}
      />
    );
  });

  // Add text attachments at the end
  textAttachments.forEach((attachment, i) => {
    parts.push(
      <TextAttachment
        key={`text-attachment-${codeBlocks.length + codeAttachments.length + i}`}
        text={attachment.text}
        filename={attachment.filename}
      />
    );
  });

  // Add image attachments at the end
  imageAttachments.forEach((attachment, i) => {
    parts.push(
      <ImageAttachment
        key={`image-attachment-${codeBlocks.length + codeAttachments.length + textAttachments.length + i}`}
        src={attachment.dataUrl}
        filename={attachment.filename}
        width={attachment.width}
        height={attachment.height}
      />
    );
  });

  // Add mermaid diagrams at the end
  mermaidDiagrams.forEach((diagram, i) => {
    parts.push(
      <MermaidDiagram
        key={`mermaid-diagram-${codeBlocks.length + codeAttachments.length + textAttachments.length + imageAttachments.length + i}`}
        code={diagram.code}
        filename={`diagram-${i + 1}.md`}
      />
    );
  });

  return <div className="whitespace-pre-wrap break-words max-w-full">{parts}</div>;
};

export default MessageParser;