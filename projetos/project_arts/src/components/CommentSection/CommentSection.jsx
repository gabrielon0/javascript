import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, push, serverTimestamp } from 'firebase/database';
import { useAuth } from '../../hooks/useAuthentication';
import './CommentSection.css';
import CommentItem from '../CommentItem/CommentItem';

function CommentSection({ postId }) {
    const { currentUser } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const db = getDatabase();
        const commentsRef = ref(db, `comments/${postId}`);
        
        const unsubscribe = onValue(commentsRef, (snapshot) => {
            if (snapshot.exists()) {
                const commentsData = snapshot.val();
                const commentsList = Object.keys(commentsData).map(key => ({
                    id: key,
                    ...commentsData[key],
                }));
                const parentComments = commentsList.filter(comment => !comment.parentId);
                parentComments.forEach(parentComment => {
                    parentComment.replies = commentsList.filter(comment => comment.parentId === parentComment.id);
                });
                setComments(parentComments);
            } else {
                setComments([]);
            }
        });

        return () => unsubscribe();
    }, [postId]);

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (newComment.trim() === '') return;

        const db = getDatabase();
        const commentsRef = ref(db, `comments/${postId}`);
        
        const newCommentData = {
            text: newComment,
            userId: currentUser.uid,
            userName: currentUser.displayName,
            createdAt: serverTimestamp(),
        };

        push(commentsRef, newCommentData)
            .then(() => {
                setNewComment('');
            })
            .catch((error) => {
                setError('Erro ao enviar comentário');
                console.error(error);
            });
    };

    return (
        <div className="comment-section">
            <h2>Comentários</h2>
            <form onSubmit={handleCommentSubmit}>
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicione um comentário..."
                    className="comment-input"
                />
                <button type="submit" className="submit-button">Comentar</button>
                {error && <p className="error">{error}</p>}
            </form>
            <div className="comments-list">
                {comments.map(comment => (
                    <CommentItem key={comment.id} comment={comment} postId={postId} replies={comment.replies} />
                ))}
            </div>
        </div>
    );
}

export default CommentSection;
