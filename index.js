const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);
app.use(helmet({ contentSecurityPolicy: false }));
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 150,
    message: 'Terlalu banyak request, sistem mendeteksi aktivitas mencurigakan.'
});
app.use(limiter);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
    secret: 'rahasia-ruang-anonim-super-aman',
    resave: false, saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }
}));

const cekAdmin = (req, res, next) => {
    if (req.session.isAdmin) next();
    else res.redirect('/ruang-admin');
};

const kataKasar = ['anjing', 'babi', 'bangsat', 'kontol', 'memek', 'ngentot', 'tolol', 'goblok', 'bajingan', 'asu', 'peler'];
const sensorKata = (teks) => {
    let teksBersih = teks;
    kataKasar.forEach(kata => {
        const regex = new RegExp(`\\b${kata}\\b`, 'gi');
        teksBersih = teksBersih.replace(regex, '***');
    });
    return teksBersih;
};

const formatWIB = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('.', ':') + ' WIB';
};

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/jelajah', async (req, res) => {
    try {
        const snapshot = await db.collection('confessions').where('status', '==', 'approved').orderBy('createdAt', 'desc').get();
        const confessions = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            confessions.push({ id: doc.id, waktuFormat: formatWIB(data.createdAt), ...data });
        });
        res.render('feed', { confessions, success: req.query.success });
    } catch (error) { res.status(500).send('Terjadi kesalahan server saat memuat Beranda.'); }
});

app.get('/pengakuan/:id', async (req, res) => {
    try {
        const doc = await db.collection('confessions').doc(req.params.id).get();
        if (!doc.exists || doc.data().status !== 'approved') return res.status(404).send('Pengakuan tidak ditemukan.');
        const data = doc.data();
        res.render('single', { confession: { id: doc.id, waktuFormat: formatWIB(data.createdAt), ...data } });
    } catch (error) { res.status(500).send('Terjadi kesalahan server.'); }
});

app.get('/tulis', (req, res) => res.render('post', { error: req.query.error }));

app.post('/tulis', async (req, res) => {
    try {
        let { category, message, pengirim } = req.body;
        const turnstileToken = req.body['cf-turnstile-response'];

        const SECRET_KEY = '0x4AAAAAADC6MXXfNm-XLaQUrmUzDcSCqbY'; 
        const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${SECRET_KEY}&response=${turnstileToken}`
        });
        const outcome = await verify.json();
        if (!outcome.success) return res.redirect('/tulis?error=captcha');

        if (!category) category = 'Tanpa Kategori';
        message = sensorKata(message);
        pengirim = (pengirim && pengirim.trim() !== '') ? sensorKata(pengirim) : 'Anonim';

        const counterRef = db.collection('metadata').doc('counter');
        let newId = 1;

        await db.runTransaction(async (t) => {
            const doc = await t.get(counterRef);
            if (doc.exists) {
                newId = doc.data().total + 1;
                t.update(counterRef, { total: newId });
            } else {
                t.set(counterRef, { total: 1 });
            }
        });

        await db.collection('confessions').doc(newId.toString()).set({
            category, message, pengirim,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            hugs: 0, komentar: [], commenterIPs: [], supporterIPs: []
        });

        res.redirect('/jelajah?success=true');
    } catch (error) { res.status(500).send('Gagal mengirim pengakuan.'); }
});

app.post('/dukungan/:id', async (req, res) => {
    try {
        const userIP = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const docRef = db.collection('confessions').doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists) return res.status(404).json({ success: false });

        const data = doc.data();
        const ips = data.supporterIPs || [];

        if (ips.includes(userIP)) {
            return res.status(403).json({ success: false, message: 'Sudah mendukung' });
        }

        await docRef.update({ 
            hugs: admin.firestore.FieldValue.increment(1),
            supporterIPs: admin.firestore.FieldValue.arrayUnion(userIP)
        });

        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false }); }
});

app.post('/komen/:id', async (req, res) => {
    try {
        let { isi_komen, pengirim } = req.body;
        const userIP = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        if(!isi_komen || isi_komen.trim() === '') return res.status(400).json({ success: false });

        const docRef = db.collection('confessions').doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists) return res.status(404).json({ success: false });

        const data = doc.data();
        const ips = data.commenterIPs || [];

        if (ips.includes(userIP)) {
            return res.status(403).json({ success: false, message: 'Sudah berkomentar' });
        }

        isi_komen = sensorKata(isi_komen);
        pengirim = (pengirim && pengirim.trim() !== '') ? sensorKata(pengirim) : 'Anonim';

        const komenData = {
            id: Date.now().toString(),
            teks: isi_komen,
            pengirim: pengirim,
            waktu: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).replace('.', ':') + ' WIB'
        };

        await docRef.update({ 
            komentar: admin.firestore.FieldValue.arrayUnion(komenData),
            commenterIPs: admin.firestore.FieldValue.arrayUnion(userIP)
        });

        res.json({ success: true, data: komenData });
    } catch (error) { res.status(500).json({ success: false }); }
});

app.get('/ruang-admin', (req, res) => {
    if (req.session.isAdmin) return res.redirect('/dashboard');
    res.render('login', { error: req.query.error });
});

app.post('/ruang-admin', (req, res) => {

    if (req.body.password === serviceAccount.admin_password) { 
        req.session.isAdmin = true;
        res.redirect('/dashboard');
    } else {
        res.redirect('/ruang-admin?error=true');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/dashboard', cekAdmin, async (req, res) => {
    try {
        const snapshot = await db.collection('confessions').orderBy('createdAt', 'desc').get();
        const confessions = [];
        let stats = { total: 0, pending: 0, approved: 0 };
        snapshot.forEach(doc => {
            const data = doc.data();
            confessions.push({ id: doc.id, waktuFormat: formatWIB(data.createdAt), ...data });
            stats.total++;
            if (data.status === 'pending') stats.pending++;
            if (data.status === 'approved') stats.approved++;
        });
        res.render('dashboard', { confessions, stats });
    } catch (error) { res.status(500).send('Terjadi kesalahan server.'); }
});

app.post('/dashboard/approve/:id', cekAdmin, async (req, res) => {
    await db.collection('confessions').doc(req.params.id).update({ status: 'approved' });
    res.redirect('/dashboard');
});

app.post('/dashboard/delete/:id', cekAdmin, async (req, res) => {
    await db.collection('confessions').doc(req.params.id).delete();
    res.redirect('/dashboard');
});

app.post('/dashboard/delete-komen/:postId/:komenId', cekAdmin, async (req, res) => {
    try {
        const docRef = db.collection('confessions').doc(req.params.postId);
        const doc = await docRef.get();
        if (doc.exists) {
            const comments = doc.data().komentar || [];
            const updatedComments = comments.filter(c => c.id !== req.params.komenId);
            await docRef.update({ komentar: updatedComments });
        }
        res.redirect('/dashboard');
    } catch (error) { res.status(500).send('Gagal hapus komentar.'); }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
}

module.exports = app;
