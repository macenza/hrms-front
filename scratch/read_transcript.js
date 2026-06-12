// scratch/read_transcript.js
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logPath = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\7561c297-9fce-433c-8f08-3b96f923600f\\.system_generated\\logs\\transcript.jsonl';

async function processLineByLine() {
  const fileStream = fs.createReadStream(logPath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('browser_subagent') || line.includes('subagent-') || line.includes('subagent_report')) {
      try {
        const obj = JSON.parse(line);
        console.log(`Step ${obj.step_index}: Type: ${obj.type}, Status: ${obj.status}`);
        if (obj.tool_calls) {
          console.log(`  Tool Calls:`, JSON.stringify(obj.tool_calls).slice(0, 500));
        }
        if (obj.content) {
          console.log(`  Content snippet:`, obj.content.slice(0, 500));
        }
      } catch (e) {
      }
    }
  }
}

processLineByLine();
