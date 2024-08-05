import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase/config';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './UserList.css';

function UserList() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const usersRef = ref(database, 'users');
        onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            console.log("Dados do Firebase:", data);
            if (data) {
                const userList = Object.keys(data).map(key => {
                    const userData = data[key];
                    return {
                        id: key,
                        displayName: userData.displayName,
                        mentionName: userData.mentionName,
                        profilePicture: userData.profilePicture?.image || '',
                    };
                });
                console.log("Lista de usuários:", userList);
                setUsers(userList);
            } else {
                setUsers([]);
            }
        });
    }, []);

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        cssEase: "linear",
    };

    return (
        <div className="user-list-container">
            <h2>Usuários que usam o HIGHLINKS</h2>
            <Slider {...settings}>
                {users.length > 0 ? (
                    users.map(user => (
                        <div key={user.id} className="user-item">
                            {user.profilePicture ? (
                                <img
                                    src={user.profilePicture}
                                    alt={`${user.displayName}'s profile`}
                                    className="profile-picture"
                                />
                            ) : (
                                <div className="placeholder-picture"></div>
                            )}
                            <a href={`/${user.mentionName}`}>{user.displayName}</a>
                        </div>
                    ))
                ) : (
                    <div>Nenhum usuário encontrado.</div>
                )}
            </Slider>
        </div>
    );
}

export default UserList;
