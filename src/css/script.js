// BOTÕES DOS CARDS

const botoes = document.querySelectorAll(".info-btn");

botoes.forEach(function(botao) {

    botao.addEventListener("click", function() {

        const card = botao.closest(".digimon-card");

        const nome = card.querySelector("h3").textContent;

        alert(
            "Você selecionou o Digimon: " + nome
        );

    });

});


// PESQUISA

const pesquisa = document.getElementById("pesquisa");

const cards = document.querySelectorAll(".digimon-card");

pesquisa.addEventListener("input", function() {

    const texto = pesquisa.value.toLowerCase();

    cards.forEach(function(card) {

        const nome = card
            .querySelector("h3")
            .textContent
            .toLowerCase();

        if (nome.includes(texto)) {

            card.style.display = "block";

        } else {

            card.style.display = "none";

        }

    });

});