document.addEventListener('paste', function (event) {
    const items = event.clipboardData.items;
    if (!items || !items.length || items[0].type.indexOf('image') === -1) return;
    onImagePaste(items[0].getAsFile());
});

function errorOut(error) {
    document.getElementById('imageGroupsSection').innerText = error.message
}

function convertToJPEG(imageFile) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg');
        };

        img.onerror = (error) => {
            reject(error.message);
        };

        const reader = new FileReader();
        reader.onload = (x) => {
            img.src = x.target.result;
        };
        reader.onerror = (error) => {
            reject(error.message);
        };

        reader.readAsDataURL(imageFile);
    });
}
async function onImagePaste(imageFile) {
    try {
        document.getElementById('imageContainer').src = URL.createObjectURL(imageFile);
        const jpegBlob = await convertToJPEG(imageFile);
        const formData = new FormData();
        formData.append('image', jpegBlob, 'image.jpeg');
        const res = await fetch('process-image-groups', {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();

        if (!res.ok) throw new Error(JSON.stringify(data));

        handlePreviewGroups(data);
    } catch (e) {
        errorOut(e);
    }
}

//костыль c id
async function onStepByStep(command, id) {
    try {
        const res = await fetch('process-command', {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(command),
        });
        
        const data = await res.json();

        if (!res.ok) throw new Error(JSON.stringify(res));
        
        handleSteps(data, id);
    } catch (error) {
        errorOut(error);
    }
}

//костыль
function renderMath() {
    const texElements = document.querySelectorAll('.math');
    for (let texElement of texElements) {
        texElement.classList.remove('math');
        const text = texElement.innerText;
        texElement.innerText = '';
        const regex = /(\\\(.*?\\\))/g;
        const parts = text.split(regex);
        for (let part of parts) {
            if (!part) continue;
            const container = document.createElement('span');
            if (part.startsWith('\\(') && part.endsWith('\\)')) {
                katex.render(part.substring(2, part.length - 2), container);
                container.addEventListener('click', () => {
                    navigator.clipboard.writeText(part.substring(2, part.length - 2));
                });
                container.addEventListener('contextmenu', (e)=>{
                    e.preventDefault()
                    navigator.clipboard.writeText(part);
                })
                container.style.cursor = 'default';
            } else if (part.trim() === '$n$n') {
                container.innerHTML = '<br><br>';
            } else {
                container.innerText = part;
            }
            texElement.appendChild(container);
        }
    }
}

function handlePreviewGroups(res) {
    const imageGroupsSection = document.getElementById('imageGroupsSection');
    imageGroupsSection.innerHTML = '';
    const container = createElement({
        tag: 'div',
        className: 'previewsContainer',
    });

    container.appendChild(previewContainer(res.previews));
    container.appendChild(previewList(res.previews));

    imageGroupsSection.appendChild(container);
    renderMath();
}

function createElement({ tag, className = null, id = null, innerText = null }) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (id) element.id = id;
    if (innerText) element.innerText = innerText;
    return element;
}

const previewContainer = (previews) => {
    const container = createElement({
        tag: 'div',
        className: 'previewContainer',
    });

    previews.forEach((p) => {
        container.appendChild(preview(p));
    });

    return container;
};

const preview = ({ problem, solution, method, command, id }) => {
    const container = createElement({
        tag: 'div',
        className: 'preview',
        id: id,
    });
    const p = createElement({
        tag: 'div',
        innerText: problem,
        className: 'problem math',
    });
    const s = createElement({
        tag: 'div',
        innerText: solution,
        className: 'solution math',
    });
    const m = createElement({
        tag: 'div',
        innerText: method,
        className: 'method math',
    });
    const button = createElement({
        tag: 'button',
        innerText: 'step-by-step',
        className: 'stepsButton',
    });

    button.addEventListener('click', () => {
        onStepByStep(command, id);
    });

    container.appendChild(m);
    container.appendChild(p);
    container.appendChild(createElement({ tag: 'div', innerText: 'Ответ' }));
    container.appendChild(s);
    container.appendChild(button);

    return container;
};

const previewList = (previews) => {
    const container = createElement({
        tag: 'div',
        className: 'previewList',
    });

    previews.forEach((p) => {
        container.appendChild(previewListItem(p));
    });
    container.firstChild.id = 'selected';

    return container;
};

const previewListItem = ({ method, id }) => {
    const container = createElement({
        tag: 'div',
        innerText: method,
        className: 'previewListItem math',
    });

    container.addEventListener('click', () => {
        document.getElementById('selected').id = '';
        container.id = 'selected';
        switchActivePreview(id);
    });

    return container;
};

function switchActivePreview(previewId) {
    const p = document.getElementById(previewId);
    const parrent = p.parentNode;
    parrent.prepend(p);
}

//костыль c id
function handleSteps(res, id) {
    const container = document.getElementById(id);
    container.innerHTML = '';
    container.appendChild(createElement({ tag: 'div', innerText: 'Шаги решения', className: 'header' }));
    res.steps.forEach((step) => {
        container.appendChild(
            createElement({
                tag: 'div',
                className: 'step math',
                innerText: step.step,
            }),
        );
        container.appendChild(
            createElement({
                tag: 'div',
                className: 'header math',
                innerText: step.header,
            }),
        );
    });
    container.appendChild(
        createElement({
            tag: 'div',
            className: 'solution math',
            innerText: res.solution,
        }),
    );
    renderMath();
}
