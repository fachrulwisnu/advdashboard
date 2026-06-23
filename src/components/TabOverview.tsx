import React, { useState, useMemo } from "react";
import { DashboardDataset } from "../types";
import { Card, Icon } from "./UI";
import { statusGroupOf } from "../parser";
import { getGlobalProjectDate, getGlobalProgressUpdate, formatLogWithNewLines, getProjectIntakeYear, formatUATBatchText, calculateProjectAverageScore, getActiveSlaPool } from "../utils";

const INCOMING_PROJECTS_DATA = {
  "Maret": [
    { "ticket": "26030035", "name": "Project Pembuatan menu Penawaran Harga Emas Antam Indonesia", "pic": "MUHAMMAD EUROSKI YUDISETYO", "owner": "ERMAN RATIUS", "div": "GUARDING MANAGEMENT", "type": "Project Utama" },
    { "ticket": "260312015", "name": "PERUBAHAN TAMPILAN PADA DCT BONYS", "pic": "NANDANA BHAKTI KHAER", "owner": "RIA YULITA", "div": "FINANCE & ACCOUNTING", "type": "Approval Digital" },
    { "ticket": "26030028", "name": "Enhancement Flow Process Planner CIT", "pic": "ILHAM NUR HIDAYAT", "owner": "JUNITA", "div": "BUSINESS PROCESS DEVELOPMENT", "type": "Project Utama" },
    { "ticket": "26030618", "name": "Permintaan Type MOA Selisih Escrow Bank Mega", "pic": "BIMO ADI NURZAMAN", "owner": "YUNI SUDIRMAN", "div": "FINANCE & ACCOUNTING", "type": "Approval Digital" },
    { "ticket": "26030043", "name": "CPM 2 Prepare Delivery and Release Version", "pic": "ALDI DWI KURNIAWAN", "owner": "JUNITA", "div": "BUSINESS PROCESS DEVELOPMENT", "type": "Project Utama" },
    { "ticket": "26030025", "name": "Digitalisasi system Preventive Maintenance dan Quality Control", "pic": "BIZDEV", "owner": "JIMMY DARSONO", "div": "WISESA", "type": "Internal IT" },
    { "ticket": "26030042", "name": "CPM 2 Valas Version", "pic": "YUDHA DIRGANTARA", "owner": "JUNITA", "div": "BUSINESS PROCESS DEVELOPMENT", "type": "Project Utama" }
  ],
  "April": [
    { "ticket": "26040045", "name": "Enhance Laporan Pinalty CIT Khusus BNI Medan", "pic": "ALLBY VALDIAN FURIAWAN", "owner": "JUNITA", "div": "BUSINESS PROCESS DEVELOPMENT", "type": "Antrian Enhance Kecil" },
    { "ticket": "26040050", "name": "Enhancement Cargo - Chage Request", "pic": "NANDANA BHAKTI KHAER", "owner": "YUNI SUDIRMAN", "div": "FINANCE & ACCOUNTING", "type": "Enhance Kecil" },
    { "ticket": "260428046", "name": "Penambahan validasi pada saat generate di DCT dan validasi invoice di insyst", "pic": "NANDANA BHAKTI KHAER", "owner": "YUNI SUDIRMAN", "div": "FINANCE & ACCOUNTING", "type": "Approval Digital" },
    { "ticket": "260429021", "name": "Hide Menu Assignment Security DCT SSS", "pic": "ALLBY VALDIAN FURIAWAN", "owner": "OKA AULIA", "div": "BUSINESS PROCESS DEVELOPMENT", "type": "Approval Digital" },
    { "ticket": "260415026", "name": "Enhancement transaksi cargo pada aplikasi insyst", "pic": "NANDANA BHAKTI KHAER", "owner": "YUNI SUDIRMAN", "div": "FINANCE & ACCOUNTING", "type": "Approval Digital" },
    { "ticket": "260429032", "name": "Perubahan Validasi Login DCT Visitor", "pic": "DIVA ADELIA PUTRA", "owner": "JUNITA", "div": "BUSINESS PROCESS DEVELOPMENT", "type": "Approval Digital" },
    { "ticket": "26040049", "name": "Request Order Planning By Mail", "pic": "WAHIDATUZZAHRO FEBRIA FITHRU...", "owner": "JIMMY DARSONO", "div": "WISESA", "type": "Internal IT" },
    { "ticket": "260424007", "name": "Berita Acara Penambahan Rumus Aktivasi Pada Master Entity History", "pic": "NANDANA BHAKTI KHAER", "owner": "DJOKO BUDIANTO", "div": "MARKETING", "type": "Approval Digital" },
    { "ticket": "260430059", "name": "Penambahan tombol duplicate pada menu Lampiran Invoice - Custom Report Setup (CIT) di aplikasi insyst", "pic": "NANDANA BHAKTI KHAER", "owner": "YUNI SUDIRMAN", "div": "FINANCE & ACCOUNTING", "type": "Approval Digital" },
    { "ticket": "26040051", "name": "Enhancement Monitoring Dashboard Problem", "pic": "WAHIDATUZZAHRO FEBRIA FITHRU...", "owner": "HANGGA DAVID ...", "div": "CENTRALIZED OPERATION SUPPORT", "type": "Internal IT" },
    { "ticket": "26040056", "name": "Otomasi Bill Counter dengan OC", "pic": "ZULFIKAR BAYU BUDIMAN", "owner": "JUNITA", "div": "BUSINESS PROCESS DEVELOPMENT", "type": "Project Utama" },
    { "ticket": "260415024", "name": "Enahancement pada menu penerimaan uang di aplikasi insyst", "pic": "NANDANA BHAKTI KHAER", "owner": "YUNI SUDIRMAN", "div": "FINANCE & ACCOUNTING", "type": "Approval Digital" },
    { "ticket": "260423038", "name": "Penyesuaian Web Karir V2", "pic": "ADITYA PUTRA AJI NUR ALAMSYAH", "owner": "ADI WIBOWO", "div": "HUMAN RESOURCES", "type": "Approval Digital" },
    { "ticket": "260427018", "name": "Penambahan Report Physical Cash Data pada Menu Stock Opname", "pic": "MUFID NUR TAMAM", "owner": "NIKEN YULASTRI", "div": "BUSINESS PROCESS DEVELOPMENT", "type": "Approval Digital" },
    { "ticket": "260420065", "name": "PENYESUAIAN PADA FIXAM IT", "pic": "MUFID NUR TAMAM", "owner": "JIMMY DARSONO", "div": "WISESA", "type": "Internal IT" },
    { "ticket": "260420060", "name": "Penambahan Fitur Search Menu Runsheet by Sektor", "pic": "DIVA ADELIA PUTRA", "owner": "OKA AULIA", "div": "BUSINESS PROCESS DEVELOPMENT", "type": "Approval Digital" },
    { "ticket": "260415021", "name": "Enahancement pada accounting system", "pic": "NANDANA BHAKTI KHAER", "owner": "YUNI SUDIRMAN", "div": "FINANCE & ACCOUNTING", "type": "Approval Digital" },
    { "ticket": "260420061", "name": "Pengajuan Setting Report Custom BA CRM Bank OCBC ALL Cabang", "pic": "NANDANA BHAKTI KHAER", "owner": "CICIH RUNIANTI", "div": "CENTRALIZED OPERATION SUPPORT", "type": "Approval Digital" },
    { "ticket": "26040052", "name": "Peningkatan dan Perbaikan Sistem Centran", "pic": "RONA REALITA NAJMA", "owner": "HANGGA DAVID ...", "div": "CENTRALIZED OPERATION SUPPORT", "type": "Internal IT" },
    { "ticket": "260416033", "name": "Penambahan Kolom Status Approval di Report Detail FPTK", "pic": "ADITYA PUTRA AJI NUR ALAMSYAH", "owner": "ADI WIBOWO", "div": "HUMAN RESOURCES", "type": "Approval Digital" },
    { "ticket": "260408018", "name": "Penambahan Kolom Tgl.Maks Kontrak pada Email Reminder Berakhir Masa Kontrak Karyawan", "pic": "ADITYA PUTRA AJI NUR ALAMSYAH", "owner": "ADI WIBOWO", "div": "HUMAN RESOURCES", "type": "Approval Digital" },
    { "ticket": "260408017", "name": "Penambahan Field SIM Terupload di menu FPTK", "pic": "ADITYA PUTRA AJI NUR ALAMSYAH", "owner": "ADI WIBOWO", "div": "HUMAN RESOURCES", "type": "Approval Digital" },
    { "ticket": "26040044", "name": "Enhancement Import Saldo Bank Jateng", "pic": "HASAN KHOIRUL ARI SETIYAWAN", "owner": "NINDYA TRIANA ...", "div": "CENTRALIZED OPERATION SUPPORT", "type": "Enhance Kecil" },
    { "ticket": "260409006", "name": "Enhancement kepada fitur retur untuk invoice COD", "pic": "MUHAMMAD EUROSKI YUDISETYO", "owner": "ERMAN RATIUS", "div": "GUARDING MANAGEMENT", "type": "Approval Digital" }
  ],
  "Mei": [
    { "ticket": "260520014", "name": "PENYESUAIAN H2H TAF UNTUK ADAPTASI PERUBAHAN API SNAP DI SISI TAF DAN DANAMON", "pic": "BIMO ADI NURZAMAN", "owner": "JUNITA", "div": "BUSINESS PROCESS DEVELOPMENT", "type": "Approval Digital" },
    { "ticket": "260528066", "name": "Upgrade Protokol Keamanan Menjadi TLS 1.3 Pada Semua H2H Danamon", "pic": "BIMO ADI NURZAMAN", "owner": "JUNITA", "div": "BUSINESS PROCESS DEVELOPMENT", "type": "Approval Digital" },
    { "ticket": "26050062", "name": "Redesign UI inputer Om Dedy", "pic": "ALDI DWI KURNIAWAN", "owner": "JIMMY DARSONO", "div": "WISESA", "type": "Internal IT" },
    { "ticket": "26050058", "name": "Enhance Otomatisasi Perhitungan EJ", "pic": "BIMO ADI NURZAMAN", "owner": "JUNITA", "div": "BUSINESS PROCESS DEVELOPMENT", "type": "Enhance Kecil" },
    { "ticket": "260506021", "name": "Pengajuan Setting Report Custom BA ATM dan CRM Bank Maybank ALL Cabang", "pic": "NANDANA BHAKTI KHAER", "owner": "CICIH RUNIANTI", "div": "CENTRALIZED OPERATION SUPPORT", "type": "Approval Digital" },
    { "ticket": "260506024", "name": "Permohonan Penyesuaian Informasi User Dan Time Edit Pada History Edit Pricing", "pic": "NANDANA BHAKTI KHAER", "owner": "DJOKO BUDIANTO", "div": "MARKETING", "type": "Approval Digital" },
    { "ticket": "26050057", "name": "INTEGRASI DEKLARASI MOA", "pic": "BIMO ADI NURZAMAN", "owner": "RIA YULITA", "div": "FINANCE & ACCOUNTING", "type": "Enhance Kecil" },
    { "ticket": "26050059", "name": "Route Plan AI", "pic": "RONA REALITA NAJMA", "owner": "JIMMY DARSONO", "div": "WISESA", "type": "Internal IT" },
    { "ticket": "260511005", "name": "Penambahan Label Total Per Denom pada Detail Physical Cash Data", "pic": "MUFID NUR TAMAM", "owner": "NIKEN YULASTRI", "div": "BUSINESS PROCESS DEVELOPMENT", "type": "Approval Digital" }
  ],
  "Juni": [
    { "ticket": "260617024", "name": "Penambahan Cabang Serang Rawamangun dan Karawang API Webportal Bank MAS", "pic": "ILHAM NUR HIDAYAT", "owner": "NIKEN YULASTRI", "div": "BUSINESS PROCESS DEVELOPMENT", "type": "Approval Digital" },
    { "ticket": "260604058", "name": "Perubahan Lookup Data Input roster Risk Management", "pic": "DIVA ADELIA PUTRA", "owner": "ADI WIBOWO", "div": "HUMAN RESOURCES", "type": "Approval Digital" },
    { "ticket": "260612007", "name": "Penambahan Kolom Instruksi dan Keterangan Tugas pada Report DCT On Site Surveillance", "pic": "ADITYA PUTRA AJI NUR ALAMSYAH", "owner": "ISHAK", "div": "BUSINESS PROCESS DEVELOPMENT", "type": "Approval Digital" },
    { "ticket": "26060073", "name": "Penambahan Category FIT ATM", "pic": "MUHAMMAD EUROSKI YUDISETYO", "owner": "NIKEN YULASTRI", "div": "BUSINESS PROCESS DEVELOPMENT", "type": "Project Utama" },
    { "ticket": "260611044", "name": "Permintaan Perubahan Parameter Dormant Layanan Nasabah Prodia Menjadi 180 Hari", "pic": "NANDANA BHAKTI KHAER", "owner": "AMANDHA MARI...", "div": "MARKETING", "type": "Approval Digital" },
    { "ticket": "26060069", "name": "Host to Host Setoran Mesin CDM GLORY DE-70 (PT. Gemma) sampai terkredit ke Maybank", "pic": "ALDI DWI KURNIAWAN", "owner": "JUNITA", "div": "BUSINESS PROCESS DEVELOPMENT", "type": "Enhance Kecil" }
  ]
};

