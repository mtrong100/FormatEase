// Initialize variables
let editor = document.getElementById("editor");
let preview = document.getElementById("preview");
let findReplaceVisible = false;

// Theme handling
function changeTheme() {
  const theme = document.getElementById("themeSelector").value;
  localStorage.setItem("selectedTheme", theme);
  applyTheme(theme);
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    document.documentElement.setAttribute("data-bs-theme", "dark");
  } else if (theme === "light") {
    document.body.classList.remove("dark-mode");
    document.documentElement.setAttribute("data-bs-theme", "light");
  } else {
    // System mode
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.body.classList.add("dark-mode");
      document.documentElement.setAttribute("data-bs-theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      document.documentElement.setAttribute("data-bs-theme", "light");
    }
  }
}

// Listen for system theme changes
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    if (document.getElementById("themeSelector").value === "system") {
      if (e.matches) {
        document.body.classList.add("dark-mode");
        document.documentElement.setAttribute("data-bs-theme", "dark");
      } else {
        document.body.classList.remove("dark-mode");
        document.documentElement.setAttribute("data-bs-theme", "light");
      }
    }
  });

// Text formatting functions
function formatText(command) {
  if (
    ["uppercase", "lowercase", "titleCase", "sentenceCase"].includes(command)
  ) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const text = range.toString();

    if (text) {
      let formattedText = "";
      switch (command) {
        case "uppercase":
          formattedText = text.toUpperCase();
          break;
        case "lowercase":
          formattedText = text.toLowerCase();
          break;
        case "titleCase":
          formattedText = text
            .split(" ")
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" ");
          break;
        case "sentenceCase":
          formattedText = text
            .toLowerCase()
            .replace(/(^\w|\.\s+\w)/gm, (letter) => letter.toUpperCase());
          break;
      }
      range.deleteContents();
      range.insertNode(document.createTextNode(formattedText));
    }
  } else {
    document.execCommand(command, false, null);
  }
  updatePreview();
}

function changeFontSize(size) {
  document.execCommand("fontSize", false, size);
  updatePreview();
}

// Find and Replace
function toggleFindReplace() {
  const findReplace = document.getElementById("findReplace");
  findReplaceVisible = !findReplaceVisible;
  findReplace.style.display = findReplaceVisible ? "block" : "none";
}

function findReplace() {
  const findText = document.getElementById("findText").value;
  const replaceText = document.getElementById("replaceText").value;

  if (!findText) {
    alert("Please enter text to find");
    return;
  }

  const content = editor.innerHTML;
  const regex = new RegExp(findText, "gi");
  editor.innerHTML = content.replace(regex, replaceText);
  updatePreview();
}

// Preview and stats
function updatePreview() {
  preview.innerHTML = editor.innerHTML;
  updateStats();
}

function updateStats() {
  const text = editor.innerText;
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  document.getElementById("wordCount").textContent = words.length;
  document.getElementById("charCount").textContent = text.length;
}

// Clipboard operations
function copyToClipboard() {
  const text = editor.innerText;
  navigator.clipboard
    .writeText(text)
    .then(() => {
      showToast("Text copied to clipboard!");
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
      showToast("Failed to copy text", "error");
    });
}

// Toast notification
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-white bg-${
    type === "success" ? "success" : "danger"
  } border-0`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");

  toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

  document.body.appendChild(toast);
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();

  toast.addEventListener("hidden.bs.toast", () => {
    toast.remove();
  });
}

// Export functions
function exportAsTXT() {
  const text = editor.innerText;
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "formatted-text.txt";
  a.click();
  URL.revokeObjectURL(url);
}

function exportAsPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const text = editor.innerText;
  const splitText = doc.splitTextToSize(text, 180);
  doc.text(splitText, 10, 10);
  doc.save("formatted-text.pdf");
}

function exportAsDOCX() {
  // Note: This is a simplified version. For full DOCX support, you'd need a more robust library
  const text = editor.innerText;
  const blob = new Blob([text], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "formatted-text.docx";
  a.click();
  URL.revokeObjectURL(url);
}

function printText() {
  window.print();
}

function clearText() {
  if (confirm("Are you sure you want to clear all text?")) {
    editor.innerHTML = "";
    updatePreview();
    showToast("Text cleared");
  }
}

// Event listeners
editor.addEventListener("input", updatePreview);
editor.addEventListener("keyup", updateStats);

// Handle paste events to strip formatting
editor.addEventListener("paste", function (e) {
  e.preventDefault();
  const text = e.clipboardData.getData("text/plain");
  document.execCommand("insertText", false, text);
});

// Initialize theme
window.onload = () => {
  const savedTheme = localStorage.getItem("selectedTheme") || "system";
  document.getElementById("themeSelector").value = savedTheme;
  applyTheme(savedTheme);
};
