import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuthentication';
import useLinks from '../../hooks/useLinks';
import { NavLink } from 'react-router-dom';
import Modal from '../../components/Modal/Modal';
import UserProfileEditor from '../../components/UserProfileEditor/UserProfileEditor';
import { getAuth } from "firebase/auth";
import ProfileCustomization from '../../components/ProfileCustomization/ProfileCustomization';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [selectedLink, setSelectedLink] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { links, addLink, editLink, deleteLink } = useLinks(currentUser ? currentUser.uid : null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const auth = getAuth();
        await auth.currentUser.reload(); // Reload the user to get the latest data
        setIsLoading(false); // Set loading to false after fetching
      }
    };

    fetchUserData();
  }, [currentUser]);

  if (!currentUser) {
    return <p>Faça <a href="/login">Login</a> para visualizar seu dashboard.</p>;
  }

  const handleAddLink = () => {
    if (title && url) {
      addLink(title, url);
      setTitle('');
      setUrl('');
    }
  };

  const handleEditLink = (id, newTitle, newUrl) => {
    editLink(id, newTitle, newUrl);
  };

  const handleDeleteLink = (id) => {
    deleteLink(id);
  };

  const openModal = (link) => {
    setSelectedLink(link);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedLink(null);
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <UserProfileEditor />
      <div>
        <h2>Configurações Adicionais</h2>
        <ProfileCustomization userId={currentUser.uid} />
      </div>

      {/* Indicativo de verificação de e-mail */}
      <div>
        {isLoading ? (
          <p>Carregando...</p>
        ) : currentUser.emailVerified ? (
          <p style={{ color: 'green' }}>✅ Seu e-mail está verificado!</p>
        ) : (
          <p style={{ color: 'red' }}>⚠️ Seu e-mail não foi verificado. Verifique sua caixa de entrada.</p>
        )}
      </div>

      <ul>
        {currentUser && (
          <li className='profile-link-page'>
            <NavLink to={`/${currentUser.mentionName}`}>Ver Links</NavLink>
          </li>
        )}
      </ul>
      <div>
        <h2>Adicionar um novo link</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          disabled={!currentUser.emailVerified}
        />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL"
          disabled={!currentUser.emailVerified}
        />
        <button onClick={handleAddLink} disabled={!currentUser.emailVerified}>
          Adicionar Link
        </button>
        {!currentUser.emailVerified && (
          <p style={{ color: 'red' }}>⚠️ Verifique seu e-mail para poder adicionar novos links.</p>
        )}
      </div>
      <div>
        <h2>Seus links</h2>
        <ul>
          {links
            .filter(link => link.userId === currentUser.uid)
            .map(link => (
              <li key={link.id}>
                <a href={link.url} target="_blank" rel="noopener noreferrer">{link.title}</a>
                <button onClick={() => openModal(link)}>Editar</button>
                <span> (Added on: {new Date(link.createdAt * 1000).toLocaleString()})</span>
              </li>
            ))}
        </ul>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        link={selectedLink}
        onEdit={handleEditLink}
        onDelete={handleDeleteLink}
      />
    </div>
  );
};

export default Dashboard;
