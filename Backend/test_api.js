// Fichier de test automatisé pour ZILDA
// Ce script simule un Frontend qui communiquerait avec ton API
const http = require('http');

const baseURL = 'http://localhost:5000/api/auth';
const randomNum = Math.floor(Math.random() * 1000);
const testUser = {
    username: `zilda_test_${randomNum}`,
    email: `zilda${randomNum}@test.com`,
    password: 'SuperPassword123!'
};

console.log('🧪 Début des tests de l\'API Backend...\n');

// Fonction pour simuler la requête de création de compte
const testRegister = () => {
    return new Promise((resolve, reject) => {
        console.log(`[1] ⏳ Test de l'inscription (POST /register) pour : ${testUser.email}`);
        
        const data = JSON.stringify(testUser);
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => responseBody += chunk);
            res.on('end', () => {
                const result = JSON.parse(responseBody);
                if (res.statusCode === 201) {
                    console.log('✅ Succès de l\'inscription ! Message du serveur:', result.message, '\n');
                    resolve();
                } else {
                    console.error('❌ Échec de l\'inscription. Code:', res.statusCode, 'Message:', result.message);
                    reject(result);
                }
            });
        });

        req.on('error', (e) => {
            console.error('❌ Impossible de contacter le serveur. Est-il bien lancé avec "node server.js" ?\n', e.message);
            reject(e);
        });

        req.write(data);
        req.end();
    });
};

// Fonction pour simuler la requête de connexion
const testLogin = () => {
    return new Promise((resolve, reject) => {
        console.log(`[2] ⏳ Test de la connexion (POST /login) pour : ${testUser.email}`);
        
        const data = JSON.stringify({
            email: testUser.email,
            password: testUser.password
        });
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => responseBody += chunk);
            res.on('end', () => {
                const result = JSON.parse(responseBody);
                if (res.statusCode === 200) {
                    console.log('✅ Succès de la connexion !');
                    console.log('🔑 Ton fameux Token JWT a bien été reçu et généré par le backend :\n', result.token);
                    console.log('\n🎉 TEST 100% REUSSI ! Zilda, ton API fonctionne parfaitement.');
                    resolve();
                } else {
                    console.error('❌ Échec de la connexion. Code:', res.statusCode, 'Message:', result);
                    reject(result);
                }
            });
        });

        req.on('error', (e) => reject(e));

        req.write(data);
        req.end();
    });
};

// Exécution des tests l'un après l'autre
const runTests = async () => {
    try {
        await testRegister();
        await testLogin();
    } catch (error) {
        console.log('\n⚠️ Le test a été stoppé suite à une erreur.');
    }
};

runTests();
