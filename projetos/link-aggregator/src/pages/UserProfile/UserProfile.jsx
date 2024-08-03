import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase/config';
import ProfilePicture from '../../components/ProfilePicture/ProfilePicture';
import ProfileBanner from '../../components/ProfileBanner/ProfileBanner';
import ShareModal from '../../components/ShareModal/ShareModal';
import './UserProfile.css';
import Spinner from '../../components/Spinner/Spinner';

const UserProfile = () => {
    const { mentionName } = useParams();
    const [links, setLinks] = useState([]);
    const [userId, setUserId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedLink, setSelectedLink] = useState(null);
    const [userStyles, setUserStyles] = useState({
        fontFamily: 'Arial',
        textColor: '#000',
        backgroundColor: '#f5f5f5',
        hoverBackgroundColor: '#808080',
        borderColor: '#000',
        hoverTextColor: '#000',
    });

    useEffect(() => {
        const fetchUserId = () => {
            const usersRef = ref(database, 'users');
            onValue(usersRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    for (const key in data) {
                        if (data[key].mentionName === mentionName) {
                            setUserId(key);
                            setUserStyles({
                                fontFamily: data[key].fontFamily || 'Arial',
                                textColor: data[key].textColor || '#000',
                                backgroundColor: data[key].backgroundColor || '#f5f5f5',
                                hoverBackgroundColor: data[key].hoverBackgroundColor || '#808080',
                                borderColor: data[key].borderColor || '#000',
                                hoverTextColor: data[key].hoverTextColor || '#000',
                            });
                            break;
                        }
                    }
                }
            });
        };

        fetchUserId();
    }, [mentionName]);

    useEffect(() => {
        if (userId) {
            const linksRef = ref(database, 'links');
            onValue(linksRef, (snapshot) => {
                const data = snapshot.val();
                const linkList = data
                    ? Object.keys(data).map(key => ({
                        id: key,
                        ...data[key],
                    }))
                    : [];

                const userLinks = linkList.filter(link => link.userId === userId);
                setLinks(userLinks);
            });

            const customizationsRef = ref(database, `users/${userId}/customizations`);
            onValue(customizationsRef, (snapshot) => {
                const customizations = snapshot.val();
                if (customizations) {
                    setUserStyles(prevStyles => ({
                        ...prevStyles,
                        fontFamily: customizations.fontFamily || prevStyles.fontFamily,
                        textColor: customizations.textColor || prevStyles.textColor,
                        backgroundColor: customizations.backgroundColor || prevStyles.backgroundColor,
                        hoverBackgroundColor: customizations.hoverBackgroundColor || prevStyles.hoverBackgroundColor,
                        borderColor: customizations.borderColor || prevStyles.borderColor,
                        hoverTextColor: customizations.hoverTextColor || prevStyles.hoverTextColor,
                    }));
                }
            });
        }
    }, [userId]);

    const handleShareClick = (link) => {
        setSelectedLink(link);
        setModalOpen(true);
    };

    const handleProfileShareClick = () => {
        const profileLink = `${window.location.origin}/${mentionName}`;
        const profileData = { url: profileLink, title: `Perfil de @${mentionName}` };
        setSelectedLink(profileData);
        setModalOpen(true);
    };

    if (!userId) {
        return <Spinner />; // Exibe o spinner enquanto aguarda a busca do usuário
    }

    return (
        <div className='user-container' style={{ fontFamily: userStyles.fontFamily }}>
            <div className='profile-user'>
                <ProfileBanner userId={userId} />
            </div>
            <div className='user-links-container' style={{ color: userStyles.textColor }}>
                <div className='profile-picture-info'>
                    <div className='profile-info'>
                        <ProfilePicture userId={userId} />
                        <div>
                            <h2>@{mentionName}</h2>
                            <h2>{userId && userId.displayName ? userId.displayName : 'Nome de Exibição'}</h2> {/* Atualize aqui */}
                        </div>
                    </div>
                    <button
                        className='share-btn'
                        onClick={handleProfileShareClick}
                        style={{
                            color: userStyles.textColor,
                            backgroundColor: userStyles.backgroundColor,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = userStyles.hoverBackgroundColor;
                            e.currentTarget.style.color = userStyles.hoverTextColor;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = userStyles.backgroundColor;
                            e.currentTarget.style.color = userStyles.textColor;
                        }}
                    >
                        ⋮
                    </button>
                </div>
                <ul className='link-list'>
                    {links.length > 0 ? (
                        links.map(link => (
                            <li key={link.id} style={{ margin: '5px 0' }}>
                                <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: userStyles.textColor,
                                        backgroundColor: userStyles.backgroundColor,
                                        borderColor: userStyles.borderColor,
                                        borderWidth: '1px',
                                        borderStyle: 'solid',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = userStyles.hoverBackgroundColor;
                                        e.currentTarget.style.color = userStyles.hoverTextColor;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = userStyles.backgroundColor;
                                        e.currentTarget.style.color = userStyles.textColor;
                                    }}
                                >
                                    {link.title}
                                </a>
                                <button
                                    onClick={() => handleShareClick(link)}
                                    style={{
                                        color: userStyles.textColor,
                                        backgroundColor: userStyles.backgroundColor,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = userStyles.hoverBackgroundColor;
                                        e.currentTarget.style.color = userStyles.hoverTextColor;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = userStyles.backgroundColor;
                                        e.currentTarget.style.color = userStyles.textColor;
                                    }}
                                >
                                    ⋮
                                </button>
                            </li>
                        ))
                    ) : (
                        <li>Nenhum link disponível ou usuário não existe.</li>
                    )}
                </ul>
            </div>
            <ShareModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                link={selectedLink}
            />
        </div>
    );
};

export default UserProfile;
