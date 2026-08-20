const translations = {
    en: {
        title: "ExPDF | Extract & Split PDF Pages Free",
        brandName: "ExPDF",
        brandSub: "PDF Core Suite",
        dragDrop: "Drag & Drop PDF",
        browseFiles: "or click to browse local files",
        secureText: "100% Secure & Client-Side Only",
        selectPagesHeader: "1. Select Pages",
        pageRangeLabel: "Page Range",
        pageRangeTooltip: "Enter page numbers and/or ranges separated by commas. E.g. \"1-3, 5, 7-10\"",
        pageRangePlaceholder: "e.g. 1-5, 8, 11-13",
        invalidRange: "Invalid page range",
        selectAll: "All",
        selectNone: "None",
        selectInvert: "Invert",
        selectEven: "Even",
        selectOdd: "Odd",
        operationsHeader: "2. Operations",
        extractTitle: "Extract Selection",
        extractDesc: "Create new PDF with chosen pages",
        removeTitle: "Remove Selection",
        removeDesc: "Download rest of the PDF",
        zipTitle: "Export as Images",
        zipDesc: "Download chosen pages as ZIP",
        addFileTitle: "Add More Files",
        addFileDesc: "Merge PDFs into this document",
        splitTitle: "Split All Pages",
        splitDesc: "Download each page as a single PDF (.zip)",
        sandboxText: "100% Secure Local Browser Processing",
        workspaceTitle: "Interactive Workspace",
        workspaceDesc: "Load a PDF to preview pages, select order visually, and extract.",
        noPdfTitle: "No PDF Loaded",
        noPdfDesc: "Drag and drop a PDF file in the sidebar or upload from your device to begin visual extraction",
        uploadBtn: "Upload Document",
        uploadPdfBtn: "Upload PDF",
        uploadImgBtn: "Image to PDF",
        analyzingTitle: "Analyzing PDF",
        analyzingDesc: "Rendering page thumbnails...",
        zoomSmall: "Small",
        zoomMedium: "Medium",
        zoomLarge: "Large",
        pageCount: "{count} pages",
        pageCountSingle: "1 page",
        selectedCount: "{count} selected",
        pageNumber: "Page {num}",
        errInvalidPdf: "Please select a valid PDF or Image file.",
        errParse: "Error parsing PDF content. Make sure it is not corrupted or encrypted.",
        errRead: "Could not read the PDF file.",
        rotatePage: "Rotate Page",
        swapPage: "Tap to Swap",
        compressToggle: "Compress & Flatten",
        compressLevel: "Quality Level:",
        seoTitle: "The Most Secure PDF Extractor & Splitter Online",
        seoDesc: "ExPDF is an advanced, client-side PDF tool designed to help you extract PDF pages, remove specific pages from a document, or compress PDF sizes without ever uploading your private files to a server. Because everything runs locally in your browser, your sensitive documents never leave your device.",
        seoFeature1: "100% Serverless & Secure",
        seoFeature2: "Instant Processing",
        seoFeature3: "No Quality Loss",
        errExtract: "An error occurred during extraction. The document layout might be restricted.",
        errRemove: "An error occurred during removal.",
        errSplit: "An error occurred during splitting.",
        errCannotRemoveAll: "Cannot remove all pages. A PDF must contain at least 1 page.",
        loaderReadBytes: "Reading file byte buffer...",
        loaderInitGrid: "Initializing page thumbnail grid...",
        loaderRenderThumb: "Rendering page thumbnail {current} of {total}...",
        loaderExtractNodes: "Initializing PDF extraction...",
        loaderExtractTrees: "Copying document trees...",
        loaderExtractStitch: "Stitching elements and indexes...",
        loaderExtractStream: "Finalizing byte stream serialization...",
        loaderComplete: "Download complete!",
        loaderOmitNodes: "Omiting page selections...",
        loaderOmitMap: "Recalculating page mapping tree...",
        loaderOmitCoords: "Re-stitching layout coordinates...",
        loaderOmitStream: "Building PDF binary stream...",
        loaderOmitSave: "Saving file...",
        loaderSplitDecomp: "De-compiling PDF page grids...",
        loaderSplitExtract: "Extracting Page {current} of {total}...",
        loaderSplitCompress: "Compressing PDF array lists into ZIP archive...",
        loaderSplitArchive: "Creating archive: {percent}%",
        loaderSplitTrigger: "Triggering download archive!",
        loaderMerge: "Merging multiple PDFs ({current}/{total})...",
        loaderMergeFinal: "Finalizing merged document...",
        langSwitcher: '<span class="fi fi-iq" style="margin-inline-end: 6px;"></span> العربية'
    },
    ar: {
        title: "ExPDF | استخراج وتقسيم صفحات PDF مجاناً",
        brandName: "ExPDF",
        brandSub: "مجموعة أدوات PDF",
        dragDrop: "اسحب وأفلت ملف PDF",
        browseFiles: "أو انقر لتصفح الملفات المحلية",
        secureText: "آمن 100٪ ويعمل على جهازك فقط",
        selectPagesHeader: "1. حدد الصفحات",
        pageRangeLabel: "نطاق الصفحات",
        pageRangeTooltip: "أدخل أرقام الصفحات أو النطاقات مفصولة بفواصل. مثال: \"1-3، 5، 7-10\"",
        pageRangePlaceholder: "مثال: 1-5، 8، 11-13",
        invalidRange: "نطاق صفحات غير صالح",
        selectAll: "الكل",
        selectNone: "لا شيء",
        selectInvert: "عكس",
        selectEven: "زوجي",
        selectOdd: "فردي",
        operationsHeader: "2. العمليات",
        extractTitle: "تصدير المحدد كملف PDF",
        extractDesc: "إنشاء PDF جديد بالصفحات المختارة",
        removeTitle: "إزالة التحديد",
        removeDesc: "تنزيل باقي ملف PDF",
        zipTitle: "تصدير كصور",
        zipDesc: "تنزيل الصفحات المختارة كملف ZIP",
        addFileTitle: "إضافة ملفات أخرى",
        addFileDesc: "دمج ملفات PDF في هذا المستند",
        splitTitle: "تقسيم كل الصفحات",
        splitDesc: "تنزيل كل صفحة كملف PDF منفصل (.zip)",
        sandboxText: "معالجة محلية آمنة 100٪ بدون رفع الملفات",
        workspaceTitle: "مساحة العمل التفاعلية",
        workspaceDesc: "قم بتحميل ملف PDF لمعاينة الصفحات، وتحديد الترتيب بصريًا، واستخراجها.",
        noPdfTitle: "لم يتم تحميل ملف PDF",
        noPdfDesc: "اسحب ملف PDF وأفلته في الشريط الجانبي أو قم بتحميله من جهازك للبدء",
        uploadBtn: "تحميل مستند",
        uploadPdfBtn: "تحميل PDF",
        uploadImgBtn: "صورة إلى PDF",
        analyzingTitle: "جاري تحليل PDF",
        analyzingDesc: "جاري عرض الصور المصغرة...",
        zoomSmall: "صغير",
        zoomMedium: "متوسط",
        zoomLarge: "كبير",
        pageCount: "{count} صفحات",
        pageCountSingle: "صفحة واحدة",
        selectedCount: "{count} محدد",
        pageNumber: "صفحة {num}",
        errInvalidPdf: "يرجى تحديد ملف PDF أو صورة صالحة.",
        errParse: "خطأ في قراءة محتوى PDF. تأكد من أنه غير تالف أو مشفر.",
        errRead: "تعذر قراءة ملف PDF.",
        rotatePage: "تدوير الصفحة",
        swapPage: "انقر للتبديل",
        compressToggle: "ضغط وتسطيح",
        compressLevel: "مستوى الجودة:",
        seoTitle: "أداة استخراج وتقسيم PDF الأكثر أماناً على الإنترنت",
        seoDesc: "ExPDF هي أداة PDF متقدمة تعمل من جانب العميل مصممة لمساعدتك على استخراج صفحات PDF، إزالة صفحات معينة، أو ضغط حجم الملف دون رفع ملفاتك الخاصة إلى أي خادم. لأن كل شيء يعمل محليًا في متصفحك، مستنداتك الحساسة لا تغادر جهازك أبداً.",
        seoFeature1: "آمن 100% وبدون خوادم",
        seoFeature2: "معالجة فورية",
        seoFeature3: "بدون فقدان الجودة",
        errExtract: "حدث خطأ أثناء الاستخراج. قد يكون تخطيط المستند مقيدًا.",
        errRemove: "حدث خطأ أثناء الإزالة.",
        errSplit: "حدث خطأ أثناء التقسيم.",
        errCannotRemoveAll: "لا يمكن إزالة كل الصفحات. يجب أن يحتوي الملف على صفحة واحدة على الأقل.",
        loaderReadBytes: "قراءة بيانات الملف...",
        loaderInitGrid: "تهيئة شبكة الصور المصغرة...",
        loaderRenderThumb: "عرض الصورة المصغرة {current} من {total}...",
        loaderExtractNodes: "معالجة عقد المستند الأساسية...",
        loaderExtractTrees: "نسخ شجرة المستند...",
        loaderExtractStitch: "تجميع العناصر والفهارس...",
        loaderExtractStream: "إنهاء تسلسل تدفق البايت...",
        loaderComplete: "اكتمل التنزيل!",
        loaderOmitNodes: "حذف الصفحات المحددة...",
        loaderOmitMap: "إعادة حساب خريطة الصفحات...",
        loaderOmitCoords: "إعادة تجميع إحداثيات التخطيط...",
        loaderOmitStream: "بناء التدفق الثنائي للملف...",
        loaderOmitSave: "جاري الحفظ...",
        loaderSplitDecomp: "تفكيك شبكات صفحات PDF...",
        loaderSplitExtract: "استخراج صفحة {current} من {total}...",
        loaderSplitCompress: "ضغط قوائم مصفوفات PDF في أرشيف ZIP...",
        loaderSplitArchive: "إنشاء أرشيف: {percent}%",
        loaderSplitTrigger: "بدء تنزيل الأرشيف!",
        loaderMerge: "يتم الآن دمج ملفات PDF ({current}/{total})...",
        loaderMergeFinal: "إنهاء المستند المدمج...",
        langSwitcher: '<span class="fi fi-gb" style="margin-inline-end: 6px;"></span> English'
    }
};

