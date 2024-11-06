// Lista de imagens com nomes de autores
const imagens = [
    { url: "/img/imagemdodia.jpg", autor: "Gabi 1" },
    { url: "/img/imagemdodia.jpg", autor: "Gabi 2" },
    { url: "/img/imagemdodia.jpg", autor: "Gabi 3" },
    { url: "/img/imagemdodia.jpg", autor: "Gabi 4" },
    { url: "/img/imagemdodia.jpg", autor: "Gabi 5" },
    { url: "/img/imagemdodia.jpg", autor: "Gabi 6" }
];

function carregarImagens() {
    const galeria = document.getElementById('galeria');

    imagens.forEach(imagem => {
        const divImagem = document.createElement('div');
        divImagem.className = 'imagem';
        divImagem.innerHTML = `
            <img src="${imagem.url}" alt="Imagem">
            <div class="plaquinha">${imagem.autor}</div>
        `;
        galeria.appendChild(divImagem);
    });
}

// Carregar as imagens quando a página for carregada
window.onload = carregarImagens;
