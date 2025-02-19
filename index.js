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

// 스캔 pdf 재구성
document.querySelector("#upload1").addEventListener("change", async (e) => {
    const files = e.target.files;
    if(files.length == 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = async function () {
        const pdfBuffer = reader.result;
        try {
            const result = await window.electron.pdfToImg(pdfBuffer);
            if(result.cd == '0000') {
                console.log(result.base64);
            } else if(result.cd == '1000') {

            } else if(result.cd == '9999') {

            } else {

            }
            document.querySelector("#upload1").value = "";
            
        } catch(err) {
            console.error("pdf를 이미지로 변환 도중 에러 발생 : ", err);
            alert("pdf를 이미지로 변환 도중 에러 발생");
        }
    }
    reader.readAsArrayBuffer(file);
});

// PDF를 이미지로 변환
document.querySelector("#upload2").addEventListener("change", (e) => {
    let files = e.target.files;
    if(files.length == 0) return;
    console.log(files);
});

// 이미지를 PDF로 변환
document.querySelector("#upload3").addEventListener("change", (e) => {
    let files = e.target.files;
    if(files.length == 0) return;
    console.log(files);
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