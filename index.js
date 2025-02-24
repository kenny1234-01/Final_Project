const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const _ = require('lodash');
const dns = require('dns');

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

app.post('/showdatacom', (req, res) => {
    // ดึงข้อมูลที่ถูกส่งมาจากฟอร์ม
    const {
      rank1, rank2, rank3,
      BrandCPU, SeriesCPU, ModelCPU, CPU_Base_Clock, PriceCPU,
      BrandMainboard, ModelMainboard, Mainboard_CPU_Support, MemoryMainboard, Mainboard_Memory_Support, PriceMainboard,
      BrandVGA, ChipsetVGA, SeriesVGA, ModelVGA, VGA_Base_Clock, VGA_Boost_Clock, VGA_Memory_Clock, VGA_Memory_Size, PriceVGA,
      RAM_Size, RAM_Speed, PriceRAM,
      CapacitySSD, Read_SSD, Write_SSD, PriceSSD,
      CapacitySSD2, Read_SSD2, Write_SSD2, PriceSSD2,
      CapacityHDD, Speed_HDD, PriceHDD,
      PS, PricePS,
      BrandCASE, ModelCASE, WeightCASE, I_O_Ports_CASE, PriceCASE,
      BrandCOOLING, ModelCOOLING, Fan_Built_In_COOLING, PriceCOOLING,
      BrandMONITOR, ModelMONITOR, Display_Size_MONITOR, Max_Resolution_MONITOR, Refresh_Rate_MONITOR, PriceMONITOR
    } = req.body;
  
    // ใช้ข้อมูลเพื่อแสดงผลใน EJS หรือจัดการต่อ
    res.render('showdatacom', {
      rank1, rank2, rank3,
      BrandCPU, SeriesCPU, ModelCPU, CPU_Base_Clock, PriceCPU,
      BrandMainboard, ModelMainboard, Mainboard_CPU_Support, MemoryMainboard, Mainboard_Memory_Support, PriceMainboard,
      BrandVGA, ChipsetVGA, SeriesVGA, ModelVGA, VGA_Base_Clock, VGA_Boost_Clock, VGA_Memory_Clock, VGA_Memory_Size, PriceVGA,
      RAM_Size, RAM_Speed, PriceRAM,
      CapacitySSD, Read_SSD, Write_SSD, PriceSSD,
      CapacitySSD2, Read_SSD2, Write_SSD2, PriceSSD2,
      CapacityHDD, Speed_HDD, PriceHDD,
      PS, PricePS,
      BrandCASE, ModelCASE, WeightCASE, I_O_Ports_CASE, PriceCASE,
      BrandCOOLING, ModelCOOLING, Fan_Built_In_COOLING, PriceCOOLING,
      BrandMONITOR, ModelMONITOR, Display_Size_MONITOR, Max_Resolution_MONITOR, Refresh_Rate_MONITOR, PriceMONITOR
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