let currentLang = localStorage.getItem('appLang') || 'ar';

window.t = function(key, params = {}) {
    let text = translations[currentLang][key] || key;
    for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, v);
    }
    return text;
};

window.setLanguage = function(lang) {
    currentLang = lang;
    localStorage.setItem('appLang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Update language segment switcher buttons active class
    const btnEn = document.getElementById('lang-btn-en');
    const btnAr = document.getElementById('lang-btn-ar');
    if (btnEn && btnAr) {
        btnEn.classList.toggle('active', lang === 'en');
        btnAr.classList.toggle('active', lang === 'ar');
    }

    updateDOMTranslations();
    
    // Dispatch event so app.js can update dynamic states
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
};

window.toggleLanguage = function() {
    setLanguage(currentLang === 'en' ? 'ar' : 'en');
};

function updateDOMTranslations() {
    document.title = window.t('title');
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (el.tagName === 'INPUT' && el.type === 'text') {
            el.placeholder = window.t(key);
        } else {
            // Simple replace that keeps lucide icons if they exist
            if (el.innerHTML.includes('<i data-lucide=')) {
                // Keep the icon HTML
                const iconHtml = el.innerHTML.substring(0, el.innerHTML.indexOf('>') + 1 + el.innerHTML.split('>')[1].indexOf('<') - 1 + (el.innerHTML.indexOf('</i>') > -1 ? 4 : 0) ); 
                // Wait, it's safer to just rebuild the content for buttons
                if (key === 'selectAll') el.innerHTML = `<i data-lucide="check-square"></i> ${window.t(key)}`;
                else if (key === 'selectNone') el.innerHTML = `<i data-lucide="square"></i> ${window.t(key)}`;
                else if (key === 'selectInvert') el.innerHTML = `<i data-lucide="refresh-cw"></i> ${window.t(key)}`;
                else if (key === 'uploadBtn') el.innerHTML = `<i data-lucide="upload"></i> ${window.t(key)}`;
                else if (key === 'extractTitle') {
                    el.innerHTML = `<span class="btn-title">${window.t(key)}</span><span class="btn-desc">${window.t('extractDesc')}</span>`;
                }
                // etc, but better to use specific tags for text parts.
            } else {
                el.textContent = window.t(key);
            }
        }
    });

    document.querySelectorAll('[data-i18n-text]').forEach(el => {
        el.textContent = window.t(el.getAttribute('data-i18n-text'));
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        el.innerHTML = window.t(el.getAttribute('data-i18n-html'));
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        el.title = window.t(el.getAttribute('data-i18n-title'));
    });
    
    if (window.lucide) {
        lucide.createIcons();
    }
}

window.setTheme = function(theme) {
    const direction = theme === 'dark' ? 'theme-transitioning-to-dark' : 'theme-transitioning-to-light';
    
    if (document.startViewTransition) {
        document.documentElement.classList.add(direction);
        const transition = document.startViewTransition(() => {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('expdf_theme', theme);
            updateThemeIcon(theme);
        });
        transition.finished.then(() => {
            document.documentElement.classList.remove(direction);
        });
    } else {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('expdf_theme', theme);
        updateThemeIcon(theme);
    }
};

window.toggleTheme = function() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    window.setTheme(nextTheme);
};

function updateThemeIcon(theme) {
    const btn = document.getElementById('theme-switcher');
    if (btn) {
        btn.innerHTML = theme === 'light' 
            ? '<i data-lucide="moon" style="width: 16px; height: 16px;"></i>' 
            : '<i data-lucide="sun" style="width: 16px; height: 16px;"></i>';
        if (window.lucide) {
            lucide.createIcons();
        }
    }
}

// Initialize saved theme immediately
const savedTheme = localStorage.getItem('expdf_theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang);
    updateThemeIcon(savedTheme);
});

