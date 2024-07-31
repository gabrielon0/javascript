import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile as updateProfileAuth,
    signOut,
    sendEmailVerification
} from "firebase/auth";
import { useState, useEffect, useRef } from "react";
import { getDatabase, ref, set, get } from "firebase/database";
import { getUnixTime } from 'date-fns';

export const useAuth = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const auth = getAuth();
    const db = getDatabase();
    const isMounted = useRef(true);

    const handleCancellation = () => {
        if (!isMounted.current) {
            throw new Error("Operação cancelada");
        }
    };

    const createUser = async (data) => {
        handleCancellation();
        setLoading(true);

        try {
            data.isAdmin =
                data.email === 'black@gmail.com' ||
                data.email === 'black1@gmail.com' ||
                data.email === 'black2@gmail.com';

            const mentionNameRef = ref(db, 'users');
            const snapshot = await get(mentionNameRef);
            let mentionNameExists = false;

            if (snapshot.exists()) {
                const users = snapshot.val();
                for (const key in users) {
                    if (users[key].mentionName === data.mentionName) {
                        mentionNameExists = true;
                        break;
                    }
                }
            }

            if (mentionNameExists) {
                setError('O nome de menção já está em uso. Escolha outro.');
                return;
            }

            const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password);
            await updateProfileAuth(user, { displayName: data.displayName });

            await sendEmailVerification(user);
            setError('Um e-mail de verificação foi enviado. Por favor, verifique sua caixa de entrada.');

            const joinedAt = getUnixTime(new Date());
            const dbRef = ref(db, `users/${user.uid}`);
            await set(dbRef, {
                email: data.email,
                displayName: data.displayName,
                mentionName: data.mentionName,
                isAdmin: data.isAdmin || false,
                joinedAt: joinedAt,
            });

            setCurrentUser({
                uid: user.uid,
                email: user.email,
                displayName: data.displayName,
                mentionName: data.mentionName,
                isAdmin: data.isAdmin || false,
            });

            return user;
        } catch (error) {
            let systemErrorMessage;

            if (error.code === "auth/weak-password") {
                systemErrorMessage = "A senha precisa conter pelo menos 6 caracteres.";
            } else if (error.code === "auth/email-already-in-use") {
                systemErrorMessage = "E-mail já cadastrado.";
            } else {
                systemErrorMessage = "Ocorreu um erro, por favor tente mais tarde.";
            }

            console.error("Erro ao criar usuário:", error);
            setError(systemErrorMessage);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        handleCancellation();
        setLoading(true);

        try {
            await signOut(auth);
            setCurrentUser(null);
        } catch (error) {
            console.error("Erro ao fazer logout:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const login = async (data) => {
        handleCancellation();
        setLoading(true);
        setError(null);

        try {
            await signInWithEmailAndPassword(auth, data.email, data.password);
            const user = auth.currentUser;

            if (user && !user.emailVerified) {
                setError("Por favor, verifique seu e-mail antes de fazer login.");
                return;
            }

            const userRef = ref(db, `users/${user.uid}`);
            const userSnapshot = await get(userRef);
            const userData = userSnapshot.val();

            if (userData) {
                setCurrentUser({
                    uid: user.uid,
                    email: user.email,
                    displayName: userData.displayName,
                    mentionName: userData.mentionName,
                    isAdmin: userData.isAdmin || false,
                });
            } else {
                setError("Dados do usuário não encontrados.");
            }
        } catch (error) {
            let systemErrorMessage;

            if (error.message) {
                systemErrorMessage = "E-mail inválido ou Senha incorreta";
            } else {
                systemErrorMessage = "Ocorreu um erro, por favor tente mais tarde.";
            }

            console.error("Erro ao fazer login:", error);
            setError(systemErrorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        isMounted.current = true;

        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userRef = ref(db, `users/${user.uid}`);
                const userSnapshot = await get(userRef);
                const userData = userSnapshot.val();

                if (userData) {
                    setCurrentUser({
                        uid: user.uid,
                        email: user.email,
                        displayName: userData.displayName,
                        mentionName: userData.mentionName,
                        isAdmin: userData.isAdmin || false,
                    });
                } else {
                    setCurrentUser(null);
                }
            } else {
                setCurrentUser(null);
            }
        });

        return () => {
            isMounted.current = false;
            unsubscribe();
        };
    }, [auth, db]);

    const getCurrentUser = () => {
        return auth.currentUser;
    };

    return {
        auth,
        createUser,
        error,
        logout,
        login,
        loading,
        currentUser,
        setCurrentUser,
        getCurrentUser
    };
};
