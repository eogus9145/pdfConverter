document.getElementById('titlebar-minimize')?.addEventListener('click', window.electron.minimize);
document.getElementById('titlebar-close')?.addEventListener('click', window.electron.close);

let uploadBtns = document.querySelectorAll(".uploadBtn");
uploadBtns.forEach((v,i) => {
    v.addEventListener("click", (e) => {
        let index = i + 1;
        let fileInput = document.querySelector("#upload" + index);
        fileInput.click();
    });
});

// 전역변수
let tempFiles;
let tempIdx;

window.fileInfo1 = {};
window.fileInfo2 = {};
window.fileInfo3 = {};


// PDF를 이미지로 변환 후 다시 PDF로 변환
const scanPdf = async (files, index, password, retry = false) => {
    fileInfo1 = { fileName: '', ext : '', base64 : [] };
    if(files.length == 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = async function () {
        const pdfBuffer = reader.result;
        try {
            const result = await window.electron.scanPdf(pdfBuffer, password);
            if(result.cd == '0000') {
                let resultDiv = document.querySelector("#result" + index);
                let slider = resultDiv.querySelector(".result-slider");
                slider.innerHTML = "";
                let iframe = document.createElement("iframe");
                iframe.classList.add("scrollElement");
                iframe.src = 'data:application/pdf;base64,' + result.base64;
                slider.appendChild(iframe);
                resultDiv.style.display = "flex";
                fileInfo1.fileName = file.name.split(".")[0];
                fileInfo1.ext = file.name.split(".")[1];
                fileInfo1.base64 = [result.base64];
                document.querySelector("#upload" + index).value = "";
                if(retry) {
                    tempFiles = null;
                    tempIdx = null;
                    document.querySelector("#passInput").value = "";
                    document.querySelector(".password").style.display = "none";
                }
            } else if(result.cd == '1000') {
                let reason = document.querySelector(".password-reason");
                if(retry) {
                    reason.textContent = '비밀번호가 틀렸습니다!';
                } else {
                    reason.textContent = 'PDF파일이 잠겨있습니다!';
                }
                tempFiles = files;
                tempIdx = index;
                let passModal = document.querySelector(".password");
                let passInput = document.querySelector("#passInput");
                passModal.style.display = "flex";
                passInput.focus();
            } else if(result.cd == '9999') {
                alert("시스템 오류");
            } else {
                alert("시스템 오류");
            }
            
        } catch(err) {
            console.error("스캔PDF 재구성 도중 에러 발생 : ", err);
            alert("스캔PDF 재구성 도중 에러 발생");
        }
    }
    reader.readAsArrayBuffer(file);
}

//PDF를 이미지로 변환
const pdfToImg = async (files, index, password, retry = false) => {
    fileInfo2 = { fileName: '', ext : '', base64 : [] };
    if(files.length == 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = async function () {
        const pdfBuffer = reader.result;
        try {
            const result = await window.electron.pdfToImg(pdfBuffer, password);
            if(result.cd == '0000') {
                let imgs = result.base64;
                let resultDiv = document.querySelector("#result" + index);
                let slider = resultDiv.querySelector(".result-slider");
                imgs.forEach((v, i) => {
                    let imgDiv = document.createElement("div");
                    let img = document.createElement("img");
                    img.src = 'data:image/png;base64,' + v;
                    imgDiv.appendChild(img);
                    slider.appendChild(imgDiv);
                });
                resultDiv.style.display = "flex";
                fileInfo2.fileName = file.name.split(".")[0];
                fileInfo2.ext = result.base64.length > 1 ? 'zip' : 'png';
                fileInfo2.base64 = [...result.base64];
                document.querySelector("#upload" + index).value = "";
                if(retry) {
                    tempFiles = null;
                    tempIdx = null;
                    document.querySelector("#passInput").value = "";
                    document.querySelector(".password").style.display = "none";
                }
            } else if(result.cd == '1000') {
                let reason = document.querySelector(".password-reason");
                if(retry) {
                    reason.textContent = '비밀번호가 틀렸습니다!';
                } else {
                    reason.textContent = 'PDF파일이 잠겨있습니다!';
                }
                tempFiles = files;
                tempIdx = index;
                let passModal = document.querySelector(".password");
                let passInput = document.querySelector("#passInput");
                passModal.style.display = "flex";
                passInput.focus();
            } else if(result.cd == '9999') {
                alert("시스템 오류");
            } else {
                alert("시스템 오류");
            }
            
        } catch(err) {
            console.error("pdf를 이미지로 변환 도중 에러 발생 : ", err);
            alert("pdf를 이미지로 변환 도중 에러 발생");
        }
    }
    reader.readAsArrayBuffer(file);
}

// 이미지를 PDF로 변환
const imgToPdf = async (files, index) => {
    fileInfo3 = { fileName: '', ext : '', base64 : [] };
    if(files.length == 0) return;
    const readFileAsArrayBuffer = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    };

    let imgBuffers = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            const imgBuffer = await readFileAsArrayBuffer(file);
            imgBuffers.push(imgBuffer);
        } catch (error) {
            console.error("파일 읽기 에러:", error);
        }
    }
    const result = await window.electron.imgToPdf(imgBuffers);
    if(result.cd == '0000') {
        let resultDiv = document.querySelector("#result" + index);
        let slider = resultDiv.querySelector(".result-slider");
        slider.innerHTML = "";
        let iframe = document.createElement("iframe");
        iframe.classList.add("scrollElement");
        iframe.src = 'data:application/pdf;base64,' + result.base64;
        slider.appendChild(iframe);
        resultDiv.style.display = "flex";
        fileInfo3.fileName = '변환PDF';
        fileInfo3.ext = 'pdf';
        fileInfo3.base64 = [result.base64];
    } else {
        alert("시스템 오류");
    }
    document.querySelector("#upload" + index).value = "";
};

