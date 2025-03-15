const mongoose = require('mongoose');

const ComputerSpecSchema = new mongoose.Schema({
    CPU: {
      BrandCPU: { type: String, default: "none" },
      SeriesCPU: { type: String, default: "none" },
      ModelCPU: { type: String, default: "none" },
      CPU_Base_Clock: { type: String, default: "none" },
      Socket: { type: String, default: "none" },
      PriceCPU: { type: String, default: "none" }
    },
    MB: {
      BrandMainboard: { type: String, default: "none" },
      ModelMainboard: { type: String, default: "none" },
      Mainboard_CPU_Support: { type: String, default: "none" },
      MemoryMainboard: { type: String, default: "none" },
      Mainboard_Memory_Support: { type: String, default: "none" },
      PriceMainboard: { type: String, default: "none" }
    },
    RAM: {
      RAM_Size: { type: String, default: "none" },
      RAM_Speed: { type: String, default: "none" },
      PriceRAM: { type: String, default: "none" }
    },
    SSD: {
      SSD_Size: { type: String, default: "none" },
      SSD_Seq_Read: { type: String, default: "none" },
      SSD_Seq_Write: { type: String, default: "none" },
      PriceSSD: { type: String, default: "none" }
    },
    PSU: {
      PSU_Power: { type: String, default: "none" },
      PricePSU: { type: String, default: "none" }
    },
    VGA: {
      BrandVGA: { type: String, default: "none" },
      ChipsetVGA: { type: String, default: "none" },
      SeriesVGA: { type: String, default: "none" },
      ModelVGA: { type: String, default: "none" },
      VGA_Base_Clock: { type: String, default: "none" },
      VGA_Boost_Clock: { type: String, default: "none" },
      VGA_Memory_Clock: { type: String, default: "none" },
      VGA_Memory_Size: { type: String, default: "none" },
      PriceVGA: { type: String, default: "none" }
    },
    SSD2: {
      SSD2: { type: String, default: "none" }
    },
    HDD: {
      HDD_Size: { type: String, default: "none" },
      PriceHDD: { type: String, default: "none" }
    },
    CASE: {
      CASE_Type: { type: String, default: "none" },
      PriceCASE: { type: String, default: "none" }
    },
    COOLING: {
      BrandCOOLING: { type: String, default: "none" },
      ModelCOOLING: { type: String, default: "none" },
      Fan_Built_In_COOLING: { type: String, default: "none" },
      PriceCOOLING: { type: String, default: "none" }
    },
    MONITOR: {
      BrandMONITOR: { type: String, default: "none" },
      ModelMONITOR: { type: String, default: "none" },
      Display_Size_MONITOR: { type: String, default: "none" },
      Max_Resolution_MONITOR: { type: String, default: "none" },
      Refresh_Rate_MONITOR: { type: String, default: "none" },
      PriceMONITOR: { type: String, default: "none" }
    }
  }, { timestamps: true });
  
  const ScrapingSpec = mongoose.model("ScrapingSpec", ComputerSpecSchema);
  
  module.exports = { ScrapingSpec };