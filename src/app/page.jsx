"use client";
import React from "react";

function MainComponent() {
  const [conversation, setConversation] = React.useState([]);
  const [message, setMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const sendMessage = async () => {
    if (!message.trim()) return;
    const newMessage = { role: "user", content: message };
    setConversation([...conversation, newMessage]);
    setMessage("");
    setIsLoading(true);
    const isImageRequest = message
      .trim()
      .toLowerCase()
      .startsWith("find images of ");
    if (isImageRequest) {
      const query = message.slice(15).trim();
      const response = await fetch(
        `/integrations/image-search/imagesearch?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setIsLoading(false);
      if (data.status === "success") {
        setConversation([
          ...conversation,
          newMessage,
          { role: "system", content: "Images found:", images: data.items },
        ]);
      } else {
        setConversation([
          ...conversation,
          newMessage,
          { role: "assistant", content: "Sorry, no images found." },
        ]);
      }
    } else {
      const response = await fetch("/integrations/chat-gpt/conversationgpt4", {
        method: "POST",
        body: JSON.stringify({
          messages: conversation.concat(newMessage),
          system_prompt: message,
        }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setIsLoading(false);
      if (data.status) {
        setConversation([
          ...conversation,
          newMessage,
          { role: "assistant", content: data.result },
        ]);
      }
    }
  };
  const handleInputChange = (event) => setMessage(event.target.value);
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-[#f0f0f0] p-4 md:p-8">
      <div className="bg-white w-full max-w-2xl p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#333] font-roboto">EasyAI</h2>
          <button
            className="bg-[#1877f2] text-white px-4 py-2 rounded-full flex items-center justify-center font-roboto"
            onClick={sendMessage}
          >
            <i className="fas fa-paper-plane"></i>
            <span className="ml-2">Send</span>
          </button>
        </div>
        {/* Chat interface */}
        <div className="h-[500px] overflow-y-auto mb-4 bg-gray-100 p-4 rounded">
          {conversation.map((messageItem, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded ${
                messageItem.role === "user"
                  ? "bg-blue-100 self-end"
                  : "bg-green-100"
              }`}
            >
              {messageItem.images ? (
                messageItem.images.map((image, i) => (
                  <img
                    key={i}
                    src={image.thumbnailImageUrl}
                    alt={image.title}
                    width={image.width * 0.1}
                    height={image.height * 0.1}
                  />
                ))
              ) : (
                <p>{messageItem.content}</p>
              )}
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            name="message"
            placeholder="Ask me anything..."
            className="border p-2 rounded-l flex-grow font-roboto"
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button
            className="bg-[#1877f2] text-white px-4 py-2 rounded-r font-roboto"
            onClick={sendMessage}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
        {isLoading && <p className="text-center my-2">Loading...</p>}
      </div>
      <style jsx global>{`
        body {
          font-family: 'Roboto', sans-serif;
        }
      `}</style>
    </div>
  );
}

export default MainComponent;