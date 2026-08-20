// Configure PDF.js Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// Application State Variables
let pdfBytes = null;          // Raw ArrayBuffer of the uploaded PDF
let pdfDocument = null;       // PDF.js Document reference
let totalPageCount = 0;       // Total number of pages
let selectedPages = new Set(); // 1-indexed page indices selected by the user
let pageSizes = {};           // Cache for page size dimensions
let originalFilename = '';    // Cache for PDF original filename
let fileBoundaries = [];      // Array of objects {filename, startPage, endPage}
let sourceFiles = [];         // Array of { id, name, size, bytes }
let pageRotations = {};       // Maps pageNum -> rotation degrees
let pendingSwapNode = null;   // DOM node currently selected for a tap-to-swap

// DOM Element Caches
const dropzone = document.getElementById('dropzone');
const fileInputPdf = document.getElementById('file-input-pdf');
const fileInputImg = document.getElementById('file-input-img');
const fileInputAppend = document.getElementById('file-input-append');
const fileListContainer = document.getElementById('file-list-container');


const selectionControls = document.getElementById('selection-controls');
const selectedBadge = document.getElementById('selected-badge');
const pageRangeInput = document.getElementById('page-range-input');
const rangeError = document.getElementById('range-validation-error');

const btnSelectAll = document.getElementById('btn-select-all');
const btnSelectNone = document.getElementById('btn-select-none');
const btnSelectInvert = document.getElementById('btn-select-invert');
const btnSelectEven = document.getElementById('btn-select-even');
const btnSelectOdd = document.getElementById('btn-select-odd');

const actionsControls = document.getElementById('actions-controls');
const btnActionExtract = document.getElementById('btn-action-extract');
const btnActionRemove = document.getElementById('btn-action-remove');
const btnActionZip = document.getElementById('btn-action-zip');

const zoomControls = document.getElementById('zoom-controls');
const btnZoomOut = document.getElementById('btn-zoom-out');
const btnZoomIn = document.getElementById('btn-zoom-in');
const zoomLevelText = document.getElementById('zoom-level');

const idleState = document.getElementById('idle-state');
const thumbnailGrid = document.getElementById('thumbnail-grid');
const seoFooter = document.getElementById('seo-footer');

const loadingOverlay = document.getElementById('loading-overlay');
const loaderTitle = document.getElementById('loader-title');
const loaderSubtitle = document.getElementById('loader-subtitle');
const loaderProgress = document.getElementById('loader-progress');
const loaderPercent = document.getElementById('loader-percent');

// Initialize Icons
lucide.createIcons();

// ==========================================================================
// 1. Loader Overlay Controller
// ==========================================================================
function showLoader(title, subtitle = 'Processing...') {
    loaderTitle.textContent = title;
    loaderSubtitle.textContent = subtitle;
    loaderProgress.style.width = '0%';
    loaderPercent.textContent = '0%';
    loadingOverlay.classList.remove('hidden');
}

function updateLoaderProgress(percent, subtitle = null) {
    const cleanPercent = Math.min(100, Math.max(0, Math.round(percent)));
    loaderProgress.style.width = `${cleanPercent}%`;
    loaderPercent.textContent = `${cleanPercent}%`;
    if (subtitle) {
        loaderSubtitle.textContent = subtitle;
    }
}

function hideLoader() {
    loadingOverlay.classList.add('hidden');
}

// ==========================================================================
// 2. Drag and Drop File Handlers
// ==========================================================================


if (fileInputPdf) {
    fileInputPdf.addEventListener('change', (e) => {
        if (e.target.files.length > 0) addSourceFiles(e.target.files);
    });
}

if (fileInputImg) {
    fileInputImg.addEventListener('change', (e) => {
        if (e.target.files.length > 0) addSourceFiles(e.target.files);
    });
}

if (fileInputAppend) {
    fileInputAppend.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            addSourceFiles(e.target.files);
        }
    });
}

// Drag over/leave animations
['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
    }, false);
});

dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
        addSourceFiles(files);
    }
});

// Format file size utility
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Reset UI state to initial
function resetApplicationState() {
    pdfBytes = null;
    pdfDocument = null;
    totalPageCount = 0;
    selectedPages.clear();
    pageSizes = {};
    originalFilename = '';
    fileBoundaries = [];
    sourceFiles = [];
    pageRotations = {};
    if (pendingSwapNode) {
        pendingSwapNode.classList.remove('pending-swap');
        pendingSwapNode = null;
    }
    
    // Clear elements
    if (fileInputPdf) fileInputPdf.value = '';
    if (fileInputImg) fileInputImg.value = '';
    if (fileInputAppend) fileInputAppend.value = '';
    pageRangeInput.value = '';
    thumbnailGrid.innerHTML = '';
    fileListContainer.innerHTML = '';
    
    // Hide panels
    fileListContainer.classList.add('hidden');
    dropzone.classList.remove('hidden');
    selectionControls.classList.add('locked');
    selectionControls.classList.add('hidden');
    actionsControls.classList.add('locked');
    actionsControls.classList.add('hidden');
    zoomControls.classList.add('hidden');
    thumbnailGrid.classList.add('hidden');
    idleState.classList.remove('hidden');
    if (seoFooter) seoFooter.classList.remove('hidden');
    
    // Disable inputs
    pageRangeInput.disabled = true;
    disableControlButtons(true);
    
    updateBadge();
}

// Disable/Enable control buttons
function disableControlButtons(isDisabled) {
    btnSelectAll.disabled = isDisabled;
    btnSelectNone.disabled = isDisabled;
    btnSelectInvert.disabled = isDisabled;
    btnSelectEven.disabled = isDisabled;
    btnSelectOdd.disabled = isDisabled;
    btnActionExtract.disabled = isDisabled;
    btnActionRemove.disabled = isDisabled;
}

// ==========================================================================
// 3. Core PDF Loading and Rendering (PDF.js)
// ==========================================================================
// Helper for FileReader to await ArrayBuffer
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

window.removeSourceFile = async function(id) {
    sourceFiles = sourceFiles.filter(f => f.id !== id);
    if(sourceFiles.length === 0) {
        resetApplicationState();
    } else {
        await rebuildMergedDocument();
    }
};

function renderFileListUI() {
    fileListContainer.innerHTML = '';
    sourceFiles.forEach(file => {
        const card = document.createElement('div');
        card.className = 'file-meta-card';
        card.innerHTML = `
            <div class="meta-icon">
                <i data-lucide="file-text"></i>
            </div>
            <div class="meta-details">
                <h4 class="truncate">${file.name}</h4>
                <div class="meta-sub">
                    <span>${formatBytes(file.size)}</span>
                </div>
            </div>
            <button class="btn-icon-danger" onclick="removeSourceFile('${file.id}')" title="Remove PDF">
                <i data-lucide="x"></i>
            </button>
        `;
        fileListContainer.appendChild(card);
    });
    lucide.createIcons();
}

async function imageToPdfBuffer(imageBytes, mimeType) {
    return new Promise((resolve, reject) => {
        const blob = new Blob([imageBytes], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        
        img.onload = async () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob(async (newBlob) => {
                    URL.revokeObjectURL(url);
                    const arrayBuffer = await newBlob.arrayBuffer();
                    
                    const pdfDoc = await PDFLib.PDFDocument.create();
                    const pdfImage = await pdfDoc.embedJpg(arrayBuffer);
                    const page = pdfDoc.addPage([pdfImage.width, pdfImage.height]);
                    page.drawImage(pdfImage, {
                        x: 0,
                        y: 0,
                        width: pdfImage.width,
                        height: pdfImage.height
                    });
                    resolve(await pdfDoc.save());
                }, 'image/jpeg', 0.95);
            } catch(e) {
                reject(e);
            }
        };
        
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Failed to load image"));
        };
        img.src = url;
    });
}

