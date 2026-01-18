import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import "react-quill/dist/quill.snow.css";

const socket = io("http://localhost:5000");

export default function App() {
  const [step, setStep] = useState(1); // 1=username, 2=doc selection, 3=editor
  const [user, setUser] = useState("");
  const [docId, setDocId] = useState("");
  const [content, setContent] = useState("");
  const [documents, setDocuments] = useState(["Doc 1", "Doc 2"]); // example list

  useEffect(() => {
    if (docId) {
      socket.emit("join", docId);
      socket.on("update", setContent);
    }
    return () => socket.off("update");
  }, [docId]);

  const handleChange = (value) => {
    setContent(value);
    socket.emit("edit", { docId, value });
  };

  // Step 1: Username input
  if (step === 1) {
  return (
    <div className="h-screen flex items-center justify-center relative bg-gradient-to-br from-blue-900 to-blue-700 text-white overflow-hidden">
     {/* Animated floating clipboard */}
      <motion.img
        src="/clipboard.png"
        alt="floating clipboard"
        className="absolute top-10 left-5 w-32 opacity-10"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 8 }}
      /> 
   
      {/* Clipboard Background Image */}
      <img
        src="/clipboard.png"
        alt="clipboard background"
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
      />

      {/* Foreground Card */}
      <div className="bg-blue-800 p-10 rounded-2xl shadow-2xl w-96 text-center relative z-10">
        <h1 className="text-4xl font-extrabold mb-4">ShareDraft</h1>
        <p className="mb-6 text-blue-200">Collaborative Document Editor</p>
        <input
          className="w-full p-3 rounded text-black mb-4 text-lg"
          placeholder="Enter your username"
          onChange={(e) => setUser(e.target.value)}
        />
        <button
          onClick={() => user && setStep(2)}
          className="w-full bg-blue-600 py-3 rounded-lg text-lg font-semibold hover:bg-blue-500 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

  // Step 2: Document selection
  if (step === 2) {
    return (
      <div className="h-screen flex items-center justify-center bg-blue-950 text-white">
        <div className="bg-blue-900 p-8 rounded-xl w-96 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Select or Create Document</h2>
          <input
            className="w-full p-2 mb-3 text-black rounded"
            placeholder="Enter document name"
            onChange={(e) => setDocId(e.target.value)}
          />
          <div className="mb-4">
            {documents.map((doc, idx) => (
              <button
                key={idx}
                onClick={() => { setDocId(doc); setStep(3); }}
                className="block w-full bg-blue-600 my-1 py-2 rounded hover:bg-blue-500"
              >
                {doc}
              </button>
            ))}
          </div>
          <button
            onClick={() => docId && setStep(3)}
            className="w-full bg-green-600 py-2 rounded hover:bg-green-500"
          >
            Open Document
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Editor
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-900 to-blue-600">
      <header className="p-4 text-white flex justify-between items-center shadow-lg">
        <div>
          <h1 className="font-bold text-xl">{docId}</h1>
          <p className="text-sm text-blue-200">Editing as {user}</p>
        </div>
      </header>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 bg-white m-4 rounded-xl p-4 shadow-xl">
        <ReactQuill value={content} onChange={handleChange} className="h-full" />
      </motion.div>
    </div>
  );
} 
