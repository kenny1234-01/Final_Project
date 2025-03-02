const express = require('express');
require('dotenv').config()
const app = express();
const port = process.env.PORT;
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const _ = require('lodash');
const dns = require('dns');
const { Spec } = require('./database/ModelSpec');

dns.setServers(['8.8.8.8', '1.1.1.1']);

mongoose.connect(process.env.URLMongoDB).then(() => {
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
    secret: process.env.KEY_Session, 
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.URLMongoDB }),
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

const pageFromWeb = require('./routes/FormWeb');
app.use('/fromWeb', pageFromWeb);

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
        ...textToVector(DataSpec.BrandMainboard),
        ...textToVector(DataSpec.ModelMainboard),
        ...textToVector(DataSpec.Mainboard_CPU_Support),
        ...textToVector(DataSpec.Mainboard_Memory_Support),
        ...textToVector(DataSpec.BrandVGA),
        ...textToVector(DataSpec.ChipsetVGA),
        ...textToVector(DataSpec.SeriesVGA),
        ...textToVector(DataSpec.ModelVGA),
        ...textToVector(DataSpec.BrandCASE),
        ...textToVector(DataSpec.ModelCASE),
        ...textToVector(DataSpec.I_O_Ports_CASE),
        ...textToVector(DataSpec.BrandCOOLING),
        ...textToVector(DataSpec.ModelCOOLING),
        ...textToVector(DataSpec.Fan_Built_In_COOLING),
        ...textToVector(DataSpec.BrandMONITOR),
        ...textToVector(DataSpec.ModelMONITOR),
        ...textToVector(DataSpec.Max_Resolution_MONITOR),
        ...textToVector(DataSpec.Rank1),
        ...textToVector(DataSpec.Rank2),
        ...textToVector(DataSpec.Rank3)
    };
    const userProductNumericData = {
        CPU_Base_Clock: DataSpec.CPU_Base_Clock,
        PriceCPU: DataSpec.PriceCPU,
        MemoryMainboard: DataSpec.MemoryMainboard,
        PriceMainboard: DataSpec.PriceMainboard,
        VGA_Base_Clock: DataSpec.VGA_Base_Clock,
        VGA_Boost_Clock: DataSpec.VGA_Boost_Clock,
        VGA_Memory_Clock: DataSpec.VGA_Memory_Clock,
        VGA_Memory_Size: DataSpec.VGA_Memory_Size,
        PriceVGA: DataSpec.PriceVGA,
        RAM_Size: DataSpec.RAM_Size,
        RAM_Speed: DataSpec.RAM_Speed,
        PriceRAM: DataSpec.PriceRAM,
        CapacitySSD: DataSpec.CapacitySSD,
        Read_SSD: DataSpec.Read_SSD,
        Write_SSD: DataSpec.Write_SSD,
        PriceSSD: DataSpec.PriceSSD,
        CapacitySSD2: DataSpec.CapacitySSD2,
        Read_SSD2: DataSpec.Read_SSD2,
        Write_SSD2: DataSpec.Write_SSD2,
        PriceSSD2: DataSpec.PriceSSD2,
        CapacityHDD: DataSpec.CapacityHDD,
        Speed_HDD: DataSpec.Speed_HDD,
        PriceHDD: DataSpec.PriceHDD,
        PS: DataSpec.PS,
        PricePS: DataSpec.PricePS,
        WeightCASE: DataSpec.WeightCASE,
        PriceCASE: DataSpec.PriceCASE,
        PriceCOOLING: DataSpec.PriceCOOLING,
        Display_Size_MONITOR: DataSpec.Display_Size_MONITOR,
        Refresh_Rate_MONITOR: DataSpec.Refresh_Rate_MONITOR,
        PriceMONITOR: DataSpec.PriceMONITOR,
        ProbabilityRank1: DataSpec.ProbabilityRank1,
        ProbabilityRank2: DataSpec.ProbabilityRank2,
        ProbabilityRank3: DataSpec.ProbabilityRank3
    };
    // รวมข้อมูลตัวเลขและข้อความ
    const userProductVector = combineVector(userProductTextVector, userProductNumericData);

    const productData = await Spec.find();

    // คำนวณความคล้ายคลึงกับสินค้าทุกตัว
    const recommendations = productData.map(product => {
        const productTextVector = {
            ...textToVector(product.BrandCPU),
            ...textToVector(product.SeriesCPU),
            ...textToVector(product.ModelCPU),
            ...textToVector(product.BrandMainboard),
            ...textToVector(product.ModelMainboard),
            ...textToVector(product.Mainboard_CPU_Support),
            ...textToVector(product.Mainboard_Memory_Support),
            ...textToVector(product.BrandVGA),
            ...textToVector(product.ChipsetVGA),
            ...textToVector(product.SeriesVGA),
            ...textToVector(product.ModelVGA),
            ...textToVector(product.BrandCASE),
            ...textToVector(product.ModelCASE),
            ...textToVector(product.I_O_Ports_CASE),
            ...textToVector(product.BrandCOOLING),
            ...textToVector(product.ModelCOOLING),
            ...textToVector(product.Fan_Built_In_COOLING),
            ...textToVector(product.BrandMONITOR),
            ...textToVector(product.ModelMONITOR),
            ...textToVector(product.Max_Resolution_MONITOR),
            ...textToVector(product.Rank1),
            ...textToVector(product.Rank2),
            ...textToVector(product.Rank3)
        };
        const productNumericData = {
            CPU_Base_Clock: product.CPU_Base_Clock,
            PriceCPU: product.PriceCPU,
            MemoryMainboard: product.MemoryMainboard,
            PriceMainboard: product.PriceMainboard,
            VGA_Base_Clock: product.VGA_Base_Clock,
            VGA_Boost_Clock: product.VGA_Boost_Clock,
            VGA_Memory_Clock: product.VGA_Memory_Clock,
            VGA_Memory_Size: product.VGA_Memory_Size,
            PriceVGA: product.PriceVGA,
            RAM_Size: product.RAM_Size,
            RAM_Speed: product.RAM_Speed,
            PriceRAM: product.PriceRAM,
            CapacitySSD: product.CapacitySSD,
            Read_SSD: product.Read_SSD,
            Write_SSD: product.Write_SSD,
            PriceSSD: product.PriceSSD,
            CapacitySSD2: product.CapacitySSD2,
            Read_SSD2: product.Read_SSD2,
            Write_SSD2: product.Write_SSD2,
            PriceSSD2: product.PriceSSD2,
            CapacityHDD: product.CapacityHDD,
            Speed_HDD: product.Speed_HDD,
            PriceHDD: product.PriceHDD,
            PS: product.PS,
            PricePS: product.PricePS,
            WeightCASE: product.WeightCASE,
            PriceCASE: product.PriceCASE,
            PriceCOOLING: product.PriceCOOLING,
            Display_Size_MONITOR: product.Display_Size_MONITOR,
            Refresh_Rate_MONITOR: product.Refresh_Rate_MONITOR,
            PriceMONITOR: product.PriceMONITOR,
            ProbabilityRank1: product.ProbabilityRank1,
            ProbabilityRank2: product.ProbabilityRank2,
            ProbabilityRank3: product.ProbabilityRank3
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
    res.render('showdatacom', {DataSpec, topRecommendations});
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