async function addSourceFiles(files) {
    if (!files || files.length === 0) return;
    
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const validFiles = Array.from(files).filter(f => allowedTypes.includes(f.type));
    if (validFiles.length === 0) {
        alert(window.t('errInvalidPdf'));
        return;
    }

    showLoader(window.t('analyzingTitle'), window.t('loaderReadBytes'));
    try {
        for (let i = 0; i < validFiles.length; i++) {
            let bytes = await readFileAsArrayBuffer(validFiles[i]);
            
            // Auto-convert images to 1-page PDF buffer
            if (validFiles[i].type.startsWith('image/')) {
                bytes = await imageToPdfBuffer(bytes, validFiles[i].type);
            }
            
            sourceFiles.push({
                id: Math.random().toString(36).substr(2, 9),
                name: validFiles[i].type.startsWith('image/') ? validFiles[i].name + '.pdf' : validFiles[i].name,
                size: validFiles[i].size,
                bytes: bytes
            });
        }
        await rebuildMergedDocument();
    } catch (e) {
        console.error(e);
        alert(window.t('errParse'));
        hideLoader();
    }
}

async function rebuildMergedDocument() {
    try {
        if (sourceFiles.length === 1) {
            showLoader(window.t('analyzingTitle'), window.t('loaderReadBytes'));
        } else {
            showLoader(window.t('analyzingTitle'), window.t('loaderMerge', {current: 1, total: sourceFiles.length}));
        }

        fileBoundaries = [];
        let currentPageIndex = 1;

        if (sourceFiles.length === 1) {
            pdfBytes = sourceFiles[0].bytes;
            fileBoundaries.push({
                id: sourceFiles[0].id,
                filename: sourceFiles[0].name,
                startPage: 1,
                endPage: 0 // Will update later
            });
        } else {
            const mergedPdf = await PDFLib.PDFDocument.create();
            for (let i = 0; i < sourceFiles.length; i++) {
                updateLoaderProgress((i / sourceFiles.length) * 100, window.t('loaderMerge', {current: i + 1, total: sourceFiles.length}));
                const srcDoc = await PDFLib.PDFDocument.load(sourceFiles[i].bytes);
                const pageCount = srcDoc.getPageCount();
                
                fileBoundaries.push({
                    id: sourceFiles[i].id,
                    filename: sourceFiles[i].name,
                    startPage: currentPageIndex,
                    endPage: currentPageIndex + pageCount - 1
                });
                currentPageIndex += pageCount;

                const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
                copiedPages.forEach(page => mergedPdf.addPage(page));
            }
            updateLoaderProgress(100, window.t('loaderMergeFinal'));
            pdfBytes = await mergedPdf.save();
        }

        const loadingTask = pdfjsLib.getDocument({ data: pdfBytes.slice(0) });
        pdfDocument = await loadingTask.promise;
        totalPageCount = pdfDocument.numPages;

        if (fileBoundaries.length === 1 && fileBoundaries[0].endPage === 0) {
            fileBoundaries[0].endPage = totalPageCount;
        }

        selectedPages.clear();
        
        fileListContainer.classList.remove('hidden');
        dropzone.classList.add('hidden');
        renderFileListUI();

        await renderPageThumbnails();

        selectionControls.classList.remove('locked');
        selectionControls.classList.remove('hidden');
        actionsControls.classList.remove('locked');
        actionsControls.classList.remove('hidden');
        zoomControls.classList.remove('hidden');
        pageRangeInput.disabled = false;
        disableControlButtons(false);
        
        idleState.classList.add('hidden');
        thumbnailGrid.classList.remove('hidden');
        if (seoFooter) seoFooter.classList.add('hidden');
        
        updateBadge();

    } catch (err) {
        console.error(err);
        alert(window.t('errParse'));
        resetApplicationState();
    } finally {
        hideLoader();
        if (fileInputAppend) fileInputAppend.value = '';
    }
}

