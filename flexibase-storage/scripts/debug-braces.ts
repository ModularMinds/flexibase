import fs from "fs";

const content = fs.readFileSync("tests/storage.test.ts", "utf-8");
const lines = content.split("\n");

let open = 0;
let close = 0;
const stack: string[] = [];

lines.forEach((line, i) => {
  const trimmed = line.trim();
  if (trimmed.includes("{")) {
    open++;
    stack.push(`Line ${i + 1}: ${trimmed}`);
  }
  if (trimmed.includes("}")) {
    close++;
    // Simple stack pop logic (imperfect but helps)
    // Actually just logging balance
  }
});

console.log(`Total Open: ${open}`);
console.log(`Total Close: ${close}`);
console.log(`Diff: ${open - close}`);

let indent = 0;
lines.forEach((line, i) => {
  const openCount = (line.match(/{/g) || []).length;
  const closeCount = (line.match(/}/g) || []).length;

  indent += openCount - closeCount;

  if (indent < 0) {
    console.log(`Line ${i + 1} causes negative indent!`);
  }
});
console.log(`Final Indent Level: ${indent}`);
