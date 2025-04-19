function toggleChat() {
    const chat = document.getElementById("chatPopup");
    chat.style.display = chat.style.display === "flex" ? "none" : "flex";
  }

  function sendMessage(e) {
    e.preventDefault();
    const input = document.getElementById("userInput");
    const msg = input.value.trim();
    if (!msg) return;

    const chatBox = document.getElementById("chatMessages");

    const userMsg = document.createElement("div");
    userMsg.className = "message user";
    userMsg.textContent = msg;
    chatBox.appendChild(userMsg);

    setTimeout(() => {
      const aiMsg = document.createElement("div");
      aiMsg.className = "message ai";
      aiMsg.textContent = "Thank you for sharing. Let's explore that more together 🌱";
      chatBox.appendChild(aiMsg);
      chatBox.scrollTop = chatBox.scrollHeight;
    }, 600);

    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;
  }