// High-fidelity page thumbnail generator
async function renderPageThumbnails() {
    thumbnailGrid.innerHTML = '';
    updateLoaderProgress(0, window.t('loaderInitGrid'));
    
    for (let pageNum = 1; pageNum <= totalPageCount; pageNum++) {
        if (fileBoundaries.length > 1) {
            const boundary = fileBoundaries.find(b => b.startPage === pageNum);
            if (boundary) {
                const header = document.createElement('div');
                header.className = 'file-boundary-header';
                const pageCountStr = boundary.endPage - boundary.startPage + 1;
                header.innerHTML = `
                    <i data-lucide="file-text"></i>
                    <span>${boundary.filename}</span>
                    <span class="boundary-pages">(${pageCountStr} pages)</span>
                `;
                thumbnailGrid.appendChild(header);
            }
        }

        updateLoaderProgress(
            (pageNum / totalPageCount) * 100, 
            window.t('loaderRenderThumb', {current: pageNum, total: totalPageCount})
        );
        
        // Fetch page view from PDF.js
        const page = await pdfDocument.getPage(pageNum);
        const viewport = page.getViewport({ scale: 0.5 }); // High res thumbnail viewport
        
        // Store dimensions in cache (convert points to mm for user display: 1pt = 0.352778mm)
        const widthMm = Math.round(viewport.width * 2 * 0.352778);
        const heightMm = Math.round(viewport.height * 2 * 0.352778);
        pageSizes[pageNum] = `${widthMm} x ${heightMm} mm`;
        
        // Create Thumbnail DOM elements
        const itemWrapper = document.createElement('div');
        itemWrapper.className = 'thumbnail-item';
        itemWrapper.dataset.pageNum = pageNum;
        
        const selectIndicator = document.createElement('div');
        selectIndicator.className = 'select-indicator';
        selectIndicator.innerHTML = '<i data-lucide="check"></i>';
        
        const canvasWrapper = document.createElement('div');
        canvasWrapper.className = 'canvas-wrapper';
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        if (pageRotations[pageNum]) {
            canvas.className = `canvas-rotate-${pageRotations[pageNum]}`;
        }
        
        canvasWrapper.appendChild(canvas);
        
        const rotateBtn = document.createElement('button');
        rotateBtn.className = 'btn-rotate-page';
        rotateBtn.innerHTML = '<i data-lucide="rotate-cw"></i>';
        rotateBtn.title = window.t('rotatePage') || "Rotate Page";
        rotateBtn.onclick = (e) => {
            e.stopPropagation(); // prevent selection toggle
            const currentRotation = pageRotations[pageNum] || 0;
            const newRotation = (currentRotation + 90) % 360;
            pageRotations[pageNum] = newRotation;
            canvas.className = `canvas-rotate-${newRotation}`;
        };
        itemWrapper.appendChild(rotateBtn);
        
        const footer = document.createElement('div');
        footer.className = 'page-number-footer';
        
        const indexLabel = document.createElement('span');
        indexLabel.textContent = window.t('pageNumber', {num: pageNum});
        
        const dimensionsLabel = document.createElement('span');
        dimensionsLabel.className = 'page-size-info';
        dimensionsLabel.textContent = pageSizes[pageNum];
        
        footer.appendChild(indexLabel);
        footer.appendChild(dimensionsLabel);
        
        const swapBtn = document.createElement('div');
        swapBtn.className = 'btn-swap-page';
        swapBtn.innerHTML = '<i data-lucide="arrow-left-right"></i>';
        swapBtn.title = "Tap to Swap";
        swapBtn.onclick = (e) => {
            e.stopPropagation(); // prevent selection toggle
            if (pendingSwapNode === null) {
                pendingSwapNode = itemWrapper;
                itemWrapper.classList.add('pending-swap');
            } else if (pendingSwapNode === itemWrapper) {
                // Cancel
                pendingSwapNode = null;
                itemWrapper.classList.remove('pending-swap');
            } else {
                // Execute DOM Swap
                const nodeA = pendingSwapNode;
                const nodeB = itemWrapper;
                const parent = nodeB.parentNode;
                const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;
                
                parent.insertBefore(nodeA, nodeB);
                parent.insertBefore(nodeB, siblingA);
                
                nodeA.classList.remove('pending-swap');
                pendingSwapNode = null;
            }
        };
        itemWrapper.appendChild(swapBtn);

        itemWrapper.appendChild(selectIndicator);
        itemWrapper.appendChild(canvasWrapper);
        itemWrapper.appendChild(footer);
        
        // Grid click toggles selection
        itemWrapper.addEventListener('click', () => {
            togglePageSelection(pageNum);
        });
        
        thumbnailGrid.appendChild(itemWrapper);
    }
    
    // Initialize SortableJS for Drag and Drop Reordering (PC Only)
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile && window.Sortable) {
        if (thumbnailGrid._sortable) {
            thumbnailGrid._sortable.destroy();
        }
        
        thumbnailGrid._sortable = new Sortable(thumbnailGrid, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            draggable: '.thumbnail-item',
            swap: true, // Swaps dragged item with target instead of shifting
            swapClass: 'sortable-swap-highlight',
        });
    }

    // Refresh newly drawn Lucide icons
    lucide.createIcons();
}