// 스캔 pdf 재구성
document.querySelector("#upload1").addEventListener("change", async (e) => {
    await scanPdf(e.target.files, 1);
});

// PDF를 이미지로 변환
document.querySelector("#upload2").addEventListener("change", async (e) => {
    await pdfToImg(e.target.files, 2);
});

// 이미지를 PDF로 변환
document.querySelector("#upload3").addEventListener("change", async (e) => {
    await imgToPdf(e.target.files, 3);
});

let menuLinks = document.querySelectorAll('.sidebar-link');
menuLinks.forEach((v, i) => {
    v.addEventListener("click", (e) => {
        let sectionNumber = v.getAttribute("data-idx");
        let target = document.querySelector("#section" + sectionNumber);
        let targetTop = target.offsetTop;
        let links = document.querySelectorAll(".sidebar-link");
        let link = links[sectionNumber - 1];
        links.forEach(v => v.classList.remove("active"));
        link.classList.add("active");
        document.querySelector(".content").scrollTop = targetTop;
    });
});

let cancleBtns = document.querySelectorAll(".cancelBtn");
cancleBtns.forEach((v,i) => {
    v.addEventListener("click", (e) => {
        let index = i + 1;
        let target = document.querySelector("#result" + index);
        let slider = target.querySelector(".result-slider");
        slider.innerHTML = "";
        target.style.display = "none";
    });
});

document.querySelector("#passInput").addEventListener("keydown", (e) => {
    if(e.key == 'Enter') {
        document.querySelector(".passBtn").click();
    }
});

document.querySelector(".passBtn").addEventListener("click", async (e) => {
    let passValue = document.querySelector("#passInput").value;
    switch(tempIdx) {
        case 1 : await scanPdf(tempFiles, tempIdx, passValue, true);
        break;
        case 2 : await pdfToImg(tempFiles, tempIdx, passValue, true);
        break;
    }
});

document.querySelector(".passCanBtn").addEventListener("click", (e) => {
    tempFiles = null;
    tempIdx = null;
    document.querySelector("#passInput").value = "";
    document.querySelector(".password").style.display = "none";
});


document.querySelectorAll(".downBtn").forEach((v,i) => {
    v.addEventListener("click", async (e) => {
        let idx = i + 1;        
        await window.electron.download(window['fileInfo' + idx]);
    });
});

window.electron.onDownloadComplete((data) => {
    if(data.cd == '0000') {
        let downloadModal = document.querySelector(".download");
        let fileBtn = document.querySelector(".fileOpenBtn");
        let folderBtn = document.querySelector(".folderOpenBtn");
        fileBtn.setAttribute("data-file_path", data.filePath);
        folderBtn.setAttribute("data-file_path", data.filePath);
        downloadModal.style.display = "flex";
    }
});

document.querySelector(".fileOpenBtn").addEventListener("click", (e) => {
    let path = e.target.getAttribute("data-file_path");
    window.electron.openFile(path);
});

document.querySelector(".folderOpenBtn").addEventListener("click", (e) => {
    let path = e.target.getAttribute("data-file_path");
    window.electron.openFolder(path);
});

document.querySelector(".modalCloseBtn").addEventListener("click", (e) => {
    document.querySelector(".download").style.display = "none";
});