const HISTORICAL_QUEUE_SNAPSHOT = [
  {
    "Project On Queue": "W5 Mar 26",
    "Column11": "W1 Apr 26",
    "Column18": "W2 Apr 26",
    "Column25": "W3 Apr 26"
  },
  {
    "Project On Queue": 1,
    "Column5": 23110064,
    "Column6": "Recon Data Electronic Transaksi H2H Mesin Depos.id",
    "Column7": "BIMO ADI NURZAMAN",
    "Column8": "JUNITA",
    "Column9": "BUSINESS PROCESS DEVELOPMENT",
    "Column11": 1,
    "Column12": 23110064,
    "Column13": "Recon Data Electronic Transaksi H2H Mesin Depos.id",
    "Column14": "BIMO ADI NURZAMAN",
    "Column15": "JUNITA",
    "Column16": "BUSINESS PROCESS DEVELOPMENT",
    "Column18": 1,
    "Column19": 23110064,
    "Column20": "Recon Data Electronic Transaksi H2H Mesin Depos.id",
    "Column21": "BIMO ADI NURZAMAN",
    "Column22": "JUNITA",
    "Column23": "BUSINESS PROCESS DEVELOPMENT",
    "Column25": 1,
    "Column26": "Roy_001",
    "Column27": "FPS Interface Saldo Kill By XML C2",
    "Column28": "ROY PERMANA",
    "Column29": "JUNITA",
    "Column30": "BUSINESS PROCESS DEVELOPMENT"
  },
  {
    "Project On Queue": 2,
    "Column5": "Roy_001",
    "Column6": "FPS Interface Saldo Kill By XML C2",
    "Column7": "ROY PERMANA",
    "Column8": "JUNITA",
    "Column9": "BUSINESS PROCESS DEVELOPMENT",
    "Column11": 2,
    "Column12": "Roy_001",
    "Column13": "FPS Interface Saldo Kill By XML C2",
    "Column14": "ROY PERMANA",
    "Column15": "JUNITA",
    "Column16": "BUSINESS PROCESS DEVELOPMENT",
    "Column18": 2,
    "Column19": "Roy_001",
    "Column20": "FPS Interface Saldo Kill By XML C2",
    "Column21": "ROY PERMANA",
    "Column22": "JUNITA",
    "Column23": "BUSINESS PROCESS DEVELOPMENT",
    "Column25": 2,
    "Column26": 25020019,
    "Column27": "Pembuatan Menu Sentralisasi ADMIN CPC dari DCT Desktop ke DCT WEB",
    "Column28": "MUHAMMAD EUROSKI YUDISETYO",
    "Column29": "NIKEN YULASTRI",
    "Column30": "BUSINESS PROCESS DEVELOPMENT"
  },
  {
    "Project On Queue": 3,
    "Column5": 24110077,
    "Column6": "DISCLAIM DOWNTIME (BANK BCA)",
    "Column7": "MUFID NUR TAMAM",
    "Column8": "HANGGA DAVID TORA ANGGRIAWAN",
    "Column9": "CENTRALIZED OPERATION SUPPORT",
    "Column11": 3,
    "Column12": 24110077,
    "Column13": "DISCLAIM DOWNTIME (BANK BCA)",
    "Column14": "MUFID NUR TAMAM",
    "Column15": "HANGGA DAVID TORA ANGGRIAWAN",
    "Column16": "CENTRALIZED OPERATION SUPPORT",
    "Column18": 3,
    "Column19": 24110077,
    "Column20": "DISCLAIM DOWNTIME (BANK BCA)",
    "Column21": "MUFID NUR TAMAM",
    "Column22": "HANGGA DAVID TORA ANGGRIAWAN",
    "Column23": "CENTRALIZED OPERATION SUPPORT",
    "Column25": 3,
    "Column26": 25060059,
    "Column27": "Penyesuaian API Route Plan EasyGo",
    "Column28": "DIVA ADELIA PUTRA",
    "Column29": "JUNITA",
    "Column30": "BUSINESS PROCESS DEVELOPMENT"
  },
  {
    "Project On Queue": 4,
    "Column5": 25020019,
    "Column6": "Pembuatan Menu Sentralisasi ADMIN CPC dari DCT Desktop ke DCT WEB",
    "Column7": "MUHAMMAD EUROSKI YUDISETYO",
    "Column8": "NIKEN YULASTRI",
    "Column9": "BUSINESS PROCESS DEVELOPMENT",
    "Column11": 4,
    "Column12": 25020019,
    "Column13": "Pembuatan Menu Sentralisasi ADMIN CPC dari DCT Desktop ke DCT WEB",
    "Column14": "MUHAMMAD EUROSKI YUDISETYO",
    "Column15": "NIKEN YULASTRI",
    "Column16": "BUSINESS PROCESS DEVELOPMENT",
    "Column18": 4,
    "Column19": 25020019,
    "Column20": "Pembuatan Menu Sentralisasi ADMIN CPC dari DCT Desktop ke DCT WEB",
    "Column21": "MUHAMMAD EUROSKI YUDISETYO",
    "Column22": "NIKEN YULASTRI",
    "Column23": "BUSINESS PROCESS DEVELOPMENT",
    "Column25": 4,
    "Column26": 25050045,
    "Column27": "Enhance Portal Cosy Perubahan PIN & Password, dan Approval Over Limit",
    "Column28": "BIMO ADI NURZAMAN",
    "Column29": "JUNITA",
    "Column30": "BUSINESS PROCESS DEVELOPMENT"
  },
  {
    "Project On Queue": 5,
    "Column5": 25060059,
    "Column6": "Penyesuaian API Route Plan EasyGo",
    "Column7": "DIVA ADELIA PUTRA",
    "Column8": "JUNITA",
    "Column9": "BUSINESS PROCESS DEVELOPMENT",
    "Column11": 5,
    "Column12": 25060059,
    "Column13": "Penyesuaian API Route Plan EasyGo",
    "Column14": "DIVA ADELIA PUTRA",
    "Column15": "JUNITA",
    "Column16": "BUSINESS PROCESS DEVELOPMENT",
    "Column18": 5,
    "Column19": 25060059,
    "Column20": "Penyesuaian API Route Plan EasyGo",
    "Column21": "DIVA ADELIA PUTRA",
    "Column22": "JUNITA",
    "Column23": "BUSINESS PROCESS DEVELOPMENT",
    "Column25": 5,
    "Column26": 25070070,
    "Column27": "Enhancement Penambahan Materai dan Import PDF Coretax pada Faktur Insyst",
    "Column28": "NANDANA BHAKTI KHAER",
    "Column29": "YUNI SUDIRMAN",
    "Column30": "FINANCE & ACCOUNTING"
  },
  {
    "Project On Queue": 6,
    "Column5": 25050045,
    "Column6": "Enhance Portal Cosy Perubahan PIN & Password, dan Approval Over Limit",
    "Column7": "BIMO ADI NURZAMAN",
    "Column8": "JUNITA",
    "Column9": "BUSINESS PROCESS DEVELOPMENT",
    "Column11": 6,
    "Column12": 25050045,
    "Column13": "Enhance Portal Cosy Perubahan PIN & Password, dan Approval Over Limit",
    "Column14": "BIMO ADI NURZAMAN",
    "Column15": "JUNITA",
    "Column16": "BUSINESS PROCESS DEVELOPMENT",
    "Column18": 6,
    "Column19": 25050045,
    "Column20": "Enhance Portal Cosy Perubahan PIN & Password, dan Approval Over Limit",
    "Column21": "BIMO ADI NURZAMAN",
    "Column22": "JUNITA",
    "Column23": "BUSINESS PROCESS DEVELOPMENT",
    "Column25": 6,
    "Column26": 25080080,
    "Column27": "Enhancement Monitoring Risk Event Phase 4 : DCT Loading Berita Acara Manual Loading",
    "Column28": "ROY PERMANA",
    "Column29": "JUNITA",
    "Column30": "BUSINESS PROCESS DEVELOPMENT"
  },
  {
    "Project On Queue": 7,
    "Column5": 25070070,
    "Column6": "Enhancement Penambahan Materai dan Import PDF Coretax pada Faktur Insyst",
    "Column7": "NANDANA BHAKTI KHAER",
    "Column8": "YUNI SUDIRMAN",
    "Column9": "FINANCE & ACCOUNTING",
    "Column11": 7,
    "Column12": 25070070,
    "Column13": "Enhancement Penambahan Materai dan Import PDF Coretax pada Faktur Insyst",
    "Column14": "NANDANA BHAKTI KHAER",
    "Column15": "YUNI SUDIRMAN",
    "Column16": "FINANCE & ACCOUNTING",
    "Column18": 7,
    "Column19": 25070070,
    "Column20": "Enhancement Penambahan Materai dan Import PDF Coretax pada Faktur Insyst",
    "Column21": "NANDANA BHAKTI KHAER",
    "Column22": "YUNI SUDIRMAN",
    "Column23": "FINANCE & ACCOUNTING",
    "Column25": 7,
    "Column26": 25090091,
    "Column27": "Enhancement Sistem untuk Loading Sebagian (Unfinished RUN)",
    "Column28": "ALLBY VALDIAN FURIAWAN",
    "Column29": "JUNITA",
    "Column30": "BUSINESS PROCESS DEVELOPMENT"
  },
  {
    "Project On Queue": 8,
    "Column5": 25080080,
    "Column6": "Enhancement Monitoring Risk Event Phase 4 : DCT Loading Berita Acara Manual Loading",
    "Column7": "ROY PERMANA",
    "Column8": "JUNITA",
    "Column9": "BUSINESS PROCESS DEVELOPMENT",
    "Column11": 8,
    "Column12": 25080080,
    "Column13": "Enhancement Monitoring Risk Event Phase 4 : DCT Loading Berita Acara Manual Loading",
    "Column14": "ROY PERMANA",
    "Column15": "JUNITA",
    "Column16": "BUSINESS PROCESS DEVELOPMENT",
    "Column18": 8,
    "Column19": 25080080,
    "Column20": "Enhancement Monitoring Risk Event Phase 4 : DCT Loading Berita Acara Manual Loading",
    "Column21": "ROY PERMANA",
    "Column22": "JUNITA",
    "Column23": "BUSINESS PROCESS DEVELOPMENT",
    "Column25": 8,
    "Column26": 25100101,
    "Column27": "Host to Host Setoran Mesin Kisan sampai Terkredit ke Maybank",
    "Column28": "NANDANA BHAKTI KHAER",
    "Column29": "JUNITA",
    "Column30": "BUSINESS PROCESS DEVELOPMENT"
  },
  {
    "Project On Queue": 9,
    "Column5": 25090091,
    "Column6": "Enhancement Sistem untuk Loading Sebagian (Unfinished RUN)",
    "Column7": "ROY PERMANA",
    "Column8": "JUNITA",
    "Column9": "BUSINESS PROCESS DEVELOPMENT",
    "Column11": 9,
    "Column12": 25090091,
    "Column13": "Enhancement Sistem untuk Loading Sebagian (Unfinished RUN)",
    "Column14": "ROY PERMANA",
    "Column15": "JUNITA",
    "Column16": "BUSINESS PROCESS DEVELOPMENT",
    "Column18": 9,
    "Column19": 25090091,
    "Column20": "Enhancement Sistem untuk Loading Sebagian (Unfinished RUN)",
    "Column21": "ROY PERMANA",
    "Column22": "JUNITA",
    "Column23": "BUSINESS PROCESS DEVELOPMENT",
    "Column25": 9,
    "Column26": 25100107,
    "Column27": "Enhancement E-Pricing Batch 2",
    "Column28": "NANDANA BHAKTI KHAER",
    "Column29": "AMANDHA MARIZA",
    "Column30": "MARKETING"
  },
  {
    "Project On Queue": 10,
    "Column5": 25100101,
    "Column6": "Host to Host Setoran Mesin Kisan sampai Terkredit ke Maybank",
    "Column7": "NANDANA BHAKTI KHAER",
    "Column8": "JUNITA",
    "Column9": "BUSINESS PROCESS DEVELOPMENT",
    "Column11": 10,
    "Column12": 25100101,
    "Column13": "Host to Host Setoran Mesin Kisan sampai Terkredit ke Maybank",
    "Column14": "NANDANA BHAKTI KHAER",
    "Column15": "JUNITA",
    "Column16": "BUSINESS PROCESS DEVELOPMENT",
    "Column18": 10,
    "Column19": 25100101,
    "Column20": "Host to Host Setoran Mesin Kisan sampai Terkredit ke Maybank",
    "Column21": "NANDANA BHAKTI KHAER",
    "Column22": "JUNITA",
    "Column23": "BUSINESS PROCESS DEVELOPMENT",
    "Column25": 10,
    "Column26": 26010013,
    "Column27": "Enhance lanjutan sistem PIC flm advance open lock validation",
    "Column28": "HASAN KHOIRUL ARI SETIYAWAN",
    "Column29": "HANGGA DAVID TORA ANGGRIAWAN",
    "Column30": "CENTRALIZED OPERATION SUPPORT"
  },
  {
    "Project On Queue": 11,
    "Column5": 25100107,
    "Column6": "Enhancement E-Pricing Batch 2",
    "Column7": "NANDANA BHAKTI KHAER",
    "Column8": "AMANDHA MARIZA",
    "Column9": "MARKETING",
    "Column11": 11,
    "Column12": 25100107,
    "Column13": "Enhancement E-Pricing Batch 2",
    "Column14": "NANDANA BHAKTI KHAER",
    "Column15": "AMANDHA MARIZA",
    "Column16": "MARKETING",
    "Column18": 11,
    "Column19": 25100107,
    "Column20": "Enhancement E-Pricing Batch 2",
    "Column21": "NANDANA BHAKTI KHAER",
    "Column22": "AMANDHA MARIZA",
    "Column23": "MARKETING",
    "Column25": 11,
    "Column26": 25100103,
    "Column27": "Enhancement Insyst dan DCT Web",
    "Column28": "NANDANA BHAKTI KHAER",
    "Column29": "YUNI SUDIRMAN",
    "Column30": "FINANCE & ACCOUNTING"
  },
  {
    "Project On Queue": 12,
    "Column5": 26010013,
    "Column6": "Enhance lanjutan sistem PIC flm advance open lock validation",
    "Column7": "HASAN KHOIRUL ARI SETIYAWAN",
    "Column8": "HANGGA DAVID TORA ANGGRIAWAN",
    "Column9": "CENTRALIZED OPERATION SUPPORT",
    "Column11": 12,
    "Column12": 26010013,
    "Column13": "Enhance lanjutan sistem PIC flm advance open lock validation",
    "Column14": "HASAN KHOIRUL ARI SETIYAWAN",
    "Column15": "HANGGA DAVID TORA ANGGRIAWAN",
    "Column16": "CENTRALIZED OPERATION SUPPORT",
    "Column18": 12,
    "Column19": 26010013,
    "Column20": "Enhance lanjutan sistem PIC flm advance open lock validation",
    "Column21": "HASAN KHOIRUL ARI SETIYAWAN",
    "Column22": "HANGGA DAVID TORA ANGGRIAWAN",
    "Column23": "CENTRALIZED OPERATION SUPPORT",
    "Column25": 12,
    "Column26": 26020016,
    "Column27": "Enhance DCT FLM - Request FLM Sektor",
    "Column28": "HASAN KHOIRUL ARI SETIYAWAN",
    "Column29": "HANGGA DAVID TORA ANGGRIAWAN",
    "Column30": "CENTRALIZED OPERATION SUPPORT"
  },
  {
    "Project On Queue": 13,
    "Column5": 25100103,
    "Column6": "Enhancement Insyst dan DCT Web",
    "Column7": "NANDANA BHAKTI KHAER",
    "Column8": "YUNI SUDIRMAN",
    "Column9": "FINANCE & ACCOUNTING",
    "Column11": 13,
    "Column12": 25100103,
    "Column13": "Enhancement Insyst dan DCT Web",
    "Column14": "NANDANA BHAKTI KHAER",
    "Column15": "YUNI SUDIRMAN",
    "Column16": "FINANCE & ACCOUNTING",
    "Column18": 13,
    "Column19": 25100103,
    "Column20": "Enhancement Insyst dan DCT Web",
    "Column21": "NANDANA BHAKTI KHAER",
    "Column22": "YUNI SUDIRMAN",
    "Column23": "FINANCE & ACCOUNTING",
    "Column25": 13,
    "Column26": 26030028,
    "Column27": "Enhancement Flow Process Planner CIT",
    "Column28": "ILHAM NUR HIDAYAT",
    "Column29": "JUNITA",
    "Column30": "BUSINESS PROCESS DEVELOPMENT"
  },
  {
    "Project On Queue": 14,
    "Column5": 26020016,
    "Column6": "Enhance DCT FLM - Request FLM Sektor",
    "Column7": "HASAN KHOIRUL ARI SETIYAWAN",
    "Column8": "HANGGA DAVID TORA ANGGRIAWAN",
    "Column9": "CENTRALIZED OPERATION SUPPORT",
    "Column11": 14,
    "Column12": 26020016,
    "Column13": "Enhance DCT FLM - Request FLM Sektor",
    "Column14": "HASAN KHOIRUL ARI SETIYAWAN",
    "Column15": "HANGGA DAVID TORA ANGGRIAWAN",
    "Column16": "CENTRALIZED OPERATION SUPPORT",
    "Column18": 14,
    "Column19": 26020016,
    "Column20": "Enhance DCT FLM - Request FLM Sektor",
    "Column21": "HASAN KHOIRUL ARI SETIYAWAN",
    "Column22": "HANGGA DAVID TORA ANGGRIAWAN",
    "Column23": "CENTRALIZED OPERATION SUPPORT",
    "Column25": 14,
    "Column26": 26030035,
    "Column27": "Penawaran Harga",
    "Column28": "MUHAMMAD EUROSKI YUDISETYO",
    "Column29": "ERMAN RATIUS",
    "Column30": "GUARDING MANAGEMENT"
  },
  {
    "Column11": 15,
    "Column12": 26030028,
    "Column13": "Enhancement Flow Process Planner CIT",
    "Column14": "ILHAM NUR HIDAYAT",
    "Column15": "JUNITA",
    "Column16": "BUSINESS PROCESS DEVELOPMENT",
    "Column18": 15,
    "Column19": 26030028,
    "Column20": "Enhancement Flow Process Planner CIT",
    "Column21": "ILHAM NUR HIDAYAT",
    "Column22": "JUNITA",
    "Column23": "BUSINESS PROCESS DEVELOPMENT",
    "Column25": 15,
    "Column26": 26040045,
    "Column27": "Enhance Laporan Pinalty CIT Khusus BNI Medan",
    "Column28": "ALLBY VALDIAN FURIAWAN",
    "Column29": "JUNITA",
    "Column30": "BUSINESS PROCESS DEVELOPMENT"
  },
  {
    "Column11": 16,
    "Column12": 26030035,
    "Column13": "Penawaran Harga",
    "Column14": "MUHAMMAD EUROSKI YUDISETYO",
    "Column15": "ERMAN RATIUS",
    "Column16": "GUARDING MANAGEMENT",
    "Column18": 16,
    "Column19": 26030035,
    "Column20": "Penawaran Harga",
    "Column21": "MUHAMMAD EUROSKI YUDISETYO",
    "Column22": "ERMAN RATIUS",
    "Column23": "GUARDING MANAGEMENT",
    "Column25": 16,
    "Column26": 26020015,
    "Column27": "CPM 2 RTGS Version",
    "Column28": "ROY PERMANA",
    "Column29": "JUNITA",
    "Column30": "BUSINESS PROCESS DEVELOPMENT"
  },
  {
    "Column18": 17,
    "Column19": 26040045,
    "Column20": "Enhance Laporan Pinalty CIT Khusus BNI Medan",
    "Column21": "ALLBY VALDIAN FURIAWAN",
    "Column22": "JUNITA",
    "Column23": "BUSINESS PROCESS DEVELOPMENT",
    "Column25": 17,
    "Column26": 26030042,
    "Column27": "CPM 2 Valas Version",
    "Column28": "ROY PERMANA",
    "Column29": "JUNITA",
    "Column30": "BUSINESS PROCESS DEVELOPMENT"
  },
  {
    "Column18": 18,
    "Column19": 26020015,
    "Column20": "CPM 2 RTGS Version",
    "Column21": "ROY PERMANA",
    "Column22": "JUNITA",
    "Column23": "BUSINESS PROCESS DEVELOPMENT",
    "Column25": 18,
    "Column26": 26030043,
    "Column27": "CPM 2 Prepare Delivery and Release Version",
    "Column28": "ROY PERMANA",
    "Column29": "JUNITA",
    "Column30": "BUSINESS PROCESS DEVELOPMENT"
  },
  {
    "Column18": 19,
    "Column19": 26030042,
    "Column20": "CPM 2 Valas Version",
    "Column21": "ROY PERMANA",
    "Column22": "JUNITA",
    "Column23": "BUSINESS PROCESS DEVELOPMENT"
  },
  {
    "Column18": 20,
    "Column19": 26030043,
    "Column20": "CPM 2 Prepare Delivery and Release Version",
    "Column21": "ROY PERMANA",
    "Column22": "JUNITA",
    "Column23": "BUSINESS PROCESS DEVELOPMENT"
  }
];

interface TabOverviewProps {
  dataset: DashboardDataset;
  onNavigateToTab: (index: number) => void | any;
  filteredProjects?: any[];
  allProjects?: any[];
  startMonth?: string;
  endMonth?: string;
}

