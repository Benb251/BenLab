import { Language } from '../store/settingsStore';

export const translations = {
    en: {
        // Hero
        "hero.subtitle": "The Noir Experience",
        "hero.coords": "COORDS: 34.0522° N, 118.2437° W",
        "hero.clickInit": "Click to Initialize",

        // Modules
        "modules.title": "SYSTEM MODULES",
        "modules.freeGen": "FREE GEN",
        "modules.freeGenDesc": "// UNLIMITED ACCESS",
        "modules.sketch": "SKETCH +",
        "modules.sketchDesc": "// PROFESSIONAL SUITE",
        "modules.inpaint": "INPAINT",
        "modules.inpaintDesc": "// REALITY EDITOR",
        "modules.video": "VEO VIDEO",
        "modules.videoDesc": "// MOTION SYNTHESIS",
        "modules.freeGenLong": "Rapid prototyping engine for conceptual art.",
        "modules.sketchLong": "High-fidelity rendering from rough drafts.",
        "modules.inpaintLong": "Seamless object removal and scene modification.",
        "modules.videoLong": "Next-gen temporal video generation.",

        // Generation Panel
        "gen.abort": "Abort Sequence",
        "gen.freeGen": "Free_Gen",
        "gen.sysRdy": "SYS_RDY",
        "gen.core": "Processing Core",
        "gen.ratio": "Frame Ratio",
        "gen.batch": "Batch Size",
        "gen.ref": "Visual References",
        "gen.promptPlaceholder": "Describe your vision...",
        "gen.execute": "EXECUTE",
        "gen.processing": "PROCESSING",

        // Settings
        "settings.title": "SYS_CTRL",
        "settings.subtitle": "V.2.0.1 // CONFIGURATION",
        "settings.save": "Apply Changes",
        "settings.cancel": "Cancel",
        "settings.tab.defaults": "Defaults",
        "settings.tab.storage": "Storage",

        // Settings - Defaults
        "settings.def.params": "Default Params",
        "settings.def.language": "Interface Language",
        "settings.def.negPrompt": "Auto-Negative Prompt",
        "settings.def.negPromptDesc": "* Automatically appended to all generation requests to filter unwanted artifacts.",
        "settings.def.ratio": "Frame Ratio Default",
        "settings.def.audio": "Interface Audio",
        "settings.def.sfxOn": "SFX ENABLED",
        "settings.def.sfxOff": "SFX MUTED",

        // Settings - Storage
        "settings.store.vault": "Data Vault",
        "settings.store.usage": "Storage Usage",
        "settings.store.records": "RECORDS",
        "settings.store.est": "Estimated Size",
        "settings.store.backup": "Backup Vault",
        "settings.store.export": "EXPORT JSON DB",
        "settings.store.restore": "Restore Vault",
        "settings.store.import": "IMPORT JSON DB",
        "settings.store.purge": "Purge System",
        "settings.store.delete": "DELETE ALL DATA",
        "settings.store.purgeConfirm": "WARNING: PERMANENT DATA LOSS. Are you sure you want to purge the database?",
        "settings.store.purged": "SYSTEM PURGED: Vault is empty.",
        "settings.store.restoreSuccess": "SUCCESS: Restored {count} records to Vault.",
        "settings.store.errorExport": "System Error: Export Failed",
        "settings.store.errorImport": "System Error: Invalid Backup File",
    },
    vi: {
        // Hero
        "hero.subtitle": "Trải Nghiệm Điện Ảnh",
        "hero.coords": "TỌA ĐỘ: 16.0544° N, 108.2022° E",
        "hero.clickInit": "Nhấn Để Khởi Động",

        // Modules
        "modules.title": "MÔ ĐUN HỆ THỐNG",
        "modules.freeGen": "FREE GEN",
        "modules.freeGenDesc": "// TRUY CẬP KHÔNG GIỚI HẠN",
        "modules.sketch": "SKETCH +",
        "modules.sketchDesc": "// BỘ CÔNG CỤ CHUYÊN NGHIỆP",
        "modules.inpaint": "INPAINT",
        "modules.inpaintDesc": "// CHỈNH SỬA THỰC TẾ",
        "modules.video": "VEO VIDEO",
        "modules.videoDesc": "// TỔNG HỢP CHUYỂN ĐỘNG",
        "modules.freeGenLong": "Công cụ tạo mẫu nhanh cho nghệ thuật ý tưởng.",
        "modules.sketchLong": "Kết xuất độ trung thực cao từ bản phác thảo thô.",
        "modules.inpaintLong": "Xóa đối tượng và sửa đổi cảnh liền mạch.",
        "modules.videoLong": "Tạo video thế hệ tiếp theo.",

        // Generation Panel
        "gen.abort": "Hủy Quy Trình",
        "gen.freeGen": "Free_Gen",
        "gen.sysRdy": "HỆ THỐNG SẴN SÀNG",
        "gen.core": "Lõi Xử Lý",
        "gen.ratio": "Tỷ Lệ Khung Hình",
        "gen.batch": "Số Lượng Ảnh",
        "gen.ref": "Tài Liệu Tham Khảo",
        "gen.promptPlaceholder": "Mô tả ý tưởng của bạn...",
        "gen.execute": "THỰC THI",
        "gen.processing": "ĐANG XỬ LÝ",

        // Settings
        "settings.title": "ĐIỀU KHIỂN",
        "settings.subtitle": "V.2.0.1 // CẤU HÌNH",
        "settings.save": "Lưu Thay Đổi",
        "settings.cancel": "Hủy",
        "settings.tab.defaults": "Mặc Định",
        "settings.tab.storage": "Lưu Trữ",

        // Settings - Defaults
        "settings.def.params": "Tham Số Mặc Định",
        "settings.def.language": "Ngôn Ngữ Giao Diện",
        "settings.def.negPrompt": "Negative Prompt Tự Động",
        "settings.def.negPromptDesc": "* Tự động thêm vào yêu cầu tạo ảnh để lọc bỏ các chi tiết thừa.",
        "settings.def.ratio": "Tỷ Lệ Mặc Định",
        "settings.def.audio": "Âm Thanh Giao Diện",
        "settings.def.sfxOn": "BẬT ÂM THANH",
        "settings.def.sfxOff": "TẮT ÂM THANH",

        // Settings - Storage
        "settings.store.vault": "Kho Dữ Liệu",
        "settings.store.usage": "Dung Lượng Sử Dụng",
        "settings.store.records": "BẢN GHI",
        "settings.store.est": "Dung Lượng Ước Tính",
        "settings.store.backup": "Sao Lưu Kho",
        "settings.store.export": "XUẤT DB JSON",
        "settings.store.restore": "Khôi Phục Kho",
        "settings.store.import": "NHẬP DB JSON",
        "settings.store.purge": "Dọn Dẹp Hệ Thống",
        "settings.store.delete": "XÓA TOÀN BỘ DỮ LIỆU",
        "settings.store.purgeConfirm": "CẢNH BÁO: DỮ LIỆU SẼ MẤT VĨNH VIỄN. Bạn có chắc chắn muốn xóa không?",
        "settings.store.purged": "ĐÃ DỌN DẸP: Kho dữ liệu trống.",
        "settings.store.restoreSuccess": "THÀNH CÔNG: Đã khôi phục {count} bản ghi.",
        "settings.store.errorExport": "Lỗi Hệ Thống: Xuất Dữ Liệu Thất Bại",
        "settings.store.errorImport": "Lỗi Hệ Thống: File Sao Lưu Không Hợp Lệ",
    }
};

export const useTranslation = (lang: Language) => {
    return (key: keyof typeof translations['en'], params?: Record<string, string | number>) => {
        let text = translations[lang][key] || translations['en'][key] || key;
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(`{${k}}`, String(v));
            });
        }
        return text;
    };
};