// ==========================================================================
// 4. Two-Way Range Selector & Synchronizer Logic
// ==========================================================================

// Core visual toggler
function togglePageSelection(pageNum) {
    if (selectedPages.has(pageNum)) {
        selectedPages.delete(pageNum);
        setThumbnailVisualSelected(pageNum, false);
    } else {
        selectedPages.add(pageNum);
        setThumbnailVisualSelected(pageNum, true);
    }
    
    // Sync selections back to text input range
    const rangeString = generateRangeString(selectedPages);
    pageRangeInput.value = rangeString;
    
    updateBadge();
}

// Helper to set item element class
function setThumbnailVisualSelected(pageNum, isSelected) {
    const element = thumbnailGrid.querySelector(`.thumbnail-item[data-page-num="${pageNum}"]`);
    if (element) {
        if (isSelected) {
            element.classList.add('selected');
        } else {
            element.classList.remove('selected');
        }
    }
}

// Badge count updater
function updateBadge() {
    selectedBadge.textContent = window.t('selectedCount', {count: selectedPages.size});
    updateActionButtonsState();
}

function updateActionButtonsState() {
    const hasSelection = selectedPages.size > 0;
    btnActionExtract.disabled = !hasSelection;
    btnActionRemove.disabled = !hasSelection;
    if (btnActionZip) btnActionZip.disabled = !hasSelection;
}

// --- Dynamic Range Sync (Text Input -> Visual highlights) ---
pageRangeInput.addEventListener('input', (e) => {
    const val = e.target.value;
    
    try {
        const parsed = parseRangeString(val);
        rangeError.classList.add('hidden');
        
        // Apply visual updates to all page cards
        for (let i = 1; i <= totalPageCount; i++) {
            if (parsed.has(i)) {
                selectedPages.add(i);
                setThumbnailVisualSelected(i, true);
            } else {
                selectedPages.delete(i);
                setThumbnailVisualSelected(i, false);
            }
        }
        updateBadge();
        
    } catch (err) {
        // Show silent warning or validation error if typo exists
        if (val.trim() === '') {
            rangeError.classList.add('hidden');
            // clear selection if user manually cleared input
            clearAllSelection();
        } else {
            rangeError.classList.remove('hidden');
        }
    }
});

function clearAllSelection() {
    selectedPages.clear();
    for (let i = 1; i <= totalPageCount; i++) {
        setThumbnailVisualSelected(i, false);
    }
    updateBadge();
}