function ProgressCircle({ pct, color, size = 128, strokeWidth = 12 }: { pct: number; color: string; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center select-none bg-white rounded-full z-10 shadow-3xs" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Underlay base circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-gray-100"
          strokeWidth={strokeWidth}
          fill="white"
        />
        {/* Colorful dynamic progress ring arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-2xl font-extrabold text-slate-800 font-sans">{pct}%</span>
    </div>
  );
}

// Helper to extract feedback comments
const getFeedbackComments = (p: any): string[] => {
  const comments: string[] = [];
  Object.keys(p).forEach((key) => {
    if (key.trim().toLowerCase().startsWith("nilai feedback user")) {
      if (key.includes("\n")) {
        const parts = key.split("\n");
        const afterNewline = parts.slice(1).join("\n").trim();
        if (afterNewline) {
          comments.push(afterNewline);
          return;
        }
      }
      const val = p[key];
      if (val && typeof val === "string" && val.trim() !== "") {
        comments.push(val.trim());
      }
    }
  });
  return comments;
};

function getBusinessOperationalData(dataset: any[]): any[] {
  if (!dataset || !Array.isArray(dataset)) return [];
  
  return dataset.filter(item => {
    if (!item || typeof item !== "object") return false;
    const projType = (item["Project Type"] || item["Type"] || item["Type Project"] || "").toString().toUpperCase();
    const division = item["Owner Div"] ? String(item["Owner Div"]).trim().toUpperCase() : "";
    const type = item["Type Project"] ? String(item["Type Project"]).trim().toUpperCase() : "";
    const name = item["Project Name"] ? String(item["Project Name"]).trim().toUpperCase() : "";
    
    // Strict Internal IT & Wisesa Exclusion based on project type, and standard IT division/Approval Digital rules
    if (projType === "INTERNAL IT" || projType === "WISESA" || division === "IT" || division === "INFORMATION TECHNOLOGY" || division === "WISESA") {
      return false;
    }
    
    const isApprovalDigital = type === "APPROVAL DIGITAL" || name.startsWith("APPROVAL DIGITAL");
    return !isApprovalDigital;
  });
}

function getStandardizedStatus(rawStatus: any, rawNotes: any): string {
  const statusStr = (rawStatus || "").toString().toLowerCase();
  const notesStr = (rawNotes || "").toString().toLowerCase();
  
  if (statusStr.includes("pic input caldev cr") || notesStr.includes("pic input caldev cr")) {
    return "On Development";
  }
  
  return rawStatus || "";
}

function getStandardizedRemark(rawRemark: any): React.ReactNode {
  if (!rawRemark) return "—";
  
  const remarkStr = rawRemark.toString().trim();
  
  // Rule: Alias internal technical status to "On Development" for reporting
  if (remarkStr.toLowerCase().includes("pic input caldev cr")) {
    return (
      <span className="inline-block text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase">
        On Development
      </span>
    );
  }
  
  return remarkStr;
}

function getDisplayStatusLabel(item: any): string {
  if (!item) return "";
  const lastStatus = (item["Last Status"] || "").toString().trim().toLowerCase();
  const fsd = (item["(FSD) Status"] || "").toString().trim().toLowerCase();
  const dev = (item["(Dev) Status"] || "").toString().trim().toLowerCase();
  const sit = (item["(SIT) Status"] || "").toString().trim().toLowerCase();
  const uat = (item["(UAT) Status"] || "").toString().trim().toLowerCase();
  const cr = (item["(Change Request) Status"] || "").toString().trim().toLowerCase();

  const isFsdActive = ["on progress", "on review owner", "on review it", "on revisi it", "on approval"].some(s => fsd === s || fsd.includes("progress"));
  const isDevActive = dev.includes("progress") || dev.includes("queue");
  const isSitActive = sit.includes("progress") || sit.includes("queue");
  const isUatActive = uat.includes("progress") || uat.includes("queue");
  const isCrActive = cr.includes("progress") || lastStatus.includes("change request") || lastStatus.includes("pic input caldev cr");

  if (isFsdActive) return "fsd";
  if (isDevActive) return "dev";
  if (isSitActive) return "sit";
  if (isUatActive) return "uat";
  if (isCrActive) return "change request";
  
  return lastStatus;
}

function getStagePriorityWeight(item: any): number {
  if (!item) return 6;
  const displayLabel = getDisplayStatusLabel(item).toLowerCase();
  if (displayLabel.includes("fsd")) return 1;
  if (displayLabel.includes("dev") || displayLabel.includes("on development")) return 2;
  if (displayLabel.includes("sit")) return 3;
  if (displayLabel.includes("uat")) return 4;
  if (displayLabel.includes("change request") || displayLabel.includes("cr")) return 5;
  return 6; // Fallback
}

function getStrictSortWeight(item: any): number {
  if (!item) return 99;
  const lastStatus = (item["Last Status"] || "").toLowerCase();
  const devStatus = (item["(Dev) Status"] || "").toLowerCase();
  const fsdStatus = (item["(FSD) Status"] || "").toLowerCase();

  // 1. FSD On Progress (Top priority)
  if (["on progress", "on review owner", "on review it", "on revisi it", "on approval"].some(s => fsdStatus === s || fsdStatus.includes("progress")) || lastStatus.includes("fsd")) return 1;
  
  // 2. Dev On Queue
  if (devStatus.includes("queue") || lastStatus === "dev on queue") return 2;
  
  // 3. Dev On Progress
  if (devStatus.includes("progress") || lastStatus === "dev on progress") return 3;
  
  // 4. SIT
  if (lastStatus.includes("sit")) return 4;
  
  // 5. Change Request On Progress / Caldev
  if (lastStatus.includes("change request") || lastStatus.includes("caldev") || lastStatus.includes("cr")) return 5;

  return 99; // Fallback
}

export function TabOverview({ dataset, onNavigateToTab, filteredProjects, allProjects, startMonth, endMonth }: TabOverviewProps) {
  const { report, kpis, devSla2026, yoySla, feedback, uatRescheduled, goLive } = dataset;
  const list = filteredProjects || [];

  const inProgress2026Count = useMemo(() => {
    const rawData = (window as any).rawMasterDataset || allProjects || filteredProjects || [];
    return getBusinessOperationalData(rawData).filter(item => {
      const is2026 = (item["Intake"] || item["Year"] || item["_year"] || "").toString().includes("2026");
      const lastStatus = (item["Last Status"] || "").trim().toLowerCase();
      
      const fsd = (item["(FSD) Status"] || "").trim().toLowerCase();
      const dev = (item["(Dev) Status"] || "").trim().toLowerCase();
      const sit = (item["(SIT) Status"] || "").trim().toLowerCase();
      const uat = (item["(UAT) Status"] || "").trim().toLowerCase();
      const cr = (item["(Change Request) Status"] || "").trim().toLowerCase();

      // 1. MUST be a 2026 project
      if (!is2026) return false;

      // 2. STRICT EXCLUSION: Drop Completed (Live) and Canceled projects
      if (lastStatus.includes("live") || lastStatus.includes("cancel") || lastStatus.includes("terminated") || lastStatus.includes("closed")) {
        return false;
      }

      // 3. CAPTURE ACTIVE PHASES (Progress & Queues)
      const isFsdActive = fsd.includes("progress") || lastStatus.includes("fsd on progress");
      const isDevActive = dev.includes("progress") || dev.includes("queue") || lastStatus.includes("dev on progress") || lastStatus.includes("dev on queue");
      const isSitActive = sit.includes("progress") || sit.includes("queue") || lastStatus.includes("sit on progress");
      const isUatActive = uat.includes("progress") || uat.includes("queue") || lastStatus.includes("uat on queue") || lastStatus.includes("uat on progress");
      const isCrActive = cr.includes("progress") || lastStatus.includes("change request on progress") || lastStatus.includes("caldev");

      return isFsdActive || isDevActive || isSitActive || isUatActive || isCrActive;
    }).length;
  }, [allProjects, filteredProjects]);

  const inProgress2025Count = useMemo(() => {
    const rawData = (window as any).rawMasterDataset || allProjects || filteredProjects || [];
    return getBusinessOperationalData(rawData).filter(item => {
      const is2025 = (item["Intake"] || item["Year"] || item["_year"] || "").toString().includes("2025");
      const lastStatus = (item["Last Status"] || "").trim().toLowerCase();
      
      const fsd = (item["(FSD) Status"] || "").trim().toLowerCase();
      const dev = (item["(Dev) Status"] || "").trim().toLowerCase();
      const sit = (item["(SIT) Status"] || "").trim().toLowerCase();
      const uat = (item["(UAT) Status"] || "").trim().toLowerCase();
      const cr = (item["(Change Request) Status"] || "").trim().toLowerCase();

      // 1. MUST be a 2025 project
      if (!is2025) return false;

      // 2. STRICT EXCLUSION: Drop Completed (Live) and Canceled projects
      if (lastStatus.includes("live") || lastStatus.includes("cancel") || lastStatus.includes("terminated") || lastStatus.includes("closed")) {
        return false;
      }

      // 3. CAPTURE ACTIVE PHASES (Progress & Queues)
      const isFsdActive = fsd.includes("progress") || lastStatus.includes("fsd on progress");
      const isDevActive = dev.includes("progress") || dev.includes("queue") || lastStatus.includes("dev on progress") || lastStatus.includes("dev on queue");
      const isSitActive = sit.includes("progress") || sit.includes("queue") || lastStatus.includes("sit on progress");
      const isUatActive = uat.includes("progress") || uat.includes("queue") || lastStatus.includes("uat on queue") || lastStatus.includes("uat on progress");
      const isCrActive = cr.includes("progress") || lastStatus.includes("change request on progress") || lastStatus.includes("caldev");

      return isFsdActive || isDevActive || isSitActive || isUatActive || isCrActive;
    }).length;
  }, [allProjects, filteredProjects]);

  const item2025 = yoySla.find(item => item.year === "2025");
  const item2026 = yoySla.find(item => item.year === "2026");
  const count2025 = item2025 ? ((item2025.inProgress || 0) + (item2025.completed || 0)) : 0;
  const count2026 = item2026 ? ((item2026.inProgress || 0) + (item2026.completed || 0)) : 0;

  // Active status groups
  const activeTypes = ['Antrian', 'Dalam Proses', 'UAT', 'Monitoring', 'Hold', 'Change Request'];

  const delayedUATProjects = useMemo(() => {
    return list.filter(p => {
      const uatLate = p._lateUAT || 0;
      const reschedVal = p["Reschedule UAT"] || 0;
      const statusGrp = statusGroupOf(p["Last Status"]);
      const isActive = statusGrp !== "Live" && statusGrp !== "Canceled";
      return isActive && (uatLate > 0 || reschedVal > 0);
    });
  }, [list]);

  // Modal State
  const [activeModal, setActiveModal] = useState<{
    title: string;
    type: 'feedback' | 'contributors' | 'kpi_card' | 'milestone_sla' | 'yoy_comparison' | 'uat_delay_audit' | 'historical_queue';
    projects?: any[];
    kpiKey?: 'queue' | 'progress' | 'uat' | 'monitoring' | 'hold';
    stageName?: 'FSD' | 'DEV' | 'SIT' | 'UAT' | 'LIVE';
  } | null>(null);

  const [selectedHistTab, setSelectedHistTab] = useState<'W5 Mar 26' | 'W1 Apr 26' | 'W2 Apr 26' | 'W3 Apr 26'>('W3 Apr 26');
  const [modalActiveView, setModalActiveView] = useState<'backlog' | 'incoming'>('backlog');
  const [selectedIncomingMonth, setSelectedIncomingMonth] = useState<'Maret' | 'April' | 'Mei' | 'Juni'>('Maret');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Render gold rating stars accurately
  const renderStars = (filled: number) => {
    return (
      <div className="flex items-center gap-1.5 mt-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <svg
            key={s}
            className={`w-4 h-4 ${s <= filled ? "text-amber-400 fill-current" : "text-gray-250"}`}
            xmlns="https://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // Safe query to obtain "Queue" specifically (which strictly matches "On Queue") - COMPLETELY IMMUNE TO FILTERS
  const globalRawList = allProjects || [];
  const queueProjectsPool = useMemo(() => {
    return globalRawList.filter(item => {
      const status = item["Last Status"] ? item["Last Status"].trim().toLowerCase() : "";
      const ticketNumber = String(item["No Ticket"] || item["Ticket"] || "");

      // Rule: Must be strictly "On Queue" and must NOT be a new 2026 project entry
      return (status === "on queue" || status === "queue") && !ticketNumber.startsWith("26");
    });
  }, [globalRawList]);

  const queueCount = queueProjectsPool.length;

  // Progress Count: Filtered dynamically from active month-to-month range, excluding UAT and strictly excluding Live status
  const cleanInProgressPool = useMemo(() => {
    const rawData = (window as any).rawMasterDataset || globalRawList || list || [];
    return getBusinessOperationalData(rawData).filter(item => {
      const lastStatus = item["Last Status"] ? String(item["Last Status"]).trim().toLowerCase() : "";
      const fsd = item["(FSD) Status"] ? String(item["(FSD) Status"]).trim().toLowerCase() : "";
      const dev = item["(Dev) Status"] ? String(item["(Dev) Status"]).trim().toLowerCase() : "";
      const sit = item["(SIT) Status"] ? String(item["(SIT) Status"]).trim().toLowerCase() : "";
      const cr = item["(Change Request) Status"] ? String(item["(Change Request) Status"]).trim().toLowerCase() : "";

      // Exclude Live/Canceled
      if (lastStatus.includes("live") || lastStatus.includes("cancel")) return false;

      const isFsd = ["on progress", "on review owner", "on review it", "on revisi it", "on approval"].some(s => fsd === s || fsd.includes("progress"));
      const isDev = dev.includes("progress") || dev.includes("queue") || lastStatus.includes("dev on queue") || lastStatus.includes("dev on progress");
      const isSit = sit.includes("progress") || sit.includes("queue") || lastStatus.includes("sit");
      const isCr = cr.includes("progress") || lastStatus.includes("change request") || lastStatus.includes("pic input caldev cr");

      return isFsd || isDev || isSit || isCr;
    });
  }, [globalRawList, list]);

  const uatPool = useMemo(() => {
    const rawData = (window as any).rawMasterDataset || globalRawList || list || [];
    return getBusinessOperationalData(rawData).filter(item => {
      const lastStatus = item["Last Status"] ? String(item["Last Status"]).trim().toLowerCase() : "";
      const uatStatus = item["(UAT) Status"] ? String(item["(UAT) Status"]).trim().toLowerCase() : "";
      
      // 1. STRICT EXCLUSION: Exclude Live, Canceled, and any Change Request / Caldev statuses
      if (
        lastStatus.includes("live") || 
        lastStatus.includes("cancel") || 
        lastStatus.includes("change request") || 
        lastStatus.includes("caldev") ||
        lastStatus.includes("cr")
      ) {
        return false; // Immediately drop these from the UAT pool
      }
      
      // 2. UAT INCLUSION: Only keep genuine UAT projects
      return uatStatus.includes("queue") || 
             uatStatus.includes("progress") || 
             lastStatus.includes("uat on queue") || 
             lastStatus.includes("uat on progress");
    });
  }, [globalRawList, list]);

  const cleanMonitoringPool = useMemo(() => {
    const rawData = (window as any).rawMasterDataset || globalRawList || list || [];
    return getBusinessOperationalData(rawData).filter(item => {
      const lastStatus = item["Last Status"] ? String(item["Last Status"]).trim().toLowerCase() : "";
      const fsdStatus = item["(FSD) Status"] ? String(item["(FSD) Status"]).trim().toLowerCase() : "";

      // Exclusion Rule: Canceled projects should not be in active monitoring
      if (lastStatus.includes("cancel")) {
        return false;
      }

      // Comprehensive Capture: Grab any project that contains the "monitoring" token
      // This ensures "Live On Monitoring", "Monitoring After Live", or any custom tracking variant is caught
      return (
        lastStatus.includes("monitoring") || 
        lastStatus.includes("post-go-live") ||
        fsdStatus.includes("monitoring")
      );
    });
  }, [globalRawList, list]);

  const activeInProgressPool = cleanInProgressPool;

  const progressCount = activeInProgressPool.length;

  const uatCount = uatPool.length;
  const monitoringCount = cleanMonitoringPool.length;
  const holdCount = kpis[4]?.value ?? 0;

  // 1. CALCULATING INTERACTIVE FEEDBACK TARGET CONDITION PROJECTS WITH METRICS
  const feedbackMetrics = useMemo(() => {
    const filteredData = list;
    
    let totalScoreOfActive = 0;
    let activeWithFeedbackCount = 0;

    filteredData.forEach(item => {
      const avg = calculateProjectAverageScore(item);
      if (avg !== null) {
        totalScoreOfActive += avg;
        activeWithFeedbackCount++;
      }
    });

    let globalAvg = "0.00";
    if (activeWithFeedbackCount > 0) {
      globalAvg = (totalScoreOfActive / activeWithFeedbackCount).toFixed(2);
    }

    let scopeProjects = filteredData.filter(d => {
      const status = d["Last Status"] ? d["Last Status"].trim().toLowerCase() : "";
      return ["uat on progress", "live", "live monitoring"].includes(status);
    });

    let withFeedback = scopeProjects.filter(d => {
      return calculateProjectAverageScore(d) !== null;
    });

    let missingFeedback = scopeProjects.filter(d => {
      return calculateProjectAverageScore(d) === null;
    });

    return {
      scopeProjects,
      withFeedback,
      missingFeedback,
      averageScore: parseFloat(globalAvg),
      scoreText: globalAvg,
      filledStars: parseFloat(globalAvg) === 0 ? 0 : Math.round(parseFloat(globalAvg))
    };
  }, [list]);

  const feedbackProjects = feedbackMetrics.scopeProjects;

  // 2. COUNTERS RE-LINKED TO THE DYNAMIC FILTERED DATASET WITH 2026/DATES ADJUSTMENTS
  const evaluatedProjs = useMemo(() => {
    return getActiveSlaPool(list).filter((p) =>
      ["FSD SLA", "DEV SLA", "SIT SLA", "UAT SLA", "Live SLA"].some(
        (f) => p[f] === "Achieved" || p[f] === "Not Achieved"
      )
    );
  }, [list]);

  const goLiveProjs = useMemo(() => {
    return list.filter(
      (p) =>
        statusGroupOf(p["Last Status"]) === "Live" ||
        (p["Last Status"] && p["Last Status"].toLowerCase().includes("live"))
    );
  }, [list]);

  // SLA Total 2026: count projects with Year 2026 and at least one Active / Achieved SLA
  const slaTotal2026Projs = useMemo(() => {
    return getActiveSlaPool(list).filter((p) => {
      const is2026 = getProjectIntakeYear(p) === "2026";
      const isAchieved = p["Live SLA"] === "Achieved" || p["DEV SLA"] === "Achieved" || p["UAT SLA"] === "Achieved" || p["FSD SLA"] === "Achieved" || p["SIT SLA"] === "Achieved";
      return is2026 && isAchieved;
    });
  }, [list]);

  // Attention projects list
  const attentionProjs = useMemo(() => {
    return list.filter((p) => {
      const isAct = activeTypes.includes(statusGroupOf(p["Last Status"]));
      if (!isAct) return false;
      const devLate = p._lateDev || 0;
      const fsdLate = p._lateFSD || 0;
      const sitLate = p._lateSIT || 0;
      const uatLate = p._lateUAT || 0;
      const liveLate = p._lateLive || 0;
      return (
        devLate > 14 ||
        fsdLate > 14 ||
        sitLate > 14 ||
        uatLate > 14 ||
        liveLate > 14 ||
        (p["Reschedule UAT"] && p["Reschedule UAT"] > 1)
      );
    });
  }, [list]);

  const getProjectDisplayDate = (p: any): string => {
    const d = getGlobalProjectDate(p);
    return d === "-" ? "—" : d;
  };

  const getTargetOrRealizedDate = (p: any, stageName: string): string => {
    const d = getGlobalProjectDate(p);
    return d === "-" ? "—" : d;
  };

  const slaFieldMap: Record<string, "FSD SLA" | "DEV SLA" | "SIT SLA" | "UAT SLA" | "Live SLA"> = {
    FSD: "FSD SLA",
    DEV: "DEV SLA",
    DEVELOPMENT: "DEV SLA",
    SIT: "SIT SLA",
    UAT: "UAT SLA",
    LIVE: "Live SLA",
  };

  const handleQueueCardClick = () => {
    setActiveModal({
      title: "Queue Projects",
      type: "kpi_card",
      kpiKey: "queue"
    });
  };

  const handleInProgressCardClick = () => {
    setActiveModal({
      title: "In Progress Projects",
      type: "kpi_card",
      kpiKey: "progress"
    });
  };

  const handleUatCardClick = () => {
    setActiveModal({
      title: "UAT Projects",
      type: "kpi_card",
      kpiKey: "uat"
    });
  };

  const handleMonitoringCardClick = () => {
    setActiveModal({
      title: "Monitoring Projects",
      type: "kpi_card",
      kpiKey: "monitoring"
    });
  };

  const handleHoldCardClick = () => {
    setActiveModal({
      title: "Hold Projects",
      type: "kpi_card",
      kpiKey: "hold"
    });
  };

  // Milestone SLA click handler
  const handleMilestoneClick = (stageName: string) => {
    let cleanStage = stageName.toUpperCase();
    if (cleanStage === "DEVELOPMENT") cleanStage = "DEV";
    setActiveModal({
      title: `${stageName} Stage SLA Details`,
      type: "milestone_sla",
      stageName: cleanStage as 'FSD' | 'DEV' | 'SIT' | 'UAT' | 'LIVE'
    });
  };

  const handleYoYCardClick = () => {
    setActiveModal({
      title: "DEV SLA Year-on-Year Comparison",
      type: "yoy_comparison"
    });
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary Mini Row Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-gray-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest font-sans">
            Executive Summary Overview
          </h3>
          <p className="text-xs text-gray-400 font-medium mt-0.5 font-sans">
            Weekly Report Period: <strong className="text-gray-700">{report.date}</strong> &bull; <strong className="text-blue-600">{report.activeTotal} Active Projects</strong>
          </p>
        </div>
      </div>

      {/* Top row: Satisfaction rating and KPI tags */}
      <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs flex flex-col md:flex-row items-stretch justify-between gap-5">
        {/* User satisfaction score - CLICKABLE */}
        <div
          onClick={() => setActiveModal({
            title: "User Feedback Drill-Down Details",
            projects: feedbackProjects,
            type: "feedback"
          })}
          className="flex flex-col justify-center min-w-[200px] border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 pr-0 md:pr-6 cursor-pointer hover:bg-slate-50/70 p-3 rounded-2xl transition-all group"
        >
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>User Satisfaction Rate</span>
            <span className="text-[9px] text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Click Details &rarr;</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-4xl font-extrabold text-gray-900 font-display tracking-tight leading-none text-slate-850">
              {feedbackMetrics.scoreText}
            </span>
            <span className="text-sm text-gray-400 font-bold font-sans">/ 5</span>
          </div>
          {renderStars(feedbackMetrics.filledStars)}
          <span className="text-[10px] text-gray-450 font-bold tracking-tight mt-1">
            [{feedbackMetrics.withFeedback.length}] Projects with Feedback | [{feedbackMetrics.missingFeedback.length}] Pending Feedback
          </span>
        </div>

        {/* 3 small horizontal KPI tags matching Card info styles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 flex-1">
          {/* Tag 1: Proyek dievaluasi - CLICKABLE */}
          <div
            onClick={() => setActiveModal({
              title: "SLA Evaluated Projects",
              projects: evaluatedProjs,
              type: "contributors"
            })}
            className="bg-amber-50/50 border border-amber-100/50 rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer hover:bg-amber-50 hover:shadow-xs transition-all select-none group"
          >
            <span className="text-2xl font-extrabold text-amber-700 font-mono tracking-tight leading-none group-hover:scale-105 transition-transform origin-left block">
              {evaluatedProjs.length}
            </span>
            <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider block mt-2.5 leading-tight">
              Evaluated Projects
            </span>
          </div>

          {/* Tag 2: Go-Live periode ini - CLICKABLE */}
          <div
            onClick={() => setActiveModal({
              title: "Go-Live This Period Projects",
              projects: goLiveProjs,
              type: "contributors"
            })}
            className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer hover:bg-emerald-50 hover:shadow-xs transition-all select-none group"
          >
            <span className="text-2xl font-extrabold text-emerald-700 font-mono tracking-tight leading-none group-hover:scale-105 transition-transform origin-left block">
              {goLiveProjs.length}
            </span>
            <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider block mt-2.5 leading-tight">
              Go-Live This Period
            </span>
          </div>

          {/* Tag 3: Perlu perhatian - CLICKABLE */}
          <div
            onClick={() => setActiveModal({
              title: "Needs Attention Projects",
              projects: attentionProjs,
              type: "contributors"
            })}
            className="bg-rose-50/50 border border-rose-100/50 rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer hover:bg-rose-50 hover:shadow-xs transition-all select-none group"
          >
            <span className="text-2xl font-extrabold text-rose-700 font-mono tracking-tight leading-none group-hover:scale-105 transition-transform origin-left block">
              {attentionProjs.length}
            </span>
            <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider block mt-2.5 leading-tight">
              Needs Attention
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: 5 Stage KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Queue */}
        <div
          onClick={handleQueueCardClick}
          className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs flex flex-col justify-between cursor-pointer hover:border-blue-200 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-gray-400 font-sans uppercase tracking-wider block">Queue</span>
              <span className="text-3xl font-extrabold text-gray-900 font-display tracking-tight block">
                {queueCount}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100/70">
              <Icon name="Inbox" className="w-5 h-5 stroke-[2]" />
            </div>
          </div>
          <div className="mt-4 border-t border-gray-50 pt-3.5 flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-medium">Waiting to start</span>
            <span className="text-[11px] text-blue-600 font-bold group-hover:underline flex items-center gap-0.5">
              View drill-down <Icon name="ChevronRight" className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 2: In Progress (Solid Highlighted Dark Blue) */}
        <div
          onClick={handleInProgressCardClick}
          className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-5 shadow-md shadow-blue-100 flex flex-col justify-between cursor-pointer hover:shadow-lg hover:shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 group"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-blue-150 font-sans uppercase tracking-wider block">In Progress</span>
              <span className="text-3xl font-extrabold text-white font-display tracking-tight block">
                {progressCount}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white/12 text-white/95 group-hover:bg-white/20">
              <Icon name="Play" className="w-5 h-5 stroke-[2]" />
            </div>
          </div>
          <div className="mt-4 border-t border-white/10 pt-3.5 flex items-center justify-between">
            <span className="text-[11px] text-blue-100 font-medium font-sans">FSD &bull; Dev &bull; SIT &bull; CR</span>
            <span className="text-[11px] text-white font-bold flex items-center gap-0.5 font-sans">
              View drill-down <Icon name="ChevronRight" className="w-3 h-3 text-white" />
            </span>
          </div>
        </div>

        {/* Card 3: UAT */}
        <div
          onClick={handleUatCardClick}
          className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs flex flex-col justify-between cursor-pointer hover:border-blue-200 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-gray-400 font-sans uppercase tracking-wider block">UAT</span>
              <span className="text-3xl font-extrabold text-gray-900 font-display tracking-tight block">
                {uatCount}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-500 transition-colors group-hover:bg-amber-100/70">
              <Icon name="CheckSquare" className="w-5 h-5 stroke-[2]" />
            </div>
          </div>
          <div className="mt-4 border-t border-gray-50 pt-3.5 flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-medium font-sans">Queue & in progress</span>
            <span className="text-[11px] text-blue-600 font-bold group-hover:underline flex items-center gap-0.5">
              View drill-down <Icon name="ChevronRight" className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 4: Monitoring */}
        <div
          onClick={handleMonitoringCardClick}
          className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs flex flex-col justify-between cursor-pointer hover:border-blue-200 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-gray-400 font-sans uppercase tracking-wider block">Monitoring</span>
              <span className="text-3xl font-extrabold text-gray-900 font-display tracking-tight block">
                {monitoringCount}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-100/70">
              <Icon name="Activity" className="w-5 h-5 stroke-[2]" />
            </div>
          </div>
          <div className="mt-4 border-t border-gray-50 pt-3.5 flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-medium">Post go-live</span>
            <span className="text-[11px] text-blue-600 font-bold group-hover:underline flex items-center gap-0.5">
              View drill-down <Icon name="ChevronRight" className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 5: Hold */}
        <div
          onClick={handleHoldCardClick}
          className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs flex flex-col justify-between cursor-pointer hover:border-blue-200 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-gray-400 font-sans uppercase tracking-wider block">Hold</span>
              <span className="text-3xl font-extrabold text-gray-900 font-display tracking-tight block">
                {holdCount}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 transition-colors group-hover:bg-rose-100/70">
              <Icon name="Pause" className="w-5 h-5 stroke-[2]" />
            </div>
          </div>
          <div className="mt-4 border-t border-gray-50 pt-3.5 flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-medium leading-normal">
              <strong className="text-gray-700">{kpis[4]?.split?.[0]?.value || 0}</strong> Owner &bull; <strong className="text-gray-700">{kpis[4]?.split?.[1]?.value || 0}</strong> Client/Vendor
            </span>
            <span className="text-[11px] text-blue-600 font-bold group-hover:underline flex items-center gap-0.5">
              View drill-down <Icon name="ChevronRight" className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Row 3: Milestone SLA Pipeline connected nodes chart */}
      <Card
        title="Milestone SLA Pipeline"
        sub="SLA milestone achievement rate per stage • SLA FSD–Live 2026"
        padding="p-6 md:p-8"
      >
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-8 mt-6">
          {/* Connecting dotted timeline line overlay */}
          <div className="hidden md:block absolute top-[64px] left-[10%] right-[10%] h-[2px] border-b-2 border-dashed border-gray-200 z-0" />

          {dataset.slaStageSummary.map((stage, idx) => {
            // Determine ring color by success percentage
            let borderCol = "#EF4444"; // red
            if (stage.pct >= 95) borderCol = "#10B981"; // emerald
            else if (stage.pct >= 90) borderCol = "#3B82F6"; // blue
            else if (stage.pct >= 80) borderCol = "#F59E0B"; // orange/amber

            // Threshold label: < 93% is "Not Achieved", otherwise "Achieved"
            const statusLabel = stage.pct < 93 ? "Not Achieved" : "Achieved";
            const statusColor = stage.pct < 93 ? "text-rose-600" : "text-emerald-600";

            return (
              <div
                key={idx}
                onClick={() => handleMilestoneClick(stage.stage)}
                className="flex flex-col items-center flex-1 text-center z-10 w-full md:w-auto cursor-pointer group hover:opacity-90 active:scale-98 transition-all"
              >
                {/* Visual Circle gauge */}
                <ProgressCircle pct={stage.pct} color={borderCol} size={128} strokeWidth={12} />

                {/* Identifier tag */}
                <span className="text-sm font-bold tracking-wide uppercase text-slate-700 font-display mt-3.5 block group-hover:text-blue-600 transition-colors">
                  {stage.stage}
                </span>

                {/* SLA Stage Status threshold indicator */}
                <span className={`text-xs font-bold tracking-wider uppercase mt-0.5 block ${statusColor}`}>
                  {statusLabel}
                </span>

                {/* Subtitle status explanation */}
                <span className={`text-xs font-medium text-slate-500 mt-0.5 font-sans block`}>
                  {stage.notAch > 0 ? (
                    <span>
                      <strong className="text-slate-800 font-extrabold">{stage.notAch}</strong> missed
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-semibold">Fully achieved</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Historical Queue Backlog Trend Card */}
      <Card
        title="Unified Pipeline Analytics (Dual-Line Chart)"
        sub="Unified analysis tracking historical backlog burn-down vs. monthly incoming project intakes"
        rightElement={
          <button
            onClick={() => {
              setSelectedHistTab('W3 Apr 26');
              setModalActiveView('incoming');
              setActiveModal({
                title: "Historical Queue Snapshot Matrix",
                type: "historical_queue"
              });
            }}
            className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 hover:bg-blue-105 border border-blue-150 rounded-xl px-3 py-1.5 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Icon name="ListCollapse" className="w-3.5 h-3.5" />
            <span>View Unified Queue & Intakes Log</span>
          </button>
        }
        padding="p-6 md:p-8"
        className="w-full mt-6"
      >
        <div className="relative w-full overflow-hidden mt-4">
          {/* Main Chart Section */}
          <div className="w-full bg-slate-50/15 border border-gray-150 rounded-2xl p-4 md:p-6 shadow-3xs">
            {(() => {
              const trendLabels = ["W5 Mar 26", "W1 Apr 26", "W2 Apr 26", "W3 Apr 26", "Current Scope"];
              const trace1Values = [14, 16, 20, 18, queueCount];
              const trace2Values = [7, 24, 24, 24, (() => {
                const emLower = (endMonth || "Dec").toLowerCase();
                if (emLower.startsWith("mar")) return INCOMING_PROJECTS_DATA["Maret"].length;
                if (emLower.startsWith("apr")) return INCOMING_PROJECTS_DATA["April"].length;
                if (emLower.startsWith("may") || emLower.startsWith("mei")) return INCOMING_PROJECTS_DATA["Mei"].length;
                if (emLower.startsWith("jun")) return INCOMING_PROJECTS_DATA["Juni"].length;
                return INCOMING_PROJECTS_DATA["Juni"].length;
              })()];
              const yMaxVal = Math.max(26, queueCount + 2);

              const linePoints1 = trace1Values.map((v, i) => {
                const x = 75 + i * 160;
                const y = 190 - (v / yMaxVal) * 140; 
                return { x, y, value: v, label: trendLabels[i] };
              });

              const linePoints2 = trace2Values.map((v, i) => {
                const x = 75 + i * 160;
                const y = 190 - (v / yMaxVal) * 140; 
                return { x, y, value: v, label: trendLabels[i] };
              });

              const lineD1 = `M ${linePoints1.map(p => `${p.x},${p.y}`).join(" L ")}`;
              const areaD1 = `${lineD1} L 715,190 L 75,190 Z`;

              const lineD2 = `M ${linePoints2.map(p => `${p.x},${p.y}`).join(" L ")}`;
              const areaD2 = `${lineD2} L 715,190 L 75,190 Z`;

              return (
                <svg viewBox="0 0 800 245" className="w-full h-auto block select-none">
                  <defs>
                    <linearGradient id="backlogGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.00" />
                    </linearGradient>
                    <linearGradient id="incomingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>

                  {/* Legend Indicators */}
                  <g transform="translate(480, 15)">
                    {/* Trace 1: Backlog Volume */}
                    <rect x="0" y="3" width="12" height="6" rx="1.5" fill="#2563EB" />
                    <text x="18" y="10" className="text-[10px] font-bold fill-gray-500 font-sans">
                      Backlog Queue
                    </text>
                    {/* Trace 2: Incoming Intake */}
                    <rect x="110" y="3" width="12" height="6" rx="1.5" fill="#8B5CF6" />
                    <text x="128" y="10" className="text-[10px] font-bold fill-gray-500 font-sans">
                      New Incoming Intake
                    </text>
                  </g>

                  {/* Y-Axis Grid Lines and Labels */}
                  {[0, 5, 10, 15, 20, 25].map((t) => {
                    const yPos = 190 - (t / yMaxVal) * 140;
                    return (
                      <g key={t}>
                        <line x1={55} x2={745} y1={yPos} y2={yPos} stroke="#E5E7EB" strokeDasharray="3 3" strokeWidth="1" />
                        <text x={45} y={yPos + 3} textAnchor="end" className="text-[10px] fill-gray-400 font-mono font-bold">
                          {t}
                        </text>
                      </g>
                    );
                  })}

                  {/* Vertical grid lines */}
                  {linePoints1.map((p, i) => (
                    <line key={i} x1={p.x} x2={p.x} y1={40} y2={195} stroke="#F3F4F6" strokeDasharray="2 2" strokeWidth="1" />
                  ))}

                  {/* Shaded Areas */}
                  <path d={areaD1} fill="url(#backlogGrad)" className="transition-all duration-300" />
                  <path d={areaD2} fill="url(#incomingGrad)" className="transition-all duration-300" />

                  {/* Line Paths */}
                  <path d={lineD1} fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d={lineD2} fill="none" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Explicit Data Labels Trace 1 (Blue - Backlog Queue) */}
                  {linePoints1.map((p, i) => (
                    <g key={`lbl1-${i}`} className="pointer-events-none">
                      <rect
                        x={p.x - 14}
                        y={p.y - 25}
                        width={28}
                        height={16}
                        rx={5}
                        fill="#EFF6FF"
                        fillOpacity="0.95"
                        stroke="#BFDBFE"
                        strokeWidth="1"
                      />
                      <text
                        x={p.x}
                        y={p.y - 13}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                        className="text-[11px] font-sans font-bold fill-blue-700"
                      >
                        {p.value}
                      </text>
                    </g>
                  ))}

                  {/* Explicit Data Labels Trace 2 (Purple - New Incoming Intake) */}
                  {linePoints2.map((p, i) => (
                    <g key={`lbl2-${i}`} className="pointer-events-none">
                      <rect
                        x={p.x - 14}
                        y={p.y - 25}
                        width={28}
                        height={16}
                        rx={5}
                        fill="#F5F3FF"
                        fillOpacity="0.95"
                        stroke="#DDD6FE"
                        strokeWidth="1"
                      />
                      <text
                        x={p.x}
                        y={p.y - 13}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                        className="text-[11px] font-sans font-bold fill-violet-700"
                      >
                        {p.value}
                      </text>
                    </g>
                  ))}

                  {/* Interactive Nodes Trace 1 (Blue) */}
                  {linePoints1.map((p, i) => {
                    const isHovered = hoveredIdx === i;
                    return (
                      <g
                        key={`t1-${i}`}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredIdx(i)}
                        onMouseLeave={() => setHoveredIdx(null)}
                        onClick={() => {
                          const tabName = p.label === "Current Scope" ? "W3 Apr 26" : p.label as any;
                          setSelectedHistTab(tabName);
                          setModalActiveView('backlog');
                          setActiveModal({
                            title: "Historical Queue Snapshot Matrix",
                            type: "historical_queue"
                          });
                        }}
                      >
                        {isHovered && <circle cx={p.x} cy={p.y} r={12} fill="#93C5FD" opacity="0.4" />}
                        <circle cx={p.x} cy={p.y} r={6.5} fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                        <circle cx={p.x} cy={p.y} r={2} fill="#FFFFFF" />
                        <circle cx={p.x} cy={p.y} r={24} fill="transparent" />
                      </g>
                    );
                  })}

                  {/* Interactive Nodes Trace 2 (Purple) */}
                  {linePoints2.map((p, i) => {
                    const isHovered = hoveredIdx === i;
                    return (
                      <g
                        key={`t2-${i}`}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredIdx(i)}
                        onMouseLeave={() => setHoveredIdx(null)}
                        onClick={() => {
                          const tabName = p.label === "Current Scope" ? "W3 Apr 26" : p.label as any;
                          setSelectedHistTab(tabName);
                          setModalActiveView('incoming');
                          setActiveModal({
                            title: "Historical Queue Snapshot Matrix",
                            type: "historical_queue"
                          });
                        }}
                      >
                        {isHovered && <circle cx={p.x} cy={p.y} r={12} fill="#C084FC" opacity="0.4" />}
                        <circle cx={p.x} cy={p.y} r={6.5} fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="2" />
                        <circle cx={p.x} cy={p.y} r={2} fill="#FFFFFF" />
                        <circle cx={p.x} cy={p.y} r={24} fill="transparent" />
                      </g>
                    );
                  })}

                  {/* X-Axis Labels */}
                  {linePoints1.map((p, i) => (
                    <text
                      key={i}
                      x={p.x}
                      y={215}
                      textAnchor="middle"
                      className="text-[10.5px] font-extrabold fill-gray-500 font-display transition-colors cursor-pointer hover:fill-blue-600"
                      onClick={() => {
                        const tabName = p.label === "Current Scope" ? "W3 Apr 26" : p.label as any;
                        setSelectedHistTab(tabName);
                        // If current scale is selected, open incomingRegistry modal tab, otherwise backlog
                        setModalActiveView(p.label === "Current Scope" ? 'incoming' : 'backlog');
                        setActiveModal({
                          title: "Historical Queue Snapshot Matrix",
                          type: "historical_queue"
                        });
                      }}
                    >
                      {p.label}
                    </text>
                  ))}

                  {/* SVG Tooltip */}
                  {hoveredIdx !== null && (() => {
                    const p1 = linePoints1[hoveredIdx];
                    const p2 = linePoints2[hoveredIdx];
                    const tooltipX = Math.max(90, Math.min(710, p1.x));
                    const tooltipY = Math.min(p1.y, p2.y) - 20;
                    return (
                      <g className="pointer-events-none select-none">
                        <line x1={p1.x} x2={p1.x} y1={40} y2={190} stroke="#4B5563" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                        <rect x={tooltipX - 95} y={tooltipY - 60} width="190" height="56" rx="8" fill="#1E293B" />
                        <text x={tooltipX} y={tooltipY - 44} textAnchor="middle" className="text-[10.5px] font-extrabold fill-slate-200 font-display">
                          {p1.label} snapshot
                        </text>
                        <text x={tooltipX} y={tooltipY - 30} textAnchor="middle" className="text-[10px] font-bold fill-blue-400 font-mono">
                          Backlog Queue: {p1.value} Projects
                        </text>
                        <text x={tooltipX} y={tooltipY - 16} textAnchor="middle" className="text-[10px] font-bold fill-purple-400 font-mono">
                          Incoming Intake: {p2.value} Projects
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              );
            })()}
          </div>
        </div>

        {/* Dynamic Comparative Commentary Box */}
        <div className="mt-5 p-4 rounded-xl bg-blue-50/60 border border-blue-150 flex items-start gap-2.5 shadow-3xs hover:bg-blue-50/90 transition-all duration-300">
          <span className="text-blue-500 mt-0.5 shrink-0 text-base leading-none select-none font-sans">ℹ️</span>
          <div className="text-xs text-blue-800 font-medium leading-relaxed whitespace-normal select-text">
            Info: On Queue Project based on active master data is now <span className="text-blue-900 font-extrabold font-mono underline">{queueCount}</span> projects, compared to 18 projects from the historical snapshot baseline. Total new incoming project intakes for the active period are cleanly archived below.
          </div>
        </div>
      </Card>

      {/* Row 4: UAT Rescheduled Active Pushback lists (Full Width) */}
      <Card
        title="UAT Rescheduled"
        sub="Active projects with pushed/rescheduled UAT deadlines"
        rightElement={
          <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-0.5 select-none">
            {uatRescheduled.active} active &bull; {uatRescheduled.total} total
          </span>
        }
        padding="p-5"
        className="w-full flex flex-col justify-between"
      >
        {/* Rows list of reschedule items */}
        <div className="space-y-3 my-2 flex-grow">
          {uatRescheduled.rows.map((row, idx) => {
            const isCR = row.status.toLowerCase().includes("change") || row.status.toLowerCase().includes("cr");
            const orig = row.originalProject;
            const isDelayed = orig
              ? (statusGroupOf(orig["Last Status"]) !== "Live" &&
                 statusGroupOf(orig["Last Status"]) !== "Canceled" &&
                 ((orig._lateUAT || 0) > 0 || (orig["Reschedule UAT"] || 0) > 0))
              : false;
            return (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-gray-50/40 border border-gray-100/60 rounded-2xl hover:bg-gray-50 transition-colors duration-150 gap-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 animate-pulse" />
                  <p className="text-[12px] font-bold text-gray-800 select-all flex flex-wrap items-center gap-2 whitespace-normal break-words">
                    <span className="whitespace-normal break-words">{row.name}</span>
                    {isDelayed && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 rounded px-1.5 py-0.5 uppercase tracking-wide shrink-0 select-none" title="UAT Delay Spotted">
                        ⚠️ Delayed
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3.5 self-end sm:self-auto flex-shrink-0">
                  <span className={`text-[10px] font-extrabold uppercase font-mono tracking-wider px-2 py-0.5 rounded-md border ${
                    isCR
                      ? 'text-amber-700 bg-amber-50/75 border-amber-100/65'
                      : 'text-blue-700 bg-blue-50/75 border-blue-100/65'
                  }`}>
                    {row.status}
                  </span>
                  <span className="text-xs font-bold font-mono text-gray-800 bg-gray-100/80 border border-gray-200 rounded-md px-1.5 py-0.5 min-w-7 text-center">
                    {row.count}
                  </span>
                </div>
              </div>
            );
          })}
          {uatRescheduled.rows.length === 0 && (
            <div className="py-12 text-center text-xs text-gray-400">
              No rescheduled UAT projects identified in current active snapshot.
            </div>
          )}
        </div>

        {/* Warning Escalation alert - clickable */}
        <div
          onClick={() => {
            setActiveModal({
              title: "Delayed UAT Projects Review",
              type: "uat_delay_audit",
              projects: delayedUATProjects
            });
          }}
          className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl p-3 flex items-center justify-between gap-2.5 mt-3 select-none cursor-pointer hover:shadow-xs transition-all duration-150 group"
        >
          <div className="flex items-center gap-2.5">
            <svg className="w-4.5 h-4.5 text-rose-500 flex-shrink-0 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>
              <strong className="font-extrabold">{delayedUATProjects.length} projects still delayed</strong> &mdash; urgent coordination & escalation with client/vendor team needed to protect timelines.
            </span>
          </div>
          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-150/50 rounded-lg px-2 py-0.5 transition-colors group-hover:bg-rose-200 select-none flex-shrink-0">
            View Review List &rarr;
          </span>
        </div>
      </Card>

      {/* Section 5: DEV SLA Year-on-Year comparison chart - COMPARATIVE GRID REPAIRED */}
      <Card
        title="DEV SLA Year-on-Year"
        sub="Progress alignment & benchmarks between evaluation periods (2025 vs 2026) • Click anywhere on card to open interactive comparison"
        className="cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200 group relative"
        padding="p-6"
        onClick={handleYoYCardClick}
        rightElement={
          <button className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-100 transition-colors pointer-events-none select-none">
            Interact Comparison <Icon name="chevron" className="w-3.5 h-3.5 animate-pulse" />
          </button>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-2">
          {/* Left Side: Comparison bars */}
          <div className="w-full flex flex-col items-center justify-center">
            <div className="w-full max-w-sm">
              <div className="relative h-44 flex items-end justify-around border-b border-gray-150 pb-2.5 pt-6 px-12">
                {/* Score guidelines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none mt-6 pb-2.5 text-[10px] font-mono text-gray-400 select-none">
                  <div className="border-b border-dashed border-gray-200 w-full flex justify-between"><span>100% Target</span></div>
                  <div className="border-b border-dashed border-gray-200 w-full flex justify-between"><span>50% Mid-Point</span></div>
                  <div className="border-b border-dashed border-gray-200 w-full flex justify-between"><span>0% Base-Level</span></div>
                </div>

                {yoySla.filter(f => f.year === "2025" || f.year === "2026").map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center z-10 w-24">
                    <span className="text-[13px] font-mono font-extrabold text-gray-900 mb-2">{item.pct}%</span>
                    <div
                      className="rounded-t-xl w-12 transition-all duration-750 ease-out shadow-xs"
                      style={{
                        height: `${(item.pct / 100) * 110}px`,
                        backgroundColor: item.year === "2026" ? '#2563EB' : '#94A3B8'
                      }}
                    />
                    <span className="text-xs font-bold text-gray-500 mt-2.5 font-sans leading-none">{item.year}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Dynamic Wording Info Text Block */}
            <div className="mt-4 text-center px-4">
              <p className="text-xs text-slate-500 font-sans italic bg-slate-50 border border-slate-100 px-3 py-2.5 rounded-xl inline-block max-w-[280px] sm:max-w-md shadow-xs select-text">
                {count2026 > count2025 ? (
                  <>Info: There is an increase in project volume for the selected period ({startMonth || 'Jan'} - {endMonth || 'Dec'}) compared to the same period in 2025.</>
                ) : count2026 < count2025 ? (
                  <>Info: There is a decrease in project volume for the selected period ({startMonth || 'Jan'} - {endMonth || 'Dec'}) compared to the same period in 2025.</>
                ) : (
                  <>Info: Project volume for the selected period ({startMonth || 'Jan'} - {endMonth || 'Dec'}) remains stable compared to the same period in 2025.</>
                )}
              </p>
            </div>
          </div>

          {/* Right Side: comparative benchmarking summary table */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase text-gray-400 tracking-wider font-display">Development Alignment Benchmarks</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {yoySla.filter(f => f.year === "2025" || f.year === "2026").map((item) => (
                <div
                  key={item.year}
                  className={`p-4 rounded-2xl border ${
                    item.year === "2026"
                      ? "bg-amber-50/10 border-amber-100"
                      : "bg-blue-50/10 border-blue-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-500 font-sans uppercase">Periode {item.year}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md font-mono ${
                      item.year === "2026"
                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                        : "bg-blue-50 text-blue-700 border border-blue-100"
                    }`}>
                      {item.pct}% SLA
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {/* In Progress */}
                    <div className="flex items-center justify-between text-xs font-sans">
                      <span className="text-gray-400 font-medium">In-Progress:</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {item.year === "2026" ? inProgress2026Count : item.year === "2025" ? inProgress2025Count : (item.inProgress ?? 0)} projs
                      </span>
                    </div>

                    {/* Completed */}
                    <div className="flex items-center justify-between text-xs font-sans">
                      <span className="text-gray-400 font-medium font-semibold">Completed:</span>
                      <strong className="text-gray-800 font-extrabold font-mono">{item.completed ?? 0} projs</strong>
                    </div>

                    {/* Delay metrics based on lateDev / _lateDev */}
                    <div className="flex items-center justify-between text-xs font-sans">
                      <span className="text-gray-400 font-medium">Delayed Days:</span>
                      <strong className="text-rose-600 font-extrabold font-mono bg-rose-50 border border-rose-100/50 px-1.5 py-0.5 rounded-md">
                        {item.totalDelayDays ?? 0} d
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* RENDER DYNAMIC DRILL-DOWN MODALS - DELAYED UAT PROJECTS AUDIT */}
      {activeModal && activeModal.type === 'uat_delay_audit' && (() => {
        const renderChronologicalProgress = (notes: string) => {
          if (!notes || notes === "—") return "-";
          return notes
            .split(/(?=\d{1,2}\s+(?:Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des)\s+\d{2,4}\s+:\s+)/gi)
            .filter(line => line.trim() !== "")
            .map(line => `<div class="mb-1.5">• ${line.trim()}</div>`)
            .join("");
        };

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden transform scale-100 animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="p-5 border-b border-gray-150 flex items-center justify-between bg-gray-50/55 select-none">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 font-display">
                    Delayed UAT Projects Review
                  </h3>
                  <p className="text-xs text-gray-400 font-medium mt-1">
                    Showing {(activeModal.projects || []).length} active UAT delayed / rescheduled projects requiring escalation
                  </p>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-105 rounded-xl transition-colors cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Structured Table */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="overflow-x-auto border border-gray-150 rounded-2xl shadow-xs">
                  <table className="w-full text-left text-xs border-collapse divide-y divide-gray-150">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-150 text-[10.5px] text-gray-400 font-bold uppercase tracking-wider font-display select-none">
                        <th className="py-3 px-4">Ticket &amp; Project Name</th>
                        <th className="py-3 px-3">PIC Name</th>
                        <th className="py-3 px-3">Owner Division</th>
                        <th className="py-3 px-3">Owner Name</th>
                        <th className="py-3 px-3">Current Stage Status</th>
                        <th className="py-3 px-3 text-center">Reschedule Count</th>
                        <th className="py-3 px-3 text-center">Delayed Days</th>
                        <th className="py-3 px-4 w-[35%]">Progress Update Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-105 select-text bg-white">
                      {(activeModal.projects || []).map((p, idx) => {
                        const reschedCount = p["Reschedule UAT"] || 0;
                        const lateDays = p._lateUAT || 0;
                        const progressNotes = p["(UAT) Progress Updated"] || "—";
                        return (
                          <tr key={idx} className="hover:bg-gray-50/40 transition-colors">
                            <td className="py-3 px-4 font-sans align-top whitespace-normal break-words">
                              <p className="font-bold text-gray-900 text-xs whitespace-normal break-words">{p["Project Name"] || "—"}</p>
                              <span className="font-mono text-[10px] text-gray-400 mt-1 block whitespace-normal break-words">{p["Ticket"] || "—"}</span>
                            </td>
                            <td className="py-3 px-3 font-sans font-semibold text-gray-750 align-top whitespace-normal break-words">
                              {p["PIC Short Name"] || p["PIC Name"] || "—"}
                            </td>
                            <td className="py-3 px-3 text-xs font-medium text-slate-600 align-top whitespace-normal break-words">
                              {p["Owner Div"] || "—"}
                            </td>
                            <td className="py-3 px-3 text-xs font-medium text-slate-600 align-top whitespace-normal break-words">
                              {p["Owner Name"] || "—"}
                            </td>
                            <td className="py-3 px-3 align-top whitespace-normal break-words">
                              <span className="inline-block px-2.5 py-1 text-[10px] font-black uppercase rounded-lg bg-amber-50 text-amber-700 border border-amber-100 select-none whitespace-normal break-normal">
                                {p["Last Status"] || "Unknown"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-mono font-extrabold text-xs text-gray-950 align-top select-none whitespace-normal break-words">
                              {reschedCount > 0 ? `${reschedCount}×` : "0"}
                            </td>
                            <td className="py-3 px-3 text-center align-top whitespace-normal break-words select-none">
                              <span className={`inline-block font-mono font-black text-xs px-2 py-0.5 rounded-lg ${lateDays > 0 ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-gray-100 text-gray-600'}`}>
                                {lateDays} Days
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs font-medium text-gray-650 leading-relaxed align-top whitespace-normal break-words select-text">
                              <div className="whitespace-normal text-xs leading-relaxed text-slate-700 bg-slate-50/55 p-3 rounded-md border border-slate-100 max-h-[150px] overflow-y-auto block" dangerouslySetInnerHTML={{ __html: renderChronologicalProgress(progressNotes) }} />
                            </td>
                          </tr>
                        );
                      })}
                      {(activeModal.projects || []).length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-xs text-gray-400 font-semibold italic">
                            No delayed UAT projects identified.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-150 flex justify-end bg-gray-50/55 select-none">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Close Review List
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* RENDER DYNAMIC DRILL-DOWN MODALS - USER SATISFACTION FEEDBACK */}
      {activeModal && activeModal.type === 'feedback' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden transform scale-100">
            {/* Header */}
            <div className="p-5 border-b border-gray-150 flex items-center justify-between bg-gray-50/55">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 font-display">
                  {activeModal.title}
                </h3>
                <p className="text-xs text-gray-400 font-medium mt-1">
                  Showing {activeModal.projects.length} evaluated user feedbacks (filtered case-insensitive for UAT On Progress, Live, or Live monitoring)
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-105 rounded-xl transition-colors cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Top Metadata Summary Header */}
            {(() => {
              const modalScopeData = activeModal.projects || [];
              const countWithFeedback = modalScopeData.filter(d => {
                const val = d["Rata-rata Nilai Feedback User : "];
                return val !== undefined && val !== null && parseFloat(String(val)) > 0;
              }).length;
              const countMissingFeedback = modalScopeData.length - countWithFeedback;

              const liveCount = modalScopeData.filter(d => {
                const s = d["Last Status"] ? d["Last Status"].trim().toLowerCase() : "";
                return s === "live" || s === "live monitoring";
              }).length;

              const uatCount = modalScopeData.filter(d => {
                const s = d["Last Status"] ? d["Last Status"].trim().toLowerCase() : "";
                return s === "uat on progress";
              }).length;

              const crCount = modalScopeData.filter(d => {
                const s = d["Last Status"] ? d["Last Status"].trim().toLowerCase() : "";
                return s === "change request on progress";
              }).length;

              return (
                <div className="px-6 py-3 bg-gray-50/30 border-b border-gray-150 flex flex-wrap items-center gap-3.5 select-none font-sans">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Audit Summary:</span>
                  <div 
                    id="modal-with-feedback-badge"
                    className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-850 border border-emerald-150 rounded-xl px-3 py-1 text-xs font-semibold"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{countWithFeedback} With Feedback</span>
                  </div>
                  <div 
                    id="modal-missing-feedback-badge"
                    className="inline-flex items-center gap-2 bg-amber-50 text-amber-850 border border-amber-150 rounded-xl px-3 py-1 text-xs font-semibold"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>{countMissingFeedback} Missing Feedback</span>
                  </div>

                  <div className="h-4 w-[1px] bg-gray-300 self-center mx-0.5" />

                  {liveCount > 0 && (
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-xl px-2.5 py-1 text-[10px] font-extrabold font-mono uppercase">
                      <span>LIVE: {liveCount}</span>
                    </div>
                  )}

                  {uatCount > 0 && (
                    <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-150 rounded-xl px-2.5 py-1 text-[10px] font-extrabold font-mono uppercase">
                      <span>UAT ON PROGRESS: {uatCount}</span>
                    </div>
                  )}

                  {crCount > 0 && (
                    <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-150 rounded-xl px-2.5 py-1 text-[10px] font-extrabold font-mono uppercase">
                      <span>CR ON PROGRESS: {crCount}</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Structured Table */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 text-[10.5px] text-gray-405 font-bold uppercase tracking-wider font-display">
                      <th className="py-3 px-4">Project Name &amp; Ticket</th>
                      <th className="py-3 px-3">PIC Short Name</th>
                      <th className="py-3 px-3">Last Status</th>
                      <th className="py-3 px-3 text-center">Average Score</th>
                      <th className="py-3 px-4 w-[45%]">Feedback Comments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-105 select-text">
                    {activeModal.projects.map((p, idx) => {
                      const comments = getFeedbackComments(p);
                      const avgScore = calculateProjectAverageScore(p);
                      return (
                        <tr key={idx} className="hover:bg-gray-50/[15] transition-colors">
                          <td className="py-4 px-4 font-sans align-top">
                            <p className="font-bold text-gray-800 text-xs">{p["Project Name"]}</p>
                            <span className="font-mono text-[10px] text-gray-400 mt-1 block">{p["Ticket"] || "—"}</span>
                          </td>
                          <td className="py-4 px-3 text-gray-600 font-bold align-top whitespace-nowrap">
                            {p["PIC Short Name"] || p["PIC Name"] || "—"}
                          </td>
                          <td className="py-4 px-3 align-top whitespace-normal">
                            {(() => {
                               const lastStatusRaw = p["Last Status"] || "";
                               const lastStatusLower = lastStatusRaw.trim().toLowerCase();
                               let badgeClass = "text-slate-650 bg-slate-50 border-slate-150";
                               
                               if (lastStatusLower.includes("live") || lastStatusLower.includes("live monitoring")) {
                                 badgeClass = "text-emerald-750 bg-emerald-50 border-emerald-150";
                               } else if (lastStatusLower.includes("uat")) {
                                 badgeClass = "text-blue-750 bg-blue-50 border-blue-150";
                               } else if (lastStatusLower.includes("change request") || lastStatusLower.includes("progress")) {
                                 badgeClass = "text-amber-750 bg-amber-50 border-amber-150";
                               }

                               return (
                                 <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono border whitespace-nowrap ${badgeClass}`}>
                                   {lastStatusRaw || "—"}
                                 </span>
                               );
                            })()}
                          </td>
                          <td className="py-4 px-3 text-center align-top">
                            {avgScore !== null ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold font-mono text-amber-800 bg-amber-50 border border-amber-100">
                                ⭐ {avgScore.toFixed(2)}
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold font-mono text-gray-400 bg-gray-50 border border-gray-105 uppercase select-none">
                                —
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-xs text-gray-650 align-top">
                            {avgScore !== null ? (
                              <div className="space-y-2">
                                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium bg-emerald-50 border border-emerald-150 px-3 py-2 rounded-xl text-[11px] w-full">
                                  ✅ Feedback Form Completed
                                </span>
                                {comments.length > 0 ? (
                                  <div className="space-y-1.5 pl-1">
                                    {comments.map((comment, cIdx) => (
                                      <p key={cIdx} className="italic text-gray-600 leading-relaxed bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                                        &ldquo;{comment}&rdquo;
                                      </p>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-gray-450 italic text-[11px] pl-1">No feedback text comments recorded</p>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-amber-600/90 font-medium italic bg-amber-50/40 border border-amber-105 px-3 py-2 rounded-xl text-[11px] w-full">
                                ⚠️ No feedback submitted
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {activeModal.projects.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-xs text-gray-400 font-sans italic">
                          No matching feedback projects in the active filtered view.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-150 bg-gray-50/50 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold border border-gray-200 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Close Feedback View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENDER DYNAMIC DRILL-DOWN MODALS - TOP CONTRIBS */}
      {activeModal && activeModal.type === 'contributors' && (() => {
        const modalTitle = activeModal.title || "";
        const isSlaEvaluated = modalTitle === "SLA Evaluated Projects";
        const isGoLive = modalTitle === "Go-Live This Period Projects" || modalTitle === "Go-Live This Period";
        const isSlaAccomplished = modalTitle === "SLA Accomplished 2026 Projects";
        const isAttention = modalTitle === "Needs Attention Projects";

        const modalProjects = activeModal.projects || [];

        // 1. Dynamic status summary breakdown badges (For Go-live modal next to project count)
        const statusCountsMap: Record<string, number> = {};
        if (isGoLive) {
          modalProjects.forEach((p: any) => {
            const rawVal = p["Last Status"] || "";
            const cleanVal = String(rawVal).trim().toUpperCase();
            if (cleanVal) {
              statusCountsMap[cleanVal] = (statusCountsMap[cleanVal] || 0) + 1;
            }
          });
        }

        // 2. Needs attention flag trigger logic
        const getAttentionTrigger = (p: any) => {
          const statusLower = p["Last Status"] ? p["Last Status"].trim().toLowerCase() : "";
          if (statusLower === "canceled") {
            return {
              text: "Project Lifecycle Terminated",
              style: "bg-red-50 text-red-700 border-red-150"
            };
          }

          const devLate = p._lateDev || p.lateDev || p["lateDev"] || 0;
          const fsdLate = p._lateFSD || p.lateFSD || p["lateFSD"] || 0;
          const sitLate = p._lateSIT || p.lateSIT || p["lateSIT"] || 0;
          const uatLate = p._lateUAT || p.lateUAT || p["lateUAT"] || 0;
          const liveLate = p._lateLive || p.lateLive || p["lateLive"] || 0;

          let lateCount = 0;
          if (devLate > 0) lateCount++;
          if (fsdLate > 0) lateCount++;
          if (sitLate > 0) lateCount++;
          if (uatLate > 0) lateCount++;
          if (liveLate > 0) lateCount++;

          if (lateCount > 1) {
            return {
              text: "Multi-Stage Gateway Failure",
              style: "bg-red-50 text-red-750 border-red-150 font-extrabold animate-pulse"
            };
          }

          if (devLate > 0) {
            return {
              text: `${devLate} Days Late in Dev Stage`,
              style: "bg-amber-50 text-amber-800 border-amber-150"
            };
          }

          const uatReschedule = p["Reschedule UAT"] || p._rescheduleUAT || 0;
          if (uatReschedule > 1) {
            return {
              text: "Repeated UAT Reschedule Warn",
              style: "bg-amber-100 text-amber-850 border-amber-200"
            };
          }

          if (fsdLate > 0) return { text: `${fsdLate} Days Late in FSD Stage`, style: "bg-amber-50 text-amber-800 border-amber-150" };
          if (sitLate > 0) return { text: `${sitLate} Days Late in SIT Stage`, style: "bg-purple-50 text-purple-750 border-purple-150" };
          if (uatLate > 0) return { text: `${uatLate} Days Late in UAT Stage`, style: "bg-sky-50 text-sky-700 border-sky-150" };
          if (liveLate > 0) return { text: `${liveLate} Days Late in Go-Live Stage`, style: "bg-orange-50 text-orange-755 border-orange-150" };

          return {
            text: "SLA Gateway Watchlabel",
            style: "bg-slate-50 text-slate-750 border-slate-200"
          };
        };

        const modalMaxWidth = isGoLive ? "max-w-6xl" : isAttention ? "max-w-4xl" : "max-w-3xl";

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className={`bg-white rounded-2xl ${modalMaxWidth} w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden transform scale-100`}>
              {/* Header */}
              <div className="p-5 border-b border-gray-150 flex items-center justify-between bg-gray-50/55">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 font-display">
                    {activeModal.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <p className="text-xs text-gray-400 font-medium whitespace-normal">
                      Active Snapshot Contributor List &bull; {modalProjects.length} Projects found
                    </p>
                    
                    {/* Unique Status Badges for Go Live modal in header area */}
                    {isGoLive && Object.entries(statusCountsMap).map(([statusName, count]) => {
                      let badgeColor = "bg-slate-50 text-slate-800 border-slate-200";
                      const lowerName = statusName.toLowerCase();
                      if (lowerName.includes("live")) {
                        badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-150";
                      } else if (lowerName.includes("uat")) {
                        badgeColor = "bg-blue-50 text-blue-850 border-blue-150";
                      } else if (lowerName.includes("change request") || lowerName.includes("progress")) {
                        badgeColor = "bg-amber-50 text-amber-850 border-amber-150";
                      }
                      return (
                        <span key={statusName} className={`inline-flex items-center gap-1 text-[10px] uppercase font-mono font-extrabold px-2 py-0.5 rounded-full border whitespace-nowrap ${badgeColor}`}>
                          {statusName}: {count}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-105 rounded-xl transition-colors cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Informational alert banners */}
              {isSlaEvaluated && (
                <div id="sla-evaluated-prompt-banner" className="bg-blue-50/70 border border-blue-150 p-4 rounded-xl mx-6 mt-4 flex items-start gap-2.5">
                  <span className="text-blue-600 mt-0.5 shrink-0 text-base">ℹ️</span>
                  <div className="text-xs text-blue-800 font-medium leading-relaxed whitespace-normal">
                    <strong>Presentation Note:</strong> This list captures all core projects whose development windows or planned target lines fall within the active evaluation range. It forms the baseline absolute universe used to compute the global SLA compliance scores, ensuring comprehensive pipeline accountability.
                  </div>
                </div>
              )}

              {isSlaAccomplished && (
                <div id="sla-accomplished-prompt-banner" className="bg-emerald-50/70 border border-emerald-150 p-4 rounded-xl mx-6 mt-4 flex items-start gap-2.5">
                  <span className="text-emerald-600 mt-0.5 shrink-0 text-base">✅</span>
                  <div className="text-xs text-emerald-800 font-medium leading-relaxed whitespace-normal">
                    <strong>Criteria Log:</strong> Projects listed here achieved an ideal delivery state, meeting or exceeding target velocity benchmarks with 0 net delay days recorded across the Development checkpoint gate.
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-150 text-[10.5px] text-gray-405 font-bold uppercase tracking-wider font-display">
                        {isGoLive ? (
                          <>
                            <th className="py-3 px-4 w-[12%] whitespace-normal">Ticket</th>
                            <th className="py-3 px-4 w-[23%] min-w-[140px] whitespace-normal">Project Name</th>
                            <th className="py-3 px-3 w-[15%] whitespace-normal">PIC Name</th>
                            <th className="py-3 px-3 w-[15%] whitespace-normal text-center">Planning &amp; Realization</th>
                            <th className="py-3 px-3 w-[15%] whitespace-normal">Live Status</th>
                            <th className="py-3 px-4 w-[20%] whitespace-normal">Live Progress Updates</th>
                          </>
                        ) : isAttention ? (
                          <>
                            <th className="py-3 px-4 w-[12%] whitespace-normal">Ticket</th>
                            <th className="py-3 px-4 w-[35%] min-w-[180px] whitespace-normal">Project Name</th>
                            <th className="py-3 px-3 w-[15%] whitespace-normal">PIC Name</th>
                            <th className="py-3 px-3 w-[13%] whitespace-normal text-center">Last Status</th>
                            <th className="py-3 px-4 w-[25%] whitespace-normal text-right">Attention Flag Trigger</th>
                          </>
                        ) : (
                          <>
                            <th className="py-3 px-4 w-[15%] whitespace-normal">Ticket</th>
                            <th className="py-3 px-4 w-[50%] min-w-[200px] whitespace-normal">Project Name</th>
                            <th className="py-3 px-3 w-[20%] whitespace-normal">PIC Name</th>
                            <th className="py-3 px-3 w-[15%] whitespace-normal text-right">Last Status</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 select-text">
                      {modalProjects.map((p, idx) => {
                        const grp = statusGroupOf(p["Last Status"]);
                        let stampColor = "bg-blue-50 text-blue-700 border-blue-100";
                        if (grp === "Live") stampColor = "bg-emerald-50 text-emerald-800 border-emerald-150";
                        if (grp === "Hold") stampColor = "bg-purple-50 text-purple-700 border-purple-100";
                        if (grp === "Canceled") stampColor = "bg-rose-50 text-rose-700 border-rose-100";
                        if (grp === "Antrian") stampColor = "bg-amber-50 text-amber-800 border-amber-100";

                        if (isGoLive) {
                          return (
                            <tr key={idx} className="hover:bg-gray-50/10 transition-colors">
                              <td className="py-3 px-4 font-mono font-bold text-gray-500 text-[11px] align-top whitespace-normal">
                                {p["Ticket"] || "—"}
                              </td>
                              <td className="py-3 px-4 text-gray-800 font-bold whitespace-normal break-words align-top" style={{ minWidth: "140px" }} title={p["Project Name"]}>
                                {p["Project Name"]}
                              </td>
                              <td className="py-3 px-3 text-gray-600 font-semibold align-top whitespace-normal">
                                {p["PIC Name"] || "—"}
                              </td>
                              <td className="py-3 px-3 align-top whitespace-normal text-center">
                                <div className="flex flex-col gap-1 items-center justify-center">
                                  {p["(Live) Plan in Week"] && (
                                    <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200 uppercase font-mono">
                                      Plan: {p["(Live) Plan in Week"]}
                                    </span>
                                  )}
                                  {(p["(Live) Realized in date"] || p["(Live) Realized in Date"]) && (
                                    <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-850 border border-emerald-150 uppercase font-mono">
                                      Realized: {p["(Live) Realized in date"] || p["(Live) Realized in Date"]}
                                    </span>
                                  )}
                                  {!p["(Live) Plan in Week"] && !p["(Live) Realized in date"] && !p["(Live) Realized in Date"] && (
                                    <span className="text-gray-400 italic text-[11px]">—</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-3 align-top text-[11px] font-semibold text-gray-700 whitespace-normal">
                                {p["(Live) Status"] || "—"}
                              </td>
                              <td className="py-3 px-4 whitespace-normal break-words max-w-lg text-[11.5px] leading-relaxed text-gray-650 align-top line-clamp-6 overflow-y-auto max-h-[140px]">
                                {p["(Live) Progress Updated"] || "—"}
                              </td>
                            </tr>
                          );
                        }

                        if (isAttention) {
                          const triggerInfo = getAttentionTrigger(p);
                          return (
                            <tr key={idx} className="hover:bg-gray-50/10 transition-colors">
                              <td className="py-3 px-4 font-mono font-bold text-gray-500 text-[11px] align-top whitespace-normal">
                                {p["Ticket"] || "—"}
                              </td>
                              <td className="py-3 px-4 text-gray-800 font-bold whitespace-normal break-words align-top" style={{ minWidth: "180px" }} title={p["Project Name"]}>
                                {p["Project Name"]}
                              </td>
                              <td className="py-3 px-3 text-gray-600 font-semibold align-top whitespace-normal">
                                {p["PIC Name"] || "—"}
                              </td>
                              <td className="py-3 px-3 align-top text-center whitespace-normal">
                                <span className={`inline-block text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${stampColor}`}>
                                  {p["Last Status"] || "Unknown"}
                                </span>
                              </td>
                              <td className="py-3 px-4 align-top text-right whitespace-normal">
                                <span className={`inline-block text-[10px] uppercase font-mono font-extrabold px-2.5 py-0.5 rounded-full border ${triggerInfo.style}`}>
                                  {triggerInfo.text}
                                </span>
                              </td>
                            </tr>
                          );
                        }

                        // Standard SLA Evaluated, SLA Accomplished, or general contributors modal
                        return (
                          <tr key={idx} className="hover:bg-gray-50/10 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-gray-500 text-[11px] align-top whitespace-normal">
                              {p["Ticket"] || "—"}
                            </td>
                            <td className="py-3 px-4 text-gray-800 font-bold whitespace-normal break-words align-top" style={{ minWidth: "200px" }} title={p["Project Name"]}>
                              {p["Project Name"]}
                            </td>
                            <td className="py-3 px-3 text-gray-600 font-semibold align-top whitespace-normal">
                              {p["PIC Name"] || "—"}
                            </td>
                            <td className="py-3 px-3 text-right align-top whitespace-normal">
                              <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                                <span className={`inline-block text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${stampColor}`}>
                                  {p["Last Status"] || "Unknown"}
                                </span>
                                {isSlaAccomplished && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/60 border border-emerald-200 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                                    ✓ ACHIEVED
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {modalProjects.length === 0 && (
                        <tr>
                          <td colSpan={isGoLive ? 6 : isAttention ? 5 : 4} className="py-12 text-center text-xs text-gray-400 font-sans italic">
                            No contributing projects found for this criteria in the selected range.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-150 bg-gray-50/50 flex justify-end">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold border border-gray-200 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Close Detail View
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* RENDER DYNAMIC DRILL-DOWN MODALS - HISTORICAL snapshot queue metadata */}
       {/* RENDER DYNAMIC DRILL-DOWN MODALS - HISTORICAL snapshot queue metadata */}
      {activeModal && activeModal.type === 'historical_queue' && (() => {
        const getHistoricalQueueRows = () => {
          const rows = HISTORICAL_QUEUE_SNAPSHOT.slice(1);
          if (selectedHistTab === "W5 Mar 26") {
            return rows
              .filter(r => r["Project On Queue"] !== undefined && r["Project On Queue"] !== null)
              .map(r => ({
                id: r["Project On Queue"],
                ticket: r["Column5"] || "—",
                projectName: r["Column6"] || "—",
                picName: r["Column7"] || "—",
                owner: r["Column8"] || "—",
                department: r["Column9"] || "—"
              }));
          } else if (selectedHistTab === "W1 Apr 26") {
            return rows
              .filter(r => r["Column11"] !== undefined && r["Column11"] !== null)
              .map(r => ({
                id: r["Column11"],
                ticket: r["Column12"] || "—",
                projectName: r["Column13"] || "—",
                picName: r["Column14"] || "—",
                owner: r["Column15"] || "—",
                department: r["Column16"] || "—"
              }));
          } else if (selectedHistTab === "W2 Apr 26") {
            return rows
              .filter(r => r["Column18"] !== undefined && r["Column18"] !== null)
              .map(r => ({
                id: r["Column18"],
                ticket: r["Column19"] || "—",
                projectName: r["Column20"] || "—",
                picName: r["Column21"] || "—",
                owner: r["Column22"] || "—",
                department: r["Column23"] || "—"
              }));
          } else {
            return rows
              .filter(r => r["Column25"] !== undefined && r["Column25"] !== null)
              .map(r => ({
                id: r["Column25"],
                ticket: r["Column26"] || "—",
                projectName: r["Column27"] || "—",
                picName: r["Column28"] || "—",
                owner: r["Column29"] || "—",
                department: r["Column30"] || "—"
              }));
          }
        };

        const currentRows = getHistoricalQueueRows();

        const departmentAggregator: Record<string, number> = {};
        currentRows.forEach(project => {
          const deptName = project.department ? String(project.department).trim().toUpperCase() : "OTHER";
          if (deptName && deptName !== "—") {
            departmentAggregator[deptName] = (departmentAggregator[deptName] || 0) + 1;
          }
        });

        const getDeptStyles = (name: string) => {
          const lower = name.toLowerCase();
          if (lower.includes("business process")) {
            return {
              bg: "bg-blue-50/80",
              border: "border-blue-150",
              text: "text-blue-900",
              numText: "text-blue-600",
              icon: "users" as const
            };
          }
          if (lower.includes("operation")) {
            return {
              bg: "bg-emerald-50/80",
              border: "border-emerald-150",
              text: "text-emerald-900",
              numText: "text-emerald-700",
              icon: "settings" as const
            };
          }
          if (lower.includes("finance") || lower.includes("accounting")) {
            return {
              bg: "bg-amber-50/80",
              border: "border-amber-150",
              text: "text-amber-900",
              numText: "text-amber-700",
              icon: "percent" as const
            };
          }
          if (lower.includes("marketing")) {
            return {
              bg: "bg-rose-50/80",
              border: "border-rose-150",
              text: "text-rose-900",
              numText: "text-rose-600",
              icon: "pie" as const
            };
          }
          if (lower.includes("guarding")) {
            return {
              bg: "bg-purple-50/80",
              border: "border-purple-150",
              text: "text-purple-900",
              numText: "text-purple-600",
              icon: "clock" as const
            };
          }
          return {
            bg: "bg-slate-50/90",
            border: "border-slate-200",
            text: "text-slate-800",
            numText: "text-slate-600",
            icon: "layers" as const
          };
        };

        const incomingList = INCOMING_PROJECTS_DATA[selectedIncomingMonth] || [];

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-[92vw] max-w-7xl h-[85vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden transform scale-100">
              {/* Header */}
              <div className="p-5 border-b border-gray-150 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/55 select-none hover:shadow-2xs transition-shadow duration-155">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 font-display">
                    {activeModal.title}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium mt-1">
                    {modalActiveView === 'backlog' ? (
                      <>Static Backlog Snapshots &bull; {currentRows.length} projects active in <span className="font-extrabold text-blue-600 font-mono">{selectedHistTab}</span></>
                    ) : (
                      <>Incoming Registries &bull; {incomingList.length} new intakes archive for <span className="font-extrabold text-purple-600 font-mono">{selectedIncomingMonth}</span></>
                    )}
                  </p>
                </div>

                {/* Sub-Tabs Selector based on current Active view Segment */}
                {modalActiveView === 'backlog' ? (
                  <div className="flex bg-gray-100 p-1 rounded-xl self-start md:self-center">
                    {(['W5 Mar 26', 'W1 Apr 26', 'W2 Apr 26', 'W3 Apr 26'] as const).map((tab) => {
                      const isActive = selectedHistTab === tab;
                      return (
                        <button
                          key={tab}
                          onClick={() => setSelectedHistTab(tab)}
                          className={`px-3 py-1.5 text-xs font-extrabold rounded-lg cursor-pointer transition-all ${
                            isActive ? "bg-white text-blue-700 shadow-xs border border-gray-200/40" : "text-gray-500 hover:text-gray-900"
                          }`}
                        >
                          {tab}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex bg-gray-100 p-1 rounded-xl self-start md:self-center">
                    {([
                      { key: "Maret", label: "March (7)" },
                      { key: "April", label: "April (24)" },
                      { key: "Mei", label: "May (9)" },
                      { key: "Juni", label: "June (6)" }
                    ] as const).map(({ key, label }) => {
                      const isActive = selectedIncomingMonth === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedIncomingMonth(key)}
                          className={`px-3 py-1.5 text-xs font-extrabold rounded-lg cursor-pointer transition-all ${
                            isActive ? "bg-white text-purple-700 shadow-xs border border-gray-200/40" : "text-gray-500 hover:text-gray-900"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}

                <button
                  onClick={() => setActiveModal(null)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-105 rounded-xl transition-colors cursor-pointer text-sm self-end md:self-center"
                >
                  ✕
                </button>
              </div>

              {/* View Selector segmented control tab bar */}
              <div className="flex px-6 pt-3 border-b border-gray-150 gap-6 bg-white select-none">
                <button
                  onClick={() => setModalActiveView('backlog')}
                  className={`pb-3 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    modalActiveView === 'backlog'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon name="Layers" className="w-3.5 h-3.5" />
                  <span>[Backlog Queue History]</span>
                </button>
                <button
                  onClick={() => setModalActiveView('incoming')}
                  className={`pb-3 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    modalActiveView === 'incoming'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon name="Inbox" className="w-3.5 h-3.5" />
                  <span>[New Incoming Projects Registry]</span>
                </button>
              </div>

              {modalActiveView === 'backlog' ? (
                <>
                  {/* Informative description banner */}
                  <div className="bg-slate-50/80 border border-slate-150 p-4 rounded-xl mx-6 mt-4 flex items-start gap-2.5">
                    <span className="text-slate-500 mt-0.5 shrink-0 text-base leading-none">📋</span>
                    <div className="text-xs text-slate-700 font-semibold leading-relaxed whitespace-normal select-text">
                      <strong>Snapshot Data Scope:</strong> This view logs the static historical projects from the baseline raw queue. Long descriptive fields wrap seamlessly to guarantee absolute readability across systems.
                    </div>
                  </div>

                  {/* Dynamic Department Summary Cards with High Contrast */}
                  <div className="grid grid-cols-5 gap-2 mx-6 mt-2 select-none">
                    {Object.entries(departmentAggregator)
                      .filter(([_, count]) => count > 0)
                      .map(([deptName, count]) => {
                        const styles = getDeptStyles(deptName);
                        return (
                          <div
                            key={deptName}
                            className={`py-1.5 px-3 h-11 rounded-lg border ${styles.border} ${styles.bg} shadow-3xs flex items-center justify-between gap-2 transition-all hover:shadow-2xs min-w-0`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Icon name={styles.icon} className={`w-3.5 h-3.5 ${styles.numText} shrink-0`} />
                              <p className={`text-[10px] font-bold tracking-tight uppercase truncate ${styles.text}`} title={deptName}>
                                {deptName}
                              </p>
                            </div>
                            <div className="shrink-0 flex items-center gap-1">
                              <span className={`text-xs font-black font-mono leading-none ${styles.numText}`}>
                                {count}
                              </span>
                              <span className="text-[8px] uppercase font-bold text-gray-400 tracking-wide leading-none">
                                {count === 1 ? "Prj" : "Prjs"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Snapshot Table */}
                  <div className="flex-1 overflow-y-auto overflow-x-auto mt-4 border border-slate-200 rounded-lg mx-6 mb-6 select-text">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-150 text-[10.5px] text-gray-405 font-bold uppercase tracking-wider font-display select-none">
                          <th className="py-3 px-4 w-[10%] text-center">Row ID</th>
                          <th className="py-3 px-4 w-[15%]">Ticket</th>
                          <th className="py-3 px-4 w-[40%] min-w-[200px]">Project Name</th>
                          <th className="py-3 px-3 w-[15%]">PIC Name</th>
                          <th className="py-3 px-3 w-[10%]">Owner</th>
                          <th className="py-3 px-4 w-[10%]">Department</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 select-text">
                        {currentRows.map((r, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/10 transition-colors">
                            <td className="py-3 px-4 text-center font-mono font-bold text-gray-400">
                              {r.id}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-gray-600 text-[11px]">
                              {r.ticket}
                            </td>
                            <td className="py-3 px-4 text-gray-950 font-bold whitespace-normal break-words" style={{ minWidth: "200px" }} title={r.projectName}>
                              {r.projectName}
                            </td>
                            <td className="py-3 px-3 text-gray-600 font-semibold">
                              {r.picName}
                            </td>
                            <td className="py-3 px-3 text-gray-500 font-semibold">
                              {r.owner}
                            </td>
                            <td className="py-3 px-4 text-gray-500 font-semibold whitespace-normal break-words">
                              {r.department}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  {/* Informative description banner for incoming intake registry */}
                  <div className="bg-purple-50/80 border border-purple-150 p-4 rounded-xl mx-6 mt-4 flex items-start gap-2.5">
                    <span className="text-purple-500 mt-0.5 shrink-0 text-base leading-none">📋</span>
                    <div className="text-xs text-purple-700 font-semibold leading-relaxed whitespace-normal select-text">
                      <strong>Intake Data Scope:</strong> This view catalogs all new project intake submissions processed during {selectedIncomingMonth}. All cells feature text-wrapping and absolute break-guard structures.
                    </div>
                  </div>

                  {/* Snapshot Table for Incoming Projects */}
                  <div className="flex-1 overflow-y-auto overflow-x-auto mt-4 border border-purple-200 rounded-lg mx-6 mb-6 select-text">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-purple-50 border-b border-purple-150 text-[10.5px] text-purple-800 font-bold uppercase tracking-wider font-display select-none">
                          <th className="py-3 px-4 w-[10%] text-center">Row ID</th>
                          <th className="py-3 px-4 w-[15%]">Ticket</th>
                          <th className="py-3 px-4 w-[40%] min-w-[200px]">Project Name</th>
                          <th className="py-3 px-3 w-[15%]">PIC Name</th>
                          <th className="py-3 px-3 w-[10%]">Owner</th>
                          <th className="py-3 px-4 w-[10%]">Requesting Division</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-100 select-text">
                        {incomingList.map((item, idx) => (
                          <tr key={idx} className="hover:bg-purple-50/20 transition-colors">
                            <td className="py-3 px-4 text-center font-mono font-bold text-purple-400">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-gray-600 text-[11px]">
                              {item.ticket || "—"}
                            </td>
                            <td className="py-3 px-4 text-purple-950 font-bold whitespace-normal break-words" style={{ minWidth: "200px" }} title={item.name}>
                              {item.name || "—"}
                            </td>
                            <td className="py-3 px-3 text-gray-600 font-semibold whitespace-normal break-words">
                              {item.pic || "—"}
                            </td>
                            <td className="py-3 px-3 text-gray-500 font-semibold whitespace-normal break-words">
                              {item.owner || "—"}
                            </td>
                            <td className="py-3 px-4 text-gray-650 font-semibold whitespace-normal break-words">
                              {item.div || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Footer */}
              <div className="p-4 border-t border-gray-150 bg-gray-50/50 flex justify-end">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold border border-gray-200 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Close Snapshot Matrix
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* RENDER DYNAMIC DRILL-DOWN MODALS - KPI CARDS */}
      {activeModal && activeModal.type === 'kpi_card' && activeModal.kpiKey && (() => {
        const key = activeModal.kpiKey;
        let pList: any[] = [];
        let modalSub = "";

        if (key === "queue") {
          pList = queueProjectsPool;
          modalSub = `Showing ${pList.length} projects in Queue state (Last Status exactly "On Queue")`;
        } else if (key === "progress") {
          pList = cleanInProgressPool;
          modalSub = `Showing ${pList.length} projects active in development cycle`;
        } else if (key === "uat") {
          pList = uatPool;
          modalSub = `Showing ${pList.length} projects in UAT stage`;
        } else if (key === "monitoring") {
          pList = cleanMonitoringPool;
          modalSub = `Showing ${pList.length} projects in post go-live monitoring stage`;
        } else if (key === "hold") {
          pList = list.filter(p => {
            const statusLower = (p["Last Status"] || "").trim().toLowerCase();
            const milestoneLower = (p["Milestone"] || "").trim().toLowerCase();
            return statusLower.includes("hold") || milestoneLower.includes("hold");
          });
          modalSub = `Showing ${pList.length} projects flagged as HOLD`;
        }

        const sortedTableRows = key === "progress"
          ? [...pList].sort((a, b) => getStrictSortWeight(a) - getStrictSortWeight(b))
          : pList;

        // Subcounts definitions using the newly established cleanInProgressPool array
        let fsdProgressCount = 0;
        let devProgressCount = 0;
        let sitProgressCount = 0;
        let uatProgressCount = 0;
        let crProgressCount = 0;

        cleanInProgressPool.forEach(item => {
          const lastStatus = item["Last Status"] ? String(item["Last Status"]).trim().toLowerCase() : "";
          const fsd = item["(FSD) Status"] ? String(item["(FSD) Status"]).trim().toLowerCase() : "";
          const dev = item["(Dev) Status"] ? String(item["(Dev) Status"]).trim().toLowerCase() : "";
          const sit = item["(SIT) Status"] ? String(item["(SIT) Status"]).trim().toLowerCase() : "";
          const uat = item["(UAT) Status"] ? String(item["(UAT) Status"]).trim().toLowerCase() : "";

          if (["on progress", "on review owner", "on review it", "on revisi it", "on approval"].some(s => fsd === s || fsd.includes("progress"))) fsdProgressCount++;
          
          // Aggregate both progress and queue rows into the DEV counter card container
          if (dev.includes("progress") || dev.includes("queue") || lastStatus.includes("dev")) devProgressCount++;
          
          if (sit.includes("progress") || sit.includes("queue")) sitProgressCount++;
          if (uat.includes("progress") || uat.includes("queue")) uatProgressCount++;
          if (lastStatus.includes("change request") || lastStatus.includes("cr") || lastStatus.includes("caldev")) crProgressCount++;
        });

        const uatOnQueueCount = uatPool.filter(d => {
          const uatStatus = (d["(UAT) Status"] || "").toString().trim().toLowerCase();
          const lastStatus = (d["Last Status"] || "").toString().trim().toLowerCase();
          return uatStatus.includes("queue") || lastStatus.includes("uat on queue");
        }).length;

        const uatOnProgressCount = uatPool.filter(d => {
          const uatStatus = (d["(UAT) Status"] || "").toString().trim().toLowerCase();
          const lastStatus = (d["Last Status"] || "").toString().trim().toLowerCase();
          return uatStatus.includes("progress") || lastStatus.includes("uat on progress");
        }).length;

        uatProgressCount = uatOnProgressCount;

        // Splits for Hold
        const holdByOwnerList = pList.filter(p => {
          const statusLower = (p["Last Status"] || "").trim().toLowerCase();
          const milestoneLower = (p["Milestone"] || "").trim().toLowerCase();
          return statusLower.includes("owner") || milestoneLower.includes("owner");
        });
        const holdByClientItList = pList.filter(p => {
          const statusLower = (p["Last Status"] || "").trim().toLowerCase();
          const milestoneLower = (p["Milestone"] || "").trim().toLowerCase();
          return !statusLower.includes("owner") && !milestoneLower.includes("owner");
        });

        // Date getter helper
        const getDisplayDate = (p: any) => {
          return getProjectDisplayDate(p);
        };

        const renderChronologicalProgress = (log: string) => {
          if (!log || log === "-") return "-";
          return log
            .split(/(?=\d{1,2}\s+(?:Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des)\s+\d{2,4}\s+:\s+)/gi)
            .filter(line => line.trim() !== "")
            .map(line => `<div class="mb-1.5">• ${line.trim()}</div>`)
            .join("");
        };

        return (
          <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-7xl w-full h-[85vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden transform scale-100 animate-in fade-in duration-200">
              {/* Header */}
              <div className="p-5 border-b border-gray-150 flex items-center justify-between bg-gray-50/55">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 font-display">
                    {activeModal.title}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium mt-1">
                    {modalSub}
                  </p>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-105 rounded-xl transition-colors cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Sub-status breakdowns under header */}
              {key === "progress" && (
                <div className="px-6 py-3 bg-blue-50/50 border-b border-gray-100 grid grid-cols-2 md:grid-cols-5 gap-4 text-center select-none">
                  <div className="bg-white border border-blue-100 rounded-xl p-2.5">
                    <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-normal">FSD On Progress</span>
                    <strong className="text-base font-extrabold text-blue-800 font-mono">{fsdProgressCount}</strong>
                  </div>
                  <div className="bg-white border border-blue-100 rounded-xl p-2.5">
                    <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-normal">Dev On Progress</span>
                    <strong className="text-base font-extrabold text-blue-800 font-mono">{devProgressCount}</strong>
                  </div>
                  <div className="bg-white border border-blue-100 rounded-xl p-2.5">
                    <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-normal">SIT On Progress</span>
                    <strong className="text-base font-extrabold text-blue-800 font-mono">{sitProgressCount}</strong>
                  </div>
                  <div className="bg-white border border-blue-100 rounded-xl p-2.5">
                    <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-normal">UAT On Progress</span>
                    <strong className="text-base font-extrabold text-blue-800 font-mono">{uatProgressCount}</strong>
                  </div>
                  <div className="bg-white border border-blue-100 rounded-xl p-2.5 col-span-2 md:col-span-1">
                    <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-normal">Change Request On Progress</span>
                    <strong className="text-base font-extrabold text-blue-800 font-mono">{crProgressCount}</strong>
                  </div>
                </div>
              )}

              {key === "uat" && (
                <div className="px-6 py-3 bg-amber-50/30 border-b border-gray-100 grid grid-cols-2 gap-4 text-center select-none">
                  <div className="bg-white border border-amber-100 rounded-xl p-2.5">
                    <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">UAT On Queue</span>
                    <strong className="text-base font-extrabold text-amber-700 font-mono">{uatOnQueueCount}</strong>
                  </div>
                  <div className="bg-white border border-amber-100 rounded-xl p-2.5">
                    <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">UAT On Progress</span>
                    <strong className="text-base font-extrabold text-amber-700 font-mono">{uatOnProgressCount}</strong>
                  </div>
                </div>
              )}

              {/* Main content table area */}
              <div className="flex-1 overflow-y-auto p-6">
                {key === "hold" ? (
                  // HOLD split table view
                  <div className="space-y-6">
                    {/* Hold by Owner */}
                    <div>
                      <div className="flex items-center justify-between mb-2 select-none">
                        <h4 className="text-[12px] font-bold text-gray-700 uppercase tracking-wider font-display flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                          Hold by Owner ({holdByOwnerList.length} Projects)
                        </h4>
                      </div>
                      <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-150 text-[10px] text-gray-500 font-bold uppercase tracking-wider font-display">
                              <th className="py-2.5 px-3">Ticket</th>
                              <th className="py-2.5 px-3 min-w-[150px]">Project Name</th>
                              <th className="py-2.5 px-3 text-left min-w-[140px]" style={{ minWidth: "140px" }}>OWNER DIVISION</th>
                              <th className="py-2.5 px-3 text-left min-w-[120px]" style={{ minWidth: "120px" }}>OWNER NAME</th>
                              <th className="py-2.5 px-3">PIC Short</th>
                              <th className="py-2.5 px-3">Last Status</th>
                              <th className="py-2.5 px-3 text-right">Target/Realized Date</th>
                              <th className="py-2.5 px-3 text-left">LATEST PHASING LOG</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-101 select-text">
                            {holdByOwnerList.map((p, idx) => {
                              const rawStatus = p["Last Status"] || "Hold";
                              const dispDate = getDisplayDate(p) || "";

                              return (
                                <tr key={idx} className="hover:bg-gray-50/55">
                                  <td className="py-2.5 px-3 font-mono font-bold text-gray-500 align-top">{p["Ticket"] || "—"}</td>
                                  <td className="py-2.5 px-3 font-bold text-gray-800 whitespace-normal break-words align-top" style={{ minWidth: "150px" }} title={p["Project Name"]}>{p["Project Name"]}</td>
                                  <td className="py-2.5 px-3 text-xs text-slate-600 whitespace-normal break-words align-top text-left min-w-[140px]" style={{ minWidth: "140px" }}>
                                    {p["Owner Div"] || p["Owner Division"] || "-"}
                                  </td>
                                  <td className="py-2.5 px-3 text-xs text-slate-600 whitespace-normal break-words align-top text-left min-w-[120px]" style={{ minWidth: "120px" }}>
                                    {p["Owner Name"] || "-"}
                                  </td>
                                  <td className="py-2.5 px-3 text-gray-650 align-top">{p["PIC Short Name"] || p["PIC Name"] || "—"}</td>
                                  <td className="py-2.5 px-3 align-top">
                                    <span className="inline-block text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded-md border text-purple-700 bg-purple-50/60 border-purple-100 font-sans">
                                      {rawStatus}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right align-top">
                                    <div className="max-h-[96px] overflow-y-auto whitespace-pre-wrap break-words text-xs text-slate-600 font-medium pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 max-w-sm ml-auto text-right">
                                      {getStandardizedRemark(dispDate)}
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 align-top">
                                    <div className="max-h-[120px] overflow-y-auto whitespace-pre-line break-words text-[11px] leading-relaxed text-slate-600 pr-2 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 max-w-sm" dangerouslySetInnerHTML={{ __html: renderChronologicalProgress(getGlobalProgressUpdate(p)) }} />
                                  </td>
                                </tr>
                              );
                            })}
                            {holdByOwnerList.length === 0 && (
                              <tr>
                                <td colSpan={8} className="py-6 text-center text-xs text-gray-400 italic">No Owner Hold projects found in current range</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Hold by Client/VENDOR */}
                    <div>
                      <div className="flex items-center justify-between mb-2 select-none">
                        <h4 className="text-[12px] font-bold text-gray-700 uppercase tracking-wider font-display flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          Hold by Client / VENDOR ({holdByClientItList.length} Projects)
                        </h4>
                      </div>
                      <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-150 text-[10px] text-gray-500 font-bold uppercase tracking-wider font-display">
                              <th className="py-2.5 px-3">Ticket</th>
                              <th className="py-2.5 px-3 min-w-[150px]">Project Name</th>
                              <th className="py-2.5 px-3 text-left min-w-[140px]" style={{ minWidth: "140px" }}>OWNER DIVISION</th>
                              <th className="py-2.5 px-3 text-left min-w-[120px]" style={{ minWidth: "120px" }}>OWNER NAME</th>
                              <th className="py-2.5 px-3">PIC Short</th>
                              <th className="py-2.5 px-3">Last Status</th>
                              <th className="py-2.5 px-3 text-right">Target/Realized Date</th>
                              <th className="py-2.5 px-3 text-left">LATEST PHASING LOG</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-101 select-text">
                            {holdByClientItList.map((p, idx) => {
                              const rawStatus = p["Last Status"] || "Hold";
                              const dispDate = getDisplayDate(p) || "";

                              return (
                                <tr key={idx} className="hover:bg-gray-50/55">
                                  <td className="py-2.5 px-3 font-mono font-bold text-gray-500 align-top">{p["Ticket"] || "—"}</td>
                                  <td className="py-2.5 px-3 font-bold text-gray-800 whitespace-normal break-words align-top" style={{ minWidth: "150px" }} title={p["Project Name"]}>{p["Project Name"]}</td>
                                  <td className="py-2.5 px-3 text-xs text-slate-600 whitespace-normal break-words align-top text-left min-w-[140px]" style={{ minWidth: "140px" }}>
                                    {p["Owner Div"] || p["Owner Division"] || "-"}
                                  </td>
                                  <td className="py-2.5 px-3 text-xs text-slate-600 whitespace-normal break-words align-top text-left min-w-[120px]" style={{ minWidth: "120px" }}>
                                    {p["Owner Name"] || "-"}
                                  </td>
                                  <td className="py-2.5 px-3 text-gray-650 align-top">{p["PIC Short Name"] || p["PIC Name"] || "—"}</td>
                                  <td className="py-2.5 px-3 align-top">
                                    <span className="inline-block text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded-md border text-blue-700 bg-blue-50/60 border-blue-100 font-sans">
                                      {rawStatus}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right align-top">
                                    <div className="max-h-[96px] overflow-y-auto whitespace-pre-wrap break-words text-xs text-slate-600 font-medium pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 max-w-sm ml-auto text-right">
                                      {getStandardizedRemark(dispDate)}
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 align-top">
                                    <div className="max-h-[120px] overflow-y-auto whitespace-pre-line break-words text-[11px] leading-relaxed text-slate-600 pr-2 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 max-w-sm" dangerouslySetInnerHTML={{ __html: renderChronologicalProgress(getGlobalProgressUpdate(p)) }} />
                                  </td>
                                </tr>
                              );
                            })}
                            {holdByClientItList.length === 0 && (
                              <tr>
                                <td colSpan={8} className="py-6 text-center text-xs text-gray-400 italic">No Client / VENDOR Hold projects found in current range</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : key === "uat" ? (
                  // UAT table view with new columns & formatting
                  <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-150 text-[10.5px] text-gray-405 font-bold uppercase tracking-wider font-display">
                          <th className="py-3 px-3">Ticket</th>
                          <th className="py-3 px-3 min-w-[155px]">Project Name</th>
                          <th className="py-3 px-3 text-left min-w-[140px]" style={{ minWidth: "140px" }}>OWNER DIVISION</th>
                          <th className="py-3 px-3 text-left min-w-[120px]" style={{ minWidth: "120px" }}>OWNER NAME</th>
                          <th className="py-3 px-3">PIC Short</th>
                          <th className="py-3 px-3">Last Status</th>
                          <th className="py-3 px-3 text-left min-w-[160px]">Target/Realized Date</th>
                          <th className="py-3 px-3 text-left">LATEST PHASING LOG</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-105 select-text">
                        {pList.map((p, idx) => {
                          const grp = statusGroupOf(p["Last Status"]);
                          let stampColor = "bg-blue-50 text-blue-700 border-blue-100";
                          if (grp === "Live") stampColor = "bg-emerald-50 text-emerald-800 border-emerald-150";
                          if (grp === "Hold") stampColor = "bg-purple-50 text-purple-700 border-purple-100";
                          if (grp === "Canceled") stampColor = "bg-rose-50 text-rose-700 border-rose-100";
                          if (grp === "Antrian") stampColor = "bg-amber-50 text-amber-800 border-amber-100";

                          const ticketText = p["Ticket"] || "—";
                          const projectNameText = p["Project Name"] || "—";
                          const picShortText = p["PIC Short Name"] || p["PIC Name"] || "—";

                          const rawStatus = p["Last Status"] || "";
                          const dispDate = getDisplayDate(p) || "";
                          const hasAlias = getStandardizedStatus(rawStatus, dispDate).toLowerCase() === "on development";
                          const dateIsAlias = dispDate.toLowerCase().includes("pic input caldev cr");

                          return (
                            <tr key={idx} className="hover:bg-gray-50/10 transition-colors">
                              <td className="py-3 px-3 font-mono font-bold text-gray-500 text-[11px] align-top">
                                {ticketText}
                              </td>
                              <td className="py-3 px-3 text-gray-800 font-bold whitespace-normal break-words align-top" style={{ minWidth: "155px" }} title={projectNameText}>
                                {projectNameText}
                              </td>
                              <td className="py-3 px-3 text-xs text-slate-600 whitespace-normal break-words align-top text-left min-w-[140px]" style={{ minWidth: "140px" }}>
                                {p["Owner Div"] || p["Owner Division"] || "-"}
                              </td>
                              <td className="py-3 px-3 text-xs text-slate-600 whitespace-normal break-words align-top text-left min-w-[120px]" style={{ minWidth: "120px" }}>
                                {p["Owner Name"] || "-"}
                              </td>
                              <td className="py-3 px-3 text-gray-650 align-top">
                                {picShortText}
                              </td>
                              <td className="py-3 px-3 align-top">
                                {hasAlias ? (
                                  <span className="inline-block text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded text-[11px] font-semibold uppercase font-sans whitespace-nowrap">
                                    On Development
                                  </span>
                                ) : (
                                  <span className={`inline-block text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${stampColor} font-sans`}>
                                    {rawStatus || "Unknown"}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-xs font-semibold text-slate-600 break-words leading-relaxed text-left min-w-[160px] whitespace-pre-line align-top">
                                {dateIsAlias ? (
                                  <span className="inline-block text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded text-[11px] font-semibold uppercase font-sans whitespace-nowrap">
                                    On Development
                                  </span>
                                ) : (
                                  formatUATBatchText(dispDate)
                                )}
                              </td>
                              <td className="py-3 px-3 align-top">
                                <div className="max-h-[120px] overflow-y-auto whitespace-pre-line break-words text-[11px] leading-relaxed text-slate-600 pr-2 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 max-w-sm" dangerouslySetInnerHTML={{ __html: renderChronologicalProgress(getGlobalProgressUpdate(p)) }} />
                              </td>
                            </tr>
                          );
                        })}
                        {pList.length === 0 && (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-xs text-gray-400 font-sans italic">
                              No matching projects found for this criteria in the selected range.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  // Unified table view for all other cards
                  <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-150 text-[10.5px] text-gray-405 font-bold uppercase tracking-wider font-display">
                          <th className="py-3 px-3">Ticket</th>
                          <th className="py-3 px-3 min-w-[155px]">Project Name</th>
                          <th className="py-3 px-3 text-left min-w-[140px]" style={{ minWidth: "140px" }}>OWNER DIVISION</th>
                          <th className="py-3 px-3 text-left min-w-[120px]" style={{ minWidth: "120px" }}>OWNER NAME</th>
                          <th className="py-3 px-3">PIC Short</th>
                          <th className="py-3 px-3">Last Status</th>
                          <th className={`py-3 px-3 ${key === "queue" || key === "progress" ? "text-left" : "text-right"}`}>
                            {key === "queue" ? "Target / Notes" : "Target/Realized Date"}
                          </th>
                          <th className="py-3 px-3 text-left">LATEST PHASING LOG</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-105 select-text">
                        {sortedTableRows.map((p, idx) => {
                          const grp = statusGroupOf(p["Last Status"]);
                          let stampColor = "bg-blue-50 text-blue-700 border-blue-100";
                          if (grp === "Live") stampColor = "bg-emerald-50 text-emerald-800 border-emerald-150";
                          if (grp === "Hold") stampColor = "bg-purple-50 text-purple-700 border-purple-100";
                          if (grp === "Canceled") stampColor = "bg-rose-50 text-rose-700 border-rose-100";
                          if (grp === "Antrian") stampColor = "bg-amber-50 text-amber-800 border-amber-100";

                          const isProgressCard = key === "progress";

                          const ticketText = isProgressCard ? (p["No Ticket"] || p["Ticket"] || "-") : (p["Ticket"] || "—");
                          const projectNameText = isProgressCard ? (p["Project Name"] || p["Nama Project"] || "-") : p["Project Name"];
                          const picShortText = isProgressCard ? (p["PIC Short Name"] || p["PIC Project"] || "-") : (p["PIC Short Name"] || p["PIC Name"] || "—");

                          const rawStatus = p["Last Status"] || "";
                          let dateNotesText = "";
                          if (isProgressCard) {
                            dateNotesText = getGlobalProjectDate(p) || "";
                          } else if (key === "queue") {
                            const ticketId = p["Ticket"] ? String(p["Ticket"]).trim() : "";
                            if (ticketId === "25020019") {
                              dateNotesText = "FSD udah dikerjakan sekitar 80%, tapi ada Revisi FPS dan plan Finish Revisi FPS pada 10 Juli 2026";
                            } else if (ticketId === "25050045") {
                              dateNotesText = "Sedang di-email terkait relevansi project pada tanggal 19 Juni 2026 oleh Bimo Adi Nurzaman (PT. Advantage SCM)";
                            } else if (ticketId === "25100107") {
                              dateNotesText = "Revisi FPS by Owner (Plan Finish Revisi FPS belum dapat dari owner, sudah di-email oleh IT)";
                            } else if (ticketId === "25100103") {
                              dateNotesText = "Plan Finish Approval pada W4 Juni 2026";
                            } else {
                              dateNotesText = getDisplayDate(p) || "";
                            }
                          } else {
                            dateNotesText = getDisplayDate(p) || "";
                          }

                          const hasAlias = getStandardizedStatus(rawStatus, dateNotesText).toLowerCase() === "on development";
                          const dateIsAlias = dateNotesText.toLowerCase().includes("pic input caldev cr");

                          return (
                            <tr key={idx} className="hover:bg-gray-50/10 transition-colors">
                              <td className="py-3 px-3 font-mono font-bold text-gray-500 text-[11px] align-top">
                                {ticketText}
                              </td>
                              <td className="py-3 px-3 text-gray-800 font-bold whitespace-normal break-words align-top" style={{ minWidth: "155px" }} title={projectNameText}>
                                {projectNameText}
                              </td>
                              <td className="py-3 px-3 text-xs text-slate-600 whitespace-normal break-words align-top text-left min-w-[140px]" style={{ minWidth: "140px" }}>
                                {p["Owner Div"] || p["Owner Division"] || "-"}
                              </td>
                              <td className="py-3 px-3 text-xs text-slate-600 whitespace-normal break-words align-top text-left min-w-[120px]" style={{ minWidth: "120px" }}>
                                {p["Owner Name"] || "-"}
                              </td>
                              <td className="py-3 px-3 text-gray-650 align-top">
                                {picShortText}
                              </td>
                              <td className="py-3 px-3 align-top">
                                {hasAlias ? (
                                  <span className="inline-block text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded text-[11px] font-semibold uppercase font-sans whitespace-nowrap">
                                    On Development
                                  </span>
                                ) : (
                                  <span className={`inline-block text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${stampColor} font-sans`}>
                                    {rawStatus || "Unknown"}
                                  </span>
                                )}
                              </td>
                              <td className={isProgressCard ? "py-3 px-3 align-top text-left" : key === "queue" ? "py-3 px-3 whitespace-normal break-words text-xs font-medium text-slate-600 max-w-[280px] align-top text-left" : "py-3 px-3 text-right align-top"}>
                                {dateIsAlias ? (
                                  <span className="inline-block text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded text-[11px] font-semibold uppercase font-sans whitespace-nowrap">
                                    On Development
                                  </span>
                                ) : isProgressCard ? (
                                  <div className="whitespace-pre-line break-words text-xs leading-relaxed max-w-sm max-h-[110px] overflow-y-auto pr-1 text-left">
                                    {dateNotesText}
                                  </div>
                                ) : key === "queue" ? (
                                  dateNotesText
                                ) : (
                                  <div className="max-h-[96px] overflow-y-auto whitespace-pre-wrap break-words text-xs text-slate-600 font-medium pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 max-w-sm ml-auto text-right">
                                    {dateNotesText}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-3 align-top">
                                <div className="max-h-[120px] overflow-y-auto whitespace-pre-line break-words text-[11px] leading-relaxed text-slate-600 pr-2 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 max-w-sm" dangerouslySetInnerHTML={{ __html: renderChronologicalProgress(getGlobalProgressUpdate(p)) }} />
                              </td>
                            </tr>
                          );
                        })}
                        {pList.length === 0 && (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-xs text-gray-400 font-sans italic">
                              No matching projects found for this criteria in the selected range.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-150 bg-gray-50/50 flex justify-end">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold border border-gray-200 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Close Detail View
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* RENDER DYNAMIC DRILL-DOWN MODALS - MILESTONE SLA PIPELINE */}
      {activeModal && activeModal.type === 'milestone_sla' && activeModal.stageName && (() => {
        const stageName = activeModal.stageName;
        const stageField = slaFieldMap[stageName.toUpperCase()];

        // Helper function for polite cancellation reason
        const getPoliteCancellationReason = (d: any): string => {
          return "Penyesuaian prioritas portofolio bisnis dan realokasi sumber daya strategis korporat (Strategic Portfolio Realignment).";
        };

        // 1. Filter evaluated projects for Year 2026, excluding CANCELED
        const evaluatedStage2026Projects = list.filter(p => {
          const evaluatedVal = p[stageField];
          const isEvaluated = evaluatedVal === "Achieved" || evaluatedVal === "Not Achieved";
          const is2026 = getProjectIntakeYear(p) === "2026";
          const isCanceled = p["Last Status"] && p["Last Status"].trim().toUpperCase() === "CANCELED";
          return isEvaluated && is2026 && !isCanceled;
        });

        // Collect canceled projects for year 2026 that would fall into this stage
        const canceledStageProjectsList = list.filter(p => {
          const evaluatedVal = p[stageField];
          const isEvaluated = evaluatedVal === "Achieved" || evaluatedVal === "Not Achieved";
          const is2026 = getProjectIntakeYear(p) === "2026";
          const isCanceled = p["Last Status"] && p["Last Status"].trim().toUpperCase() === "CANCELED";
          return isEvaluated && is2026 && isCanceled;
        });

        // 2. Metrics splits
        const achievedStageList = evaluatedStage2026Projects.filter(p => p[stageField] === "Achieved");
        const missedStageList = evaluatedStage2026Projects.filter(p => p[stageField] === "Not Achieved");

        // 3. Success Percentage
        const totalEvaluated = evaluatedStage2026Projects.length;
        const pctAch = totalEvaluated > 0 ? Math.round((achievedStageList.length / totalEvaluated) * 100) : 100;

        // Custom styling markers depending on pctAch
        const statusLabel = pctAch < 93 ? "Not Achieved" : "Achieved";
        const badgeColor = pctAch < 93 ? "text-rose-700 bg-rose-50 border-rose-100" : "text-emerald-700 bg-emerald-50 border-emerald-100";

        return (
          <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-11/12 max-w-[94vw] h-[85vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden transform scale-100 animate-in fade-in duration-200">
              {/* Header */}
              <div className="p-5 border-b border-gray-150 flex items-center justify-between bg-gray-50/55">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 font-display">
                    {activeModal.title}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium mt-1">
                    Evaluated projects for the <strong>{stageName}</strong> milestone stage in year <strong>2026</strong>
                  </p>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-105 rounded-xl transition-colors cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              {/* High level summary badge row */}
              <div className="px-6 py-4 bg-slate-50/70 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 select-none">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Stage Projects (2026):</span>
                  <span className="text-sm font-extrabold text-gray-900 font-mono bg-white border border-gray-150 rounded-xl px-3 py-1 shadow-2xs">
                    {totalEvaluated} Evaluated
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage SLA Pct:</span>
                  <span className={`text-sm font-extrabold font-mono rounded-xl px-3 py-1 border flex items-center gap-1.5 ${badgeColor}`}>
                    {pctAch}% ({statusLabel})
                  </span>
                </div>
              </div>

              {/* Main divided table list container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* 1. NOT ACHIEVED / MISSED LIST */}
                <div>
                  <div className="flex items-center justify-between mb-2 select-none">
                    <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider font-display flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      Not Achieved / Missed Stage SLA ({missedStageList.length} Projects)
                    </h4>
                  </div>
                  <div className="border border-rose-100 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-rose-50/50 border-b border-rose-100 text-[10px] text-rose-800 font-bold uppercase tracking-wider font-display">
                          <th className="py-2.5 px-3">Ticket</th>
                          <th className="py-2.5 px-3">Project Name</th>
                          <th className="py-2.5 px-3">Owner</th>
                          <th className="py-2.5 px-3">Division</th>
                          <th className="py-2.5 px-3 font-display font-bold uppercase tracking-wider">PIC Short</th>
                          <th className="py-2.5 px-3 font-display font-bold uppercase tracking-wider">Last Status</th>
                          <th className="py-2.5 px-3 font-display font-bold uppercase tracking-wider">Target/Realized Date</th>
                          <th className="py-2.5 px-3 font-display font-bold uppercase tracking-wider text-left">LATEST PHASING LOG</th>
                          <th className={`py-2.5 px-3 font-display font-bold uppercase tracking-wider ${["FSD", "DEV", "SIT"].includes(stageName.toUpperCase()) ? "text-left" : "text-right"}`}>{stageName.toUpperCase()} FAILURE REASON</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-50 select-text bg-rose-50/[0.08]">
                        {missedStageList.map((p, idx) => {
                          const stg = stageName.toUpperCase();
                          const dateVal = getProjectDisplayDate(p);

                          // Compute failure reason text
                          let failReason = "Unspecified operational delay";
                          let reasonToUse = "";
                          if (stg === "FSD") {
                            failReason = "Penyesuaian lini masa demi penyelarasan kebutuhan ruang lingkup (Scope Realignment).";
                          } else if (stg === "DEV") {
                            failReason = "Optimalisasi arsitektur kode dan pengujian kualitas menyeluruh (Quality & Stabilization Cycle).";
                          } else if (stg === "SIT") {
                            failReason = "Sinkronisasi dependensi sistem lingkungan pengujian terintegrasi (Environment & Integration Tuning).";
                          } else {
                            if (stg === "UAT") reasonToUse = p["(UAT) Kategori Alasan Terlambat >=2022"];
                            else if (stg === "LIVE") reasonToUse = p["(Live) Kategori Alasan Terlambat >=2022"];

                            if (reasonToUse && String(reasonToUse).trim().length > 0) {
                              failReason = String(reasonToUse).trim();
                            }
                          }

                          return (
                            <tr key={idx} className="hover:bg-rose-50/20 transition-colors">
                              <td className="py-2.5 px-3 font-mono font-bold text-gray-500 text-left whitespace-normal break-words">{p["Ticket"] || "—"}</td>
                              <td className="py-2.5 px-3 font-bold text-gray-800 whitespace-normal break-words leading-relaxed">{p["Project Name"]}</td>
                              <td className="py-2.5 px-3 text-gray-700 font-medium whitespace-normal break-words leading-relaxed">{p["Owner Name"] || "—"}</td>
                              <td className="py-2.5 px-3 whitespace-normal break-words leading-relaxed">
                                {p["Owner Div"] ? (
                                  <span className="inline-block text-[10px] text-gray-600 bg-gray-50 border border-gray-200/60 px-2 py-0.5 rounded-md font-medium">
                                    {p["Owner Div"]}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-gray-650 whitespace-normal break-words">{p["PIC Short Name"] || p["PIC Name"] || "—"}</td>
                              <td className="py-2.5 px-3">
                                <div className="flex flex-col gap-1 items-start">
                                  <span className="inline-block text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded-md border text-rose-700 bg-rose-50/50 border-rose-100 whitespace-normal break-words">
                                    {p["Last Status"] || "Not Achieved"}
                                  </span>
                                  {/* Custom SLA Alert Badge */}
                                  {stg === "FSD" && (
                                    <span className="inline-block text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md text-white bg-rose-600 border border-rose-700">
                                      not achieved SLA
                                    </span>
                                  )}
                                  {stg === "DEV" && (
                                    <span className="inline-block text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md text-white bg-rose-600 border border-rose-700">
                                      not achieved dev
                                    </span>
                                  )}
                                  {stg === "SIT" && (
                                    <span className="inline-block text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md text-white bg-rose-600 border border-rose-700">
                                      not achieved SLA
                                    </span>
                                  )}
                                  {stg === "UAT" && (
                                    <span className="inline-block text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md text-white bg-rose-600 border border-rose-700">
                                      not achieved SLA
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="max-h-[96px] overflow-y-auto whitespace-pre-wrap break-words text-xs text-slate-600 font-medium pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 max-w-sm">
                                  {dateVal}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 align-top">
                                <div className="max-h-[96px] overflow-y-auto whitespace-pre-wrap break-words text-[11px] leading-relaxed text-slate-600 pr-2 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 max-w-sm">
                                  {getGlobalProgressUpdate(p)}
                                </div>
                              </td>
                              <td className={`py-2.5 px-3 whitespace-normal break-words leading-relaxed max-w-[280px] ${["FSD", "DEV", "SIT"].includes(stg) ? "text-left" : "text-right"}`}>
                                {["FSD", "DEV", "SIT"].includes(stg) ? (
                                  <div className="text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-normal break-words">
                                    {failReason}
                                  </div>
                                ) : (
                                  <span className="font-semibold text-[11px] text-rose-800 italic">
                                    {failReason}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {missedStageList.length === 0 && (
                          <tr>
                            <td colSpan={9} className="py-8 text-center text-xs text-emerald-600 font-semibold italic">
                              🎉 Phenomenal! 100% of stage projects achieved the SLA target.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. ACHIEVED LIST */}
                <div>
                  <div className="flex items-center justify-between mb-2 select-none">
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider font-display flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Achieved Stage SLA ({achievedStageList.length} Projects)
                    </h4>
                  </div>
                  <div className="border border-emerald-100 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-emerald-50/30 border-b border-emerald-100 text-[10px] text-emerald-800 font-bold uppercase tracking-wider font-display">
                          <th className="py-2.5 px-4">Ticket</th>
                          <th className="py-2.5 px-4">Project Name</th>
                          <th className="py-2.5 px-4">Owner</th>
                          <th className="py-2.5 px-4">Division</th>
                          <th className="py-2.5 px-4 font-display font-bold uppercase tracking-wider">PIC Short</th>
                          <th className="py-2.5 px-4 font-display font-bold uppercase tracking-wider">Last Status</th>
                          <th className="py-2.5 px-4 text-right font-display font-bold uppercase tracking-wider">Target/Realized Date</th>
                          <th className="py-2.5 px-4 text-left font-display font-bold uppercase tracking-wider">LATEST PHASING LOG</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50 select-text bg-white">
                        {achievedStageList.map((p, idx) => {
                          const dateVal = getProjectDisplayDate(p);

                          return (
                            <tr key={idx} className="hover:bg-emerald-50/10 transition-colors">
                              <td className="py-2.5 px-4 font-mono font-bold text-gray-500 text-left whitespace-normal break-words">{p["Ticket"] || "—"}</td>
                              <td className="py-2.5 px-4 font-semibold text-gray-800 whitespace-normal break-words leading-relaxed">{p["Project Name"]}</td>
                              <td className="py-2.5 px-4 text-gray-700 font-medium whitespace-normal break-words leading-relaxed">{p["Owner Name"] || "—"}</td>
                              <td className="py-2.5 px-4 whitespace-normal break-words leading-relaxed">
                                {p["Owner Div"] ? (
                                  <span className="inline-block text-[10px] text-gray-600 bg-gray-50 border border-gray-200/60 px-2 py-0.5 rounded-md font-medium">
                                    {p["Owner Div"]}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                              <td className="py-2.5 px-4 text-gray-650 whitespace-normal break-words">{p["PIC Short Name"] || p["PIC Name"] || "—"}</td>
                              <td className="py-2.5 px-4">
                                <span className="inline-block text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded-md border text-emerald-700 bg-emerald-50/50 border-emerald-100 whitespace-normal break-words">
                                  {p["Last Status"] || "Achieved"}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-right">
                                <div className="max-h-[96px] overflow-y-auto whitespace-pre-wrap break-words text-xs text-slate-600 font-medium pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 max-w-sm ml-auto text-right">
                                  {dateVal}
                                </div>
                              </td>
                              <td className="py-2.5 px-4 align-top">
                                <div className="max-h-[96px] overflow-y-auto whitespace-pre-wrap break-words text-[11px] leading-relaxed text-slate-600 pr-2 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 max-w-sm">
                                  {getGlobalProgressUpdate(p)}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {achievedStageList.length === 0 && (
                          <tr>
                            <td colSpan={8} className="py-6 text-center text-xs text-gray-400 italic">No achieved projects recorded</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. TERMINATED / CANCELED PROJECTS */}
                <div>
                  <div className="flex items-center justify-between mb-2 select-none">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-display flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400 border border-red-500/30" />
                      TERMINATED / CANCELED PROJECTS ({canceledStageProjectsList.length} ITEMS)
                    </h4>
                  </div>
                  {canceledStageProjectsList.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-450 italic bg-slate-50/50 border border-dashed border-gray-200 rounded-xl select-none">
                      No canceled projects recorded in this stage segment.
                    </div>
                  ) : (
                    <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-200/80 text-[10px] text-slate-700 font-bold uppercase tracking-wider font-display">
                            <th className="py-2.5 px-4 w-[12%]">TICKET</th>
                            <th className="py-2.5 px-4 w-[35%]">PROJECT NAME</th>
                            <th className="py-2.5 px-4 w-[25%]">OWNER / DIVISION</th>
                            <th className="py-2.5 px-4 text-left font-display font-bold uppercase tracking-wider">CANCELLATION REASON</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white select-text">
                          {canceledStageProjectsList.map((p, idx) => {
                            const reasonText = getPoliteCancellationReason(p);
                            return (
                              <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                                <td className="py-2.5 px-4 font-mono font-bold text-gray-500 text-left whitespace-normal break-words">{p["Ticket"] || "—"}</td>
                                <td className="py-2.5 px-4 font-semibold text-gray-800 whitespace-normal break-words leading-relaxed">{p["Project Name"]}</td>
                                <td className="py-2.5 px-4 whitespace-normal break-words leading-relaxed">
                                  <div className="text-gray-700 font-medium">
                                    {p["Owner Name"] || "—"}
                                  </div>
                                  {p["Owner Div"] && (
                                    <span className="inline-block mt-1 text-[10px] text-slate-600 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md font-medium">
                                      {p["Owner Div"]}
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-4 text-left whitespace-normal break-words leading-relaxed max-w-[340px]">
                                  <div className="text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-normal break-words">
                                    {reasonText}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-150 bg-gray-50/50 flex justify-end">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold border border-gray-200 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Close Stage View
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* RENDER DYNAMIC DRILL-DOWN MODALS - DEV SLA YEAR ON YEAR COMPARISON */}
      {activeModal && activeModal.type === 'yoy_comparison' && (() => {
        const MONTH_MAP_LOWER: Record<string, number> = {
          jan: 0,
          feb: 1,
          mar: 2,
          apr: 3,
          may: 4,
          mei: 4,
          jun: 5,
          jul: 6,
          aug: 7,
          agu: 7,
          sep: 8,
          oct: 9,
          okt: 9,
          nov: 10,
          dec: 11,
          des: 11
        };

        const getProjMonthIdx = (p: any) => {
          const period = p["Period"];
          if (!period) return -1;
          const parts = String(period).trim().split("-");
          if (parts.length === 0) return -1;
          const mStr = parts[0].trim().toLowerCase();
          const index = MONTH_MAP_LOWER[mStr];
          return index !== undefined ? index : -1;
        };

        const startIdx = startMonth ? (MONTH_MAP_LOWER[startMonth.toLowerCase()] ?? 0) : 0;
        const endIdx = endMonth ? (MONTH_MAP_LOWER[endMonth.toLowerCase()] ?? 11) : 11;

        const masterAll = allProjects || list;

        const projs2025 = masterAll.filter(p => {
          const is2025 = getProjectIntakeYear(p) === "2025";
          if (!is2025) return false;
          const mIdx = getProjMonthIdx(p);
          return mIdx >= startIdx && mIdx <= endIdx;
        });

        const projs2026 = masterAll.filter(p => {
          const is2026 = getProjectIntakeYear(p) === "2026";
          if (!is2026) return false;
          const mIdx = getProjMonthIdx(p);
          return mIdx >= startIdx && mIdx <= endIdx;
        });

        // Helper to check if dev is completed
        const getDevStatus = (p: any) => {
          const isCompleted = p["DEV SLA"] === "Achieved" || p["DEV SLA"] === "Not Achieved" || !!p["(Dev) Realized In Date"];
          return isCompleted ? (
            <span className="inline-block text-[9.5px] uppercase font-mono font-bold px-1.5 py-0.5 rounded-md border text-emerald-700 bg-emerald-50 border-emerald-100">
              Completed
            </span>
          ) : (
            <span className="inline-block text-[9.5px] uppercase font-mono font-bold px-1.5 py-0.5 rounded-md border text-blue-700 bg-blue-50 border-blue-100/70 animate-pulse">
              In-Progress
            </span>
          );
        };

        // Delay days helper
        const getDelayVal = (p: any) => {
          const delay = p._lateDev != null ? p._lateDev : 0;
          if (delay > 0) {
            return (
              <span className="font-mono text-rose-600 font-bold bg-rose-50 border border-rose-100/60 px-1.5 py-0.5 rounded-md">
                +{delay} d
              </span>
            );
          } else if (delay < 0) {
            return (
              <span className="font-mono text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100/60 px-1.5 py-0.5 rounded-md">
                {delay} d
              </span>
            );
          }
          return <span className="font-mono text-gray-400">0 d</span>;
        };

        const getProfessionalReason = (rawReason: string) => {
          if (!rawReason || rawReason === "-") return "-";
          
          const reason = rawReason.trim().toLowerCase();
          
          // Mapping Table
          if (reason.includes("kesalahan planning")) return "Penyesuaian estimasi & optimalisasi roadmap pengembangan";
          if (reason.includes("fixing bug") || reason.includes("bug")) return "Optimalisasi arsitektur kode & pengujian kualitas menyeluruh (Quality & Stabilization Cycle)";
          if (reason.includes("requirement change") || reason.includes("change request")) return "Penyelarasan kebutuhan bisnis & penyesuaian scope berkelanjutan";
          if (reason.includes("waiting owner") || reason.includes("tunggu owner")) return "Sinkronisasi kebutuhan & penguatan koordinasi antar-stakeholder";
          
          return rawReason; // Fallback if no alias matches
        };

        return (
          <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-7xl w-full h-[85vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden transform scale-100 animate-in fade-in duration-200">
              {/* Header */}
              <div className="p-5 border-b border-gray-150 flex items-center justify-between bg-gray-50/55">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 font-display">
                    {activeModal.title}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium mt-1">
                    Unified comparative dashboard contrasting 2025 performance directly with 2026 based on active scope filters
                  </p>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-105 rounded-xl transition-colors cursor-pointer text-sm font-sans"
                >
                  ✕
                </button>
              </div>

              {/* Side-by-side Split Screens Container */}
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50/20">
                {/* LEFT COLUMN: Year 2025 */}
                <div className="flex flex-col space-y-3 bg-white p-4 rounded-2xl border border-gray-150 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-1">
                    <h4 className="text-sm font-extrabold text-blue-700 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      Year 2025 Dataset ({projs2025.length} Projects)
                    </h4>
                    <span className="text-[10px] text-gray-400 font-mono">Periode 2025</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-150 text-[10px] text-gray-500 font-bold uppercase tracking-wider font-display grid grid-cols-[80px,180px,60px,100px,60px,minmax(200px,1fr)] items-center">
                          <th className="py-2.5 px-3">Year/Period</th>
                          <th className="py-2.5 px-3">Ticket & Name</th>
                          <th className="py-2.5 px-2">PIC Short</th>
                          <th className="py-2.5 px-3 text-left">LAST STATUS</th>
                          <th className="py-2.5 px-3 text-right">Delay Days</th>
                          <th className="py-2.5 px-3 text-left">REASON</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 select-text block">
                        {projs2025.map((p, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50 grid grid-cols-[80px,180px,60px,100px,60px,minmax(200px,1fr)] items-start py-2.5">
                            <td className="px-3 font-mono text-[10.5px] text-gray-500 align-top">
                              {(p._year || p["Year"] || "2025")} / {(p._period || p["Period"] || "—")}
                            </td>
                            <td className="px-3 whitespace-normal break-words align-top" title={p["Project Name"]}>
                              <div className="font-mono text-[10px] font-bold text-gray-400">{p["Ticket"] || "—"}</div>
                              <div className="font-bold text-gray-800 text-[11.5px] whitespace-normal break-words">{p["Project Name"]}</div>
                            </td>
                            <td className="px-2 text-gray-650 align-top truncate" title={p["PIC Short Name"] || p["PIC Name"] || ""}>
                              {p["PIC Short Name"] || p["PIC Name"] || "—"}
                            </td>
                            <td className="px-3 align-top">
                              <div className="status-badge text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-tight inline-block whitespace-nowrap">
                                {p["Last Status"] || "—"}
                              </div>
                            </td>
                            <td className="px-3 text-right font-mono text-xs align-top">
                              {getDelayVal(p)}
                            </td>
                            <td className="px-3 text-left text-[11px] text-slate-600 leading-[1.4] whitespace-normal break-words align-top" title={getProfessionalReason(p["(Dev) Kategori Alasan Terlambat >=2022"] || "")}>
                              {getProfessionalReason(p["(Dev) Kategori Alasan Terlambat >=2022"] || "")}
                            </td>
                          </tr>
                        ))}
                        {projs2025.length === 0 && (
                          <tr className="grid grid-cols-1">
                            <td className="py-12 text-center text-xs text-gray-400 italic">
                              No Year 2025 projects available for the current filter scope.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
 
                {/* RIGHT COLUMN: Year 2026 */}
                <div className="flex flex-col space-y-3 bg-white p-4 rounded-2xl border border-gray-150 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-1">
                    <h4 className="text-sm font-extrabold text-amber-600 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Year 2026 Dataset ({projs2026.length} Projects)
                    </h4>
                    <span className="text-[10px] text-gray-400 font-mono font-bold">Periode 2026</span>
                  </div>
 
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-150 text-[10px] text-gray-500 font-bold uppercase tracking-wider font-display grid grid-cols-[80px,180px,60px,100px,60px,minmax(200px,1fr)] items-center">
                          <th className="py-2.5 px-3">Year/Period</th>
                          <th className="py-2.5 px-3">Ticket & Name</th>
                          <th className="py-2.5 px-2">PIC Short</th>
                          <th className="py-2.5 px-3 text-left">LAST STATUS</th>
                          <th className="py-2.5 px-3 text-right">Delay Days</th>
                          <th className="py-2.5 px-3 text-left">REASON</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-101 select-text block">
                        {projs2026.map((p, idx) => (
                          <tr key={idx} className="hover:bg-amber-50/[0.04] grid grid-cols-[80px,180px,60px,100px,60px,minmax(200px,1fr)] items-start py-2.5">
                            <td className="px-3 font-mono text-[10.5px] text-gray-500 align-top">
                              {(p._year || p["Year"] || "2026")} / {(p._period || p["Period"] || "—")}
                            </td>
                            <td className="px-3 whitespace-normal break-words align-top" title={p["Project Name"]}>
                              <div className="font-mono text-[10px] font-bold text-gray-400">{p["Ticket"] || "—"}</div>
                              <div className="font-bold text-gray-800 text-[11.5px] whitespace-normal break-words">{p["Project Name"]}</div>
                            </td>
                            <td className="px-2 text-gray-650 align-top truncate" title={p["PIC Short Name"] || p["PIC Name"] || ""}>
                              {p["PIC Short Name"] || p["PIC Name"] || "—"}
                            </td>
                            <td className="px-3 align-top">
                              <div className="status-badge text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-tight inline-block whitespace-nowrap">
                                {p["Last Status"] || "—"}
                              </div>
                            </td>
                            <td className="px-3 text-right font-mono text-xs align-top">
                              {getDelayVal(p)}
                            </td>
                            <td className="px-3 text-left text-[11px] text-slate-600 leading-[1.4] whitespace-normal break-words align-top" title={getProfessionalReason(p["(Dev) Kategori Alasan Terlambat >=2022"] || "")}>
                              {getProfessionalReason(p["(Dev) Kategori Alasan Terlambat >=2022"] || "")}
                            </td>
                          </tr>
                        ))}
                        {projs2026.length === 0 && (
                          <tr className="grid grid-cols-1">
                            <td className="py-12 text-center text-xs text-gray-400 italic">
                              No Year 2026 projects available for the current filter scope.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-150 bg-gray-50/50 flex justify-end">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold border border-gray-200 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Close Comparison
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
