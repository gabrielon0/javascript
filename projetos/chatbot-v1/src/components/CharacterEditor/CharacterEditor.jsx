import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDatabase, ref, get, update } from 'firebase/database';

function CharacterEditor() {
  const { characterId } = useParams();
  const [characterData, setCharacterData] = useState(null);
  const [editedCharacterName, setEditedCharacterName] = useState('');
  const [editedCharacterAge, setEditedCharacterAge] = useState('');
  const database = getDatabase();

  useEffect(() => {
    const fetchCharacterData = async () => {
      try {
        const characterRef = ref(database, `result/${characterId}`);
        const snapshot = await get(characterRef);
        if (snapshot.exists()) {
          const characterData = snapshot.val();
          setCharacterData(characterData);
          setEditedCharacterName(characterData.characterName); // Preencher o estado inicial com o nome atual do personagem
          setEditedCharacterAge(characterData.age); // Preencher o estado inicial com a idade atual do personagem
        } else {
          console.log('No character data available');
        }
      } catch (error) {
        console.error('Error fetching character data:', error);
      }
    };

    fetchCharacterData();
  }, [database, characterId]);

  const handleNameChange = (e) => {
    const { value } = e.target;
    setEditedCharacterName(value); // Atualizar o estado com o valor do campo de entrada do nome
  };

  const handleAgeChange = (e) => {
    const { value } = e.target;
    setEditedCharacterAge(value); // Atualizar o estado com o valor do campo de entrada da idade
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const characterRef = ref(database, `result/${characterId}`);
      await update(characterRef, { characterName: editedCharacterName, age: editedCharacterAge }); // Atualizar o nome e a idade no banco de dados
      console.log('Detalhes do personagem atualizados com sucesso:', { characterName: editedCharacterName, age: editedCharacterAge });
    } catch (error) {
      console.error('Error updating character details:', error);
    }
  };

  if (!characterData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Editar Personagem</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Nome:
            <input
              type="text"
              value={editedCharacterName}
              onChange={handleNameChange}
            />
          </label>
        </div>
        <div>
          <label>
            Idade:
            <input
              type="text"
              value={editedCharacterAge}
              onChange={handleAgeChange}
            />
          </label>
        </div>
        <button type="submit">Salvar</button>
      </form>
    </div>
  );
}

export default CharacterEditor;
