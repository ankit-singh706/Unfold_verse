import React, { useState } from 'react';
import './App.css';
import Scene from './components/Scene';
import { Model } from './assets/Model';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [is3dLoading, setIs3dLoading] = useState(false);
  const [dimensionalData,setDimensionalData] = useState(null)

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = { sender: 'user', text: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setIs3dLoading(true);


    try {
      const response = await fetch('https://dev.beyondnetwork.xyz/api/images/generate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': `a1b3c5d7-7890-0987-e9f1-3d5b7c9e1a3b`,
        },
        body: JSON.stringify(
          {
            prompt: userInput,
            model: "black-forest-labs/FLUX.1-schnell", // optional
            options: {
              "steps": 4 // optional, default: 4
            }
          }

        ),

      });

      const data = await response.json();

      if (data.choices && data.choices.length > 0) {
        const botMessage = {
          sender: 'bot',
          text: data.choices[0].message.content,
        };
        setMessages((prev) => [...prev, botMessage]);
      }
      else {
        const botMessage = {
          sender: 'bot',
          text: data.url,
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error communicating with ChatGPT:', error);
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Sorry, something went wrong. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const call3DConvertor = async () => {
    if (messages[1].text == "") return;
  
    const prompt3DPayload = "https://dev.beyondnetwork.xyz" + messages[1].text;
    console.log(prompt3DPayload)
  
    const converted3DMessage = {
      sender: 'user',
      imgUrl: `https://dev.beyondnetwork.xyz${messages[1].text}`,
    };
    setMessages((prev) => [...prev, converted3DMessage]);
    setUserInput('');
    setIs3dLoading(true);
    console.log(messages);
  
    try {
      // First API call
      const response = await fetch('https://api.meshy.ai/v1/image-to-3d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer msy_JREsaGoLYaENGyobzlKc6p6fYOpMeknPWjTX`,
        },
        body: JSON.stringify({
          image_url: prompt3DPayload,
          enable_pbr: true,
        }),
      });
  
      const data = await response.json();
      console.log(data);
  
      if (data.result) {
        const jobId = data.result; // Assuming result contains a job ID for the next API call.
  
        // Polling function for the second API
        const checkConversionStatus = async () => {
          try {
            const statusResponse = await fetch(`https://api.meshy.ai/v1/image-to-3d/${jobId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer msy_JREsaGoLYaENGyobzlKc6p6fYOpMeknPWjTX`,
              },
            });
  
            const statusData = await statusResponse.json();
            console.log(statusData);
  
            if (statusData.status === 'SUCCEEDED') {
              setMessages((prev) => [...prev, { sender: 'bot', text: '3D conversion completed successfully!' }]);
              setDimensionalData(statusData)
              Scene();
            } else if (statusData.status === 'IN_PROGRESS') {
              // Retry after a delay
              setTimeout(checkConversionStatus, 10000);
            } else {
              // Handle failure or unexpected status
              setMessages((prev) => [...prev, { sender: 'bot', text: '3D conversion failed. Please try again later.' }]);
            }
          } catch (error) {
            console.error('Error checking conversion status:', error);
            setMessages((prev) => [...prev, { sender: 'bot', text: 'Error checking conversion status. Please try again later.' }]);
          }
        };
  
        // console.log("tEST",statusData);
        // Start polling
        checkConversionStatus();
      } else {
        setMessages((prev) => [...prev, { sender: 'bot', text: 'Invalid response from the server. Please try again later.' }]);
      }
    } catch (error) {
      console.error('Error communicating with ChatGPT:', error);
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Sorry, something went wrong. Please try again later.' }]);
    } finally {
      setIs3dLoading(false);
    }
  };

  return (
    <div className="app">
      <Model/>
      <div className="chat-window">
        <div className="messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
            >
              {msg?.text?.includes("images") ? <img className="outputImg" src={"https://dev.beyondnetwork.xyz" + msg.text} /> : msg.text}
            </div>
          ))}
          {isLoading && <div className="loading">Typing...</div>}
          {is3dLoading && <div className="loading">Generating 3D model...</div>}
        </div>
        <div className="input-area">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message here..."
          />
          <button onClick={sendMessage} disabled={isLoading}>
            Send
          </button>
          <button onClick={call3DConvertor}>
            Generate 3D Model
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
