// src/components/PostArtDetails.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Adiciona useNavigate para navegação
import { getDatabase, ref, get } from 'firebase/database';
import './PostArtDetails.css'; // Importa o CSS para estilização

function PostArtDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Usando useNavigate para navegação

  useEffect(() => {
    const db = getDatabase();
    const postRef = ref(db, `posts/${id}`);

    get(postRef).then((snapshot) => {
      if (snapshot.exists()) {
        setPost(snapshot.val());
      } else {
        setError('Post não encontrado');
      }
      setLoading(false);
    }).catch((error) => {
      setError('Erro ao carregar post');
      setLoading(false);
    });
  }, [id]);

  const handleGoBack = () => {
    navigate(-1); // Volta à página anterior
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return (
    <div>
      <p>{error}</p>
      <button onClick={handleGoBack}>Voltar</button>
    </div>
  );

  return (
    <div className="post-details">
      {post && (
        <>
          <h1>{post.title}</h1>
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="post-image"
            />
          )}
          <p>{post.description}</p>
          {post.link && (
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="post-link"
            >
              Leia mais
            </a>
          )}
          <button onClick={handleGoBack} className="back-button">Voltar</button>
        </>
      )}
    </div>
  );
}

export default PostArtDetails;
