import React, { useState, useEffect } from "react";
import { ref, onValue, push, set } from 'firebase/database';
import { database } from "../../firebase/config";

const ChatbotResponses = ({ onSendMessage }) => {
    const [input, setInput] = useState("");
    const [response, setResponse] = useState("");

    useEffect(() => {
        if (input && input.trim() !== "") {
            searchResponseInDatabase(input.trim().toLowerCase());
        }
    }, [input]);    

    const searchResponseInDatabase = (userInput) => {
        const responsesRef = ref(database, 'responses');

        // Consulta para buscar a resposta com a palavra-chave correspondente
        onValue(responsesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Procurar por uma resposta correspondente nas palavras-chave
                const matchingResponse = Object.values(data).find(response => response.keywords.includes(userInput));
                if (matchingResponse) {
                    // Se uma resposta correspondente for encontrada, definir a resposta
                    setResponse(matchingResponse.text);
                } else {
                    // Se não houver uma resposta correspondente, criar uma nova resposta
                    createNewResponse(userInput);
                }
            } else {
                // Se não houver dados no banco de dados, criar uma nova resposta
                createNewResponse(userInput);
            }
        });
    };

    const createNewResponse = (userInput) => {
        const newResponseRef = push(ref(database, 'responses'));
        set(newResponseRef, {
            keywords: [userInput], // Palavras-chave para a nova resposta
            text: "Desculpe, não sei responder a essa pergunta. Vou aprender e responder melhor na próxima vez!" // Texto da nova resposta padrão
        });
        setResponse("Desculpe, não sei responder a essa pergunta. Vou aprender e responder melhor na próxima vez!");
    };

    const sendMessageToDatabase = (message) => {
        const botResponseRef = push(ref(database, 'messages'));
        set(botResponseRef, {
            text: message,
            timestamp: Date.now()
        });
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleSendButton = () => {
        onSendMessage(input); // Envia a mensagem de usuário para o componente pai (Chatbot)
        sendMessageToDatabase(response); // Envia a resposta para o banco de dados
        setInput(""); // Limpa o campo de entrada
        setResponse(""); // Limpa a resposta
    };

    return (
        <div>
            <div>{response}</div>
            <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Digite sua mensagem..."
                style={{ marginRight: "10px" }}
            />
            <button onClick={handleSendButton}>Enviar</button>
        </div>
    );
};

export default ChatbotResponses;
