import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [client, setClient] = useState(null);

  useEffect(() => {
    const stompClient = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/chat"),
      reconnectDelay: 5000,

      onConnect: () => {
        console.log("✅ Connected");

        stompClient.subscribe("/topic/messages", (msg) => {
          const message = JSON.parse(msg.body);
          setMessages((prev) => [...prev, message]);
        });
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => stompClient.deactivate();
  }, []);

  // ✅ THIS IS sendMessage (DO NOT REMOVE)
  const sendMessage = () => {
    if (!client || !client.connected) {
      alert("Not connected to server ❌");
      return;
    }

    if (input.trim() !== "") {
      client.publish({
        destination: "/app/sendMessage",
        body: JSON.stringify({
          sender: "User",
          content: input,
        }),
      });
      setInput("");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>💬 Real-Time Chat</h2>

      <h4>
        {client && client.connected ? "🟢 Connected" : "🔴 Connecting..."}
      </h4>

      <div
        style={{
          height: "300px",
          border: "1px solid black",
          overflowY: "scroll",
          marginBottom: "10px",
          padding: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <p key={index}>
            <b>{msg.sender}:</b> {msg.content}
          </p>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type message..."
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default Chat;