// --------------------------------------------------------------------------
// RANGE PARSER (Transforms String "1-3, 5, 8" into Set{1, 2, 3, 5, 8})
// --------------------------------------------------------------------------
function parseRangeString(rangeStr) {
    const resultSet = new Set();
    if (!rangeStr || rangeStr.trim() === '') {
        return resultSet;
    }

    const segments = rangeStr.split(',');
    for (let segment of segments) {
        segment = segment.trim();
        if (segment === '') continue;

        if (segment.includes('-')) {
            const parts = segment.split('-');
            if (parts.length !== 2) throw new Error('Invalid range format');
            
            const start = parseInt(parts[0].trim());
            const end = parseInt(parts[1].trim());
            
            if (isNaN(start) || isNaN(end) || start < 1 || end < 1 || start > end) {
                throw new Error('Invalid range numbers');
            }
            
            // Push values up to boundaries
            const maxVal = Math.min(end, totalPageCount);
            for (let i = start; i <= maxVal; i++) {
                resultSet.add(i);
            }
        } else {
            const pageNum = parseInt(segment);
            if (isNaN(pageNum) || pageNum < 1) {
                throw new Error('Invalid page number');
            }
            if (pageNum <= totalPageCount) {
                resultSet.add(pageNum);
            }
        }
    }
    return resultSet;
}

// --------------------------------------------------------------------------
// RANGE BUILDER (Transforms Set{1, 2, 3, 5, 8, 9} into String "1-3, 5, 8-9")
// --------------------------------------------------------------------------
function generateRangeString(pagesSet) {
    if (pagesSet.size === 0) return '';
    
    // Sort ascending
    const sorted = Array.from(pagesSet).sort((a, b) => a - b);
    const ranges = [];
    let start = sorted[0];
    let end = sorted[0];
    
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === end + 1) {
            end = sorted[i];
        } else {
            if (start === end) {
                ranges.push(`${start}`);
            } else {
                ranges.push(`${start}-${end}`);
            }
            start = sorted[i];
            end = sorted[i];
        }
    }
    
    // Finalize last segment
    if (start === end) {
        ranges.push(`${start}`);
    } else {
        ranges.push(`${start}-${end}`);
    }
    
    return ranges.join(', ');
}

// ==========================================================================
// 5. Selection Helper Utilities
// ==========================================================================

// Select All
btnSelectAll.addEventListener('click', () => {
    selectedPages.clear();
    for (let i = 1; i <= totalPageCount; i++) {
        selectedPages.add(i);
        setThumbnailVisualSelected(i, true);
    }
    pageRangeInput.value = generateRangeString(selectedPages);
    updateBadge();
});

// Select None
btnSelectNone.addEventListener('click', () => {
    clearAllSelection();
    pageRangeInput.value = '';
});

// Invert Selection
btnSelectInvert.addEventListener('click', () => {
    const inverted = new Set();
    for (let i = 1; i <= totalPageCount; i++) {
        if (!selectedPages.has(i)) {
            inverted.add(i);
            setThumbnailVisualSelected(i, true);
        } else {
            setThumbnailVisualSelected(i, false);
        }
    }
    selectedPages = inverted;
    pageRangeInput.value = generateRangeString(selectedPages);
    updateBadge();
});

// Select Even Pages
btnSelectEven.addEventListener('click', () => {
    clearAllSelection();
    for (let i = 2; i <= totalPageCount; i += 2) {
        selectedPages.add(i);
        setThumbnailVisualSelected(i, true);
    }
    pageRangeInput.value = generateRangeString(selectedPages);
    updateBadge();
});

// Select Odd Pages
btnSelectOdd.addEventListener('click', () => {
    clearAllSelection();
    for (let i = 1; i <= totalPageCount; i += 2) {
        selectedPages.add(i);
        setThumbnailVisualSelected(i, true);
    }
    pageRangeInput.value = generateRangeString(selectedPages);
    updateBadge();
});

// ==========================================================================
// 6. PDF Manipulation Engines (pdf-lib)
// ==========================================================================

