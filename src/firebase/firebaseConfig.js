// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithCustomToken, signInAnonymously } from "firebase/auth"; // Adicionado onAuthStateChanged, signInWithCustomToken, signInAnonymously
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"; // Adicionado doc, setDoc, getDoc

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqbT5AwhNbI03yW_oFcag9bWWGWi0wXAI",
  authDomain: "appcarona-9fdae.firebaseapp.com",
  projectId: "appcarona-9fdae",
  storageBucket: "appcarona-9fdae.firebasestorage.app",
  messagingSenderId: "147593288000",
  appId: "1:147593288000:web:5883543066ba6da9fd02a5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializar autenticação e banco de dados
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Garante que o perfil do usuário exista na coleção 'users' do Firestore.
 * Se o perfil não existir, ele será criado com um saldo inicial de 0.
 * @param {firebase.User} user O objeto User do Firebase Authentication.
 */
export const ensureUserProfile = async (user) => {
  if (!user) return; // Não faz nada se não houver usuário
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Cria novo perfil de usuário se não existir
    await setDoc(userRef, {
      displayName: user.displayName || 'Usuário',
      email: user.email,
      photoURL: user.photoURL || null,
      balance: 0, // Inicializa o saldo em 0
      createdAt: new Date(), // Adiciona um timestamp de criação
    });
    console.log(`Perfil de usuário para ${user.email} criado com sucesso.`);
  } else {
    console.log(`Perfil de usuário para ${user.email} já existe.`);
  }
};

// Opcional: Escutar mudanças de autenticação para criar o perfil automaticamente
// Isso garante que mesmo se o ensureUserProfile não for chamado explicitamente
// em Login/Register, o perfil será criado na primeira vez que o app detectar o usuário.
onAuthStateChanged(auth, (user) => {
  if (user) {
    ensureUserProfile(user);
  }
});

// Exportar todos os serviços e a função ensureUserProfile
export { app, auth, db };
