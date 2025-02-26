const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const _ = require('lodash');
const dns = require('dns');
const { Spec } = require('./database/ModelSpec');

dns.setServers(['8.8.8.8', '1.1.1.1']);
// เชื่อมต่อกับ MongoDBmongodb+srv://kenny:Bihbk4EGAj6JwqxZ@cluster0.olj3q.mongodb.net/
mongoose.connect('mongodb+srv://kenny:Bihbk4EGAj6JwqxZ@cluster0.olj3q.mongodb.net/spec?retryWrites=true&w=majority&appName=Cluster0').then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.log("Error connecting to MongoDB:", error);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(express.json());

// หน้าแอคมิน
app.use(session({
    secret: 'KennyKey', // ใช้เป็นความลับในการเข้ารหัสเซสชัน
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: 'mongodb+srv://kenny:Bihbk4EGAj6JwqxZ@cluster0.olj3q.mongodb.net/spec?retryWrites=true&w=majority&appName=Cluster0' }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // อายุของคุกกี้ (1 วัน)
}));

const registerAdmin = require('./routes/regiterAdmin');
app.use('/register', registerAdmin);

const {router: Adminlogin} = require('./routes/loginAdmin');
app.use('/Adminlogin', Adminlogin);

const pageAdmin = require('./routes/admin');
app.use('/admin', pageAdmin);


// หน้าแรก
const pageIndex = require('./routes/index');
app.use('/', pageIndex);

// หน้า com_list
const pageCom_list = require('./routes/com_list');
app.use('/com_list', pageCom_list);

// หน้า com_list_brand
const pageCom_list_brand = require('./routes/com_list_brand');
app.use('/com_list_brand', pageCom_list_brand);

// หน้า com_list_brand
const pageRecommen = require('./routes/recommen');
app.use('/recom', pageRecommen);

app.get('/companent', (req, res) => {
    res.render('components')
});

//ระบบแนะนำคอมพิวเตอร์ ----------------------

// ฟังก์ชันแปลงข้อความเป็นเวคเตอร์
function textToVector(text) {
    const words = text.toLowerCase().split(/\s+/);
    const vector = {};
    words.forEach(word => {
        vector[word] = (vector[word] || 0) + 1;
    });
    return vector;
}

// ฟังก์ชันคำนวณ Cosine Similarity
function cosineSimilarity(a, b) {
    const wordsA = Object.keys(a);
    const wordsB = Object.keys(b);
    
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    
    // คำนวณ dot product และ magnitude
    wordsA.forEach(word => {
        if (b[word]) {
            dotProduct += a[word] * b[word];
        }
        magnitudeA += a[word] * a[word];
    });

    wordsB.forEach(word => {
        magnitudeB += b[word] * b[word];
    });

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    return dotProduct / (magnitudeA * magnitudeB);
}

// ฟังก์ชันรวมข้อมูลตัวเลขและข้อความเป็นเวคเตอร์เดียว
function combineVector(textVector, numericData) {
    const combinedVector = { ...textVector };

    // รวมข้อมูลตัวเลข
    Object.keys(numericData).forEach(key => {
        combinedVector[key] = numericData[key];  // เพิ่มข้อมูลตัวเลขเข้าไปในเวคเตอร์
    });

    return combinedVector;
}

app.get('/showdatacom/:id', async (req, res) => {
    const ID_dataSpec = req.params.id;
    const DataSpec = await Spec.findById(ID_dataSpec);

     // แปลงข้อมูลของสินค้าที่ผู้ใช้สนใจเป็นเวคเตอร์
     const userProductTextVector = {
        ...textToVector(DataSpec.BrandCPU),
        ...textToVector(DataSpec.SeriesCPU),
        ...textToVector(DataSpec.ModelCPU),
    };
    const userProductNumericData = {
        CPU_Base_Clock: DataSpec.CPU_Base_Clock,
        PriceCPU: DataSpec.PriceCPU,
        ssd: DataSpec.ssd
    };
    // รวมข้อมูลตัวเลขและข้อความ
    const userProductVector = combineVector(userProductTextVector, userProductNumericData);

    const productData = await Spec.findById();

    // คำนวณความคล้ายคลึงกับสินค้าทุกตัว
    const recommendations = productData.map(product => {
        const productTextVector = {
            ...textToVector(product.name),
            ...textToVector(product.description)
        };
        const productNumericData = {
            cpu_speed: product.cpu_speed,
            ram: product.ram,
            ssd: product.ssd
        };

        // รวมข้อมูลข้อความและตัวเลข
        const productVector = combineVector(productTextVector, productNumericData);

        const similarity = cosineSimilarity(userProductVector, productVector);
        return { product, similarity };
    });

    // เรียงลำดับตามความคล้ายคลึง
    recommendations.sort((a, b) => b.similarity - a.similarity);

    // ส่งข้อมูลการแนะนำสินค้า 5 อันดับแรก
    const topRecommendations = recommendations.slice(0, 5);
    res.render('showdatacom', {DataSpec});
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