async function constructPdfPages(newPdfDoc, srcPdfDoc, targetPagesArray) {
    updateLoaderProgress(30, window.t('loaderExtractTrees') || 'Copying structure...');
    const zeroIndexedPages = targetPagesArray.map(p => p - 1);
    const copiedPages = await newPdfDoc.copyPages(srcPdfDoc, zeroIndexedPages);
    
    updateLoaderProgress(60, window.t('loaderExtractStitch') || 'Stitching pages...');
    copiedPages.forEach((p, idx) => {
        const originalPageNum = targetPagesArray[idx];
        if (pageRotations[originalPageNum]) {
            const currentRot = p.getRotation().angle;
            p.setRotation(PDFLib.degrees(currentRot + pageRotations[originalPageNum]));
        }
        newPdfDoc.addPage(p);
    });
}

// Extract Selection
btnActionExtract.addEventListener('click', async () => {
    if (selectedPages.size === 0) return;
    
    showLoader(window.t('extractTitle'), window.t('loaderExtractNodes'));
    
    try {
        const srcPdfDoc = await PDFLib.PDFDocument.load(pdfBytes.slice(0));
        const newPdfDoc = await PDFLib.PDFDocument.create();
        
        // Read visually ordered DOM elements to respect user's drag-and-drop
        const visualOrderItems = Array.from(thumbnailGrid.querySelectorAll('.thumbnail-item'));
        const targetPagesArray = visualOrderItems
            .map(item => parseInt(item.dataset.pageNum))
            .filter(pageNum => selectedPages.has(pageNum));
            
        await constructPdfPages(newPdfDoc, srcPdfDoc, targetPagesArray);
        
        updateLoaderProgress(85, window.t('loaderExtractStream'));
        const newPdfBytes = await newPdfDoc.save();
        
        updateLoaderProgress(100, window.t('loaderComplete'));
        triggerBrowserDownload(newPdfBytes, appendFilenameSuffix('extracted'));
        
    } catch (err) {
        console.error(err);
        alert(window.t('errExtract'));
    } finally {
        setTimeout(hideLoader, 600);
    }
});

// Remove Selection (Omit)
btnActionRemove.addEventListener('click', async () => {
    if (selectedPages.size === 0) return;
    
    // Remaining pages calculation respecting visual DOM order
    const visualOrderItems = Array.from(thumbnailGrid.querySelectorAll('.thumbnail-item'));
    const remainingPages = visualOrderItems
        .map(item => parseInt(item.dataset.pageNum))
        .filter(pageNum => !selectedPages.has(pageNum));
    
    if (remainingPages.length === 0) {
        alert(window.t('errCannotRemoveAll'));
        return;
    }
    
    showLoader(window.t('loaderOmitNodes'), window.t('loaderOmitNodes'));
    
    try {
        const srcPdfDoc = await PDFLib.PDFDocument.load(pdfBytes.slice(0));
        const newPdfDoc = await PDFLib.PDFDocument.create();
        
        await constructPdfPages(newPdfDoc, srcPdfDoc, remainingPages);
        
        updateLoaderProgress(85, 'Building PDF binary stream...');
        const newPdfBytes = await newPdfDoc.save();
        
        updateLoaderProgress(100, 'Saving file...');
        triggerBrowserDownload(newPdfBytes, appendFilenameSuffix('reduced'));
        
    } catch (err) {
        console.error(err);
        alert('An error occurred during removal.');
    } finally {
        setTimeout(hideLoader, 600);
    }
});

