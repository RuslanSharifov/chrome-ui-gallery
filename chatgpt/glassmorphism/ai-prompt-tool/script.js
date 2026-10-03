const promptInput = document.querySelector("#prompt");
const runButton = document.querySelector("#run");
const status = document.querySelector("#status");
const result = document.querySelector("#result");

runButton.addEventListener("click", () => {
  const prompt = promptInput.value.trim();

  if (!prompt) {
    status.textContent = "Enter a prompt";
    promptInput.focus();
    result.hidden = true;
    return;
  }

  status.textContent = "Ready to connect";
  result.hidden = false;
  result.textContent =
    "Tool input captured. Connect your ChatGPT/API workflow here.\\n\\nPrompt:\\n" + prompt;
});