// ==========================================================================
// Export as Images (ZIP)
// ==========================================================================
if (btnActionZip) {
    btnActionZip.addEventListener('click', async () => {
        if (selectedPages.size === 0) return;
        showLoader(window.t('zipTitle') || 'Exporting Images', 'Preparing zip archive...');
        try {
            const zip = new JSZip();
            
            // Read visually ordered DOM elements
            const visualOrderItems = Array.from(thumbnailGrid.querySelectorAll('.thumbnail-item'));
            const targetPagesArray = visualOrderItems
                .map(item => parseInt(item.dataset.pageNum))
                .filter(pageNum => selectedPages.has(pageNum));
                
            const level = document.getElementById('select-compression-level').value;
            let renderScale = 2.0; 
            let jpgQuality = 0.85;
            if (level === 'high') { renderScale = 3.0; jpgQuality = 0.95; }
            if (level === 'low') { renderScale = 1.5; jpgQuality = 0.60; }
            
            for (let i = 0; i < targetPagesArray.length; i++) {
                const pageNum = targetPagesArray[i];
                const pdfjsPage = await pdfDocument.getPage(pageNum);
                const viewport = pdfjsPage.getViewport({ scale: renderScale });
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, canvas.width, canvas.height);
                
                await pdfjsPage.render({ canvasContext: context, viewport: viewport }).promise;
                
                const dataUrl = canvas.toDataURL('image/jpeg', jpgQuality);
                const base64Data = dataUrl.split(',')[1];
                
                // Keep original filename if only 1 file is loaded, else generic
                const prefix = originalFilename ? originalFilename.replace('.pdf', '') : 'Document';
                zip.file(`${prefix}_page_${i + 1}.jpg`, base64Data, {base64: true});
                
                updateLoaderProgress(Math.round((i / targetPagesArray.length) * 80), `Rendering page ${i + 1} of ${targetPagesArray.length}...`);
            }
            
            updateLoaderProgress(85, 'Compressing ZIP archive...');
            const zipContent = await zip.generateAsync({type: 'blob'});
            
            updateLoaderProgress(100, 'Saving file...');
            
            const url = URL.createObjectURL(zipContent);
            const a = document.createElement('a');
            a.href = url;
            a.download = appendFilenameSuffix('images').replace('.pdf', '.zip');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
        } catch (err) {
            console.error(err);
            alert('An error occurred during ZIP export.');
        } finally {
            setTimeout(hideLoader, 600);
        }
    });
}


// Helper: Append suffix to original name
function appendFilenameSuffix(suffix) {
    const ext = '.pdf';
    const base = getFilenameWithoutExt(originalFilename);
    return `${base}_${suffix}${ext}`;
}

function getFilenameWithoutExt(filename) {
    return filename.substring(0, filename.lastIndexOf('.')) || filename;
}

// Download PDF (Uint8Array)
function triggerBrowserDownload(uint8Array, filename) {
    const blob = new Blob([uint8Array], { type: 'application/pdf' });
    triggerBrowserBlobDownload(blob, filename);
}

// Download Blob (Zip or PDF)
async function triggerBrowserBlobDownload(blob, filename) {
    // Detect iOS (including iPads on iOS 13+)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIOS) {
        // iOS Workaround: Async Blob URLs can trigger a share sheet with a useless link.
        // Using a Data URL avoids this and cleanly offers the file.
        const reader = new FileReader();
        reader.onload = function(e) {
            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = e.target.result;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            
            setTimeout(() => {
                document.body.removeChild(link);
            }, 1500);
        };
        reader.readAsDataURL(blob);
    } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup with a delay for mobile compatibility
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 1500);
    }
}

// ==========================================================================
// 7. Grid Zoom Handlers
// ==========================================================================
const zoomClasses = ['zoom-small', 'zoom-medium', 'zoom-large'];
const zoomLabels = ['Small', 'Medium', 'Large'];
let currentZoomIndex = 1; // Default to 'Medium'

btnZoomIn.addEventListener('click', () => {
    if (currentZoomIndex < zoomClasses.length - 1) {
        thumbnailGrid.classList.remove(zoomClasses[currentZoomIndex]);
        currentZoomIndex++;
        thumbnailGrid.classList.add(zoomClasses[currentZoomIndex]);
        zoomLevelText.textContent = zoomLabels[currentZoomIndex];
    }
});

btnZoomOut.addEventListener('click', () => {
    if (currentZoomIndex > 0) {
        thumbnailGrid.classList.remove(zoomClasses[currentZoomIndex]);
        currentZoomIndex--;
        thumbnailGrid.classList.add(zoomClasses[currentZoomIndex]);
        zoomLevelText.textContent = zoomLabels[currentZoomIndex];
    }
});
